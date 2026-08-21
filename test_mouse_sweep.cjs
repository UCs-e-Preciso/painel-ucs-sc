const { chromium } = require('playwright');

(async () => {
  console.log('Testing mouse sweep across SC map...');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  await page.click('button:has-text("Mapa Interativo")');
  await page.waitForTimeout(2500);

  // Map element bounding box
  const mapElement = await page.locator('.leaflet-container').boundingBox();
  console.log('Map element box:', mapElement);

  const hoveredCities = [];

  // Move mouse across several points on the map
  const testPoints = [
    { x: mapElement.x + mapElement.width * 0.75, y: mapElement.y + mapElement.height * 0.55 }, // Florianópolis area
    { x: mapElement.x + mapElement.width * 0.72, y: mapElement.y + mapElement.height * 0.25 }, // Joinville / Norte area
    { x: mapElement.x + mapElement.width * 0.60, y: mapElement.y + mapElement.height * 0.40 }, // Vale do Itajaí (Blumenau)
    { x: mapElement.x + mapElement.width * 0.45, y: mapElement.y + mapElement.height * 0.60 }, // Lages / Serrana
    { x: mapElement.x + mapElement.width * 0.20, y: mapElement.y + mapElement.height * 0.45 }, // Chapecó / Oeste
  ];

  for (let i = 0; i < testPoints.length; i++) {
    const pt = testPoints[i];
    await page.mouse.move(pt.x, pt.y);
    await page.waitForTimeout(400);

    const info = await page.evaluate(() => {
      const tooltip = document.querySelector('.leaflet-tooltip');
      const chip = document.querySelector('.animate-fadeIn');
      return {
        hasTooltip: !!tooltip,
        tooltipText: tooltip ? tooltip.innerText.replace(/\n+/g, ' | ') : null,
        chipText: chip ? chip.innerText : null,
      };
    });
    console.log(`Point ${i + 1} (${Math.round(pt.x)}, ${Math.round(pt.y)}):`, info);
    if (info.tooltipText) {
      hoveredCities.push(info.tooltipText);
    }
  }

  console.log('Total cities detected during sweep:', hoveredCities.length);
  await page.screenshot({ path: 'sweep_result.png' });
  await browser.close();
})();
