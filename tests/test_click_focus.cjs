const { chromium } = require('playwright');

(async () => {
  console.log('Testing click focus outline on municipality polygon...');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  await page.click('button:has-text("Mapa Interativo")');
  await page.waitForTimeout(2500);

  // Find a polygon and click it
  console.log('Clicking on polygon...');
  await page.evaluate(() => {
    const paths = Array.from(document.querySelectorAll('path.leaflet-interactive'));
    const munPath = paths.find(p => (p.getAttribute('d') || '').length > 200);
    if (munPath) {
      munPath.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      munPath.focus();
    }
  });

  await page.waitForTimeout(1000);

  // Check computed outline style of activeElement
  const focusOutline = await page.evaluate(() => {
    const active = document.activeElement;
    const style = active ? window.getComputedStyle(active) : null;
    return {
      activeTagName: active ? active.tagName : null,
      activeClass: active ? active.getAttribute('class') : null,
      outlineStyle: style ? style.outlineStyle : null,
      outlineWidth: style ? style.outlineWidth : null,
      outlineColor: style ? style.outlineColor : null,
    };
  });
  console.log('Focus outline evaluation:', focusOutline);

  await page.screenshot({ path: 'click_focus_test.png' });
  console.log('Saved click_focus_test.png');

  await browser.close();
})();
