/**
 * Sesión basada en JWT firmado (HS256).
 *
 * Este módulo NO debe importar nada que no sea Edge-runtime safe
 * (sin `next/headers`, sin `mongodb`, sin `bcryptjs`, etc.), porque
 * los middlewares de Next.js corren en el Edge Runtime y lo consumen
 * directamente.
 *
 * El secreto se lee de `SESSION_SECRET` (o `JWT_SECRET` como fallback
 * por compatibilidad). Si no está definido o es demasiado corto, las
 * funciones lanzan en lugar de degradarse a un estado inseguro.
 */

import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

export const SESSION_COOKIE_NAME = 'auth-token';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 días
const ALGORITHM = 'HS256';
const MIN_SECRET_LENGTH = 32;

export interface SessionPayload {
    id: string;
    userId: string;
    email?: string;
    name?: string;
    role?: string;
    permissions?: string[];
}

let cachedSecret: Uint8Array | null = null;
let cachedSecretSource: string | null = null;

function getSecret(): Uint8Array {
    const secret = process.env.SESSION_SECRET || process.env.JWT_SECRET;

    if (!secret) {
        throw new Error(
            'SESSION_SECRET (o JWT_SECRET) no está definido. ' +
            'Configurá una clave de al menos 32 caracteres para firmar la sesión.'
        );
    }

    if (secret.length < MIN_SECRET_LENGTH) {
        throw new Error(
            `SESSION_SECRET es demasiado corto (${secret.length} chars). ` +
            `Se requiere un mínimo de ${MIN_SECRET_LENGTH} caracteres.`
        );
    }

    if (cachedSecret && cachedSecretSource === secret) {
        return cachedSecret;
    }

    cachedSecret = new TextEncoder().encode(secret);
    cachedSecretSource = secret;
    return cachedSecret;
}

/**
 * Firma un payload de sesión y devuelve el JWT.
 * El TTL coincide con el `maxAge` de la cookie para que la cookie
 * caduque al mismo tiempo que el token (no se confía solo en la cookie).
 */
export async function signSession(payload: SessionPayload): Promise<string> {
    const secret = getSecret();
    const claims: JWTPayload = {
        id: payload.id,
        userId: payload.userId,
        email: payload.email,
        name: payload.name,
        role: payload.role,
        permissions: payload.permissions,
    };

    return new SignJWT(claims)
        .setProtectedHeader({ alg: ALGORITHM, typ: 'JWT' })
        .setIssuedAt()
        .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
        .sign(secret);
}

/**
 * Verifica el JWT y devuelve el payload tipado, o `null` si el token
 * es inválido, expiró, fue manipulado, o no tiene los campos esperados.
 *
 * No lanza ante tokens inválidos: cualquier fallo de verificación se
 * trata como "sin sesión" para que el caller pueda redirigir al login.
 * Sí lanza si la configuración del servidor es inválida (sin secreto),
 * porque eso es un error de despliegue, no un usuario anónimo.
 */
export async function verifySession(
    token: string | undefined | null
): Promise<SessionPayload | null> {
    if (!token) return null;

    const secret = getSecret();

    try {
        const { payload } = await jwtVerify(token, secret, {
            algorithms: [ALGORITHM],
        });

        if (typeof payload.id !== 'string' || typeof payload.userId !== 'string') {
            return null;
        }

        return {
            id: payload.id,
            userId: payload.userId,
            email: typeof payload.email === 'string' ? payload.email : undefined,
            name: typeof payload.name === 'string' ? payload.name : undefined,
            role: typeof payload.role === 'string' ? payload.role : undefined,
            permissions: Array.isArray(payload.permissions)
                ? (payload.permissions.filter((p): p is string => typeof p === 'string'))
                : undefined,
        };
    } catch {
        return null;
    }
}

/**
 * Opciones recomendadas para `cookies().set(...)` del token de sesión.
 * Se exponen acá para que el módulo de cookies (que sí usa `next/headers`)
 * comparta la fuente de verdad con el resto del sistema.
 */
export const sessionCookieOptions = {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
};
