'use client';
import { useState } from 'react';

type Plan = {
  summary: string;
  estBudget: { min: number; max: number };
  estTimelineMonths: number;
  risks: string[];
  first10Steps: { order: number; title: string; checklist?: string[] }[];
  kpisWeek1: string[];
};

export default function Page() {
  const [idea, setIdea] = useState('');
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    setPlan(null);
    if (!idea.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea }),
      });
      const data = await res.json();
      setPlan(data);
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <section className="max-w-5xl mx-auto px-6 pt-24 md:pt-28 pb-28">
        <h1 className="text-[40px] md:text-[56px] font-extrabold tracking-tight text-gray-900 leading-[1.05]">
          Start with Your Idea
        </h1>

        <div className="mt-8">
          <textarea
            className="w-full rounded-2xl border border-gray-300 p-5 h-44 md:h-52
                       focus:outline-none focus:ring-4 focus:ring-blue-100"
            placeholder="Describe your business idea (and constraints if any)…"
            value={idea}
            onChange={e => setIdea(e.target.value)}
          />
          <button
            onClick={submit}
            disabled={!idea || loading}
            className="mt-5 inline-block rounded-full bg-[#2563EB] px-8 md:px-10 py-3.5 md:py-4
                       text-white text-[18px] font-semibold shadow-[0_8px_24px_rgba(37,99,235,0.25)]
                       disabled:opacity-50 transition"
          >
            {loading ? 'Thinking…' : 'Generate Plan Preview'}
          </button>
        </div>

        {error && <p className="mt-4 text-red-600">{error}</p>}

        {plan && (
          <section className="mt-10 space-y-6">
            <div className="rounded-2xl border p-6">
              <h2 className="text-xl font-semibold mb-2">Summary</h2>
              <p className="text-gray-700">{plan.summary}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="rounded-2xl border p-6">
                <div className="text-sm text-gray-500">Budget</div>
                <div className="text-lg font-semibold">${plan.estBudget.min} – ${plan.estBudget.max}</div>
              </div>
              <div className="rounded-2xl border p-6">
                <div className="text-sm text-gray-500">Timeline</div>
                <div className="text-lg font-semibold">{plan.estTimelineMonths} months</div>
              </div>
              <div className="rounded-2xl border p-6">
                <div className="text-sm text-gray-500">Week 1 KPIs</div>
                <ul className="list-disc ml-5 text-gray-700">
                  {plan.kpisWeek1.map((k, i) => <li key={i}>{k}</li>)}
                </ul>
              </div>
            </div>

            <div className="rounded-2xl border p-6">
              <h2 className="text-xl font-semibold mb-3">Top Risks</h2>
              <ul className="list-disc ml-5 text-gray-700">
                {plan.risks.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>

            <div className="rounded-2xl border p-6">
              <h2 className="text-xl font-semibold mb-3">First 10 Steps</h2>
              <ol className="space-y-3">
                {plan.first10Steps.map(step => (
                  <li key={step.order} className="rounded-xl border p-4">
                    <div className="font-medium">{step.order}. {step.title}</div>
                    {step.checklist?.length ? (
                      <ul className="list-disc ml-5 text-gray-700 mt-1">
                        {step.checklist.map((c, i) => <li key={i}>{c}</li>)}
                      </ul>
                    ) : null}
                  </li>
                ))}
              </ol>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
