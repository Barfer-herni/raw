# Separación de Usuarios: `users` vs `users_gestor`

## 📋 Descripción

Se ha implementado una separación de usuarios en dos tablas diferentes en MongoDB para distinguir entre:

- **`users`** - Usuarios que se registran por su cuenta (clientes/compradores)
- **`users_gestor`** - Usuarios creados manualmente por el admin (staff/gestión)

## 🎯 Objetivo

Separar claramente los usuarios que son clientes de los usuarios que son parte del equipo de gestión, facilitando:

1. **Gestión diferenciada**: Diferentes flujos y permisos para cada tipo
2. **Reportes y análisis**: Distinguir fácilmente entre clientes y staff
3. **Seguridad**: Aislar usuarios de gestión de usuarios públicos
4. **Escalabilidad**: Permitir diferentes estructuras de datos en el futuro

## 🏗️ Arquitectura

### Tabla `users` (Clientes)
**Origen**: Registro público a través de `/sign-up`

**Permisos típicos**:
- `account:view_own`
- `account:edit_own`
- `products:view`
- `products:purchase`
- `cart:view`
- `cart:checkout`

**Características**:
- Se registran ellos mismos
- Tienen acceso a la tienda y carrito
- No tienen acceso a funciones administrativas
- Pueden ver y editar su propio perfil

### Tabla `users_gestor` (Staff/Gestión)
**Origen**: Creados manualmente por admin en `/admin/account`

**Permisos típicos**:
- `account:view_own`
- `account:edit_own`
- `account:manage_users`
- `analytics:view`
- `clients:view`
- `table:view`, `table:edit`, `table:delete`
- `prices:view`, `prices:edit`
- `balance:view`
- `outputs:view`, `outputs:create`, `outputs:edit`, `outputs:delete`

**Características**:
- Creados por un administrador
- Tienen permisos de gestión del sistema
- Pueden tener role `admin` o `user` con permisos especiales
- Campo adicional: `createdBy` (ID del admin que lo creó)
- Campo adicional: `isGestorUser: true`

## 🔄 Flujo de Autenticación

El sistema de autenticación busca en **ambas tablas** automáticamente:

```typescript
// En loginUser()
const [regularUser, gestorUser] = await Promise.all([
    usersCollection.findOne({ email: data.email }),
    gestorUsersCollection.findOne({ email: data.email })
]);

const user = regularUser || gestorUser;
```

Esto significa que:
- ✅ Los usuarios de ambas tablas pueden iniciar sesión normalmente
- ✅ No hay diferencia en la experiencia de login
- ✅ Los permisos se manejan igual para ambos tipos

## 📁 Archivos Modificados

### Nuevos Archivos

1. **`/packages/data-services/src/services/gestorUsersService.ts`**
   - Servicio completo para manejar usuarios de gestión
   - Funciones: `createGestorUser`, `getAllGestorUsers`, `getGestorUserById`, etc.

2. **`/scripts/migrate-to-users-gestor.ts`**
   - Script de migración para mover usuarios existentes
   - Identifica automáticamente usuarios de gestión vs clientes

3. **`/docs/users-gestor-separation.md`**
   - Esta documentación

### Archivos Modificados

1. **`/packages/data-services/src/services/authService.ts`**
   - `loginUser()` - Busca en ambas tablas
   - `getCurrentUser()` - Busca en ambas tablas

2. **`/packages/data-services/src/services/index.ts`**
   - Exporta funciones del nuevo `gestorUsersService`

3. **`/apps/app/app/[locale]/(authenticated)/admin/account/actions.ts`**
   - `createUser()` - Usa `createGestorUser`
   - `updateUser()` - Usa `updateGestorUser`
   - `deleteUser()` - Usa `deleteGestorUser`

4. **`/apps/app/app/[locale]/(authenticated)/admin/account/page.tsx`**
   - Usa `getAllUsersIncludingGestor()` para mostrar todos los usuarios

5. **`/package.json`**
   - Nuevo script: `migrate-users-gestor`

## 🚀 Cómo Usar

### Para Usuarios Nuevos

**No requiere ningún cambio**. El sistema automáticamente:

- Guarda registros nuevos en `users`
- Guarda usuarios creados por admin en `users_gestor`
- Ambos pueden iniciar sesión normalmente

### Para Migrar Usuarios Existentes

Ejecutar el script de migración:

```bash
cd raw
pnpm migrate-users-gestor
```

El script:
1. ✅ Identifica usuarios de gestión automáticamente
2. ✅ Los mueve de `users` a `users_gestor`
3. ✅ Preserva todos los datos
4. ✅ Genera un reporte detallado
5. ✅ Es seguro ejecutarlo múltiples veces

### Criterios de Identificación

El script identifica un usuario como "de gestión" si:

- **Es admin** (`role: 'admin'`), O
- **Tiene permisos de gestión** Y **NO tiene permisos de cliente**

**Permisos de gestión**:
- `analytics:view`
- `clients:view`
- `table:view`, `table:edit`
- `prices:view`
- `balance:view`
- `outputs:view`, `outputs:create`, `outputs:edit`
- `account:manage_users`

**Permisos de cliente**:
- `products:view`
- `products:purchase`
- `cart:view`
- `cart:checkout`

## 📊 Ejemplo de Migración

### Antes de la Migración

**Tabla `users`**:
```javascript
// Usuario admin (será migrado)
{
  _id: ObjectId("..."),
  name: "Admin",
  email: "admin@barfer.com",
  role: "admin",
  permissions: ["analytics:view", "clients:view", ...]
}

// Usuario de gestión (será migrado)
{
  _id: ObjectId("..."),
  name: "Empleado",
  email: "empleado@barfer.com",
  role: "user",
  permissions: ["table:view", "table:edit", "outputs:create", ...]
}

// Cliente (permanece)
{
  _id: ObjectId("..."),
  name: "Cliente",
  email: "cliente@example.com",
  role: "user",
  permissions: ["account:view_own", "products:view", "cart:checkout", ...]
}
```

### Después de la Migración

**Tabla `users`** (solo clientes):
```javascript
{
  _id: ObjectId("..."),
  name: "Cliente",
  email: "cliente@example.com",
  role: "user",
  permissions: ["account:view_own", "products:view", "cart:checkout", ...]
}
```

**Tabla `users_gestor`** (staff):
```javascript
// Admin migrado
{
  _id: ObjectId("nuevo-id-1"),
  name: "Admin",
  email: "admin@barfer.com",
  role: "admin",
  permissions: ["analytics:view", "clients:view", ...],
  isGestorUser: true,
  migratedAt: ISODate("2026-01-20T..."),
  originalId: "id-anterior"
}

// Empleado migrado
{
  _id: ObjectId("nuevo-id-2"),
  name: "Empleado",
  email: "empleado@barfer.com",
  role: "user",
  permissions: ["table:view", "table:edit", "outputs:create", ...],
  isGestorUser: true,
  migratedAt: ISODate("2026-01-20T..."),
  originalId: "id-anterior"
}
```

## 🔍 Verificación

### Verificar usuarios en MongoDB

```javascript
// Ver usuarios clientes
db.users.find({}, { name: 1, email: 1, role: 1, permissions: 1 })

// Ver usuarios de gestión
db.users_gestor.find({}, { name: 1, email: 1, role: 1, permissions: 1, isGestorUser: 1 })

// Contar usuarios
db.users.countDocuments()
db.users_gestor.countDocuments()
```

### Verificar en la aplicación

1. Ir a `/admin/account`
2. Pestaña "Gestión de Usuarios"
3. Deberías ver todos los usuarios (de ambas tablas)
4. Los usuarios de gestión tendrán permisos administrativos
5. Los clientes tendrán permisos de productos/carrito

## ⚠️ Consideraciones Importantes

### Sesiones Existentes

- **Los usuarios deben cerrar sesión y volver a iniciar** después de la migración
- Esto regenera el token con el nuevo ID de usuario
- Las sesiones antiguas seguirán funcionando temporalmente pero pueden tener problemas

### IDs de Usuario

- Los usuarios migrados reciben un **nuevo ID** en `users_gestor`
- El ID anterior se guarda en el campo `originalId`
- Si tienes referencias a IDs de usuario en otras colecciones, considera actualizarlas

### Permisos

- Los permisos se preservan exactamente como estaban
- No se modifican ni agregan permisos durante la migración
- Puedes ajustar permisos después desde el panel de admin

### Rollback

Si necesitas revertir la migración:

```javascript
// Copiar usuarios de vuelta a users
db.users_gestor.find({ migratedAt: { $exists: true } }).forEach(user => {
    const userCopy = { ...user };
    userCopy._id = ObjectId(user.originalId);
    delete userCopy.isGestorUser;
    delete userCopy.migratedAt;
    delete userCopy.originalId;
    db.users.insertOne(userCopy);
});

// Eliminar de users_gestor
db.users_gestor.deleteMany({ migratedAt: { $exists: true } });
```

## 🎨 Interfaz de Usuario

### Panel de Gestión de Usuarios

En `/admin/account` > "Gestión de Usuarios":

- ✅ Muestra usuarios de **ambas tablas**
- ✅ Permite crear nuevos usuarios de gestión
- ✅ Permite editar usuarios de gestión existentes
- ✅ Permite eliminar usuarios de gestión
- ⚠️ Los clientes (tabla `users`) **no aparecen** en este panel
- ⚠️ Para gestionar clientes, se necesitaría un panel separado

### Crear Usuario

Cuando un admin crea un usuario:
1. Se guarda en `users_gestor`
2. Se marca con `isGestorUser: true`
3. Se registra el `createdBy` (ID del admin)
4. Recibe permisos de gestión por defecto

## 📈 Beneficios

1. **Claridad**: Distinción clara entre clientes y staff
2. **Seguridad**: Aislamiento de usuarios administrativos
3. **Reportes**: Facilita análisis de clientes vs operaciones internas
4. **Escalabilidad**: Permite diferentes estructuras de datos futuras
5. **Auditoría**: Campo `createdBy` para rastrear quién creó cada usuario
6. **Flexibilidad**: Permisos personalizados por tipo de usuario

## 🔮 Futuras Mejoras

Posibles extensiones:

1. **Panel de Clientes**: Vista separada para gestionar clientes
2. **Campos Adicionales**: Agregar campos específicos para cada tipo
3. **Reportes**: Dashboards separados para clientes vs staff
4. **Notificaciones**: Diferentes tipos de notificaciones por tabla
5. **Exportación**: Exportar listas de clientes vs staff por separado

## 🆘 Solución de Problemas

### "Usuario no encontrado" después de migración

**Solución**: Cerrar sesión y volver a iniciar sesión

### Usuario no puede iniciar sesión

**Verificar**:
1. ¿El email está en alguna de las dos tablas?
2. ¿La contraseña es correcta?
3. ¿El usuario fue migrado correctamente?

```javascript
// Buscar usuario en ambas tablas
db.users.findOne({ email: "usuario@example.com" })
db.users_gestor.findOne({ email: "usuario@example.com" })
```

### Usuarios duplicados

Si un usuario aparece en ambas tablas:

```javascript
// Eliminar de users (dejar solo en users_gestor)
db.users.deleteOne({ email: "usuario@example.com" })
```

### Error al crear usuario

**Verificar**:
1. ¿El email ya existe en alguna tabla?
2. ¿El admin tiene permisos `account:manage_users`?
3. ¿Los datos del formulario son válidos?

## 📞 Contacto

Para dudas o problemas con la migración, contactar al equipo de desarrollo.

---

**Última actualización**: Enero 2026  
**Versión**: 1.0.0
