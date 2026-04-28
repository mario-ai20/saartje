import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

export const DEFAULT_DATABASE_URL = "file:./dev.db";

export const schemaSql = `
CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "firstName" TEXT,
  "lastName" TEXT,
  "birthDate" DATETIME,
  "username" TEXT,
  "passwordHash" TEXT,
  "name" TEXT,
  "email" TEXT,
  "emailVerified" DATETIME,
  "image" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "User_username_key" ON "User"("username");

CREATE TABLE IF NOT EXISTS "UserSettings" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "language" TEXT NOT NULL DEFAULT 'NL',
  "theme" TEXT NOT NULL DEFAULT 'SUNSET',
  "backgroundImage" TEXT,
  "introSound" TEXT,
  "backgroundSound" TEXT,
  "memoryEnabled" BOOLEAN NOT NULL DEFAULT 0,
  "allowAdultMemory" BOOLEAN NOT NULL DEFAULT 0,
  "nsfwPlusEnabled" BOOLEAN NOT NULL DEFAULT 0,
  "nsfwVerifiedAt" DATETIME,
  "memoryNotes" TEXT NOT NULL DEFAULT '',
  "isUpset" BOOLEAN NOT NULL DEFAULT 0,
  "parentalControl" BOOLEAN NOT NULL DEFAULT 1,
  "personality" TEXT NOT NULL DEFAULT 'Vriendelijk, behulpzaam en duidelijk',
  "ageMode" TEXT NOT NULL DEFAULT 'TEEN_16',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "UserSettings_userId_key" ON "UserSettings"("userId");

CREATE TABLE IF NOT EXISTS "ChatThread" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ChatThread_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "ChatMessage" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "threadId" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ChatMessage_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "ChatThread" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "ChatMessage_threadId_createdAt_idx" ON "ChatMessage"("threadId", "createdAt");

CREATE TABLE IF NOT EXISTS "Account" (
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "refresh_token" TEXT,
  "access_token" TEXT,
  "expires_at" INTEGER,
  "token_type" TEXT,
  "scope" TEXT,
  "id_token" TEXT,
  "session_state" TEXT,
  "oauth_token_secret" TEXT,
  "oauth_token" TEXT,
  PRIMARY KEY ("provider", "providerAccountId"),
  CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "Session" (
  "sessionToken" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "expires" DATETIME NOT NULL,
  CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "Session_sessionToken_key" ON "Session"("sessionToken");

CREATE TABLE IF NOT EXISTS "VerificationToken" (
  "identifier" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "expires" DATETIME NOT NULL,
  PRIMARY KEY ("identifier", "token")
);

CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_token_key" ON "VerificationToken"("token");
`;

export function getConfiguredDatabaseUrl(databaseUrl = process.env.DATABASE_URL) {
  const cleaned = databaseUrl?.trim();
  if (!cleaned || !cleaned.startsWith("file:")) {
    return DEFAULT_DATABASE_URL;
  }

  return cleaned;
}

export function getDatabasePathFromUrl(databaseUrl = getConfiguredDatabaseUrl()) {
  const cleaned = databaseUrl?.trim() || DEFAULT_DATABASE_URL;
  const rawPath = cleaned.startsWith("file:") ? cleaned.slice("file:".length) : "";
  return rawPath
    ? path.isAbsolute(rawPath)
      ? rawPath
      : path.resolve(process.cwd(), rawPath)
    : path.resolve(process.cwd(), "dev.db");
}

export function initDatabase(dbPath) {
  const resolvedDbPath = path.resolve(dbPath);
  fs.mkdirSync(path.dirname(resolvedDbPath), { recursive: true });
  const db = new DatabaseSync(resolvedDbPath);
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec(schemaSql);
  return resolvedDbPath;
}

export function ensureDatabaseInitialized(databaseUrl = getConfiguredDatabaseUrl()) {
  const dbPath = getDatabasePathFromUrl(databaseUrl);
  return initDatabase(dbPath);
}
