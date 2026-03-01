import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth/isAdmin";

export async function POST(req: Request) {
  try {
    const supabase = await supabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = await isAdmin(user);
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { rate_id } = await req.json();

    if (!rate_id) {
      return NextResponse.json({ error: "Missing rate_id" }, { status: 400 });
    }

    const apiKey = process.env.SHIPENGINE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing SHIPENGINE_API_KEY" },
        { status: 500 }
      );
    }

    const res = await fetch("https://api.shipengine.com/v1/labels", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "API-Key": apiKey,
      },
      body: JSON.stringify({
        rate_id,
        label_format: "pdf",
        label_layout: "4x6",
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data?.errors?.[0]?.message || "Label error" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      tracking_number: data.tracking_number,
      label_url: data.label_download?.href,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Label creation failed" },
      { status: 500 }
    );
  }
}