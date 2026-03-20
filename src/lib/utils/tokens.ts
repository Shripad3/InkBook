import { createHmac, timingSafeEqual } from "crypto";

const SECRET = process.env.TOKEN_SECRET ?? "dev-secret-change-in-production";

export function createToken(bookingId: string, expiresInDays: number = 7): string {
  const expiresAt = Date.now() + expiresInDays * 24 * 60 * 60 * 1000;
  const payload = `${bookingId}:${expiresAt}`;
  const mac = createHmac("sha256", SECRET).update(payload).digest("base64url");
  return Buffer.from(`${payload}:${mac}`).toString("base64url");
}

export function verifyToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const lastColon = decoded.lastIndexOf(":");
    const payload = decoded.slice(0, lastColon);
    const mac = decoded.slice(lastColon + 1);
    const colonIdx = payload.indexOf(":");
    const bookingId = payload.slice(0, colonIdx);
    const expiresAt = parseInt(payload.slice(colonIdx + 1), 10);
    if (Date.now() > expiresAt) return null;
    const expectedMac = createHmac("sha256", SECRET).update(payload).digest("base64url");
    const expectedBuf = Buffer.from(expectedMac);
    const actualBuf = Buffer.from(mac);
    if (expectedBuf.length !== actualBuf.length) return null;
    if (!timingSafeEqual(expectedBuf, actualBuf)) return null;
    return bookingId;
  } catch {
    return null;
  }
}
