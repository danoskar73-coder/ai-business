import { NextResponse } from "next/server";

function overlap(a: string[], b: string[]) {
  const A = a.map(s=>s.trim().toLowerCase()).filter(Boolean);
  const B = b.map(s=>s.trim().toLowerCase()).filter(Boolean);
  const inter = A.filter(x => B.includes(x)).length;
  const union = new Set([...A, ...B]).size || 1;
  return (inter / union) * 100;
}

export async function POST(req: Request) {
  const body = await req.json();
  const capital = Number(body.capital ?? 0);
  const skills = String(body.skills ?? "");
  const passions = String(body.passions ?? "");
  const location = String(body.location ?? "");

  const catalog = [
    { title: "Mobile Auto Detailing", description: "Service business with quick path to cash.", skillTags:["sales","operations"], passionTags:["cars"], capitalBand:[300,2000], locations:["new york, ny","any"] },
    { title: "Niche Shopify Store", description: "E-commerce with one-product MVP.", skillTags:["marketing","ads"], passionTags:["fitness","tech"], capitalBand:[1000,5000], locations:["any"] },
    { title: "Local Content + UGC Agency", description: "Short-form content for small businesses.", skillTags:["marketing","video"], passionTags:["media"], capitalBand:[200,1500], locations:["any"] },
  ];

  const S = skills.split(",");
  const P = passions.split(",");

  const scored = catalog.map(i=>{
    const s = 0.4*overlap(S, i.skillTags) + 0.3*overlap(P, i.passionTags) +
               0.2*(capital>=i.capitalBand[0] && capital<=i.capitalBand[1] ? 100 : 60) +
               0.1*(i.locations.includes("any") || i.locations.includes(location.toLowerCase()) ? 100 : 70);
    return { ...i, matchScore: s };
  }).sort((a,b)=>b.matchScore-a.matchScore);

  return NextResponse.json({ ideas: scored });
}
