import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { getDefaultChatTitle } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { ensureUserSettings } from "@/lib/settings";

export const runtime = "nodejs";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET(request: Request) {
  const currentUser = await getAuthenticatedUser();
  if (!currentUser) {
    return unauthorized();
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.trim() ?? "";

  const threads = await prisma.chatThread.findMany({
    where: {
      userId: currentUser.id,
      ...(query
        ? {
            OR: [
              { title: { contains: query } },
              {
                messages: {
                  some: {
                    content: { contains: query },
                  },
                },
              },
            ],
          }
        : {}),
    },
    orderBy: { updatedAt: "desc" },
    take: 40,
    select: {
      id: true,
      title: true,
      updatedAt: true,
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          content: true,
        },
      },
    },
  });

  return NextResponse.json({
    threads: threads.map((thread) => ({
      id: thread.id,
      title: thread.title,
      updatedAt: thread.updatedAt,
      preview: thread.messages[0]?.content ?? "",
    })),
  });
}

export async function POST() {
  const currentUser = await getAuthenticatedUser();
  if (!currentUser) {
    return unauthorized();
  }

  const settings = await ensureUserSettings(currentUser.id);

  const thread = await prisma.chatThread.create({
    data: {
      userId: currentUser.id,
      title: getDefaultChatTitle(settings.language),
    },
    select: {
      id: true,
      title: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ thread }, { status: 201 });
}
