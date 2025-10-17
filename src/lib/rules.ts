export type CatalogIdea = {
  title: string;
  description: string;
  category: keyof typeof CATEGORY_KEYWORDS;
  skillTags: string[];
  passionTags: string[];
  capitalBand: [number, number];
  locations: string[];
};

const STOP = new Set(["the","a","an","and","or","for","to","of","in","on","with","at","by","from","is","are","be","as","it","this","that","your","you","my"]);
export function norm(s: string): string { return (s||"").toLowerCase().replace(/[^a-z0-9 ,]/g," ").replace(/\s+/g," ").trim(); }
export function toks(s: string): string[] { return norm(s).split(" ").filter(w => w && !STOP.has(w)); }

function setOverlap(a: string[], b: string[]) {
  const A = new Set(a.map(x=>x.trim()));
  const B = new Set(b.map(x=>x.trim()));
  let inter = 0; for (const x of A) if (B.has(x)) inter++;
  const union = new Set([...A, ...B]).size || 1;
  return inter/union;
}

export const CATEGORY_KEYWORDS = {
  service: ["detailing","cleaning","lawn","repair","consulting","agency","freelance","tutoring","coaching"],
  ecommerce: ["store","shopify","etsy","amazon","dropship","product","merch"],
  content: ["ugc","tiktok","shorts","youtube","content","creator","newsletter","blog"],
  local_leadgen: ["leads","leadgen","directory","listing","local businesses","seo"],
  fitness_wellness: ["fitness","gym","trainer","yoga","wellness","nutrition"],
  education: ["course","lessons","tutor","school","language","learn","bootcamp"],
} as const;

const TEMPLATES = {
  service: { risks:["Client acquisition pace","Scheduling & reliability","Weather/seasonality"], kpisWeek1:["10 discovery messages","2 booked trials"], steps:["Define offer & pricing","Simple landing page + booking link","Prospect list of 50 locals","DM/email outreach (first 20)","Create before/after proof (1 pilot)","Collect testimonial & photos","Optimize script & pricing","Run small ads ($5–10/day) or flyers","Close 2–3 paying clients","Systematize (checklists, calendar, supplies)"], budget:[200,1200], months:2 },
  ecommerce: { risks:["Product-market fit","Ad costs","Fulfillment issues"], kpisWeek1:["1 prototype page","10 survey responses"], steps:["Pick one niche problem/product","Simple product page + checkout","Source supplier or print-on-demand","Create 3 ad creatives (UGC style)","Run micro test ($10–20/day)","Read results & iterate","Add email capture & welcome flow","Reach out to 5 micro-influencers","Get 1–5 orders","Package ops (shipping/returns)"], budget:[500,3000], months:3 },
  content: { risks:["Consistency","Monetization lead time","Platform changes"], kpisWeek1:["7 posts published","20 audience interactions"], steps:["Choose niche & content pillars","Create 10 hook ideas","Record with phone + good lighting","Post daily for 7 days","Engage 30 mins after each post","Track posts with best retention","Make simple landing/lead magnet","Collect 50 emails","Offer paid mini-service or template","Iterate based on analytics"], budget:[100,600], months:2 },
  local_leadgen: { risks:["Ranking time","Lead quality","Churn"], kpisWeek1:["Launch 1-page site","5 local leads"], steps:["Pick a service & city combo","Buy domain & publish 1-page site","Set up GMB card (if applicable)","Directory listings (NAP consistency)","Create 3 local blog posts","Outreach to 20 local businesses","Forward calls to partner","Track calls & forms","Charge per lead or flat retainer","Add 2nd city once stable"], budget:[150,800], months:3 },
  fitness_wellness: { risks:["Client consistency","Seasonality","Venue access"], kpisWeek1:["5 trial sessions booked"], steps:["Define program & result promise","Create booking link & waiver","Record 3 demo clips","DM local groups & friends","Run park/garage sessions","Collect testimonials","Offer 4-week package","Partner with 2 gyms","Upsell nutrition add-on","Referrals program"], budget:[100,500], months:2 },
  education: { risks:["Curriculum fit","Student retention","Competition"], kpisWeek1:["Outline 6-lesson curriculum","2 paid trials"], steps:["Pick outcome & audience","Outline 6 lessons","Landing page + Calendly","Offer 2 trial sessions","Collect testimonials","Sell 4-week cohort","Add study materials","Referral discount","Partner with schools/groups","Iterate from feedback"], budget:[100,400], months:2 },
} as const;

export const CATALOG: CatalogIdea[] = [
  { title:"Mobile Auto Detailing", description:"On-site detailing for busy pros.", category:"service", skillTags:["sales","operations"], passionTags:["cars"], capitalBand:[300,2000], locations:["any"] },
  { title:"Niche Shopify Store", description:"One-product store MVP.", category:"ecommerce", skillTags:["marketing","ads"], passionTags:["fitness","tech"], capitalBand:[800,4000], locations:["any"] },
  { title:"UGC & Short-Form Agency", description:"Short-form videos for SMBs.", category:"content", skillTags:["video","marketing"], passionTags:["media"], capitalBand:[200,1500], locations:["any"] },
  { title:"Local Leadgen Site", description:"Generate leads and sell to local pros.", category:"local_leadgen", skillTags:["seo","sales"], passionTags:["local"], capitalBand:[150,800], locations:["any"] },
  { title:"Personal Training Sprint", description:"4-week results program.", category:"fitness_wellness", skillTags:["fitness","coaching"], passionTags:["fitness"], capitalBand:[100,500], locations:["any"] },
  { title:"Language Tutoring", description:"1:1 or small-group lessons.", category:"education", skillTags:["teaching","language"], passionTags:["education"], capitalBand:[100,400], locations:["any"] },
];

export function detectCategory(text: string): keyof typeof CATEGORY_KEYWORDS {
  const t = norm(text);
  let best: { cat: keyof typeof CATEGORY_KEYWORDS, hits: number } = { cat: "service", hits: 0 };
  (Object.keys(CATEGORY_KEYWORDS) as (keyof typeof CATEGORY_KEYWORDS)[]).forEach(cat=>{
    const hits = CATEGORY_KEYWORDS[cat].reduce((acc,k)=> acc + (t.includes(norm(k)) ? 1 : 0), 0);
    if (hits > best.hits) best = { cat, hits };
  });
  return best.cat || "service";
}

export function planFromCategory(category: keyof typeof TEMPLATES, userIdea: string, capitalHint?: number) {
  const tpl = TEMPLATES[category] || TEMPLATES.service;
  const [bMinRaw, bMaxRaw] = tpl.budget as [number, number];
  // Widen literal tuple values to number so we can do math & reassign:
  let min: number = Number(bMinRaw);
  let max: number = Number(bMaxRaw);

  if (typeof capitalHint === "number" && capitalHint > 0) {
    const factor = Math.max(0.6, Math.min(1.4, capitalHint / ((min + max) / 2)));
    min = Math.round(min * factor);
    max = Math.round(max * factor);
  }
  return {
    summary: `Plan for: ${userIdea}. A lean ${category.replace("_"," ")} approach focusing on fast validation, low fixed costs, and early revenue.`,
    estBudget: { min, max },
    estTimelineMonths: tpl.months,
    risks: tpl.risks,
    first10Steps: tpl.steps.map((title, i)=>({ order: i+1, title })),
    kpisWeek1: tpl.kpisWeek1,
  };
}

export function scoreIdea(
  idea: CatalogIdea,
  profile: { capital: number; skills: string; passions: string; location: string }
) {
  const S = toks(profile.skills);
  const P = toks(profile.passions);
  const locFit = idea.locations.includes("any");
  const capitalFit = profile.capital >= idea.capitalBand[0] && profile.capital <= idea.capitalBand[1];
  const sScore = setOverlap(S, idea.skillTags) * 100;
  const pScore = setOverlap(P, idea.passionTags) * 100;
  const cScore = capitalFit ? 100 : 60;
  const lScore = locFit ? 100 : 70;
  return 0.4*sScore + 0.3*pScore + 0.2*cScore + 0.1*lScore;
}
