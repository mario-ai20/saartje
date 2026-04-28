import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

export const runtime = "nodejs";

const builderInternalUsername = "__builder__";

type RegisterInput = {
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  username?: string;
  password?: string;
  passwordConfirm?: string;
};

function badRequest(error: string) {
  return NextResponse.json({ error }, { status: 400 });
}

export async function POST(request: Request) {
  const body = (await request.json()) as RegisterInput;

  const firstName = body.firstName?.trim() ?? "";
  const lastName = body.lastName?.trim() ?? "";
  const birthDateRaw = body.birthDate?.trim() ?? "";
  const usernameRaw = body.username?.trim() ?? "";
  const password = body.password ?? "";
  const passwordConfirm = body.passwordConfirm ?? "";

  if (!firstName || !lastName || !birthDateRaw || !usernameRaw || !password || !passwordConfirm) {
    return badRequest("Vul alle verplichte velden in.");
  }

  if (password !== passwordConfirm) {
    return badRequest("Wachtwoorden komen niet overeen.");
  }

  if (usernameRaw.includes(" ")) {
    return badRequest("Username mag geen spaties bevatten.");
  }

  const birthDate = new Date(birthDateRaw);
  if (Number.isNaN(birthDate.getTime())) {
    return badRequest("Ongeldige geboortedatum.");
  }

  const today = new Date();
  if (birthDate > today) {
    return badRequest("Geboortedatum kan niet in de toekomst liggen.");
  }

  const username = usernameRaw.toLowerCase();

  if (username === builderInternalUsername) {
    return badRequest("Deze username is gereserveerd.");
  }

  try {
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        birthDate,
        username,
        passwordHash: hashPassword(password),
        name: `${firstName} ${lastName}`.trim(),
      },
      select: {
        id: true,
      },
    });

    await prisma.userSettings.upsert({
      where: { userId: user.id },
      create: { userId: user.id },
      update: {},
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return badRequest("Deze username bestaat al.");
    }

    return NextResponse.json({ error: "Er ging iets mis bij account aanmaken." }, { status: 500 });
  }
}
