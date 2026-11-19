"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const field =
  "mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);

    if (mode === "signup") {
      if (fullName.trim().length < 2) {
        setError("Please enter your full name so your instructor can approve you.");
        setBusy(false);
        return;
      }
      if (password.length < 8) {
        setError("Password must be at least 8 characters.");
        setBusy(false);
        return;
      }
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { full_name: fullName.trim() } },
      });
      if (error) {
        setError(error.message);
        setBusy(false);
        return;
      }
      if (!data.session) {
        setError(
          "Account created, but email confirmation is still turned on in Supabase. Ask your instructor to turn it off."
        );
        setBusy(false);
        return;
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        setError("That email and password did not match.");
        setBusy(false);
        return;
      }
    }

    router.push("/dashboard");
  }

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <Link href="/" className="text-sm text-blue-700 underline">&larr; Back</Link>
      <h1 className="mt-4 text-3xl font-bold">
        {mode === "signin" ? "Technician sign in" : "Create technician account"}
      </h1>
      <p className="mt-2 mb-6 text-gray-700">
        For Neighbor IT student technicians. New accounts must be approved by your instructor
        before you can see any tickets.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-red-800">
            {error}
          </div>
        )}

        {mode === "signup" && (
          <div>
            <label htmlFor="fullName" className="font-medium">Full name</label>
            <input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)}
              required autoComplete="name" className={field} />
          </div>
        )}

        <div>
          <label htmlFor="email" className="font-medium">School email</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            required autoComplete="username" className={field} />
        </div>

        <div>
          <label htmlFor="password" className="font-medium">Password</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            required autoComplete={mode === "signin" ? "current-password" : "new-password"} className={field} />
          {mode === "signup" && (
            <p className="mt-1 text-sm text-gray-600">
              At least 8 characters. Do not reuse your school password. If you forget this one,
              your instructor will reset it.
            </p>
          )}
        </div>

        <button type="submit" disabled={busy}
          className="w-full rounded-lg bg-blue-700 px-4 py-3 text-lg font-semibold text-white hover:bg-blue-800 disabled:opacity-60">
          {busy ? "Please wait..." : mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>

      <button type="button" className="mt-6 text-sm text-blue-700 underline"
        onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); }}>
        {mode === "signin" ? "New technician? Create an account" : "Already have an account? Sign in"}
      </button>
    </main>
  );
}
