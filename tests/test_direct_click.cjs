const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  await page.click('button:has-text("Mapa Interativo")');
  await page.waitForTimeout(2500);
  await page.locator('.leaflet-container').scrollIntoViewIfNeeded();

  // Find a UC circle marker (not quilombola)
  const ucInfo = await page.evaluate(() => {
    const markerPane = document.querySelector('.leaflet-marker-pane');
    const markers = markerPane ? Array.from(markerPane.querySelectorAll('path')) : [];
    // Let's dispatch a click directly on the 10th marker
    if (markers.length > 10) {
      const target = markers[10];
      target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      target.dispatchEvent(new MouseEvent('popupopen', { bubbles: true }));
    }
    return {
      totalMarkers: markers.length,
    };
  });
  console.log('UC info:', ucInfo);

  await page.waitForTimeout(1000);

  const afterClick = await page.evaluate(() => {
    const paths = Array.from(document.querySelectorAll('path'));
    return paths.map(p => ({
      class: p.getAttribute('class'),
      stroke: p.getAttribute('stroke'),
      strokeWidth: p.getAttribute('stroke-width'),
      dashArray: p.getAttribute('stroke-dasharray'),
    })).filter(p => (p.class && p.class.includes('selected')) || p.dashArray || p.stroke === '#fbbf24');
  });

  console.log('Special paths after direct click:', afterClick);
  await page.screenshot({ path: 'direct_click_test.png' });

  await browser.close();
})();
