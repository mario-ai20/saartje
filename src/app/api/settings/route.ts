import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  ensureUserSettings,
  listMediaFiles,
  sanitizeSettingsInput,
} from "@/lib/settings";

export const runtime = "nodejs";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function isAtLeast18YearsOld(dateInput: string): boolean {
  const parsed = new Date(dateInput);
  if (Number.isNaN(parsed.getTime())) {
    return false;
  }

  const now = new Date();
  let age = now.getFullYear() - parsed.getFullYear();
  const monthDiff = now.getMonth() - parsed.getMonth();
  const hasHadBirthday =
    monthDiff > 0 || (monthDiff === 0 && now.getDate() >= parsed.getDate());

  if (!hasHadBirthday) {
    age -= 1;
  }

  return age >= 18;
}

function sameCalendarDate(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

export async function GET() {
  const session = (await getServerSession(authOptions as never)) as { user?: { id?: string; name?: string | null } } | null;
  if (!session?.user?.id) {
    return unauthorized();
  }

  const settings = await ensureUserSettings(session.user.id);
  const [backgrounds, introSounds, backgroundSounds] = await Promise.all([
    listMediaFiles("backgrounds"),
    listMediaFiles("intro-music"),
    listMediaFiles("background-music"),
  ]);

  return NextResponse.json({
    settings,
    assets: {
      backgrounds,
      introSounds,
      backgroundSounds,
    },
  });
}

export async function PUT(request: Request) {
  const session = (await getServerSession(authOptions as never)) as { user?: { id?: string; name?: string | null } } | null;
  if (!session?.user?.id) {
    return unauthorized();
  }

  const input = (await request.json()) as Record<string, unknown>;
  const existing = await ensureUserSettings(session.user.id);
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { birthDate: true },
  });

  const clean = sanitizeSettingsInput({
    language: input.language as never,
    theme: input.theme as never,
    backgroundImage:
      typeof input.backgroundImage === "string" && input.backgroundImage.length === 0
        ? null
        : (input.backgroundImage as string | null | undefined),
    introSound:
      typeof input.introSound === "string" && input.introSound.length === 0
        ? null
        : (input.introSound as string | null | undefined),
    backgroundSound:
      typeof input.backgroundSound === "string" && input.backgroundSound.length === 0
        ? null
        : (input.backgroundSound as string | null | undefined),
    memoryEnabled: input.memoryEnabled as boolean,
    allowAdultMemory: input.allowAdultMemory as boolean,
    nsfwPlusEnabled: input.nsfwPlusEnabled as boolean,
    parentalControl: input.parentalControl as boolean,
    personality: input.personality as string,
    ageMode: input.ageMode as never,
  });

  const wantsNsfwEnabled = clean.nsfwPlusEnabled === true;
  const wasNsfwEnabled = existing.nsfwPlusEnabled === true;
  const nsfwBirthDateCheck =
    typeof input.nsfwBirthDateCheck === "string" ? input.nsfwBirthDateCheck.trim() : "";
  const nsfwFaceVerified = input.nsfwFaceVerified === true;

  if (wantsNsfwEnabled && !wasNsfwEnabled) {
    if (!nsfwBirthDateCheck) {
      return NextResponse.json(
        { error: "Geef je geboortedatum opnieuw in om NSFW+ te activeren." },
        { status: 400 },
      );
    }

    if (!isAtLeast18YearsOld(nsfwBirthDateCheck)) {
      return NextResponse.json(
        { error: "NSFW+ kan alleen als je 18 jaar of ouder bent." },
        { status: 403 },
      );
    }

    if (!nsfwFaceVerified) {
      return NextResponse.json(
        { error: "Gezichtsverificatie is verplicht om NSFW+ te activeren." },
        { status: 400 },
      );
    }

    if (user?.birthDate) {
      const enteredDate = new Date(nsfwBirthDateCheck);
      if (Number.isNaN(enteredDate.getTime()) || !sameCalendarDate(enteredDate, user.birthDate)) {
        return NextResponse.json(
          { error: "Geboortedatum komt niet overeen met je account." },
          { status: 403 },
        );
      }
    }

    clean.nsfwVerifiedAt = new Date();
  }

  if (clean.nsfwPlusEnabled === false) {
    clean.nsfwVerifiedAt = null;
  }

  if (clean.nsfwPlusEnabled === true) {
    clean.parentalControl = false;
  }

  const settings = await prisma.userSettings.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      ...clean,
    },
    update: clean,
  });

  return NextResponse.json({ settings });
}





