const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function setupGcloud() {
  console.log('🔧 Configuración de gcloud para 365equipo');
  console.log('=========================================\n');

  try {
    // Paso 1: Activar configuración
    console.log('📌 Paso 1: Activando configuración "obrador"...');
    execSync('gcloud config configurations activate obrador', { stdio: 'inherit' });
    
    // Paso 2: Solicitar email y autenticar
    console.log('\n📌 Paso 2: Autenticación con Google Cloud');
    
    const email = await new Promise((resolve) => {
      rl.question('Introduce tu correo de Google Cloud: ', (answer) => {
        resolve(answer.trim());
      });
    });
    
    if (!email) {
      console.error('❌ Error: No se proporcionó un correo');
      process.exit(1);
    }
    
    console.log(`\nAutenticando con: ${email}`);
    execSync(`gcloud auth application-default login --account="${email}"`, { stdio: 'inherit' });
    
    // Paso 3: Configurar proyecto
    console.log('\n📌 Paso 3: Configurando proyecto "silema"...');
    execSync('gcloud config set project silema', { stdio: 'inherit' });
    
    console.log('\n✅ Configuración completada!');
    console.log('\nAhora puedes ejecutar el servidor con: npm run dev');
    
  } catch (error) {
    console.error('\n❌ Error durante la configuración:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

setupGcloud();