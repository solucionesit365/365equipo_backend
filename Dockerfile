# Utiliza la imagen oficial de Node.js versión 18 como base
FROM node:18

# Establece el directorio de trabajo en la imagen
WORKDIR /app

# Copia el archivo 'package.json' y 'package-lock.json' (si está disponible) al directorio de trabajo
COPY package*.json ./

# Instala las dependencias del proyecto
RUN npm ci
RUN npm run build
# Copia el resto de los archivos del proyecto al directorio de trabajo
COPY . .

# Expone el puerto que tu aplicación utilizará (cámbialo al puerto que necesites)
EXPOSE 3000

# Ejecuta el comando 'npm start' para arrancar la aplicación
CMD ["npm", "start"]