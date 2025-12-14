FROM node:18-alpine

WORKDIR /app

COPY package.json .
RUN npm install

COPY . .

# Roda o servidor de desenvolvimento do Vite exposto para a rede
CMD ["npm", "run", "dev", "--", "--host"]