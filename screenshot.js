const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const PAGE_URL = 'file:///E:/cc-project/profile/index.html';
const OUT_DIR = path.join(__dirname, 'screenshots');

const SECTIONS = [
  { id: 'hero',      name: '01-hero' },
  { id: 'about',     name: '02-about' },
  { id: 'work',      name: '03-work' },
  { id: 'expertise', name: '04-expertise' },
  { id: 'contact',   name: '05-contact' },
];

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  await page.goto(PAGE_URL, { waitUntil: 'networkidle0' });

  // Trigger all scroll-reveal animations and freeze transitions
  await page.evaluate(() => {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
    const s = document.createElement('style');
    s.textContent = '*, *::before, *::after { transition: none !important; animation: none !important; }';
    document.head.appendChild(s);
  });

  await new Promise(r => setTimeout(r, 400));

  // Full-page screenshot
  await page.screenshot({
    path: path.join(OUT_DIR, '00-full-page.png'),
    fullPage: true,
  });
  console.log('✓  00-full-page.png');

  // Per-section viewport screenshots
  for (const section of SECTIONS) {
    await page.evaluate(id => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    }, section.id);

    await new Promise(r => setTimeout(r, 150));

    await page.screenshot({
      path: path.join(OUT_DIR, `${section.name}.png`),
    });
    console.log(`✓  ${section.name}.png`);
  }

  // Chinese version — switch lang and re-shoot hero
  await page.evaluate(() => {
    document.querySelectorAll('[data-t]').forEach(el => {
      const key = el.dataset.t;
      const zh = window._zhMap && window._zhMap[key];
      if (zh) el.innerHTML = zh;
    });
  });

  // Build zh map from page's own T object and re-apply
  await page.evaluate(() => {
    if (typeof T !== 'undefined') {
      Object.entries(T.zh).forEach(([key, val]) => {
        document.querySelectorAll(`[data-t="${key}"]`).forEach(el => {
          el.innerHTML = val;
        });
      });
      document.querySelectorAll('.lt-label').forEach(span => {
        span.classList.toggle('active', span.dataset.lang === 'zh');
      });
    }
  });

  await page.evaluate(() => {
    const el = document.getElementById('hero');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await new Promise(r => setTimeout(r, 150));

  await page.screenshot({
    path: path.join(OUT_DIR, '06-hero-zh.png'),
  });
  console.log('✓  06-hero-zh.png');

  await browser.close();
  console.log(`\nAll screenshots saved to ./screenshots/ (${SECTIONS.length + 2} files)`);
})();
