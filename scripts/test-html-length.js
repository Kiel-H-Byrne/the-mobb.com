async function testFetch() {
  const url = "https://omahaplaces.com/40-black-owned-businesses-in-omaha/";
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5"
    }
  });

  const html = await res.text();
  console.log(`Raw HTML length: ${html.length}`);

  let cleanedContent = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");

  const bodyMatch = cleanedContent.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (bodyMatch) {
    cleanedContent = bodyMatch[1];
  }
  
  console.log(`Cleaned HTML length: ${cleanedContent.length}`);
  
  // Find where Big Mama's Kitchen is
  const index = cleanedContent.indexOf("Big Mama’s Kitchen");
  console.log(`Big Mama index in cleaned HTML: ${index}`);
  
  const oldIndex = html.indexOf("Big Mama’s Kitchen");
  console.log(`Big Mama index in raw HTML: ${oldIndex}`);
}
testFetch();
