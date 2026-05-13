import { fileTypeFromBuffer } from "file-type";

export const ALLOWED_RECEIPT_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
] as const;

export type AllowedReceiptMime = (typeof ALLOWED_RECEIPT_MIME_TYPES)[number];

export type MagicByteCheck =
  | { ok: true; mime: AllowedReceiptMime; ext: string }
  | { ok: false; reason: "no-format-detected" | "format-not-allowed" };

const EXT_FOR_MIME: Record<AllowedReceiptMime, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
};

export async function verifyImageMagicBytes(
  buffer: Uint8Array
): Promise<MagicByteCheck> {
  const detected = await fileTypeFromBuffer(buffer);
  if (!detected) return { ok: false, reason: "no-format-detected" };
  if (!ALLOWED_RECEIPT_MIME_TYPES.includes(detected.mime as AllowedReceiptMime)) {
    return { ok: false, reason: "format-not-allowed" };
  }
  const mime = detected.mime as AllowedReceiptMime;
  return { ok: true, mime, ext: EXT_FOR_MIME[mime] };
}
