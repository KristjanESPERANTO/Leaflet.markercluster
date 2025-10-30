import { chromium } from "playwright";
import { createServer } from "http";
import { readFile } from "fs/promises";
import { join, extname } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const rootDir = join(__dirname, "..");

// Simple static file server
const mimeTypes = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml"
};

const server = createServer(async (req, res) => {
  try {
    const filePath = join(rootDir, req.url === "/" ? "index.html" : req.url);
    console.log("Requesting:", req.url, "→", filePath);
    const content = await readFile(filePath);
    const ext = extname(filePath);
    res.writeHead(200, { "Content-Type": mimeTypes[ext] || "text/plain" });
    res.end(content);
  } catch (err) {
    console.log("404:", req.url);
    res.writeHead(404);
    res.end("Not found");
  }
});

const PORT = 8888;

async function runTests() {
  return new Promise((resolve, reject) => {
    server.listen(PORT, async () => {
      console.log("Starting test server on port", PORT);

      let browser, page;
      try {
        console.log("Launching browser...");
        browser = await chromium.launch({ headless: true });
        console.log("Browser launched");

        page = await browser.newPage();
        console.log("New page created");

        // Listen for console messages
        page.on("console", (msg) => {
          console.log("[Browser]", msg.text());
        });

        // Listen for page errors
        page.on("pageerror", (error) => {
          console.log("[Page Error]", error.message);
        });

        // Navigate to test page
        console.log(`Opening http://localhost:${PORT}/spec/index.html`);
        await page.goto(`http://localhost:${PORT}/spec/index.html`, { waitUntil: "networkidle" });

        // Wait for scripts to load
        await page.waitForFunction(() => window.scriptsLoaded === true, { timeout: 10000 });
        console.log("All scripts loaded");

        console.log("Waiting for tests to complete...");

        // Wait for Mocha to finish (with timeout and better error handling)
        const results = await page.evaluate(async () => {
          const startTime = Date.now();
          const timeout = 30000; // 30 seconds

          // Wait for mochaResults to be set
          while (!window.mochaResults) {
            if (Date.now() - startTime > timeout) {
              return {
                error: "Timeout waiting for tests",
                hasMocha: typeof window.mocha !== "undefined",
                hasRunner: typeof window.mocha?.run === "function"
              };
            }
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
          return window.mochaResults;
        });

        // Print summary
        if (results.error) {
          console.log("\n❌ Error:", results.error);
          console.log("Has Mocha:", results.hasMocha);
          console.log("Has Runner:", results.hasRunner);
          await page.screenshot({ path: "test-error.png" });
          console.log("Screenshot saved to test-error.png");
          await browser.close();
          server.close();
          process.exit(1);
        }

        // Debug: Check if Leaflet loaded
        const leafletLoaded = await page.evaluate(() => typeof window.L !== "undefined");
        console.log("Leaflet loaded:", leafletLoaded);

        if (!leafletLoaded) {
          console.log("❌ Leaflet did not load!");
          await page.screenshot({ path: "test-error.png" });
          console.log("Screenshot saved to test-error.png");
          await browser.close();
          server.close();
          process.exit(1);
        }

        console.log("\n" + "=".repeat(60));
        console.log(`Tests: ${results.passes} passed, ${results.failures} failed, ${results.pending || 0} skipped`);
        console.log(`Duration: ${results.duration}ms`);
        console.log("=".repeat(60) + "\n");

        // Print failures
        if (results.failures > 0) {
          console.log("FAILURES:");
          for (const failure of results.failureDetails) {
            console.log(`\n❌ ${failure.title}`);
            console.log(`   ${failure.error}`);
          }
          console.log("");
        }

        await browser.close();
        server.close();

        // Exit with error code if tests failed
        resolve(results.failures > 0 ? 1 : 0);
      } catch (error) {
        console.error("Fatal error:", error);
        if (browser) await browser.close();
        server.close();
        reject(error);
      }
    });
  });
}

runTests()
  .then((exitCode) => process.exit(exitCode))
  .catch((error) => {
    console.error("Unhandled error:", error);
    process.exit(1);
  });
