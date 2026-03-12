'use client'

import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { loginWithGoogleAction } from '../actions';

interface GoogleLoginButtonProps {
    locale?: string;
}

export function GoogleLoginButton({ locale = 'es' }: GoogleLoginButtonProps) {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

    if (!clientId) return null;

    return (
        <GoogleOAuthProvider clientId={clientId}>
            <div className="flex flex-col gap-2 items-center w-full mt-6">
                <div className="relative w-full text-center py-2">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white/70 dark:bg-zinc-900 text-gray-500 rounded-full">O continuar con</span>
                    </div>
                </div>

                {error && <p className="text-red-500 text-sm mt-2 text-center bg-red-50 dark:bg-red-900/20 p-2 rounded-md w-full">{error}</p>}

                <div className="w-full mt-2">
                    <GoogleLogin
                        onSuccess={async (credentialResponse) => {
                            if (credentialResponse.credential) {
                                try {
                                    const result = await loginWithGoogleAction(credentialResponse.credential);
                                    if (result?.success) {
                                        if (result.userRole === 'admin') {
                                            router.push(`/${locale}/admin/orders`);
                                        } else {
                                            router.push(`/${locale}/user`);
                                        }
                                        router.refresh();
                                    } else {
                                        setError(result?.message || 'Error al iniciar sesión con Google');
                                    }
                                } catch (err) {
                                    setError('Error de conexión');
                                }
                            }
                        }}
                        onError={() => {
                            setError('Falló el inicio de sesión con Google');
                        }}
                        useOneTap
                        ux_mode="popup"
                        shape="rectangular"
                        theme="filled_black"
                        size="large"
                        width="100%"
                    />
                </div>
            </div>
        </GoogleOAuthProvider>
    );
}
