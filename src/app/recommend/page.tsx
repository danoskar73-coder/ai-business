'use client';
import { useEffect, useState } from 'react';

type IdeaCard = {
  title: string;
  description: string;
  matchScore: number;
  visibleSteps: string[];
  hiddenSteps: string[];
};

export default function Page() {
  const [capital, setCapital] = useState<string>('');
  const [skills, setSkills] = useState('');
  const [passions, setPassions] = useState('');
  const [location, setLocation] = useState('');
  const [ideas, setIdeas] = useState<IdeaCard[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isProfileBlank =
    (capital === '' || Number(capital) === 0) &&
    skills.trim() === '' &&
    passions.trim() === '' &&
    location.trim() === '';

  // restore from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = JSON.parse(localStorage.getItem('abg_profile') || 'null');
      if (saved) {
        setCapital(saved.capital ?? '');
        setSkills(saved.skills ?? '');
        setPassions(saved.passions ?? '');
        setLocation(saved.location ?? '');
      }
    } catch {}
  }, []);

  // persist to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('abg_profile', JSON.stringify({ capital, skills, passions, location }));
  }, [capital, skills, passions, location]);

  async function submit() {
    setIdeas(null);
    setError(null);
    if (isProfileBlank) {
      setError('Please fill at least one field (capital, skills, passions, or location).');
      return;
    }
    setLoading(true);
    const res = await fetch('/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        capital: Number(capital || 0),
        skills, passions, location
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data?.error || 'Something went wrong. Try again.');
      setLoading(false);
      return;
    }
    setIdeas(data.ideas);
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-white">
      <section className="max-w-5xl mx-auto px-6 pt-24 md:pt-28 pb-28">
        <h1 className="text-[40px] md:text-[56px] font-extrabold tracking-tight text-gray-900 leading-[1.05]">
          Get Matched Ideas
        </h1>

        {/* Inputs */}
        <div className="grid md:grid-cols-2 gap-5 mt-8">
          <div>
            <label className="block text-sm font-medium text-gray-700">Capital (USD)</label>
            <input
              type="number"
              inputMode="numeric"
              autoComplete="off"
              className="w-full rounded-2xl border border-gray-300 p-3 placeholder:text-gray-400"
              placeholder="e.g., 1000"
              value={capital}
              onChange={(e)=>setCapital(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">Leave blank if unsure.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input
              className="w-full rounded-2xl border border-gray-300 p-3 placeholder:text-gray-400"
              placeholder="e.g., New York, NY"
              autoComplete="off"
              value={location}
              onChange={(e)=>setLocation(e.target.value)}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Skills (comma separated)</label>
            <input
              className="w-full rounded-2xl border border-gray-300 p-3 placeholder:text-gray-400"
              placeholder="e.g., marketing, sales"
              autoComplete="off"
              value={skills}
              onChange={(e)=>setSkills(e.target.value)}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Passions (comma separated)</label>
            <input
              className="w-full rounded-2xl border border-gray-300 p-3 placeholder:text-gray-400"
              placeholder="e.g., cars, fitness"
              autoComplete="off"
              value={passions}
              onChange={(e)=>setPassions(e.target.value)}
            />
          </div>
        </div>

        <button
          onClick={submit}
          disabled={loading || isProfileBlank}
          className={`mt-6 inline-block rounded-full px-8 md:px-10 py-3.5 md:py-4 text-[18px] font-semibold transition
            ${loading || isProfileBlank
              ? 'bg-[#2563EB] text-white opacity-50 cursor-not-allowed'
              : 'bg-[#2563EB] text-white shadow-[0_8px_24px_rgba(37,99,235,0.25)] hover:opacity-95'}`}
        >
          {loading ? 'Matching…' : 'Get Recommendations'}
        </button>

        {isProfileBlank && (
          <p className="mt-3 text-sm text-gray-600">
            Add <span className="font-medium">any</span> detail (capital, a skill, a passion, or a location) to get tailored matches.
          </p>
        )}
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        {/* Results */}
        {ideas && (
          <div className="mt-10 grid gap-5">
            {ideas.map((it, i)=>(
              <div key={i} className="rounded-2xl border p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">{it.title}</h3>
                  <span className="text-blue-600 font-semibold">{Math.round(it.matchScore)}%</span>
                </div>
                <p className="text-gray-700 mt-1">{it.description}</p>

                {/* Teaser steps */}
                <div className="mt-4">
                  <div className="text-sm font-medium text-gray-500 mb-1">First steps</div>
                  <ul className="list-disc ml-5 text-gray-800">
                    {it.visibleSteps.map((s,idx)=>(
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                  <div className="mt-2">
                    <a
                      href={`/idea?seed=${encodeURIComponent(it.title)}`}
                      className="text-blue-600 hover:underline text-sm font-medium"
                    >
                      See how it starts →
                    </a>
                  </div>

                  {/* Blurred rest */}
                  {it.hiddenSteps.length > 0 && (
                    <div className="mt-3 relative border rounded-xl p-4">
                      <div className="text-sm font-medium text-gray-500 mb-1">Full plan preview</div>
                      <ul className="list-disc ml-5 text-gray-800 filter blur-[2px] select-none pointer-events-none">
                        {it.hiddenSteps.map((s,idx)=>(
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>

                      {/* Overlay CTA */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 rounded-xl">
                        <div className="text-gray-900 font-semibold mb-2">Unlock the full step-by-step plan</div>
                        <a
                          href="/mentor"
                          className="inline-block rounded-full bg-black px-6 py-2 text-white text-sm font-semibold hover:opacity-90 transition"
                        >
                          Activate a Mentor
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
