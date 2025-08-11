# Étape 1 : Build
FROM node:20 AS build

WORKDIR /app

# Copie package.json et package-lock.json (si dispo)
COPY package*.json ./

# Installation des dépendances
RUN npm install

# Copie du reste du code source
COPY . .

# Compilation TypeScript -> JavaScript
RUN npm run build

# Étape 2 : Runtime
FROM node:20 AS prod

WORKDIR /app

# Copie uniquement les modules Node installés
COPY --from=build /app/node_modules ./node_modules

# Copie le code compilé
COPY --from=build /app/dist ./dist

# Copie package.json pour information
COPY package*.json ./

# Déclare le port exposé
EXPOSE 3000

# Point d'entrée de l'application
CMD ["node", "dist/index.js"]
