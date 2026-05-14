'use client';

import { useCallback, useTransition, useState, useEffect } from 'react';
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

    // Interpret the URL params as local dates (or Argentina time conceptually)
    // To avoid timezone shift issues in the picker, we just use the date string "YYYY-MM-DD" and parse it to local midnight.
    // By splitting and passing to new Date(year, month, day), we ensure it's treated as local time without shifting.
    const parseDate = (dateStr: string | null) => {
        if (!dateStr) return undefined;
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day);
    };

    const dateRange: DateRange = {
        from: parseDate(fromParam),
        to: parseDate(toParam),
    };

    const [localRange, setLocalRange] = useState<DateRange | undefined>(dateRange);
    const [isOpen, setIsOpen] = useState(false);

    // Sync local range when URL params change
    useEffect(() => {
        setLocalRange(dateRange);
    }, [fromParam, toParam]);

    const updateDateRange = useCallback((range: DateRange | undefined) => {
        startTransition(() => {
            const params = new URLSearchParams(searchParams.toString());
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

    const handleSelect = (range: DateRange | undefined) => {
        setLocalRange(range);
        // Si ya seleccionó ambos, aplicamos y cerramos
        if (range?.from && range?.to) {
            updateDateRange(range);
            setIsOpen(false);
        }
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) {
            // Al cerrar el popover, si hay cambios, aplicamos
            if (
                localRange?.from?.getTime() !== dateRange.from?.getTime() ||
                localRange?.to?.getTime() !== dateRange.to?.getTime()
            ) {
                updateDateRange(localRange);
            }
        } else {
            // Al abrir, reseteamos al estado actual de la URL
            setLocalRange(dateRange);
        }
    };

    const clearDateRange = useCallback(() => {
        setLocalRange(undefined);
        updateDateRange(undefined);
        setIsOpen(false);
    }, [updateDateRange]);

    const setToday = useCallback(() => {
        const today = new Date();
        const range = { from: today, to: today };
        setLocalRange(range);
        updateDateRange(range);
        setIsOpen(false);
    }, [updateDateRange]);

    const isToday = localRange?.from && localRange?.to &&
        format(localRange.from, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') &&
        format(localRange.to, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

    return (
        <div className="flex items-center gap-2">
            <Popover open={isOpen} onOpenChange={handleOpenChange}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className="w-[260px] justify-start text-left font-normal"
                        disabled={isPending}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {localRange?.from ? (
                            localRange.to ? (
                                <>
                                    {format(localRange.from, 'dd MMM yyyy', { locale: es })} -{' '}
                                    {format(localRange.to, 'dd MMM yyyy', { locale: es })}
                                </>
                            ) : (
                                format(localRange.from, 'dd MMM yyyy', { locale: es })
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
                        defaultMonth={localRange?.from || dateRange.from}
                        selected={localRange}
                        onSelect={handleSelect}
                        numberOfMonths={1}
                        locale={es}
                    />
                    <div className="p-3 border-t flex justify-start">
                        <Button
                            variant={isToday ? "default" : "outline"}
                            onClick={setToday}
                            disabled={isPending}
                            className="w-auto"
                            size="sm"
                        >
                            📅 Hoy
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>

            {
                (dateRange.from || dateRange.to) && (
                    <Button
                        variant="ghost"
                        onClick={clearDateRange}
                        disabled={isPending}
                        className="px-2"
                    >
                        Limpiar
                    </Button>
                )
            }
        </div>
    );
}
