import { describe, it, expect } from "vitest";
import { verifyImageMagicBytes } from "@/lib/receipts/verifyImageMagicBytes";

// Minimal valid magic-byte prefixes for each format. file-type only needs the
// first few bytes to detect the format, so these tiny buffers are enough to
// pass the magic-byte check without being decodable images.
const PNG_MAGIC = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // PNG signature
  0x00, 0x00, 0x00, 0x0d, // IHDR length
  0x49, 0x48, 0x44, 0x52, // "IHDR"
  0x00, 0x00, 0x00, 0x01, // width 1
  0x00, 0x00, 0x00, 0x01, // height 1
  0x08, 0x06, 0x00, 0x00, 0x00, // bit depth, color type, etc.
]);

const JPEG_MAGIC = Buffer.from([
  0xff, 0xd8, 0xff, 0xe0, // SOI + APP0
  0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, // "JFIF\0"
]);

const WEBP_MAGIC = Buffer.from([
  0x52, 0x49, 0x46, 0x46, // "RIFF"
  0x1a, 0x00, 0x00, 0x00, // file size
  0x57, 0x45, 0x42, 0x50, // "WEBP"
  0x56, 0x50, 0x38, 0x4c, // "VP8L"
]);

const HEIC_MAGIC = Buffer.from([
  0x00, 0x00, 0x00, 0x18, // box size
  0x66, 0x74, 0x79, 0x70, // "ftyp"
  0x68, 0x65, 0x69, 0x63, // "heic" major brand
  0x00, 0x00, 0x00, 0x00,
  0x68, 0x65, 0x69, 0x63,
  0x6d, 0x69, 0x66, 0x31,
]);

const HTML_PAYLOAD = Buffer.from(
  '<!doctype html><html><body><script>alert(1)</script></body></html>'
);

const PDF_PAYLOAD = Buffer.from('%PDF-1.4\n%fake\n');

describe("verifyImageMagicBytes", () => {
  it("accepts a real PNG header", async () => {
    const result = await verifyImageMagicBytes(PNG_MAGIC);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.mime).toBe("image/png");
      expect(result.ext).toBe("png");
    }
  });

  it("accepts a real JPEG header", async () => {
    const result = await verifyImageMagicBytes(JPEG_MAGIC);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.mime).toBe("image/jpeg");
  });

  it("accepts a real WebP header", async () => {
    const result = await verifyImageMagicBytes(WEBP_MAGIC);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.mime).toBe("image/webp");
  });

  it("accepts a real HEIC header (iPhone photos)", async () => {
    const result = await verifyImageMagicBytes(HEIC_MAGIC);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.mime).toBe("image/heic");
  });

  it("rejects an HTML payload pretending to be an image", async () => {
    const result = await verifyImageMagicBytes(HTML_PAYLOAD);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      // file-type may either not detect anything or detect it as text/xml.
      expect(["no-format-detected", "format-not-allowed"]).toContain(result.reason);
    }
  });

  it("rejects a PDF payload", async () => {
    const result = await verifyImageMagicBytes(PDF_PAYLOAD);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("format-not-allowed");
  });

  it("rejects an empty buffer", async () => {
    const result = await verifyImageMagicBytes(Buffer.from([]));
    expect(result.ok).toBe(false);
  });

  it("rejects random noise", async () => {
    const noise = Buffer.alloc(64);
    for (let i = 0; i < noise.length; i++) noise[i] = (i * 17) & 0xff;
    const result = await verifyImageMagicBytes(noise);
    expect(result.ok).toBe(false);
  });
});
