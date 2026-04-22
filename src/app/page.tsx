import { AuthGate } from "@/components/auth-gate";
import { ChatShell } from "@/components/chat-shell";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ensureUserSettings, listMediaFiles } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const currentUser = await getAuthenticatedUser();

  if (!currentUser) {
    return <AuthGate />;
  }

  const settings = await ensureUserSettings(currentUser.id);

  const [threads, backgrounds, introSounds, backgroundSounds] = await Promise.all([
    prisma.chatThread.findMany({
      where: { userId: currentUser.id },
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
      userName={currentUser.name ?? null}
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
