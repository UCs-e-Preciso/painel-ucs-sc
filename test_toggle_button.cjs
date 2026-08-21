const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 950 } });

  console.log('Testing "Painel de Camadas / Ocultar Camadas" button in Chrome...');
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  await page.click('button:has-text("Mapa Interativo")');
  await page.waitForTimeout(2500);

  // Check if panel is visible initially
  let panelVisible = await page.locator('text=Camadas e Filtros do Mapa').isVisible();
  let buttonText = await page.locator('button:has-text("Camadas")').innerText();
  console.log('Initially:');
  console.log('- Panel visible:', panelVisible);
  console.log('- Button text:', buttonText);

  // Click the button to toggle
  console.log('Clicking button...');
  await page.click('button:has-text("Camadas")');
  await page.waitForTimeout(1000);

  panelVisible = await page.locator('text=Camadas e Filtros do Mapa').isVisible();
  buttonText = await page.locator('button:has-text("Camadas")').innerText();
  console.log('After 1st click:');
  console.log('- Panel visible:', panelVisible);
  console.log('- Button text:', buttonText);

  // Click again
  console.log('Clicking button again...');
  await page.click('button:has-text("Camadas")');
  await page.waitForTimeout(1000);

  panelVisible = await page.locator('text=Camadas e Filtros do Mapa').isVisible();
  buttonText = await page.locator('button:has-text("Camadas")').innerText();
  console.log('After 2nd click:');
  console.log('- Panel visible:', panelVisible);
  console.log('- Button text:', buttonText);

  await browser.close();
})();
