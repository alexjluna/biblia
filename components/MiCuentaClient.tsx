"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import type { Notification } from "@/lib/types";
import type { ActivityItem } from "@/lib/queries/users";

interface Props {
  user: {
    name: string | null;
    email: string;
    image: string | null;
    hasPassword: boolean;
    createdAt: string;
  };
  stats: {
    chaptersRead: number;
    favorites: number;
    discussions: number;
    likesGiven: number;
  };
  activity: ActivityItem[];
  notifications: Notification[];
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
  if (days < 7) return `hace ${days}d`;
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

export function MiCuentaClient({ user, stats, activity, notifications }: Props) {
  const [showDelete, setShowDelete] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const initials = (user.name || user.email)
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleDeleteAccount = async () => {
    if (confirmText !== "ELIMINAR") return;
    setDeleting(true);
    const res = await fetch("/api/auth/delete-account", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirm: "ELIMINAR" }),
    });
    if (res.ok) {
      signOut({ callbackUrl: "/login" });
    }
    setDeleting(false);
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <header className="mb-6">
        <Link href="/" className="text-sm text-accent hover:underline">
          &larr; Inicio
        </Link>
        <h1 className="text-2xl font-semibold mt-2 font-[family-name:var(--font-source-serif)] text-text-primary">
          Mi Cuenta
        </h1>
      </header>

      {/* Profile */}
      <div className="bg-white rounded-xl border border-separator p-5 mb-4">
        <div className="flex items-center gap-4">
          {user.image ? (
            <img src={user.image} alt="" className="w-14 h-14 rounded-full" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-accent/10 text-accent flex items-center justify-center text-lg font-bold">
              {initials}
            </div>
          )}
          <div>
            <p className="text-lg font-semibold text-text-primary">{user.name || "Usuario"}</p>
            <p className="text-sm text-text-secondary">{user.email}</p>
            <p className="text-xs text-text-secondary mt-0.5">
              Cuenta creada: {new Date(user.createdAt + "Z").toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          {user.hasPassword && (
            <Link
              href="/recuperar"
              className="px-3 py-1.5 rounded-lg border border-separator text-xs text-text-secondary hover:bg-gray-50"
            >
              Cambiar contraseña
            </Link>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="px-3 py-1.5 rounded-lg border border-separator text-xs text-text-secondary hover:bg-gray-50"
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          { label: "Capítulos leídos", value: stats.chaptersRead, total: "de 1189" },
          { label: "Versículos favoritos", value: stats.favorites },
          { label: "Reflexiones", value: stats.discussions },
          { label: "Corazones dados", value: stats.likesGiven },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-separator p-3 text-center">
            <p className="text-2xl font-bold text-accent font-[family-name:var(--font-source-serif)]">
              {stat.value}
            </p>
            <p className="text-xs text-text-secondary mt-0.5">{stat.label}</p>
            {stat.total && <p className="text-[10px] text-text-secondary">{stat.total}</p>}
          </div>
        ))}
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary mb-3">
            Notificaciones
          </h2>
          <div className="bg-white rounded-xl border border-separator divide-y divide-separator/50">
            {notifications.map((n) => (
              <Link
                key={n.id}
                href={n.bookNumber ? `/libro/${n.bookNumber}/${n.chapter}?verse=${n.verse}` : "/"}
                className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                  !n.isRead ? "bg-discussion/5" : ""
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {n.type === "like" ? (
                    <svg className="w-4 h-4 text-favorite" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-discussion" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                    </svg>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-text-primary">
                    <span className="font-medium">{n.fromUserName || "Alguien"}</span>
                    {n.type === "like" && " le dio corazón a tu reflexión"}
                    {n.type === "reply" && " respondió a tu reflexión"}
                    {n.type === "new_message" && " escribió"}
                    {" en "}
                    <span className="font-medium">{n.bookName} {n.chapter}:{n.verse}</span>
                  </p>
                  <p className="text-xs text-text-secondary">{timeAgo(n.createdAt)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Activity timeline */}
      {activity.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary mb-3">
            Actividad reciente
          </h2>
          <div className="bg-white rounded-xl border border-separator divide-y divide-separator/50">
            {activity.map((item, i) => (
              <Link
                key={i}
                href={item.bookNumber ? `/libro/${item.bookNumber}/${item.chapter}${item.verse ? `?verse=${item.verse}` : ""}` : "/"}
                className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex-shrink-0 mt-0.5">
                  {item.type === "read" && (
                    <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {item.type === "favorite" && (
                    <svg className="w-4 h-4 text-favorite" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                  )}
                  {item.type === "discussion" && (
                    <svg className="w-4 h-4 text-discussion" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                    </svg>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-text-primary">
                    {item.type === "read" && `Leíste ${item.bookName} ${item.chapter}`}
                    {item.type === "favorite" && `Guardaste ${item.bookName} ${item.chapter}:${item.verse}`}
                    {item.type === "discussion" && `Reflexión en ${item.bookName} ${item.chapter}:${item.verse}`}
                    {item.type === "bookmark" && `Dejaste lectura en ${item.bookName} ${item.chapter}:${item.verse}`}
                  </p>
                  <p className="text-xs text-text-secondary">{timeAgo(item.createdAt)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Delete account */}
      <section className="mt-8 mb-6">
        {!showDelete ? (
          <button
            onClick={() => setShowDelete(true)}
            className="text-xs text-text-secondary hover:text-favorite transition-colors"
          >
            Eliminar mi cuenta
          </button>
        ) : (
          <div className="bg-favorite/5 border border-favorite/20 rounded-xl p-4">
            <p className="text-sm text-text-primary mb-2">
              Se eliminarán permanentemente todos tus datos: favoritos, progreso de lectura, reflexiones y cuenta.
            </p>
            <p className="text-sm text-text-secondary mb-3">
              Escribe <strong>ELIMINAR</strong> para confirmar:
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="ELIMINAR"
              className="w-full px-3 py-2 rounded-lg border border-favorite/30 text-sm focus:outline-none focus:border-favorite mb-3"
            />
            <div className="flex gap-2">
              <button
                onClick={handleDeleteAccount}
                disabled={confirmText !== "ELIMINAR" || deleting}
                className="px-4 py-2 rounded-lg bg-favorite text-white text-sm font-medium disabled:opacity-50"
              >
                {deleting ? "Eliminando..." : "Eliminar cuenta"}
              </button>
              <button
                onClick={() => { setShowDelete(false); setConfirmText(""); }}
                className="px-4 py-2 rounded-lg border border-separator text-sm text-text-secondary"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
