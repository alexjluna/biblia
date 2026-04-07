"use client";

import { useState } from "react";
import Link from "next/link";
import type { PrayerRequest } from "@/lib/queries/prayers";

interface Props {
  initialRequests: PrayerRequest[];
  isLoggedIn: boolean;
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr.includes("Z") ? dateStr : dateStr + "Z");
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "ahora";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `hace ${days}d`;
}

export function PrayerWall({ initialRequests, isLoggedIn }: Props) {
  const [requests, setRequests] = useState(initialRequests);
  const [showForm, setShowForm] = useState(false);
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!content.trim() || sending) return;
    setSending(true);
    setError("");

    const res = await fetch("/api/prayers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: content.trim(), isAnonymous }),
    });

    if (res.ok) {
      setContent("");
      setShowForm(false);
      // Refresh
      const refreshRes = await fetch("/api/prayers");
      if (refreshRes.ok) setRequests(await refreshRes.json());
    } else {
      const data = await res.json();
      setError(data.error || "Error al enviar");
    }
    setSending(false);
  };

  const handlePray = async (requestId: number) => {
    const res = await fetch("/api/prayers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "pray", requestId }),
    });
    if (res.ok) {
      const data = await res.json();
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? { ...r, isPraying: data.praying, prayerCount: data.prayerCount }
            : r
        )
      );
    }
  };

  const handleDelete = async (requestId: number) => {
    await fetch("/api/prayers", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId }),
    });
    setRequests((prev) => prev.filter((r) => r.id !== requestId));
  };

  return (
    <div>
      {/* New prayer form */}
      {isLoggedIn && (
        <>
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="w-full mb-4 py-3 rounded-xl border border-dashed border-accent/30 text-sm text-accent hover:bg-accent/5 transition-colors"
            >
              + Compartir una petición de oración
            </button>
          ) : (
            <div className="bg-white rounded-xl border border-separator p-4 mb-4">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Escribe tu petición de oración..."
                maxLength={280}
                rows={3}
                className="w-full resize-none rounded-lg border border-separator px-3 py-2.5 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              />
              <div className="flex items-center justify-between mt-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded border-separator text-accent focus:ring-accent"
                  />
                  <span className="text-xs text-text-secondary">Publicar como anónimo</span>
                </label>
                <span className="text-xs text-text-secondary">{content.length}/280</span>
              </div>

              {error && <p className="text-xs text-favorite mt-2">{error}</p>}

              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleSubmit}
                  disabled={!content.trim() || sending}
                  className="flex-1 py-2.5 rounded-lg bg-accent text-white font-medium text-sm disabled:opacity-50"
                >
                  {sending ? "Enviando..." : "Compartir petición"}
                </button>
                <button
                  onClick={() => { setShowForm(false); setContent(""); setError(""); }}
                  className="px-4 py-2.5 rounded-lg border border-separator text-sm text-text-secondary"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {!isLoggedIn && (
        <div className="bg-accent/5 border border-accent/15 rounded-xl p-4 mb-4 text-center">
          <p className="text-sm text-text-secondary">
            <Link href="/login" className="text-accent font-medium hover:underline">
              Inicia sesión
            </Link>{" "}
            para compartir peticiones y orar por otros
          </p>
        </div>
      )}

      {/* Prayer requests list */}
      {requests.length === 0 ? (
        <div className="text-center py-12">
          <span className="text-4xl opacity-30 block mb-3">🙏</span>
          <p className="text-text-secondary">Aún no hay peticiones de oración</p>
          <p className="text-xs text-text-secondary mt-1">Sé el primero en compartir</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div key={req.id} className="bg-white rounded-xl border border-separator p-4">
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs text-text-secondary">
                  {req.authorName || "Anónimo"} · {timeAgo(req.createdAt)}
                </p>
                {req.isOwn && (
                  <button
                    onClick={() => handleDelete(req.id)}
                    className="text-text-secondary hover:text-favorite text-xs"
                  >
                    Eliminar
                  </button>
                )}
              </div>

              <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
                {req.content}
              </p>

              {req.verseText && (
                <p className="text-xs text-accent mt-2 italic font-[family-name:var(--font-source-serif)]">
                  {req.verseText}
                </p>
              )}

              <div className="flex items-center justify-between mt-3">
                {isLoggedIn ? (
                  <button
                    onClick={() => handlePray(req.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                      req.isPraying
                        ? "bg-accent/10 text-accent"
                        : "bg-separator/50 text-text-secondary hover:bg-accent/5 hover:text-accent"
                    }`}
                  >
                    🙏 {req.isPraying ? "Orando" : "Orar"}
                  </button>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-text-secondary">
                    🙏
                  </span>
                )}
                <span className="text-xs text-text-secondary">
                  {req.prayerCount} {req.prayerCount === 1 ? "persona orando" : "personas orando"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
