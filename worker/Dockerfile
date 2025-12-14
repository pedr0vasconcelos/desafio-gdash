FROM golang:1.20-alpine

WORKDIR /app

COPY go.mod .
COPY main.go .

# Baixa as dependências automaticamente baseado nos imports do main.go
RUN go mod tidy

RUN go build -o worker main.go

CMD ["./worker"]