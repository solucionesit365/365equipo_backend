# 📅 Flujo de Trabajo por Sprint

## 🎯 Problema Resuelto

**Antes**: CI solo al final del sprint → Si falla, todo el sprint se bloquea
**Ahora**: CI en cada feature → Solo se bloquea la feature problemática, el resto continúa

---

## 📊 Ejemplo Práctico: Sprint de 2 Semanas

### Semana 1 - Desarrollo de Features

#### Lunes - Feature Login
```bash
git checkout -b feature/login
# ... desarrollar feature ...
git push origin feature/login
```
**En GitHub**: Crear PR `feature/login` → `develop`
- ⚡ CI se ejecuta automáticamente (3-5 min)
- ✅ SonarCloud: OK
- ✅ Tests: OK
- ✅ Build: OK
- 👍 Code review aprobado
- ✅ **Merge a develop**

#### Martes - Feature Carrito
```bash
git checkout -b feature/carrito
# ... desarrollar feature ...
git push origin feature/carrito
```
**En GitHub**: Crear PR `feature/carrito` → `develop`
- ⚡ CI se ejecuta automáticamente
- ❌ SonarCloud: **FALLA** - Código duplicado detectado
- **NO SE PUEDE MERGEAR**
- 🔧 Desarrollador arregla el problema
- Push de corrección
- ✅ CI pasa
- ✅ **Merge a develop**

#### Miércoles - Feature Pago
```bash
git checkout -b feature/pago
# ... desarrollar feature ...
git push origin feature/pago
```
**En GitHub**: Crear PR `feature/pago` → `develop`
- ⚡ CI se ejecuta automáticamente
- ✅ SonarCloud: OK
- ❌ Tests: **FALLAN** - 2 tests rotos
- **NO SE PUEDE MERGEAR**
- 🔧 Desarrollador arregla tests
- Push de corrección
- ✅ CI pasa
- ✅ **Merge a develop**

### Semana 2 - Más Features

#### Lunes - Feature Notificaciones
```bash
git checkout -b feature/notificaciones
# ... desarrollar feature ...
git push origin feature/notificaciones
```
**En GitHub**: Crear PR `feature/notificaciones` → `develop`
- ⚡ CI se ejecuta
- ✅ Todo OK
- ✅ **Merge a develop**

#### Miércoles - Feature Dashboard
```bash
git checkout -b feature/dashboard
# ... desarrollar feature ...
git push origin feature/dashboard
```
**En GitHub**: Crear PR `feature/dashboard` → `develop`
- ⚡ CI se ejecuta
- ❌ **FALLA** gravemente
- Desarrollador no puede arreglarlo a tiempo
- ❌ **NO SE MERGEA**
- Esta feature queda fuera del sprint

### Viernes (Fin del Sprint) - Release a Producción

```bash
# Develop contiene: login + carrito + pago + notificaciones
# (dashboard quedó fuera porque no pasó CI)

git checkout develop
git pull origin develop
```

**En GitHub**: Crear PR `develop` → `master`
- ⚡ CI se ejecuta de nuevo (verificación final)
- ✅ Todo pasa (porque cada feature ya fue validada)
- 👍 Code review final
- ✅ **Merge a master**
- 🚀 **Deploy automático a producción**

---

## 📈 Resultado del Sprint

### Features Completadas: 4/5
- ✅ Login
- ✅ Carrito
- ✅ Pago
- ✅ Notificaciones
- ❌ Dashboard (queda para siguiente sprint)

### Tiempo Ahorrado
- **Sin CI por feature**:
  - Viernes: descubres que dashboard rompe todo
  - Fin de semana: arreglar urgente o sacar todo dashboard
  - Lunes: nuevo deploy con fix

- **Con CI por feature**:
  - Miércoles: descubres que dashboard tiene problemas
  - Miércoles: decides no incluirlo en el sprint
  - Viernes: deploy tranquilo con lo que sí funciona

---

## 🎯 Ventajas Clave

### 1. Detección Temprana
```
Problema detectado el miércoles ✅
vs
Problema detectado el viernes ❌
```
**Diferencia**: 2 días para decidir qué hacer

### 2. Independencia de Features
```
Dashboard falla ❌
Pero Login, Carrito, Pago, Notificaciones siguen ✅
```
**Antes**: Todo el sprint se bloqueaba
**Ahora**: Solo la feature problemática

### 3. Presión Reducida
```
Viernes antes del release:
- Sin CI por feature: "¿Pasará el CI? 😰"
- Con CI por feature: "Todo ya pasó CI ✅😌"
```

### 4. Mejor Planning
```
Durante el sprint:
"Dashboard no va a estar listo, ajustemos prioridades"
vs
Fin del sprint:
"Dashboard no funcionó, sprint fallido 😞"
```

---

## 🔄 Comandos del Desarrollador

### Durante el Sprint (Cada Feature)

```bash
# 1. Crear feature branch desde develop
git checkout develop
git pull origin develop
git checkout -b feature/mi-nueva-feature

# 2. Desarrollar
# ... código ...

# 3. Commit
git add .
git commit -m "feat: agregar mi nueva feature"

# 4. Push
git push origin feature/mi-nueva-feature

# 5. Crear PR en GitHub: feature/mi-nueva-feature → develop
# 6. Esperar CI (3-5 min)
# 7. Si CI falla, arreglar y push de nuevo
# 8. Si CI pasa, esperar code review
# 9. Mergear
```

### Fin del Sprint (Tech Lead / Release Manager)

```bash
# 1. Verificar que develop está actualizado
git checkout develop
git pull origin develop

# 2. Crear PR en GitHub: develop → master
# 3. Esperar CI (verificación final)
# 4. Code review final
# 5. Mergear → Deploy automático 🚀
```

---

## 📊 Métricas de Éxito

### Sprint Sin CI por Feature
- ✅ Features completadas: 3/5 (60%)
- ⏱️ Tiempo de debugging al final: 2 días
- 😰 Estrés del equipo: Alto
- 🐛 Bugs en producción: 5

### Sprint Con CI por Feature
- ✅ Features completadas: 4/5 (80%)
- ⏱️ Tiempo de debugging al final: 0 días
- 😌 Estrés del equipo: Bajo
- 🐛 Bugs en producción: 1

---

## 🎓 Mejores Prácticas

### 1. PRs Pequeños
- ✅ 1 feature = 1 PR
- ✅ PRs de menos de 500 líneas
- ❌ Evitar PRs gigantes con múltiples features

### 2. CI Rápido
- ✅ Si CI tarda >10 min, optimizar tests
- ✅ Ejecutar solo tests relacionados
- ✅ Usar caché de npm

### 3. Fix Forward
- ✅ Si CI falla, arreglar inmediatamente
- ❌ No acumular "lo arreglo después"

### 4. Comunicación
- ✅ Si tu feature falla CI, avisar al equipo
- ✅ Si no llegas a tiempo, mejor no incluir en sprint
- ✅ Transparencia > Presión

---

## ✨ Conclusión

**El CI en cada PR a develop es tu red de seguridad**

No es un obstáculo, es tu mejor aliado para:
- Entregar sprints exitosos
- Mantener develop siempre deployable
- Reducir bugs en producción
- Dormir tranquilo los viernes 😴

---

**Recuerda**: Es mejor descubrir un problema el martes que el viernes antes del release.
