"use client";

import { useState } from "react";

interface MarkReadButtonProps {
  bookNumber: number;
  chapter: number;
  initialIsRead: boolean;
}

export function MarkReadButton({
  bookNumber,
  chapter,
  initialIsRead,
}: MarkReadButtonProps) {
  const [isRead, setIsRead] = useState(initialIsRead);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [milestone, setMilestone] = useState<string | null>(null);

  const markAsRead = async () => {
    if (loading) return;
    setLoading(true);

    try {
      // Mark chapter as read (position only changes via "Dejé aquí")
      const res = await fetch("/api/reading-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookNumber, chapter }),
      });

      if (res.ok || res.status === 409) {
        setIsRead(true);
        const data = await res.json();
        if (data.bookCompleted) {
          setMilestone(`Completaste ${data.bookName}`);
          setTimeout(() => setMilestone(null), 4000);
        }
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const unmarkAsRead = async () => {
    if (loading) return;
    setLoading(true);
    setShowConfirm(false);

    try {
      await fetch(`/api/reading-progress/${bookNumber}?chapter=${chapter}`, {
        method: "DELETE",
      });
      setIsRead(false);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Milestone toast - fixed at top */}
      {milestone && (
        <div className="fixed top-4 left-0 right-0 flex justify-center z-50 animate-fade-in">
          <div className="bg-accent text-white px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {milestone}
          </div>
        </div>
      )}

      {/* Unmark confirmation popover */}
      {showConfirm && (
        <div className="fixed bottom-20 right-4 z-50 bg-white rounded-xl border border-separator shadow-lg p-3 flex items-center gap-3">
          <span className="text-sm text-text-secondary">¿Desmarcar?</span>
          <button
            onClick={unmarkAsRead}
            className="text-sm font-medium text-accent hover:underline"
          >
            Sí
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            className="text-sm text-text-secondary hover:underline"
          >
            No
          </button>
        </div>
      )}

      {/* Floating action button - always visible above TabBar */}
      {!isRead ? (
        <button
          onClick={markAsRead}
          disabled={loading}
          className="fixed bottom-20 right-4 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-accent text-white font-medium text-sm shadow-lg hover:bg-accent/90 transition-all active:scale-95 disabled:opacity-50"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          {loading ? "..." : "Marcar como leído"}
        </button>
      ) : (
        <button
          onClick={() => setShowConfirm(true)}
          disabled={loading}
          className="fixed bottom-20 right-4 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-white border border-accent/30 text-accent font-medium text-sm shadow-lg transition-all hover:bg-accent/5"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
          </svg>
          Desmarcar como leído
        </button>
      )}
    </>
  );
}
