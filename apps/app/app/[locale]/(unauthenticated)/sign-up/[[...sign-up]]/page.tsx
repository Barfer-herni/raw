import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import { SignUp } from '../../components/sign-up';
import { getDictionary } from '@repo/internationalization';

const title = 'Crear Cuenta';
const description = 'Ingresa tus datos para comenzar.';

export const metadata: Metadata = createMetadata({ title, description });

const SignUpPage = async ({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
}) => {
  const { locale } = await params;
  const { error } = await searchParams;
  const dictionary = await getDictionary(locale);

  const getErrorMessage = (error: string) => {
    switch (error) {
      case 'empty-fields':
        return dictionary.app.auth.signUp.errors.emptyFields || 'Por favor completa todos los campos';
      case 'passwords-mismatch':
        return dictionary.app.auth.signUp.errors.passwordsDoNotMatch || 'Las contraseñas no coinciden';
      case 'email-exists':
        return dictionary.app.auth.signUp.errors.accountCreation || 'El email ya existe';
      case 'creation-failed':
        return dictionary.app.auth.signUp.errors.accountCreation || 'Error al crear la cuenta';
      case 'generic':
        return dictionary.app.auth.signUp.errors.generic || 'Ocurrió un error al crear la cuenta';
      default:
        return null;
    }
  };

  const errorMessage = error ? getErrorMessage(error) : null;

  return (
    <>
      <div className="flex flex-col space-y-2 text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          {dictionary.app.auth.signUp.title || title}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
        </div>
      )}

      <SignUp dictionary={dictionary} error={error} />
    </>
  );
};

export default SignUpPage;
