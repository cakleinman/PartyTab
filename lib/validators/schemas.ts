import { z } from "zod";
import { parseCents } from "@/lib/money/cents";

const displayNameSchema = z
  .string({ required_error: "Display name is required" })
  .trim()
  .min(1, "Display name must be 1-40 characters")
  .max(40, "Display name must be 1-40 characters");

const tabNameSchema = z
  .string({ required_error: "Tab name is required" })
  .trim()
  .min(1, "Tab name must be 1-80 characters")
  .max(80, "Tab name must be 1-80 characters");

const descriptionSchema = z
  .string()
  .trim()
  .max(240, "Description must be 240 characters or less");

const dateSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD");

const amountSchema = z
  .string()
  .trim()
  .refine((value) => {
    try {
      parseCents(value);
      return true;
    } catch {
      return false;
    }
  }, "Invalid amount format");

const uuidSchema = z.string().uuid("Invalid id");

export function parseDisplayName(value: unknown): string {
  return displayNameSchema.parse(value);
}

export function parseTabName(value: unknown): string {
  return tabNameSchema.parse(value);
}

export function parseDescription(value: unknown): string | null {
  if (value === undefined || value === null || value === "") return null;
  return descriptionSchema.parse(value);
}

export function parseDateInput(value: unknown): Date | null {
  if (value === undefined || value === null || value === "") return null;
  const parsed = dateSchema.parse(value);
  const date = new Date(`${parsed}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid date");
  }
  return date;
}

export function parseAmountToCents(value: unknown): number {
  const parsed = amountSchema.parse(value);
  return parseCents(parsed);
}

export function parseOptionalString(value: unknown, maxLength: number): string | null {
  if (value === undefined || value === null || value === "") return null;
  const schema = z
    .string()
    .trim()
    .max(maxLength, `Value must be ${maxLength} characters or less`);
  return schema.parse(value);
}

export function parseUuid(value: unknown, label = "id"): string {
  return uuidSchema.parse(value, { path: [label] });
}

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const emailSchema = z
  .string({ required_error: "Email is required" })
  .trim()
  .toLowerCase()
  .refine((val) => EMAIL_REGEX.test(val), "Invalid email format");

export function parseEmail(value: unknown): string {
  return emailSchema.parse(value);
}
