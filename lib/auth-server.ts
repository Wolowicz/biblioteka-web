// lib/auth-server.ts
import "server-only"; // ⬅️ Oznacza, że ten plik nigdy nie trafi do przeglądarki
import { cookies } from "next/headers";
// ⬅️ Importujemy typy z modułu klienckiego
import type { UserSession } from "@/lib/auth-client"; 

const SESSION_KEY = "userSession";

// Funkcje serwerowe do zarządzania sesją (SSR)
export async function getUserSessionSSR(): Promise<UserSession | null> {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_KEY); 

    if (sessionCookie) {
        try {
            return JSON.parse(sessionCookie.value) as UserSession;
        } catch (e) {
            console.error("Failed to parse user session cookie:", e);
            return null;
        }
    }
    return null;
}

export async function setUserSessionSSR(session: UserSession) {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_KEY, JSON.stringify(session), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, 
        path: '/',
    });
}

export async function clearUserSessionSSR() {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_KEY);
}