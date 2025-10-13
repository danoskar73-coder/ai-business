'use client';
import { useState } from 'react';

type IdeaCard = {
  title: string;
  description: string;
  matchScore: number;
};

export default function Page() {
  // Start empty; placeholders will show grey examples
  const [capital, setCapital] = useState<string>('');       // keep as string for input control
  const [skills, setSkills] = useState('');                 // e.g. "marketing, sales"
  const [passions, setPassions] = useState('');             // e.g. "cars, fitness"
  const [location, setLocation] = useState('');             // e.g. "New York, NY"
  const [ideas, setIdeas] = useState<IdeaCard[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    const payload = {
      capital: Number(capital || 0), // coerce to number; 0 if empty
      skills,
      passions,
      location,
    };
    const res = await fetch('/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setIdeas(data.ideas);
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-white">
      <section className="max-w-5xl mx-auto px-6 pt-24 md:pt-28 pb-28">
        <h1 className="text-[40px] md:text-[56px] font-extrabold tracking-tight text-gray-900 leading-[1.05]">
          Get Matched Ideas
        </h1>

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
          disabled={loading}
          className="mt-6 inline-block rounded-full bg-[#2563EB] px-8 md:px-10 py-3.5 md:py-4
                     text-white text-[18px] font-semibold shadow-[0_8px_24px_rgba(37,99,235,0.25)]
                     disabled:opacity-50 transition"
        >
          {loading ? 'Matching…' : 'Get Recommendations'}
        </button>

        {ideas && (
          <div className="mt-8 grid gap-4">
            {ideas.map((it, i)=>(
              <div key={i} className="rounded-2xl border p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{it.title}</h3>
                  <span className="text-blue-600 font-semibold">{Math.round(it.matchScore)}%</span>
                </div>
                <p className="text-gray-700 mt-1">{it.description}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
