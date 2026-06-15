const puppeteer = require('puppeteer');
const fs = require('fs');

async function scrape() {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  // 3조합 SECU 텍스트 확인
  try {
    const page = await browser.newPage();
    await page.goto('https://secunion.co.kr', { waitUntil: 'networkidle2', timeout: 30000 });
    const text = await page.evaluate(() => document.body.innerText);
    const lines = text.split('\n').filter(l => l.includes('명') || l.includes('동행'));
    console.log('=== SECU 관련 텍스트 ===');
    console.log(lines.slice(0, 10).join('\n'));
    await page.close();
  } catch(e) { console.log('SECU 오류:', e.message); }

  // 4조합 전삼노 텍스트 확인
  try {
    const page = await browser.newPage();
    await page.goto('https://samsunglabor.co.kr', { waitUntil: 'networkidle2', timeout: 30000 });
    const text = await page.evaluate(() => document.body.innerText);
    const lines = text.split('\n').filter(l => l.includes('명') || l.includes('조합원'));
    console.log('=== 전삼노 관련 텍스트 ===');
    console.log(lines.slice(0, 10).join('\n'));
    await page.close();
  } catch(e) { console.log('전삼노 오류:', e.message); }

  await browser.close();
}

scrape();
