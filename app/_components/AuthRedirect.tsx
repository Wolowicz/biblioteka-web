"use client";
import { useAuth } from "@/lib/hooks";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

export default function AuthRedirect({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth(); 

    // ⏳ 1. Oczekiwanie na sprawdzenie sesji
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                Ładowanie aplikacji...
            </div>
        );
    }

    // ❌ 2. Brak sesji → przekierowanie
    if (!isAuthenticated) {
        router.push("/login");
        return null;
    }

    // ✅ 3. User OK → zwyczajnie zwracamy zawartość
    return <>{children}</>;
}
