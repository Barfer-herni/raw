'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';
import { Label } from '@repo/design-system/components/ui/label';
import { Textarea } from '@repo/design-system/components/ui/textarea';
import { useToast } from '@repo/design-system/hooks/use-toast';
import { MapPin } from 'lucide-react';
import type { Dictionary } from '@repo/internationalization';
import { updateDeliveryInfo } from '../actions';

interface DeliveryInfoSectionProps {
    currentUser: any;
    dictionary: Dictionary;
}

export function DeliveryInfoSection({ currentUser, dictionary }: DeliveryInfoSectionProps) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    const [deliveryForm, setDeliveryForm] = useState({
        phone: currentUser?.phone || '',
        street: currentUser?.address?.street || '',
        apartment: currentUser?.address?.apartment || '',
        city: currentUser?.address?.city || '',
        province: currentUser?.address?.province || '',
        postalCode: currentUser?.address?.postalCode || '',
        notes: currentUser?.address?.notes || '',
    });

    // Verificar si el usuario tiene permisos para editar su perfil
    // Cualquier usuario puede editar su propio perfil
    const canEditProfile = currentUser?.permissions?.includes('account:edit_own') || currentUser?.role === 'admin' || true;

    const handleDeliveryUpdate = async () => {
        if (!currentUser) return;

        startTransition(async () => {
            const formData = new FormData();
            formData.append('phone', deliveryForm.phone);
            formData.append('street', deliveryForm.street);
            formData.append('apartment', deliveryForm.apartment);
            formData.append('city', deliveryForm.city);
            formData.append('province', deliveryForm.province);
            formData.append('postalCode', deliveryForm.postalCode);
            formData.append('notes', deliveryForm.notes);

            const result = await updateDeliveryInfo(currentUser.id, formData);

            if (result.success) {
                toast({
                    title: "Éxito",
                    description: result.message,
                });
            } else {
                toast({
                    title: "Error",
                    description: result.message,
                    variant: "destructive",
                });
            }
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Información de Entrega
                </CardTitle>
                <CardDescription>
                    Configura tu información de contacto y dirección de entrega para facilitar tus pedidos
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="phone">Teléfono *</Label>
                        <Input
                            id="phone"
                            type="tel"
                            placeholder="Ej: +54 9 11 1234-5678"
                            value={deliveryForm.phone}
                            onChange={(e) => setDeliveryForm(prev => ({ ...prev, phone: e.target.value }))}
                            disabled={!canEditProfile || isPending}
                        />
                        <p className="text-xs text-muted-foreground">
                            Incluye código de área. Será usado para coordinar la entrega.
                        </p>
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="street">Dirección *</Label>
                        <Input
                            id="street"
                            placeholder="Ej: Av. Corrientes 1234"
                            value={deliveryForm.street}
                            onChange={(e) => setDeliveryForm(prev => ({ ...prev, street: e.target.value }))}
                            disabled={!canEditProfile || isPending}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="apartment">Piso/Departamento (Opcional)</Label>
                        <Input
                            id="apartment"
                            placeholder="Ej: 5to A, Depto 12, Casa"
                            value={deliveryForm.apartment}
                            onChange={(e) => setDeliveryForm(prev => ({ ...prev, apartment: e.target.value }))}
                            disabled={!canEditProfile || isPending}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="city">Ciudad *</Label>
                        <Input
                            id="city"
                            placeholder="Ej: Buenos Aires"
                            value={deliveryForm.city}
                            onChange={(e) => setDeliveryForm(prev => ({ ...prev, city: e.target.value }))}
                            disabled={!canEditProfile || isPending}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="province">Provincia *</Label>
                        <Input
                            id="province"
                            placeholder="Ej: Buenos Aires"
                            value={deliveryForm.province}
                            onChange={(e) => setDeliveryForm(prev => ({ ...prev, province: e.target.value }))}
                            disabled={!canEditProfile || isPending}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="postalCode">Código Postal *</Label>
                        <Input
                            id="postalCode"
                            placeholder="Ej: C1043"
                            value={deliveryForm.postalCode}
                            onChange={(e) => setDeliveryForm(prev => ({ ...prev, postalCode: e.target.value }))}
                            disabled={!canEditProfile || isPending}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="notes">Notas adicionales (Opcional)</Label>
                    <Textarea
                        id="notes"
                        placeholder="Ej: Entre las calles X e Y, portero eléctrico, timbre 3B, etc."
                        value={deliveryForm.notes}
                        onChange={(e) => setDeliveryForm(prev => ({ ...prev, notes: e.target.value }))}
                        disabled={!canEditProfile || isPending}
                        rows={3}
                    />
                    <p className="text-xs text-muted-foreground">
                        Información adicional que ayude con la entrega (referencias, horarios preferidos, etc.)
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t gap-4">
                    <div className="space-y-1">
                        <p className="text-sm font-medium">Estado de información</p>
                        <div className="flex items-center gap-2">
                            {deliveryForm.phone && deliveryForm.street && deliveryForm.city && deliveryForm.province && deliveryForm.postalCode ? (
                                <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded-full">
                                    ✓ Información completa
                                </span>
                            ) : (
                                <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-2 py-1 rounded-full">
                                    ⚠ Información incompleta
                                </span>
                            )}
                        </div>
                        {!canEditProfile && (
                            <p className="text-xs text-muted-foreground">
                                Solo lectura - Sin permisos de edición
                            </p>
                        )}
                    </div>
                    {canEditProfile && (
                        <Button
                            className="w-full sm:w-auto bg-sky-500 hover:bg-sky-600"
                            onClick={handleDeliveryUpdate}
                            disabled={isPending}
                        >
                            {isPending ? 'Guardando...' : 'Guardar Información de Entrega'}
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
