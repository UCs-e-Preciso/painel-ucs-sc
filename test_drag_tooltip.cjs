const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 950 } });

  console.log('Testing tooltip behavior during map dragging/panning in Chrome...');
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  await page.click('button:has-text("Mapa Interativo")');
  await page.waitForTimeout(2500);

  // 1. Hover over a municipality to show tooltip
  console.log('Hovering over a municipality...');
  const mapElement = await page.locator('.leaflet-container');
  const boundingBox = await mapElement.boundingBox();
  
  const hoverX = boundingBox.x + boundingBox.width / 2;
  const hoverY = boundingBox.y + boundingBox.height / 2;

  await page.mouse.move(hoverX, hoverY);
  await page.waitForTimeout(600);

  let visibleTooltips = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.leaflet-tooltip')).filter(t => {
      const style = window.getComputedStyle(t);
      return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
    }).length;
  });
  console.log('- Visible tooltips on hover:', visibleTooltips);

  // 2. Drag map from this position to another position
  console.log('Dragging map while tooltip was open...');
  await page.mouse.down();
  await page.mouse.move(hoverX - 150, hoverY - 150, { steps: 5 });
  await page.waitForTimeout(300);

  let tooltipsDuringDrag = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.leaflet-tooltip')).filter(t => {
      const style = window.getComputedStyle(t);
      return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
    }).length;
  });
  console.log('- Visible tooltips during drag:', tooltipsDuringDrag);

  await page.mouse.up();
  await page.waitForTimeout(500);

  let tooltipsAfterDragRelease = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.leaflet-tooltip')).filter(t => {
      const style = window.getComputedStyle(t);
      return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
    }).length;
  });
  console.log('- Visible tooltips after releasing drag in neutral area:', tooltipsAfterDragRelease);

  await browser.close();
  console.log('Tooltip drag test completed successfully!');
})();
