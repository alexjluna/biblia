"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verified = searchParams.get("verified");
  const urlError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      if (result.error.includes("EMAIL_NOT_VERIFIED")) {
        setError("Debes confirmar tu email antes de iniciar sesión. Revisa tu bandeja de entrada.");
      } else {
        setError("Email o contraseña incorrectos");
      }
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <>
      {verified === "1" && (
        <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 mb-4 text-center">
          <p className="text-sm text-accent font-medium">
            Email confirmado correctamente. Ya puedes iniciar sesión.
          </p>
        </div>
      )}

      {urlError === "TokenInvalido" && (
        <div className="bg-favorite/5 border border-favorite/20 rounded-xl p-4 mb-4 text-center">
          <p className="text-sm text-favorite font-medium">
            El enlace de verificación no es válido.
          </p>
        </div>
      )}

      {urlError === "TokenExpirado" && (
        <div className="bg-favorite/5 border border-favorite/20 rounded-xl p-4 mb-4 text-center">
          <p className="text-sm text-favorite font-medium">
            El enlace ha expirado. Regístrate de nuevo para recibir otro.
          </p>
        </div>
      )}

      <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 mb-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-text-primary mb-1.5">
              Con tu cuenta podrás:
            </p>
            <ul className="text-xs text-text-secondary space-y-1">
              <li className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-accent flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
                Guardar versículos como favoritos
              </li>
              <li className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-accent flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                </svg>
                Compartir versículos por WhatsApp
              </li>
              <li className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-accent flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Seguimiento de tu lectura bíblica
              </li>
              <li className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-accent flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                </svg>
                Marcar dónde dejaste la lectura
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-separator p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">
          Iniciar sesión
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
          Continuar con Google
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
              className="w-full px-3 py-2.5 rounded-lg border border-separator text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              placeholder="••••••••"
            />
          </div>

          <div className="text-right">
            <Link href="/recuperar" className="text-xs text-accent hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          {error && (
            <p className="text-sm text-favorite">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-accent text-white font-medium text-sm hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Iniciar sesión"}
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-text-secondary mt-4">
        ¿No tienes cuenta?{" "}
        <Link href="/registro" className="text-accent hover:underline font-medium">
          Regístrate
        </Link>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="max-w-sm mx-auto px-4 py-12">
      <header className="text-center mb-8">
        <a href="/" className="text-3xl font-bold font-[family-name:var(--font-source-serif)] text-text-primary hover:text-accent transition-colors">
          Biblia
        </a>
        <p className="text-sm text-text-secondary mt-1">Reina Valera 1960</p>
      </header>

      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
