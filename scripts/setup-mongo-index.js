// scripts/setup-mongo-index.js
import * as dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config({ path: '.env.local' });

const uri = process.env.DBOBB_MONGODB_URI;

if (!uri) {
  console.error('CRITICAL: DBOBB_MONGODB_URI is not defined in .env.local');
  process.exit(1);
}

async function main() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected correctly to MongoDB server');

    const db = client.db('vercel-db');
    const collection = db.collection('listings'); // Changed collection name to 'listings'

    console.log("Creating 2dsphere index on 'coordinates' field...");
    const geoIndexResult = await collection.createIndex({ coordinates: '2dsphere' });
    console.log(`Success: Geo index '${geoIndexResult}' created.`);

    console.log("Creating unique compound index on 'name' and 'address' fields...");
    const compoundIndexResult = await collection.createIndex(
      { name: 1, address: 1 },
      { unique: true }
    );
    console.log(`Success: Compound unique index '${compoundIndexResult}' created.`);

  } catch (err) {
    console.error("Index creation failed:", err);
  } finally {
    await client.close();
  }
}

main();
