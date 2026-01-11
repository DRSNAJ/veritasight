"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const result = await res.json();

      if (!res.ok || result.error) {
        setError(result.error?.message || "Invalid password");
        setLoading(false);
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Connection error");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          VeritaSight
        </h1>
        <p className="text-text-secondary mb-8">
          Enter your password to continue
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoFocus
              className="w-full px-4 py-3 bg-secondary border border-border-subtle rounded-lg
                text-text-primary placeholder:text-text-muted
                focus:outline-none focus:border-veritasight-blue focus:ring-1 focus:ring-veritasight-blue
                transition-colors duration-150"
            />
          </div>

          {error && (
            <p className="text-loss text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full px-4 py-3 bg-veritasight-blue text-white font-medium rounded-lg
              hover:bg-veritasight-blue/90 disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors duration-150"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </main>
  );
}
