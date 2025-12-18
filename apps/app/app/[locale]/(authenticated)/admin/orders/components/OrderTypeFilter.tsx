'use client';

import { useCallback, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/design-system/components/ui/select';

export function OrderTypeFilter() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const orderTypeParam = searchParams.get('orderType') || 'all';

    const updateOrderType = useCallback((value: string) => {
        startTransition(() => {
            const params = new URLSearchParams(searchParams);
            if (value === 'all') {
                params.delete('orderType');
            } else {
                params.set('orderType', value);
            }
            params.set('page', '1');
            router.push(`${pathname}?${params.toString()}`);
        });
    }, [pathname, router, searchParams]);

    return (
        <Select value={orderTypeParam} onValueChange={updateOrderType} disabled={isPending}>
            <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Tipo de orden" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="minorista">Minorista</SelectItem>
                <SelectItem value="mayorista">Mayorista</SelectItem>
            </SelectContent>
        </Select>
    );
}

