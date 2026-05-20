const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const PAGE_URL = 'file:///E:/cc-project/profile/index.html';
const OUT_DIR = path.join(__dirname, 'screenshots');

const SECTIONS = [
  { id: 'landing',   name: '00-landing' },
  { id: 'hero',      name: '01-hero' },
  { id: 'about',     name: '02-about' },
  { id: 'portfolio', name: '03-portfolio' },
  { id: 'work',      name: '04-work' },
  { id: 'expertise', name: '05-expertise' },
  { id: 'contact',   name: '06-contact' },
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

  // Per-section viewport screenshots
  for (const section of SECTIONS) {
    await page.evaluate(id => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    }, section.id);

    await new Promise(r => setTimeout(r, 200));

    await page.screenshot({
      path: path.join(OUT_DIR, `${section.name}.png`),
    });
    console.log(`✓  ${section.name}.png`);
  }

  await browser.close();
  console.log(`\nAll screenshots saved to ./screenshots/ (${SECTIONS.length} files)`);
})();
