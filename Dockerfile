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

# Vérification que la compilation a bien fonctionné
RUN ls -la dist/

# Étape 2 : Runtime
FROM node:20 AS prod
WORKDIR /app

# Copie uniquement les modules Node installés
COPY --from=build /app/node_modules ./node_modules

# Copie le code compilé
COPY --from=build /app/dist ./dist

# Copie package.json pour information
COPY package*.json ./

# Vérification des fichiers copiés
RUN ls -la dist/

# Déclare le port exposé
EXPOSE 3000

# Ajout d'un healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# Point d'entrée de l'application avec logs de debug
CMD ["sh", "-c", "echo 'Starting application...' && ls -la dist/ && node dist/index.js"]