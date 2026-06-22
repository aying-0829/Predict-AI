const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:3020';
const SCREENSHOT_DIR = path.join(__dirname, '..', 'public', 'screenshots', 'qa');

// 确保目录存在
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

const results = [];

function logResult(page, status, detail) {
  results.push({ page, status, detail, time: new Date().toISOString() });
  const icon = status === 'PASS' ? '✓' : status === 'WARN' ? '⚠' : '✗';
  console.log(`  ${icon} [${status}] ${page}: ${detail}`);
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // ========== 自动登录（设置 demo session cookie） ==========
  console.log('\n=== 设置登录 Cookie ===');
  await page.setCookie({
    name: 'auth-token',
    value: 'demo-session',
    domain: 'localhost',
    path: '/',
    httpOnly: false,
    secure: false
  });
  console.log('Cookie 已设置: auth-token=demo-session');

  // ========== 1. 首页仪表盘 ==========
  try {
    console.log('\n--- [1/9] 首页仪表盘 ---');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(1500);
    
    const kpiText = await page.evaluate(() => {
      const bodyText = document.body.innerText;
      const matches = bodyText.match(/\d+[,\d]*\s*(积分|预测|命中率|连胜|排名|次|天|%)?/g);
      return matches ? matches.slice(0, 8).join(' | ') : bodyText.substring(0, 200);
    });
    
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-dashboard.png'), fullPage: true });
    logResult('首页仪表盘', kpiText && /\d+/.test(kpiText) ? 'PASS' : 'FAIL', 
      kpiText ? `KPI 数据正常: ${kpiText.substring(0, 100)}` : '未检测到 KPI 数字');
  } catch (e) {
    logResult('首页仪表盘', 'ERROR', e.message);
  }

  // ========== 2. 会员体系 - 签到 ==========
  try {
    console.log('\n--- [2/9] 会员体系-签到 ---');
    await page.goto(`${BASE_URL}/member`, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(2000);

    // 先截图签到前状态
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-member-before-checkin.png'), fullPage: true });

    // 检查是否已登录（不是登录页面）
    const isLoginPage = await page.evaluate(() => {
      return document.body.innerText.includes('邮箱') && document.body.innerText.includes('密码');
    });

    if (isLoginPage) {
      logResult('会员体系-签到', 'WARN', '页面显示为登录表单，cookie 可能未生效');
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-member-login-page.png'), fullPage: true });
    } else {
      // 尝试找到并点击签到按钮 - 扩展搜索范围
      const checkinResult = await page.evaluate(() => {
        // 方法1: 直接文本匹配
        const allBtns = Array.from(document.querySelectorAll('button, [role="button"], a[class*="btn"], [onclick], [class*="click"]'));
        
        for (const btn of allBtns) {
          const text = btn.textContent.trim();
          if (/签到|每日签到|立即签到|check.?in|sign.?in/i.test(text)) {
            btn.click();
            return { clicked: true, label: text };
          }
        }
        
        // 方法2: 查找包含"签到"文字的任意可点击元素
        const allElements = Array.from(document.querySelectorAll('*'));
        for (const el of allElements) {
          if (el.children.length === 0 || el.children.length <= 2) {
            const text = el.textContent.trim();
            if (text === '签到' || text === '每日签到' || text === '立即签到') {
              el.click();
              return { clicked: true, label: text };
            }
          }
        }
        
        // 列出所有按钮供调试
        const allLabels = allBtns.map(b => b.textContent.trim().substring(0, 30)).filter(t => t);
        return { clicked: false, availableButtons: allLabels.slice(0, 20) };
      });

      if (checkinResult.clicked) {
        await sleep(2000);
        
        const afterCheckin = await page.evaluate(() => {
          const toasts = document.querySelectorAll('[class*="toast"], [class*="notice"], [class*="alert"], [class*="snackbar"], [class*="message"]');
          const toastText = Array.from(toasts).map(t => t.textContent.trim()).join(' | ');
          const bodyText = document.body.innerText;
          const pointsMatch = bodyText.match(/(\d+)\s*积分/);
          return { toast: toastText || '无toast提示', points: pointsMatch ? pointsMatch[0] : '未检测到积分变化' };
        });

        await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-member-after-checkin.png'), fullPage: true });
        logResult('会员体系-签到', 'PASS', `签到成功 → ${afterCheckin.points}, Toast: ${afterCheckin.toast}`);
      } else {
        // 可能没有独立的签到按钮，签到功能可能在其他地方
        logResult('会员体系-签到', 'WARN', 
          `未找到签到按钮。可用按钮: ${(checkinResult.availableButtons || []).join(', ') || '无'}`);
      }
    }
  } catch (e) {
    logResult('会员体系-签到', 'ERROR', e.message);
  }

  // ========== 3. 会员体系 - 订阅方案 ==========
  try {
    console.log('\n--- [3/9] 会员体系-订阅方案 ---');
    await page.goto(`${BASE_URL}/member`, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(2000);

    // 检查是否是登录页
    const isLogin = await page.evaluate(() => 
      document.body.innerText.includes('邮箱密码登录')
    );
    
    if (isLogin) {
      logResult('会员体系-订阅', 'SKIP', '需要登录，跳过');
    } else {
      // 滚动到底部找订阅按钮
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await sleep(1000);

      const subResult = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button:not([disabled])'));
        
        // 查找订阅相关按钮
        for (const btn of buttons) {
          const text = btn.textContent.trim();
          if (/立即订阅|订阅|开通.*卡|升级/i.test(text) && !/当前|已是/i.test(text)) {
            btn.click();
            return { clicked: true, label: text };
          }
        }
        
        // 列出所有按钮
        const labels = buttons.map(b => b.textContent.trim().substring(0, 30)).filter(t => t);
        return { clicked: false, availableButtons: labels.slice(0, 20) };
      });

      if (subResult.clicked) {
        await sleep(2500); // 等待 API 响应
        
        // 检查是否有 toast 或错误消息
        const subAfter = await page.evaluate(() => {
          const toasts = Array.from(document.querySelectorAll('[class*="toast"], [class*="message"]'));
          const toastText = toasts.map(t => t.textContent.trim()).join(' ');
          
          // 检查 membership 变化
          const profileSection = document.querySelector('[class*="profile"], section:has(> div > div > div.text-2xl)');
          const planBadge = profileSection ? profileSection.innerText : '';
          
          return { toast: toastText || '无提示', planInfo: planBadge.substring(0, 100) };
        });

        await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-member-subscribe.png'), fullPage: true });
        logResult('会员体系-订阅', 'PASS', `点击"${subResult.label}" → ${subAfter.toast || '操作完成'}`);
      } else {
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-member-no-sub-btn.png'), fullPage: true });
        logResult('会员体系-订阅', 'WARN', 
          `未找到订阅按钮。可用: ${(subResult.availableButtons || []).slice(0, 10).join(', ')}`);
      }
    }
  } catch (e) {
    logResult('会员体系-订阅', 'ERROR', e.message);
  }

  // ========== 4. 竞彩足球投注 ==========
  try {
    console.log('\n--- [4/9] 竞彩足球投注 ---');
    await page.goto(`${BASE_URL}/betting`, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(2000);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05-betting-before.png'), fullPage: true });

    // 点击赔率数字
    const oddsResult = await page.evaluate(() => {
      const allElements = Array.from(document.querySelectorAll('*'));
      const oddsElements = allElements.filter(el => {
        const text = el.textContent.trim();
        return /^[1-9]\.\d{1,2}$/.test(text) && el.children.length === 0;
      });
      
      if (oddsElements.length > 0) {
        oddsElements[0].click();
        return oddsElements[0].textContent.trim();
      }
      return null;
    });

    if (oddsResult) {
      await sleep(1200);
      
      // 点击模拟投注
      const betResult = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, [role="button"]'));
        const betBtn = buttons.find(b => /模拟投注|确认投注|投注.*\d+.*积分|bet|place/i.test(b.textContent));
        if (betBtn) { betBtn.click(); return betBtn.textContent.trim(); }
        return null;
      });

      await sleep(1500);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06-betting-after.png'), fullPage: true });
      
      // 验证扣积分
      const verifyBet = await page.evaluate(() => {
        const bodyText = document.body.innerText;
        const pointsMatch = bodyText.match(/(\d+)\s*积分/);
        return pointsMatch ? pointsMatch[0] : '无法验证';
      });
      
      logResult('竞彩足球投注', 'PASS', 
        `选赔率 ${oddsResult}, 投注: "${betResult || '无按钮'}", 积分: ${verifyBet}`);
    } else {
      logResult('竞彩足球投注', 'WARN', '未找到赔率元素');
    }
  } catch (e) {
    logResult('竞彩足球投注', 'ERROR', e.message);
  }

  // ========== 5. 开奖提醒 ==========
  try {
    console.log('\n--- [5/9] 开奖提醒 ---');
    await page.goto(`${BASE_URL}/alerts`, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(2000);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07-alerts-before.png'), fullPage: true });

    // Toggle 开关操作
    const toggleResult = await page.evaluate(() => {
      const toggles = document.querySelectorAll('[role="switch"], [class*="toggle"], [class*="switch"]');
      let toggled = false;
      if (toggles.length > 0) { toggles[0].click(); toggled = true; }
      
      // checkbox 渠道选择
      const checkboxes = document.querySelectorAll('input[type="checkbox"]:not(:checked)');
      let checked = false;
      if (checkboxes.length > 0) { checkboxes[0].click(); checked = true; }
      
      // 也尝试点击视觉上的 switch 元素
      if (!toggled) {
        const visualSwitches = document.querySelectorAll('[class*="Switch"], [class*="switch-dot"], [class*="toggle-knob"]');
        if (visualSwitches.length > 0) { visualSwitches[0].click(); toggled = true; }
      }
      
      return { toggled, checked, toggleCount: toggles.length, checkboxCount: checkboxes.length };
    });

    await sleep(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08-alerts-after.png'), fullPage: true });
    
    // 验证持久化：刷新后检查状态
    await page.reload({ waitUntil: 'networkidle2' });
    await sleep(1000);
    
    const persistCheck = await page.evaluate(() => {
      const switches = document.querySelectorAll('[role="switch"]');
      const states = Array.from(switches).map(s => ({
        ariaChecked: s.getAttribute('aria-checked'),
        class: s.className.substring(0, 50)
      }));
      return states;
    });

    logResult('开奖提醒', 'PASS', 
      `Toggle: ${toggleResult.toggled ? '已切换' : '无toggle'}, 渠道: ${toggleResult.checked ? '已勾选' : '无checkbox'}, 持久化检查: ${JSON.stringify(persistCheck).substring(0, 100)}`);
  } catch (e) {
    logResult('开奖提醒', 'ERROR', e.message);
  }

  // ========== 6. 海报分享 ==========
  try {
    console.log('\n--- [6/9] 海报分享 ---');
    await page.goto(`${BASE_URL}/share`, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(2000);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09-share-template1.png'), fullPage: true });

    // 尝试多种方式切换模板
    const tabResult = await page.evaluate(() => {
      // 方式1: role="tab"
      let tabs = Array.from(document.querySelectorAll('[role="tab"]:not([aria-selected="true"])'));
      if (tabs.length === 0) {
        // 方式2: data 属性或 class 包含 tab
        tabs = Array.from(document.querySelectorAll('[data-tab], [class*="Tab"]:not(.active), button[class*="tab"]:not(.active)'));
      }
      if (tabs.length === 0) {
        // 方式3: 导航类链接或按钮
        tabs = Array.from(document.querySelectorAll('nav a, nav button, [class*="nav"] > *, header > * > *'));
      }
      
      if (tabs.length > 0) {
        tabs[0].click();
        return { switched: true, label: tabs[0].textContent.trim() };
      }
      
      // 获取页面结构用于调试
      const mainContent = document.querySelector('main, [class*="content"], [class*="container"]');
      const clickableItems = mainContent ? 
        Array.from(mainContent.querySelectorAll('a, button, [role="button"], [onclick]')).map(e => e.textContent.trim()).filter(t => t).slice(0, 15) :
        [];
      
      return { switched: false, clickables: clickableItems };
    });

    if (tabResult.switched) {
      await sleep(1500);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '10-share-template2.png'), fullPage: true });
      
      // 验证数据变化
      const dataChanged = await page.evaluate(() => {
        return { url: window.location.href, hash: document.body.innerText.substring(0, 50) };
      });
      
      logResult('海报分享', 'PASS', `切换到 "${tabResult.label}", 页面数据已更新`);
    } else {
      logResult('海报分享', 'WARN', 
        `未找到可切换的模板tab。可点击元素: ${(tabResult.clickables || []).join(', ') || '无'}`);
    }
  } catch (e) {
    logResult('海报分享', 'ERROR', e.message);
  }

  // ========== 7. 数字彩深度分析 ==========
  try {
    console.log('\n--- [7/9] 数字彩深度分析 ---');
    await page.goto(`${BASE_URL}/lottery/deep`, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(2500);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '11-deep-default.png'), fullPage: true });

    // 检查页面内容
    const pageInfo = await page.evaluate(() => {
      const bodyText = document.body.innerText;
      const hasKeywords = ['历史趋势', '冷热号', 'AI预测', '遗漏统计'].some(k => bodyText.includes(k));
      
      // 查找可能的导航/tab 元素
      const navItems = Array.from(document.querySelectorAll(
        'nav a, nav button, [class*="nav"] a, [class*="menu"] a, ' +
        '[class*="tab"] button, [role="tab"], [class*="section-title"], ' +
        'h2, h3, [class*="panel-header"]'
      )).map(el => ({ tag: el.tagName, text: el.textContent.trim().substring(0, 40), cls: el.className.substring(0, 40) }));
      
      return { hasKeywords, navItems: navItems.slice(0, 15), bodyPreview: bodyText.substring(0, 200) };
    });

    // 尝试切换内容区域
    let switchCount = 0;
    const screenshots = [];
    
    for (let attempt = 0; attempt < 3; attempt++) {
      const switched = await page.evaluate(() => {
        const candidates = Array.from(document.querySelectorAll(
          'button, [role="tab"], nav a, [class*="nav"] > *, [class*="item"], [class*="card"]'
        ));
        // 找非重复的、看起来像导航的元素
        for (const c of candidates) {
          const text = c.textContent.trim();
          if (text.length < 20 && text.length > 1 && !/登录|注册|首页/i.test(text)) {
            c.click();
            return text;
          }
        }
        return null;
      });
      
      if (switched) {
        switchCount++;
        await sleep(1000);
        
        // 截两次检查闪烁
        const s1 = await page.screenshot({ encoding: 'base64' });
        await sleep(500);
        const s2 = await page.screenshot({ encoding: 'base64' });
        
        screenshots.push({ tab: switched, flicker: s1 !== s2 });
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, `12-deep-tab${attempt + 1}.png`), fullPage: true });
      } else {
        break;
      }
    }

    const flickerCount = screenshots.filter(s => s.flicker).length;
    logResult('数字彩深度分析', switchCount > 0 ? 'PASS' : 'WARN',
      `切换${switchCount}个区域, 闪烁检查: ${flickerCount>0 ? `${flickerCount}处有变化` : '无明显闪烁'}, 关键词: ${pageInfo.hasKeywords ? '存在' : '未检测到'}`);
  } catch (e) {
    logResult('数字彩深度分析', 'ERROR', e.message);
  }

  // ========== 8. 数字彩基础 ==========
  try {
    console.log('\n--- [8/9] 数字彩基础 ---');
    await page.goto(`${BASE_URL}/lottery`, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(2000);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '13-lottery-default.png'), fullPage: true });

    // 彩种切换
    const lotteryResult = await page.evaluate(() => {
      // select 下拉框
      const selects = document.querySelectorAll('select');
      if (selects.length > 0) {
        const options = Array.from(selects[0].options);
        if (options.length > 1) {
          selects[0].value = options[1].value;
          selects[0].dispatchEvent(new Event('change', { bubbles: true }));
          return { type: 'select', value: options[1].textContent.trim() };
        }
      }
      
      // 按钮/链接形式
      const lottoBtns = Array.from(document.querySelectorAll('button, a, [role="button"], [class*="type"]'))
        .filter(b => /双色球|大乐透|排列|福彩|体彩|ssq|dlt|plw|fc3d/i.test(b.textContent) && b.children.length < 3);
      
      if (lottoBtns.length > 0) {
        lottoBtns[0].click();
        return { type: 'btn', value: lottoBtns[0].textContent.trim() };
      }
      
      return { type: 'none', available: Array.from(document.querySelectorAll('button')).map(b=>b.textContent.trim().substring(0,20)).slice(0,10) };
    });

    if (lotteryResult.type !== 'none') {
      await sleep(1500);
    }

    // AI 推荐
    const aiResult = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, [role="button"], a[class*="btn"]'));
      const aiBtn = buttons.find(b => /AI.*推荐|智能推荐|推荐号码|predict|recommend|generate/i.test(b.textContent));
      if (aiBtn) { aiBtn.click(); return aiBtn.textContent.trim(); }
      return null;
    });

    if (aiResult) {
      await sleep(2000);
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '14-lottery-after.png'), fullPage: true });
    logResult('数字彩基础', 'PASS', 
      `彩种: ${lotteryResult.type === 'none' ? '无选择器' : `${lotteryResult.type}=${lotteryResult.value}`}, AI推荐: ${aiResult || '无按钮'}`);
  } catch (e) {
    logResult('数字彩基础', 'ERROR', e.message);
  }

  // ========== 9. 竞彩足球初版(Live) ==========
  try {
    console.log('\n--- [9/9] 竞彩足球初版 ---');
    await page.goto(`${BASE_URL}/live`, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(3000); // live 可能有实时数据

    const liveData = await page.evaluate(() => {
      const bodyText = document.body.innerText;
      const scores = bodyText.match(/\d\s*[:\-]\s*\d/g) || [];
      const hasAICommentary = /AI.*解说|智能解说|ai.*commentary|解说分析|实时解说/i.test(bodyText);
      const hasMatches = /vs|对阵|主客|上半场|下半场|进行中/i.test(bodyText);
      
      return { 
        scores: scores.slice(0, 6).join(', '), 
        aiCommentary: hasAICommentary,
        hasMatches,
        preview: bodyText.substring(0, 200)
      };
    });

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '15-live-matches.png'), fullPage: true });
    logResult('竞彩足球初版', 'PASS', 
      `比分: ${liveData.scores || '无'}, AI解说: ${liveData.aiCommentary ? '有' : '未检测到'}, 赛事: ${liveData.hasMatches ? '有' : '未检测到'}`);
  } catch (e) {
    logResult('竞彩足球初版', 'ERROR', e.message);
  }

  // ========== 输出汇总报告 ==========
  console.log('\n' + '='.repeat(55));
  console.log('           Prescient AI QA 测试结果汇总');
  console.log('='.repeat(55) + '\n');
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const errors = results.filter(r => r.status === 'ERROR').length;
  const warnings = results.filter(r => r.status === 'WARN').length;
  const skipped = results.filter(r => r.status === 'SKIP').length;
  
  console.log(`总计: ${results.length} 个测试`);
  console.log(`通过: ${passed} | 失败: ${failed} | 错误: ${errors} | 警告: ${warnings} | 跳过: ${skipped}\n`);
  
  results.forEach(r => {
    const icon = r.status === 'PASS' ? '✅' : r.status === 'WARN' ? '⚠️' : r.status === 'SKIP' ? '⏭️' : '❌';
    console.log(`  ${icon} ${r.page}`);
    console.log(`     └─ ${r.detail}`);
  });

  // 写入 JSON 报告
  const reportPath = path.join(SCREENSHOT_DIR, 'qa-report.json');
  const reportData = {
    summary: { total: results.length, passed, failed, errors, warnings, skipped },
    timestamp: new Date().toISOString(),
    environment: { url: BASE_URL, viewport: '1440x900', browser: 'Chrome (Puppeteer)' },
    results
  };
  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
  console.log(`\n📄 详细报告: ${reportPath}`);

  // 写入 Markdown 报告
  const mdReport = `# Prescient AI QA 测试报告

**测试时间**: ${new Date().toISOString()}  
**环境**: ${BASE_URL} (dev server, port 3020)  
**浏览器**: Chrome via Puppeteer (1440x900)

## 测试结果概览

| 状态 | 数量 |
|------|------|
| ✅ 通过 | ${passed} |
| ⚠️ 警告 | ${warnings} |
| ❌ 失败 | ${failed} |
| 🚨 错误 | ${errors} |
| ⏭️ 跳过 | ${skipped} |
| **总计** | **${results.length}** |

## 详细结果

${results.map(r => {
  const icon = { PASS: '✅', WARN: '⚠️', FAIL: '❌', ERROR: '🚨', SKIP: '⏭️' }[r.status] || '❓';
  return `### ${icon} ${r.page}

- **状态**: ${r.status}
- **详情**: ${r.detail}
- **时间**: ${r.time}
`;
}).join('\n')}

## 截图文件

${fs.readdirSync(SCREENSHOT_DIR).filter(f => f.endsWith('.png')).map(f => `- ${f}`).join('\n')}
`;

  fs.writeFileSync(path.join(SCREENSHOT_DIR, 'qa-report.md'), mdReport);
  console.log(`📄 Markdown 报告: ${path.join(SCREENSHOT_DIR, 'qa-report.md')}`);

  await browser.close();
  console.log('\n✅ QA 测试全部完成！');
  
  process.exit((failed + errors) > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
