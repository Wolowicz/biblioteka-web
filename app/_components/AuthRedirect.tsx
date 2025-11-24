// app/_components/AuthRedirect.tsx
"use client";
import { useAuth } from "@/lib/hooks"; // ⬅️ Hook do sprawdzania stanu logowania
import { useRouter } from "next/navigation";
import React from "react";

export default function AuthRedirect({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { isAuthenticated, isLoading, user } = useAuth(); 

    // 1. Stan ładowania
    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Ładowanie aplikacji...</div>;
    }

    // 2. Brak autoryzacji: przekierowanie
    if (!isAuthenticated) {
        router.push("/login");
        return null; // Zatrzymuje renderowanie zawartości
    }

    // 3. Autoryzacja OK: renderuje AppShell z danymi użytkownika
    // ⬅️ Musimy przekazać user, więc musimy zmienić AppShell, aby go przyjmował!
    // Klucz: musimy sklonować children i przekazać do AppShell prop 'user'
    
    // Zakładamy, że AppShell jest ZAWSZE pierwszym dzieckiem
    const AppShellWithUser = React.cloneElement(children as React.ReactElement, { user: user });
    
    return AppShellWithUser;
}