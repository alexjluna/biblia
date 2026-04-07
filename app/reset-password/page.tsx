"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="max-w-sm mx-auto px-4 py-12 text-center">
        <p className="text-text-secondary">Enlace inválido.</p>
        <Link href="/login" className="text-accent hover:underline text-sm font-medium mt-2 inline-block">
          Ir al login
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    if (res.ok) {
      setSuccess(true);
    } else {
      const data = await res.json();
      setError(data.error || "Error al restablecer la contraseña");
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="max-w-sm mx-auto px-4 py-12">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold font-[family-name:var(--font-source-serif)] text-text-primary">
            Biblia
          </h1>
        </header>

        <div className="bg-accent/5 border border-accent/20 rounded-xl p-6 text-center">
          <svg className="w-10 h-10 text-accent mx-auto mb-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-lg font-semibold text-text-primary mb-2">
            Contraseña actualizada
          </h2>
          <p className="text-sm text-text-secondary mb-4">
            Ya puedes iniciar sesión con tu nueva contraseña.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-accent text-white font-medium text-sm hover:bg-accent/90 transition-colors"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-12">
      <header className="text-center mb-8">
        <a href="/" className="text-3xl font-bold font-[family-name:var(--font-source-serif)] text-text-primary hover:text-accent transition-colors">
          Biblia
        </a>
        <p className="text-sm text-text-secondary mt-1">Reina Valera 1960</p>
      </header>

      <div className="bg-white rounded-xl border border-separator p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">
          Nueva contraseña
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-1">
              Contraseña nueva
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 py-2.5 rounded-lg border border-separator text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-secondary mb-1">
              Confirmar contraseña
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-lg border border-separator text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              placeholder="Repite tu contraseña"
            />
          </div>

          {error && <p className="text-sm text-favorite">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-accent text-white font-medium text-sm hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Guardando..." : "Guardar contraseña"}
          </button>
        </form>
      </div>
    </div>
  );
}
