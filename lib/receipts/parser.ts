import Anthropic from "@anthropic-ai/sdk";
import { APIError, AuthenticationError, RateLimitError } from "@anthropic-ai/sdk";
import sharp from "sharp";

export interface ParsedReceiptItem {
  name: string;
  priceCents: number;
  quantity: number;
}

export interface ParsedReceipt {
  items: ParsedReceiptItem[];
  subtotalCents?: number;
  taxCents?: number;
  feeCents?: number;
  totalCents?: number;
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Claude's image size limit is 5MB
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

// Compress image if it exceeds the size limit
async function compressImageIfNeeded(
  base64: string,
  mimeType: string
): Promise<{ base64: string; mimeType: string }> {
  const buffer = Buffer.from(base64, "base64");

  // If under limit, return as-is
  if (buffer.length <= MAX_IMAGE_SIZE) {
    return { base64, mimeType };
  }

  console.log(`Compressing image: ${(buffer.length / 1024 / 1024).toFixed(2)}MB`);

  // Calculate target quality based on how much we need to shrink
  const ratio = MAX_IMAGE_SIZE / buffer.length;
  let quality = Math.max(40, Math.floor(ratio * 85));

  let compressed = await sharp(buffer)
    .resize(2000, 2000, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality })
    .toBuffer();

  // If still too large, reduce quality further
  while (compressed.length > MAX_IMAGE_SIZE && quality > 20) {
    quality -= 10;
    compressed = await sharp(buffer)
      .resize(1500, 1500, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality })
      .toBuffer();
  }

  console.log(`Compressed to: ${(compressed.length / 1024 / 1024).toFixed(2)}MB (quality: ${quality})`);

  if (compressed.length > MAX_IMAGE_SIZE) {
    throw new Error("Image is too large. Please take a photo with lower resolution or better lighting.");
  }

  return {
    base64: compressed.toString("base64"),
    mimeType: "image/jpeg",
  };
}

const PARSE_PROMPT = `You are a receipt parser. Extract line items from this receipt image.

For each item, provide:
- name: The item description (clean up abbreviations if obvious)
- priceCents: The price in cents (e.g., $12.99 = 1299)
- quantity: The quantity (default to 1 if not specified)

Also extract if visible:
- subtotalCents: Subtotal before tax
- taxCents: Tax amount
- feeCents: Any additional fees (service fee, convenience fee, admin fee, processing fee, delivery fee, etc.) - sum them all into one value
- totalCents: Final total

Rules:
1. Only include actual purchased items, not subtotals/totals/tax/fee lines
2. If quantity is shown (e.g., "2 x Burger"), set quantity accordingly
3. Skip items with $0.00 price (like discounts applied to other items)
4. If you can't parse the receipt, return empty items array
5. Fees are separate from tax - include service charges, admin fees, convenience fees, delivery fees, etc.

Respond ONLY with valid JSON in this exact format:
{
  "items": [
    {"name": "Item Name", "priceCents": 1299, "quantity": 1}
  ],
  "subtotalCents": 2598,
  "taxCents": 208,
  "feeCents": 150,
  "totalCents": 2956
}`;

export async function parseReceipt(imageBase64: string, mimeType: string): Promise<ParsedReceipt> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("Receipt parsing is not configured. Please contact support.");
  }

  // Compress image if it exceeds Claude's 5MB limit
  const { base64: compressedBase64, mimeType: compressedMimeType } = await compressImageIfNeeded(
    imageBase64,
    mimeType
  );
  const mediaType = compressedMimeType as "image/jpeg" | "image/png" | "image/gif" | "image/webp";

  let response;
  try {
    response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: compressedBase64,
              },
            },
            {
              type: "text",
              text: PARSE_PROMPT,
            },
          ],
        },
      ],
    });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw new Error("Receipt parsing service authentication failed. Please contact support.");
    }
    if (error instanceof RateLimitError) {
      throw new Error("Receipt parsing service is busy. Please try again in a moment.");
    }
    if (error instanceof APIError) {
      console.error("Anthropic API error:", error.status, error.message);
      throw new Error(`Receipt parsing failed: ${error.message}`);
    }
    throw error;
  }

  // Extract text content from response
  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  // Parse JSON from response
  const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No JSON found in response");
  }

  const parsed = JSON.parse(jsonMatch[0]) as ParsedReceipt;

  // Validate and clean the response
  if (!Array.isArray(parsed.items)) {
    return { items: [] };
  }

  const cleanedItems = parsed.items
    .filter(
      (item): item is ParsedReceiptItem =>
        typeof item.name === "string" &&
        typeof item.priceCents === "number" &&
        item.priceCents > 0
    )
    .flatMap((item) => {
      const name = item.name.trim().slice(0, 100);
      const priceCents = Math.round(item.priceCents);
      const quantity = typeof item.quantity === "number" && item.quantity > 0 ? item.quantity : 1;

      // Expand items with quantity > 1 into separate line items
      // so different people can claim each one
      if (quantity > 1) {
        const priceEach = Math.round(priceCents / quantity);
        return Array.from({ length: quantity }, () => ({
          name,
          priceCents: priceEach,
          quantity: 1,
        }));
      }

      return [{ name, priceCents, quantity: 1 }];
    });

  return {
    items: cleanedItems,
    subtotalCents:
      typeof parsed.subtotalCents === "number" ? Math.round(parsed.subtotalCents) : undefined,
    taxCents: typeof parsed.taxCents === "number" ? Math.round(parsed.taxCents) : undefined,
    feeCents: typeof parsed.feeCents === "number" ? Math.round(parsed.feeCents) : undefined,
    totalCents: typeof parsed.totalCents === "number" ? Math.round(parsed.totalCents) : undefined,
  };
}
