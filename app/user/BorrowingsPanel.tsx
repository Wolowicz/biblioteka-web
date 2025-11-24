// app/user/BorrowingsPanel.tsx
"use client";
import { useState, useEffect } from 'react';
import { bookDetailsStyles, shellStyles } from '@/lib/ui/styles'; 

// ⬅️ Definicja typów danych z API
type Borrowing = {
  id: number;
  title: string;
  author: string;
  borrowDate: string;
  dueDate: string;
  returnDate: string | null;
  status: 'Aktywne' | 'Zwrocone' | 'Zalegle' | 'Utracone';
  totalFines: number;
};

export default function BorrowingsPanel({ userId }: { userId: number }) {
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ⬅️ Funkcja do pobierania danych wypożyczeń po stronie klienta
  useEffect(() => {
    async function fetchBorrowings() {
      try {
        // Używamy nowo utworzonego API Route
        const res = await fetch(`/api/user/borrowings?userId=${userId}`);
        
        if (!res.ok) {
          throw new Error('Failed to fetch borrowings');
        }

        const data: Borrowing[] = await res.json();
        setBorrowings(data);
      } catch (err) {
        console.error(err);
        setError("Błąd ładowania wypożyczeń.");
      } finally {
        setLoading(false);
      }
    }
    fetchBorrowings();
  }, [userId]);

  if (loading) return <div className="text-center p-8">Ładowanie Twoich wypożyczeń...</div>;
  if (error) return <div className="text-center p-8 text-red-600">Błąd: {error}</div>;

  return (
    <div className="space-y-4">
      <h2 className={bookDetailsStyles.title}>Moje Wypożyczenia i Kary</h2>
      
      {borrowings.length === 0 ? (
        <div className={shellStyles.panelCard}>
            <p className="text-gray-500 text-center">Nie masz obecnie aktywnych wypożyczeń.</p>
        </div>
      ) : (
        borrowings.map((b) => {
          // Logika do oznaczania jako zaległe
          const isOverdue = b.status === 'Zalegle' || (b.status === 'Aktywne' && new Date(b.dueDate) < new Date());
          const isReturned = b.status === 'Zwrocone';
          
          return (
            <div key={b.id} className={`${shellStyles.panelCard} ${isOverdue ? 'border-red-300' : isReturned ? 'border-green-300' : 'border-indigo-300'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{b.title}</h3>
                  <p className="text-sm text-gray-600">Autor: {b.author}</p>
                </div>
                <div className="text-right">
                    <p className={`font-bold ${isOverdue ? 'text-red-500' : isReturned ? 'text-green-600' : 'text-indigo-600'}`}>
                        {isOverdue ? 'ZALEGŁE' : b.status.toUpperCase()}
                    </p>
                </div>
              </div>
              
              <div className="mt-2 text-sm space-y-1">
                <p>Wypożyczono: {new Date(b.borrowDate).toLocaleDateString()}</p>
                <p className={isOverdue ? 'text-red-500' : 'text-gray-700'}>
                    Termin zwrotu: {new Date(b.dueDate).toLocaleDateString()}
                </p>
                
                {/* Kary */}
                {b.totalFines > 0 && (
                    <div className="p-2 bg-yellow-50 border border-yellow-300 rounded text-yellow-800 font-medium">
                        Kara: {b.totalFines.toFixed(2)} PLN (Status: Naliczona)
                    </div>
                )}
              </div>
              
              <div className="mt-4 flex space-x-2">
                <button 
                  className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                  disabled={isReturned}
                  onClick={() => alert(`Symulacja generowania Potwierdzenia PDF dla ${b.title}`)}
                >
                    <i className="fas fa-file-pdf mr-1"></i> Dokument PDF
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}