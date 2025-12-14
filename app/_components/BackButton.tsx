/**
 * =============================================================================
 * BACK BUTTON - Prosty przycisk powrotu
 * =============================================================================
 */

"use client";

import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
      aria-label="Powrót"
    >
      <i className="fas fa-arrow-left text-xs" aria-hidden="true"></i>
      <span>Powrót</span>
    </button>
  );
}
