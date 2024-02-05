FROM node:lts

ENV TZ=Europe/Madrid

WORKDIR /app

COPY package*.json tsconfig.json ./

RUN npm ci
RUN npm run prisma:generar
COPY . .

RUN npm run build

CMD ["npm", "start"]