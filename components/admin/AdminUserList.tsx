"use client";

import { useState } from "react";
import type { AdminUser } from "@/lib/queries/users";

interface AdminUserListProps {
  initialUsers: AdminUser[];
  currentUserId: string;
}

export function AdminUserList({ initialUsers, currentUserId }: AdminUserListProps) {
  const [users, setUsers] = useState(initialUsers);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", role: "" });
  const [loading, setLoading] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [passwordId, setPasswordId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const startEdit = (user: AdminUser) => {
    setEditingId(user.id);
    setEditForm({ name: user.name || "", email: user.email, role: user.role });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (id: string) => {
    setLoading(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        const updated = await res.json();
        setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
        setEditingId(null);
      }
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
        setConfirmDelete(null);
      }
    } finally {
      setLoading(null);
    }
  };

  const handleVerify = async (id: string) => {
    setLoading(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify" }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === id ? { ...u, email_verified: new Date().toISOString() } : u
          )
        );
      }
    } finally {
      setLoading(null);
    }
  };

  const handleChangePassword = async (id: string) => {
    if (newPassword.length < 6) return;
    setLoading(id);
    try {
      const res = await fetch(`/api/admin/users/${id}/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });
      if (res.ok) {
        setPasswordId(null);
        setNewPassword("");
      }
    } finally {
      setLoading(null);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-3">
      {users.map((user) => {
        const isEditing = editingId === user.id;
        const isDeleting = confirmDelete === user.id;
        const isLoading = loading === user.id;
        const isSelf = user.id === currentUserId;

        return (
          <div
            key={user.id}
            className="bg-white rounded-xl border border-separator p-4"
          >
            {isEditing ? (
              /* Edit mode */
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-text-secondary font-medium">Nombre</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-separator text-sm mt-1 focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-text-secondary font-medium">Email</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-separator text-sm mt-1 focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-text-secondary font-medium">Rol</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-separator text-sm mt-1 focus:outline-none focus:border-accent"
                  >
                    <option value="user">Usuario</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => saveEdit(user.id)}
                    disabled={isLoading}
                    className="px-3 py-1.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 disabled:opacity-50"
                  >
                    {isLoading ? "Guardando..." : "Guardar"}
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="px-3 py-1.5 rounded-lg border border-separator text-sm text-text-secondary hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              /* View mode */
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {user.image ? (
                      <img src={user.image} alt="" className="w-10 h-10 rounded-full flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {(user.name || user.email)[0].toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-text-primary truncate">
                          {user.name || "Sin nombre"}
                        </p>
                        {user.role === "admin" && (
                          <span className="text-[10px] font-semibold uppercase tracking-wider bg-accent/10 text-accent px-1.5 py-0.5 rounded">
                            Admin
                          </span>
                        )}
                        {isSelf && (
                          <span className="text-[10px] font-semibold uppercase tracking-wider bg-separator text-text-secondary px-1.5 py-0.5 rounded">
                            Tú
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-text-secondary truncate">{user.email}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => startEdit(user)}
                      className="p-1.5 rounded-lg text-text-secondary hover:text-accent hover:bg-accent/5 transition-colors"
                      title="Editar"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                      </svg>
                    </button>
                    {!isSelf && (
                      <button
                        onClick={() => setConfirmDelete(user.id)}
                        className="p-1.5 rounded-lg text-text-secondary hover:text-favorite hover:bg-favorite/5 transition-colors"
                        title="Eliminar"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-4 mt-3 text-xs text-text-secondary">
                  <span className="flex items-center gap-1">
                    {user.email_verified ? (
                      <svg className="w-3.5 h-3.5 text-accent" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5 text-text-secondary/50" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                      </svg>
                    )}
                    {user.email_verified ? "Verificado" : "No verificado"}
                  </span>
                  <span>{user.has_password ? "Email+contraseña" : "Google"}</span>
                  <span>{user.favorites_count} fav</span>
                  <span>{user.chapters_read} cap. leídos</span>
                  <span>Reg. {formatDate(user.created_at)}</span>
                </div>

                {/* Change password */}
                {passwordId === user.id && (
                  <div className="mt-3 p-3 rounded-lg bg-accent/5 border border-accent/20">
                    <p className="text-xs font-medium text-text-secondary mb-2">Nueva contraseña</p>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-separator text-sm focus:outline-none focus:border-accent"
                      />
                      <button
                        onClick={() => handleChangePassword(user.id)}
                        disabled={isLoading || newPassword.length < 6}
                        className="px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-medium disabled:opacity-50"
                      >
                        {isLoading ? "..." : "Guardar"}
                      </button>
                      <button
                        onClick={() => { setPasswordId(null); setNewPassword(""); }}
                        className="px-3 py-1.5 rounded-lg border border-separator text-xs text-text-secondary"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {/* Actions below stats */}
                <div className="flex items-center gap-3 mt-2">
                  {!user.email_verified && (
                    <button
                      onClick={() => handleVerify(user.id)}
                      disabled={isLoading}
                      className="text-xs text-accent hover:underline font-medium disabled:opacity-50"
                    >
                      Verificar manualmente
                    </button>
                  )}
                  {user.has_password && passwordId !== user.id && (
                    <button
                      onClick={() => { setPasswordId(user.id); setNewPassword(""); }}
                      className="text-xs text-accent hover:underline font-medium"
                    >
                      Cambiar contraseña
                    </button>
                  )}
                </div>

                {/* Delete confirmation */}
                {isDeleting && (
                  <div className="mt-3 p-3 rounded-lg bg-favorite/5 border border-favorite/20 flex items-center justify-between">
                    <p className="text-sm text-favorite">
                      ¿Eliminar a {user.name || user.email}?
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDelete(user.id)}
                        disabled={isLoading}
                        className="px-3 py-1 rounded-lg bg-favorite text-white text-xs font-medium disabled:opacity-50"
                      >
                        {isLoading ? "..." : "Eliminar"}
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="px-3 py-1 rounded-lg border border-separator text-xs text-text-secondary"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
