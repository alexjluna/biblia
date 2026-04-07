"use client";

import { useState, useEffect } from "react";
import type { Verse } from "@/lib/types";

interface NoteSheetProps {
  verse: Verse;
  bookName: string;
  onClose: () => void;
}

export function NoteSheet({ verse, bookName, onClose }: NoteSheetProps) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasExisting, setHasExisting] = useState(false);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const res = await fetch(`/api/notes?verseId=${verse.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.content) {
            setContent(data.content);
            setHasExisting(true);
          }
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [verse.id]);

  const handleSave = async () => {
    if (!content.trim()) return;
    setSaving(true);
    try {
      await fetch("/api/notes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verseId: verse.id, content: content.trim() }),
      });
      setHasExisting(true);
      onClose();
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await fetch(`/api/notes?verseId=${verse.id}`, { method: "DELETE" });
      onClose();
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-[60]" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-[70] bg-white rounded-t-2xl shadow-2xl flex flex-col max-h-[60vh] animate-slide-up">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-separator" />
        </div>

        <div className="px-4 pb-3 border-b border-separator">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold font-[family-name:var(--font-source-serif)] text-text-primary">
              Nota — {bookName} {verse.chapter}:{verse.verse}
            </h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-text-secondary"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-text-secondary mt-1 line-clamp-1 font-[family-name:var(--font-source-serif)] italic">
            &ldquo;{verse.text}&rdquo;
          </p>
        </div>

        <div className="flex-1 px-4 py-3">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
            </div>
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escribe tu nota personal..."
              maxLength={2000}
              className="w-full h-full min-h-[120px] resize-none rounded-xl border border-separator bg-white px-3 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            />
          )}
        </div>

        <div className="border-t border-separator px-4 py-3 flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={saving || !content.trim()}
            className="flex-1 py-2.5 rounded-lg bg-accent text-white font-medium text-sm hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar nota"}
          </button>
          {hasExisting && (
            <button
              onClick={handleDelete}
              disabled={saving}
              className="px-4 py-2.5 rounded-lg border border-separator text-sm text-text-secondary hover:text-favorite hover:border-favorite/30 transition-colors disabled:opacity-50"
            >
              Eliminar
            </button>
          )}
        </div>
      </div>
    </>
  );
}
