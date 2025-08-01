# Configuración del Sistema de Administración

## 1. Configuración inicial de Google Cloud

Ejecuta el siguiente comando para configurar gcloud de forma interactiva:

```bash
npm run setup:gcloud
```

Este comando te pedirá:
- Tu correo de Google Cloud (no se guardará en ningún archivo)
- Abrirá el navegador para autenticarte
- Configurará el proyecto automáticamente

### Alternativa con Bash (Linux/Mac):
```bash
npm run setup:gcloud:bash
```

## 2. Configuración de Firebase Admin SDK

Para evitar problemas con las credenciales de aplicación predeterminadas, ejecuta:

```bash
npm run setup:firebase
```

Este comando:
- Creará o seleccionará una service account
- Descargará las credenciales necesarias
- Configurará automáticamente la variable FIREBASE_CONFIG en tu .env
- Asignará los permisos necesarios

## 3. Configurar el primer Super Admin

Una vez configurado Firebase, establece el primer super administrador:

```bash
npm run setup:admin <email-del-super-admin>
```

Ejemplo:
```bash
npm run setup:admin admin@empresa.com
```

## 3. Uso del Sistema de Administración

### Para administradores:

1. Accede a `/admin` en el frontend
2. Inicia sesión con tu cuenta de Google/Microsoft (debe ser una cuenta con rol de admin)
3. Introduce el email del trabajador al que necesitas dar soporte
4. Especifica el motivo del acceso (para auditoría)
5. El sistema te autenticará como ese usuario

### Sistema Legacy (temporal):

Si necesitas usar el sistema anterior con contraseña:
1. Accede a `/admin?legacy=true`
2. Usa la contraseña configurada en `SUPER_SECRET`

## 4. Gestión de Roles

Los super administradores pueden asignar roles de admin a otros usuarios mediante el endpoint:

```
POST /admin/setAdminRole
{
  "userEmail": "nuevo-admin@empresa.com",
  "isAdmin": true
}
```

## Seguridad

- Todas las acciones de impersonación quedan registradas
- Solo usuarios con rol `admin` pueden usar la función de impersonación
- Solo usuarios con rol `superAdmin` pueden asignar roles
- El sistema requiere autenticación Firebase válida