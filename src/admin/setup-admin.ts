import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

async function setupSuperAdmin() {
  const superAdminEmail = process.argv[2];
  
  if (!superAdminEmail) {
    console.error("Por favor proporciona el email del super admin: npm run setup:admin <email>");
    process.exit(1);
  }

  try {
    // Inicializar Firebase Admin
    const app = initializeApp({
      credential: applicationDefault(),
      projectId: 'silema',
    });
    
    const auth = getAuth(app);
    
    // Obtener el usuario por email
    const user = await auth.getUserByEmail(superAdminEmail);
    
    // Establecer custom claims para super admin
    await auth.setCustomUserClaims(user.uid, {
      superAdmin: true,
      admin: true,
    });
    
    console.log(`✅ Super admin configurado exitosamente para: ${superAdminEmail}`);
    console.log(`UID: ${user.uid}`);
    
    process.exit(0);
  } catch (error) {
    console.error("Error configurando super admin:", error);
    process.exit(1);
  }
}

setupSuperAdmin();