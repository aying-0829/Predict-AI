const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--use-gl=swiftshader']
  });
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER:', msg.text()));
  page.on('pageerror', err => console.log('PAGE_ERROR:', err.message));
  
  await page.goto('http://localhost:3020', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));
  
  const screenshotPath = 'C:\\Users\\Administrator\\AppData\\Roaming\\Tencent\\Marvis\\User\\oAN1i2bne2BhNptnZFJNGn5Amfo4\\workspace\\conv_19ec0f9d53d_2cdbea52eed4\\temp\\predict-ai-staging\\screenshot.png';
  await page.screenshot({ path: screenshotPath, fullPage: true });
  
  const errorBoundaries = await page.evaluate(() => {
    const errors = [];
    // Check for "组件渲染异常" text anywhere
    const allText = document.body.innerText || '';
    const hasRenderError = allText.includes('组件渲染异常') || allText.includes('Error creating WebGL');
    const floatingLinesCanvas = document.querySelector('canvas');
    const hasFloatingLines = !!floatingLinesCanvas;
    return { hasRenderError, hasFloatingLines };
  });
  
  console.log('RESULT:', JSON.stringify(errorBoundaries));
  await browser.close();
  console.log('SCREENSHOT_SAVED:', screenshotPath);
})();
