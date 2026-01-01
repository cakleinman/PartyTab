import Anthropic from "@anthropic-ai/sdk";

export interface ParsedReceiptItem {
  name: string;
  priceCents: number;
  quantity: number;
}

export interface ParsedReceipt {
  items: ParsedReceiptItem[];
  subtotalCents?: number;
  taxCents?: number;
  totalCents?: number;
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const PARSE_PROMPT = `You are a receipt parser. Extract line items from this receipt image.

For each item, provide:
- name: The item description (clean up abbreviations if obvious)
- priceCents: The price in cents (e.g., $12.99 = 1299)
- quantity: The quantity (default to 1 if not specified)

Also extract if visible:
- subtotalCents: Subtotal before tax
- taxCents: Tax amount
- totalCents: Final total

Rules:
1. Only include actual purchased items, not subtotals/totals/tax lines
2. If quantity is shown (e.g., "2 x Burger"), set quantity accordingly
3. Skip items with $0.00 price (like discounts applied to other items)
4. If you can't parse the receipt, return empty items array

Respond ONLY with valid JSON in this exact format:
{
  "items": [
    {"name": "Item Name", "priceCents": 1299, "quantity": 1}
  ],
  "subtotalCents": 2598,
  "taxCents": 208,
  "totalCents": 2806
}`;

export async function parseReceipt(imageBase64: string, mimeType: string): Promise<ParsedReceipt> {
  const mediaType = mimeType as "image/jpeg" | "image/png" | "image/gif" | "image/webp";

  const response = await anthropic.messages.create({
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
              data: imageBase64,
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
    .map((item) => ({
      name: item.name.trim().slice(0, 100),
      priceCents: Math.round(item.priceCents),
      quantity: typeof item.quantity === "number" && item.quantity > 0 ? item.quantity : 1,
    }));

  return {
    items: cleanedItems,
    subtotalCents:
      typeof parsed.subtotalCents === "number" ? Math.round(parsed.subtotalCents) : undefined,
    taxCents: typeof parsed.taxCents === "number" ? Math.round(parsed.taxCents) : undefined,
    totalCents: typeof parsed.totalCents === "number" ? Math.round(parsed.totalCents) : undefined,
  };
}
