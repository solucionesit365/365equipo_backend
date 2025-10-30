# 🚀 Instrucciones de Configuración CI/CD

## ✅ Completado

- ✅ Workflows de GitHub Actions creados
- ✅ Configuración de SonarCloud lista
- ✅ DigitalOcean configurado para deploy desde `master`
- ✅ Documentación creada

---

## 🔧 Configuración Manual Requerida

### 1. Configurar Secrets en GitHub

Ve a: `https://github.com/solucionesit365/365equipo_backend/settings/secrets/actions`

Necesitas agregar estos secrets:

#### a) **SONAR_TOKEN** (CRÍTICO)
1. Ir a: https://sonarcloud.io
2. Hacer login o crear cuenta
3. Ir a: My Account → Security → Generate Token
4. Nombre del token: `GitHub Actions CI`
5. Copiar el token generado
6. En GitHub: New repository secret
   - Name: `SONAR_TOKEN`
   - Value: `[el token que copiaste]`

#### b) **DO_API_TOKEN** (CRÍTICO)
1. Ir a: https://cloud.digitalocean.com/account/api/tokens
2. Generar nuevo token
3. Nombre: `GitHub Actions Deploy`
4. Scope: `Read and Write`
5. Copiar el token generado
6. En GitHub: New repository secret
   - Name: `DO_API_TOKEN`
   - Value: `[el token que copiaste]`

#### c) **DO_APP_ID_PROD** (CRÍTICO)
- Name: `DO_APP_ID_PROD`
- Value: `53b14504-ee0a-42bc-b423-297aaa9fbcac`

#### d) **DO_APP_ID_STAGING** (OPCIONAL - para staging)
- Name: `DO_APP_ID_STAGING`
- Value: `b2fc5d2c-dea5-489c-be85-838da272da74`

---

### 2. Configurar SonarCloud Project

1. Ir a: https://sonarcloud.io
2. Click en `+` → `Analyze new project`
3. Seleccionar: `solucionesit365/365equipo_backend`
4. Configuración:
   - Method: `GitHub Actions`
   - Main branch: `master`
5. Ir a: Project Settings → General Settings
   - Project Key: `365equipo_backend`
   - Organization: `solucionesit365`

6. Configurar Quality Gate:
   - Ir a: Quality Gates → Create
   - Nombre: `365equipo_backend_gate`
   - Condiciones recomendadas:
     - Coverage: ≥ 80%
     - Duplicated Lines: ≤ 3%
     - Maintainability Rating: ≤ A
     - Reliability Rating: ≤ A
     - Security Rating: ≤ A

---

### 3. Proteger Ramas en GitHub

Ve a: `https://github.com/solucionesit365/365equipo_backend/settings/branches`

#### A) Proteger rama `develop` (IMPORTANTE)

1. Click en `Add rule`
2. Configurar:
   - ✅ Branch name pattern: `develop`
   - ✅ Require a pull request before merging
   - ✅ Require approvals: 1
   - ✅ Require status checks to pass before merging
     - ✅ Require branches to be up to date before merging
     - ✅ Status checks that are required:
       - `Code Quality & Tests` (aparecerá después del primer PR)
   - ✅ Require conversation resolution before merging
   - ❌ Allow force pushes: NO
   - ❌ Allow deletions: NO
3. Click en `Create`

#### B) Proteger rama `master`

1. Click en `Add rule`
2. Configurar:
   - ✅ Branch name pattern: `master`
   - ✅ Require a pull request before merging
   - ✅ Require approvals: 1
   - ✅ Require status checks to pass before merging
     - ✅ Require branches to be up to date before merging
     - ✅ Status checks that are required:
       - `Code Quality & Tests`
   - ✅ Require conversation resolution before merging
   - ✅ Do not allow bypassing the above settings
   - ❌ Allow force pushes: NO
   - ❌ Allow deletions: NO
3. Click en `Create`

---

### 4. Crear Rama Develop (Opcional pero Recomendado)

```bash
git checkout -b develop
git push origin develop
```

Esta rama será para desarrollo/staging antes de merge a master.

---

### 5. Primer Test del CI/CD

#### Opción A: Test con Feature Branch

```bash
# Crear una rama de prueba
git checkout -b feature/test-cicd

# Hacer un cambio mínimo (ejemplo)
echo "# CI/CD Test" >> .github/TEST.md
git add .github/TEST.md
git commit -m "test: Verificar pipeline CI/CD"

# Push de la rama
git push origin feature/test-cicd

# Crear PR en GitHub hacia master
# Ver que el workflow 'Code Quality & Tests' se ejecuta
```

#### Opción B: Test directo en develop

```bash
# Ir a develop
git checkout develop

# Hacer merge de los cambios actuales
git merge [tu-rama-actual]

# Push
git push origin develop

# Ver que el workflow de staging se ejecuta
```

---

## 📋 Verificación del Setup

### Checklist Final

- [ ] Secrets de GitHub configurados (SONAR_TOKEN, DO_API_TOKEN, DO_APP_ID_PROD)
- [ ] Proyecto creado en SonarCloud
- [ ] Quality Gate configurado en SonarCloud
- [ ] Rama master protegida en GitHub
- [ ] Rama develop creada (opcional)
- [ ] Primer test del CI/CD realizado
- [ ] PR de prueba ejecutado exitosamente

---

## 🎯 Flujo de Trabajo Final

### Durante el Sprint (Features individuales)

```
1. Desarrollador crea feature/nueva-funcionalidad
   ↓
2. Hace cambios y commits
   ↓
3. Push a origin
   ↓
4. Crea PR a DEVELOP en GitHub ⚠️
   ↓
5. CI Pipeline se ejecuta automáticamente:
   - ✅ SonarCloud escanea código
   - ✅ Tests se ejecutan
   - ✅ Build se verifica
   ↓
6. Code review manual
   ↓
7. Merge a develop (si CI pasa + aprobación)
   ↓
8. ✅ Feature lista en develop
```

### Fin de Sprint (Release a producción)

```
1. Crear PR de develop → master
   ↓
2. CI Pipeline se ejecuta de nuevo (verificación final)
   ↓
3. Code review final
   ↓
4. Merge a master
   ↓
5. Deploy automático a producción
   ↓
6. ✅ Sprint completo en producción
```

**Ventaja**: Si una feature falla CI, solo bloquea su merge a develop, no afecta al resto del sprint

---

## 🆘 Troubleshooting

### El workflow no se ejecuta
- Verificar que los workflows están en `.github/workflows/`
- Verificar que los archivos tienen extensión `.yml`
- Verificar que GitHub Actions está habilitado en el repo

### SonarCloud falla con "Token not found"
- Verificar que el secret `SONAR_TOKEN` está configurado
- Verificar que el proyecto existe en SonarCloud
- Verificar que el token no ha expirado

### Deploy falla con "Unauthorized"
- Verificar que `DO_API_TOKEN` está configurado
- Verificar que el token tiene permisos de Read/Write
- Verificar que `DO_APP_ID_PROD` es correcto

### Tests fallan
- Ejecutar localmente: `npm test`
- Verificar que todas las dependencias están instaladas
- Verificar que Prisma client está generado

---

## 📚 Recursos

- [Documentación del CI/CD](.github/CICD.md)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [SonarCloud Docs](https://docs.sonarcloud.io/)
- [DigitalOcean App Platform](https://docs.digitalocean.com/products/app-platform/)

---

## ✨ Próximos Pasos (Opcionales)

1. **Agregar notificaciones Slack/Discord** cuando hay deploy
2. **Configurar auto-merge** para PRs que pasen CI
3. **Agregar tests E2E** en el pipeline
4. **Configurar deployment environments** (staging, QA, prod)
5. **Agregar performance testing** en CI
6. **Configurar dependabot** para actualizaciones de dependencias

---

**¿Necesitas ayuda?** Revisa la documentación completa en `.github/CICD.md`
