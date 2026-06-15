const https = require('https');

function fetchSite(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Cache-Control': 'no-cache, no-store',
        'Pragma': 'no-cache'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('timeout')); });
  });
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-cache');

  const result = { fetchedAt: new Date().toISOString(), data: {} };

  // 3조합 SECU
  try {
    const html = await fetchSite('https://secunion.co.kr');
    const countMatch = html.match(/<strong>([\d,]+)<\/strong>명 동행중/);
    const dateMatch = html.match(/동행중 - (\d{4}-\d{2}-\d{2} \d{2}:\d{2})/);
    if (countMatch) result.data.secu = {
      count: countMatch[1].replace(/,/g, ''),
      date: dateMatch?.[1] || null
    };
  } catch(e) { result.data.secu = { error: e.message }; }

  // 4조합 전삼노
  try {
    const html = await fetchSite('https://samsunglabor.co.kr');
    const countMatch = html.match(/현재 조합원 수\s*<span[^>]*>([\d,]+)<\/span>/);
    const dateMatch = html.match(/(\d{4}년\s*\d{2}월\s*\d{2}일\s*\d{2}시)\s*기준/);
    if (countMatch) result.data.nseu = {
      count: countMatch[1].replace(/,/g, ''),
      date: dateMatch?.[1] || null
    };
  } catch(e) { result.data.nseu = { error: e.message }; }

  // 5조합 SELU
  try {
    const html = await fetchSite('https://selunion.co.kr');
    const countMatch = html.match(/조합원 ([\d,]+)명/);
    const dateMatch = html.match(/(\d{4}년\s*\d+월\s*\d+일\s*\d+시)/);
    if (countMatch) result.data.selu = {
      count: countMatch[1].replace(/,/g, ''),
      date: dateMatch?.[1] || null
    };
  } catch(e) { result.data.selu = { error: e.message }; }

  res.status(200).json(result);
};
