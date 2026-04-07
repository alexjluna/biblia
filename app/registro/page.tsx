"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function RegistroPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

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

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, website }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Error al registrar");
      setLoading(false);
      return;
    }

    if (data.needsVerification) {
      setEmailSent(true);
      setLoading(false);
      return;
    }
  };

  if (emailSent) {
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
          <p className="text-sm text-text-secondary mb-1">
            Hemos enviado un enlace de confirmación a:
          </p>
          <p className="text-sm font-medium text-text-primary mb-4">{email}</p>
          <p className="text-xs text-text-secondary">
            Haz clic en el enlace del email para activar tu cuenta. El enlace expira en 24 horas.
          </p>
        </div>

        <p className="text-center text-sm text-text-secondary mt-4">
          ¿Ya confirmaste?{" "}
          <Link href="/login" className="text-accent hover:underline font-medium">
            Inicia sesión
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
        <h2 className="text-lg font-semibold text-text-primary mb-4">
          Crear cuenta
        </h2>

        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="w-full flex items-center justify-center gap-3 py-3 rounded-lg border border-separator font-medium text-sm text-text-primary hover:bg-gray-50 transition-colors mb-4"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Registrarse con Google
        </button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-separator" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-2 text-text-secondary">o</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Honeypot field - hidden from users, visible to bots */}
          <div className="absolute opacity-0 -z-10" aria-hidden="true" tabIndex={-1}>
            <label htmlFor="website">Website</label>
            <input
              id="website"
              name="website"
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-1">
              Nombre
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-separator text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              placeholder="Tu nombre"
            />
          </div>
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
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-1">
              Contraseña
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

          {error && (
            <p className="text-sm text-favorite">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-accent text-white font-medium text-sm hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-text-secondary mt-4">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="text-accent hover:underline font-medium">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
