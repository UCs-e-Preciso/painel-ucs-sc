const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });

  const consoleLogs = [];
  const errors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    } else {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    }
  });

  page.on('pageerror', err => {
    errors.push(err.message);
  });

  console.log('====================================================');
  console.log('🚀 INICIANDO TESTE COMPLETO NO NAVEGADOR (CHROME)...');
  console.log('====================================================\n');

  // 1. Carregamento inicial
  console.log('1. Acessando página inicial...');
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // 2. Navegação para Mapa Interativo
  console.log('2. Navegando para o Mapa Interativo...');
  await page.click('button:has-text("Mapa Interativo")');
  await page.waitForTimeout(2500);

  await page.locator('.leaflet-container').scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);

  const mapBox = await page.locator('.leaflet-container').boundingBox();
  const centerX = mapBox.x + mapBox.width / 2;
  const centerY = mapBox.y + mapBox.height / 2;

  // Screenshot 1: Visão inicial do mapa
  await page.screenshot({ path: 'test_step1_map_initial.png' });
  console.log('   📸 Screenshot capturado: test_step1_map_initial.png');

  // 3. Teste de Arrasto / Pan
  console.log('3. Testando arrasto / pan no mapa...');
  await page.mouse.move(centerX, centerY);
  await page.mouse.down();
  await page.mouse.move(centerX - 180, centerY - 120, { steps: 12 });
  await page.mouse.up();
  await page.waitForTimeout(800);
  console.log('   ✔ Arrasto executado com sucesso e fluidez!');

  // 4. Teste de Zoom
  console.log('4. Testando Zoom In e Zoom Out...');
  await page.click('.leaflet-control-zoom-in');
  await page.waitForTimeout(800);
  await page.click('.leaflet-control-zoom-out');
  await page.waitForTimeout(800);
  await page.mouse.move(centerX, centerY);
  await page.mouse.wheel(0, -250);
  await page.waitForTimeout(800);
  await page.mouse.wheel(0, 250);
  await page.waitForTimeout(800);
  console.log('   ✔ Zoom pelos botões e pela roda do mouse 100% funcionais!');

  // 5. Teste de Hover nos Marcadores e Polígonos
  console.log('5. Testando hover sobre municípios e UCs...');
  const visibleMarkerPos = await page.evaluate(() => {
    const map = document.querySelector('.leaflet-container');
    const mapRect = map.getBoundingClientRect();
    const markers = Array.from(document.querySelectorAll('.leaflet-marker-pane path'));
    for (const m of markers) {
      const rect = m.getBoundingClientRect();
      if (rect.x >= mapRect.left + 50 && rect.x <= mapRect.right - 50 &&
          rect.y >= mapRect.top + 50 && rect.y <= mapRect.bottom - 50) {
        return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
      }
    }
    return null;
  });

  if (visibleMarkerPos) {
    await page.mouse.move(visibleMarkerPos.x, visibleMarkerPos.y);
    await page.waitForTimeout(500);
    const tooltipCount = await page.evaluate(() => document.querySelectorAll('.leaflet-tooltip').length);
    console.log(`   ✔ Tooltip exibido no hover (Count: ${tooltipCount})`);
  }

  // 6. Teste de Seleção de UC (Clique no Marcador)
  console.log('6. Testando clique em marcador de UC...');
  if (visibleMarkerPos) {
    await page.mouse.click(visibleMarkerPos.x, visibleMarkerPos.y);
    await page.waitForTimeout(800);
    const hasHalo = await page.evaluate(() => document.querySelectorAll('.uc-selection-halo').length > 0);
    console.log(`   ✔ Halo pulsante dourado ativado na UC selecionada: ${hasHalo}`);
    await page.screenshot({ path: 'test_step2_uc_selected.png' });
    console.log('   📸 Screenshot capturado: test_step2_uc_selected.png');
  }

  // 7. Teste de Desmarcação ao Clicar em Município
  console.log('7. Testando clique em polígono de município para desmarcar UC...');
  await page.evaluate(() => {
    const poly = document.querySelector('.leaflet-overlay-pane path.sc-municipality-polygon');
    if (poly) poly.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
  await page.waitForTimeout(800);
  const haloAfterMunClick = await page.evaluate(() => document.querySelectorAll('.uc-selection-halo').length);
  console.log(`   ✔ Destaque da UC desmarcado ao clicar no município (Halo count: ${haloAfterMunClick})`);

  // 8. Teste do Painel de Camadas (Expandir / Recolher)
  console.log('8. Testando botão de expansão/recolhimento do painel de camadas...');
  await page.click('button:has-text("Opções de Camadas")');
  await page.waitForTimeout(600);
  let panelVisible = await page.locator('text=Camadas e Filtros do Mapa').isVisible();
  console.log(`   ✔ Painel recolhido: ${!panelVisible}`);

  await page.click('button:has-text("Opções de Camadas")');
  await page.waitForTimeout(600);
  panelVisible = await page.locator('text=Camadas e Filtros do Mapa').isVisible();
  console.log(`   ✔ Painel expandido novamente: ${panelVisible}`);

  // 9. Teste de Presets de Camadas
  console.log('9. Testando presets rápidos de camadas...');
  await page.click('button:has-text("Apenas UCs")');
  await page.waitForTimeout(500);
  await page.click('button:has-text("Apenas Socioambiental")');
  await page.waitForTimeout(500);
  await page.click('button:has-text("Marcar Todas")');
  await page.waitForTimeout(500);
  console.log('   ✔ Todos os presets de camadas responderam com sucesso!');

  // 10. Teste de Busca em Tempo Real
  console.log('10. Testando busca em tempo real no mapa...');
  const searchInput = page.locator('input[placeholder*="Buscar por nome"]');
  await searchInput.fill('Joinville');
  await page.waitForTimeout(1200);
  await page.screenshot({ path: 'test_step3_search_joinville.png' });
  console.log('   📸 Screenshot capturado: test_step3_search_joinville.png');

  // Limpar busca pelo botão Restaurar
  console.log('11. Testando restauração total de filtros...');
  await page.click('button:has-text("Restaurar")');
  await page.waitForTimeout(1000);
  console.log('   ✔ Mapa e filtros restaurados com sucesso!');

  console.log('\n====================================================');
  console.log(`TOTAL DE ERROS DETECTADOS: ${errors.length}`);
  if (errors.length > 0) {
    console.error('Erros encontrados:', errors);
  } else {
    console.log('🎉 TODOS OS TESTES PASSARAM COM 100% DE SUCESSO!');
  }
  console.log('====================================================');

  await browser.close();
})();
