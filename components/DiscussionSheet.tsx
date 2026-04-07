"use client";

import { useState, useEffect, useRef } from "react";
import type { Verse, DiscussionMessage } from "@/lib/types";
import { DiscussionMessageItem } from "./DiscussionMessage";
import { MessageInput } from "./MessageInput";

interface DiscussionSheetProps {
  verseId: number;
  discussionId: number | null;
  bookName: string;
  verse: Verse;
  onClose: () => void;
}

export function DiscussionSheet({
  verseId,
  discussionId: initialDiscussionId,
  bookName,
  verse,
  onClose,
}: DiscussionSheetProps) {
  const [messages, setMessages] = useState<DiscussionMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [discussionId, setDiscussionId] = useState(initialDiscussionId);
  const [replyingTo, setReplyingTo] = useState<DiscussionMessage | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    if (!discussionId) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/discussions/${discussionId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      }
      // Mark as read
      fetch(`/api/discussions/${discussionId}/read`, { method: "POST" });
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [discussionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSent = async () => {
    // Refetch discussion if it was just created
    if (!discussionId) {
      const res = await fetch(`/api/discussions?verseId=${verseId}`);
      if (res.ok) {
        const data = await res.json();
        if (data) setDiscussionId(data.id);
      }
    }
    fetchMessages();
  };

  const handleLikeToggle = async (messageId: number) => {
    const res = await fetch(`/api/discussions/messages/${messageId}/like`, {
      method: "POST",
    });
    if (res.ok) {
      const data = await res.json();
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, isLiked: data.liked, likeCount: data.likeCount }
            : m
        )
      );
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-[60]" onClick={onClose} />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-[70] bg-white rounded-t-2xl shadow-2xl flex flex-col max-h-[75vh] animate-slide-up">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-separator" />
        </div>

        {/* Header */}
        <div className="px-4 pb-3 border-b border-separator">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold font-[family-name:var(--font-source-serif)] text-text-primary">
              {bookName} {verse.chapter}:{verse.verse}
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
          <p className="text-sm text-text-secondary mt-1 line-clamp-2 font-[family-name:var(--font-source-serif)] italic">
            &ldquo;{verse.text}&rdquo;
          </p>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-discussion/30 border-t-discussion rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center px-6 py-8">
              <svg className="w-12 h-12 text-discussion/20 mb-3" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
              <p className="text-text-secondary text-sm mb-1">
                Sé el primero en compartir una reflexión
              </p>
              <p className="text-xs text-text-secondary">sobre este versículo</p>
            </div>
          ) : (
            messages.map((msg) => (
              <DiscussionMessageItem
                key={msg.id}
                message={msg}
                onReply={setReplyingTo}
                onLikeToggle={handleLikeToggle}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="border-t border-separator px-4 py-3">
          <MessageInput
            discussionId={discussionId}
            verseId={verseId}
            replyingTo={replyingTo}
            onCancelReply={() => setReplyingTo(null)}
            onSent={handleSent}
          />
        </div>
      </div>
    </>
  );
}
