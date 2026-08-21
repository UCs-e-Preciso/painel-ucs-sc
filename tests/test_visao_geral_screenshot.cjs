const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 950 } });

  console.log('Capturing Visao Geral charts before fix...');
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Scroll to charts row
  await page.screenshot({ path: 'visao_geral_current.png', fullPage: true });
  console.log('Saved visao_geral_current.png');

  await browser.close();
})();
