import { adminClient } from "./admin";

const EXPIRY_SECONDS = 3600; // 1 hour

export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = EXPIRY_SECONDS
): Promise<string | null> {
  const { data, error } = await adminClient.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);
  if (error || !data) return null;
  return data.signedUrl;
}

export async function getSignedUploadUrl(
  bucket: string,
  path: string
): Promise<{ signedUrl: string; token: string } | null> {
  const { data, error } = await adminClient.storage
    .from(bucket)
    .createSignedUploadUrl(path);
  if (error || !data) return null;
  return data;
}

export async function deleteFile(bucket: string, path: string): Promise<void> {
  await adminClient.storage.from(bucket).remove([path]);
}

export const BUCKETS = {
  REFERENCE_IMAGES: "reference-images",
  HEALED_PHOTOS: "healed-photos",
  PORTFOLIO: "portfolio",
  CONSENT_PDFS: "consent-pdfs",
} as const;
