import { Controller, Post, Body, UseGuards, Req } from "@nestjs/common";
import { Admin } from "./admin.class";
import { FirebaseAuthGuard } from "../guards/firebase-auth.guard";
import { FirebaseService } from "../firebase/firebase.service";

@Controller("admin")
export class AdminController {
  constructor(
    private readonly adminInstance: Admin,
    private readonly firebaseService: FirebaseService,
  ) {}

  @Post("signInWithCustomToken")
  async signInWithCustomToken(@Body() { email, password }) {
    try {
      // Por ahora mantenemos el sistema con contraseña pero lo mejoraremos
      if (email && password === process.env.SUPER_SECRET) {
        return {
          ok: true,
          data: await this.adminInstance.signInWithCustomToken(email),
        };
      } else throw Error("Identificación como administrador incorrecta");
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Post("impersonate")
  @UseGuards(FirebaseAuthGuard)
  async impersonateUser(@Body() { targetEmail }, @Req() req) {
    try {
      // Verificar que el usuario actual es administrador
      const currentUser = await this.firebaseService.getUserByUid(req.user.uid);
      const customClaims = currentUser.customClaims || {};
      
      if (!customClaims.admin) {
        throw new Error("No tienes permisos de administrador");
      }

      // Generar token para el usuario objetivo
      const targetUid = await this.firebaseService.getUidByEmail(targetEmail);
      if (!targetUid) {
        throw new Error("Usuario no encontrado");
      }

      // Obtener información del usuario objetivo
      const targetUser = await this.firebaseService.getUserByUid(targetUid);
      
      // Generar token con claims adicionales para identificar la impersonación
      const customToken = await this.firebaseService.generateCustomToken(targetUid, {
        impersonatedBy: currentUser.email,
        impersonatedAt: new Date().toISOString(),
        isImpersonation: true,
      });
      
      // Registrar la acción de impersonación
      console.log(`Admin ${currentUser.email} está accediendo como ${targetEmail}`);
      
      return {
        ok: true,
        data: customToken,
        targetEmail,
      };
    } catch (err) {
      console.error("Error en impersonate:", err);
      return { ok: false, message: err.message };
    }
  }

  @Post("setAdminRole")
  @UseGuards(FirebaseAuthGuard)
  async setAdminRole(@Body() { userEmail, isAdmin }, @Req() req) {
    try {
      // Solo super admins pueden asignar roles de admin
      const currentUser = await this.firebaseService.getUserByUid(req.user.uid);
      const customClaims = currentUser.customClaims || {};
      
      if (!customClaims.superAdmin) {
        throw new Error("Solo super administradores pueden asignar roles");
      }

      // Asignar o remover rol de admin
      const targetUid = await this.firebaseService.getUidByEmail(userEmail);
      if (!targetUid) {
        throw new Error("Usuario no encontrado");
      }

      await this.firebaseService.setCustomUserClaims(targetUid, { admin: isAdmin });
      
      return {
        ok: true,
        message: `Rol de admin ${isAdmin ? 'asignado' : 'removido'} para ${userEmail}`,
      };
    } catch (err) {
      console.error("Error en setAdminRole:", err);
      return { ok: false, message: err.message };
    }
  }
}
