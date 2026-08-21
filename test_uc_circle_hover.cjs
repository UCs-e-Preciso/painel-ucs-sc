const { chromium } = require('playwright');

(async () => {
  console.log('Testing hover on UC circle markers with Playwright...');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  await page.click('button:has-text("Mapa Interativo")');
  await page.waitForTimeout(2500);

  const hoverTest = await page.evaluate(() => {
    const allPaths = Array.from(document.querySelectorAll('path.leaflet-interactive'));
    // Filter circle markers (not municipality polygons)
    const circleMarkers = allPaths.filter(p => !p.classList.contains('sc-municipality-polygon'));
    if (circleMarkers.length === 0) return { error: 'No circle markers found' };

    const first = circleMarkers[0];
    const before = {
      fill: first.getAttribute('fill'),
      stroke: first.getAttribute('stroke'),
      strokeWidth: first.getAttribute('stroke-width'),
      r: first.getAttribute('d'),
    };

    first.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));

    const after = {
      fill: first.getAttribute('fill'),
      stroke: first.getAttribute('stroke'),
      strokeWidth: first.getAttribute('stroke-width'),
      r: first.getAttribute('d'),
    };

    const tooltip = document.querySelector('.leaflet-tooltip');

    return {
      totalCircleMarkers: circleMarkers.length,
      before,
      after,
      tooltipFound: !!tooltip,
      tooltipHtml: tooltip ? tooltip.innerHTML : null,
    };
  });

  console.log('UC circle marker hover test evaluation:', hoverTest);
  await page.screenshot({ path: 'uc_marker_hover_verified.png' });
  console.log('Saved uc_marker_hover_verified.png');

  await browser.close();
})();
