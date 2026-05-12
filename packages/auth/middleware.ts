// Local auth middleware implementation.
//
// Verifica el JWT firmado de la cookie `auth-token` y entrega el
// payload de sesión al middleware del consumidor. Si la cookie no
// es un JWT válido firmado con `SESSION_SECRET`, `auth` será null
// (equivalente a "anónimo"). Nunca confiamos en el contenido sin
// verificar la firma.
import { NextRequest, NextResponse } from 'next/server';
import {
    verifySession,
    SESSION_COOKIE_NAME,
    type SessionPayload,
} from '@repo/data-services/src/services/auth/session';


export function authMiddleware(
    middleware: (auth: SessionPayload | null, req: NextRequest) => NextResponse | Promise<NextResponse>
) {
    return async (req: NextRequest) => {
        const tokenCookie = req.cookies.get(SESSION_COOKIE_NAME);
        const auth = await verifySession(tokenCookie?.value);

        return middleware(auth, req);
    };
}
