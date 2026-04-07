"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { NotificationBadge } from "./NotificationBadge";

export function UserMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);

  if (status === "loading") {
    return <div className="w-8 h-8 rounded-full bg-separator animate-pulse" />;
  }

  if (!session?.user) {
    return (
      <Link
        href="/login"
        className="text-sm font-medium text-accent hover:underline"
      >
        Iniciar sesión
      </Link>
    );
  }

  const initials = (session.user.name || session.user.email || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative flex items-center gap-2 cursor-pointer transition-transform hover:scale-110 active:scale-95"
      >
        {session.user.image ? (
          <img
            src={session.user.image}
            alt=""
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs font-bold">
            {initials}
          </div>
        )}
        <NotificationBadge />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-separator shadow-lg z-50 py-1">
            <div className="px-3 py-2 border-b border-separator">
              <p className="text-sm font-medium text-text-primary truncate">
                {session.user.name || "Usuario"}
              </p>
              <p className="text-xs text-text-secondary truncate">
                {session.user.email}
              </p>
            </div>
            <Link
              href="/mi-cuenta"
              onClick={() => setOpen(false)}
              className="block w-full text-left px-3 py-2 text-sm text-text-primary hover:bg-gray-50 transition-colors"
            >
              Mi cuenta
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full text-left px-3 py-2 text-sm text-text-secondary hover:bg-gray-50 transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </>
      )}
    </div>
  );
}
