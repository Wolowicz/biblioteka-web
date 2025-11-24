// app/_components/AppShell.tsx
"use client";
import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { shellStyles } from '@/lib/ui/styles'; 
import { UserSession, clearUserSession } from '@/lib/auth'; 
import { useRouter } from 'next/navigation';
import BorrowingsPanel from '../user/BorrowingsPanel'; 
import AdminPanel from '../admin/AdminPanel'; 

// Definicja możliwych widoków
type ViewName = 'catalog' | 'borrowings' | 'admin' | 'reviews';

// Komponent paska bocznego (Filtry)
const Sidebar = () => (
  <aside className={shellStyles.sidebar.wrapper}>
    <h2 className={shellStyles.sidebar.header}>Kategorie</h2>
    <nav className={shellStyles.sidebar.nav}>
      <div className={shellStyles.sidebar.item}>Fantastyka</div>
      <div className={shellStyles.sidebar.item}>Historia</div>
      <div className={shellStyles.sidebar.item}>Programowalne</div>
    </nav>
    <h2 className={shellStyles.sidebar.header}>Sortuj według</h2>
    <div className={shellStyles.sidebar.toggleWrapper}>
        <span className={shellStyles.sidebar.item}>Najnowsze</span>
        <div className="flex items-center">
            <input type="checkbox" id="toggle-new" className="hidden peer" defaultChecked />
            <label htmlFor="toggle-new" className="relative cursor-pointer">
                <div className="w-10 h-4 bg-gray-300 rounded-full shadow-inner"></div>
                <div className="dot absolute w-6 h-6 bg-white rounded-full shadow -left-1 -top-1 transition transform translate-x-0 peer-checked:translate-x-full peer-checked:bg-indigo-600"></div>
            </label>
        </div>
    </div>
    <div className={shellStyles.sidebar.toggleWrapper}>
        <span className={shellStyles.sidebar.item}>Ocena</span>
        <div className="flex items-center">
            <input type="checkbox" id="toggle-rating" className="hidden peer" />
            <label htmlFor="toggle-rating" className="relative cursor-pointer">
                <div className="w-10 h-4 bg-gray-300 rounded-full shadow-inner"></div>
                <div className="dot absolute w-6 h-6 bg-white rounded-full shadow -left-1 -top-1 transition transform translate-x-0 peer-checked:translate-x-full peer-checked:bg-indigo-600"></div>
            </label>
        </div>
    </div>
  </aside>
);

// Komponent panelu górnego (Header)
const Header = ({ user, onViewChange, currentView }: { user: UserSession, onViewChange: (view: ViewName) => void, currentView: ViewName }) => {
    const router = useRouter();

    // FUNKCJA WYLOGOWANIA
    const handleLogout = useCallback(() => {
        clearUserSession(); // Czyścimy sesję z localStorage
        router.push("/login"); // Przekierowujemy na stronę logowania
    }, [router]);

    // Definicja zakładek nawigacyjnych w zależności od roli
    const navTabs = [
        { name: 'Katalog', view: 'catalog' as ViewName, roles: ['ADMIN', 'LIBRARIAN', 'USER'] },
        { name: 'Moje Wypożyczenia', view: 'borrowings' as ViewName, roles: ['USER'] },
        { name: 'Recenzje', view: 'reviews' as ViewName, roles: ['ADMIN', 'LIBRARIAN', 'USER'] },
        { name: 'Panel Admina', view: 'admin' as ViewName, roles: ['ADMIN', 'LIBRARIAN'] },
    ];
    
    // Używamy ikony z public/biblio.png
    const biblioIconPath = '/biblio.png'; 

    return (
        <header className={shellStyles.header.wrapper}>
            <div className="flex items-center space-x-4">
                <Image src={biblioIconPath} alt="Logo BiblioteQ" width={32} height={32} />
                <h1 className={shellStyles.header.logo}>BiblioteQ</h1>
                
                {/* ZAKŁADKI NAWIGACYJNE */}
                <nav className="hidden sm:flex space-x-2 text-sm font-medium">
                    {navTabs.filter(tab => tab.roles.includes(user.role)).map(tab => (
                        <button
                            key={tab.view}
                            onClick={() => onViewChange(tab.view)}
                            className={`p-2 rounded transition-colors ${
                                currentView === tab.view
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            {tab.name}
                        </button>
                    ))}
                </nav>
            </div>
            
            <div className={shellStyles.header.userMenu}>
                <button className="text-gray-500 mr-2 p-2 rounded hover:bg-gray-100 transition-colors">
                    <i className="fas fa-bell"></i>
                </button>
                
                <span className={shellStyles.header.roleBadge}>
                    {user.role}
                </span>
                
                {/* PRZYCISK WYLOGUJ */}
                <button 
                    className={shellStyles.header.logoutButton} 
                    onClick={handleLogout}
                >
                    <i className={shellStyles.header.logoutIcon}></i>
                    <span>Wyloguj</span> 
                </button>
            </div>
        </header>
    );
};

// Główny komponent układu strony po zalogowaniu
// ⬅️ ZMIANA: Dodajemy opcjonalność dla propsa 'user' na wypadek, gdy AuthRedirect nie zdąży sklonować elementu
export default function AppShell({ children, user }: { children: React.ReactNode, user?: UserSession }) {
    
    // ⬅️ Wracamy do stanu ładowania, jeśli user nie jest dostępny
    if (!user) {
        return <div className="min-h-screen flex items-center justify-center">Ładowanie użytkownika...</div>;
    }

    const [currentView, setCurrentView] = useState<ViewName>('catalog');
    
    const role = user.role;
    const isPrivileged = role === 'ADMIN' || role === 'LIBRARIAN';
    
    const contentGridClass = isPrivileged ? 'lg:col-span-3' : 'lg:col-span-4';
    
    const renderContent = () => {
        switch (currentView) {
            case 'admin':
                if (isPrivileged) return <AdminPanel user={user} />;
                return <p className="text-red-500">Brak uprawnień do panelu administracyjnego.</p>;
            case 'borrowings':
                if (user.role === 'USER') return <BorrowingsPanel userId={user.id} />;
                return <p className="text-red-500">Brak dostępu do tego widoku w Twojej roli.</p>;
            case 'reviews':
                return <p className="p-4 bg-white rounded-lg shadow">Widok recenzji - Do zaimplementowania (moderacja dla {role})</p>;
            case 'catalog':
            default:
                // ⬅️ ZMIANA: Nie wyświetlamy już nagłówka, bo jest w Page.tsx / CatalogContent
                return children;
        }
    };
    
    return (
        <div className="min-h-screen bg-gray-100">
            <div className={`min-h-screen ${role === 'ADMIN' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
                <Header user={user} onViewChange={setCurrentView} currentView={currentView} />
                
                <main className={shellStyles.mainGrid}>
                    
                    <div className="lg:col-span-1">
                        <Sidebar />
                    </div>
                    
                    <div className={contentGridClass}>
                        {renderContent()}
                    </div>
                    
                    { isPrivileged && (
                        <aside className={`${shellStyles.adminPanel.wrapper} ${role === 'ADMIN' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
                            <h2 className={shellStyles.adminPanel.header}>Panel Szybkiego Dostępu</h2>
                            <p className={shellStyles.adminPanel.content}>Opcje zarządzania: {role}.</p>
                        </aside>
                    )}
                </main>
            </div>
        </div>
    );
}