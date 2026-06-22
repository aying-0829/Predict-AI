const puppeteer = require('puppeteer');

(async function main() {
  try {
    console.log('A - Starting');
    
    // Try to find system Chrome
    const chromePaths = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe'
    ];
    
    let executablePath = null;
    for (const p of chromePaths) {
      const fs = require('fs');
      if (fs.existsSync(p)) {
        executablePath = p;
        console.log('Using Chrome:', p);
        break;
      }
    }
    
    const browser = await puppeteer.launch({ 
      headless: 'new',
      executablePath: executablePath || undefined
    });
    console.log('B - Browser launched');
    const page = await browser.newPage();
    console.log('C - Page created');
    
    // Set demo session cookie
    await page.setCookie({
      name: 'auth-token',
      value: 'demo-session',
      domain: '127.0.0.1',
      path: '/'
    });
    
    console.log('D - Navigating...');
    await page.goto('http://127.0.0.1:3020', { timeout: 90000, waitUntil: 'networkidle2' });
    console.log('E - Page loaded, waiting for render...');
    await page.waitForTimeout(3000);
    
    const outputPath = __dirname + '\\public\\screenshots\\dashboard-home.png';
    await page.screenshot({ path: outputPath, fullPage: false });
    console.log('F - Screenshot saved to:', outputPath);
    
    const title = await page.title();
    console.log('G - Page title:', title);
    
    await browser.close();
    console.log('H - Done!');
  } catch (err) {
    console.error('ERROR:', err.message);
    process.exit(1);
  }
})();
