#!/bin/bash

echo "🔧 Configuración de gcloud para 365equipo"
echo "========================================="

# Paso 1: Activar configuración
echo "📌 Paso 1: Activando configuración 'obrador'..."
gcloud config configurations activate obrador

# Paso 2: Solicitar email y autenticar
echo ""
echo "📌 Paso 2: Autenticación con Google Cloud"
read -p "Introduce tu correo de Google Cloud: " USER_EMAIL

if [ -z "$USER_EMAIL" ]; then
    echo "❌ Error: No se proporcionó un correo"
    exit 1
fi

echo "Autenticando con: $USER_EMAIL"
gcloud auth application-default login --account="$USER_EMAIL"

# Paso 3: Configurar proyecto
echo ""
echo "📌 Paso 3: Configurando proyecto 'silema'..."
gcloud config set project silema

echo ""
echo "✅ Configuración completada!"
echo ""
echo "Ahora puedes ejecutar el servidor con: npm run dev"