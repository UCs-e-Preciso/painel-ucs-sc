const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 950 } });

  console.log('Verifying chart text visibility in Chrome...');
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Check Esfera cards
  const esferaTexts = await page.locator('text=Por Esfera Administrativa').locator('xpath=ancestor::div[contains(@class, "rounded-2xl")]').innerText();
  console.log('--- Esfera Administrativa Card text: ---');
  console.log(esferaTexts);

  // Check Grupo SNUC cards
  const grupoTexts = await page.locator('text=Por Grupo do SNUC').locator('xpath=ancestor::div[contains(@class, "rounded-2xl")]').innerText();
  console.log('--- Grupo SNUC Card text: ---');
  console.log(grupoTexts);

  await page.screenshot({ path: 'visao_geral_verified.png' });
  console.log('Screenshot saved: visao_geral_verified.png');

  await browser.close();
})();
