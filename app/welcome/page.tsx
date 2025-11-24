// app/welcome/page.tsx
"use client";

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { welcomePageStyles } from '@/lib/ui/styles';

export default function WelcomePage() {
    const router = useRouter();

    const handleLoginClick = () => {
        router.push('/login');
    };

    const handleRegisterClick = () => {
        router.push('/register');
    };

    return (
        <div 
            className={welcomePageStyles.wrapper}
            // ⬅️ KOREKTA: Zmieniamy na .png i dodajemy styl center/contain
            style={{ 
                backgroundImage: "url('/library-bg.jpg')",
                backgroundPosition: "center", // Upewniamy się, że obraz jest wyśrodkowany
            }} 
        >
            {/* Warstwa rozmycia i zaciemnienia */}
            <div className={welcomePageStyles.overlay}></div>

            <div className={welcomePageStyles.contentCard}>
                {/* Logo i nazwa aplikacji */}
                <Image 
                    src="/biblio.png" 
                    alt="BiblioteQ Logo" 
                    width={80} 
                    height={80} 
                    className="mx-auto mb-4" 
                />
                <h1 className={welcomePageStyles.logo}>BiblioteQ</h1>
                <p className={welcomePageStyles.tagline}>
                    Twoja biblioteka w jednym miejscu
                </p>

                {/* Przyciski */}
                <div className={welcomePageStyles.buttonContainer}>
                    <button 
                        onClick={handleLoginClick} 
                        className={welcomePageStyles.loginButton}
                    >
                        Zaloguj się
                    </button>
                    <button 
                        onClick={handleRegisterClick} 
                        className={welcomePageStyles.registerButton}
                    >
                        Zarejestruj się
                    </button>
                </div>
            </div>
        </div>
    );
}