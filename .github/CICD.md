# 🚀 CI/CD Pipeline Documentation

## Flujo de Trabajo

### 1. Desarrollo
```
feature/* o hotfix/* → Pull Request a develop
```

### 2. Pipeline CI (Automático en PRs)
El pipeline se ejecuta automáticamente en cada PR a `develop` O `master`:

#### Paso 1: SonarCloud (Análisis de Código Limpio)
- ✅ Verifica code smells
- ✅ Detecta bugs potenciales
- ✅ Encuentra vulnerabilidades de seguridad
- ✅ Revisa duplicación de código
- ⚠️ **Si falla**: El pipeline se detiene

#### Paso 2: Tests (Jest)
- ✅ Ejecuta unit tests
- ✅ Ejecuta integration tests
- ✅ Genera reporte de cobertura
- ⚠️ **Si falla**: El pipeline se detiene

#### Paso 3: Build
- ✅ Compila el proyecto con NestJS
- ✅ Verifica que no hay errores de TypeScript
- ⚠️ **Si falla**: El pipeline se detiene

### 3. Merge a Develop
Una vez que el PR pasa todas las verificaciones:
- ✅ Merge manual o automático a `develop`
- ✅ La feature queda lista para testing durante el sprint

### 4. Merge a Master (Fin de Sprint)
Al final del sprint, se crea PR de `develop` a `master`:
- ✅ CI se ejecuta de nuevo (verificación final)
- ✅ Se activa automáticamente el deploy a producción

### 5. Deploy a Producción (Automático)
Al hacer push a `master`:
- 🚀 Deploy automático a DigitalOcean App Platform
- 📍 URL: https://api.365equipo.com
- ⏱️ Tiempo estimado: 3-5 minutos

### 6. Deploy a Staging (Opcional - Manual)
Al hacer push a `develop` o `test`:
- 🧪 Deploy manual con: `doctl apps create-deployment <APP_ID_STAGING>`
- 📍 URL: https://backend-test-6yw3e.ondigitalocean.app

---

## Configuración Necesaria

### GitHub Secrets
Debes configurar los siguientes secrets en GitHub:

1. **SONAR_TOKEN**
   - Obtener en: https://sonarcloud.io/account/security
   - Scope: `solucionesit365/365equipo_backend`

2. **DO_API_TOKEN**
   - Obtener en: DigitalOcean → API → Tokens
   - Scope: Read/Write

3. **DO_APP_ID_PROD**
   - ID de la app de producción en DigitalOcean
   - Obtener con: `doctl apps list`
   - Valor actual: `53b14504-ee0a-42bc-b423-297aaa9fbcac`

4. **DO_APP_ID_STAGING**
   - ID de la app de staging en DigitalOcean
   - Obtener con: `doctl apps list`
   - Valor actual: `b2fc5d2c-dea5-489c-be85-838da272da74`

### SonarCloud Setup
1. Ir a: https://sonarcloud.io
2. Importar el repositorio `solucionesit365/365equipo_backend`
3. Configurar Quality Gate (recomendado):
   - Coverage mínimo: 80%
   - Duplicación máxima: 3%
   - Maintainability Rating: A

### Protección de Rama Master
Configurar en GitHub: Settings → Branches → Branch protection rules

**Reglas recomendadas para `master`:**
- ✅ Require a pull request before merging
- ✅ Require status checks to pass before merging:
  - `Code Quality & Tests`
- ✅ Require branches to be up to date before merging
- ✅ Require conversation resolution before merging
- ✅ Do not allow bypassing the above settings
- ❌ No permitir push directo a master

---

## Estrategia de Ramas

```
master (producción) 🚀
  ↑
  │ PR + CI checks (fin de sprint)
  │
develop (integración) 🔄
  ↑
  │ PR + CI checks (cada feature)
  │
feature/nueva-funcionalidad
hotfix/correccion-urgente
```

### Ramas Principales
- **master**: Código en producción (protegida, solo deploys)
- **develop**: Rama de integración del sprint (protegida con CI)

### Ramas de Trabajo
- **feature/**: Nuevas funcionalidades
  - Se hace PR a `develop` (CI se ejecuta aquí ✅)
  - Si CI pasa → Merge a develop
  - Acumulación durante el sprint

- **hotfix/**: Correcciones urgentes
  - Puede ir directo a `master` en emergencias
  - O seguir el flujo normal a `develop`

### Flujo Durante el Sprint
```
Día 1-10 del sprint:
├─ Dev A: feature/login → PR a develop → CI ✅ → Merge
├─ Dev B: feature/carrito → PR a develop → CI ✅ → Merge
└─ Dev C: feature/pago → PR a develop → CI ✅ → Merge

Día 11 (fin de sprint):
└─ develop → PR a master → CI ✅ → Merge → Deploy 🚀
```

**Ventaja**: Cada feature se valida individualmente, no se acumula deuda técnica

---

## Comandos Útiles

### Ver apps de DigitalOcean
```bash
doctl apps list
```

### Trigger manual de deployment
```bash
# Producción
doctl apps create-deployment 53b14504-ee0a-42bc-b423-297aaa9fbcac --force-rebuild

# Staging
doctl apps create-deployment b2fc5d2c-dea5-489c-be85-838da272da74 --force-rebuild
```

### Ver logs de deployment
```bash
doctl apps logs <APP_ID> --type build --follow
```

### Ejecutar tests localmente
```bash
npm test -- --coverage
```

### Ver reporte de cobertura
```bash
npm test -- --coverage
open coverage/lcov-report/index.html
```

---

## Solución de Problemas

### ❌ SonarCloud falla
1. Revisar el reporte en SonarCloud: https://sonarcloud.io/dashboard?id=365equipo_backend
2. Corregir los issues detectados
3. Hacer push de los cambios

### ❌ Tests fallan
1. Ejecutar tests localmente: `npm test`
2. Revisar los errores en el log
3. Corregir los tests
4. Verificar cobertura: `npm test -- --coverage`

### ❌ Build falla
1. Ejecutar build localmente: `npm run build`
2. Revisar errores de TypeScript
3. Corregir los errores
4. Verificar que `tsconfig.json` está correcto

### ❌ Deploy a DigitalOcean falla
1. Verificar logs: `doctl apps logs <APP_ID> --type build`
2. Comprobar que las variables de entorno están configuradas
3. Verificar que el Dockerfile es correcto
4. Intentar deploy manual con `--force-rebuild`

---

## Métricas y Monitoreo

### SonarCloud Metrics
- 📊 Ver dashboard: https://sonarcloud.io/dashboard?id=365equipo_backend
- 🐛 Bugs: 0 (objetivo)
- 🔒 Vulnerabilidades: 0 (objetivo)
- 📈 Code Smells: < 10 (objetivo)
- 📊 Cobertura: > 80% (objetivo)
- 🔄 Duplicación: < 3% (objetivo)

### DigitalOcean Metrics
- ⏱️ Uptime: Monitorear en el dashboard de DO
- 💾 CPU/Memory: Ajustar instance size si es necesario
- 🌐 Response time: Monitorear desde DO o con herramientas externas

---

## Stack Tecnológico

- **CI/CD**: GitHub Actions
- **Code Quality**: SonarCloud
- **Tests**: Jest
- **Build**: NestJS + TypeScript
- **Deploy**: DigitalOcean App Platform
- **Container**: Docker (Dockerfile)
- **Node**: v24 LTS

---

## Notas Adicionales

### Actualizaciones de Node.js
El proyecto ahora usa **Node.js v24 LTS** (actualizado desde v22).

### Variables de Entorno
Todas las variables de entorno están configuradas en DigitalOcean App Platform, no en el repositorio.

### Base de Datos
- **Producción**: MongoDB + PostgreSQL (Prisma)
- **Staging**: MongoDB Test

### Dependencias Importantes
- NestJS v11
- Prisma v6
- TypeScript v5
- Node v24
