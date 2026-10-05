import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config({ path: ".env.local" });

const uri = process.env.DBOBB_MONGODB_URI;
if (!uri) {
  console.error("Please add your Mongo URI to .env.local");
  process.exit(1);
}

const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB.");
    const db = client.db("vercel-db");
    const listings = db.collection("listings");

    // Create 2dsphere index on coordinates field
    const result = await listings.createIndex({ coordinates: "2dsphere" });
    console.log(`Index created/verified: ${result}`);

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
    console.log("Connection closed.");
  }
}

run();
