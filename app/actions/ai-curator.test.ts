import { describe, it, expect, vi } from "vitest";
import { fetchAndCleanHTML } from "./ai-curator";

// Mock global fetch
global.fetch = vi.fn();

describe("AI Curator HTML Fetching", () => {
  it("should fetch and clean HTML by stripping scripts, styles, and SVGs", async () => {
    // Setup a fake HTML response that simulates typical listicle noise
    const mockHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>40 Black-Owned Businesses in Omaha</title>
          <script>console.log("Analytics loading"); var hugePayload = "junk... ";</script>
          <style>body { background: red; } .huge-css { color: white; }</style>
        </head>
        <body>
          <header>
             <svg viewBox="0 0 100 100"><path d="M10 10"/></svg>
             <!-- Navigation comment -->
          </header>
          <main>
             <h1>40 Black-Owned Businesses in Omaha</h1>
             <article>
               <h2>Big Mama's Kitchen</h2>
               <p>Location: North Omaha at 2112 N 30th Street Highlander Accelerator Suite 201</p>
             </article>
          </main>
          <script type="text/javascript">
            // More junk at the bottom of the body
            window.__NEXT_DATA__ = { props: {} };
          </script>
        </body>
      </html>
    `;

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      text: async () => mockHtml,
    });

    const url = "https://example.com/test-article";
    const cleaned = await fetchAndCleanHTML(url, 100000);

    // Assert fetch was called with standard bot-bypassing headers
    expect(global.fetch).toHaveBeenCalledWith(url, expect.objectContaining({
      headers: expect.objectContaining({
        "User-Agent": expect.stringContaining("Mozilla"),
        "Accept": expect.any(String)
      })
    }));

    // Assert scripts are gone
    expect(cleaned).not.toContain("Analytics loading");
    expect(cleaned).not.toContain("window.__NEXT_DATA__");

    // Assert styles are gone
    expect(cleaned).not.toContain("body { background: red; }");

    // Assert svg is gone
    expect(cleaned).not.toContain("viewBox");
    
    // Assert comments are gone
    expect(cleaned).not.toContain("Navigation comment");

    // Assert the core body content WE DO WANT is present
    expect(cleaned).toContain("Big Mama's Kitchen");
    expect(cleaned).toContain("2112 N 30th Street Highlander Accelerator");
  });

  it("should throw an error on 403 Forbidden or other bad status", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 403,
      statusText: "Forbidden",
    });

    await expect(fetchAndCleanHTML("https://example.com")).rejects.toThrow("Failed to fetch URL: 403 Forbidden");
  });
  
  it("should handle truncating extremely large pages safely", async () => {
    // Produce 150,000 characters of '<div>Content</div>'
    const block = "<div>Valid Content</div>";
    const massiveBody = block.repeat(10000); // 240,000 characters
    
    const mockHtml = `<body>${massiveBody}</body>`;
    
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      text: async () => mockHtml,
    });

    const limit = 50000;
    const cleaned = await fetchAndCleanHTML("https://example.com", limit);
    
    expect(cleaned.length).toBe(limit);
    expect(cleaned.startsWith("<div>Valid Content")).toBe(true);
  });
});
