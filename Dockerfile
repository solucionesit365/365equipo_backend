FROM node:18

ENV TZ=Europe/Madrid

WORKDIR /app

COPY package*.json tsconfig.json ./

RUN npm ci

COPY . .

RUN npm run build

CMD ["npm", "start"]