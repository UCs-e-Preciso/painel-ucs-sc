const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  await page.click('button:has-text("Mapa Interativo")');
  await page.waitForTimeout(2000);

  // Let's test hovering over territory button "Oeste Catarinense"
  console.log('Hovering over "Oeste Catarinense" button...');
  await page.hover('button:has-text("Oeste Catarinense")');
  await page.waitForTimeout(1000);

  const mesoHoverPaths = await page.evaluate(() => {
    const paths = Array.from(document.querySelectorAll('path.leaflet-interactive'));
    const oestePaths = paths.filter(p => p.getAttribute('fill') === '#f59e0b');
    return {
      totalOeste: oestePaths.length,
      sampleStrokeWidth: oestePaths[0]?.getAttribute('stroke-width'),
      sampleFillOpacity: oestePaths[0]?.getAttribute('fill-opacity'),
    };
  });
  console.log('Meso hover evaluation on polygons:', mesoHoverPaths);

  // Now let's test hovering over a specific municipality polygon
  console.log('Testing direct mouse event on a polygon...');
  const hoverResult = await page.evaluate(() => {
    const paths = Array.from(document.querySelectorAll('path.leaflet-interactive'));
    // Find a polygon with large d length (municipality, not small circle)
    const munPath = paths.find(p => (p.getAttribute('d') || '').length > 200);
    if (!munPath) return { error: 'No polygon found' };

    const before = {
      stroke: munPath.getAttribute('stroke'),
      strokeWidth: munPath.getAttribute('stroke-width'),
      fillOpacity: munPath.getAttribute('fill-opacity'),
    };

    munPath.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, cancelable: true }));

    const after = {
      stroke: munPath.getAttribute('stroke'),
      strokeWidth: munPath.getAttribute('stroke-width'),
      fillOpacity: munPath.getAttribute('fill-opacity'),
    };

    const tooltip = document.querySelector('.leaflet-tooltip');

    return {
      before,
      after,
      tooltipFound: !!tooltip,
      tooltipHtml: tooltip ? tooltip.innerHTML : null,
    };
  });
  console.log('Polygon hover result:', hoverResult);

  await page.screenshot({ path: 'polygon_hover_test.png' });
  console.log('Saved polygon_hover_test.png');

  await browser.close();
})();
