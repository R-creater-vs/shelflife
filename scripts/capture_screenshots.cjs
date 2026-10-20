const http = require('http');
const fs = require('fs');
const path = require('path');

// Resolve playwright from ASCEND node_modules
const playwrightPath = path.resolve(__dirname, '..', '..', 'ASCEND', 'node_modules', 'playwright');
const { chromium } = require(playwrightPath);

const DIST_DIR = path.resolve(__dirname, '..', 'dist');
const SCREENSHOTS_DIR = path.resolve(__dirname, '..', 'docs', 'screenshots');
const ARTIFACTS_DIR = path.resolve(__dirname, '..', 'artifacts');

[SCREENSHOTS_DIR, ARTIFACTS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Minimal static HTTP server to serve dist folder
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
  
  const filePath = path.join(DIST_DIR, reqPath.replace(/^\//, ''));
  
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    res.writeHead(200, {
      'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
      'Access-Control-Allow-Origin': '*',
    });
    fs.createReadStream(filePath).pipe(res);
  } else {
    // SPA fallback
    const indexPath = path.join(DIST_DIR, 'index.html');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    fs.createReadStream(indexPath).pipe(res);
  }
});

const PORT = 4177;

server.listen(PORT, async () => {
  console.log(`[SHELFLIFE Capture] Serving dist on http://localhost:${PORT}`);

  try {
    const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    const browser = await chromium.launch({ 
      executablePath: chromePath, 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });

    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.error('PAGE ERROR:', err));

    console.log('[SHELFLIFE Capture] Loading base application...');
    await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // 1. Four-World Attribution (Default view, 1440px)
    console.log('[SHELFLIFE Capture] Capturing 01-four-world-attribution (1440px)...');
    const p01 = path.join(SCREENSHOTS_DIR, '01-four-world-attribution.png');
    await page.screenshot({ path: p01, fullPage: false });
    fs.copyFileSync(p01, path.join(ARTIFACTS_DIR, '01-four-world-attribution.png'));

    // 2. Batch Theatre View
    console.log('[SHELFLIFE Capture] Capturing 02-batch-theatre (1440px)...');
    await page.click('button:has-text("Batch Theatre")');
    await page.waitForTimeout(600);
    // Step forward a couple of days to show active lifelines
    await page.click('button[title="Step One Day"]');
    await page.waitForTimeout(200);
    await page.click('button[title="Step One Day"]');
    await page.waitForTimeout(500);
    const p02 = path.join(SCREENSHOTS_DIR, '02-batch-theatre.png');
    await page.screenshot({ path: p02, fullPage: false });
    fs.copyFileSync(p02, path.join(ARTIFACTS_DIR, '02-batch-theatre.png'));

    // 3. Policy Bench View
    console.log('[SHELFLIFE Capture] Capturing 03-policy-bench (1440px)...');
    await page.click('button:has-text("Policy Bench")');
    await page.waitForTimeout(600);
    const p03 = path.join(SCREENSHOTS_DIR, '03-policy-bench.png');
    await page.screenshot({ path: p03, fullPage: false });
    fs.copyFileSync(p03, path.join(ARTIFACTS_DIR, '03-policy-bench.png'));

    // 4. Trade-off Frontier View
    console.log('[SHELFLIFE Capture] Capturing 04-tradeoff-frontier (1440px)...');
    await page.click('button:has-text("Trade-off Frontier")');
    await page.waitForTimeout(600);
    const p04 = path.join(SCREENSHOTS_DIR, '04-tradeoff-frontier.png');
    await page.screenshot({ path: p04, fullPage: false });
    fs.copyFileSync(p04, path.join(ARTIFACTS_DIR, '04-tradeoff-frontier.png'));

    // 5. Receipts Drawer View
    console.log('[SHELFLIFE Capture] Capturing 05-receipts-drawer (1440px)...');
    await page.click('button:has-text("Receipts Drawer")');
    await page.waitForTimeout(600);
    const p05 = path.join(SCREENSHOTS_DIR, '05-receipts-drawer.png');
    await page.screenshot({ path: p05, fullPage: false });
    fs.copyFileSync(p05, path.join(ARTIFACTS_DIR, '05-receipts-drawer.png'));

    // 6. Tablet Viewport (1024x768)
    console.log('[SHELFLIFE Capture] Capturing 06-tablet-1024 (1024px)...');
    const tabletPage = await browser.newPage({ viewport: { width: 1024, height: 768 } });
    await tabletPage.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
    await tabletPage.waitForTimeout(800);
    const p06 = path.join(SCREENSHOTS_DIR, '06-tablet-1024.png');
    await tabletPage.screenshot({ path: p06, fullPage: false });
    fs.copyFileSync(p06, path.join(ARTIFACTS_DIR, '06-tablet-1024.png'));
    await tabletPage.close();

    // 7. Mobile Viewport (390x844)
    console.log('[SHELFLIFE Capture] Capturing 07-mobile-390 (390px)...');
    const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await mobilePage.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
    await mobilePage.waitForTimeout(800);
    const p07 = path.join(SCREENSHOTS_DIR, '07-mobile-390.png');
    await mobilePage.screenshot({ path: p07, fullPage: false });
    fs.copyFileSync(p07, path.join(ARTIFACTS_DIR, '07-mobile-390.png'));
    await mobilePage.close();

    // 8. Showcase Cover (Re-use 01-four-world-attribution as hero cover)
    console.log('[SHELFLIFE Capture] Generating 08-shelflife-showcase-cover...');
    fs.copyFileSync(p01, path.join(SCREENSHOTS_DIR, '08-shelflife-showcase-cover.png'));
    fs.copyFileSync(p01, path.join(ARTIFACTS_DIR, '08-shelflife-showcase-cover.png'));

    console.log('[SHELFLIFE Capture] Successfully captured all 8 screenshots!');
    await browser.close();
  } catch (err) {
    console.error('[SHELFLIFE Capture Error]', err);
  } finally {
    server.close();
    process.exit(0);
  }
});
