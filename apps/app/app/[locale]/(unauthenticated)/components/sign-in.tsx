import { redirect } from 'next/navigation';
import { loginWithSession } from '@repo/auth/server';
import { Dictionary } from '@repo/internationalization';
import { SignInButton } from './SignInButton';
import Link from 'next/link';

interface SignInProps {
    dictionary?: Dictionary;
}

async function handleSignIn(formData: FormData) {
    'use server';

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
        redirect('/sign-in?error=empty-fields');
        return;
    }

    try {
        const result = await loginWithSession({ email, password });

        if (result.success) {
            // Redirigir según el rol del usuario
            const userRole = result.user?.role || 'user';
            if (userRole === 'admin') {
                redirect('/admin');
            } else {
                redirect('/'); // Usuarios normales van a la página de inicio
            }
        } else {
            redirect('/sign-in?error=invalid-credentials');
        }
    } catch (err) {
        // No capturar NEXT_REDIRECT como error
        if (err instanceof Error && err.message.includes('NEXT_REDIRECT')) {
            throw err; // Re-throw para que Next.js maneje el redirect
        }
        console.error('Sign in error:', err);
    }
}

export const SignIn = ({ dictionary }: SignInProps) => {
    return (
        <div className="grid gap-6">
            <form action={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-gray-900 dark:text-white">
                        {dictionary?.app?.auth?.signIn?.email || 'Correo Electrónico'}
                    </label>
                    <input
                        name="email"
                        type="email"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-barfer-green/50 focus:border-barfer-green transition-all duration-200"
                        placeholder="correo@ejemplo.com"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium text-gray-900 dark:text-white">
                        {dictionary?.app?.auth?.signIn?.password || 'Contraseña'}
                    </label>
                    <input
                        name="password"
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-barfer-green/50 focus:border-barfer-green transition-all duration-200"
                        placeholder="••••••••"
                        required
                    />
                </div>

                <SignInButton dictionary={dictionary} />
            </form>

            {/* Navigation to Sign Up */}
            <div className="text-center">
                <Link
                    href="/sign-up"
                    className="text-sm text-barfer-green hover:text-barfer-green/80 dark:text-barfer-green dark:hover:text-barfer-green/80 transition-colors font-medium"
                >
                    {dictionary?.app?.auth?.signIn?.goToSignUp || '¿No tienes cuenta? Crear cuenta'}
                </Link>
            </div>
        </div>
    );
}; 