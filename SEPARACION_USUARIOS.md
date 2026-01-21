# ✅ Implementación: Separación de Usuarios en Tablas Diferentes

## 🎯 Objetivo Cumplido

Se ha implementado exitosamente la separación de usuarios en dos tablas MongoDB diferentes:

- **`users`** → Usuarios que se registran por su cuenta (clientes)
- **`users_gestor`** → Usuarios creados manualmente por el admin (staff/gestión)

## 📦 ¿Qué se Implementó?

### 1. Nuevo Servicio: `gestorUsersService.ts`

Ubicación: `/packages/data-services/src/services/gestorUsersService.ts`

**Funciones principales**:
- ✅ `createGestorUser()` - Crear usuario de gestión
- ✅ `getAllGestorUsers()` - Obtener todos los usuarios de gestión
- ✅ `getGestorUserById()` - Obtener usuario por ID
- ✅ `getGestorUserByEmail()` - Obtener usuario por email
- ✅ `updateGestorUser()` - Actualizar usuario de gestión
- ✅ `deleteGestorUser()` - Eliminar usuario de gestión
- ✅ `getAllUsersIncludingGestor()` - Obtener todos (users + users_gestor)

### 2. Autenticación Actualizada

**Modificaciones en `authService.ts`**:
- ✅ `loginUser()` - Busca en ambas tablas automáticamente
- ✅ `getCurrentUser()` - Busca en ambas tablas automáticamente

**Resultado**: Los usuarios de ambas tablas pueden iniciar sesión sin problemas.

### 3. Panel de Admin Actualizado

**Modificaciones en `/admin/account`**:
- ✅ `actions.ts` - Usa funciones de `gestorUsersService`
- ✅ `page.tsx` - Muestra usuarios de ambas tablas
- ✅ `UsersSection.tsx` - Sin cambios necesarios (funciona automáticamente)

**Resultado**: El admin puede crear, editar y eliminar usuarios de gestión desde el panel.

### 4. Script de Migración

Ubicación: `/scripts/migrate-to-users-gestor.ts`

**Funcionalidad**:
- ✅ Identifica automáticamente usuarios de gestión vs clientes
- ✅ Mueve usuarios de gestión de `users` a `users_gestor`
- ✅ Preserva todos los datos
- ✅ Genera reporte detallado
- ✅ Seguro ejecutar múltiples veces

### 5. Documentación Completa

- ✅ `/docs/users-gestor-separation.md` - Documentación técnica completa
- ✅ `SEPARACION_USUARIOS.md` - Este resumen ejecutivo

## 🚀 Cómo Usar

### Para Nuevos Usuarios

**No requiere cambios**. El sistema automáticamente:

1. **Registro público** (`/sign-up`) → guarda en `users`
2. **Creación por admin** (`/admin/account`) → guarda en `users_gestor`
3. **Login** → busca en ambas tablas automáticamente

### Para Migrar Usuarios Existentes

```bash
cd raw
pnpm migrate-users-gestor
```

**El script automáticamente**:
1. Identifica usuarios de gestión (admins + usuarios con permisos de gestión)
2. Los mueve de `users` a `users_gestor`
3. Muestra un reporte detallado
4. Los clientes permanecen en `users`

## 📊 Diferencias Entre Tablas

| Característica | `users` (Clientes) | `users_gestor` (Staff) |
|---------------|-------------------|----------------------|
| **Origen** | Registro público | Creado por admin |
| **Permisos típicos** | productos, carrito | gestión, analytics, órdenes |
| **Acceso a** | Tienda, checkout | Panel administrativo |
| **Campo especial** | - | `isGestorUser: true`, `createdBy` |
| **Role común** | `user` | `admin` o `user` con permisos |

## 🔄 Flujo de Trabajo

### Escenario 1: Cliente se Registra

```
Usuario → /sign-up → registerUser() → users (MongoDB)
```

**Permisos automáticos**:
- `account:view_own`
- `account:edit_own`
- `products:view`
- `products:purchase`
- `cart:view`
- `cart:checkout`

### Escenario 2: Admin Crea Usuario de Gestión

```
Admin → /admin/account → createGestorUser() → users_gestor (MongoDB)
```

**Permisos configurables**:
- Permisos de gestión personalizados
- Puede ser `admin` o `user` con permisos especiales

### Escenario 3: Usuario Inicia Sesión

```
Usuario → /sign-in → loginUser() → busca en users Y users_gestor → éxito
```

**Transparente para el usuario**: No sabe en qué tabla está, simplemente inicia sesión.

## 📁 Archivos Creados/Modificados

### Nuevos Archivos

| Archivo | Descripción |
|---------|-------------|
| `/packages/data-services/src/services/gestorUsersService.ts` | Servicio completo para usuarios de gestión |
| `/scripts/migrate-to-users-gestor.ts` | Script de migración automática |
| `/docs/users-gestor-separation.md` | Documentación técnica detallada |
| `SEPARACION_USUARIOS.md` | Este resumen ejecutivo |

### Archivos Modificados

| Archivo | Cambios |
|---------|---------|
| `/packages/data-services/src/services/authService.ts` | Login y getCurrentUser buscan en ambas tablas |
| `/packages/data-services/src/services/index.ts` | Exporta funciones de gestorUsersService |
| `/apps/app/app/[locale]/(authenticated)/admin/account/actions.ts` | Usa funciones de gestorUsersService |
| `/apps/app/app/[locale]/(authenticated)/admin/account/page.tsx` | Muestra usuarios de ambas tablas |
| `/package.json` | Nuevo script: `migrate-users-gestor` |

## ✅ Checklist de Implementación

- [x] Crear servicio `gestorUsersService.ts`
- [x] Actualizar `authService.ts` para buscar en ambas tablas
- [x] Actualizar acciones del admin para usar `gestorUsersService`
- [x] Actualizar página de account para mostrar ambas tablas
- [x] Crear script de migración
- [x] Agregar script a `package.json`
- [x] Crear documentación técnica completa
- [x] Crear resumen ejecutivo

## 🎉 Beneficios

1. **Separación clara**: Clientes vs Staff
2. **Seguridad**: Aislamiento de usuarios administrativos
3. **Escalabilidad**: Diferentes estructuras de datos futuras
4. **Auditoría**: Campo `createdBy` para rastrear creación
5. **Reportes**: Facilita análisis separados
6. **Flexibilidad**: Permisos personalizados por tipo

## ⚠️ Importante

### Después de Ejecutar la Migración

1. **Usuarios deben cerrar sesión y volver a iniciar**
   - Esto regenera el token con el nuevo ID
   - Necesario para que el sistema funcione correctamente

2. **Verificar la migración**
   ```javascript
   // En MongoDB
   db.users.countDocuments()          // Clientes
   db.users_gestor.countDocuments()   // Staff
   ```

3. **Verificar en la aplicación**
   - Ir a `/admin/account`
   - Pestaña "Gestión de Usuarios"
   - Deberías ver todos los usuarios de gestión

## 🔮 Próximos Pasos (Opcional)

Posibles mejoras futuras:

1. **Panel de Clientes**: Vista separada para gestionar clientes
2. **Campos Adicionales**: Agregar campos específicos para cada tipo
3. **Reportes Separados**: Dashboards para clientes vs staff
4. **Notificaciones**: Diferentes tipos por tabla
5. **Exportación**: Exportar listas separadas

## 📞 Soporte

Para ejecutar la migración o resolver dudas:

1. Leer documentación completa en `/docs/users-gestor-separation.md`
2. Ejecutar: `pnpm migrate-users-gestor`
3. Verificar resultados en MongoDB y en la aplicación

---

**Estado**: ✅ Implementación Completa  
**Fecha**: Enero 2026  
**Versión**: 1.0.0
