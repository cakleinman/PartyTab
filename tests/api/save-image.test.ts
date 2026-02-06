import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/save-image/route';

// Mock fs operations to prevent actual file writes
vi.mock('fs', async (importOriginal) => {
    const actual = await importOriginal<typeof import('fs')>();
    return {
        ...actual,
        existsSync: vi.fn(() => true),
        mkdirSync: vi.fn(),
        writeFileSync: vi.fn(),
    };
});

describe('/api/save-image', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const createRequest = (body: object) => {
        return new Request('http://localhost:3000/api/save-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
    };

    const validBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    describe('security: path traversal protection', () => {
        it('blocks path traversal with ../', async () => {
            const req = createRequest({
                filename: '../../../etc/passwd',
                image: validBase64,
            });

            const res = await POST(req);
            const data = await res.json();

            // Should be blocked by either sanitization (invalid after cleaning) or allowlist
            expect(res.status).toBeGreaterThanOrEqual(400);
            expect(data.error).toBeDefined();
        });

        it('blocks path traversal with encoded characters', async () => {
            const req = createRequest({
                filename: '..%2F..%2F..%2Fetc%2Fpasswd',
                image: validBase64,
            });

            const res = await POST(req);
            expect(res.status).toBeGreaterThanOrEqual(400);
        });

        it('blocks path traversal with backslashes', async () => {
            const req = createRequest({
                filename: '..\\..\\..\\windows\\system32',
                image: validBase64,
            });

            const res = await POST(req);
            expect(res.status).toBeGreaterThanOrEqual(400);
        });
    });

    describe('security: filename allowlist', () => {
        it('rejects unknown filenames', async () => {
            const req = createRequest({
                filename: 'malicious_file',
                image: validBase64,
            });

            const res = await POST(req);
            const data = await res.json();

            expect(res.status).toBe(400);
            expect(data.error).toContain('Invalid asset name');
        });

        it('accepts known marketing asset names', async () => {
            const req = createRequest({
                filename: 'debt_simplification',
                image: validBase64,
            });

            const res = await POST(req);
            const data = await res.json();

            expect(res.status).toBe(200);
            expect(data.success).toBe(true);
        });

        it('accepts all valid asset names', async () => {
            const validAssets = [
                'debt_simplification',
                'live_balance',
                'share_link',
                'settle_up',
                'add_expense',
                'flexible_splits',
            ];

            for (const asset of validAssets) {
                const req = createRequest({ filename: asset, image: validBase64 });
                const res = await POST(req);
                expect(res.status).toBe(200);
            }
        });
    });

    describe('input validation', () => {
        it('rejects missing filename', async () => {
            const req = createRequest({ image: validBase64 });

            const res = await POST(req);
            const data = await res.json();

            expect(res.status).toBe(400);
            expect(data.error).toBe('Missing data');
        });

        it('rejects missing image', async () => {
            const req = createRequest({ filename: 'debt_simplification' });

            const res = await POST(req);
            const data = await res.json();

            expect(res.status).toBe(400);
            expect(data.error).toBe('Missing data');
        });

        it('rejects empty filename after sanitization', async () => {
            const req = createRequest({
                filename: '...',
                image: validBase64,
            });

            const res = await POST(req);
            expect(res.status).toBe(400);
        });
    });
});
