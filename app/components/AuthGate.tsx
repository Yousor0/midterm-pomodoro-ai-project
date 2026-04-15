"use client";

import { useState, useCallback, type ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";

interface Props {
  children: ReactNode;
}

type Mode = "login" | "signup";

export default function AuthGate({ children }: Props) {
  const { user, loading, signIn, signUp } = useAuth();

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [signupSent, setSignupSent] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setSubmitting(true);
      try {
        if (mode === "login") {
          await signIn(email, password);
        } else {
          await signUp(email, password);
          setSignupSent(true);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Authentication failed");
      } finally {
        setSubmitting(false);
      }
    },
    [mode, email, password, signIn, signUp]
  );

  // Still resolving session
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center font-mono text-sm"
        style={{ backgroundColor: "var(--terminal-bg)", color: "var(--terminal-green)" }}
      >
        <span className="opacity-60">$ initializing session...</span>
      </div>
    );
  }

  // Authenticated — render the app
  if (user) return <>{children}</>;

  // Signed up but needs email confirmation
  if (signupSent) {
    return (
      <div
        className="min-h-screen flex items-center justify-center font-mono text-sm p-6"
        style={{ backgroundColor: "var(--terminal-bg)", color: "var(--terminal-green)" }}
      >
        <div className="w-full max-w-sm space-y-3">
          <p style={{ color: "var(--terminal-dim)" }}>$ pomoctl signup --verify</p>
          <div
            className="border rounded p-6 space-y-3"
            style={{ borderColor: "var(--terminal-border)", backgroundColor: "var(--terminal-surface)" }}
          >
            <p style={{ color: "var(--terminal-cyan)" }}>
              ✓ account created
            </p>
            <p style={{ color: "var(--terminal-dim)" }}>
              check your email for a confirmation link, then come back to log in.
            </p>
            <button
              onClick={() => { setSignupSent(false); setMode("login"); }}
              className="text-xs hover:opacity-80 transition-opacity"
              style={{ color: "var(--terminal-amber)" }}
            >
              [enter] back to login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center font-mono text-sm p-6"
      style={{ backgroundColor: "var(--terminal-bg)", color: "var(--terminal-green)" }}
    >
      <div className="w-full max-w-sm space-y-3">
        {/* Prompt */}
        <p style={{ color: "var(--terminal-dim)" }}>
          $ pomoctl {mode === "login" ? "login" : "signup"}
        </p>

        {/* Form box */}
        <div
          className="border rounded p-6 space-y-5"
          style={{
            borderColor: "var(--terminal-green)" + "44",
            backgroundColor: "var(--terminal-surface)",
          }}
        >
          {/* Title */}
          <p
            className="text-xs tracking-widest font-bold"
            style={{ color: "var(--terminal-green)", textShadow: "var(--glow-green-sm, none)" }}
          >
            POMOCTL AUTH — {mode === "login" ? "LOGIN" : "SIGNUP"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1">
              <label
                htmlFor="email"
                className="text-xs"
                style={{ color: "var(--terminal-dim)" }}
              >
                email:
              </label>
              <div className="flex items-center gap-1">
                <span style={{ color: "var(--terminal-cyan)" }}>›</span>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-transparent outline-none caret-current"
                  style={{ color: "var(--terminal-green)" }}
                  placeholder="user@example.com"
                />
              </div>
              <div
                className="h-px w-full"
                style={{ backgroundColor: "var(--terminal-border)" }}
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label
                htmlFor="password"
                className="text-xs"
                style={{ color: "var(--terminal-dim)" }}
              >
                password:
              </label>
              <div className="flex items-center gap-1">
                <span style={{ color: "var(--terminal-cyan)" }}>›</span>
                <input
                  id="password"
                  type="password"
                  required
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 bg-transparent outline-none caret-current"
                  style={{ color: "var(--terminal-green)" }}
                  placeholder="••••••••"
                />
              </div>
              <div
                className="h-px w-full"
                style={{ backgroundColor: "var(--terminal-border)" }}
              />
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs" style={{ color: "#ff4444" }}>
                ✗ {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full text-left text-xs hover:opacity-80 transition-opacity disabled:opacity-40"
              style={{ color: "var(--terminal-cyan)" }}
            >
              <kbd
                className="term-kbd mr-1"
                style={{ fontSize: "0.65rem" }}
              >
                enter
              </kbd>
              {submitting
                ? "authenticating..."
                : mode === "login"
                ? "login"
                : "create account"}
            </button>
          </form>

          {/* Toggle mode */}
          <div
            className="border-t pt-4 text-xs"
            style={{ borderColor: "var(--terminal-border)", color: "var(--terminal-dim)" }}
          >
            {mode === "login" ? (
              <>
                no account?{" "}
                <button
                  onClick={() => { setMode("signup"); setError(null); }}
                  className="hover:opacity-80 transition-opacity"
                  style={{ color: "var(--terminal-amber)" }}
                >
                  signup
                </button>
              </>
            ) : (
              <>
                have an account?{" "}
                <button
                  onClick={() => { setMode("login"); setError(null); }}
                  className="hover:opacity-80 transition-opacity"
                  style={{ color: "var(--terminal-amber)" }}
                >
                  login
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
