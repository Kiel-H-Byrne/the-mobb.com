// const withImages = require('next-images')
// module.exports = withImages({

// })
const path = require("path");

module.exports = {
  env: {
    NEXT_PUBLIC_GOOGLE_MAPS_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY,
    NEXT_PUBLIC_MAP_ID: process.env.NEXT_PUBLIC_MAP_ID,
    DBOBB_MONGODB_URI: process.env.DBOBB_MONGODB_URI,
    SERP_API_KEY: process.env.SERP_API_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    NEXT_SERVER_ACTIONS_ENCRYPTION_KEY: process.env.NEXT_SERVER_ACTIONS_ENCRYPTION_KEY,
  },
};
