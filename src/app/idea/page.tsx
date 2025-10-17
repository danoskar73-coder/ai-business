'use client';
import { useEffect, useState } from 'react';

type Plan = {
  summary?: string;
  estBudget?: { min?: number; max?: number };
  estTimelineMonths?: number;
  risks?: string[];
  first10Steps?: { order?: number; title?: string; checklist?: string[] }[];
  kpisWeek1?: string[];
};

function fmtUSD(n?: number) {
  if (typeof n !== 'number' || !isFinite(n)) return '';
  return n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

export default function Page() {
  const [idea, setIdea] = useState('');
  const [capital, setCapital] = useState<string>('');
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prefill from ?seed=
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    const seed = url.searchParams.get('seed');
    if (seed && !idea) setIdea(seed);
  }, []);

  async function submit() {
    setError(null);
    setPlan(null);
    if (!idea.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea, capital: Number(capital || 0) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Request failed');
      setPlan(data);
    } catch (e:any) {
      setError(e?.message || 'Something went wrong. Try again.');
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
            className="w-full rounded-2xl border border-gray-300 p-5 h-44 md:h-52 focus:outline-none focus:ring-4 focus:ring-blue-100"
            placeholder="Describe your business idea (and constraints if any)…"
            value={idea}
            onChange={e => setIdea(e.target.value)}
          />
          <div className="mt-3 max-w-sm">
            <label className="block text-sm text-gray-700 mb-1">Budget you can invest (USD)</label>
            <input
              type="number"
              inputMode="numeric"
              className="w-full rounded-2xl border border-gray-300 p-3 placeholder:text-gray-400"
              placeholder="e.g., 1000"
              value={capital}
              onChange={(e)=>setCapital(e.target.value)}
            />
          </div>
          <button
            onClick={submit}
            disabled={!idea || loading}
            className="mt-5 inline-block rounded-full bg-[#2563EB] px-8 md:px-10 py-3.5 md:py-4 text-white text-[18px] font-semibold shadow-[0_8px_24px_rgba(37,99,235,0.25)] disabled:opacity-50 transition"
          >
            {loading ? 'Thinking…' : 'Generate Plan Preview'}
          </button>
        </div>

        {error && <p className="mt-4 text-red-600">{error}</p>}

        {plan && (
          <section className="mt-10 space-y-6">
            {plan.summary && (
              <div className="rounded-2xl border p-6">
                <h2 className="text-xl font-semibold mb-2">Summary</h2>
                <p className="text-gray-700">{plan.summary}</p>
              </div>
            )}

            {(plan.estBudget?.min !== undefined || plan.estBudget?.max !== undefined || plan.estTimelineMonths !== undefined) && (
              <div className="grid md:grid-cols-3 gap-4">
                {(plan.estBudget?.min !== undefined || plan.estBudget?.max !== undefined) && (
                  <div className="rounded-2xl border p-6">
                    <div className="text-sm text-gray-500">Budget</div>
                    <div className="text-lg font-semibold">
                      {fmtUSD(plan.estBudget?.min)}{plan.estBudget?.min!==undefined && plan.estBudget?.max!==undefined ? ' – ' : ''}{fmtUSD(plan.estBudget?.max)}
                    </div>
                  </div>
                )}
                {plan.estTimelineMonths !== undefined && (
                  <div className="rounded-2xl border p-6">
                    <div className="text-sm text-gray-500">Timeline</div>
                    <div className="text-lg font-semibold">{plan.estTimelineMonths} months</div>
                  </div>
                )}
                {plan.kpisWeek1?.length ? (
                  <div className="rounded-2xl border p-6">
                    <div className="text-sm text-gray-500">Week 1 KPIs</div>
                    <ul className="list-disc ml-5 text-gray-700">
                      {plan.kpisWeek1.map((k, i) => <li key={i}>{k}</li>)}
                    </ul>
                  </div>
                ) : null}
              </div>
            )}

            {plan.risks?.length ? (
              <div className="rounded-2xl border p-6">
                <h2 className="text-xl font-semibold mb-3">Top Risks</h2>
                <ul className="list-disc ml-5 text-gray-700">
                  {plan.risks.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            ) : null}

            {plan.first10Steps?.length ? (
              <div className="rounded-2xl border p-6">
                <h2 className="text-xl font-semibold mb-3">First 10 Steps</h2>
                <ol className="space-y-3">
                  {plan.first10Steps.map((step, idx) => (
                    <li key={idx} className="rounded-xl border p-4">
                      <div className="font-medium">
                        {(step.order ?? idx + 1)}. {step.title || `Step ${idx + 1}`}
                      </div>
                      {step.checklist?.length ? (
                        <ul className="list-disc ml-5 text-gray-700 mt-1">
                          {step.checklist.map((c, i) => <li key={i}>{c}</li>)}
                        </ul>
                      ) : null}
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}
          </section>
        )}
      </section>
    </main>
  );
}
