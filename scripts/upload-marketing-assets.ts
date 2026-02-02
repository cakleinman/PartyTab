#!/usr/bin/env tsx
/**
 * Upload marketing assets to Supabase Storage
 * 
 * Usage: npx tsx scripts/upload-marketing-assets.ts
 * 
 * This script:
 * 1. Creates the 'marketing' bucket if it doesn't exist
 * 2. Uploads all PNG/JPG files from marketing/ to Supabase Storage
 * 3. Outputs the public URLs for each file
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import { config } from "dotenv";

// Load .env file
config();

const MARKETING_BUCKET = "marketing";
const MARKETING_DIR = path.join(process.cwd(), "marketing");

async function main() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
    });

    // Create bucket if it doesn't exist
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some((b) => b.name === MARKETING_BUCKET);

    if (!bucketExists) {
        const { error } = await supabase.storage.createBucket(MARKETING_BUCKET, {
            public: true, // Marketing assets are public
        });
        if (error) {
            console.error("Failed to create bucket:", error);
            process.exit(1);
        }
        console.log(`✓ Created bucket: ${MARKETING_BUCKET}`);
    } else {
        console.log(`✓ Bucket exists: ${MARKETING_BUCKET}`);
    }

    // Find all image files
    const imageExtensions = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"];
    const files: string[] = [];

    function findImages(dir: string) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory() && !entry.name.includes("node_modules")) {
                findImages(fullPath);
            } else if (entry.isFile()) {
                const ext = path.extname(entry.name).toLowerCase();
                if (imageExtensions.includes(ext)) {
                    files.push(fullPath);
                }
            }
        }
    }

    findImages(MARKETING_DIR);
    console.log(`\nFound ${files.length} image files to upload:\n`);

    // Upload each file
    const results: { file: string; url: string }[] = [];

    for (const filePath of files) {
        const relativePath = path.relative(MARKETING_DIR, filePath);
        const storagePath = relativePath.replace(/\\/g, "/"); // Normalize for storage
        const fileBuffer = fs.readFileSync(filePath);
        const contentType = getContentType(filePath);

        const { error } = await supabase.storage
            .from(MARKETING_BUCKET)
            .upload(storagePath, fileBuffer, {
                contentType,
                upsert: true,
            });

        if (error) {
            console.error(`✗ Failed: ${relativePath}`, error.message);
        } else {
            const { data: urlData } = supabase.storage
                .from(MARKETING_BUCKET)
                .getPublicUrl(storagePath);

            results.push({ file: relativePath, url: urlData.publicUrl });
            console.log(`✓ Uploaded: ${relativePath}`);
        }
    }

    // Output summary
    console.log("\n--- Upload Complete ---\n");
    console.log("Public URLs:");
    for (const r of results) {
        console.log(`  ${r.file}`);
        console.log(`    → ${r.url}\n`);
    }
}

function getContentType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const types: Record<string, string> = {
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".gif": "image/gif",
        ".webp": "image/webp",
        ".svg": "image/svg+xml",
    };
    return types[ext] || "application/octet-stream";
}

main().catch(console.error);
