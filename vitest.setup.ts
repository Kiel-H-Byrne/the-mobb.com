import '@testing-library/jest-dom';
import { expect, vi } from 'vitest';

/**
 * Custom snapshot serializer: replaces Date instances with "[Date]".
 *
 * WHY: Database documents contain createdAt/submitted/approvedAt timestamps
 * that change every test run. Snapshotting the raw Date would cause constant
 * failures. This serializer preserves the presence and position of Date fields
 * (proving they exist in the schema) without caring about the exact value.
 */
expect.addSnapshotSerializer({
    test: (val) => val instanceof Date,
    print: () => '"[Date]"',
});

// Mock next/cache — include both revalidatePath AND unstable_cache
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
    // unstable_cache wraps the fn and returns it as-is (no real caching in tests)
    unstable_cache: vi.fn((fn: (...args: any[]) => any) => fn),
}));

// Mock next/headers — cookies() AND headers() both needed by server actions
vi.mock('next/headers', () => ({
    cookies: vi.fn(() => ({
        get: vi.fn((name: string) => {
            if (name === 'mobb_admin_token') return { value: 'true' };
            return null;
        }),
        set: vi.fn(),
        delete: vi.fn(),
    })),
    headers: vi.fn(() => ({
        get: vi.fn((name: string) => {
            if (name === 'x-forwarded-for') return '127.0.0.1';
            return null;
        }),
    })),
}));

// Mock the MongoDB client promise globally
vi.mock('@/db/mongodb', () => {
    const collectionMock = {
        // Chainable query methods
        find: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        project: vi.fn().mockReturnThis(),
        aggregate: vi.fn().mockReturnThis(),
        toArray: vi.fn().mockResolvedValue([]),
        // Write methods
        insertOne: vi.fn().mockResolvedValue({ insertedId: 'fake-id' }),
        insertMany: vi.fn().mockResolvedValue({ insertedCount: 1 }),
        updateOne: vi.fn().mockResolvedValue({ modifiedCount: 1 }),
        updateMany: vi.fn().mockResolvedValue({ modifiedCount: 0 }),
        deleteOne: vi.fn().mockResolvedValue({ deletedCount: 1 }),
        deleteMany: vi.fn().mockResolvedValue({ deletedCount: 0 }),
        findOne: vi.fn().mockResolvedValue(null),
    };

    const dbMock = {
        collection: vi.fn().mockReturnValue(collectionMock),
    };

    const clientMock = {
        db: vi.fn().mockReturnValue(dbMock),
    };

    return {
        default: Promise.resolve(clientMock),
        DB_NAME: 'test-db',
    };
});

// Mock @ai-sdk/openai so no real API calls are made
vi.mock('@ai-sdk/openai', () => ({
    createOpenAI: vi.fn(() => vi.fn()),
}));

// Mock @/util/linkPreview — always returns null in tests
vi.mock('@/util/linkPreview', () => ({
    fetchLinkPreview: vi.fn().mockResolvedValue(null),
}));

// Mock Global Fetch for SerpApi, Geocoding, and page scraping
global.fetch = vi.fn() as any;

/**
 * Global beforeEach: runs before EVERY test across all files.
 *
 * Pattern:
 *  1. Clear all mock call records and queued responses (clearAllMocks)
 *  2. Re-apply default implementations so chained queries work (find→this, etc.)
 *  3. Individual tests then enqueue their own responses via mockResolvedValueOnce
 *
 * This replaces the need for per-test vi.clearAllMocks() calls.
 */
import { beforeEach } from 'vitest';

beforeEach(async () => {
    // Step 1: Clear tracked call counts and instances.
    // Note: vi.clearAllMocks() does NOT clear mockResolvedValueOnce queues.
    // We handle fetch queue clearing explicitly below.
    vi.clearAllMocks();

    // Explicitly reset global.fetch to a fresh mock with empty Once queue.
    // This is the safest way to clear the fetch Once queue without resetting
    // MongoDB mock implementations (which resetAllMocks would do).
    global.fetch = vi.fn() as any;

    // Step 2: Re-apply MongoDB chainable defaults (clearAllMocks wipes these).
    const clientModule = await import('@/db/mongodb');
    const client = await (clientModule as any).default;
    const dbMock = client.db();
    const col = dbMock.collection();

    col.find.mockReturnThis();
    col.sort.mockReturnThis();
    col.skip.mockReturnThis();
    col.limit.mockReturnThis();
    col.project.mockReturnThis();
    col.aggregate.mockReturnThis();
    col.toArray.mockResolvedValue([]);
    col.findOne.mockResolvedValue(null);
    col.insertOne.mockResolvedValue({ insertedId: 'fake-id' });
    col.insertMany.mockResolvedValue({ insertedCount: 1 });
    col.updateOne.mockResolvedValue({ modifiedCount: 1 });
    col.updateMany.mockResolvedValue({ modifiedCount: 0 });
    col.deleteOne.mockResolvedValue({ deletedCount: 1 });
    col.deleteMany.mockResolvedValue({ deletedCount: 0 });

    // Step 3: Re-apply next/cache and next/headers defaults.
    const { revalidatePath, unstable_cache } = await import('next/cache');
    (revalidatePath as any).mockImplementation(() => {});
    (unstable_cache as any).mockImplementation((fn: any) => fn);

    const { cookies, headers } = await import('next/headers');
    (cookies as any).mockImplementation(() => ({
        get: vi.fn((name: string) => {
            if (name === 'mobb_admin_token') return { value: 'true' };
            return null;
        }),
        set: vi.fn(),
        delete: vi.fn(),
    }));
    (headers as any).mockImplementation(() => ({
        get: vi.fn((name: string) => {
            if (name === 'x-forwarded-for') return '127.0.0.1';
            return null;
        }),
    }));

    // Step 4: Restore a safe default for global.fetch.
    // Returns a generic successful HTML response suitable for web scraping actions.
    // Tests that need specific fetch behavior should use mockResolvedValueOnce AFTER this runs.
    (global.fetch as any).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: async () => '<html><body>Default mock HTML content</body></html>',
        json: async () => ({ status: 'ZERO_RESULTS', candidates: [], results: [] }),
    });
});
