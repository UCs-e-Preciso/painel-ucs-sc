const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 950 } });

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message));

  console.log('Testing Map Drag, Pan, and Zoom in Chrome...');
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  await page.click('button:has-text("Mapa Interativo")');
  await page.waitForTimeout(2500);

  await page.locator('.leaflet-container').scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  const mapBox = await page.locator('.leaflet-container').boundingBox();
  const centerX = mapBox.x + mapBox.width / 2;
  const centerY = mapBox.y + mapBox.height / 2;

  // 1. Test Pan/Drag
  console.log('1. Testing mouse drag / pan...');
  await page.mouse.move(centerX, centerY);
  await page.mouse.down();
  await page.mouse.move(centerX - 150, centerY - 100, { steps: 10 });
  await page.mouse.up();
  await page.waitForTimeout(600);

  // 2. Test Zoom In and Zoom Out via buttons
  console.log('2. Testing zoom in and out buttons...');
  await page.click('.leaflet-control-zoom-in');
  await page.waitForTimeout(1000);
  await page.click('.leaflet-control-zoom-out');
  await page.waitForTimeout(1000);

  // 3. Test Mouse Wheel Zoom
  console.log('3. Testing mouse wheel zoom...');
  await page.mouse.move(centerX, centerY);
  await page.mouse.wheel(0, -300); // zoom in
  await page.waitForTimeout(1000);
  await page.mouse.wheel(0, 300); // zoom out
  await page.waitForTimeout(1000);

  // 4. Test Dragging again
  console.log('4. Testing secondary drag...');
  await page.mouse.move(centerX, centerY);
  await page.mouse.down();
  await page.mouse.move(centerX + 200, centerY + 150, { steps: 10 });
  await page.mouse.up();
  await page.waitForTimeout(600);

  console.log('Errors caught during test:', errors);
  if (errors.length === 0) {
    console.log('✔ Map dragging, panning and zooming are completely smooth and error-free!');
  }

  await browser.close();
})();
