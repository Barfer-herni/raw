'use client';

import React, { useState, useCallback } from 'react';
import { Copy, ExternalLink, QrCode, Download } from 'lucide-react';
import QRCode from 'qrcode';

// Función auxiliar para generar URL del menú
function generateMenuUrl(slug: string, locale: string): string {
    const baseUrl = process.env.NODE_ENV === 'production'
        ? 'https://ganga-menu-app.vercel.app'
        : 'http://localhost:4000';
    return `${baseUrl}/${locale}/menu/${slug}`;
}

interface MenuShareWidgetProps {
    slug: string;
    locale: string;
    restaurantName: string;
    compact?: boolean; // Para mostrar versión compacta en otras vistas
}

export default function MenuShareWidget({ slug, locale, restaurantName, compact = false }: MenuShareWidgetProps) {
    const [copied, setCopied] = useState(false);
    const [generatingQR, setGeneratingQR] = useState(false);

    const menuUrl = generateMenuUrl(slug, locale);

    const copyToClipboard = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(menuUrl);
            setCopied(true);
            const timer = window.setTimeout(() => setCopied(false), 2000);
            return () => window.clearTimeout(timer);
        } catch (err) {
            console.error('Error copying to clipboard:', err);
            // Fallback para navegadores que no soportan clipboard API
            const textArea = document.createElement('textarea');
            textArea.value = menuUrl;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopied(true);
            const timer = window.setTimeout(() => setCopied(false), 2000);
            return () => window.clearTimeout(timer);
        }
    }, [menuUrl]);

    const generateAndDownloadQR = useCallback(async () => {
        if (generatingQR) return;

        setGeneratingQR(true);
        try {
            // Generar QR code como Data URL
            const qrDataUrl = await QRCode.toDataURL(menuUrl, {
                width: 512,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            });

            // Crear elemento para download
            const link = document.createElement('a');
            link.href = qrDataUrl;
            link.download = `menu-qr-${slug}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error generating QR code:', error);
        } finally {
            setGeneratingQR(false);
        }
    }, [menuUrl, slug, generatingQR]);

    if (compact) {
        return (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-blue-800 mb-1">
                            🔗 Enlace del Menú
                        </p>
                        <p className="text-xs text-blue-700 truncate font-mono">
                            {menuUrl}
                        </p>
                    </div>
                    <div className="flex gap-1">
                        <button
                            onClick={copyToClipboard}
                            className={`p-2 text-xs rounded-md transition-colors ${copied
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                }`}
                            title="Copiar enlace"
                        >
                            <Copy className="w-3 h-3" />
                        </button>
                        <a
                            href={menuUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md transition-colors"
                            title="Ver menú"
                        >
                            <ExternalLink className="w-3 h-3" />
                        </a>
                        <button
                            onClick={generateAndDownloadQR}
                            disabled={generatingQR}
                            className="p-2 bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:opacity-50 rounded-md transition-colors"
                            title="Descargar QR"
                        >
                            <QrCode className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-green-800 mb-3 sm:mb-4">
                🔗 Enlace de tu Menú
            </h2>
            <p className="text-xs sm:text-sm text-green-700 mb-3 sm:mb-4">
                Comparte este enlace con tus clientes para que vean tu menú de <strong>{restaurantName}</strong>
            </p>

            {/* URL del menú */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4">
                <input
                    type="text"
                    value={menuUrl}
                    readOnly
                    className="flex-1 px-3 py-2 bg-white border border-green-300 rounded-md text-green-800 font-mono text-xs sm:text-sm overflow-hidden text-ellipsis"
                />
                <div className="flex gap-2 sm:gap-3">
                    <button
                        onClick={copyToClipboard}
                        className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${copied
                                ? 'bg-green-600 text-white'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                    >
                        <Copy className="w-4 h-4 inline mr-1" />
                        {copied ? '¡Copiado!' : 'Copiar'}
                    </button>
                    <a
                        href={menuUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-center"
                    >
                        <ExternalLink className="w-4 h-4 inline mr-1" />
                        <span className="sm:hidden">Ver</span>
                        <span className="hidden sm:inline">Ver Menú</span>
                    </a>
                </div>
            </div>

            {/* Botón QR */}
            <div className="flex justify-center">
                <button
                    onClick={generateAndDownloadQR}
                    disabled={generatingQR}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium shadow-md hover:shadow-lg"
                >
                    {generatingQR ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Generando QR...
                        </>
                    ) : (
                        <>
                            <QrCode className="w-4 h-4" />
                            <Download className="w-4 h-4" />
                            Descargar Código QR
                        </>
                    )}
                </button>
            </div>

            <p className="text-xs text-green-600 text-center mt-2">
                💡 Imprime el código QR y colócalo en tu restaurante para que los clientes accedan fácilmente
            </p>
        </div>
    );
} 