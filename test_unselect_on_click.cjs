const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 950 } });

  console.log('Testing UC unselection on background / municipality click in Chrome...');
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  await page.click('button:has-text("Mapa Interativo")');
  await page.waitForTimeout(2500);

  // 1. Click a UC circle marker
  console.log('Clicking 10th circle marker...');
  await page.evaluate(() => {
    const markerPane = document.querySelector('.leaflet-marker-pane');
    const markers = markerPane ? Array.from(markerPane.querySelectorAll('path')) : [];
    if (markers.length > 10) {
      markers[10].dispatchEvent(new MouseEvent('click', { bubbles: true }));
      markers[10].dispatchEvent(new MouseEvent('popupopen', { bubbles: true }));
    }
  });
  await page.waitForTimeout(1000);

  let selectedPaths = await page.evaluate(() => {
    const paths = Array.from(document.querySelectorAll('path'));
    return paths.filter(p => p.getAttribute('stroke') === '#fbbf24' || p.getAttribute('stroke-dasharray') === '3, 3').length;
  });
  console.log('Selected paths after clicking UC marker:', selectedPaths);

  // 2. Click on a municipality polygon
  console.log('Clicking on a municipality polygon...');
  await page.evaluate(() => {
    const overlayPane = document.querySelector('.leaflet-overlay-pane');
    const polygons = overlayPane ? Array.from(overlayPane.querySelectorAll('path.sc-municipality-polygon')) : [];
    if (polygons.length > 5) {
      polygons[5].dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }
  });
  await page.waitForTimeout(1000);

  selectedPaths = await page.evaluate(() => {
    const paths = Array.from(document.querySelectorAll('.leaflet-marker-pane path'));
    return paths.filter(p => p.getAttribute('stroke') === '#fbbf24' || p.getAttribute('stroke-dasharray') === '3, 3').length;
  });
  console.log('Selected marker paths after clicking municipality:', selectedPaths);

  // 3. Select UC marker again and click map background
  console.log('Selecting UC marker again...');
  await page.evaluate(() => {
    const markerPane = document.querySelector('.leaflet-marker-pane');
    const markers = markerPane ? Array.from(markerPane.querySelectorAll('path')) : [];
    if (markers.length > 10) {
      markers[10].dispatchEvent(new MouseEvent('click', { bubbles: true }));
      markers[10].dispatchEvent(new MouseEvent('popupopen', { bubbles: true }));
    }
  });
  await page.waitForTimeout(1000);

  console.log('Clicking map container background...');
  await page.evaluate(() => {
    const mapContainer = document.querySelector('.leaflet-container');
    if (mapContainer) {
      mapContainer.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 200, clientY: 200 }));
    }
  });
  await page.waitForTimeout(1000);

  selectedPaths = await page.evaluate(() => {
    const paths = Array.from(document.querySelectorAll('.leaflet-marker-pane path'));
    return paths.filter(p => p.getAttribute('stroke') === '#fbbf24' || p.getAttribute('stroke-dasharray') === '3, 3').length;
  });
  console.log('Selected marker paths after clicking map background:', selectedPaths);

  await browser.close();
  console.log('Test completed successfully!');
})();
