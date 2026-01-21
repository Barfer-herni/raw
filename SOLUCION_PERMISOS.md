# Solución: Acceso Denegado para Usuarios Comunes

## 🔍 Problema Identificado

Los usuarios con role `user` recibían "Acceso Denegado" al intentar:
- Ver productos en `/admin/productos`
- Ver detalles de un producto en `/admin/producto/[id]`
- Acceder al carrito y checkout en `/admin/checkout`

**Causa:** Los usuarios solo tenían permisos de cuenta (`account:view_own`, `account:edit_own`) pero no permisos para productos ni carrito.

## ✅ Solución Implementada

### 1. Nuevos Permisos Creados

Se agregaron 4 nuevos permisos al sistema:

```typescript
'products:view'      // Ver productos y sus detalles
'products:purchase'  // Comprar productos
'cart:view'          // Ver el carrito
'cart:checkout'      // Proceder al checkout
```

### 2. Archivos Modificados

#### A. `/packages/auth/server-permissions.ts`
✅ Agregados nuevos permisos al tipo `Permission`
✅ Agregados a `ADMIN_PERMISSIONS`

#### B. `/apps/app/middleware.ts`
✅ Actualizado `ROUTE_PERMISSIONS`:
```typescript
'/admin/productos': ['products:view']
'/admin/producto': ['products:view']  // Incluye /admin/producto/[id]
'/admin/checkout': ['cart:checkout']
```
✅ Mejorada función `hasAccessToRoute` para soportar rutas dinámicas

#### C. `/packages/data-services/src/services/authService.ts`
✅ Actualizada función `registerUser` para que nuevos usuarios reciban todos los permisos necesarios

#### D. `/scripts/add-product-permissions.ts`
✅ Creado script de migración para usuarios existentes

#### E. `/package.json`
✅ Agregado comando: `"add-product-permissions": "tsx scripts/add-product-permissions.ts"`

#### F. `/docs/permissions-update.md`
✅ Documentación completa de los cambios

## 🚀 Pasos para Aplicar la Solución

### Paso 1: Ejecutar el Script de Migración

Desde la carpeta `raw/`, ejecuta:

```bash
pnpm add-product-permissions
```

O alternativamente:

```bash
tsx scripts/add-product-permissions.ts
```

Este script:
- ✅ Encuentra todos los usuarios con role 'user'
- ✅ Agrega los permisos de productos y carrito
- ✅ Muestra un resumen de usuarios actualizados
- ✅ No afecta a usuarios que ya tengan los permisos

### Paso 2: Reiniciar la Aplicación

Si la aplicación está corriendo, reiníciala para que los cambios en el middleware tomen efecto:

```bash
# Detén el servidor (Ctrl+C)
# Luego reinicia
pnpm dev
```

### Paso 3: Verificar

1. **Cerrar sesión** de cualquier usuario que esté logueado
2. **Iniciar sesión** nuevamente (para que el token se regenere con los nuevos permisos)
3. Intentar acceder a:
   - `/admin/productos` ✅
   - `/admin/producto/[id]` ✅
   - `/admin/checkout` ✅

## 📊 Ejemplo de Usuario Actualizado

**Antes:**
```json
{
  "_id": ObjectId("696907f5b3b7013c4303dbfc"),
  "name": "Hernán",
  "email": "hernanfdl5@gmail.com",
  "role": "user",
  "permissions": [
    "account:view_own",
    "account:edit_own"
  ]
}
```

**Después:**
```json
{
  "_id": ObjectId("696907f5b3b7013c4303dbfc"),
  "name": "Hernán",
  "email": "hernanfdl5@gmail.com",
  "role": "user",
  "permissions": [
    "account:view_own",
    "account:edit_own",
    "products:view",
    "products:purchase",
    "cart:view",
    "cart:checkout"
  ]
}
```

## 🔐 Rutas y Permisos

| Ruta | Permiso Requerido | Acceso |
|------|-------------------|--------|
| `/admin` | `account:view_own` | ✅ Usuarios y Admins |
| `/admin/account` | `account:view_own` | ✅ Usuarios y Admins |
| `/admin/productos` | `products:view` | ✅ Usuarios y Admins |
| `/admin/producto/[id]` | `products:view` | ✅ Usuarios y Admins |
| `/admin/checkout` | `cart:checkout` | ✅ Usuarios y Admins |
| `/admin/orders` | `admin:full_access` | ⚠️ Solo Admins |

## 🎯 Usuarios Nuevos

Los usuarios que se registren **después** de estos cambios automáticamente recibirán todos los permisos necesarios. No necesitan ejecutar el script de migración.

## ⚠️ Importante

- **Cerrar sesión y volver a iniciar** es necesario para que los nuevos permisos se carguen en el token
- Los administradores siempre tienen acceso completo (no necesitan estos permisos específicos)
- El script es **idempotente**: puede ejecutarse múltiples veces sin problemas

## 🐛 Solución de Problemas

### "Acceso Denegado" después de ejecutar el script

**Solución:** Cerrar sesión y volver a iniciar sesión para regenerar el token con los nuevos permisos.

### El script no encuentra usuarios

**Verificar:**
1. La variable de entorno `MONGODB_URL` está configurada correctamente
2. La conexión a MongoDB funciona
3. La colección se llama `users` (no `Users` o `user`)

### Verificar permisos en MongoDB

```javascript
// Conectarse a MongoDB y ejecutar:
db.users.find({ role: 'user' }, { name: 1, email: 1, permissions: 1 })
```

## 📝 Notas Adicionales

- El middleware verifica permisos en cada request del lado del servidor
- Los permisos se almacenan en el token de autenticación (cookie `auth-token`)
- Las rutas no definidas en `ROUTE_PERMISSIONS` son bloqueadas por defecto para usuarios no-admin
- Este sistema es extensible: puedes agregar más permisos y rutas según sea necesario

## ✨ Resultado Final

Después de aplicar esta solución:
- ✅ Los usuarios comunes pueden navegar productos
- ✅ Los usuarios comunes pueden ver detalles de productos
- ✅ Los usuarios comunes pueden agregar al carrito
- ✅ Los usuarios comunes pueden hacer checkout
- ✅ Los usuarios comunes siguen sin poder acceder a secciones de admin (orders, analytics, etc.)
- ✅ Los administradores mantienen acceso completo a todo
