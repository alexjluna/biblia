"use client";

import { useState } from "react";
import Link from "next/link";

export default function RecuperarPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (res.ok) {
      setSent(true);
    } else {
      setError("Error al procesar la solicitud");
    }
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="max-w-sm mx-auto px-4 py-12">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold font-[family-name:var(--font-source-serif)] text-text-primary">
            Biblia
          </h1>
          <p className="text-sm text-text-secondary mt-1">Reina Valera 1960</p>
        </header>

        <div className="bg-white rounded-xl border border-separator p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-text-primary mb-2">
            Revisa tu correo
          </h2>
          <p className="text-sm text-text-secondary">
            Si existe una cuenta con <strong>{email}</strong>, recibirás un enlace para restablecer tu contraseña.
          </p>
        </div>

        <p className="text-center text-sm text-text-secondary mt-4">
          <Link href="/login" className="text-accent hover:underline font-medium">
            Volver al login
          </Link>
        </p>
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
        <h2 className="text-lg font-semibold text-text-primary mb-2">
          Recuperar contraseña
        </h2>
        <p className="text-sm text-text-secondary mb-4">
          Introduce tu email y te enviaremos un enlace para restablecer tu contraseña.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-lg border border-separator text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              placeholder="tu@email.com"
            />
          </div>

          {error && <p className="text-sm text-favorite">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-accent text-white font-medium text-sm hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Enviando..." : "Enviar enlace"}
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-text-secondary mt-4">
        <Link href="/login" className="text-accent hover:underline font-medium">
          Volver al login
        </Link>
      </p>
    </div>
  );
}
