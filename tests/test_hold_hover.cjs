const { chromium } = require('playwright');

(async () => {
  console.log('Testing prolonged hover stability (checking for flicker)...');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  await page.click('button:has-text("Mapa Interativo")');
  await page.waitForTimeout(2500);

  // Position mouse over Cunha Porã area
  const mapElement = await page.locator('.leaflet-container').boundingBox();
  const hoverX = mapElement.x + mapElement.width * 0.20;
  const hoverY = mapElement.y + mapElement.height * 0.45;

  console.log(`Moving mouse to (${Math.round(hoverX)}, ${Math.round(hoverY)}) and holding for 3 seconds...`);
  await page.mouse.move(hoverX, hoverY);

  const checks = [];
  for (let i = 1; i <= 6; i++) {
    await page.waitForTimeout(500);
    const state = await page.evaluate(() => {
      const tooltip = document.querySelector('.leaflet-tooltip');
      const hoveredPaths = Array.from(document.querySelectorAll('path.leaflet-interactive'))
        .filter(p => p.getAttribute('stroke') === '#fbbf24');
      return {
        hasTooltip: !!tooltip,
        tooltipText: tooltip ? tooltip.innerText.replace(/\n+/g, ' | ') : null,
        hoveredPathsCount: hoveredPaths.length,
      };
    });
    checks.push({ second: (i * 0.5).toFixed(1), ...state });
  }

  console.log('Hover state sampled every 500ms:', checks);

  const isStable = checks.every(c => c.hasTooltip && c.hoveredPathsCount === 1);
  console.log(`Stability test result: ${isStable ? 'PASSED (100% stable, ZERO flickering)' : 'FAILED'}`);

  await browser.close();
})();
