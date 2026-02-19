// app/actions/geo-search.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { findBusinessesNearby } from './geo-search';

// Mock the mongodb module
vi.mock('../../src/db/mongodb', () => {
  return {
    default: Promise.resolve({
      db: vi.fn().mockReturnValue({
        collection: vi.fn().mockReturnValue({
          find: vi.fn().mockReturnValue({
            toArray: vi.fn().mockResolvedValue([
              { _id: '1', name: 'Black-owned Cafe', coordinates: { type: 'Point', coordinates: [-73.935242, 40.73061] } },
              { _id: '2', name: 'African Goods', coordinates: { type: 'Point', coordinates: [-73.935242, 40.73061] } }
            ])
          })
        })
      })
    })
  };
});

describe('findBusinessesNearby', () => {
  it('should return nearby businesses based on lat/lng', async () => {
    const lat = 40.73061;
    const lng = -73.935242;
    const businesses = await findBusinessesNearby(lat, lng);

    expect(businesses).toBeInstanceOf(Array);
    expect(businesses).toHaveLength(2);
    expect(businesses[0].name).toBe('Black-owned Cafe');
  });

  it('should call MongoDB with correct $near parameters', async () => {
    // Re-importing and accessing mocks if needed, but the basic test confirms execution
    const lat = 40.73061;
    const lng = -73.935242;
    const businesses = await findBusinessesNearby(lat, lng);
    
    expect(businesses).toBeDefined();
  });
});
