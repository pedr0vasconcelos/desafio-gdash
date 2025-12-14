import os
import time
import json
import pika
import requests
import logging

# Configuração de Logs
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Configurações via Variáveis de Ambiente
RABBITMQ_HOST = os.getenv('RABBITMQ_HOST', 'rabbitmq')
RABBITMQ_PORT = int(os.getenv('RABBITMQ_PORT', 5672))
RABBITMQ_USER = os.getenv('RABBITMQ_USER', 'guest')
RABBITMQ_PASSWORD = os.getenv('RABBITMQ_PASSWORD', 'guest')
QUEUE_NAME = 'weather_data'

LAT = os.getenv('LOCATION_LAT', '-23.5505')
LON = os.getenv('LOCATION_LON', '-46.6333')

def get_weather_data():
    """Busca dados da API Open-Meteo (não requer chave)"""
    try:
        url = f"https://api.open-meteo.com/v1/forecast?latitude={LAT}&longitude={LON}&current_weather=true"
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        
        return {
            "temperature": data['current_weather']['temperature'],
            "windspeed": data['current_weather']['windspeed'],
            "latitude": LAT,
            "longitude": LON,
            "timestamp": time.time()
        }
    except Exception as e:
        logging.error(f"Erro ao buscar dados do clima: {e}")
        return None

def connect_rabbitmq():
    """Conecta ao RabbitMQ com retries"""
    credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASSWORD)
    parameters = pika.ConnectionParameters(host=RABBITMQ_HOST, port=RABBITMQ_PORT, credentials=credentials)
    
    while True:
        try:
            connection = pika.BlockingConnection(parameters)
            channel = connection.channel()
            channel.queue_declare(queue=QUEUE_NAME, durable=True)
            logging.info("Conectado ao RabbitMQ!")
            return connection, channel
        except pika.exceptions.AMQPConnectionError:
            logging.warning("RabbitMQ indisponível, tentando novamente em 5s...")
            time.sleep(5)

def main():
    connection, channel = connect_rabbitmq()
    
    try:
        while True:
            weather = get_weather_data()
            if weather:
                message = json.dumps(weather)
                channel.basic_publish(
                    exchange='',
                    routing_key=QUEUE_NAME,
                    body=message,
                    properties=pika.BasicProperties(
                        delivery_mode=2,  # Mensagem persistente
                    )
                )
                logging.info(f"Enviado: {message}")
            
            # Coleta a cada 10 segundos para demonstração
            time.sleep(10)
            
    except KeyboardInterrupt:
        logging.info("Parando collector...")
        connection.close()
    except Exception as e:
        logging.error(f"Erro inesperado: {e}")
        connection.close()

if __name__ == "__main__":
    main()