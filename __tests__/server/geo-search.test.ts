import clientPromise from '@/db/mongodb';
import { findBusinessesNearby } from '@app/actions/geo-search';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('findBusinessesNearby', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return nearby businesses based on lat/lng', async () => {
        const lat = 40.73061;
        const lng = -73.935242;

        const businesses = await findBusinessesNearby(lat, lng);

        expect(businesses).toBeInstanceOf(Array);
        expect(businesses).toHaveLength(0); // Default mock in vitest.setup.ts returns []
    });

    it('should call MongoDB with correct $near parameters', async () => {
        const client = await clientPromise;
        const db = client.db('vercel-db');
        const collection = db.collection('mobb-listings');

        const lat = 40.73061;
        const lng = -73.935242;
        const radius = 5000;

        await findBusinessesNearby(lat, lng, radius);

        expect(collection.find).toHaveBeenCalledWith({
            coordinates: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [lng, lat],
                    },
                    $maxDistance: radius,
                },
            },
        });
    });
});
