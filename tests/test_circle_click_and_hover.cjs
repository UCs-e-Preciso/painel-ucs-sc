const { chromium } = require('playwright');

(async () => {
  console.log('Testing circle marker hover and click selection in Chrome...');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  await page.click('button:has-text("Mapa Interativo")');
  await page.waitForTimeout(2500);

  // Scroll map into view
  await page.locator('.leaflet-container').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);

  // Find a marker that is currently visible in viewport
  const visibleMarkerBox = await page.evaluate(() => {
    const markerPane = document.querySelector('.leaflet-marker-pane');
    const markers = markerPane ? Array.from(markerPane.querySelectorAll('path.leaflet-interactive')) : [];
    for (const m of markers) {
      const r = m.getBoundingClientRect();
      if (r.x > 100 && r.x < 1000 && r.y > 100 && r.y < 800) {
        return { x: r.x, y: r.y, width: r.width, height: r.height };
      }
    }
    return null;
  });

  console.log('Visible marker bounding box in viewport:', visibleMarkerBox);

  if (visibleMarkerBox) {
    const cx = visibleMarkerBox.x + visibleMarkerBox.width / 2;
    const cy = visibleMarkerBox.y + visibleMarkerBox.height / 2;

    // 1. Test Hover
    console.log(`Hovering over visible circle marker at (${Math.round(cx)}, ${Math.round(cy)})...`);
    await page.mouse.move(cx, cy);
    await page.waitForTimeout(600);

    const hoverResult = await page.evaluate(() => {
      const tooltip = document.querySelector('.leaflet-tooltip');
      const hovered = document.querySelector('.leaflet-marker-pane path:hover');
      return {
        hasTooltip: !!tooltip,
        tooltipText: tooltip ? tooltip.innerText.replace(/\n+/g, ' | ') : null,
        hoveredStroke: hovered ? hovered.getAttribute('stroke') : null,
        hoveredStrokeWidth: hovered ? hovered.getAttribute('stroke-width') : null,
      };
    });
    console.log('Circle hover result:', hoverResult);
    await page.screenshot({ path: 'circle_hover_verified.png' });

    // 2. Test Click Selection
    console.log('Clicking circle marker to test selection effect...');
    await page.mouse.click(cx, cy);
    await page.waitForTimeout(1000);

    const clickResult = await page.evaluate(() => {
      const selected = document.querySelector('path.uc-selected-marker');
      const halo = document.querySelector('path.uc-selection-halo');
      const popup = document.querySelector('.leaflet-popup');
      return {
        hasSelectedMarker: !!selected,
        selectedStroke: selected ? selected.getAttribute('stroke') : null,
        selectedStrokeWidth: selected ? selected.getAttribute('stroke-width') : null,
        hasHalo: !!halo,
        haloDashArray: halo ? halo.getAttribute('stroke-dasharray') : null,
        hasPopup: !!popup,
        popupContent: popup ? popup.innerText.replace(/\n+/g, ' | ').slice(0, 100) : null,
      };
    });
    console.log('Circle click selection result:', clickResult);
    await page.screenshot({ path: 'circle_selected_verified.png' });
  }

  await browser.close();
})();
