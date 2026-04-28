import { NextResponse } from "next/server";

export const runtime = "nodejs";

const builderCode = process.env.BUILDER_CODE?.trim() ?? "";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { code?: string } | null;
  const code = body?.code?.trim() ?? "";

  if (!builderCode) {
    return NextResponse.json({ error: "Builder code is not configured." }, { status: 400 });
  }

  if (!code || code !== builderCode) {
    return NextResponse.json({ error: "Onjuiste builder-code." }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
