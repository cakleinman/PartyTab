import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
    try {
        const { image, filename } = await req.json();
        if (!image || !filename) return NextResponse.json({ error: 'Missing data' }, { status: 400 });

        const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');

        const targetDir = '/Users/christopher/Desktop/ClaudeProjects/partytab/marketing/campaigns/features-showcase';

        // Ensure directory exists
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        const filePath = path.join(targetDir, filename + '.png');

        fs.writeFileSync(filePath, buffer);
        console.log(`Saved ${filename} to ${filePath}`);

        return NextResponse.json({ success: true, path: filePath });
    } catch (e: unknown) {
        console.error("Error saving image:", e);
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
