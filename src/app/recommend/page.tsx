'use client';
import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { scoreIdeas, type Scored } from '@/lib/match';

type ChipProps = { label: string; selected?: boolean; onClick?: () => void; disabled?: boolean };
function Chip({ label, selected, onClick, disabled }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      disabled={disabled}
      className={[
        "rounded-2xl px-4 py-2 border text-sm md:text-base transition select-none inline-flex items-center gap-2",
        selected
          ? "bg-gradient-to-r from-indigo-500 to-blue-600 text-white border-transparent shadow-md shadow-blue-600/20 ring-2 ring-blue-500/30"
          : "bg-white border-gray-300 text-gray-800 hover:bg-gray-50 hover:border-gray-400",
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      ].join(" ")}
    >
      {selected && (
        <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M16.7 5.7l-7.7 7.7L3.3 7.7" />
        </svg>
      )}
      <span>{label}</span>
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-3">{title}</h2>
      {children}
    </section>
  );
}

function Progress({ step, total }: { step: number; total: number }) {
  const pct = Math.round((step / total) * 100);
  return (
    <div className="sticky top-0 z-10 bg-white/75 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="h-1 w-full bg-gray-200">
        <div className="h-1 bg-blue-600 transition-all" style={{ width: `${pct}%` }} aria-label={`Progress ${pct}%`} />
      </div>
    </div>
  );
}

type Single = { type: 'single'; id: string; title: string; options: string[]; required?: boolean };
type Multi = { type: 'multi'; id: string; title: string; options: string[]; max: number; required?: boolean };
type Question = Single | Multi;

const Q1: Single = { type: 'single', id: 'build', title: 'What do you want to build?', options: ['Local services','Product store (Shopify/Etsy/Amazon)','Content/creator business','B2B SaaS / analytics / API','Marketplace / platform','Hardware / hard-tech','Not sure'], required: true };
const Q2: Single = { type: 'single', id: 'work_mode', title: 'How hands-on do you want the work to be?', options: ['Field work','Remote/desk','Mix / flexible'], required: true };
const Q3: Single = { type: 'single', id: 'capital', title: 'How much starting capital can you invest (USD)?', options: ['<$100','$100–$500','$500–$2,000','$2,000–$5,000','$5,000+'], required: true };
const Q4: Single = { type: 'single', id: 'time_to_cash', title: 'How quickly do you need first cash?', options: ['This month','2–3 months','6+ months'], required: true };
const Q5: Single = { type: 'single', id: 'sales', title: 'Sales comfort', options: ['Okay with outreach & calls','Prefer inbound/SEO/ads','Minimal selling'], required: true };
const Q6: Single = { type: 'single', id: 'labor', title: 'Labor intensity you’re okay with', options: ['Low','Medium','High'], required: true };
const Q7: Single = { type: 'single', id: 'vehicle', title: 'Vehicle access (for local ideas)', options: ['No vehicle','Car/SUV','Pickup/van'], required: true };
const Q8: Single = { type: 'single', id: 'inventory', title: 'Inventory tolerance', options: ['None','Light','Okay with inventory/logistics'], required: true };
const Q9: Single = { type: 'single', id: 'compliance', title: 'Compliance/regulation comfort', options: ['Low','Medium','High'], required: true };
const Q10: Single = { type: 'single', id: 'customer', title: 'Preferred customers', options: ['Consumers','SMBs','Enterprises','Government/Utilities/Healthcare'], required: true };
const Q11: Multi = { type: 'multi', id: 'gtm', title: 'Go-to-market you prefer (pick up to 2)', options: ['Local SEO/Google Business','Online ads & social','Outbound/field sales','Channel/alliances'], max: 2, required: true };
const Q12: Multi = { type: 'multi', id: 'skills', title: 'Your skills (pick up to 3)', options: ['Sales','Operations','Marketing/SEO','Video/content/design','Coding/data/AI','Teaching/coaching','Handyman/trades/auto'], max: 3, required: true };
const Q13: Multi = { type: 'multi', id: 'interests', title: 'Your interests (pick up to 3)', options: ['Home & property','Auto & mobility','Fitness & wellness','Education & kids','Pets','Food','Tech & media','Climate & energy','Health'], max: 3, required: true };
const Q14: Single = { type: 'single', id: 'location', title: 'Location context', options: ['Big city / large metro','Mid-size city','Small town / rural','Serve globally / online only'], required: true };

const QX1: Single = { type: 'single', id: 'monetization', title: 'Monetization preference', options: ['Subscription','Usage-based','Transaction fee','Licensing','Hardware + recurring'], required: true };
const QX2: Single = { type: 'single', id: 'tech_data', title: 'Tech & data constraints', options: ['No sensitive data / no hardware','Okay with sensitive data (health/finance/PII)','Comfortable with hardware components'], required: true };
const QX3: Single = { type: 'single', id: 'geo', title: 'Geo target', options: ['US-first','Global','Emerging markets'], required: true };

const BASE_STEPS: Question[] = [Q1,Q2,Q3,Q4,Q5,Q6,Q7,Q8,Q9,Q10,Q11,Q12,Q13,Q14];

function looksDeepTech(answers: Record<string, string[] | string | undefined>) {
  const build = answers['build'] as string | undefined;
  const cust = answers['customer'] as string | undefined;
  const comp = answers['compliance'] as string | undefined;
  return (
    build === 'B2B SaaS / analytics / API' ||
    build === 'Marketplace / platform' ||
    build === 'Hardware / hard-tech' ||
    cust === 'Enterprises' ||
    cust === 'Government/Utilities/Healthcare' ||
    comp === 'High'
  );
}

function ConferenceAnim({ show }: { show: boolean }) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    if (!show) return;
    setPhase(0);
    const steps = [900, 900, 900, 900];
    let t = 0;
    steps.forEach((ms, i) => {
      setTimeout(() => setPhase(i + 1), t += ms);
    });
  }, [show]);
  return (
    <div className={`fixed inset-0 flex items-center justify-center bg-gray-900/95 text-white transition ${show ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
      <div className="max-w-3xl w-full px-8">
        <div className="text-center mb-6">
          <div className="text-2xl md:text-3xl font-bold">Analyzing your answers…</div>
          <div className="text-sm text-gray-300 mt-1">Simulating a global business conference</div>
        </div>
        <div className="relative h-48 md:h-56 rounded-3xl bg-gradient-to-r from-gray-800 to-gray-700 overflow-hidden shadow-2xl">
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/10 to-transparent"></div>
          <div className="absolute -left-10 top-6 w-28 h-40 bg-gray-600/40 rounded-lg rotate-[-6deg] blur-sm"></div>
          <div className="absolute left-8 bottom-6 flex items-end gap-6">
            <div className="w-12 h-24 bg-gray-300 rounded-md"></div>
            <div className="w-12 h-28 bg-gray-200 rounded-md"></div>
            <div className="w-12 h-[6.5rem] bg-gray-400 rounded-md"></div>
          </div>
          <div className="absolute right-8 bottom-8 flex items-center gap-4">
            <div className="w-10 h-16 bg-blue-500/70 rounded-md"></div>
            <div className="w-10 h-16 bg-indigo-500/70 rounded-md"></div>
            <div className="w-10 h-16 bg-violet-500/70 rounded-md"></div>
          </div>
          <div className={`absolute left-32 top-10 px-3 py-2 rounded-xl bg-white text-gray-900 text-xs md:text-sm shadow ${phase>=1?'opacity-100 translate-y-0':'opacity-0 -translate-y-3'} transition-all`} style={{transitionDuration:'400ms'}}>Market sizing</div>
          <div className={`absolute left-52 top-20 px-3 py-2 rounded-xl bg-white text-gray-900 text-xs md:text-sm shadow ${phase>=2?'opacity-100 translate-y-0':'opacity-0 -translate-y-3'} transition-all`} style={{transitionDuration:'400ms'}}>Capital fit</div>
          <div className={`absolute right-40 top-12 px-3 py-2 rounded-xl bg-white text-gray-900 text-xs md:text-sm shadow ${phase>=3?'opacity-100 translate-y-0':'opacity-0 -translate-y-3'} transition-all`} style={{transitionDuration:'400ms'}}>GTM channels</div>
          <div className={`absolute right-24 bottom-14 px-3 py-2 rounded-xl bg-white text-gray-900 text-xs md:text-sm shadow ${phase>=4?'opacity-100 translate-y-0':'opacity-0 -translate-y-3'} transition-all`} style={{transitionDuration:'400ms'}}>Skills match</div>
          <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-gray-900/60 to-transparent"></div>
        </div>
        <div className="mt-5 h-2 w-full bg-gray-700 rounded-full overflow-hidden">
          <div className="h-2 bg-blue-500 rounded-full" style={{width: `${25 * (phase || 1)}%`, transition: 'width 300ms ease'}}></div>
        </div>
      </div>
    </div>
  );
}

type Rec = Scored;

function HUDOverlay({
  idea,
  onClose
}: {
  idea: Rec | null;
  onClose: () => void;
}) {
  const [show, setShow] = useState(false);
  const [showStart, setShowStart] = useState(false);

  useEffect(() => {
    if (idea) {
      setShow(true);
      const t = setTimeout(() => setShowStart(true), 5000);
      return () => clearTimeout(t);
    } else {
      setShow(false);
      setShowStart(false);
    }
  }, [idea]);

  if (!idea) return null;

  const keywords = Array.from(new Set([
    idea.category, idea.customer, idea.workMode, idea.timeToCash, idea.sales, idea.labor,
    ...(idea.gtm || []), ...(idea.skills || []), ...(idea.interests || [])
  ].filter(Boolean))).map(s => String(s).toUpperCase());

  return (
    <div className={`fixed inset-0 z-50 transition ${show ? 'opacity-100' : 'opacity-0'} bg-black/80`}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-0 right-0 overflow-hidden whitespace-nowrap opacity-20">
          <div className="inline-block pr-12 animate-[ticker_20s_linear_infinite] will-change-transform">
            {keywords.concat(keywords).map((k, i) => (
              <span key={`t1-${i}`} className="mx-6 font-mono tracking-widest text-sm text-emerald-300">{k}</span>
            ))}
          </div>
        </div>
        <div className="absolute top-24 left-0 right-0 overflow-hidden whitespace-nowrap opacity-10">
          <div className="inline-block pr-12 animate-[ticker_28s_linear_infinite] will-change-transform">
            {keywords.concat(keywords).map((k, i) => (
              <span key={`t2-${i}`} className="mx-6 font-mono tracking-widest text-sm text-cyan-300">{k}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="relative h-full w-full flex items-center justify-center px-4">
        <div className="absolute top-6 left-6">
          <button onClick={onClose} className="rounded-full border border-white/30 text-white/90 hover:text-white hover:bg-white/10 px-4 py-2 text-sm">Back</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 max-w-6xl w-full">
          <div className="md:col-span-3 rounded-3xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-white/10 p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl md:text-3xl font-extrabold text-white">{idea.title}</h3>
                <div className="mt-1 text-sm text-gray-300">{idea.blurb}</div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-extrabold text-emerald-400">{Math.round(idea.score)}%</div>
                <div className="text-xs text-gray-400">match</div>
              </div>
            </div>

            <div className="mt-5 grid gap-3 text-sm text-gray-200">
              <div><span className="font-semibold">Category:</span> {idea.category.toUpperCase()}</div>
              <div><span className="font-semibold">Customer:</span> {String(idea.customer).toUpperCase()}</div>
              <div><span className="font-semibold">Go-to-market:</span> {(idea.gtm||[]).join(', ') || '—'}</div>
              <div><span className="font-semibold">Skills leveraged:</span> {(idea.skills||[]).join(', ') || '—'}</div>
              <div><span className="font-semibold">Interests aligned:</span> {(idea.interests||[]).join(', ') || '—'}</div>
            </div>

            <div className="mt-6">
              <div className="text-sm font-semibold text-white mb-2">Description</div>
              <div className="text-sm text-gray-200 leading-relaxed">
                Launch and operate <span className="font-semibold">{idea.title}</span>. Work mode: <span className="font-semibold">{idea.workMode}</span>. Typical time to first cash: <span className="font-semibold">{idea.timeToCash}</span>. Sales effort: <span className="font-semibold">{idea.sales}</span>. Labor intensity: <span className="font-semibold">{idea.labor}</span>. Inventory: <span className="font-semibold">{(idea as any).inventory}</span>. Compliance: <span className="font-semibold">{idea.compliance}</span>. GTM channels include <span className="font-semibold">{(idea.gtm||[]).join(', ') || '—'}</span>. This path leverages <span className="font-semibold">{(idea.skills||[]).join(', ') || 'generalist ops'}</span> skills and aligns with interests in <span className="font-semibold">{(idea.interests||[]).join(', ') || 'small business'}</span>.
              </div>
              {idea.reasons?.length ? (
                <div className="mt-4">
                  <div className="text-sm font-semibold text-white mb-1">Why you match</div>
                  <ul className="list-disc pl-5 text-sm text-gray-200">
                    {idea.reasons.slice(0,5).map((r,i)=>(<li key={i}>{r}</li>))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>

          <div className="md:col-span-2 rounded-3xl bg-gray-900/70 border border-white/10 p-6 text-emerald-300">
            <div className="text-sm font-mono tracking-wide text-gray-300 mb-2">TACTICAL STATS</div>
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-gray-800/60 rounded-lg p-3 border border-white/5">
                <div className="text-gray-400">CAPITAL BAND</div>
                <div className="text-emerald-300 text-lg">${(idea as any).capitalBand?.[0] ?? '—'}–${(idea as any).capitalBand?.[1] ?? '—'}</div>
              </div>
              <div className="bg-gray-800/60 rounded-lg p-3 border border-white/5">
                <div className="text-gray-400">TIME TO CASH</div>
                <div className="text-emerald-300 text-lg">{idea.timeToCash.toUpperCase()}</div>
              </div>
              <div className="bg-gray-800/60 rounded-lg p-3 border border-white/5">
                <div className="text-gray-400">COMPLIANCE</div>
                <div className="text-emerald-300 text-lg">{idea.compliance.toUpperCase()}</div>
              </div>
              <div className="bg-gray-800/60 rounded-lg p-3 border border-white/5">
                <div className="text-gray-400">WORK MODE</div>
                <div className="text-emerald-300 text-lg">{idea.workMode.toUpperCase()}</div>
              </div>
              <div className="bg-gray-800/60 rounded-lg p-3 border border-white/5">
                <div className="text-gray-400">SALES EFFORT</div>
                <div className="text-emerald-300 text-lg">{idea.sales.toUpperCase()}</div>
              </div>
              <div className="bg-gray-800/60 rounded-lg p-3 border border-white/5">
                <div className="text-gray-400">LABOR</div>
                <div className="text-emerald-300 text-lg">{idea.labor.toUpperCase()}</div>
              </div>
              <div className="bg-gray-800/60 rounded-lg p-3 border border-white/5">
                <div className="text-gray-400">INVENTORY</div>
                <div className="text-emerald-300 text-lg">{(idea as any).inventory?.toUpperCase?.() ?? '—'}</div>
              </div>
              <div className="bg-gray-800/60 rounded-lg p-3 border border-white/5">
                <div className="text-gray-400">CUSTOMER</div>
                <div className="text-emerald-300 text-lg">{String(idea.customer).toUpperCase()}</div>
              </div>
            </div>
            <div className={`mt-6 flex justify-center ${showStart ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
              <Link
                href={`/idea?title=${encodeURIComponent(idea.title)}`}
                className="rounded-full bg-emerald-500 hover:bg-emerald-400 text-gray-900 font-semibold px-6 py-3"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type Rec = Scored;

export default function RecommendPage() {
  const [stepIdx, setStepIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[] | string>>({});
  const [loading, setLoading] = useState(false);
  const [recs, setRecs] = useState<Rec[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [anim, setAnim] = useState(false);
  const [focus, setFocus] = useState<Rec | null>(null);

  const steps: Question[] = useMemo(() => {
    const base = [Q1,Q2,Q3,Q4,Q5,Q6,Q7,Q8,Q9,Q10,Q11,Q12,Q13,Q14];
    if (looksDeepTech(answers)) base.push(QX1, QX2, QX3);
    return base;
  }, [answers]);

  const step = steps[stepIdx];

  function setSingle(id: string, value: string) { setAnswers((a) => ({ ...a, [id]: value })); }
  function toggleMulti(id: string, value: string, max: number) {
    setAnswers((a) => {
      const cur = new Set<string>((a[id] as string[]) || []);
      if (cur.has(value)) cur.delete(value);
      else if (cur.size < max) cur.add(value);
      return { ...a, [id]: Array.from(cur) };
    });
  }
  function canContinue(q: Question) {
    const val = answers[q.id];
    if (!q.required) return true;
    if (q.type === 'single') return typeof val === 'string' && val.length > 0;
    if (q.type === 'multi') return Array.isArray(val) && val.length > 0;
    return true;
  }
  function next() { if (stepIdx < steps.length - 1) setStepIdx(stepIdx + 1); }
  function back() { if (stepIdx > 0) setStepIdx(stepIdx - 1); }

  async function submit() {
    setLoading(true);
    setError(null);
    setRecs(null);
    setAnim(true);
    setTimeout(() => {
      const ranked = scoreIdeas(answers);
      setRecs(ranked.slice(0, 10));
      setLoading(false);
      setAnim(false);
    }, 4200);
  }

  function renderQuestion(q: Question) {
    if (q.type === 'single') {
      const val = (answers[q.id] as string) || '';
      return (
        <div className="flex flex-wrap gap-3">
          {q.options.map((opt) => (
            <Chip key={opt} label={opt} selected={val === opt} onClick={() => setSingle(q.id, opt)} />
          ))}
        </div>
      );
    }
    const cur = new Set<string>((answers[q.id] as string[]) || []);
    return (
      <div className="flex flex-wrap gap-3">
        {q.options.map((opt) => (
          <Chip key={opt} label={opt} selected={cur.has(opt)} onClick={() => toggleMulti(q.id, opt, q.max)} disabled={!cur.has(opt) && cur.size >= q.max} />
        ))}
        <div className="text-sm text-gray-500 self-center">Pick up to {q.max}</div>
      </div>
    );
  }

  function renderResults() {
    if (error) return <p className="text-red-600">{error}</p>;
    if (loading) return <div className="flex items-center gap-3 text-gray-600"><span className="animate-spin inline-block h-5 w-5 rounded-full border-2 border-gray-300 border-t-transparent" />Generating your best matches…</div>;
    if (!recs) return null;
    if (!recs.length) return <p>No strong matches yet—try adjusting a couple answers.</p>;
    return (
      <div className="grid gap-6">
        {recs.slice(0, 5).map((r, idx) => (
          <button key={r.title + idx} onClick={() => setFocus(r)} className="text-left rounded-2xl border border-gray-200 p-6 bg-white shadow-sm hover:shadow-md transition">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl md:text-2xl font-semibold text-gray-900">{r.title}</h3>
                <p className="mt-1 text-sm text-gray-700">{r.blurb}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-extrabold text-gray-900">{Math.round(r.score)}%</div>
                <div className="text-xs text-gray-500">match</div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-gray-700">
              <div><span className="font-medium">Category:</span> {r.category}</div>
              <div><span className="font-medium">Customer:</span> {String(r.customer)}</div>
              <div><span className="font-medium">Work mode:</span> {r.workMode}</div>
              <div><span className="font-medium">Time to cash:</span> {r.timeToCash}</div>
              <div><span className="font-medium">Sales effort:</span> {r.sales}</div>
              <div><span className="font-medium">Labor:</span> {r.labor}</div>
              <div className="col-span-2"><span className="font-medium">GTM:</span> {(r.gtm||[]).join(', ') || '—'}</div>
            </div>
            {r.reasons?.length > 0 && (
              <div className="mt-3">
                <div className="text-sm font-medium text-gray-900 mb-1">Why this fits</div>
                <ul className="list-disc pl-5 text-sm text-gray-700">
                  {r.reasons.slice(0,3).map((k, i) => <li key={i}>{k}</li>)}
                </ul>
              </div>
            )}
          </button>
        ))}
      </div>
    );
  }

  const atLastStep = stepIdx === steps.length - 1;

  return (
    <main className="min-h-screen bg-white">
      <ConferenceAnim show={anim} />
      <HUDOverlay idea={focus} onClose={() => setFocus(null)} />
      <Progress step={stepIdx} total={steps.length - 1} />
      <div className="max-w-4xl mx-auto px-6 py-10 md:py-14">
        {!recs ? (
          <>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-8">Get Matched Ideas</h1>
            <div className="rounded-3xl border border-gray-200 bg-gray-50/60 p-6 md:p-8">
              <Section title={step.title}>
                {renderQuestion(step)}
              </Section>
              <div className="flex items-center justify-between pt-2">
                <button onClick={back} disabled={stepIdx === 0} className="rounded-full px-4 py-2 text-sm border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50">Back</button>
                <div className="text-sm text-gray-500">{stepIdx + 1} / {steps.length}</div>
                {atLastStep ? (
                  <button onClick={submit} className="rounded-full bg-[#2563EB] text-white px-5 py-2 font-semibold hover:opacity-95">Get Recommendations</button>
                ) : (
                  <button onClick={next} disabled={!canContinue(step)} className="rounded-full bg-[#2563EB] text-white px-5 py-2 font-semibold hover:opacity-95 disabled:opacity-50">Next</button>
                )}
              </div>
            </div>
            {looksDeepTech(answers) && (<p className="mt-4 text-sm text-gray-500">You’re trending toward deep-tech/global—extra questions added to tailor results.</p>)}
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900">Your Top Matches</h1>
              <button onClick={() => { setRecs(null); setStepIdx(0); setAnswers({}); }} className="rounded-full border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Back</button>
            </div>
            {renderResults()}
          </>
        )}
      </div>
    </main>
  );
}
