# Etap build (opcjonalny, ale dobry na przyszłość)
FROM node:20-alpine AS build

WORKDIR /app

# Instalacja zależności
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Kopia źródeł
COPY src ./src

# Etap produkcyjny
FROM node:20-alpine

WORKDIR /app

# Zmienne środowiskowe (można nadpisać przy uruchomieniu kontenera)
ENV NODE_ENV=production
ENV PORT=4000
# Przykład: mongodb://mongo:27017/naprzystanek
ENV MONGO_URI=mongodb://mongo:27017/naprzystanek
ENV JWT_SECRET=super_tajne_haslo_zmien_to
ENV FRONTEND_ORIGIN=http://localhost:3000

# Kopia z etapu build
COPY --from=build /app /app

EXPOSE 4000

CMD ["node", "src/server.js"]
