const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function downloadServiceAccount() {
  console.log('🔧 Configuración de Service Account para Firebase Admin SDK');
  console.log('=========================================================\n');

  try {
    // Verificar que gcloud esté configurado
    console.log('📌 Verificando configuración de gcloud...');
    const currentProject = execSync('gcloud config get-value project', { encoding: 'utf8' }).trim();
    
    if (currentProject !== 'silema') {
      console.error('❌ El proyecto actual no es "silema". Ejecuta primero: npm run setup:gcloud');
      process.exit(1);
    }
    
    console.log(`✅ Proyecto actual: ${currentProject}\n`);

    // Listar service accounts existentes
    console.log('📌 Buscando service accounts existentes...');
    const serviceAccounts = execSync(
      'gcloud iam service-accounts list --format="value(email)"',
      { encoding: 'utf8' }
    ).trim().split('\n').filter(Boolean);

    let selectedAccount = '';
    
    if (serviceAccounts.length > 0) {
      console.log('\nService accounts encontradas:');
      serviceAccounts.forEach((account, index) => {
        console.log(`${index + 1}. ${account}`);
      });
      
      const choice = await new Promise((resolve) => {
        rl.question('\nSelecciona una cuenta (número) o presiona Enter para crear una nueva: ', resolve);
      });
      
      if (choice && !isNaN(choice) && choice > 0 && choice <= serviceAccounts.length) {
        selectedAccount = serviceAccounts[parseInt(choice) - 1];
      }
    }

    // Crear nueva service account si es necesario
    if (!selectedAccount) {
      console.log('\n📌 Creando nueva service account...');
      const accountName = '365equipo-firebase-admin';
      const displayName = '365 Equipo Firebase Admin';
      
      try {
        execSync(
          `gcloud iam service-accounts create ${accountName} --display-name="${displayName}"`,
          { stdio: 'inherit' }
        );
        selectedAccount = `${accountName}@${currentProject}.iam.gserviceaccount.com`;
        console.log(`✅ Service account creada: ${selectedAccount}`);
        
        // Asignar roles necesarios
        console.log('\n📌 Asignando roles necesarios...');
        const roles = [
          'roles/firebase.admin',
          'roles/iam.serviceAccountTokenCreator'
        ];
        
        for (const role of roles) {
          console.log(`   Asignando ${role}...`);
          execSync(
            `gcloud projects add-iam-policy-binding ${currentProject} --member="serviceAccount:${selectedAccount}" --role="${role}"`,
            { stdio: 'pipe' }
          );
        }
        console.log('✅ Roles asignados correctamente');
      } catch (error) {
        if (error.message.includes('already exists')) {
          selectedAccount = `${accountName}@${currentProject}.iam.gserviceaccount.com`;
          console.log(`ℹ️ La service account ya existe: ${selectedAccount}`);
        } else {
          throw error;
        }
      }
    }

    // Descargar la clave
    console.log('\n📌 Descargando clave de service account...');
    const keyPath = path.join(__dirname, '..', 'firebase-admin-key.json');
    
    execSync(
      `gcloud iam service-accounts keys create "${keyPath}" --iam-account="${selectedAccount}"`,
      { stdio: 'pipe' }
    );
    
    console.log(`✅ Clave descargada en: ${keyPath}`);

    // Actualizar .env
    console.log('\n📌 Actualizando archivo .env...');
    const envPath = path.join(__dirname, '..', '.env');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Leer el contenido de la clave
    const keyContent = fs.readFileSync(keyPath, 'utf8');
    const keyJson = JSON.parse(keyContent);
    
    // Preparar la variable FIREBASE_CONFIG
    const firebaseConfigLine = `FIREBASE_CONFIG='${JSON.stringify(keyJson)}'`;
    
    // Actualizar o agregar la variable
    if (envContent.includes('FIREBASE_CONFIG=')) {
      envContent = envContent.replace(/FIREBASE_CONFIG=.*$/m, firebaseConfigLine);
    } else {
      envContent += `\n${firebaseConfigLine}\n`;
    }
    
    fs.writeFileSync(envPath, envContent);
    
    // Eliminar el archivo de clave temporal
    fs.unlinkSync(keyPath);
    
    console.log('✅ Variable FIREBASE_CONFIG agregada al archivo .env');
    console.log('\n🎉 Configuración completada exitosamente!');
    console.log('\nAhora puedes ejecutar el servidor con: npm run dev');
    
  } catch (error) {
    console.error('\n❌ Error durante la configuración:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

downloadServiceAccount();