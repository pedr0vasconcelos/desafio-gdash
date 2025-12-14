# GDash - Monitoramento Climático Full-Stack

Solução desenvolvida para o desafio técnico GDash 2025/02. Uma aplicação Full-Stack que coleta dados climáticos, processa via fila de mensagens e exibe em um dashboard interativo com insights de IA.

## 🚀 Tecnologias Utilizadas

* **Coleta:** Python (Open-Meteo API)
* **Fila:** RabbitMQ + Worker em Go
* **Backend:** NestJS + MongoDB
* **Frontend:** React + Vite + Chart.js
* **Infraestrutura:** Docker Compose

## 📋 Pré-requisitos

* Docker
* Docker Compose

## 🛠️ Como Rodar o Projeto

1. **Clone o repositório:**

   ```bash
   git clone <seu-repo-url>
   cd Desafio-Gdash
   ```
2. **Configure as variáveis de ambiente:**
   Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo (ajuste `LOCATION_LAT` e `LOCATION_LON` para sua cidade):

   ```env
   MONGO_USER=admin
   MONGO_PASSWORD=secret
   MONGO_DB=gdash_db
   MONGO_HOST=mongo
   MONGO_PORT=27017
   MONGO_URI=mongodb://admin:secret@mongo:27017/gdash_db?authSource=admin

   RABBITMQ_USER=guest
   RABBITMQ_PASSWORD=guest
   RABBITMQ_HOST=rabbitmq
   RABBITMQ_PORT=5672
   RABBITMQ_UI_PORT=15672

   JWT_SECRET=super_secret_key_change_me
   PORT=3000

   TZ=America/Sao_Paulo
   LOCATION_LAT=-23.5505
   LOCATION_LON=-46.6333
   ```
3. **Suba os containers:**

   ```bash
   docker-compose up -d --build
   ```

## 🔗 URLs Principais

| Serviço                       | URL                    | Credenciais (se houver)    |
| :----------------------------- | :--------------------- | :------------------------- |
| **Frontend (Dashboard)** | http://localhost:5173  | admin@example.com / 123456 |
| **Backend API**          | http://localhost:3000  | -                          |
| **RabbitMQ Management**  | http://localhost:15672 | guest / guest              |

## 👤 Acesso Padrão

---

O sistema cria automaticamente um usuário administrador na primeira execução:

* **Email:** `admin@example.com`
* **Senha:** `123456`

## 🏗️ Arquitetura e Pipeline

---

1. **Collector (Python):** Consulta a API Open-Meteo a cada 10 segundos e publica os dados na fila `weather_data` do RabbitMQ.
2. **Worker (Go):** Consome a fila `weather_data`, processa a mensagem e salva no MongoDB.
3. **Backend (NestJS):**
   * Exponibiliza os dados via API REST.
   * Gera Insights de IA baseados no histórico recente.
   * Gerencia autenticação e usuários.
   * Exporta dados em CSV/XLSX.
4. **Frontend (React):**
   * Dashboard com gráficos em tempo real.
   * Área administrativa de usuários.
   * Login seguro com JWT.
