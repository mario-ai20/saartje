import { getServerSession } from "next-auth/next";
import { AuthGate } from "@/components/auth-gate";
import { ChatShell } from "@/components/chat-shell";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ensureUserSettings, listMediaFiles } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = (await getServerSession(authOptions as never)) as { user?: { id?: string; name?: string | null } } | null;

  if (!session?.user?.id) {
    return <AuthGate />;
  }

  const settings = await ensureUserSettings(session.user.id);

  const [threads, backgrounds, introSounds, backgroundSounds] = await Promise.all([
    prisma.chatThread.findMany({
      where: { userId: session.user.id },
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
    }),
    listMediaFiles("backgrounds"),
    listMediaFiles("intro-music"),
    listMediaFiles("background-music"),
  ]);

  const firstThreadId = threads[0]?.id ?? null;

  const initialMessages = firstThreadId
    ? await prisma.chatMessage.findMany({
        where: { threadId: firstThreadId },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          role: true,
          content: true,
          createdAt: true,
        },
      })
    : [];

  return (
    <ChatShell
      userName={session.user.name ?? null}
      initialThreads={threads.map((thread) => ({
        id: thread.id,
        title: thread.title,
        updatedAt: thread.updatedAt.toISOString(),
        preview: thread.messages[0]?.content ?? "",
      }))}
      initialThreadId={firstThreadId}
      initialMessages={initialMessages.map((message) => ({
        ...message,
        createdAt: message.createdAt.toISOString(),
      }))}
      initialSettings={{
        language: settings.language,
        theme: settings.theme,
        backgroundImage: settings.backgroundImage,
        introSound: settings.introSound,
        backgroundSound: settings.backgroundSound,
        memoryEnabled: settings.memoryEnabled,
        allowAdultMemory: settings.allowAdultMemory,
        nsfwPlusEnabled: settings.nsfwPlusEnabled,
        parentalControl: settings.parentalControl,
        personality: settings.personality,
        ageMode: settings.ageMode,
      }}
      assets={{
        backgrounds,
        introSounds,
        backgroundSounds,
      }}
    />
  );
}
