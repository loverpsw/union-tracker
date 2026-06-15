const puppeteer = require('puppeteer');
const fs = require('fs');

async function scrape() {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const result = { data: {} };

  // 3조합 SECU
  try {
    const page = await browser.newPage();
    await page.goto('https://secunion.co.kr', { waitUntil: 'networkidle2', timeout: 30000 });
    const text = await page.evaluate(() => document.body.innerText);
    const countMatch = text.match(/([\d,]+)명 동행중/);
    const dateMatch = text.match(/동행중\s*[-·]?\s*(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2})/);
    if (countMatch) result.data.secu = {
      count: countMatch[1].replace(/,/g, ''),
      date: dateMatch ? dateMatch[1].trim() : null
    };
    await page.close();
  } catch(e) { result.data.secu = { error: e.message }; }

  // 4조합 전삼노
  try {
    const page = await browser.newPage();
    await page.goto('https://samsunglabor.co.kr', { waitUntil: 'networkidle2', timeout: 30000 });
    const text = await page.evaluate(() => document.body.innerText);
    const countMatch = text.match(/현재 조합원 수\s*([\d,]+)명/);
    const dateMatch = text.match(/(\d{4}년\s*\d{2}월\s*\d{2}일\s*\d{2}시)\s*기준/);
    if (countMatch) result.data.nseu = {
      count: countMatch[1].replace(/,/g, ''),
      date: dateMatch ? dateMatch[1] : null
    };
    await page.close();
  } catch(e) { result.data.nseu = { error: e.message }; }

  // 5조합 SELU
  try {
    const page = await browser.newPage();
    await page.goto('https://selunion.co.kr', { waitUntil: 'networkidle2', timeout: 30000 });
    const text = await page.evaluate(() => document.body.innerText);
    const countMatch = text.match(/조합원\s*([\d,]+)명/);
    const dateMatch = text.match(/(\d{4}년\s*\d+월\s*\d+일\s*\d+시)/);
    if (countMatch) result.data.selu = {
      count: countMatch[1].replace(/,/g, ''),
      date: dateMatch ? dateMatch[1] : null
    };
    await page.close();
  } catch(e) { result.data.selu = { error: e.message }; }

  await browser.close();

  // 기존 data.json 누적
  let history = [];
  if (fs.existsSync('data.json')) {
    history = JSON.parse(fs.readFileSync('data.json', 'utf8'));
  }

  const today = new Date().toISOString().slice(0, 10);
  const idx = history.findIndex(r => r.date === today);
  if (idx === -1) {
    history.push({ date: today, ...result.data });
  } else {
    history[idx] = { date: today, ...result.data };
  }

  fs.writeFileSync('data.json', JSON.stringify(history, null, 2));
  console.log('완료:', JSON.stringify(result.data, null, 2));
}

scrape();
