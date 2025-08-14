# @repo/data-services

Paquete que proporciona servicios de acceso a datos para toda la aplicación, centralizando la lógica de acceso a la base de datos para mejorar la reutilización de código entre diferentes partes de la aplicación.

## Características

- Acceso centralizado a datos para Planes, Promociones, Servicios y Complementos
- Reutilizable en cualquier aplicación del monorepo
- Tipado completo para una experiencia de desarrollo segura
- Separación de responsabilidades entre acceso a datos y lógica de UI

## Uso con Server Components (Next.js 15)

Simplemente importa las funciones directamente en tus Server Components:

```tsx
// En un Server Component (app/page.tsx, app/dashboard/page.tsx, etc.)
import { getAllPlans } from '@repo/data-services';

export default async function PlansPage() {
  const plans = await getAllPlans();
  
  return (
    <div>
      <h1>Planes disponibles</h1>
      <ul>
        {plans.map(plan => (
          <li key={plan.id}>{plan.name} - ${plan.price}</li>
        ))}
      </ul>
    </div>
  );
}
```

## Uso con Server Actions

Para componentes client-side que necesitan realizar acciones, usa Server Actions que encapsulen los servicios de datos:

```tsx
// En un archivo de server actions (app/actions.ts)
'use server'

import { revalidatePath } from 'next/cache';
import { createPlan, type PlanFormData } from '@repo/data-services';

export async function handleCreatePlan(data: PlanFormData) {
  await createPlan(data);
  revalidatePath('/dashboard');
}
```

Y luego en tu componente client:

```tsx
'use client'

import { handleCreatePlan } from '../actions';

export function PlanForm() {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    await handleCreatePlan({
      name: formData.get('name') as string,
      price: parseFloat(formData.get('price') as string),
      // ... otros campos
    });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* campos del formulario */}
    </form>
  );
}
```

## Estructura de carpetas

```
src/
  ├── services/        # Funciones de acceso a datos
  │   ├── planService.ts
  │   ├── promotionService.ts
  │   ├── serviceService.ts
  │   └── addonService.ts
  ├── types/           # Tipos compartidos
  │   ├── plan.ts
  │   ├── promotion.ts
  │   ├── service.ts
  │   └── addon.ts
  └── index.ts         # Punto de entrada
```

## Contribuir

Para agregar nuevos servicios:

1. Crea un nuevo archivo en la carpeta `src/services/`
2. Define los tipos relacionados en `src/types/`
3. Exporta las funciones y tipos en `src/index.ts`
4. Ejecuta `pnpm build` para compilar el paquete 