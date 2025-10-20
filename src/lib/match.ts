export type Idea = {
  title: string;
  blurb: string;
  category: string;
  customer: "consumer" | "smb" | "enterprise" | "government" | "utility" | "healthcare" | string;
  workMode: "field" | "remote" | "mixed";
  capitalBand: [number, number];
  timeToCash: "short" | "medium" | "long";
  sales: "low" | "medium" | "high";
  labor: "low" | "medium" | "high";
  vehicle?: "none" | "car" | "pickup";
  inventory: "none" | "light" | "full";
  compliance: "low" | "medium" | "high";
  gtm: string[];
  skills: string[];
  interests: string[];
};

import ideas from "@/data/ideas.json";

export type Answers = Record<string, string | string[] | undefined>;

function normSet(v: string | string[] | undefined) {
  if (!v) return new Set<string>();
  const arr = Array.isArray(v) ? v : [v];
  return new Set(arr.map(s => (s || "").toLowerCase()));
}

function capitalFromBand(ans: string): number {
  const map: Record<string, number> = { "<$100": 50, "$100–$500": 300, "$500–$2,000": 1000, "$2,000–$5,000": 3500, "$5,000+": 7000 };
  return map[ans] ?? 100;
}

function complianceRank(s: string) {
  if (s === "low") return 1;
  if (s === "medium") return 2;
  return 3;
}

function vehicleOk(need: Idea["vehicle"], have: string | undefined) {
  if (!need || need === "none") return true;
  if (!have) return false;
  if (need === "pickup") return have === "Pickup/van";
  if (need === "car") return have === "Car/SUV" || have === "Pickup/van";
  return true;
}

function bandFit(capital: number, band: [number, number]) {
  const [lo, hi] = band;
  if (capital >= lo && capital <= hi) return 1;
  const mid = (lo + hi) / 2;
  const diff = Math.abs(capital - mid) / mid;
  return Math.max(0, 1 - diff);
}

function overlap(a: Set<string>, bArr: string[]) {
  if (!bArr?.length) return 0;
  let m = 0;
  for (const k of bArr) if (a.has(k)) m++;
  return m / new Set(bArr).size;
}

export type Scored = Idea & { score: number, reasons: string[] };

export function scoreIdeas(answers: Answers): Scored[] {
  const build = (answers["build"] as string) || "";
  const capitalSel = (answers["capital"] as string) || "<$100";
  const salesPref = (answers["sales"] as string) || "";
  const laborPref = (answers["labor"] as string) || "";
  const timeToCash = (answers["time_to_cash"] as string) || "";
  const compliance = (answers["compliance"] as string) || "Low";
  const vehicle = (answers["vehicle"] as string) || "No vehicle";
  const customer = (answers["customer"] as string) || "";
  const location = (answers["location"] as string) || "";
  const gtm = normSet(answers["gtm"]);
  const skills = normSet(answers["skills"]);
  const interests = normSet(answers["interests"]);
  const cap = capitalFromBand(capitalSel);

  const userComplianceRank = complianceRank(compliance.toLowerCase());

  const results: Scored[] = (ideas as Idea[]).map((idea) => {
    let score = 0;
    const reasons: string[] = [];

    const capFit = bandFit(cap, idea.capitalBand);
    score += capFit * 20;
    if (capFit > 0.8) reasons.push("Fits your budget");

    const compFit = complianceRank(idea.compliance) <= userComplianceRank ? 1 : 0.2;
    score += compFit * 10;
    if (compFit < 1) reasons.push("Higher regulation than your comfort");

    const vehFit = vehicleOk(idea.vehicle, vehicle) ? 1 : 0;
    if (!vehFit) reasons.push("Vehicle requirements not met");
    score += vehFit * 8;

    if (idea.workMode === "field" && (answers["work_mode"] as string) === "Field work") { score += 5; reasons.push("Hands-on field work"); }
    if (idea.workMode === "remote" && (answers["work_mode"] as string) === "Remote/desk") { score += 5; reasons.push("Remote-friendly"); }

    if (idea.timeToCash === "short" && timeToCash === "This month") score += 6;
    if (idea.timeToCash === "medium" && timeToCash === "2–3 months") score += 4;
    if (idea.timeToCash === "long" && timeToCash === "6+ months") score += 3;

    if (idea.sales === "low" && salesPref === "Minimal selling") score += 5;
    if (idea.sales === "medium" && salesPref === "Prefer inbound/SEO/ads") score += 4;
    if (idea.sales === "high" && salesPref === "Okay with outreach & calls") score += 5;

    if (idea.labor === "low" && laborPref === "Low") score += 4;
    if (idea.labor === "medium" && laborPref === "Medium") score += 4;
    if (idea.labor === "high" && laborPref === "High") score += 5;

    if (customer && idea.customer && customer.toLowerCase().includes(idea.customer)) score += 5;

    const gtmFit = overlap(gtm, idea.gtm);
    score += gtmFit * 12;
    if (gtmFit > 0.5) reasons.push("Matches your go-to-market preference");

    const skillFit = overlap(skills, idea.skills);
    score += skillFit * 14;
    if (skillFit > 0.5) reasons.push("Leverages your skills");

    const interestFit = overlap(interests, idea.interests);
    score += interestFit * 12;
    if (interestFit > 0.5) reasons.push("Aligned with your interests");

    if (location.includes("globally") && ["saas","marketplace","content","ecommerce"].includes(idea.category)) score += 4;

    const pct = Math.max(0, Math.min(100, Math.round(score)));
    return { ...idea, score: pct, reasons };
  });

  return results.sort((a, b) => b.score - a.score);
}
