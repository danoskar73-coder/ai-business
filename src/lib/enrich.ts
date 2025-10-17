export type EnrichedProfile = {
  city?: string; region?: string; country?: string;
  locationTier: LocTier;
  capitalLevel: "very_low" | "low" | "medium" | "high";
  skillTags: string[]; passionTags: string[];
};
type LocTier = "small" | "medium" | "large" | "unknown";
type ParsedLocation = { city?: string; region?: string; country?: string; tier: LocTier };

const SKILL_CANON: Record<string,string> = {
  marketing:"marketing", ads:"ads", sales:"sales", seo:"seo",
  video:"video", editing:"video", operations:"operations", ops:"operations",
  coding:"dev", developer:"dev", design:"design", copy:"copy",
  writing:"copy", teach:"teaching", teaching:"teaching", language:"language"
};
const PASSION_CANON: Record<string,string> = {
  cars:"cars", auto:"cars", fitness:"fitness", gym:"fitness", tech:"tech",
  gadgets:"tech", media:"media", fashion:"fashion", beauty:"beauty",
  education:"education", kids:"kids", food:"food", pets:"pets"
};

const norm = (s:string)=> (s||"").toLowerCase().trim();

function parseLocation(raw:string): ParsedLocation {
  const t = norm(raw);
  if (!t) return { city: undefined, region: undefined, country: undefined, tier: "unknown" };

  const parts = t.split(",").map(s=>s.trim()).filter(Boolean);
  const city = parts[0], region = parts[1], country = parts[2];

  const LARGE = ["new york","los angeles","san francisco","london","toronto","chicago","miami","houston","dallas","seattle","paris","berlin","sydney","melbourne","dubai"];
  const MED   = ["austin","atlanta","denver","san diego","orlando","vancouver","boston","philadelphia","phoenix","san jose","manchester","birmingham"];

  const base = city || t;
  let tier: LocTier;
  if (!base) tier = "unknown";
  else if (LARGE.includes(base)) tier = "large";
  else if (MED.includes(base)) tier = "medium";
  else tier = "small";

  return { city, region, country, tier };
}

function capitalToLevel(n:number): EnrichedProfile["capitalLevel"] {
  if (!Number.isFinite(n) || n<=0) return "very_low";
  if (n < 300) return "low";
  if (n < 2000) return "medium";
  return "high";
}

function splitTags(s:string){ return s.split(",").map(norm).filter(Boolean); }
function canonize(map:Record<string,string>, arr:string[]){ return Array.from(new Set(arr.map(a=>map[a]||a))); }

export function enrichProfile(input:{ capital:number; skills:string; passions:string; location:string; }): EnrichedProfile {
  const loc = parseLocation(input.location);
  return {
    city: loc.city, region: loc.region, country: loc.country,
    locationTier: loc.tier,
    capitalLevel: capitalToLevel(input.capital),
    skillTags: canonize(SKILL_CANON, splitTags(input.skills)),
    passionTags: canonize(PASSION_CANON, splitTags(input.passions)),
  };
}
