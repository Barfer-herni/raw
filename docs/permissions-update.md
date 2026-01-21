# Actualización de Permisos de Productos y Carrito

## Problema

Los usuarios comunes (role: 'user') solo tenían permisos para ver y editar su cuenta (`account:view_own`, `account:edit_own`), lo que les impedía:
- Ver productos
- Acceder a detalles de productos
- Agregar productos al carrito
- Proceder al checkout

Esto resultaba en errores de "Acceso Denegado" cuando intentaban navegar por la tienda.

## Solución

Se implementaron los siguientes cambios:

### 1. Nuevos Permisos Agregados

Se agregaron 4 nuevos permisos al sistema:

- `products:view` - Permite ver el listado y detalles de productos
- `products:purchase` - Permite comprar productos
- `cart:view` - Permite ver el carrito de compras
- `cart:checkout` - Permite proceder al checkout

### 2. Archivos Modificados

#### `/packages/auth/server-permissions.ts`
- Se agregaron los nuevos permisos al tipo `Permission`
- Se agregaron a `ADMIN_PERMISSIONS` para que los admins tengan acceso completo

#### `/apps/app/middleware.ts`
- Se actualizó `ROUTE_PERMISSIONS` para incluir:
  - `/admin/productos` - requiere `products:view`
  - `/admin/producto` - requiere `products:view` (incluye rutas dinámicas `/admin/producto/[id]`)
  - `/admin/checkout` - requiere `cart:checkout`
- Se mejoró la función `hasAccessToRoute` para manejar rutas dinámicas con prefijos

#### `/packages/data-services/src/services/authService.ts`
- Se actualizó la función `registerUser` para que los nuevos usuarios reciban automáticamente los permisos de productos y carrito

### 3. Script de Migración

Se creó el script `/scripts/add-product-permissions.ts` para actualizar usuarios existentes.

## Cómo Ejecutar el Script de Migración

### Opción 1: Usando tsx directamente
```bash
cd raw
pnpm tsx scripts/add-product-permissions.ts
```

### Opción 2: Usando node con ts-node
```bash
cd raw
npx ts-node scripts/add-product-permissions.ts
```

### Opción 3: Agregar al package.json
Agregar este script en `package.json`:
```json
{
  "scripts": {
    "migrate:product-permissions": "tsx scripts/add-product-permissions.ts"
  }
}
```

Luego ejecutar:
```bash
pnpm migrate:product-permissions
```

## Verificación

Después de ejecutar el script, puedes verificar que los usuarios fueron actualizados:

1. Revisa los logs del script para ver cuántos usuarios fueron actualizados
2. Verifica en MongoDB que los usuarios tienen los nuevos permisos:
```javascript
db.users.findOne({ role: 'user' })
```

Deberías ver algo como:
```json
{
  "_id": ObjectId("..."),
  "name": "Hernán",
  "lastName": "Fernandez",
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

## Usuarios Nuevos

Los usuarios que se registren después de estos cambios automáticamente recibirán todos los permisos necesarios, incluyendo los de productos y carrito.

## Rutas Protegidas

Las siguientes rutas ahora están configuradas con los permisos apropiados:

| Ruta | Permiso Requerido | Descripción |
|------|-------------------|-------------|
| `/admin` | `account:view_own` | Página principal del admin |
| `/admin/account` | `account:view_own` | Página de cuenta del usuario |
| `/admin/productos` | `products:view` | Listado de productos |
| `/admin/producto/[id]` | `products:view` | Detalle de producto |
| `/admin/checkout` | `cart:checkout` | Página de checkout |

## Notas Importantes

- Los administradores (role: 'admin') siempre tienen acceso completo a todas las rutas
- El middleware verifica permisos en cada request
- Las rutas no definidas en `ROUTE_PERMISSIONS` son bloqueadas por defecto para usuarios no-admin
- Los permisos se almacenan en el token de autenticación y se verifican en el servidor
