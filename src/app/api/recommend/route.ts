import { NextResponse } from "next/server";
import { CATALOG, planFromCategory } from "@/lib/rules";
import { enrichProfile } from "@/lib/enrich";

function score(idea:any, prof:ReturnType<typeof enrichProfile>) {
  const s = new Set(prof.skillTags);
  const p = new Set(prof.passionTags);
  const sScore = idea.skillTags.filter((x:string)=>s.has(x)).length;
  const pScore = idea.passionTags.filter((x:string)=>p.has(x)).length;

  const capitalFit = (() => {
    const [lo,hi] = idea.capitalBand as [number,number];
    const guess = prof.capitalLevel === "very_low" ? 50
                : prof.capitalLevel === "low" ? 200
                : prof.capitalLevel === "medium" ? 1000
                : 3000;
    return (guess >= lo && guess <= hi) ? 1 : 0.6;
  })();

  const locationFit = (idea.locations||[]).includes("any") ? 1
                     : prof.locationTier !== "unknown" ? 0.9 : 0.7;

  return 0.45*sScore + 0.30*pScore + 0.15*capitalFit*3 + 0.10*locationFit*3;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const capital = Number(body.capital ?? 0);
    const skills = String(body.skills ?? "").trim();
    const passions = String(body.passions ?? "").trim();
    const location = String(body.location ?? "").trim();

    const allBlank = (!capital || capital === 0) && !skills && !passions && !location;
    if (allBlank) {
      return NextResponse.json(
        { error: "Please fill at least one field (capital, skills, passions, or location)." },
        { status: 400 }
      );
    }

    const prof = enrichProfile({ capital, skills, passions, location });

    const ideas = CATALOG
      .map(idea => {
        const matchScore = score(idea, prof) * 25;
        const plan = planFromCategory(idea.category, idea.title, capital || undefined);
        const visibleSteps = plan.first10Steps.slice(0, 2).map(s => s.title);
        const hiddenSteps  = plan.first10Steps.slice(2, 8).map(s => s.title);
        return {
          title: idea.title,
          description: idea.description,
          matchScore: Math.max(0, Math.min(100, Math.round(matchScore))),
          visibleSteps,
          hiddenSteps,
        };
      })
      .sort((a,b)=> b.matchScore - a.matchScore)
      .slice(0, 6);

    return NextResponse.json({ ideas, profile: prof });
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
