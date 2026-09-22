"use client";

import { useState } from "react";

type AuthMode = "login" | "register";

type AuthFormProps = {
  mode: AuthMode;
};

export function AuthForm({ mode }: AuthFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function submitForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setStatus("Scrie un email valid.");
      return;
    }

    if (mode === "register" && trimmedName.length < 2) {
      setStatus("Numele trebuie sa aiba cel putin 2 caractere.");
      return;
    }

    if (mode === "register" && password.length < 10) {
      setStatus("Parola trebuie sa aiba cel putin 10 caractere.");
      return;
    }

    setIsLoading(true);
    setStatus("");

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        body: JSON.stringify({
          email: trimmedEmail,
          name: mode === "register" ? trimmedName : undefined,
          password,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Autentificarea a esuat.");
      }

      window.location.href = mode === "register" ? "/onboarding" : "/dashboard";
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Eroare necunoscuta.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form
      className="mx-auto w-full max-w-md rounded-lg border border-[#ded9c8] bg-white p-5 shadow-sm"
      onSubmit={submitForm}
    >
      <h1 className="text-3xl font-black">
        {mode === "register" ? "Creeaza cont" : "Intra in cont"}
      </h1>
      <p className="mt-2 text-sm leading-6 text-[#62695f]">
        Contul va proteja profilul, istoricul meselor, planurile si accesul Premium.
      </p>

      <div className="mt-5 grid gap-4">
        {mode === "register" ? (
          <label className="block">
            <span className="text-sm font-black text-[#535b50]">Nume</span>
            <input
              autoComplete="name"
              className="mt-2 h-12 w-full rounded-lg border border-[#d8d2bf] bg-[#fbfaf4] px-4 text-base font-bold outline-none focus:border-[#123f31]"
              onChange={(event) => setName(event.target.value)}
              required
              type="text"
              value={name}
            />
          </label>
        ) : null}

        <label className="block">
          <span className="text-sm font-black text-[#535b50]">Email</span>
          <input
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect="off"
            className="mt-2 h-12 w-full rounded-lg border border-[#d8d2bf] bg-[#fbfaf4] px-4 text-base font-bold outline-none focus:border-[#123f31]"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
        </label>

        <label className="block">
          <span className="text-sm font-black text-[#535b50]">Parola</span>
          <div className="mt-2 flex overflow-hidden rounded-lg border border-[#d8d2bf] bg-[#fbfaf4] focus-within:border-[#123f31]">
            <input
              autoComplete={mode === "register" ? "new-password" : "current-password"}
              className="h-12 min-w-0 flex-1 bg-transparent px-4 text-base font-bold outline-none"
              onChange={(event) => setPassword(event.target.value)}
              required
              type={showPassword ? "text" : "password"}
              value={password}
            />
            <button
              className="min-h-12 shrink-0 border-l border-[#d8d2bf] px-3 text-xs font-black text-[#123f31]"
              onClick={() => setShowPassword((current) => !current)}
              type="button"
            >
              {showPassword ? "Ascunde" : "Arata"}
            </button>
          </div>
          {mode === "register" ? (
            <p className="mt-2 text-xs font-semibold leading-5 text-[#62695f]">
              Minim 10 caractere pentru cont nou.
            </p>
          ) : null}
        </label>
      </div>

      {status ? (
        <p
          aria-live="polite"
          className="mt-4 rounded-lg border border-[#d6c981] bg-[#fff7cc] p-4 text-sm font-semibold leading-6 text-[#5d531c]"
        >
          {status}
        </p>
      ) : null}

      <button
        className="mt-5 min-h-12 w-full rounded-lg bg-[#15171d] px-4 py-3 text-left text-sm font-black text-white shadow-sm transition hover:bg-[#252832] disabled:opacity-60"
        disabled={isLoading}
        type="submit"
      >
        {isLoading ? "Se verifica..." : mode === "register" ? "Creeaza cont" : "Login"}
      </button>
    </form>
  );
}
