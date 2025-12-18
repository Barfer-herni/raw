'use client';

import { useCallback, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@repo/design-system/components/ui/button';
import { Calendar } from '@repo/design-system/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@repo/design-system/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';

export function DateRangeFilter() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');

    const dateRange: DateRange = {
        from: fromParam ? new Date(fromParam) : undefined,
        to: toParam ? new Date(toParam) : undefined,
    };

    const updateDateRange = useCallback((range: DateRange | undefined) => {
        startTransition(() => {
            const params = new URLSearchParams(searchParams);
            if (range?.from) {
                params.set('from', format(range.from, 'yyyy-MM-dd'));
            } else {
                params.delete('from');
            }
            if (range?.to) {
                params.set('to', format(range.to, 'yyyy-MM-dd'));
            } else {
                params.delete('to');
            }
            params.set('page', '1');
            router.push(`${pathname}?${params.toString()}`);
        });
    }, [pathname, router, searchParams]);

    const clearDateRange = useCallback(() => {
        updateDateRange(undefined);
    }, [updateDateRange]);

    return (
        <div className="flex items-center gap-2">
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className="w-[260px] justify-start text-left font-normal"
                        disabled={isPending}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.from ? (
                            dateRange.to ? (
                                <>
                                    {format(dateRange.from, 'dd MMM yyyy', { locale: es })} -{' '}
                                    {format(dateRange.to, 'dd MMM yyyy', { locale: es })}
                                </>
                            ) : (
                                format(dateRange.from, 'dd MMM yyyy', { locale: es })
                            )
                        ) : (
                            <span>Filtrar por fecha</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange.from}
                        selected={dateRange}
                        onSelect={updateDateRange}
                        numberOfMonths={2}
                        locale={es}
                    />
                </PopoverContent>
            </Popover>
            {(dateRange.from || dateRange.to) && (
                <Button
                    variant="ghost"
                    onClick={clearDateRange}
                    disabled={isPending}
                    className="px-2"
                >
                    Limpiar
                </Button>
            )}
        </div>
    );
}

