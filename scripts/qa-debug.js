const puppeteer = require('puppeteer');

async function main() {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // === 排查1: 会员页面结构 ===
  console.log('\n===== 排查会员页面 =====');
  await page.goto('http://localhost:3020/member', { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(2000);
  
  const memberInfo = await page.evaluate(() => {
    // 获取所有按钮文本
    const buttons = Array.from(document.querySelectorAll('button, [role="button"], [class*="btn"], [onclick]'));
    const btnTexts = buttons.map(b => ({
      text: b.textContent.trim().substring(0, 50),
      class: b.className.substring(0, 80),
      tag: b.tagName,
      disabled: b.disabled
    }));
    
    // 获取所有可点击元素
    const clickables = Array.from(document.querySelectorAll('[class*="checkin"], [class*="sign"], [class*="subscribe"], [class*="plan"], [class*="sub"]'));
    const clickableInfo = clickables.map(el => ({
      tag: el.tagName,
      class: el.className.substring(0, 80),
      text: el.textContent.trim().substring(0, 50)
    }));

    // 获取页面主要区域结构
    const sections = Array.from(document.querySelectorAll('section, [class*="section"], main > div, [class*="card"]')).map(s => ({
      tag: s.tagName,
      class: s.className.substring(0, 60),
      text: s.textContent.trim().substring(0, 100)
    }));

    return { buttons: btnTexts, clickables: clickableInfo, sections: sections.slice(0, 10) };
  });
  
  console.log('--- 按钮 ---');
  memberInfo.buttons.forEach(b => console.log(`  <${b.tag}> "${b.text}" class="${b.class}" disabled=${b.disabled}`));
  console.log('\n--- 可点击签到/订阅相关 ---');
  memberInfo.clickables.forEach(c => console.log(`  <${c.tag}> class="${c.class}" text="${c.text}"`));
  console.log('\n--- 主要区块 ---');
  memberInfo.sections.forEach(s => console.log(`  <${s.tag}> class="${s.class}" → "${s.text}"`));

  // === 排查2: 海报分享页面 ===
  console.log('\n===== 排查海报分享页面 =====');
  await page.goto('http://localhost:3020/share', { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(2000);

  const shareInfo = await page.evaluate(() => {
    // 查找所有 tab 相关元素
    const tabs = Array.from(document.querySelectorAll('[role="tab"], [data-tab], [class*="tab"]'));
    const tabInfo = tabs.map(t => ({
      tag: t.tagName,
      class: t.className.substring(0, 80),
      text: t.textContent.trim().substring(0, 50),
      role: t.getAttribute('role'),
      selected: t.getAttribute('aria-selected')
    }));

    // 查找所有导航类元素
    const navs = Array.from(document.querySelectorAll('nav, [class*="nav"], [class*="menu"], header button, [class*="template"]'));
    const navInfo = navs.map(n => ({
      tag: n.tagName,
      class: n.className.substring(0, 80),
      text: n.textContent.trim().substring(0, 80)
    }));

    return { tabs: tabInfo, navs: navInfo.slice(0, 15) };
  });

  console.log('--- Tab 元素 ---');
  shareInfo.tabs.forEach(t => console.log(`  <${t.tag}> role="${t.role}" selected="${t.selected}" text="${t.text}"`));
  console.log('\n--- 导航/菜单 ---');
  shareInfo.navs.forEach(n => console.log(`  <${n.tag}> class="${n.class}" text="${n.text}"`));

  // === 排查3: 数字彩基础 - 彩种选择器 ===
  console.log('\n===== 排查数字彩基础页面 =====');
  await page.goto('http://localhost:3020/lottery', { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(2000);

  const lotteryInfo = await page.evaluate(() => {
    // 查找 select 下拉框
    const selects = Array.from(document.querySelectorAll('select'));
    const selectInfo = selects.map(s => ({
      options: Array.from(s.options).map(o => ({ value: o.value, text: o.textContent.trim() }))
    }));

    // 查找彩种相关按钮
    const lotteryBtns = Array.from(document.querySelectorAll('button, [role="button"], [class*="type"], [class*="lottery"]'));
    const lotteryBtnInfo = lotteryBtns.filter(b => /双色|乐透|3D|排列|福彩|体彩|ssq|dlt/i.test(b.textContent) || /type|种类|彩种/i.test(b.className)).map(b => ({
      text: b.textContent.trim(),
      class: b.className.substring(0, 60)
    }));

    // AI推荐按钮
    const aiBtns = Array.from(document.querySelectorAll('button, [role="button"]'))
      .filter(b => /AI|推荐|智能|predict|recommend/i.test(b.textContent))
      .map(b => ({ text: b.textContent.trim(), class: b.className.substring(0, 60) }));

    return { selects: selectInfo, lotteryBtns: lotteryBtnInfo, aiBtns };
  });

  console.log('--- Select 下拉 ---');
  lotteryInfo.selects.forEach((s, i) => console.log(`  Select #${i}: ${JSON.stringify(s.options)}`));
  console.log('\n--- 彩种按钮 ---');
  lotteryInfo.lotteryBtns.forEach(b => console.log(`  "${b.text}" class="${b.class}"`));
  console.log('\n--- AI推荐按钮 ---');
  lotteryInfo.aiBtns.forEach(b => console.log(`  "${b.text}" class="${b.class}"`));

  // === 排查4: 深度分析 Tab ===
  console.log('\n===== 排查深度分析页面 =====');
  await page.goto('http://localhost:3020/lottery/deep', { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(2000);

  const deepInfo = await page.evaluate(() => {
    const allElements = document.body.innerText;
    // 查找包含特定关键词的元素
    const keywords = ['历史趋势', '冷热号', 'AI预测', '遗漏统计'];
    const found = {};
    keywords.forEach(k => {
      found[k] = allElements.includes(k);
    });

    // 查找可能的 tab 容器
    const tabContainers = Array.from(document.querySelectorAll('[class*="tab"], [class*="panel"], [class*="section"]'))
      .filter(el => el.children.length >= 2)
      .map(el => ({
        class: el.className.substring(0, 60),
        childCount: el.children.length,
        childrenText: Array.from(el.children).slice(0, 5).map(c => c.textContent.trim().substring(0, 30))
      }));

    return { keywordsFound: found, tabContainers: tabContainers.slice(0, 8) };
  });

  console.log('--- 关键词检测 ---');
  Object.entries(deepInfo.keywordsFound).forEach(([k, v]) => console.log(`  ${k}: ${v ? '找到' : '未找到'}`));
  console.log('\n--- 可能的Tab容器 ---');
  deepInfo.tabContainers.forEach(t => console.log(`  class="${t.class}" (${t.childCount}子) → ${t.childrenText.join(' | ')}`));

  await browser.close();
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

main().catch(console.error);
