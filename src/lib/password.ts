import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const SCRYPT_KEY_LENGTH = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, SCRYPT_KEY_LENGTH).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedValue: string): boolean {
  const parts = storedValue.split(":");
  if (parts.length !== 2) {
    return false;
  }

  const [salt, expectedHashHex] = parts;
  if (!salt || !expectedHashHex) {
    return false;
  }

  const actualHash = scryptSync(password, salt, SCRYPT_KEY_LENGTH);
  const expectedHash = Buffer.from(expectedHashHex, "hex");

  if (actualHash.length !== expectedHash.length) {
    return false;
  }

  return timingSafeEqual(actualHash, expectedHash);
}
