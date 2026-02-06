import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * Marketing asset image saver - DEVELOPMENT ONLY
 * Used by /marketing-assets page to generate marketing images locally.
 * 
 * Security: This endpoint is disabled in production and validates all inputs.
 */

// Allowlist of valid marketing asset filenames
const ALLOWED_ASSETS = [
    'debt_simplification',
    'live_balance',
    'share_link',
    'settle_up',
    'add_expense',
    'flexible_splits',
];

export async function POST(req: Request) {
    // SECURITY: Block access in production
    if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
            { error: 'Endpoint disabled in production' },
            { status: 403 }
        );
    }

    try {
        const { image, filename } = await req.json();
        if (!image || !filename) {
            return NextResponse.json({ error: 'Missing data' }, { status: 400 });
        }

        // SECURITY: Sanitize filename - remove path traversal and special characters
        const sanitizedFilename = path.basename(String(filename)).replace(/[^a-zA-Z0-9_-]/g, '');
        if (!sanitizedFilename) {
            return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
        }

        // SECURITY: Only allow known marketing asset names
        if (!ALLOWED_ASSETS.includes(sanitizedFilename)) {
            return NextResponse.json(
                { error: `Invalid asset name. Allowed: ${ALLOWED_ASSETS.join(', ')}` },
                { status: 400 }
            );
        }

        const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        // Use relative path from project root for portability
        const targetDir = path.join(process.cwd(), 'marketing', 'campaigns', 'features-showcase');

        // Ensure directory exists
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        const filePath = path.join(targetDir, sanitizedFilename + '.png');

        fs.writeFileSync(filePath, buffer);
        console.log(`[dev] Saved marketing asset: ${sanitizedFilename}.png`);

        return NextResponse.json({ success: true, path: filePath });
    } catch (e: unknown) {
        console.error('Error saving image:', e);
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
