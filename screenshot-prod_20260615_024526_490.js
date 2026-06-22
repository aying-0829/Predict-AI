const puppeteer = require('puppeteer');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async function main() {
  try {
    console.log('A - Starting');
    
    const browser = await puppeteer.launch({ 
      headless: 'new',
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    });
    console.log('B - Browser launched');
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    console.log('C - Page created');
    
    // Set demo session cookie first
    await page.setCookie({
      name: 'auth-token',
      value: 'demo-session',
      domain: '127.0.0.1',
      path: '/'
    });
    console.log('D - Cookie set');
    
    console.log('E - Navigating...');
    await page.goto('http://127.0.0.1:3020', { timeout: 60000, waitUntil: 'networkidle2' });
    console.log('F - Page loaded, waiting for render...');
    await sleep(3000);
    console.log('G - Taking screenshot...');
    
    const outputPath = 'D:\\ai数据库\\AI产出物\\predict-ai\\public\\screenshots\\dashboard-home.png';
    await page.screenshot({ path: outputPath, fullPage: false });
    console.log('H - Screenshot saved:', outputPath);
    
    const title = await page.title();
    console.log('I - Title:', title);
    
    await browser.close();
    console.log('J - Done!');
  } catch (err) {
    console.error('ERROR:', err.message);
    process.exit(1);
  }
})();
