// app/admin/AdminPanel.tsx
"use client";
import { useState, useEffect } from 'react';
import { bookDetailsStyles, shellStyles } from '@/lib/ui/styles'; 
import { UserSession } from '@/lib/auth';

// ⬅️ Definicja typów danych dla logów
type LogEntry = {
    id: number;
    type: string;
    userFirstName: string;
    userLastName: string;
    description: string;
    timestamp: string;
};

export default function AdminPanel({ user }: { user: UserSession }) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ⬅️ Logika uprawnień: Admin i Bibliotekarz widzą logi
  const canViewLogs = user.role === 'ADMIN' || user.role === 'LIBRARIAN';
  // ⬅️ Logika uprawnień: Tylko Admin może zarządzać użytkownikami i koszem
  const canManageUsersAndTrash = user.role === 'ADMIN';

  useEffect(() => {
    if (!canViewLogs) return;
    async function fetchLogs() {
      try {
        // Używamy nowo utworzonego API Route
        const res = await fetch(`/api/admin/logs`);
        
        if (!res.ok) {
          throw new Error('Failed to fetch logs');
        }

        const data: LogEntry[] = await res.json();
        setLogs(data);
      } catch (err) {
        console.error(err);
        setError("Błąd ładowania logów systemowych.");
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, [canViewLogs]);

  if (!canViewLogs) return <p className="text-center p-8 text-red-600">Brak uprawnień do tego panelu.</p>;
  if (loading) return <div className="text-center p-8">Ładowanie panelu administratora...</div>;
  if (error) return <div className="text-center p-8 text-red-600">Błąd: {error}</div>;

  return (
    <div className="space-y-6">
      <h2 className={bookDetailsStyles.title}>Panel Zarządzania ({user.role})</h2>
      
      {/* ⬅️ SEKCJA ZARZĄDZANIA UŻYTKOWNIKAMI (tylko dla ADMINA) */}
      {canManageUsersAndTrash && (
        <div className={shellStyles.panelCard}>
          <h3 className="text-xl font-semibold mb-2">Zarządzanie Użytkownikami</h3>
          <button className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded text-sm">
            <i className="fas fa-users-cog mr-1"></i> Zarządzaj Rolami
          </button>
        </div>
      )}

      {/* ⬅️ SEKCJA LOGÓW SYSTEMOWYCH (Audyt) */}
      <div className={shellStyles.panelCard}>
        <h3 className="text-xl font-semibold mb-2">Logi Systemowe (Audyt)</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto p-2 bg-gray-50 border rounded">
          {logs.length === 0 ? (
            <p className="text-gray-500 text-center">Brak logów do wyświetlenia.</p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className={shellStyles.logItem}>
                <p className="font-medium">{log.description}</p>
                <p className="text-xs text-gray-500">
                  <span className="font-semibold">{log.userFirstName} {log.userLastName}</span> - {new Date(log.timestamp).toLocaleString()}
                </p>
                <span className="text-xs text-indigo-400">Typ: {log.type}</span>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* ⬅️ SEKCJA KOSZA (Soft Delete) - tylko dla ADMINA */}
      {canManageUsersAndTrash && (
        <div className={shellStyles.panelCard}>
            <h3 className="text-xl font-semibold mb-2 text-red-600">
                <i className="fas fa-trash-alt mr-2"></i> Kosz (Soft Delete)
            </h3>
            <p className="text-sm text-gray-600">Tutaj trafią soft-usunięte elementy. Przykładowe szczegóły: kto usunął, kiedy i co można przywrócić.</p>
            <button className="mt-2 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded text-sm">
                Przeglądaj elementy
            </button>
        </div>
      )}
    </div>
  );
}