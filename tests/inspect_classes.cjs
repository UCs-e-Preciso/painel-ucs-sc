const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  await page.click('button:has-text("Mapa Interativo")');
  await page.waitForTimeout(2500);

  const stats = await page.evaluate(() => {
    const allPaths = Array.from(document.querySelectorAll('path'));
    const classSet = {};
    allPaths.forEach(p => {
      const c = p.getAttribute('class') || '(no class)';
      classSet[c] = (classSet[c] || 0) + 1;
    });
    return {
      totalPaths: allPaths.length,
      classes: classSet,
      sampleCircles: allPaths.filter(p => (p.getAttribute('d') || '').includes('a')).slice(0, 3).map(p => ({
        class: p.getAttribute('class'),
        d: p.getAttribute('d'),
        fill: p.getAttribute('fill'),
      }))
    };
  });
  console.log('Path classes stats in DOM:', JSON.stringify(stats, null, 2));
  await browser.close();
})();
