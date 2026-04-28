import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { buildSystemPrompt, getDefaultChatTitle, getDictionary } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { ensureUserSettings } from "@/lib/settings";

export const runtime = "nodejs";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function mapRole(role: "USER" | "ASSISTANT" | "SYSTEM"): "user" | "assistant" | "system" {
  if (role === "ASSISTANT") {
    return "assistant";
  }

  if (role === "SYSTEM") {
    return "system";
  }

  return "user";
}

function clipTitle(content: string): string {
  const text = content.replace(/\s+/g, " ").trim();
  return text.length > 42 ? `${text.slice(0, 42)}...` : text;
}

function toBabyBabble(text: string): string {
  const sourceLength = text.replace(/\s+/g, "").length;
  const targetLength = Math.max(24, Math.min(140, Math.floor(sourceLength * 0.9)));
  const letters = "abcdefghijklmnopqrstuvwxyz";
  const separators = [",", ",", ",", "?", ".", ""];

  let out = "";

  for (let i = 0; i < targetLength; i += 1) {
    const letter = letters[Math.floor(Math.random() * letters.length)] ?? "a";
    const useUppercase = i > 0 && Math.random() < 0.04;
    out += useUppercase ? letter.toUpperCase() : letter;

    if (i > 2 && i < targetLength - 2 && Math.random() < 0.12) {
      out += separators[Math.floor(Math.random() * separators.length)] ?? ",";
    }
  }

  if (!/[?.!]$/.test(out)) {
    out += Math.random() < 0.5 ? "?" : ".";
  }

  return out;
}

function containsAdultTerms(text: string): boolean {
  return /\b(seks|sex|naakt|nude|porno|horny|fetish|kink|erot|bedpartner|one night stand)\b/i.test(text);
}

function extractPersonalMemory(text: string): string | null {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length < 12 || normalized.length > 220) {
    return null;
  }

  if (!/\b(ik|mijn|mij|me|i|my|me)\b/i.test(normalized)) {
    return null;
  }

  if (normalized.endsWith("?")) {
    return null;
  }

  return normalized;
}

function mergeMemoryNotes(existing: string, candidate: string): string {
  const lines = existing
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const lowered = candidate.toLowerCase();
  const alreadyExists = lines.some((line) => line.toLowerCase() === lowered);
  if (!alreadyExists) {
    lines.push(candidate);
  }

  return lines.slice(-30).join("\n");
}

function isApologyMessage(text: string): boolean {
  return /\b(sorry|het spijt me|sorryyy|excuseer|excuses|pardon|mea culpa)\b/i.test(text);
}

function isConflictMessage(text: string): boolean {
  return /\b(hoer|slet|kkr|kanker|idioot|debiel|stom wijf|fuck you|bitch|slut|whore)\b/i.test(text);
}

function getStubbornReply(language: "NL" | "FR" | "DE" | "EL"): string {
  if (language === "FR") return 'Je suis fachee. Dis d\'abord "sorry" ou "desole" et ensuite je reparle.';
  if (language === "DE") return 'Ich bin beleidigt. Sag zuerst "sorry", dann rede ich wieder mit dir.';
  if (language === "EL") return 'Eimai peiragmeni. Pes prwta "sorry" kai meta tha sou miliso.';
  return 'Ik ben nu boos en koppig. Zeg eerst "sorry", dan praat ik weer met je.';
}

function getApologyAcceptedReply(language: "NL" | "FR" | "DE" | "EL"): string {
  if (language === "FR") return "Ok, excuse acceptee. On peut reparler calmement.";
  if (language === "DE") return "Okay, Entschuldigung akzeptiert. Wir konnen ruhig weiterreden.";
  if (language === "EL") return "Entaksei, dexomai to sorry. Synexizoume pio ilrema.";
  return "Ok, sorry aanvaard. We kunnen weer normaal praten.";
}

function buildMemoryContext(memoryNotes: string): string {
  const notes = memoryNotes
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(-18);

  if (notes.length === 0) {
    return "";
  }

  return [
    "Onthouden persoonlijke info van de gebruiker (gebruik subtiel als relevant):",
    ...notes.map((line) => `- ${line}`),
  ].join("\n");
}

export async function POST(
  request: Request,
  context: RouteContext<"/api/chats/[chatId]/messages">,
) {
  const currentUser = await getAuthenticatedUser();
  if (!currentUser) {
    return unauthorized();
  }

  const { chatId } = await context.params;
  const body = (await request.json()) as { content?: string };

  const content = body.content?.trim();
  if (!content) {
    return NextResponse.json({ error: "Empty message" }, { status: 400 });
  }

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
    select: {
      id: true,
      title: true,
      _count: {
        select: {
          messages: true,
        },
      },
    },
  });

  if (!thread) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let activeSettings = settings;

  async function saveAssistantAndRespond(text: string, language: "NL" | "FR" | "DE" | "EL") {
    const assistantMessage = await prisma.chatMessage.create({
      data: {
        threadId: chatId,
        role: "ASSISTANT",
        content: text,
      },
      select: {
        id: true,
        role: true,
        content: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      message: assistantMessage,
      toast: getDictionary(language).saved,
    });
  }

  await prisma.chatMessage.create({
    data: {
      threadId: chatId,
      role: "USER",
      content,
    },
  });

  const uiLanguage = (activeSettings.language ?? "NL") as "NL" | "FR" | "DE" | "EL";

  if (activeSettings.isUpset) {
    if (isApologyMessage(content)) {
      activeSettings = await prisma.userSettings.update({
        where: { userId: currentUser.id },
        data: { isUpset: false },
      });

      return saveAssistantAndRespond(getApologyAcceptedReply(uiLanguage), uiLanguage);
    }

    return saveAssistantAndRespond(getStubbornReply(uiLanguage), uiLanguage);
  }

  if (isConflictMessage(content)) {
    activeSettings = await prisma.userSettings.update({
      where: { userId: currentUser.id },
      data: { isUpset: true },
    });

    return saveAssistantAndRespond(getStubbornReply(uiLanguage), uiLanguage);
  }

  if (activeSettings.memoryEnabled) {
    const memoryCandidate = extractPersonalMemory(content);
    const allowedByAdultSetting =
      activeSettings.allowAdultMemory || (memoryCandidate ? !containsAdultTerms(memoryCandidate) : true);

    if (memoryCandidate && allowedByAdultSetting) {
      const mergedNotes = mergeMemoryNotes(activeSettings.memoryNotes, memoryCandidate);

      if (mergedNotes !== activeSettings.memoryNotes) {
        activeSettings = await prisma.userSettings.update({
          where: { userId: currentUser.id },
          data: { memoryNotes: mergedNotes },
        });
      }
    }
  }

  const history = await prisma.chatMessage.findMany({
    where: { threadId: chatId },
    orderBy: { createdAt: "asc" },
    select: {
      role: true,
      content: true,
    },
  });

  const memoryContext =
    activeSettings.memoryEnabled && activeSettings.memoryNotes.trim().length > 0
      ? buildMemoryContext(activeSettings.memoryNotes)
      : "";

  const systemPrompt = [buildSystemPrompt(activeSettings), memoryContext].filter(Boolean).join("\n\n");

  const ollamaUrl = process.env.OLLAMA_URL ?? "http://127.0.0.1:11434";
  const model = process.env.OLLAMA_MODEL ?? "llama3.1";

  let assistantText = "";

  try {
    const ollamaResponse = await fetch(`${ollamaUrl}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        stream: false,
        messages: [
          { role: "system", content: systemPrompt },
          ...history.map((message) => ({
            role: mapRole(message.role),
            content: message.content,
          })),
        ],
      }),
    });

    if (!ollamaResponse.ok) {
      throw new Error(`Ollama request failed (${ollamaResponse.status})`);
    }

    const payload = (await ollamaResponse.json()) as {
      message?: { content?: string };
      response?: string;
    };

    assistantText =
      payload.message?.content?.trim() ?? payload.response?.trim() ?? "Geen antwoord ontvangen.";
  } catch {
    assistantText =
      activeSettings.language === "FR"
        ? "Je ne peux pas joindre Ollama maintenant. Verifie si Ollama est actif."
        : activeSettings.language === "DE"
          ? "Ich kann Ollama gerade nicht erreichen. Prufe, ob Ollama lauft."
          : activeSettings.language === "EL"
            ? "Den mporo na sundeso me to Ollama twra. Elegkse an trexei."
            : "Ik kan Ollama nu niet bereiken. Controleer of Ollama draait.";
  }

  if (activeSettings.ageMode === "BABY_1") {
    assistantText = toBabyBabble(assistantText);
  }

  const assistantMessage = await prisma.chatMessage.create({
    data: {
      threadId: chatId,
      role: "ASSISTANT",
      content: assistantText,
    },
    select: {
      id: true,
      role: true,
      content: true,
      createdAt: true,
    },
  });

  if (thread._count.messages === 0 && thread.title === getDefaultChatTitle(activeSettings.language)) {
    await prisma.chatThread.update({
      where: { id: chatId },
      data: { title: clipTitle(content) },
    });
  }

  const dictionary = getDictionary(activeSettings.language);

  return NextResponse.json({
    message: assistantMessage,
    toast: dictionary.saved,
  });
}
