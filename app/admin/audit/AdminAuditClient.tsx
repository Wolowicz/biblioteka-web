"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/app/_components/AdminLayout";
import type { UserSession } from "@/domain/types";

interface AuditLog {
  id: number;
  type: string;
  userFirstName: string | null;
  userLastName: string | null;
  description: string;
  entity: string;
  entityId: number;
  stateBefore: string | null;
  stateAfter: string | null;
  timestamp: string;
}

interface DiffModalData {
  log: AuditLog;
  before: any;
  after: any;
}

const ENTITY_OPTIONS = [
  "Wszystkie",
  "Uzytkownicy",
  "Ksiazki",
  "Egzemplarze",
  "Wypozyczenia",
  "Kary",
  "Recenzje",
];

const ACTION_OPTIONS = [
  "Wszystkie",
  "Audyt",
  "INSERT",
  "UPDATE",
  "DELETE",
  "SOFT_DELETE",
  "RESTORE",
];

export default function AdminAuditClient({ user }: { user: UserSession }) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState("Wszystkie");
  const [actionFilter, setActionFilter] = useState("Wszystkie");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [diffModal, setDiffModal] = useState<DiffModalData | null>(null);

  useEffect(() => {
    fetchLogs();
  }, [entityFilter, actionFilter, dateFrom, dateTo]);

  async function fetchLogs() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (entityFilter !== "Wszystkie") params.append("entity", entityFilter);
      if (actionFilter !== "Wszystkie") params.append("action", actionFilter);
      if (dateFrom) params.append("dateFrom", dateFrom);
      if (dateTo) params.append("dateTo", dateTo);

      const response = await fetch(`/api/admin/logs?${params.toString()}`);
      const data = await response.json();
      setLogs(data);
    } catch (error) {
      console.error("Błąd pobierania logów:", error);
    } finally {
      setLoading(false);
    }
  }

  function openDiffModal(log: AuditLog) {
    let before = null;
    let after = null;

    try {
      if (log.stateBefore) {
        before = JSON.parse(log.stateBefore);
      }
    } catch (e) {
      console.error("Błąd parsowania stateBefore:", e);
    }

    try {
      if (log.stateAfter) {
        after = JSON.parse(log.stateAfter);
      }
    } catch (e) {
      console.error("Błąd parsowania stateAfter:", e);
    }

    setDiffModal({ log, before, after });
  }

  function renderJsonDiff() {
    if (!diffModal) return null;

    const { before, after } = diffModal;

    // If both are null, show message
    if (!before && !after) {
      return (
        <div className="text-gray-400 text-center py-8">
          Brak danych o stanie przed/po dla tego logu
        </div>
      );
    }

    // Get all unique keys
    const allKeys = new Set<string>();
    if (before && typeof before === "object") {
      Object.keys(before).forEach((key) => allKeys.add(key));
    }
    if (after && typeof after === "object") {
      Object.keys(after).forEach((key) => allKeys.add(key));
    }

    const keys = Array.from(allKeys);

    return (
      <div className="space-y-2">
        {keys.map((key) => {
          const beforeVal = before?.[key];
          const afterVal = after?.[key];
          const changed = JSON.stringify(beforeVal) !== JSON.stringify(afterVal);

          return (
            <div
              key={key}
              className={`grid grid-cols-3 gap-4 p-3 rounded-lg ${
                changed ? "bg-yellow-500/10 border border-yellow-500/30" : "bg-[#1A1A1A]"
              }`}
            >
              <div className="font-semibold text-gray-300">{key}</div>
              <div className="text-gray-400">
                {beforeVal !== undefined && beforeVal !== null
                  ? String(beforeVal)
                  : <span className="text-gray-600 italic">brak</span>}
              </div>
              <div className={changed ? "text-purple-300 font-medium" : "text-gray-400"}>
                {afterVal !== undefined && afterVal !== null
                  ? String(afterVal)
                  : <span className="text-gray-600 italic">brak</span>}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <AdminLayout user={user}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 bg-linear-to-br from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Logi Audytu
        </h1>
        <p className="text-gray-400">Historia zmian w systemie z JSON diff</p>
      </div>

      {/* Filtry */}
      <div className="bg-[#141414] rounded-xl p-6 border border-white/5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Encja</label>
            <select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
            >
              {ENTITY_OPTIONS.map((entity) => (
                <option key={entity} value={entity}>
                  {entity}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Akcja</label>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
            >
              {ACTION_OPTIONS.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Data od</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Data do</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Tabela logów */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
          <p className="text-gray-400 mt-4">Ładowanie logów...</p>
        </div>
      ) : (
        <div className="bg-[#141414] rounded-xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0A0A0A] border-b border-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Kiedy
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Kto
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Akcja
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Encja
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Opis
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Akcje
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                      Brak logów spełniających kryteria
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {new Date(log.timestamp).toLocaleString("pl-PL")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {log.userFirstName && log.userLastName
                          ? `${log.userFirstName} ${log.userLastName}`
                          : <span className="text-gray-500 italic">System</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-500/20 text-purple-300">
                          {log.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {log.entity} #{log.entityId}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400 max-w-md truncate">
                        {log.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {(log.stateBefore || log.stateAfter) && (
                          <button
                            onClick={() => openDiffModal(log)}
                            className="px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-colors flex items-center gap-2"
                          >
                            <i className="fas fa-file-code" aria-hidden="true"></i>
                            Diff
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal JSON Diff */}
      {diffModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#141414] rounded-2xl border border-white/10 max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">JSON Diff</h2>
                <p className="text-sm text-gray-400">
                  {diffModal.log.entity} #{diffModal.log.entityId} • {diffModal.log.type}
                </p>
              </div>
              <button
                onClick={() => setDiffModal(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <i className="fas fa-times text-2xl" aria-hidden="true"></i>
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-3 gap-4 mb-4 pb-2 border-b border-white/10">
                <div className="font-semibold text-purple-400">Pole</div>
                <div className="font-semibold text-gray-400">Stan Przed</div>
                <div className="font-semibold text-purple-400">Stan Po</div>
              </div>
              {renderJsonDiff()}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/5">
              <div className="flex items-center justify-between text-sm text-gray-400">
                <div>
                  <i className="fas fa-user mr-2" aria-hidden="true"></i>
                  {diffModal.log.userFirstName} {diffModal.log.userLastName}
                </div>
                <div>
                  <i className="fas fa-clock mr-2" aria-hidden="true"></i>
                  {new Date(diffModal.log.timestamp).toLocaleString("pl-PL")}
                </div>
              </div>
              <div className="mt-3 text-sm text-gray-300">
                {diffModal.log.description}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
