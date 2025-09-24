import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!,
  { auth: { persistSession: false } }
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("messages")
      .select("id, text, created_at")
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) throw error;
    return NextResponse.json({ ok: true, last: data[0] || null });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || String(err) },
      { status: 500 }
    );
  }
}