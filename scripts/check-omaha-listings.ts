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
    const db = client.db("vercel-db");
    
    const collections = ["listings", "pending_listings"];
    const names = [
      "Crum Cakes Bakery", 
      "Big Mama’s Kitchen", 
      "Ital Vital Living", 
      "O.T.B Flavored Turkey Legs", 
      "Sapphire Grill",
      "Ruby",
      "Lalibela"
    ];
    
    for (const colName of collections) {
      console.log(`\n--- Checking ${colName} ---`);
      const col = db.collection(colName);
      
      for (const n of names) {
         // Grab first word for regex targeting
         const firstWord = n.split(' ')[0];
         const docs = await col.find({ name: { $regex: firstWord, $options: 'i' } }).toArray();
         
         let foundMatch = false;
         for (const d of docs) {
            console.log(`[+] Match found in ${colName} for '${firstWord}': ${d.name} (${d.address || d.location})`);
            foundMatch = true;
         }
         
         if (!foundMatch) {
             console.log(`[-] NO MATCH for '${n}'`);
         }
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();
