"use client";

import Image from "next/image";
import { FormEvent, useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { signIn } from "next-auth/react";
import {
  getLoginBackgroundSnapshot,
  hydrateLoginBackgroundFromStorage,
  subscribeToLoginBackground,
} from "@/lib/login-preferences";

type RegisterFormState = {
  firstName: string;
  lastName: string;
  birthDate: string;
  username: string;
  password: string;
  passwordConfirm: string;
};

type LoginFormState = {
  username: string;
  password: string;
};

type AuthView = "home" | "register" | "login";

const defaultLoginIcon = "/intro-assets/feline%20kalebassen.jpg";
function encodeAssetPath(assetPath: string): string {
  return assetPath
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
}

function isVideoFile(fileName: string): boolean {
  return /\.(mp4|webm|ogg)$/i.test(fileName);
}

function getVideoMimeType(fileName: string): string {
  if (/\.webm$/i.test(fileName)) {
    return "video/webm";
  }

  if (/\.ogg$/i.test(fileName)) {
    return "video/ogg";
  }

  return "video/mp4";
}

function setDocumentIcon(href: string) {
  const links = Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel*="icon"]'));
  if (links.length === 0) {
    const link = document.createElement("link");
    link.rel = "icon";
    link.href = href;
    document.head.appendChild(link);
    return;
  }

  for (const link of links) {
    link.href = href;
  }
}

export function AuthGate() {
  const [view, setView] = useState<AuthView>("home");
  const loginBackground = useSyncExternalStore(
    subscribeToLoginBackground,
    getLoginBackgroundSnapshot,
    getLoginBackgroundSnapshot,
  );
  const loginIconUrl = defaultLoginIcon;
  const [registerForm, setRegisterForm] = useState<RegisterFormState>({
    firstName: "",
    lastName: "",
    birthDate: "",
    username: "",
    password: "",
    passwordConfirm: "",
  });
  const [loginForm, setLoginForm] = useState<LoginFormState>({
    username: "",
    password: "",
  });
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerMessage, setRegisterMessage] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [gitUpdateStatus, setGitUpdateStatus] = useState<{
    available: boolean;
    branch: string | null;
    head: string | null;
    remoteHead: string | null;
    behind: number;
    ahead: number;
    dirty: boolean;
    canUpdate: boolean;
    reason: string | null;
  } | null>(null);
  const [gitUpdateLoading, setGitUpdateLoading] = useState(false);
  const [gitUpdateError, setGitUpdateError] = useState<string | null>(null);
  const [gitUpdateMessage, setGitUpdateMessage] = useState<string | null>(null);

  useEffect(() => {
    hydrateLoginBackgroundFromStorage();
    setDocumentIcon(loginIconUrl);
  }, [loginIconUrl]);

  function goToHome() {
    setView("home");
    setRegisterError(null);
    setRegisterMessage(null);
    setLoginError(null);
  }

  const refreshGitUpdateStatus = useCallback(async () => {
    setGitUpdateLoading(true);
    setGitUpdateError(null);
    setGitUpdateMessage(null);

    try {
      const response = await fetch("/api/update", {
        method: "GET",
        cache: "no-store",
      });

      const payload = (await response.json().catch(() => null)) as
        | { status?: typeof gitUpdateStatus; error?: string }
        | null;

      if (!response.ok) {
        setGitUpdateError(payload?.error ?? "GitHub-status kon niet worden opgehaald.");
        return;
      }

      if (payload?.status) {
        setGitUpdateStatus(payload.status);
      }
    } catch {
      setGitUpdateError("GitHub-status kon niet worden opgehaald.");
    } finally {
      setGitUpdateLoading(false);
    }
  }, []);

  const applyGitUpdate = useCallback(async () => {
    setGitUpdateLoading(true);
    setGitUpdateError(null);
    setGitUpdateMessage(null);

    try {
      const response = await fetch("/api/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const payload = (await response.json().catch(() => null)) as
        | { status?: typeof gitUpdateStatus; output?: string; error?: string }
        | null;

      if (!response.ok) {
        setGitUpdateError(payload?.error ?? "Update kon niet worden uitgevoerd.");
        return;
      }

      if (payload?.status) {
        setGitUpdateStatus(payload.status);
      }

      setGitUpdateMessage(payload?.output ?? "Update voltooid.");
      window.setTimeout(() => window.location.reload(), 1200);
    } catch {
      setGitUpdateError("Update kon niet worden uitgevoerd.");
    } finally {
      setGitUpdateLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refreshGitUpdateStatus();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [refreshGitUpdateStatus]);

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setRegisterError(null);
    setRegisterMessage(null);
    setLoginError(null);

    const firstName = registerForm.firstName.trim();
    const lastName = registerForm.lastName.trim();
    const birthDate = registerForm.birthDate;
    const username = registerForm.username.trim().toLowerCase();
    const password = registerForm.password;
    const passwordConfirm = registerForm.passwordConfirm;

    if (!firstName || !lastName || !birthDate || !username || !password || !passwordConfirm) {
      setRegisterError("Vul alle verplichte velden in.");
      return;
    }

    if (password !== passwordConfirm) {
      setRegisterError("Wachtwoorden komen niet overeen.");
      return;
    }

    setIsRegistering(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          birthDate,
          username,
          password,
          passwordConfirm,
        }),
      });

      const payload = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        setRegisterError(payload?.error ?? "Het aanmaken van het account is mislukt.");
        return;
      }

      setRegisterMessage("Account aangemaakt. Bezig met inloggen...");

      const signInResult = await signIn("credentials", {
        redirect: false,
        username,
        password,
      });

      if (signInResult?.error) {
        setRegisterMessage("Account aangemaakt. Log nu in met je nieuwe account.");
        setView("login");
        setLoginForm({ username, password: "" });
        return;
      }

      window.location.reload();
    } finally {
      setIsRegistering(false);
    }
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setRegisterError(null);
    setRegisterMessage(null);
    setLoginError(null);

    const username = loginForm.username.trim().toLowerCase();
    const password = loginForm.password;

    if (!username || !password) {
      setLoginError("Vul gebruikersnaam en wachtwoord in.");
      return;
    }

    setIsLoggingIn(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        username,
        password,
      });

      if (result?.error) {
        setLoginError("Onjuiste gebruikersnaam of wachtwoord.");
        return;
      }

      window.location.reload();
    } finally {
      setIsLoggingIn(false);
    }
  }

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-[#0d1018] px-4 py-6 text-[#2f1c1a]"
    >
      <div className="pointer-events-none absolute inset-0 z-0">
        {isVideoFile(loginBackground) ? (
          <video
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          >
            <source
              src={`/inlog-background/${encodeAssetPath(loginBackground)}`}
              type={getVideoMimeType(loginBackground)}
            />
          </video>
        ) : (
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(16, 20, 35, 0.36), rgba(16, 20, 35, 0.5)), url('/inlog-background/${encodeAssetPath(
                loginBackground,
              )}')`,
            }}
          />
        )}
        <div className="absolute inset-0 bg-[#0d1018]/25" />
      </div>

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-4xl flex-col">
        <div className="flex flex-1 items-center justify-center">
          <div className="relative h-56 w-56 overflow-hidden rounded-[2rem] border border-white/70 bg-white/65 p-3 shadow-2xl backdrop-blur-sm sm:h-72 sm:w-72">
            <Image src={loginIconUrl} alt="Feline logo" fill unoptimized sizes="(max-width: 768px) 240px, 320px" className="object-contain" />
          </div>
        </div>

        {view === "home" && (
          <div className="mt-auto grid gap-4 pb-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setView("register")}
              className="rounded-2xl bg-[#df5f35] px-5 py-4 text-xl font-semibold text-white shadow-xl transition hover:bg-[#c9502b]"
            >
              Account aanmaken
            </button>
            <button
              type="button"
              onClick={() => setView("login")}
              className="rounded-2xl bg-[#1f2937] px-5 py-4 text-xl font-semibold text-white shadow-xl transition hover:bg-[#111827]"
            >
              Inloggen
            </button>
          </div>
        )}

        {view === "register" && (
          <form
            onSubmit={(event) => {
              void handleRegister(event);
            }}
            className="relative mt-auto rounded-3xl border border-white/70 bg-white/90 p-6 pb-20 shadow-2xl backdrop-blur-sm"
          >
            <div className="mb-4 flex items-center justify-between">
              <h1 className="font-title text-3xl">Account aanmaken</h1>
              <button
                type="button"
                onClick={goToHome}
                className="rounded-lg border border-black/20 px-3 py-2 text-sm font-semibold hover:bg-black/5"
              >
                Terug
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm">
                <span className="mb-1 block font-semibold">Naam</span>
                <input
                  type="text"
                  required
                  value={registerForm.firstName}
                  onChange={(event) =>
                    setRegisterForm((prev) => ({
                      ...prev,
                      firstName: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-[#d7c4bd] bg-white px-3 py-2 outline-none ring-[#df5f35]/40 focus:ring"
                />
              </label>

              <label className="text-sm">
                <span className="mb-1 block font-semibold">Achternaam</span>
                <input
                  type="text"
                  required
                  value={registerForm.lastName}
                  onChange={(event) =>
                    setRegisterForm((prev) => ({
                      ...prev,
                      lastName: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-[#d7c4bd] bg-white px-3 py-2 outline-none ring-[#df5f35]/40 focus:ring"
                />
              </label>

              <label className="text-sm">
                <span className="mb-1 block font-semibold">Geboortedatum</span>
                <input
                  type="date"
                  required
                  value={registerForm.birthDate}
                  onChange={(event) =>
                    setRegisterForm((prev) => ({
                      ...prev,
                      birthDate: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-[#d7c4bd] bg-white px-3 py-2 outline-none ring-[#df5f35]/40 focus:ring"
                />
              </label>

              <label className="text-sm">
                <span className="mb-1 block font-semibold">Gebruikersnaam</span>
                <input
                  type="text"
                  required
                  value={registerForm.username}
                  onChange={(event) =>
                    setRegisterForm((prev) => ({
                      ...prev,
                      username: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-[#d7c4bd] bg-white px-3 py-2 outline-none ring-[#df5f35]/40 focus:ring"
                />
              </label>

              <label className="text-sm">
                <span className="mb-1 block font-semibold">Wachtwoord</span>
                <input
                  type="password"
                  required
                  value={registerForm.password}
                  onChange={(event) =>
                    setRegisterForm((prev) => ({
                      ...prev,
                      password: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-[#d7c4bd] bg-white px-3 py-2 outline-none ring-[#df5f35]/40 focus:ring"
                />
              </label>

              <label className="text-sm">
                <span className="mb-1 block font-semibold">Wachtwoord herhalen</span>
                <input
                  type="password"
                  required
                  value={registerForm.passwordConfirm}
                  onChange={(event) =>
                    setRegisterForm((prev) => ({
                      ...prev,
                      passwordConfirm: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-[#d7c4bd] bg-white px-3 py-2 outline-none ring-[#df5f35]/40 focus:ring"
                />
              </label>
            </div>

            {registerError && (
              <p className="mt-3 rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                {registerError}
              </p>
            )}

            {registerMessage && (
              <p className="mt-3 rounded-xl border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-700">
                {registerMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={isRegistering}
              className="mt-4 w-full rounded-xl bg-[#df5f35] px-4 py-3 text-lg font-semibold text-white transition hover:bg-[#c9502b] disabled:cursor-not-allowed disabled:bg-[#e7a08a]"
            >
              {isRegistering ? "Account aanmaken..." : "Account aanmaken"}
            </button>

            <div className="absolute bottom-4 right-4 flex flex-col items-end gap-2">
              <button
                type="button"
                onClick={() => {
                  void refreshGitUpdateStatus();
                }}
                disabled={gitUpdateLoading}
                className="rounded-lg border border-black/15 bg-white/95 px-3 py-2 text-xs font-semibold shadow-lg backdrop-blur-sm hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
              >
                {gitUpdateLoading ? "Controleren..." : "Update vanuit GitHub"}
              </button>
              {gitUpdateStatus && (
                <div className="max-w-[11rem] rounded-lg bg-white/90 px-2 py-1 text-[11px] text-black/60 shadow">
                  <span className="block">
                    {gitUpdateStatus.behind > 0
                      ? `${gitUpdateStatus.behind} update(s) klaar`
                      : "Bijgewerkt"}
                  </span>
                  {gitUpdateStatus.reason && <span className="mt-0.5 block text-black/50">{gitUpdateStatus.reason}</span>}
                </div>
              )}
              {gitUpdateMessage && <span className="max-w-[11rem] text-[11px] text-emerald-700">{gitUpdateMessage}</span>}
              {gitUpdateError && <span className="max-w-[11rem] text-[11px] text-red-700">{gitUpdateError}</span>}
            </div>
          </form>
        )}

        {view === "login" && (
          <form
            onSubmit={(event) => {
              void handleLogin(event);
            }}
            className="relative mt-auto rounded-3xl border border-white/70 bg-white/90 p-6 pb-20 shadow-2xl backdrop-blur-sm"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-title text-3xl">Inloggen</h2>
              <button
                type="button"
                onClick={goToHome}
                className="rounded-lg border border-black/20 px-3 py-2 text-sm font-semibold hover:bg-black/5"
              >
                Terug
              </button>
            </div>

            <div className="grid gap-3">
              <label className="text-sm">
                <span className="mb-1 block font-semibold">Gebruikersnaam</span>
                <input
                  type="text"
                  required
                  value={loginForm.username}
                  onChange={(event) =>
                    setLoginForm((prev) => ({
                      ...prev,
                      username: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-[#d7c4bd] bg-white px-3 py-2 outline-none ring-[#1f2937]/35 focus:ring"
                />
              </label>

              <label className="text-sm">
                <span className="mb-1 block font-semibold">Wachtwoord</span>
                <input
                  type="password"
                  required
                  value={loginForm.password}
                  onChange={(event) =>
                    setLoginForm((prev) => ({
                      ...prev,
                      password: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-[#d7c4bd] bg-white px-3 py-2 outline-none ring-[#1f2937]/35 focus:ring"
                />
              </label>
            </div>

            {loginError && (
              <p className="mt-3 rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="mt-4 w-full rounded-xl bg-[#1f2937] px-4 py-3 text-lg font-semibold text-white transition hover:bg-[#111827] disabled:cursor-not-allowed disabled:bg-[#4b5563]"
            >
              {isLoggingIn ? "Inloggen..." : "Inloggen"}
            </button>

            <div className="absolute bottom-4 right-4 flex flex-col items-end gap-2">
              <button
                type="button"
                onClick={() => {
                  void applyGitUpdate();
                }}
                disabled={gitUpdateLoading}
                className="rounded-lg border border-black/15 bg-white/95 px-3 py-2 text-xs font-semibold shadow-lg backdrop-blur-sm hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
              >
                {gitUpdateLoading ? "Bezig..." : "Update vanuit GitHub"}
              </button>
              {gitUpdateStatus && (
                <div className="max-w-[11rem] rounded-lg bg-white/90 px-2 py-1 text-[11px] text-black/60 shadow">
                  <span className="block">
                    {gitUpdateStatus.behind > 0
                      ? `${gitUpdateStatus.behind} update(s) klaar`
                      : "Bijgewerkt"}
                  </span>
                  {gitUpdateStatus.reason && <span className="mt-0.5 block text-black/50">{gitUpdateStatus.reason}</span>}
                </div>
              )}
              {gitUpdateMessage && <span className="max-w-[11rem] text-[11px] text-emerald-700">{gitUpdateMessage}</span>}
              {gitUpdateError && <span className="max-w-[11rem] text-[11px] text-red-700">{gitUpdateError}</span>}
            </div>
          </form>
        )}
      </section>
    </main>
  );
}
