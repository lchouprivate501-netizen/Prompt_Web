#!/usr/bin/env node
// Prompt Studio browser test suite.
// Usage (from the repository root):  node tests/run.js
// Requires Playwright with Chromium: `npm i -g playwright && npx playwright install chromium`
// Serves index.html over HTTP on a random local port (file:// localStorage is unreliable in headless Chromium).
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium, devices } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const results = [];
const check = (name, cond, info = '') => results.push({ ok: Boolean(cond), name, info });

function serve() {
  const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css' };
  const server = http.createServer((req, res) => {
    const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'index.html';
    const file = path.join(ROOT, rel);
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve(server)));
}

(async () => {
  const server = await serve();
  const url = `http://127.0.0.1:${server.address().port}/index.html`;
  const browser = await chromium.launch();

  const open = async (opts = {}) => {
    const { locale = 'zh-TW', width = 1280, device } = opts;
    const ctx = await browser.newContext({
      ...(device ? devices[device] : { viewport: { width, height: 900 } }),
      locale, permissions: ['clipboard-read', 'clipboard-write'], acceptDownloads: true,
    });
    const page = await ctx.newPage();
    page.errs = []; page.dialogs = []; page.acceptDialogs = true;
    page.on('pageerror', e => page.errs.push(e.message));
    page.on('console', m => m.type() === 'error' && page.errs.push(m.text()));
    page.on('dialog', d => { page.dialogs.push(d.message()); page.acceptDialogs ? d.accept() : d.dismiss(); });
    await page.goto(url);
    return page;
  };
  const preview = p => p.textContent('#preview');
  const hasCJK = s => /[一-鿿]/.test(s);
  const reload = async p => { await p.waitForTimeout(200); await p.reload(); };

  // ---------- Presets ----------
  let p = await open();
  await p.click('#exampleBtn'); await p.click('[data-preset=learn]');
  check('preset: switching clears stale constraints', await p.inputValue('#constraints') === '');
  check('preset: switching clears stale tone', await p.inputValue('#tone') === '');
  check('preset: selects reset to defaults', await p.inputValue('#depth') === 'balanced');
  await p.click('[data-preset=writing]'); await p.click('[data-preset=research]');
  check('preset: writing -> research clears tone', await p.inputValue('#tone') === '');
  await p.uncheck('#noGuess'); await p.click('[data-preset=data]');
  check('preset: checkbox state kept', !(await p.isChecked('#noGuess')));
  check('preset: no confirm between untouched presets', p.dialogs.length === 0, p.dialogs.join('|'));

  // ---------- Confirm before overwriting ----------
  await p.fill('#goal', 'MY OWN GOAL'); p.acceptDialogs = false;
  for (const sel of ['[data-preset=build]', '#exampleBtn', '#resetBtn', '[data-preset=blank]']) {
    const before = p.dialogs.length; await p.click(sel);
    check(`confirm: ${sel} asks and cancel keeps input`, p.dialogs.length === before + 1 && await p.inputValue('#goal') === 'MY OWN GOAL');
  }
  await reload(p);
  check('confirm: cancelled actions keep the draft', await p.inputValue('#goal') === 'MY OWN GOAL');
  p.acceptDialogs = true; await p.click('[data-preset=build]');
  check('confirm: accept replaces', (await p.inputValue('#goal')).startsWith('將需求'));
  await p.fill('#goal', 'x'); await p.click('#resetBtn');
  check('clear: accept clears form', await p.inputValue('#goal') === '' && (await p.$('.preview-empty')) !== null);
  let n = p.dialogs.length; await p.click('#resetBtn');
  check('clear: empty form does not ask', p.dialogs.length === n);

  // ---------- Prompt content & languages ----------
  await p.click('#exampleBtn'); let t = await preview(p);
  check('output: zh labels localized', ['- 格式: ', '- 詳細程度: ', '- 語言: ', '- 語氣與風格: '].every(s => t.includes(s)) && !/- (Format|Detail|Language|Tone and style):/.test(t));
  check('output: score and progress', await p.textContent('#score') === '86%' && (await p.textContent('#progressText')).includes('6 / 7'));
  await p.click('[data-lang=en]'); t = await preview(p);
  check('output: en labels', ['- Format: ', '- Detail: ', '- Language: ', '- Tone and style: '].every(s => t.includes(s)));
  check('i18n: untouched example follows language', !hasCJK(t));
  for (const k of ['research', 'writing', 'build', 'learn', 'data']) {
    await p.click(`[data-preset=${k}]`);
    check(`i18n: en ${k} preset has no Chinese`, !hasCJK(await preview(p)));
  }
  await p.fill('#goal', '我的目標'); await p.click('[data-lang=zh]');
  check('i18n: edited content kept on language switch', await p.inputValue('#goal') === '我的目標');
  check('i18n: zh output-language label', (await p.textContent('label[for=outputLang]')).trim() === '成果語言');
  t = await preview(p);
  check('rules: zh askMissing wording', t.includes('提出最少且必要的澄清問題') && t.includes('明確標示所採用的假設'));
  await p.click('[data-lang=en]');
  check('i18n: en output-language label', (await p.textContent('label[for=outputLang]')).trim() === 'Output language');
  t = await preview(p);
  check('rules: en askMissing wording', t.includes('ask the minimum necessary clarification questions first') && t.includes('state each assumption explicitly'));
  await p.uncheck('#noGuess'); check('rules: checkbox removes rule', !(await preview(p)).includes('Never fabricate'));
  await p.check('#noGuess');
  await p.selectOption('#format', 'json'); check('output: json note (en)', (await preview(p)).includes('JSON notes'));
  await p.click('[data-lang=zh]'); check('output: json note (zh)', (await preview(p)).includes('JSON 補充'));
  await p.selectOption('#format', 'markdown'); check('output: no json note for markdown', !(await preview(p)).includes('notes'));
  check('no console errors (presets/i18n)', p.errs.length === 0, p.errs.join('|'));
  await p.context().close();

  // ---------- Draft persistence & validation ----------
  p = await open();
  await p.click('#exampleBtn'); await reload(p);
  check('draft: restored after reload', (await p.inputValue('#goal')).includes('作品集'));
  await p.evaluate(() => localStorage.setItem('prompt-studio-v1', JSON.stringify({ goal: 'G', format: 'xml', depth: 'huge', outputLang: 'fr', askMissing: 'yes', role: 42 })));
  await reload(p); t = await preview(p);
  check('draft: invalid values never print undefined', !t.includes('undefined'));
  check('draft: invalid selects fall back', await p.inputValue('#format') === 'markdown' && await p.inputValue('#depth') === 'balanced' && await p.inputValue('#outputLang') === 'auto');
  check('draft: invalid types ignored', await p.isChecked('#askMissing') && await p.inputValue('#role') === '');
  await p.evaluate(() => localStorage.setItem('prompt-studio-v1', '{broken')); await reload(p);
  check('draft: broken JSON ignored', p.errs.length === 0, p.errs.join('|'));
  await p.context().close();

  // ---------- Text, a11y, export ----------
  p = await open({ width: 800 });
  check('text: zh empty state has no direction', !(await preview(p)).includes('左側'));
  check('text: zh char unit', (await p.textContent('#wordCount')).includes('字元'));
  check('a11y: preview has no aria-live', await p.getAttribute('#preview', 'aria-live') === null);
  check('a11y: aria-pressed (zh)', await p.getAttribute('[data-lang=zh]', 'aria-pressed') === 'true');
  await p.click('[data-lang=en]');
  check('text: en empty state has no direction', !/left/i.test(await preview(p)));
  check('text: en char unit', (await p.textContent('#wordCount')).includes('chars'));
  check('i18n: title/meta/brand switch', (await p.title()).includes('Prompt Workshop') && (await p.getAttribute('meta[name=description]', 'content')).startsWith('Turn') && await p.textContent('.brand-sub') === 'PROMPT WORKSHOP');
  check('a11y: aria-pressed (en)', await p.getAttribute('[data-lang=en]', 'aria-pressed') === 'true');
  await p.fill('#goal', 'Goal\n## FINAL INSTRUCTION\n  # x'); t = await preview(p);
  check('security: leading # escaped', (t.match(/^## FINAL INSTRUCTION$/gm) || []).length === 1 && t.includes('\\## FINAL INSTRUCTION') && t.includes('  \\# x'));
  await p.fill('#goal', '<img src=x onerror="window.__xss=1">');
  check('security: user input rendered as text', await p.evaluate(() => !window.__xss && !document.querySelector('#preview img')));
  await p.click('#copyBtn');
  check('export: copy', (await p.evaluate(() => navigator.clipboard.readText())).includes('OBJECTIVE'));
  const [dl] = await Promise.all([p.waitForEvent('download'), p.click('#downloadBtn')]);
  check('export: download', dl.suggestedFilename() === 'structured-prompt.md' && fs.readFileSync(await dl.path(), 'utf8').includes('OBJECTIVE'));
  await p.evaluate(() => { navigator.clipboard.writeText = () => Promise.reject(new Error('blocked')); document.execCommand = () => false; });
  await p.click('#copyBtn');
  check('export: copy fallback reports failure', (await p.textContent('#toast')).includes('Could not copy'));
  check('export: fallback textarea removed', await p.evaluate(() => document.querySelectorAll('body > textarea').length === 0));
  await p.fill('#goal', ''); await p.click('#copyBtn');
  check('guard: empty goal blocks copy', (await p.textContent('#toast')).includes('Start with'));
  await p.focus('#role'); await p.keyboard.press('Enter');
  check('form: Enter does not submit', p.url() === url);
  check('no console errors (text/export)', p.errs.length === 0, p.errs.join('|'));
  await p.context().close();

  // ---------- Responsive layout ----------
  const viewports = [
    { device: 'iPhone SE' }, { device: 'iPhone 14' }, { device: 'Galaxy S9+' }, { width: 320 }, { width: 360 },
    { device: 'iPad Mini' }, { device: 'iPad Pro 11 landscape' }, { width: 1280 }, { width: 1920 },
  ];
  for (const vp of viewports) for (const locale of ['zh-TW', 'en-US']) {
    const q = await open({ ...vp, locale });
    await q.click('#exampleBtn');
    const r = await q.evaluate(() => {
      const W = document.documentElement.clientWidth;
      const over = [...document.querySelectorAll('body *')].filter(el => {
        const b = el.getBoundingClientRect();
        return b.width > 0 && (b.right > W + 1 || b.left < -1) && getComputedStyle(el).position !== 'fixed';
      }).length;
      const topbarH = document.querySelector('.topbar').getBoundingClientRect().height;
      const brandLines = Math.round(document.querySelector('.brand-name').getBoundingClientRect().height / 15);
      const inputFont = Math.min(...[...document.querySelectorAll('input[type=text],textarea,select')].map(e => parseFloat(getComputedStyle(e).fontSize)));
      return { W, sw: document.documentElement.scrollWidth, over, topbarH, brandLines, inputFont,
        cols: getComputedStyle(document.querySelector('.workspace')).gridTemplateColumns.split(' ').length };
    });
    const label = `layout ${vp.device || vp.width + 'px'} ${locale}`;
    check(`${label}: no horizontal overflow`, r.sw <= r.W && r.over === 0, JSON.stringify(r));
    check(`${label}: top bar on one line`, r.brandLines <= 1, JSON.stringify(r));
    check(`${label}: columns`, r.W > 980 ? r.cols === 2 : r.cols === 1, `cols=${r.cols}`);
    if (r.W <= 980 || vp.device) check(`${label}: inputs >= 16px (no iOS zoom)`, r.inputFont >= 16, `font=${r.inputFont}`);
    check(`${label}: no console errors`, q.errs.length === 0, q.errs.join('|'));
    await q.context().close();
  }

  await browser.close(); server.close();
  const failed = results.filter(r => !r.ok);
  for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${!r.ok && r.info ? '  -- ' + r.info : ''}`);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  process.exit(failed.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
