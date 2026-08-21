const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 950 } });

  console.log('Testing REAL mouse hover and drag in Chrome with Playwright mouse actions...');
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  await page.click('button:has-text("Mapa Interativo")');
  await page.waitForTimeout(2500);

  await page.locator('.leaflet-container').scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  // Find position of a visible circle marker inside map viewport
  const markerPos = await page.evaluate(() => {
    const map = document.querySelector('.leaflet-container');
    const mapRect = map.getBoundingClientRect();
    const markers = Array.from(document.querySelectorAll('.leaflet-marker-pane path'));
    for (const m of markers) {
      const rect = m.getBoundingClientRect();
      if (rect.x >= mapRect.left + 50 && rect.x <= mapRect.right - 50 &&
          rect.y >= mapRect.top + 50 && rect.y <= mapRect.bottom - 50) {
        return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
      }
    }
    return null;
  });

  console.log('First marker screen position:', markerPos);

  if (markerPos) {
    // 1. Move real mouse over marker
    console.log('1. Moving mouse over marker...');
    await page.mouse.move(markerPos.x, markerPos.y);
    await page.waitForTimeout(500);

    let countHover = await page.evaluate(() => document.querySelectorAll('.leaflet-tooltip').length);
    console.log('- Tooltip count on hover:', countHover);

    // 2. Click and hold down (start dragging)
    console.log('2. Pressing mouse down and dragging...');
    await page.mouse.down();
    await page.waitForTimeout(100);

    let countMouseDown = await page.evaluate(() => document.querySelectorAll('.leaflet-tooltip').length);
    console.log('- Tooltip count immediately on mouse down:', countMouseDown);

    // Drag away to blank map area
    await page.mouse.move(markerPos.x - 200, markerPos.y - 100, { steps: 10 });
    await page.waitForTimeout(200);

    let countDragging = await page.evaluate(() => document.querySelectorAll('.leaflet-tooltip').length);
    console.log('- Tooltip count while dragging:', countDragging);

    // Release mouse
    await page.mouse.up();
    await page.waitForTimeout(400);

    let countAfterRelease = await page.evaluate(() => document.querySelectorAll('.leaflet-tooltip').length);
    console.log('- Tooltip count after drag release in blank area:', countAfterRelease);
  }

  await browser.close();
  console.log('Test finished!');
})();
