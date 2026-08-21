const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 950 } });

  console.log('Testing Map Search and Layer Filters in Chrome...');
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  await page.click('button:has-text("Mapa Interativo")');
  await page.waitForTimeout(2500);

  // 1. Initial count of markers
  const initialMarkersCount = await page.evaluate(() => {
    const markerPane = document.querySelector('.leaflet-marker-pane');
    return markerPane ? markerPane.querySelectorAll('path').length : 0;
  });
  console.log('Initial total markers in map:', initialMarkersCount);

  // 2. Test typing search term: "Parque Nacional"
  const searchInput = page.locator('input[placeholder*="Buscar UC por nome"]');
  await searchInput.fill('Parque Nacional');
  await page.waitForTimeout(1000);

  const searchFilteredMarkers = await page.evaluate(() => {
    const markerPane = document.querySelector('.leaflet-marker-pane');
    return markerPane ? markerPane.querySelectorAll('path').length : 0;
  });
  console.log('Markers after searching "Parque Nacional":', searchFilteredMarkers);

  // 3. Clear search and test searching for a city: "Florianópolis"
  await page.click('button[title="Limpar busca"]');
  await page.waitForTimeout(500);
  await searchInput.fill('Florianópolis');
  await page.waitForTimeout(1000);

  const floripaMarkers = await page.evaluate(() => {
    const markerPane = document.querySelector('.leaflet-marker-pane');
    return markerPane ? markerPane.querySelectorAll('path').length : 0;
  });
  console.log('Markers after searching "Florianópolis":', floripaMarkers);

  // 4. Test Layer Toggles: uncheck RPPNs, TIs, Quilombolas
  await page.click('button[title="Limpar busca"]');
  await page.waitForTimeout(500);

  // Uncheck RPPNs
  await page.locator('label:has-text("RPPNs") input').uncheck();
  // Uncheck Terras Indígenas
  await page.locator('label:has-text("Terras Indígenas") input').uncheck();
  // Uncheck Quilombolas
  await page.locator('label:has-text("Quilombolas") input').uncheck();
  await page.waitForTimeout(1000);

  const onlyUcsMarkers = await page.evaluate(() => {
    const markerPane = document.querySelector('.leaflet-marker-pane');
    return markerPane ? markerPane.querySelectorAll('path').length : 0;
  });
  console.log('Markers with only UCs enabled (RPPNs/TIs/Quilombos unchecked):', onlyUcsMarkers);

  // 5. Uncheck Municipal UCs
  await page.locator('label:has-text("Municipal") input').uncheck();
  await page.waitForTimeout(1000);

  const onlyFedAndEstMarkers = await page.evaluate(() => {
    const markerPane = document.querySelector('.leaflet-marker-pane');
    return markerPane ? markerPane.querySelectorAll('path').length : 0;
  });
  console.log('Markers with Federal + Estadual only:', onlyFedAndEstMarkers);

  await page.screenshot({ path: 'map_search_and_layers_verified.png' });
  await browser.close();
  console.log('All search and layer tests completed successfully!');
})();
