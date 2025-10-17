import { NextResponse } from "next/server";
import { detectCategory, planFromCategory } from "@/lib/rules";

export async function POST(req: Request) {
  try {
    const { idea, capital } = await req.json();
    const text = String(idea || "").trim();
    if (text.length < 5) {
      return NextResponse.json({ error: "Please describe your idea." }, { status: 400 });
    }
    const cat = detectCategory(text);
    const capHint = Number(capital ?? 0);
    const plan = planFromCategory(cat, text, isFinite(capHint) ? capHint : undefined);
    return NextResponse.json(plan);
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
