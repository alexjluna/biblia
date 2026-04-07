"use client";

import { useState } from "react";
import type { DiscussionMessage as MessageType } from "@/lib/types";

interface Props {
  message: MessageType;
  onReply: (msg: MessageType) => void;
  onLikeToggle: (messageId: number) => void;
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr + "Z");
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "ahora";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `hace ${days}d`;
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

export function DiscussionMessageItem({ message, onReply, onLikeToggle }: Props) {
  const [showMenu, setShowMenu] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reportReason, setReportReason] = useState("");

  const initials = (message.authorName || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleReport = async () => {
    if (!reportReason.trim()) return;
    await fetch(`/api/discussions/messages/${message.id}/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: reportReason }),
    });
    setReporting(false);
    setReportReason("");
    setShowMenu(false);
  };

  const handleDelete = async () => {
    await fetch(`/api/discussions/messages/${message.id}`, { method: "DELETE" });
    setShowMenu(false);
  };

  return (
    <div className="flex gap-3">
      {message.authorImage ? (
        <img src={message.authorImage} alt="" className="w-8 h-8 rounded-full flex-shrink-0" />
      ) : (
        <div className="w-8 h-8 rounded-full bg-discussion/10 text-discussion flex items-center justify-center text-xs font-bold flex-shrink-0">
          {initials}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium text-text-primary">{message.authorName || "Lector"}</span>
          <span className="text-xs text-text-secondary">{timeAgo(message.createdAt)}</span>
          {message.editedAt && <span className="text-xs text-text-secondary italic">(editado)</span>}
        </div>

        {message.parentAuthorName && (
          <div className="text-xs text-text-secondary mt-0.5 pl-2 border-l-2 border-discussion/30 truncate italic">
            En respuesta a {message.parentAuthorName}: {message.parentPreview}
          </div>
        )}

        <p className="text-sm text-text-primary mt-1 leading-relaxed whitespace-pre-wrap">{message.content}</p>

        {/* Actions: like, reply, menu */}
        <div className="flex items-center gap-4 mt-1.5">
          <button
            onClick={() => onLikeToggle(message.id)}
            className={`flex items-center gap-1 text-xs transition-colors ${
              message.isLiked ? "text-favorite" : "text-text-secondary hover:text-favorite"
            }`}
          >
            <svg className="w-3.5 h-3.5" fill={message.isLiked ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
            {message.likeCount > 0 && <span>{message.likeCount}</span>}
          </button>

          <button
            onClick={() => onReply(message)}
            className="text-xs text-text-secondary hover:text-discussion font-medium"
          >
            Responder
          </button>

          <div className="relative ml-auto">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="text-text-secondary hover:text-text-primary p-1"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
              </svg>
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-50" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 bottom-6 z-50 bg-white rounded-lg border border-separator shadow-lg py-1 min-w-[140px]">
                  {message.isOwn ? (
                    <button onClick={handleDelete} className="w-full text-left px-3 py-1.5 text-xs text-favorite hover:bg-favorite/5">
                      Eliminar
                    </button>
                  ) : (
                    <button onClick={() => { setReporting(true); setShowMenu(false); }} className="w-full text-left px-3 py-1.5 text-xs text-text-secondary hover:bg-gray-50">
                      Reportar
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {reporting && (
          <div className="mt-2 p-2 rounded-lg bg-gray-50 border border-separator">
            <input
              type="text"
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Motivo del reporte..."
              className="w-full px-2 py-1 rounded border border-separator text-xs focus:outline-none focus:border-discussion"
            />
            <div className="flex gap-2 mt-1.5">
              <button onClick={handleReport} className="text-xs text-discussion font-medium">Enviar</button>
              <button onClick={() => setReporting(false)} className="text-xs text-text-secondary">Cancelar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
