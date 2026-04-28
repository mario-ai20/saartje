import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ensureUserSettings } from "@/lib/settings";

export const runtime = "nodejs";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET(
  _request: Request,
  context: RouteContext<"/api/chats/[chatId]">,
) {
  const currentUser = await getAuthenticatedUser();
  if (!currentUser) {
    return unauthorized();
  }

  const { chatId } = await context.params;
  const settings = await ensureUserSettings(currentUser.id);
  const isBuilder = currentUser.role === "builder";

  const thread = await prisma.chatThread.findFirst({
    where: isBuilder
      ? {
          id: chatId,
        }
      : {
          id: chatId,
          userId: currentUser.id,
          isNsfw: settings.nsfwPlusEnabled,
        },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          role: true,
          content: true,
          createdAt: true,
        },
      },
    },
  });

  if (!thread) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ thread });
}

export async function DELETE(
  _request: Request,
  context: RouteContext<"/api/chats/[chatId]">,
) {
  const currentUser = await getAuthenticatedUser();
  if (!currentUser) {
    return unauthorized();
  }

  const { chatId } = await context.params;
  const settings = await ensureUserSettings(currentUser.id);
  const isBuilder = currentUser.role === "builder";

  const existing = await prisma.chatThread.findFirst({
    where: isBuilder
      ? {
          id: chatId,
        }
      : {
          id: chatId,
          userId: currentUser.id,
          isNsfw: settings.nsfwPlusEnabled,
        },
    select: {
      id: true,
    },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.chatThread.delete({
    where: { id: chatId },
  });

  return NextResponse.json({ ok: true });
}
