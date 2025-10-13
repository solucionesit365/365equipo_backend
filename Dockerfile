FROM node:lts-alpine

ENV TZ=Europe/Madrid

WORKDIR /app

# Update system packages to reduce vulnerabilities
RUN apk update && apk upgrade

COPY package*.json tsconfig.json ./

RUN npm ci
COPY prisma ./prisma
RUN npm run prisma:generar
COPY . .

RUN npm run build

CMD ["npm", "start"]