<!--- These are examples. See https://shields.io for others or to customize this set of shields. You might want to include dependencies, project status and license info here --->

![Github License](https://img.shields.io/github/license/kiel-h-byrne/the-mobb.com)
![Node Version](https://img.shields.io/node/v/canary)
![W3C Validation](https://img.shields.io/w3c-validation/default?targetUrl=https%3A%2F%2Fwww.the-mobb.com)

![GitHub repo size](https://img.shields.io/github/repo-size/kiel-h-byrne/the-mobb.com)
![Github code size](https://img.shields.io/github/languages/code-size/kiel-h-byrne/the-mobb.com)
![Github Languages](https://img.shields.io/github/languages/count/kiel-h-byrne/the-mobb.com)
![Github Top Language](https://img.shields.io/github/languages/top/kiel-h-byrne/the-mobb.com)

# The MOBB (Map of Black Businesses) v3.0

The Map of Black Businesses (MOBB) is a digital infrastructure for economic equity designed to serve the diaspora. It is a tool to practice group economics. The application allows consumers to seamlessly identify, locate, and support Black-owned businesses in their immediate vicinity (or globally), with the primary goal of growing the community's economy.

<img width="80%" src="https://github.com/Kiel-H-Byrne/the-mobb.com/assets/955269/99259907-11dc-446a-a6a8-455bc4787e9c" />

---

**_Visit [www.the-MOBB.com](https://www.the-MOBB.com)_**

## 🏗️ Technical Stack & Architecture

The MOBB has evolved into a modern, map-first, AI-curated platform.

*   **Framework:** Next.js 14+ (App Router)
*   **Language:** TypeScript (Strict mode)
*   **Database:** MongoDB Atlas (utilizing `2dsphere` indexes for `$near` geospatial queries)
*   **Styling:** Tailwind CSS + Material-UI + Panda CSS
*   **Mapping:** `@vis.gl/react-google-maps` for a seamless map-first user interface
*   **AI Integration:** Vercel AI SDK (`@ai-sdk/google`) for automated data extraction

## 🧠 The Autonomous Data Engine

We have moved away from manual curation to an "Autonomous Data Engine." The system uses AI Agents via Next.js Server Actions to scale the directory:

1.  **Ingestion:** Scrape listicles and websites using external tools (like SerpApi).
2.  **Extraction:** LLMs (Google Gemini via Vercel AI SDK) analyze the HTML and extract structured business data (Name, Address, Categories, Black-owned status).
3.  **Review Queue:** Extracted businesses are saved to MongoDB in a `PENDING_REVIEW` state.
4.  **Admin Approval:** Administrators review pending entries in the dashboard. Approving an entry automatically triggers Google Geocoding to fetch missing coordinates and saves the listing as a `2dsphere` Point in the primary database for instant geospatial discovery.

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:
*   Node.js (v18+)
*   npm or yarn
*   A MongoDB Atlas Cluster (or local instance)

### Environment Variables

Create a `.env.local` file in the root directory and configure the following:

```env
# MongoDB Connection
DBOBB_MONGODB_URI="mongodb+srv://<user>:<password>@cluster.xyz.mongodb.net"
MONGODB_DB_NAME="vercel-db"

# Google Maps (For Client UI and Server Geocoding)
NEXT_PUBLIC_GOOGLE_MAPS_KEY="your_google_maps_api_key"

# AI & Scraping
GEMINI_API_KEY="your_gemini_api_key"
SERP_API_KEY="your_serp_api_key"

# Admin Auth (Simple mock auth for current MVP)
ADMIN_PASSWORD="your_secure_password"
```

### Database Setup

The MOBB relies heavily on MongoDB's geospatial capabilities. You must create a `2dsphere` index on the listings collection for the map search to function.

```bash
# Run the setup script to create the required indexes
node scripts/setup-mongo-index.js
```

### Installation & Execution

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🧪 Testing

The project uses `vitest` for both client and server testing, utilizing mocked MongoDB connections and mocked `fetch` endpoints for external APIs.

```bash
# Run all tests
npm run test

# Run tests with UI
npm run test:ui
```

## 🤝 Contributing

First off, thank you for considering contributing to the MOBB. It’s people like you that make the MOBB such a great tool.

1.  Fork this repo.
2.  Create a descriptive branch: `git checkout -b ft-<featureName>` or `fix-<fixName>`.
3.  Commit your changes: `git commit -m 'Add amazing feature'`.
4.  Push to the branch: `git push origin ft-<featureName>`.
5.  Open a Pull Request. **Ensure you have written and passed all relevant tests!**

### Development Philosophy
*   **Speed to Stability:** Write functional, modern ES6+ code rapidly, but immediately secure it with strict TypeScript interfaces, Zod validation schemas, and robust error handling.
*   **Geospatial First:** All database queries related to location must leverage MongoDB's `$near` operator.

## ⚖️ License

Content is released under [Mozilla Public License Version 2.0](LICENSE.md). See `LICENSE.md` for complete details.
