import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Server-side Supabase client with service role key.
 * Use this for server-side operations that bypass RLS.
 * DO NOT expose this client to the browser.
 */
export function getSupabaseServer() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      "Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
    );
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Client-side Supabase client with anon key.
 * Safe to use in browser code.
 */
export function getSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}

// Storage bucket name for receipts
export const RECEIPTS_BUCKET = "receipts";

/**
 * Generate a storage path for a receipt image.
 * Format: receipts/{tabId}/{expenseId}.{ext}
 */
export function getReceiptPath(
  tabId: string,
  expenseId: string,
  ext: string
): string {
  return `${tabId}/${expenseId}.${ext}`;
}

/**
 * Get a signed URL for a receipt image (expires in 1 hour).
 */
export async function getReceiptSignedUrl(
  path: string
): Promise<string | null> {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase.storage
    .from(RECEIPTS_BUCKET)
    .createSignedUrl(path, 3600); // 1 hour

  if (error) {
    console.error("Error creating signed URL:", error);
    return null;
  }

  return data.signedUrl;
}
