const { chromium } = require('playwright');

(async () => {
  console.log('Testing marker hover effect on UC circles...');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  await page.click('button:has-text("Mapa Interativo")');
  await page.waitForTimeout(2500);

  // Find UC circle marker
  const ucMarkersCount = await page.locator('path.uc-marker-circle').count();
  console.log(`Found ${ucMarkersCount} UC circle markers.`);

  if (ucMarkersCount > 0) {
    const marker = page.locator('path.uc-marker-circle').first();
    const box = await marker.boundingBox();
    console.log('Sample marker box:', box);

    if (box) {
      console.log('Hovering over UC circle marker...');
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(600);

      const markerHoverStyle = await page.evaluate(() => {
        const hovered = document.querySelector('path.uc-marker-circle:hover');
        if (!hovered) return { error: 'No hovered marker found' };
        const style = window.getComputedStyle(hovered);
        return {
          tagName: hovered.tagName,
          className: hovered.getAttribute('class'),
          transform: style.transform,
          stroke: style.stroke,
          strokeWidth: style.strokeWidth,
          filter: style.filter,
          cursor: style.cursor,
        };
      });

      console.log('Marker hover evaluation:', markerHoverStyle);
      await page.screenshot({ path: 'marker_hover_test.png' });
      console.log('Saved marker_hover_test.png');
    }
  }

  await browser.close();
})();
