'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, X } from 'lucide-react';

interface CartNotificationProps {
    isVisible: boolean;
    productName: string;
    quantity: number;
    onClose: () => void;
}

export function CartNotification({ isVisible, productName, quantity, onClose }: CartNotificationProps) {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000); // Auto-close after 3 seconds

            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    if (!isVisible) return null;

    return (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-right duration-300">
            <div className="bg-white border border-green-200 rounded-xl shadow-lg p-4 max-w-sm">
                <div className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="font-medium text-gray-900">
                            ¡Agregado al carrito!
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                            {quantity} x {productName}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
