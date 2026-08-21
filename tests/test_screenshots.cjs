const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 950 } });

  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  await page.click('button:has-text("Mapa Interativo")');
  await page.waitForTimeout(2000);

  // Take screenshot 1: Open state
  await page.screenshot({ path: 'panel_open_state.png' });

  // Click toggle button
  await page.click('button:has-text("Ocultar Camadas"), button:has-text("Camadas")');
  await page.waitForTimeout(500);

  // Take screenshot 2: Closed state
  await page.screenshot({ path: 'panel_closed_state.png' });

  await browser.close();
  console.log('Screenshots saved: panel_open_state.png and panel_closed_state.png');
})();
