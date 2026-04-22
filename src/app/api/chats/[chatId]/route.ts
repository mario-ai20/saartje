import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET(
  _request: Request,
  context: RouteContext<"/api/chats/[chatId]">,
) {
  const session = (await getServerSession(authOptions as never)) as { user?: { id?: string; name?: string | null } } | null;
  if (!session?.user?.id) {
    return unauthorized();
  }

  const { chatId } = await context.params;

  const thread = await prisma.chatThread.findFirst({
    where: {
      id: chatId,
      userId: session.user.id,
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
  const session = (await getServerSession(authOptions as never)) as { user?: { id?: string; name?: string | null } } | null;
  if (!session?.user?.id) {
    return unauthorized();
  }

  const { chatId } = await context.params;

  const existing = await prisma.chatThread.findFirst({
    where: {
      id: chatId,
      userId: session.user.id,
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





