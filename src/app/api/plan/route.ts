import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { idea } = await req.json();

  return NextResponse.json({
    summary: `Plan for: ${idea}`,
    estBudget: { min: 500, max: 2500 },
    estTimelineMonths: 3,
    risks: ["Market validation", "Cashflow", "Acquisition costs"],
    first10Steps: [
      { order: 1, title: "Validate demand", checklist: ["Talk to 10 users","Competitive scan"] },
      { order: 2, title: "Define MVP offer", checklist: ["Landing page","Payment link"] },
      { order: 3, title: "Acquire first 10 users", checklist: ["DM outreach","Local groups"] },
    ],
    kpisWeek1: ["10 discovery calls","1 pre-sale"]
  });
}
