# Órdenes - Nueva Tabla de Gestión

## Resumen de Cambios

Se ha rediseñado completamente la página de órdenes siguiendo el estilo de la tabla de `barfer/table` para ofrecer una mejor experiencia de usuario y un diseño más profesional.

## Estructura de Archivos

```
orders/
├── page.tsx                          # Página principal con lógica de servidor
├── actions.ts                        # Server actions para CRUD de órdenes
├── constants.ts                      # Constantes y traducciones
├── types.ts                          # Tipos TypeScript
├── helpers.ts                        # Funciones auxiliares
├── components/
│   ├── columns.tsx                   # Definición de columnas de la tabla
│   ├── OrdersDataTable.tsx          # Componente principal con filtros
│   ├── OrdersTable.tsx              # Tabla con TanStack Table
│   ├── DateRangeFilter.tsx          # Filtro de rango de fechas
│   └── OrderTypeFilter.tsx          # Filtro por tipo de orden
└── README.md                        # Este archivo
```

## Características Principales

### 1. **Tabla Profesional con TanStack Table**
- Columnas bien definidas con tipos seguros
- Ordenamiento por columnas
- Paginación server-side
- Responsive design

### 2. **Filtros Avanzados**
- **Búsqueda general**: Busca en todas las columnas
- **Filtro de fechas**: Selecciona un rango de fechas
- **Filtro por tipo**: Minorista o Mayorista

### 3. **Acciones sobre Órdenes**
- **Editar**: Permite modificar órdenes (icono de lápiz)
- **Duplicar**: Crea una copia de la orden (icono de copiar)
- **Eliminar**: Elimina la orden con confirmación (icono de basura)

### 4. **Diseño Mejorado**
- Colores por día de la semana en fechas
- Estados visuales con badges
- Highlighting de filas según estado
- Colores específicos para estados importantes

### 5. **Responsive**
- Funciona bien en desktop, tablet y móvil
- Filtros se adaptan al tamaño de pantalla

## Columnas de la Tabla

1. **Tipo**: Badge indicando Minorista/Mayorista
2. **Fecha**: Fecha de creación con color por día de semana
3. **Cliente**: Nombre y email del cliente
4. **Dirección**: Dirección y ciudad
5. **Teléfono**: Número de contacto
6. **Productos**: Lista de productos (muestra los primeros 2)
7. **Pago**: Método de pago
8. **Estado**: Badge con el estado actual
9. **Total**: Monto total formateado
10. **Notas**: Notas adicionales

## Próximas Mejoras Sugeridas

- [ ] Implementar edición inline de campos
- [ ] Agregar exportación a Excel
- [ ] Implementar sistema de deshacer cambios
- [ ] Agregar creación de nuevas órdenes desde la tabla
- [ ] Implementar filtros adicionales (por producto, por monto, etc.)
- [ ] Agregar vista de detalles de orden en modal
- [ ] Implementar búsqueda de clientes mayoristas existentes

## Diferencias con el Diseño Original

El diseño anterior era una implementación en un solo archivo (`page.tsx`) con:
- Componentes en línea sin separación de responsabilidades
- Menos filtros
- Diseño menos profesional
- Sin TanStack Table

El nuevo diseño ofrece:
- Separación clara de componentes
- Código más mantenible
- Mejor experiencia de usuario
- Diseño consistente con otras partes de la aplicación

## Uso

La página se actualiza automáticamente cuando cambias filtros o realizas acciones.
Los cambios se persisten en la base de datos y se reflejan inmediatamente.

## Dependencias

- `@tanstack/react-table`: Para la tabla
- `@repo/design-system`: Para componentes UI
- `date-fns`: Para manejo de fechas
- `react-day-picker`: Para el selector de rango de fechas

