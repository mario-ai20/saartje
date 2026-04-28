import { NextResponse } from "next/server";
import { getGitUpdateStatus, pullLatestGitChanges } from "@/lib/git-update";

export const runtime = "nodejs";

export async function GET() {
  const status = await getGitUpdateStatus();
  return NextResponse.json({ status });
}

export async function POST() {
  try {
    const result = await pullLatestGitChanges();
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Update mislukt.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
