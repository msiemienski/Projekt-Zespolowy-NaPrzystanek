FROM node:20-alpine

WORKDIR /app

# Kopiowanie plików zależności
COPY package.json package-lock.json* ./

# Instalacja zależności
RUN npm install

# Kopiowanie reszty plików
COPY . .

# Budowanie aplikacji (opcjonalnie, jeśli chcemy produkcyjnie, ale dev też zadziała)
# RUN npm run build

EXPOSE 3000

# Domyślnie uruchamiamy w trybie deweloperskim
CMD ["npm", "run", "dev"]
