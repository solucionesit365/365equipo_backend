FROM node:18

ENV TZ=Europe/Madrid

WORKDIR /app

COPY package*.json tsconfig.json ./

RUN npm ci
COPY prisma ./prisma
RUN npm run prisma:generar
COPY . .

RUN npm run build

CMD ["npm", "start"]