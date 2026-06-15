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

  const debug = {};

  // 3조합 SECU
  try {
    const html = await fetchSite('https://secunion.co.kr');
    const idx = html.indexOf('동행중');
    debug.secu = html.slice(Math.max(0, idx-100), idx+50);
  } catch(e) { debug.secu_error = e.message; }

  // 5조합 SELU
  try {
    const html = await fetchSite('https://selunion.co.kr');
    const idx = html.indexOf('조합원');
    debug.selu = html.slice(Math.max(0, idx-50), idx+100);
  } catch(e) { debug.selu_error = e.message; }

  res.status(200).json(debug);
};
