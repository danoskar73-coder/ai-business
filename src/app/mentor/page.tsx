'use client';
import { useState } from "react";

type State = "idle" | "submitting" | "success" | "error";

export default function Page() {
  const [plan, setPlan] = useState<"starter"|"pro">("starter");
  const [cycle, setCycle] = useState<"monthly"|"annual">("monthly");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [goal, setGoal] = useState("");
  const [channel, setChannel] = useState<"chat"|"weekly_call">("chat");
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<State>("idle");
  const [err, setErr] = useState<string | null>(null);

  const price = (p: "starter"|"pro", c: "monthly"|"annual") => {
    const base = p === "starter" ? 9 : 29;      // placeholder prices (no payments yet)
    return c === "annual" ? Math.round(base * 10) : base; // ~2 months free annually
  };

  async function submit() {
    setErr(null);
    if (!email || !email.includes("@")) { setErr("Please enter a valid email."); return; }
    if (!name) { setErr("Please enter your name."); return; }
    if (!consent) { setErr("Please accept Terms & Privacy."); return; }

    setState("submitting");
    try {
      const res = await fetch("/api/activate-mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, cycle, name, email, goal, channel, consent }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Request failed");
      setState("success");
    } catch (e: any) {
      setErr(e?.message || "Something went wrong. Try again.");
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <main className="min-h-screen bg-white">
        <section className="max-w-2xl mx-auto px-6 pt-28 pb-28 text-center">
          <h1 className="text-[40px] md:text-[56px] font-extrabold tracking-tight text-gray-900">You’re in 🎉</h1>
          <p className="mt-4 text-gray-600">
            We’ve received your request. A mentor will reach out at <span className="font-semibold">{email}</span> with next steps.
          </p>
          <div className="mt-8">
            <a href="/recommend" className="rounded-full bg-[#2563EB] text-white px-6 py-3 font-semibold inline-block">
              Continue Exploring Ideas
            </a>
          </div>
          <p className="mt-6 text-sm text-gray-500">
            Tip: reply to the mentor email with your <em>current status</em> and any <em>time constraints</em> for faster onboarding.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <section className="max-w-5xl mx-auto px-6 pt-24 md:pt-28 pb-28">
        {/* Hero */}
        <div className="text-center">
          <h1 className="text-[42px] md:text-[60px] font-extrabold tracking-tight text-gray-900 leading-[1.05]">
            Activate a Mentor
          </h1>
          <p className="mt-4 text-gray-600 text-[18px] md:text-[20px]">
            Get personal guidance and a weekly plan. Start with a light plan or go Pro when you’re ready.
          </p>
        </div>

        {/* Billing cycle toggle */}
        <div className="mt-10 flex items-center justify-center gap-2">
          <button
            onClick={()=>setCycle("monthly")}
            className={`rounded-full px-4 py-2 text-sm font-semibold border ${cycle==="monthly" ? "bg-black text-white border-black" : "border-gray-300 text-gray-800"}`}
          >Monthly</button>
          <button
            onClick={()=>setCycle("annual")}
            className={`rounded-full px-4 py-2 text-sm font-semibold border ${cycle==="annual" ? "bg-black text-white border-black" : "border-gray-300 text-gray-800"}`}
          >Annual <span className="ml-1 opacity-70">(save ~2 months)</span></button>
        </div>

        {/* Plans */}
        <div className="mt-6 grid md:grid-cols-2 gap-6">
          {/* Starter */}
          <button
            onClick={()=>setPlan("starter")}
            className={`text-left rounded-2xl border p-6 hover:shadow-sm transition ${plan==="starter" ? "border-black" : "border-gray-200"}`}
          >
            <div className="flex items-baseline justify-between">
              <h3 className="text-xl font-semibold">Starter</h3>
              <div className="text-2xl font-extrabold">${price("starter", cycle)}<span className="text-base font-normal text-gray-500">/{cycle==="annual"?"yr":"mo"}</span></div>
            </div>
            <ul className="mt-3 text-gray-700 list-disc ml-5">
              <li>1:1 chat guidance</li>
              <li>One mini-plan per week</li>
              <li>Templates & checklists</li>
            </ul>
          </button>

          {/* Pro */}
          <button
            onClick={()=>setPlan("pro")}
            className={`text-left rounded-2xl border p-6 hover:shadow-sm transition ${plan==="pro" ? "border-black" : "border-gray-200"}`}
          >
            <div className="flex items-baseline justify-between">
              <h3 className="text-xl font-semibold">Pro</h3>
              <div className="text-2xl font-extrabold">${price("pro", cycle)}<span className="text-base font-normal text-gray-500">/{cycle==="annual"?"yr":"mo"}</span></div>
            </div>
            <ul className="mt-3 text-gray-700 list-disc ml-5">
              <li>Weekly 20-min call</li>
              <li>Action reviews & KPIs</li>
              <li>Priority support</li>
            </ul>
          </button>
        </div>

        {/* Signup form */}
        <div className="mt-10 grid md:grid-cols-2 gap-6 items-start">
          <div className="rounded-2xl border p-6">
            <h4 className="text-lg font-semibold">Your Details</h4>
            <div className="mt-4 grid gap-4">
              <input
                className="w-full rounded-2xl border border-gray-300 p-3 placeholder:text-gray-400"
                placeholder="Full name"
                value={name}
                onChange={e=>setName(e.target.value)}
              />
              <input
                className="w-full rounded-2xl border border-gray-300 p-3 placeholder:text-gray-400"
                placeholder="Email address"
                inputMode="email"
                value={email}
                onChange={e=>setEmail(e.target.value)}
              />
              <select
                className="w-full rounded-2xl border border-gray-300 p-3"
                value={channel}
                onChange={e=>setChannel(e.target.value as any)}
              >
                <option value="chat">Preferred: Chat + async</option>
                <option value="weekly_call">Preferred: Weekly 20-min call</option>
              </select>
              <textarea
                className="w-full rounded-2xl border border-gray-300 p-3 h-28 placeholder:text-gray-400"
                placeholder="What’s your immediate goal for the next 30 days?"
                value={goal}
                onChange={e=>setGoal(e.target.value)}
              />
              <label className="flex items-start gap-2 text-sm text-gray-600">
                <input type="checkbox" className="mt-1" checked={consent} onChange={e=>setConsent(e.target.checked)} />
                <span>I agree to the <a className="underline" href="#">Terms</a> and <a className="underline" href="#">Privacy Policy</a>.</span>
              </label>
              {err && <p className="text-sm text-red-600">{err}</p>}
              <button
                onClick={submit}
                disabled={state==="submitting"}
                className={`rounded-full px-6 py-3 font-semibold text-white ${state==="submitting" ? "bg-gray-400" : "bg-[#2563EB] hover:opacity-95"} transition`}
              >
                {state==="submitting" ? "Submitting…" : "Activate Mentor"}
              </button>
              <p className="text-xs text-gray-500">No payment collected yet. We’ll email you to finalize.</p>
            </div>
          </div>

          {/* What you get */}
          <div className="rounded-2xl border p-6">
            <h4 className="text-lg font-semibold">What you’ll get</h4>
            <ul className="mt-4 text-gray-700 list-disc ml-5 space-y-2">
              <li>Personalized weekly action plan</li>
              <li>Tailored checklists, scripts, and templates</li>
              <li>Quick answers on roadblocks (async chat)</li>
              <li>Simple KPI tracking and feedback</li>
            </ul>
            <div className="mt-6 rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
              <div className="font-semibold text-gray-900 mb-1">Coming soon</div>
              <ul className="list-disc ml-5 space-y-1">
                <li>Stripe checkout (card/Apple Pay)</li>
                <li>Mentor availability calendar</li>
                <li>Progress dashboard</li>
              </ul>
            </div>
          </div>
        </div>

      </section>
    </main>
  );
}
