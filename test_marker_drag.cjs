const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 950 } });

  console.log('Testing circle marker tooltip drag behavior in Chrome...');
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  await page.click('button:has-text("Mapa Interativo")');
  await page.waitForTimeout(2500);

  // Hover over a specific circle marker
  await page.evaluate(() => {
    const marker = document.querySelector('.leaflet-marker-pane path');
    if (marker) {
      marker.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    }
  });
  await page.waitForTimeout(400);

  let tooltips = await page.evaluate(() => document.querySelectorAll('.leaflet-tooltip').length);
  console.log('- Tooltips on marker hover:', tooltips);

  // Now trigger mousedown / drag
  await page.evaluate(() => {
    const container = document.querySelector('.leaflet-container');
    if (container) {
      container.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    }
  });
  await page.waitForTimeout(300);

  tooltips = await page.evaluate(() => document.querySelectorAll('.leaflet-tooltip').length);
  console.log('- Tooltips after mousedown/dragstart:', tooltips);

  await browser.close();
  console.log('Done!');
})();
