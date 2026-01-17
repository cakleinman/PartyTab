"use client";

import { signIn } from "next-auth/react";
import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function LoginContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/tabs";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl });
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
      setLoading(false);
      return;
    }

    window.location.href = callbackUrl;
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-sand-50 px-4 pt-8 md:pt-16">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-semibold">Sign in to PartyTab</h1>
          <p className="mt-2 text-sm text-ink-500">
            Split expenses with friends, settle before you leave.
          </p>
        </div>

        <div className="rounded-3xl border border-sand-200 bg-white/80 p-6 space-y-4">
          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 rounded-full border border-sand-200 bg-white px-6 py-3 text-sm font-medium hover:bg-sand-50 transition"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-sand-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-ink-400">or</span>
            </div>
          </div>

          {/* Email Sign In */}
          <form onSubmit={handleEmailSignIn} className="space-y-3">
            <label className="block">
              <span className="text-xs font-semibold text-ink-700">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-sand-200 px-4 py-2 text-sm placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-ink-900 focus:ring-offset-2"
                placeholder="you@example.com"
                required
              />
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-ink-700">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-sand-200 px-4 py-2 text-sm placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-ink-900 focus:ring-offset-2"
                placeholder="••••••••"
                required
              />
            </label>

            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white hover:bg-ink-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign in with Email"}
            </button>
          </form>
        </div>

        {/* Additional options */}
        <div className="space-y-3 text-center">
          <div>
            <p className="text-xs text-ink-500">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-semibold text-ink-700 underline hover:text-ink-900">
                Create one
              </Link>
            </p>
          </div>

          <div>
            <p className="text-xs text-ink-500">
              Been added to a tab?{" "}
              <Link href="/signin" className="font-semibold text-ink-700 underline hover:text-ink-900">
                Sign in with PIN
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-ink-400">
          By continuing, you agree to PartyTab&apos;s{" "}
          <Link href="/terms" className="underline hover:text-ink-600">
            terms of service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-ink-600">
            privacy policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-sand-50">
        <p className="text-ink-500">Loading...</p>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
