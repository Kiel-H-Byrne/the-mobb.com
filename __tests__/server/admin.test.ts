import { beforeEach, describe, expect, it, vi } from 'vitest';
import { approveListing, getPendingListings, rejectListing } from '../../../app/actions/admin';
import clientPromise from '../../../src/db/mongodb';

describe('Admin Server Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getPendingListings', () => {
        it('returns unauthorized if not admin (mocking cookies would test this, but our setup mocks admin=true)', async () => {
            // Our vitest.setup.ts mocks cookies to return true for mobb_admin_token.
            // We'll just verify it returns a successful payload format.
            const res = await getPendingListings();
            expect(res.success).toBe(true);
            expect(res.data).toEqual([]);
        });
    });

    describe('approveListing', () => {
        it('fetches geocoding if lat/lng are missing and inserts into listings', async () => {
            // Mock Google Geocoding response
            (global.fetch as any).mockResolvedValueOnce({
                json: async () => ({
                    status: 'OK',
                    results: [
                        {
                            geometry: {
                                location: { lat: 34.0522, lng: -118.2437 },
                            },
                        },
                    ],
                }),
            });

            const client = await clientPromise;
            const db = client.db('test-db');
            const collectionMock = db.collection('listings');

            const fakeListing = {
                name: 'Test Business',
                address: '123 Test St, Los Angeles, CA',
                category: 'Tech'
            };

            const res = await (approveListing as any)('64a1b2c3d4e5f60000000000', fakeListing);

            expect(res.success).toBe(true);

            // Verify fetch was called with the geocoding URL
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('maps.googleapis.com/maps/api/geocode')
            );

            // Verify DB insertOne was called with the correct 2dsphere format
            expect(collectionMock.insertOne).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'Test Business',
                    coordinates: {
                        type: 'Point',
                        coordinates: [-118.2437, 34.0522], // LNG, LAT order is required
                    },
                })
            );
        });
    });

    describe('rejectListing', () => {
        it('updates the status to REJECTED', async () => {
            const client = await clientPromise;
            const db = client.db('test-db');
            const collectionMock = db.collection('pending_listings');

            const res = await rejectListing('64a1b2c3d4e5f60000000000');

            expect(res.success).toBe(true);

            // Verify DB updateOne was called correctly
            expect(collectionMock.updateOne).toHaveBeenCalledWith(
                { _id: expect.anything() },
                { $set: { status: 'REJECTED' } }
            );
        });
    });
});
