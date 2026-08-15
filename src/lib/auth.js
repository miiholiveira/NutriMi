import { createAuthClient } from 'better-auth/client';

const NEON_AUTH_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_NEON_AUTH_URL) || (typeof process !== 'undefined' && process.env?.VITE_NEON_AUTH_URL);

export const authClient = createAuthClient({
  baseURL: NEON_AUTH_URL,
});

export const { signIn, signUp, signOut, useSession, getSession } = authClient;
