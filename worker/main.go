package main

import (
	"context"
	"encoding/json"
	"log"
	"os"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// WeatherData reflete a estrutura JSON enviada pelo Python
type WeatherData struct {
	Temperature float64 `json:"temperature" bson:"temperature"`
	Windspeed   float64 `json:"windspeed" bson:"windspeed"`
	Latitude    string  `json:"latitude" bson:"latitude"`
	Longitude   string  `json:"longitude" bson:"longitude"`
	Timestamp   float64 `json:"timestamp" bson:"timestamp"`
}

func main() {
	// Configurações via Variáveis de Ambiente
	mongoURI := os.Getenv("MONGO_URI")
	if mongoURI == "" {
		log.Fatal("MONGO_URI não definido")
	}

	rabbitUser := os.Getenv("RABBITMQ_USER")
	rabbitPass := os.Getenv("RABBITMQ_PASSWORD")
	rabbitHost := os.Getenv("RABBITMQ_HOST")
	rabbitPort := os.Getenv("RABBITMQ_PORT")
	rabbitURL := "amqp://" + rabbitUser + ":" + rabbitPass + "@" + rabbitHost + ":" + rabbitPort + "/"

	// 1. Conexão com MongoDB
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	clientOptions := options.Client().ApplyURI(mongoURI)
	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Fatal(err)
	}

	// Verifica conexão
	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatal("Falha ao pingar MongoDB:", err)
	}

	collection := client.Database("gdash_db").Collection("weather")
	log.Println("Conectado ao MongoDB!")

	// 2. Conexão com RabbitMQ (com retries simples)
	var conn *amqp.Connection
	for {
		conn, err = amqp.Dial(rabbitURL)
		if err == nil {
			break
		}
		log.Printf("RabbitMQ indisponível (%s), tentando em 5s...", err)
		time.Sleep(5 * time.Second)
	}
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		log.Fatal(err)
	}
	defer ch.Close()

	// Garante que a fila existe
	q, err := ch.QueueDeclare(
		"weather_data", // name
		true,           // durable
		false,          // delete when unused
		false,          // exclusive
		false,          // no-wait
		nil,            // arguments
	)
	if err != nil {
		log.Fatal(err)
	}

	// Inicia consumo
	msgs, err := ch.Consume(
		q.Name, "", true, false, false, false, nil,
	)
	if err != nil {
		log.Fatal(err)
	}

	log.Println("Worker iniciado. Aguardando mensagens...")

	forever := make(chan bool)

	go func() {
		for d := range msgs {
			var data WeatherData
			if err := json.Unmarshal(d.Body, &data); err != nil {
				log.Printf("Erro ao decodificar JSON: %s", err)
				continue
			}

			_, err := collection.InsertOne(context.TODO(), data)
			if err != nil {
				log.Printf("Erro ao salvar no Mongo: %s", err)
			} else {
				log.Printf("Salvo: Temp %.1fºC | Vento %.1f km/h", data.Temperature, data.Windspeed)
			}
		}
	}()

	<-forever
}