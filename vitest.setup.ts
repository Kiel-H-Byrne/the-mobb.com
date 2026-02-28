import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock next/cache
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}));

// Mock next/headers
vi.mock('next/headers', () => ({
    cookies: vi.fn(() => ({
        get: vi.fn((name) => {
            // Return a valid fake token for our admin tests by default
            if (name === 'mobb_admin_token') return { value: 'true' };
            return null;
        }),
        set: vi.fn(),
        delete: vi.fn(),
    })),
}));

// Mock the MongoDB client promise globally
vi.mock('@/db/mongodb', () => {
    const collectionMock = {
        find: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        toArray: vi.fn().mockResolvedValue([]),
        insertOne: vi.fn().mockResolvedValue({ insertedId: 'fake-id' }),
        insertMany: vi.fn().mockResolvedValue({ insertedCount: 1 }),
        updateOne: vi.fn().mockResolvedValue({ modifiedCount: 1 }),
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

// Mock Global Fetch for SerpApi and Geocoding
global.fetch = vi.fn() as any;
