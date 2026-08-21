const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  console.log('Launching Chrome...');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await context.newPage();

  page.on('console', msg => console.log('[BROWSER CONSOLE]', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('[BROWSER PAGE ERROR]', err.message));

  console.log('Navigating to http://localhost:4173...');
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });

  // Click on "Mapa Interativo" tab
  console.log('Clicking Mapa Interativo tab...');
  await page.click('button:has-text("Mapa Interativo")');
  await page.waitForTimeout(2000);

  // Check map container and SVG paths
  const pathsCount = await page.locator('path.leaflet-interactive').count();
  console.log(`Found ${pathsCount} interactive SVG paths on the map.`);

  // Let's inspect the first 5 paths
  const pathsInfo = await page.evaluate(() => {
    const paths = Array.from(document.querySelectorAll('path.leaflet-interactive'));
    return paths.slice(0, 5).map((p, idx) => ({
      idx,
      tagName: p.tagName,
      stroke: p.getAttribute('stroke'),
      strokeWidth: p.getAttribute('stroke-width'),
      fill: p.getAttribute('fill'),
      fillOpacity: p.getAttribute('fill-opacity'),
      dLength: (p.getAttribute('d') || '').length,
    }));
  });
  console.log('First paths sample:', pathsInfo);

  // Let's hover over path index 50 (a municipality polygon)
  if (pathsCount > 10) {
    const targetPath = page.locator('path.leaflet-interactive').nth(30);
    const box = await targetPath.boundingBox();
    console.log('Target polygon bounding box:', box);

    if (box) {
      console.log(`Hovering over target polygon at x: ${box.x + box.width / 2}, y: ${box.y + box.height / 2}...`);
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(1000);

      // Check tooltips in DOM
      const tooltipContent = await page.evaluate(() => {
        const tooltips = Array.from(document.querySelectorAll('.leaflet-tooltip'));
        const chip = document.querySelector('.animate-fadeIn');
        return {
          tooltipsCount: tooltips.length,
          tooltipsHtml: tooltips.map(t => t.innerHTML),
          chipText: chip ? chip.textContent : null,
        };
      });
      console.log('Tooltip and chip after hover:', tooltipContent);

      // Screenshot after hover
      await page.screenshot({ path: 'map_hover_screenshot.png' });
      console.log('Saved map_hover_screenshot.png');
    }
  }

  await browser.close();
  console.log('Browser test complete!');
})();
