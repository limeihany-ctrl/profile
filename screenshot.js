const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const PAGE_URL = 'file:///E:/cc-project/profile/index.html';
const OUT_DIR = path.join(__dirname, 'screenshots');

const SECTIONS = [
  { id: 'landing',   file: '01-landing.png' },
  { id: 'about',     file: '02-hero.png' },
  { id: 'portfolio', file: '03-portfolio.png' },
  { id: 'work',      file: '04-work.png' },
  { id: 'expertise', file: '05-expertise.png' },
  { id: 'contact',   file: '06-contact.png' },
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

  await page.evaluate(() => {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
    const s = document.createElement('style');
    s.textContent = '*, *::before, *::after { transition: none !important; animation: none !important; }';
    document.head.appendChild(s);
  });

  await new Promise(r => setTimeout(r, 400));

  for (const section of SECTIONS) {
    await page.evaluate(id => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    }, section.id);

    await new Promise(r => setTimeout(r, 200));

    await page.screenshot({ path: path.join(OUT_DIR, section.file) });
    console.log(`✓  ${section.file}`);
  }

  await browser.close();
  console.log(`\nDone — ${SECTIONS.length} screenshots in ./screenshots/`);
})();
