const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });

  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 1. Check Governança Municipal tab
  console.log('1. Navegando para Governança Municipal...');
  await page.click('button:has-text("Legislação Municipal")');
  await page.waitForTimeout(1000);

  console.log('2. Clicando no dropdown Todas as Mesorregiões...');
  const mesoBtn = page.locator('button:has-text("Todas as Mesorregiões")').first();
  await mesoBtn.click();
  await page.waitForTimeout(500);

  await page.screenshot({ path: 'tests/dropdown_open_meso_gov.png' });
  console.log('   Screenshot salvo em tests/dropdown_open_meso_gov.png');

  // Select "Oeste Catarinense"
  console.log('3. Clicando na opção "Oeste Catarinense"...');
  await page.locator('[role="option"]:has-text("Oeste Catarinense")').click();
  await page.waitForTimeout(500);

  // 2. Toggle Dark Mode
  console.log('4. Ativando Dark Mode...');
  const darkBtn = page.locator('button[title="Alternar tema escuro/claro"], button:has-text("🌙"), button:has(svg.lucide-moon)').first();
  if (await darkBtn.count() > 0) {
    await darkBtn.click();
  } else {
    // click the moon button in top right
    await page.locator('header button').last().click();
  }
  await page.waitForTimeout(500);

  // Go back to Visao Geral
  console.log('5. Voltando para Visão Geral em Dark Mode...');
  await page.click('button:has-text("Visão Geral")');
  await page.waitForTimeout(500);

  // Click Grupo SNUC dropdown
  console.log('6. Clicando no dropdown Grupo: Todos em Dark Mode...');
  const grupoBtn = page.locator('button:has-text("Grupo: Todos")').first();
  await grupoBtn.click();
  await page.waitForTimeout(500);

  await page.screenshot({ path: 'tests/dropdown_open_darkmode.png' });
  console.log('   Screenshot salvo em tests/dropdown_open_darkmode.png');

  await browser.close();
  console.log('Teste complementar concluído com sucesso!');
})();
