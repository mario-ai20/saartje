import { promises as fs } from "node:fs";
import path from "node:path";
import { AgeMode, Language, ThemeChoice, type UserSettings } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const allowedThemes = Object.values(ThemeChoice);
export const allowedLanguages = Object.values(Language);
export const allowedAgeModes = Object.values(AgeMode);

function backgroundSortPriority(filePath: string): number {
  const fileName = filePath.split("/").pop()?.toLowerCase() ?? filePath.toLowerCase();

  const orderedMatchers: Array<{ rank: number; pattern: RegExp }> = [
    { rank: 0, pattern: /^standaard\./i },
    { rank: 10, pattern: /^blue intens\./i },
    { rank: 11, pattern: /^green intens\./i },
    { rank: 12, pattern: /^orange intens\./i },
    { rank: 13, pattern: /^pink intens\./i },
    { rank: 14, pattern: /^intens\./i },
    { rank: 20, pattern: /^the sun\./i },
    { rank: 21, pattern: /^the moon\./i },
    { rank: 22, pattern: /^the earth\./i },
  ];

  const match = orderedMatchers.find((entry) => entry.pattern.test(fileName));
  if (match) {
    return match.rank;
  }

  // Space-achtergronden en overige bestanden komen na standaard/kleuren/planeten.
  if (/^space/i.test(fileName)) {
    return 30;
  }

  return 100;
}

export async function ensureUserSettings(userId: string): Promise<UserSettings> {
  const existing = await prisma.userSettings.findUnique({ where: { userId } });
  if (existing) {
    return existing;
  }

  return prisma.userSettings.create({
    data: {
      userId,
    },
  });
}

export async function listMediaFiles(dirFromPublic: string): Promise<string[]> {
  const fullDir = path.join(process.cwd(), "public", dirFromPublic);

  try {
    const allFiles: string[] = [];

    async function walk(currentDir: string, relativePrefix: string) {
      const entries = await fs.readdir(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const absolutePath = path.join(currentDir, entry.name);
        const relativePath = relativePrefix
          ? `${relativePrefix}/${entry.name}`
          : entry.name;

        if (entry.isDirectory()) {
          await walk(absolutePath, relativePath);
          continue;
        }

        if (entry.isFile() && /\.(mp3|wav|ogg|m4a|aac|flac|jpg|jpeg|png|webp)$/i.test(entry.name)) {
          allFiles.push(relativePath);
        }
      }
    }

    await walk(fullDir, "");

    const isBackgroundFolder = dirFromPublic.replace(/\\/g, "/").toLowerCase() === "backgrounds";
    if (isBackgroundFolder) {
      return allFiles.sort((a, b) => {
        const rankDiff = backgroundSortPriority(a) - backgroundSortPriority(b);
        if (rankDiff !== 0) {
          return rankDiff;
        }

        return a.localeCompare(b);
      });
    }

    return allFiles.sort((a, b) => a.localeCompare(b));
  } catch {
    return [];
  }
}

type PartialSettingsInput = {
  language?: Language;
  theme?: ThemeChoice;
  backgroundImage?: string | null;
  introSound?: string | null;
  backgroundSound?: string | null;
  memoryEnabled?: boolean;
  allowAdultMemory?: boolean;
  nsfwPlusEnabled?: boolean;
  nsfwVerifiedAt?: Date | null;
  parentalControl?: boolean;
  personality?: string;
  ageMode?: AgeMode;
};

export function sanitizeSettingsInput(input: PartialSettingsInput): PartialSettingsInput {
  const clean: PartialSettingsInput = {};

  if (input.language && allowedLanguages.includes(input.language)) {
    clean.language = input.language;
  }

  if (input.theme && allowedThemes.includes(input.theme)) {
    clean.theme = input.theme;
  }

  if (typeof input.backgroundImage === "string" || input.backgroundImage === null) {
    clean.backgroundImage = input.backgroundImage;
  }

  if (typeof input.introSound === "string" || input.introSound === null) {
    clean.introSound = input.introSound;
  }

  if (typeof input.backgroundSound === "string" || input.backgroundSound === null) {
    clean.backgroundSound = input.backgroundSound;
  }

  if (typeof input.memoryEnabled === "boolean") {
    clean.memoryEnabled = input.memoryEnabled;
  }

  if (typeof input.allowAdultMemory === "boolean") {
    clean.allowAdultMemory = input.allowAdultMemory;
  }

  if (typeof input.nsfwPlusEnabled === "boolean") {
    clean.nsfwPlusEnabled = input.nsfwPlusEnabled;
  }

  if (input.nsfwVerifiedAt instanceof Date || input.nsfwVerifiedAt === null) {
    clean.nsfwVerifiedAt = input.nsfwVerifiedAt;
  }

  if (typeof input.parentalControl === "boolean") {
    clean.parentalControl = input.parentalControl;
  }

  if (typeof input.personality === "string") {
    clean.personality = input.personality.trim().slice(0, 280) || "Vriendelijk, behulpzaam en duidelijk";
  }

  if (input.ageMode && allowedAgeModes.includes(input.ageMode)) {
    clean.ageMode = input.ageMode;
  }

  return clean;
}

