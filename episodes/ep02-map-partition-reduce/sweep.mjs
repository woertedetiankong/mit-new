// render every 0.1 s of the whole timeline and report any exception, before spending minutes on record.mjs
import { chromium } from 'playwright-core';
const b = await chromium.launch({executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const p = await b.newPage({viewport: {width: 1920, height: 1080}});
await p.goto('file://' + process.cwd() + '/index.html?record'); await p.evaluate(() => ready);
const r = await p.evaluate(() => { const errs = []; for (let t = 0; t < TL.total; t += .1) { try { render(t); } catch (e) { errs.push(t.toFixed(1) + ': ' + e.message); if (errs.length > 5) break; } } return errs; });
console.log(r.length ? r.join('\n') : 'sweep ok'); await b.close();
