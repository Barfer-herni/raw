'use client'

import { useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Dictionary } from '@repo/internationalization';
import { BalanceMonthlyData } from '@repo/data-services';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@repo/design-system/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Button } from '@repo/design-system/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/design-system/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@repo/design-system/components/ui/select';
import { Download, TrendingUp, TrendingDown, DollarSign, Package, Users, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface BalanceTableProps {
    data: BalanceMonthlyData[];
    dictionary: Dictionary;
    selectedYear?: number;
}

export function BalanceTable({ data, dictionary, selectedYear }: BalanceTableProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const [filteredData, setFilteredData] = useState(data);

    const currentYear = new Date().getFullYear();
    const displayYear = selectedYear || currentYear;

    // Generar lista de años disponibles (desde 2020 hasta el año actual)
    const availableYears = Array.from({ length: currentYear - 2019 }, (_, i) => currentYear - i);

    const handleYearChange = (year: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (year && year !== currentYear.toString()) {
            params.set('year', year);
        } else {
            params.delete('year');
        }
        // Usar window.location para forzar recarga completa
        window.location.href = `${pathname}?${params.toString()}`;
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatAxisValue = (value: number) => {
        if (value >= 1000000) {
            return `${(value / 1000000).toFixed(1)}M`;
        } else if (value >= 1000) {
            return `${(value / 1000).toFixed(1)}K`;
        }
        return value.toString();
    };

    const formatPercentage = (percentage: number) => {
        const color = percentage >= 0 ? 'text-green-600' : 'text-red-600';
        const sign = percentage >= 0 ? '+' : '';
        return (
            <span className={`font-medium ${color}`}>
                {sign}{percentage.toFixed(1)}%
            </span>
        );
    };

    const formatMonthName = (monthKey: string) => {
        const [year, month] = monthKey.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return date.toLocaleDateString('es-AR', {
            year: 'numeric',
            month: 'short'
        }).replace('.', '');
    };

    const getRowColor = (resultadoSinExtraordinarios: number, resultadoConExtraordinarios: number) => {
        // Usar el resultado sin extraordinarios para el color principal
        if (resultadoSinExtraordinarios > 0) return 'bg-green-50/50 hover:bg-green-100/50 border-l-4 border-l-green-500';
        if (resultadoSinExtraordinarios < 0) return 'bg-red-50/50 hover:bg-red-100/50 border-l-4 border-l-red-500';
        return 'hover:bg-muted/30 border-l-4 border-l-gray-300';
    };

    return (
        <div className="space-y-6">
            {/* Header con controles */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-green-600" />
                            <span>Balance Financiero</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Año:</span>
                            <Select
                                value={displayYear.toString()}
                                onValueChange={handleYearChange}
                            >
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableYears.map((year) => (
                                        <SelectItem key={year} value={year.toString()}>
                                            {year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-2" />
                                Exportar
                            </Button>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Análisis mensual de ingresos y gastos del negocio para el año {displayYear}.
                        <span className="text-green-600 font-medium"> Verde</span> = ganancias,
                        <span className="text-red-600 font-medium"> Rojo</span> = pérdidas.
                    </p>
                </CardContent>
            </Card>

            {/* Tabla Resumen - Simplificada */}
            <div className="space-y-6">
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/30">
                                        <TableHead className="font-bold w-32 text-center">Mes</TableHead>
                                        <TableHead className="text-center font-bold w-32">
                                            <div className="flex items-center justify-center gap-1">
                                                <TrendingUp className="h-4 w-4 text-green-600" />
                                                <span>Ingresos</span>
                                            </div>
                                        </TableHead>
                                        <TableHead className="text-center font-bold w-32">
                                            <div className="flex items-center justify-center gap-1">
                                                <TrendingDown className="h-4 w-4 text-blue-600" />
                                                <span>Salidas Ord.</span>
                                            </div>
                                        </TableHead>
                                        <TableHead className="text-center font-bold w-32">
                                            <div className="flex items-center justify-center gap-1">
                                                <AlertTriangle className="h-4 w-4 text-orange-600" />
                                                <span>Salidas Extra.</span>
                                            </div>
                                        </TableHead>
                                        <TableHead className="text-center font-bold w-40">
                                            <div className="flex items-center justify-center gap-1">
                                                <DollarSign className="h-4 w-4 text-green-600" />
                                                <span>Resultado Sin Extra.</span>
                                            </div>
                                        </TableHead>
                                        <TableHead className="text-center font-bold w-40">
                                            <div className="flex items-center justify-center gap-1">
                                                <DollarSign className="h-4 w-4 text-blue-600" />
                                                <span>Resultado Con Extra.</span>
                                            </div>
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {filteredData.map((row) => (
                                        <TableRow key={row.mes} className={`${getRowColor(row.resultadoSinExtraordinarios, row.resultadoConExtraordinarios)} transition-colors`}>
                                            {/* Mes */}
                                            <TableCell className="font-medium text-center">
                                                <div className="text-sm">
                                                    {formatMonthName(row.mes)}
                                                </div>
                                            </TableCell>

                                            {/* Ingresos Totales */}
                                            <TableCell className="text-center">
                                                <div className="font-mono font-bold text-green-700">
                                                    {formatCurrency(row.entradasTotales)}
                                                </div>
                                            </TableCell>

                                            {/* Salidas Ordinarias */}
                                            <TableCell className="text-center">
                                                <div className="font-mono font-medium text-red-600">
                                                    {formatCurrency(row.gastosOrdinariosTotal)}
                                                </div>
                                            </TableCell>

                                            {/* Salidas Extraordinarias */}
                                            <TableCell className="text-center">
                                                <div className="font-mono font-medium text-red-600">
                                                    {formatCurrency(row.gastosExtraordinariosTotal)}
                                                </div>
                                            </TableCell>

                                            {/* Resultado Sin Extraordinarios */}
                                            <TableCell className="text-center">
                                                <div className="space-y-1">
                                                    <div className={`font-mono font-bold text-lg ${row.resultadoSinExtraordinarios >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {formatCurrency(row.resultadoSinExtraordinarios)}
                                                    </div>
                                                    <div className="text-xs">
                                                        {formatPercentage(row.porcentajeSinExtraordinarios)}
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* Resultado Con Extraordinarios */}
                                            <TableCell className="text-center">
                                                <div className="space-y-1">
                                                    <div className={`font-mono font-bold text-lg ${row.resultadoConExtraordinarios >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {formatCurrency(row.resultadoConExtraordinarios)}
                                                    </div>
                                                    <div className="text-xs">
                                                        {formatPercentage(row.porcentajeConExtraordinarios)}
                                                    </div>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {filteredData.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground">
                                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                                <p className="text-lg font-medium">No hay datos de balance</p>
                                <p className="text-sm">No se encontraron registros para el período seleccionado.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Resumen en tarjetas - Simplificado */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-green-800">Total Ingresos</p>
                                <p className="text-2xl font-bold text-green-700">
                                    {formatCurrency(filteredData.reduce((sum, row) => sum + row.entradasTotales, 0))}
                                </p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-red-800">Total Gastos (Ord. + Extra.)</p>
                                <p className="text-2xl font-bold text-red-700">
                                    {formatCurrency(filteredData.reduce((sum, row) => sum + row.salidas, 0))}
                                </p>
                            </div>
                            <TrendingDown className="h-8 w-8 text-red-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className={`bg-gradient-to-br ${filteredData.reduce((sum, row) => sum + row.resultadoSinExtraordinarios, 0) >= 0
                    ? 'from-emerald-50 to-emerald-100 border-emerald-200'
                    : 'from-red-50 to-red-100 border-red-200'
                    }`}>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <p className={`text-sm font-medium ${filteredData.reduce((sum, row) => sum + row.resultadoSinExtraordinarios, 0) >= 0
                                    ? 'text-emerald-800'
                                    : 'text-red-800'
                                    }`}>
                                    Resultado (Sin Extra.)
                                </p>
                                <p className={`text-2xl font-bold ${filteredData.reduce((sum, row) => sum + row.resultadoSinExtraordinarios, 0) >= 0
                                    ? 'text-emerald-700'
                                    : 'text-red-700'
                                    }`}>
                                    {formatCurrency(filteredData.reduce((sum, row) => sum + row.resultadoSinExtraordinarios, 0))}
                                </p>
                            </div>
                            <DollarSign className={`h-8 w-8 ${filteredData.reduce((sum, row) => sum + row.resultadoSinExtraordinarios, 0) >= 0
                                ? 'text-emerald-600'
                                : 'text-red-600'
                                }`} />
                        </div>
                    </CardContent>
                </Card>

                <Card className={`bg-gradient-to-br ${filteredData.reduce((sum, row) => sum + row.resultadoConExtraordinarios, 0) >= 0
                    ? 'from-blue-50 to-blue-100 border-blue-200'
                    : 'from-red-50 to-red-100 border-red-200'
                    }`}>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <p className={`text-sm font-medium ${filteredData.reduce((sum, row) => sum + row.resultadoConExtraordinarios, 0) >= 0
                                    ? 'text-blue-800'
                                    : 'text-red-800'
                                    }`}>
                                    Resultado (Con Extra.)
                                </p>
                                <p className={`text-2xl font-bold ${filteredData.reduce((sum, row) => sum + row.resultadoConExtraordinarios, 0) >= 0
                                    ? 'text-blue-700'
                                    : 'text-red-700'
                                    }`}>
                                    {formatCurrency(filteredData.reduce((sum, row) => sum + row.resultadoConExtraordinarios, 0))}
                                </p>
                            </div>
                            <DollarSign className={`h-8 w-8 ${filteredData.reduce((sum, row) => sum + row.resultadoConExtraordinarios, 0) >= 0
                                ? 'text-blue-600'
                                : 'text-red-600'
                                }`} />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 