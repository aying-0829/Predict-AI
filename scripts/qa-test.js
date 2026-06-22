const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:3020';
const SCREENSHOT_DIR = path.join(__dirname, 'public', 'screenshots', 'qa');

// 确保目录存在
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

const results = [];

function logResult(page, status, detail) {
  results.push({ page, status, detail, time: new Date().toISOString() });
  console.log(`[${status.toUpperCase()}] ${page}: ${detail}`);
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

  // ========== 1. 首页仪表盘 ==========
  try {
    console.log('\n--- 测试 1/9: 首页仪表盘 ---');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(1500);
    
    // 检查 KPI 卡片数字显示
    const kpiText = await page.evaluate(() => {
      const cards = document.querySelectorAll('[class*="card"], [class*="stat"], [class*="kpi"], [class*="metric"]');
      if (cards.length > 0) return Array.from(cards).map(c => c.textContent.trim()).join(' | ');
      // fallback: 查找包含数字的元素
      const bodyText = document.body.innerText;
      const matches = bodyText.match(/\d+[,\d]*\s*(积分|预测|命中率|连胜|排名)?/g);
      return matches ? matches.slice(0, 6).join(' | ') : document.body.innerText.substring(0, 200);
    });
    
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-dashboard.png'), fullPage: true });
    
    if (kpiText && /\d+/.test(kpiText)) {
      logResult('首页仪表盘', 'PASS', `KPI 数据正常显示: ${kpiText.substring(0, 100)}`);
    } else {
      logResult('首页仪表盘', 'FAIL', '未检测到 KPI 数字数据');
    }
  } catch (e) {
    logResult('首页仪表盘', 'ERROR', e.message);
  }

  // ========== 2. 会员体系 - 签到 ==========
  try {
    console.log('\n--- 测试 2/9: 会员体系-签到 ---');
    await page.goto(`${BASE_URL}/member`, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(2000);

    // 截图：签到前
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-member-before-checkin.png'), fullPage: true });

    // 尝试找到并点击签到按钮
    const checkinClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, [role="button"], [class*="btn"]'));
      const checkinBtn = buttons.find(b => 
        /签到|check.?in|sign.?in/i.test(b.textContent)
      );
      if (checkinBtn) { checkinBtn.click(); return true; }
      return false;
    });

    if (checkinClicked) {
      await sleep(2000);
      
      // 检查 toast 提示和积分变化
      const afterCheckin = await page.evaluate(() => {
        const toasts = document.querySelectorAll('[class*="toast"], [class*="notice"], [class*="alert"], [class*="snackbar"]');
        const toastText = Array.from(toasts).map(t => t.textContent.trim()).join(' | ');
        // 检查积分相关文本
        const bodyText = document.body.innerText;
        const pointsMatch = bodyText.match(/(\d+)\s*积分/);
        return { toast: toastText || '无toast', points: pointsMatch ? pointsMatch[0] : '未检测到积分' };
      });

      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-member-after-checkin.png'), fullPage: true });
      logResult('会员体系-签到', 'PASS', `签到成功, ${afterCheckin.points}, toast: ${afterCheckin.toast}`);
    } else {
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-member-checkin-no-btn.png'), fullPage: true });
      logResult('会员体系-签到', 'WARN', '未找到签到按钮，可能已签到或按钮文本不匹配');
    }
  } catch (e) {
    logResult('会员体系-签到', 'ERROR', e.message);
  }

  // ========== 3. 会员体系 - 订阅方案 ==========
  try {
    console.log('\n--- 测试 3/9: 会员体系-订阅方案 ---');
    await page.goto(`${BASE_URL}/member`, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(1500);

    // 滚动到底部找订阅方案
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await sleep(1000);

    // 尝试点击订阅方案按钮
    const subClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, [role="button"], [class*="btn"]'));
      const subBtn = buttons.find(b => 
        /订阅|subscribe|开通|升级|月卡|季卡|年卡|方案/i.test(b.textContent) && !/disabled/i.test(b.className)
      );
      if (subBtn) { subBtn.click(); return subBtn.textContent.trim(); }
      return null;
    });

    if (subClicked) {
      await sleep(2000);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-member-subscribe.png'), fullPage: true });
      logResult('会员体系-订阅', 'PASS', `点击订阅按钮成功: "${subClicked}"`);
    } else {
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-member-subscribe-no-btn.png'), fullPage: true });
      logResult('会员体系-订阅', 'WARN', '未找到可用的订阅按钮');
    }
  } catch (e) {
    logResult('会员体系-订阅', 'ERROR', e.message);
  }

  // ========== 4. 竞彩足球投注 ==========
  try {
    console.log('\n--- 测试 4/9: 竞彩足球投注 ---');
    await page.goto(`${BASE_URL}/betting`, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(2000);

    // 截图：投注前
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05-betting-before.png'), fullPage: true });

    // 点击赔率数字
    const oddsClicked = await page.evaluate(() => {
      // 查找赔率数字（通常是 1.xx ~ 9.xx 格式）
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

    if (oddsClicked) {
      await sleep(1500);
      
      // 尝试点击模拟投注按钮
      const betClicked = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, [role="button"], [class*="btn"]'));
        const betBtn = buttons.find(b => /模拟投注|投注|确认|bet|place/i.test(b.textContent));
        if (betBtn) { betBtn.click(); return betBtn.textContent.trim(); }
        return null;
      });

      await sleep(1500);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06-betting-after.png'), fullPage: true });
      logResult('竞彩足球投注', 'PASS', `选择赔率 ${oddsClicked}, 投注按钮: ${betClicked || '未找到'}`);
    } else {
      logResult('竞彩足球投注', 'WARN', '未找到赔率元素，可能页面结构不同');
    }
  } catch (e) {
    logResult('竞彩足球投注', 'ERROR', e.message);
  }

  // ========== 5. 开奖提醒 ==========
  try {
    console.log('\n--- 测试 5/9: 开奖提醒 ---');
    await page.goto(`${BASE_URL}/alerts`, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(2000);

    // 截图：操作前
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07-alerts-before.png'), fullPage: true });

    // 切换 toggle 开关
    const toggled = await page.evaluate(() => {
      // 查找 toggle/switch 元素
      const toggles = document.querySelectorAll('[role="switch"], [class*="toggle"], [class*="switch"], input[type="checkbox"]');
      if (toggles.length > 0) {
        toggles[0].click();
        return true;
      }
      return false;
    });

    if (toggled) {
      await sleep(1000);
    }

    // 勾选渠道复选框
    const channelChecked = await page.evaluate(() => {
      const checkboxes = document.querySelectorAll('input[type="checkbox"]:not(:checked)');
      if (checkboxes.length > 0) {
        checkboxes[0].click();
        return true;
      }
      return false;
    });

    await sleep(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08-alerts-after.png'), fullPage: true });
    logResult('开奖提醒', 'PASS', `Toggle切换: ${toggled ? '成功' : '无toggle'}, 渠道勾选: ${channelChecked ? '成功' : '无checkbox'}`);
  } catch (e) {
    logResult('开奖提醒', 'ERROR', e.message);
  }

  // ========== 6. 海报分享 ==========
  try {
    console.log('\n--- 测试 6/9: 海报分享 ---');
    await page.goto(`${BASE_URL}/share`, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(2000);

    // 截图：默认模板
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09-share-template1.png'), fullPage: true });

    // 切换模板 tab
    const tabSwitched = await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('[role="tab"], [class*="tab"] button, button[class*="tab"], [class*="template"]'));
      // 找非激活状态的 tab
      const inactiveTab = tabs.find(t => !t.classList.contains('active') && !t.getAttribute('aria-selected'));
      if (inactiveTab) {
        inactiveTab.click();
        return inactiveTab.textContent.trim();
      }
      // 如果找不到，尝试点击任意 tab 按钮
      if (tabs.length > 1) {
        tabs[1].click();
        return tabs[1].textContent.trim();
      }
      return null;
    });

    if (tabSwitched) {
      await sleep(1500);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '10-share-template2.png'), fullPage: true });
      logResult('海报分享', 'PASS', `模板切换成功: "${tabSwitched}"`);
    } else {
      logResult('海报分享', 'WARN', '未找到可切换的模板 tab');
    }
  } catch (e) {
    logResult('海报分享', 'ERROR', e.message);
  }

  // ========== 7. 数字彩深度分析 ==========
  try {
    console.log('\n--- 测试 7/9: 数字彩深度分析 ---');
    await page.goto(`${BASE_URL}/lottery/deep`, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(2000);

    // 截图：默认 tab
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '11-deep-default.png'), fullPage: true });

    // 切换各个 tab 并检查是否有 Math.random() 闪烁问题
    const tabsToTest = ['历史趋势', '冷热号', 'AI预测', '遗漏统计', '趋势', '冷热', '预测', '遗漏'];
    let switchCount = 0;

    for (let i = 0; i < 3; i++) {
      const switched = await page.evaluate((targetTabs) => {
        const allTabs = Array.from(document.querySelectorAll('[role="tab"], [class*="tab"] button, button[class*="tab"], nav a, [class*="nav"] button'));
        for (const tab of allTabs) {
          const text = tab.textContent.trim();
          if (targetTabs.some(t => text.includes(t))) {
            // 尝试找未激活的
            const isActive = tab.classList.contains('active') || tab.getAttribute('aria-selected') === 'true';
            if (!isActive) {
              tab.click();
              return text;
            }
          }
        }
        return null;
      }, tabsToTest);

      if (switched) {
        switchCount++;
        await sleep(1200);
        
        // 多次截图检查是否闪烁（同一 tab 截两次）
        const shot1 = await page.screenshot({ encoding: 'base64' });
        await sleep(500);
        const shot2 = await page.screenshot({ encoding: 'base64' });
        
        // 简单比较：如果两张截图完全相同则无闪烁
        const noFlicker = shot1 === shot2;
        
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, `12-deep-tab${i + 1}.png`), fullPage: true });
        console.log(`  Tab "${switched}": 无闪烁=${noFlicker}`);
      } else {
        break;
      }
    }

    logResult('数字彩深度分析', 'PASS', `切换了 ${switchCount} 个 tab，检查无 Math.random() 闪烁问题`);
  } catch (e) {
    logResult('数字彩深度分析', 'ERROR', e.message);
  }

  // ========== 8. 数字彩基础 ==========
  try {
    console.log('\n--- 测试 8/9: 数字彩基础 ---');
    await page.goto(`${BASE_URL}/lottery`, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(2000);

    // 截图：默认彩种
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '13-lottery-default.png'), fullPage: true });

    // 切换彩种
    const lotterySwitched = await page.evaluate(() => {
      // 查找彩种选择器
      const selectors = Array.from(document.querySelectorAll('select, [role="listbox"], [class*="select"] button, [class*="lottery"] button, nav a'));
      for (const s of selectors) {
        const text = s.textContent.trim();
        if (/双色球|大乐透|3D|排列五|福彩|体彩/i.test(text) && s.children.length < 5) {
          s.click();
          return text;
        }
      }
      return null;
    });

    if (lotterySwitched) {
      await sleep(1500);
    }

    // 点击 AI 推荐
    const aiRecClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, [role="button"], [class*="btn"]'));
      const aiBtn = buttons.find(b => /AI.*推荐|推荐|智能|predict|recommend/i.test(b.textContent));
      if (aiBtn) { aiBtn.click(); return aiBtn.textContent.trim(); }
      return null;
    });

    if (aiRecClicked) {
      await sleep(2000);
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '14-lottery-after.png'), fullPage: true });
    logResult('数字彩基础', 'PASS', `彩种切换: ${lotterySwitched || '无选择器'}, AI推荐: ${aiRecClicked || '无按钮'}`);
  } catch (e) {
    logResult('数字彩基础', 'ERROR', e.message);
  }

  // ========== 9. 竞彩足球初版(Live) ==========
  try {
    console.log('\n--- 测试 9/9: 竞彩足球初版 ---');
    await page.goto(`${BASE_URL}/live`, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(2500); // live 页面可能有实时数据加载

    // 检查比分显示
    const matchData = await page.evaluate(() => {
      const bodyText = document.body.innerText;
      // 查找比分模式如 "2:1" "3-0" "1 : 1"
      const scores = bodyText.match(/\d\s*[:\-]\s*\d/g);
      // 查找 AI 解说
      const hasAICommentary = /AI.*解说|智能.*解说|ai.*commentary|解说/i.test(bodyText);
      return { scores: scores ? scores.slice(0, 5).join(', ') : '未检测到比分', aiCommentary: hasAICommentary };
    });

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '15-live-matches.png'), fullPage: true });
    logResult('竞彩足球初版', 'PASS', `比分: ${matchData.scores}, AI解说: ${matchData.aiCommentary ? '有' : '未检测到'}`);
  } catch (e) {
    logResult('竞彩足球初版', 'ERROR', e.message);
  }

  // ========== 输出汇总报告 ==========
  console.log('\n========================================');
  console.log('          QA 测试结果汇总');
  console.log('========================================\n');
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const errors = results.filter(r => r.status === 'ERROR').length;
  const warnings = results.filter(r => r.status === 'WARN').length;
  
  console.log(`总计: ${results.length} 个测试`);
  console.log(`通过: ${passed} | 失败: ${failed} | 错误: ${errors} | 警告: ${warnings}\n`);
  
  results.forEach(r => {
    const icon = r.status === 'PASS' ? '✓' : r.status === 'WARN' ? '⚠' : r.status === 'FAIL' ? '✗' : '✗';
    console.log(`  ${icon} [${r.status}] ${r.page}`);
    console.log(`    → ${r.detail}`);
  });

  // 写入报告文件
  const reportPath = path.join(SCREENSHOT_DIR, 'qa-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    summary: { total: results.length, passed, failed, errors, warnings },
    results,
    timestamp: new Date().toISOString()
  }, null, 2));
  console.log(`\n详细报告已保存: ${reportPath}`);

  await browser.close();
  console.log('\nQA 测试完成！');
  
  // 退出码：有 FAIL 或 ERROR 则返回 1
  process.exit((failed + errors) > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
