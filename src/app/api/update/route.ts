import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { getGitUpdateStatus, pullLatestGitChanges } from "@/lib/git-update";

export const runtime = "nodejs";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET() {
  const currentUser = await getAuthenticatedUser();
  if (!currentUser) {
    return unauthorized();
  }

  const status = await getGitUpdateStatus();
  return NextResponse.json({ status });
}

export async function POST() {
  const currentUser = await getAuthenticatedUser();
  if (!currentUser) {
    return unauthorized();
  }

  try {
    const result = await pullLatestGitChanges();
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Update mislukt.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
