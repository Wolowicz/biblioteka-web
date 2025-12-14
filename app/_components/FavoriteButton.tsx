"use client";

/**
 * =============================================================================
 * FAVORITE BUTTON - Przycisk dodawania do ulubionych
 * =============================================================================
 */

import { useState, useEffect } from "react";

interface FavoriteButtonProps {
  bookId: number;
  isAdmin?: boolean;
}

export default function FavoriteButton({ bookId, isAdmin = false }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    checkFavoriteStatus();
  }, [bookId]);

  const checkFavoriteStatus = async () => {
    try {
      const res = await fetch("/api/favorites");
      if (res.ok) {
        const data = await res.json();
        const isFav = data.favorites?.some((f: any) => f.id === bookId);
        setIsFavorite(isFav);
      }
    } catch (err) {
      console.error("Error checking favorite status:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async () => {
    setSaving(true);
    
    try {
      if (isFavorite) {
        // Usuń z ulubionych
        const res = await fetch(`/api/favorites?bookId=${bookId}`, {
          method: "DELETE",
        });
        if (res.ok) {
          setIsFavorite(false);
        }
      } else {
        // Dodaj do ulubionych
        const res = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookId }),
        });
        if (res.ok) {
          setIsFavorite(true);
        } else if (res.status === 401) {
          alert("Musisz być zalogowany, aby dodać do ulubionych");
        }
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <button
        disabled
        className={`group w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition-all
          ${isAdmin 
            ? "bg-slate-800 border border-slate-700 text-slate-500" 
            : "bg-gray-100 border-2 border-gray-200 text-gray-400"
          }
        `}
      >
        <i className="fas fa-spinner fa-spin"></i>
        <span>Ładowanie...</span>
      </button>
    );
  }

  return (
    <button
      onClick={toggleFavorite}
      disabled={saving}
      className={`group w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]
        ${saving ? "opacity-70 cursor-wait" : ""}
        ${isFavorite
          ? "bg-linear-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/30 hover:shadow-xl hover:shadow-rose-500/40"
          : isAdmin 
            ? "bg-slate-800 border border-slate-700 text-white hover:bg-slate-700" 
            : "bg-linear-to-r from-pink-50 to-rose-50 border-2 border-pink-200 text-pink-600 hover:border-pink-400 hover:shadow-lg hover:shadow-pink-500/20"
        }
      `}
    >
      <i 
        className={`${isFavorite ? "fas" : "far"} fa-heart text-lg transition-transform ${!saving && "group-hover:scale-125"}`} 
        aria-hidden="true"
      ></i>
      <span>
        {saving 
          ? (isFavorite ? "Usuwanie..." : "Dodawanie...") 
          : (isFavorite ? "W ulubionych" : "Dodaj do ulubionych")
        }
      </span>
      <span className="text-lg">{isFavorite ? "❤️" : "💕"}</span>
    </button>
  );
}
