const puppeteer = require('puppeteer');

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
    
    console.log('E - Navigating to http://127.0.0.1:3020 ...');
    await page.goto('http://127.0.0.1:3020', { timeout: 60000, waitUntil: 'networkidle2' });
    console.log('F - Page loaded');
    
    // Wait for dashboard content to render
    await page.waitForTimeout(3000);
    console.log('G - Waited for render');
    
    const outputPath = 'D:\\ai数据库\\AI产出物\\predict-ai\\public\\screenshots\\dashboard-home.png';
    await page.screenshot({ path: outputPath, fullPage: false });
    console.log('H - Screenshot saved to:', outputPath);
    
    const title = await page.title();
    console.log('I - Page title:', title);
    
    await browser.close();
    console.log('J - Done!');
  } catch (err) {
    console.error('ERROR:', err.message);
    process.exit(1);
  }
})();
