'use client';
import { useState, useMemo } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

const ACCOUNT_TYPES = ["Founder","Partner","Employee","Mentor","Investor","Admin"] as const;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [accountType, setAccountType] = useState<(typeof ACCOUNT_TYPES)[number]>("Founder");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string|null>(null);

  const router = useRouter();
  const sp = useSearchParams();
  const callbackUrl = useMemo(() => sp.get("callbackUrl") || "/", [sp]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      accountType,
      redirect: false,   // avoid built-in redirect flakiness locally
      callbackUrl,
    });

    setLoading(false);

    if (!res) { setErr("Network error. Try again."); return; }
    if (res.error) { setErr(res.error); return; }
    router.push(callbackUrl || "/");
  }

  return (
    <main className="min-h-screen bg-white">
      <section className="max-w-md mx-auto px-6 pt-24 md:pt-28 pb-28">
        <h1 className="text-[36px] md:text-[48px] font-extrabold tracking-tight text-gray-900 text-center">Login</h1>
        <p className="mt-2 text-center text-gray-600">Choose your account type and sign in.</p>

        <form onSubmit={submit} className="mt-8 grid gap-4">
          <input
            type="email"
            required
            className="w-full rounded-2xl border border-gray-300 p-3 placeholder:text-gray-400"
            placeholder="you@example.com"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
            <select
              className="w-full rounded-2xl border border-gray-300 p-3"
              value={accountType}
              onChange={(e)=>setAccountType(e.target.value as any)}
            >
              {ACCOUNT_TYPES.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <p className="text-xs text-gray-500 mt-1">Founder, Partner, Employee, Mentor, Investor, Admin.</p>
          </div>
          {err && <p className="text-sm text-red-600">{err}</p>}
          <button
            type="submit"
            disabled={loading}
            className={`rounded-full px-6 py-3 font-semibold text-white ${loading ? "bg-gray-400" : "bg-[#2563EB] hover:opacity-95"} transition`}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
          <p className="text-xs text-gray-500 text-center">
            Dev login (no password). We’ll switch to magic link or OAuth later.
          </p>
        </form>
      </section>
    </main>
  );
}
