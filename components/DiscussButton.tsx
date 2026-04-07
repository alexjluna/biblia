"use client";

interface DiscussButtonProps {
  messageCount: number;
  onOpen: () => void;
}

export function DiscussButton({ messageCount, onOpen }: DiscussButtonProps) {
  const hasMessages = messageCount > 0;

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onOpen();
      }}
      className={`relative inline-flex items-center justify-center w-8 h-8 rounded-full cursor-pointer transition-all hover:scale-110 active:scale-95 ${
        hasMessages
          ? "text-discussion"
          : "text-text-secondary hover:text-discussion"
      }`}
      title="Discutir"
    >
      <svg
        className="w-5 h-5"
        fill={hasMessages ? "currentColor" : "none"}
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
        />
      </svg>
      {hasMessages && (
        <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-discussion text-white text-[10px] font-bold flex items-center justify-center">
          {messageCount > 99 ? "99+" : messageCount}
        </span>
      )}
    </button>
  );
}
