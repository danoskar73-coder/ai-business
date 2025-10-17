import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Basic validation
    const email = String(body.email || "").trim();
    const name = String(body.name || "").trim();
    const plan = String(body.plan || "starter");
    const goal = String(body.goal || "").trim();
    const channel = String(body.channel || "chat"); // chat | weekly_call
    const consent = Boolean(body.consent);

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required." }, { status: 400 });
    }
    if (!name) {
      return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
    }
    if (!consent) {
      return NextResponse.json({ error: "Please accept Terms & Privacy." }, { status: 400 });
    }

    // Here you'd store to your DB/CRM or trigger an email.
    // For now we just log to server output:
    console.log("MENTOR_ACTIVATE", {
      email, name, plan, goal, channel,
      ts: new Date().toISOString()
    });

    // Return a simple success payload
    return NextResponse.json({
      ok: true,
      message: "Mentor activation received. We'll be in touch shortly.",
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
