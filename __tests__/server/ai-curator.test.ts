import clientPromise from '@/db/mongodb';
import { extractBusinessData } from '@app/actions/ai-curator';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the AI SDK
vi.mock('ai', () => ({
    generateObject: vi.fn().mockResolvedValue({
        object: {
            sourceType: 'single_business',
            businesses: [
                {
                    name: 'Soul Food Express',
                    category: 'Restaurant',
                    address: '456 Test Blvd, Atlanta, GA',
                    isBlackOwned: true,
                    description: 'A family owned soul food restaurant.',
                },
            ],
        },
    }),
}));

vi.mock('@ai-sdk/google', () => ({
    google: vi.fn(),
    createGoogleGenerativeAI: vi.fn(() => vi.fn()),
}));

describe('AI Curator Server Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Mock fetch to simulate downloading an HTML page
        (global.fetch as any).mockResolvedValue({
            text: async () => '<html><body>Welcome to Soul Food Express. A Black-owned family restaurant.</body></html>',
        });
    });

    describe('extractBusinessData', () => {
        it('fetches HTML, extracts business data via AI, and inserts into pending_listings', async () => {
            const client = await clientPromise;
            const db = client.db('test-db');
            const collectionMock = db.collection('pending_listings');

            const res = await extractBusinessData('https://fake-restaurant.com');

            expect(res.success).toBe(true);
            expect(res.count).toBe(1);

            // Verify DB insertMany was called with the AI generated data
            expect(collectionMock.insertMany).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({
                        name: 'Soul Food Express',
                        category: 'Restaurant',
                        address: '456 Test Blvd, Atlanta, GA',
                        isBlackOwned: true,
                        status: 'PENDING_REVIEW',
                        source: 'AI_SCAN',
                    })
                ])
            );
        });
    });
});
