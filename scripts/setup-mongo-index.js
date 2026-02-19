// scripts/setup-mongo-index.js
const { MongoClient } = require("mongodb");

async function setupIndex() {
  const uri = process.env.MONGODB_URI; // Set this in your environment (e.g., .env.local)
  if (!uri) {
    console.error("CRITICAL: MONGODB_URI is not defined.");
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    // Using the database name 'tkhb_mongodb' as referenced in legacy mlab.ts
    const db = client.db("tkhb_mongodb"); 
    const listings = db.collection("listings");
    
    console.log("Creating 2dsphere index on 'coordinates' field...");
    const result = await listings.createIndex({ coordinates: "2dsphere" });
    console.log(`Success: ${result} index created.`);
  } catch (err) {
    console.error("Index creation failed:", err);
  } finally {
    await client.close();
  }
}

setupIndex();
