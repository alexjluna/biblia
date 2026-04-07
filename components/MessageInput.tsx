"use client";

import { useState } from "react";
import type { DiscussionMessage } from "@/lib/types";

interface MessageInputProps {
  discussionId: number | null;
  verseId: number;
  replyingTo: DiscussionMessage | null;
  onCancelReply: () => void;
  onSent: () => void;
}

export function MessageInput({
  discussionId,
  verseId,
  replyingTo,
  onCancelReply,
  onSent,
}: MessageInputProps) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    setError("");

    try {
      if (!discussionId) {
        // Create discussion with first message
        const res = await fetch("/api/discussions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ verseId, content: text.trim() }),
        });
        if (!res.ok) {
          const data = await res.json();
          if (res.status === 409 && data.existingId) {
            // Discussion was created by another user, post to it
            await fetch(`/api/discussions/${data.existingId}/messages`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ content: text.trim(), parentId: replyingTo?.id }),
            });
          } else {
            setError(data.error || "Error al enviar");
            setSending(false);
            return;
          }
        }
      } else {
        const res = await fetch(`/api/discussions/${discussionId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: text.trim(), parentId: replyingTo?.id }),
        });
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Error al enviar");
          setSending(false);
          return;
        }
      }

      setText("");
      onCancelReply();
      onSent();
    } catch {
      setError("Error de conexión");
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      {replyingTo && (
        <div className="flex items-center justify-between px-3 py-2 mb-2 bg-discussion/5 rounded-lg border-l-2 border-discussion">
          <div className="min-w-0">
            <span className="text-xs font-medium text-discussion">
              Respondiendo a {replyingTo.authorName || "Lector"}
            </span>
            <p className="text-xs text-text-secondary truncate">{replyingTo.content.slice(0, 60)}</p>
          </div>
          <button onClick={onCancelReply} className="text-text-secondary hover:text-text-primary flex-shrink-0 ml-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {error && <p className="text-xs text-favorite mb-1">{error}</p>}

      <div className="flex items-end gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Comparte tu reflexión..."
          maxLength={2000}
          className="flex-1 resize-none rounded-xl border border-separator bg-white px-3 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:border-discussion focus:ring-1 focus:ring-discussion transition-colors max-h-24"
          rows={1}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          className="flex-shrink-0 w-10 h-10 rounded-full bg-discussion text-white flex items-center justify-center disabled:opacity-40 transition-opacity"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
