// Local auth middleware implementation
import { NextRequest, NextResponse } from 'next/server';


export function authMiddleware(middleware: (auth: any, req: NextRequest) => NextResponse | Promise<NextResponse>) {
    return async (req: NextRequest) => {
        // Get the auth token cookie
        const tokenCookie = req.cookies.get('auth-token');
        let auth = null;

        // If we have a token, parse it and set auth
        if (tokenCookie) {
            try {
                auth = JSON.parse(tokenCookie.value);
            } catch (error) {
                console.error('Error parsing auth token:', error);
            }
        }

        // Pass auth to the middleware
        return middleware(auth, req);
    };
}
