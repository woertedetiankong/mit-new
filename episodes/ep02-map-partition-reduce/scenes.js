/* =========================================================
   Episode 2 — The MapReduce Model: Map, Partition, Reduce   (remake 2026-11-18: conclusion first, one framework page)
   Colour legend (the whole episode):
     sky    = map tasks (the grid's rows, one per book) · page part A
     gold   = the data: pairs, counts, and the word we follow, "of" · page part B and "of"'s path
     violet = reduce buckets (the grid's columns) and ihash · page part C
     coral  = the gate (reduce waits for every map), and toy labels · page part D
     mint   = reduce, output and checks that pass · page part E
     red    = what goes wrong
   Every number comes from ep02_data.js (data.py: mrsequential + a partitioned run with nReduce = 10, the code cuts,
   and toy.py's toy examples).
   ========================================================= */
const SCN = {};



/* ---------- helpers (same as episode 1) ---------- */
const fi = (lt, t, d = .5) => eo(ramp(lt, t, t + d));
const fo = (lt, t, d = .5) => 1 - ramp(lt, t, t + d);
const win = (lt, t0, t1, d = .45) => fi(lt, t0, d) * (t1 === undefined ? 1 : fo(lt, t1 - d, d));
const fmtN = n => Math.round(n).toLocaleString('en-US');
const hex = n => '0x' + n.toString(16).padStart(8, '0');
const zt = (s, x, y, o = {}) => text(s, x, y, {font: F.zh, size: 22, color: C.dim, ...o});
function line(x1, y1, x2, y2, color, lw = 2, a = 1, dash) { if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = color; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.restore(); }
function note(en, zh, x, y, o = {}) {
  const a = o.alpha ?? 1, c = o.color || C.ink, al = o.align || 'center', s = o.size || 26;
  text(en, x, y, {size: s, weight: 600, color: c, align: al, alpha: a});
  text(zh, x, y + s * 1.1, {size: s * .74, font: F.zh, color: C.dim, align: al, alpha: a});
}
const epTag = (n, x, y, a, c = C.dim) => tag(`→ ep${String(n).padStart(2, '0')} · 第 ${n} 集`, x, y, c, {size: 18, alpha: a});
const inR = (n, a, b) => n >= a && n <= b ? 1 : 0;
function srcView(x, y, w, key, o = {}) {
  const S = D.code[key], a = o.alpha ?? 1, lh = o.lh || 30, fs = o.size || 18;
  const rows = S.lines.map((s, i) => [S.from + i, s.replace(/\t/g, '    ')]);
  const head = 58, h = head + rows.length * lh + 12;
  if (a <= 0) return {ys: {}, h};
  if (a > .5) codeShown({key, file: S.file, a: S.from, b: S.to, fn: o.fn});
  panel(x + w / 2, y + h / 2, w, h, {alpha: a, fill: '#0E1628', edge: rgba(C.faint, .9), lw: 1.5});
  const dir = S.file.slice(0, S.file.lastIndexOf('/') + 1), f = S.file.slice(dir.length);
  ctx.save(); ctx.font = `500 17px ${F.mono}`; const dw = ctx.measureText(dir).width; ctx.font = `700 20px ${F.mono}`; const fw = ctx.measureText(f).width; ctx.restore();
  text(dir, x + 22, y + 29, {size: 17, font: F.mono, color: C.dim, align: 'left', alpha: a});
  text(f, x + 22 + dw, y + 29, {size: 20, font: F.mono, weight: 700, color: C.ink, align: 'left', alpha: a});
  text(`  L${S.from}` + (S.to > S.from ? `–${S.to}` : '') + (o.fn ? '  ·  ' + o.fn : ''), x + 22 + dw + fw, y + 29, {size: 18, font: F.mono, weight: 700, color: C.gold, align: 'left', alpha: a});
  const ys = {}, notes = [];
  rows.forEach(([n, s], i) => {
    const ly = y + head + i * lh + lh / 2; ys[n] = ly;
    const k = o.hl ? o.hl(n) : 0, c = o.hc ? o.hc(n) : C.gold;
    if (k > 0) { ctx.save(); ctx.globalAlpha *= a * k; rr(x + 10, ly - lh / 2 + 2, w - 20, lh - 4, 5); ctx.fillStyle = rgba(c, .16); ctx.fill(); ctx.fillStyle = c; ctx.fillRect(x + 10, ly - lh / 2 + 4, 4, lh - 8); ctx.restore(); }
    const dim = o.hl ? .42 + .58 * Math.max(k, o.base ?? 0) : 1, cm = /^\s*(\/\/|#)/.test(s);
    text(String(n), x + 64, ly, {size: 15, font: F.code, color: k > 0 ? C.ink : C.faint, align: 'right', alpha: a});
    text(s, x + 82, ly, {size: fs, font: F.code, color: cm ? C.dim : C.ink, align: 'left', alpha: a * dim});
    const m = o.mark && o.mark(n);
    if (m && m[2] > 0) {
      ctx.save(); ctx.font = `500 ${fs}px ${F.code}`; const lw = ctx.measureText(s).width; ctx.font = `700 16px ${F.mono}`; const tw = ctx.measureText(m[0]).width + 28; ctx.restore();
      if (x + 82 + lw + 20 < x + w - 18 - tw) tag(m[0], x + w - 18 - tw / 2, ly, m[1], {size: 16, alpha: a * m[2]});
      else notes.push([n, m, tw]);
    }
  });
  notes.forEach(([n, m, tw], i) => { const ny = y + h + 24 + i * 38;
    text('L' + n, x + 18, ny, {size: 16, font: F.code, color: m[1], align: 'left', alpha: a * m[2]});
    tag(m[0], x + 78 + tw / 2, ny, m[1], {size: 16, alpha: a * m[2]}); });
  return {ys, h};
}

/* ---------- the episode's picture: the 8 × 10 grid of mr-X-Y ---------- */
const ST = D.st, FILES = ST.files.map(f => f.replace(/^pg-|\.txt$/g, ''));
const BT = {being_ernest: 'Earnest', dorian_gray: 'Dorian Gray', frankenstein: 'Frankenstein', grimm: 'Grimm', huckleberry_finn: 'Huck Finn', metamorphosis: 'Metamorphosis', sherlock_holmes: 'Sherlock', tom_sawyer: 'Tom Sawyer'};
const BZ = {being_ernest: '认真的重要', dorian_gray: '道林·格雷', frankenstein: '弗兰肯斯坦', grimm: '格林童话', huckleberry_finn: '哈克贝利', metamorphosis: '变形记', sherlock_holmes: '福尔摩斯', tom_sawyer: '汤姆·索亚'};
const OF = ST.track.of, B_OF = ST.bucket.of;
// G = {x, y, cw, ch}: top-left of cell (0,0); returns the cell centre
const cellXY = (G, r, c) => ({x: G.x + c * G.cw + G.cw / 2, y: G.y + r * G.ch + G.ch / 2});
// o.a overall alpha; o.cell(r, c) → {k: 0..1 lit, color, label}; o.rows / o.cols: label alpha; o.small: compact labels
function grid(G, o = {}) {
  const a = o.alpha ?? 1; if (a <= 0) return;
  for (let r = 0; r < 8; r++) for (let c = 0; c < 10; c++) {
    const p = cellXY(G, r, c), cl = o.cell ? o.cell(r, c) : null, k = cl ? cl.k : 0, col = cl && cl.color || C.gold;
    const ka = a * (o.reveal ? o.reveal(r, c) : 1); if (ka <= 0) continue;
    ctx.save(); ctx.globalAlpha *= ka; rr(p.x - G.cw / 2 + 3, p.y - G.ch / 2 + 3, G.cw - 6, G.ch - 6, 6);
    ctx.fillStyle = k > 0 ? mixHex(C.panel2, col, .35 * k) : C.panel; ctx.fill();
    ctx.lineWidth = k > 0 ? 2 : 1.2; ctx.strokeStyle = k > 0 ? rgba(col, .4 + .6 * k) : rgba(C.faint, .8); if (cl && cl.dash) ctx.setLineDash([5, 4]); ctx.stroke(); ctx.restore();
    if (cl && cl.label) text(cl.label, p.x, p.y, {size: cl.size || Math.min(18, G.ch * .38), font: F.mono, weight: 700, color: cl.tc || (k > .5 ? C.ink : C.dim), alpha: ka * (cl.la ?? 1)});
  }
  const ra = a * (o.rows ?? 1), ca = a * (o.cols ?? 1);
  for (let r = 0; r < 8; r++) { const p = cellXY(G, r, 0), hot = o.row === r ? 1 : 0;
    text((o.small ? '' : 'map ') + r, G.x - 16, p.y - (o.small ? 0 : 8), {size: o.small ? 15 : 17, font: F.mono, weight: 700, color: hot ? C.sky : rgba(C.sky, .75), align: 'right', alpha: ra});
    if (!o.small) text(BT[FILES[r]], G.x - 16, p.y + 12, {size: 13, font: F.mono, color: C.dim, align: 'right', alpha: ra}); }
  for (let c = 0; c < 10; c++) { const p = cellXY(G, 0, c), hot = o.col === c;
    text(String(c), p.x, G.y - 18, {size: o.small ? 15 : 18, font: F.mono, weight: 700, color: hot ? C.violet : rgba(C.violet, .7), alpha: ca}); }
  if (!o.small && (o.axis ?? 1) > 0) {
    text('map task X · map 任务', G.x - 16, G.y - 50, {size: 16, font: F.zh, color: C.sky, align: 'right', alpha: a * (o.axis ?? 1)});
    text('reduce bucket Y · reduce 桶', G.x + 5 * G.cw, G.y - 50, {size: 16, font: F.zh, color: C.violet, alpha: a * (o.axis ?? 1)});
  }
}
const G_FULL = {x: 470, y: 300, cw: 100, ch: 56};

/* =========================================================
   The framework page: one pass of the mechanism, top to bottom (parts A–E), "of"'s path beside it.
   Drawn in page coordinates (PW × PH); shown through a clipped window under the heading, with a camera
   that sits at reading size (s = 1) on the part being narrated and pulls back to the whole page (s ≈ .47)
   only to show its shape. Every code line on it is cut from 6.5840 at 513cac0 by data.py (pgA … pgE3).
   ========================================================= */
const PW = 1840, BH = 195, BG = 215, PH = 20 + 5 * BG;
const bandY = i => 20 + i * BG, bandC = i => bandY(i) + BH / 2;
const PART = [
  {L: 'A', c: C.sky,    en: '8 books → 8 map tasks',    zh: '八本书 → 八个 map 任务',   s: 'A books 书'},
  {L: 'B', c: C.gold,   en: 'Map: one pair per word',   zh: 'Map：每个词一对',          s: 'B Map'},
  {L: 'C', c: C.violet, en: 'pick a column: ihash % 10', zh: '选列：ihash % 10',        s: 'C ihash'},
  {L: 'D', c: C.coral,  en: 'the gate: all maps done?', zh: '闸门：map 都做完了吗？',    s: 'D gate 闸门'},
  {L: 'E', c: C.mint,   en: 'reducer Y reads column Y', zh: '第 Y 个 reducer 读第 Y 列', s: 'E reduce'},
];
const OFTAG = [['"of": all 8 books', '八本书里都有'], ['2,746 × (of, 1)', '《弗兰肯斯坦》这一行'], ['ihash → 6', '1,765,031,016 % 10'],
               ['column 6: 8 / 8 ✓', 'map 7 late → −1,565'], ['of 13536', 'mr-out-6']];
const WIN = {x: 40, y: 298, w: 1840, h: 534};
const CAM_FULL = {x: PW / 2, y: PH / 2, s: Math.min(WIN.w / PW, WIN.h / PH) * .97};
const camAt = (yc, s = 1) => ({x: PW / 2, y: clamp(yc, WIN.h / 2 / s, PH - WIN.h / 2 / s), s});
const camBand = i => camAt(bandC(i));
const camBands = (i, j) => camAt((bandC(i) + bandC(j)) / 2);
// keys: [[t, cam], …] in time order; glides 1.2 s into each key
function camPath(lt, keys, glide = 1.2) {
  let k = 0; for (let i = 0; i < keys.length; i++) if (lt >= keys[i][0]) k = i;
  const cur = keys[k][1], prev = keys[Math.max(0, k - 1)][1], u = k === 0 ? 1 : eio(ramp(lt, keys[k][0], keys[k][0] + glide));
  return {x: lerp(prev.x, cur.x, u), y: lerp(prev.y, cur.y, u), s: lerp(prev.s, cur.s, u)};
}
function onPage(cam, fn) {
  ctx.save(); ctx.beginPath(); ctx.rect(WIN.x, WIN.y, WIN.w, WIN.h); ctx.clip();
  ctx.translate(WIN.x + WIN.w / 2, WIN.y + WIN.h / 2); ctx.scale(cam.s, cam.s); ctx.translate(-cam.x, -cam.y);
  fn(); ctx.restore();
}
// the two sentences: the page's heading, which stays put while the board moves under it
function heading(a1, a2) {
  text('Every pair from book X goes into file mr-X-Y, where Y is the word\'s hash, mod 10.', 960, 186, {size: 25, weight: 600, color: C.ink, alpha: a1});
  text('第 X 本书的每个词对，都进文件 mr-X-Y；Y 是这个词的哈希值对 10 取余。', 960, 216, {size: 18, font: F.zh, color: C.dim, alpha: a1});
  text('When every book is done, reducer Y reads column Y: every copy of its words, and nobody else\'s.', 960, 252, {size: 25, weight: 600, color: C.ink, alpha: a2});
  text('等所有书都做完，第 Y 个 reducer 读第 Y 列：它那些词的全部副本，别人的一个也没有。', 960, 280, {size: 18, font: F.zh, color: C.dim, alpha: a2});
}
// verbatim lines from D.code, with real line numbers; keys separated by '…' rows when they are not contiguous
function pageCode(x, y, keys, a, o = {}) {
  const lh = o.lh || 24, fs = o.size || 16; let row = 0, last = null;
  const f0 = D.code[keys[0]].file;
  text(`${f0}`, x, y, {size: 15, font: F.mono, color: C.dim, align: 'left', alpha: a});
  for (const k of keys) { const S = D.code[k];
    if (a > .5) codeShown({key: 'page-' + k, file: S.file, a: S.from, b: S.to});
    if (last !== null && S.from > last + 1) { text('…', x + 40, y + 28 + row * lh, {size: fs, font: F.code, color: C.faint, align: 'left', alpha: a}); row++; }
    S.lines.forEach((s, i) => { const ly = y + 28 + row * lh;
      text(String(S.from + i), x + 30, ly, {size: 13, font: F.code, color: C.faint, align: 'right', alpha: a});
      text(s.replace(/\t/g, '    '), x + 40, ly, {size: fs, font: F.code, color: /^\s*\/\//.test(s) ? C.dim : C.ink, align: 'left', alpha: a}); row++; });
    last = S.to; }
}
// o.p[i]: build alpha of part i · o.hot: parts read now (array) · o.of: how many of "of"'s tags are lit (fractional)
// o.badge: {i: n} takeaway number shown beside part i · o.t: scene time (for pulses)
function board(o) {
  const hot = o.hot || [], anyHot = hot.length > 0;
  // "of"'s path: a gold line down the tag column
  const ofx = 1025;
  for (let i = 0; i < 4; i++) { const k = clamp((o.of ?? 0) - (i + 1), 0, 1); if (k > 0) line(ofx, bandY(i) + 150, ofx, bandY(i) + 150 + (BG - 100) * eo(k), C.gold, 3, .8); }
  PART.forEach((P, i) => {
    const a = o.p ? o.p[i] : 1; if (a <= 0) return;
    const y0 = bandY(i), yc = y0 + BH / 2, isHot = hot.includes(i), dim = anyHot && !isHot ? .42 : 1, ka = a * dim;
    panel(PW / 2, yc, PW, BH, {alpha: a, fill: isHot ? mixHex(C.panel, P.c, .08) : C.panel, edge: isHot ? rgba(P.c, .95) : rgba(C.faint, .8), lw: isHot ? 3 : 1.5});
    ctx.save(); ctx.globalAlpha *= ka; ctx.beginPath(); ctx.arc(62, yc, 34, 0, Math.PI * 2); ctx.fillStyle = rgba(P.c, .18); ctx.fill(); ctx.strokeStyle = P.c; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
    text(P.L, 62, yc + 2, {size: 40, font: F.disp, weight: 700, color: P.c, alpha: ka});
    text(P.en, 116, yc - 18, {size: 25, weight: 600, color: C.ink, align: 'left', alpha: ka});
    text(P.zh, 116, yc + 16, {size: 19, font: F.zh, color: C.dim, align: 'left', alpha: ka});
    if (o.badge && o.badge[i]) { const kb = o.badge[i][1]; ctx.save(); ctx.globalAlpha *= a * kb; ctx.beginPath(); ctx.arc(400, y0 + 34, 20, 0, Math.PI * 2); ctx.fillStyle = C.gold; ctx.fill(); ctx.restore();
      text(String(o.badge[i][0]), 400, y0 + 35, {size: 22, font: F.mono, weight: 700, color: C.bg, alpha: a * kb}); }
    partPicture(i, y0, ka, o);
    // "of"'s tag for this part
    const kof = clamp((o.of ?? 0) - i, 0, 1) * a;
    if (kof > 0) { rr(ofx - 85, y0 + 62, 170, 76, 10); ctx.save(); ctx.globalAlpha *= kof; ctx.fillStyle = rgba(C.gold, .14); ctx.fill(); ctx.strokeStyle = rgba(C.gold, .8); ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
      text(OFTAG[i][0], ofx, y0 + 88, {size: 17, font: F.mono, weight: 700, color: C.gold, alpha: kof});
      text(OFTAG[i][1], ofx, y0 + 115, {size: 15, font: F.zh, color: i === 3 ? C.coral : C.dim, alpha: kof}); }
    else text(P.L, ofx, y0 + 100, {size: 18, font: F.mono, color: C.faint, alpha: a * .6});
    partCode(i, y0, ka);
  });
}
function partPicture(i, y0, a, o) {
  if (a <= 0) return; const yc = y0 + BH / 2, lit = (o.of ?? 0) > i;
  if (i === 0) {
    for (let k = 0; k < 8; k++) { const x = 470 + k * 56, hot = lit && k === 2;
      fileIcon(x, yc - 18, 32, 42, {color: hot ? C.gold : C.sky, alpha: a, rows: 0, glow: hot ? .5 : 0});
      text('map ' + k, x, yc + 22, {size: 15, font: F.mono, color: hot ? C.gold : C.dim, alpha: a}); }
    text('M = 8 · one row per book · 一本书一行', 666, yc + 64, {size: 17, font: F.zh, color: C.sky, alpha: a});
  } else if (i === 1) {
    fileIcon(475, yc - 10, 40, 52, {color: C.sky, alpha: a, rows: 3, seed: 2});
    arrow({x: 505, y: yc - 10}, {x: 560, y: yc - 10}, C.gold, {alpha: a, lw: 2, head: 10});
    text('Map', 532, yc - 34, {size: 15, font: F.code, color: C.gold, alpha: a});
    ['(of, 1)', '(the, 1)', '(of, 1)', '…'].forEach((s, k) => text(s, 600 + k * 82, yc - 10, {size: 16, font: F.code, weight: 700, color: s.includes('of') && lit ? C.gold : C.ink, align: 'left', alpha: a}));
    text('the word, and "1" · 词，和 "1"', 680, yc + 52, {size: 17, font: F.zh, color: C.gold, alpha: a});
  } else if (i === 2) {
    text('(of, 1)', 470, yc - 20, {size: 16, font: F.code, weight: 700, color: lit ? C.gold : C.ink, align: 'left', alpha: a});
    text('ihash % 10', 470, yc + 8, {size: 17, font: F.code, color: C.violet, align: 'left', alpha: a});
    text('= 6', 470, yc + 34, {size: 18, font: F.code, weight: 700, color: C.violet, align: 'left', alpha: a});
    const Gm = {x: 690, y: y0 + 40, cw: 22, ch: 15};
    grid(Gm, {alpha: a, small: true, rows: .8, cols: .8, col: 6, cell: (r, c) => r === 2 && c === 6 ? {k: 1, color: C.gold} : c === 6 ? {k: .35, color: C.violet} : null});
    text('mr-2-6', 690 + 6.5 * 22 + 52, y0 + 40 + 2.5 * 15, {size: 15, font: F.mono, weight: 700, color: C.gold, alpha: a * (lit ? 1 : .6)});
    arrow({x: 690 + 6.5 * 22 + 26, y: y0 + 40 + 2.5 * 15}, {x: 690 + 6.5 * 22 + 6, y: y0 + 40 + 2.5 * 15}, C.gold, {alpha: a * (lit ? 1 : .6), lw: 1.5, head: 7});
  } else if (i === 3) {
    for (let k = 0; k < 8; k++) { const x = 480 + k * 44, late = k === 7 && o.late;
      rr(x - 16, yc - 60, 32, 30, 6); ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = late ? rgba(C.coral, .2) : rgba(C.mint, .16); ctx.fill(); ctx.strokeStyle = late ? C.coral : rgba(C.mint, .8); ctx.lineWidth = 1.5; if (late) ctx.setLineDash([4, 3]); ctx.stroke(); ctx.restore();
      text(late ? '…' : '✓', x, yc - 45, {size: 16, font: F.mono, weight: 700, color: late ? C.coral : C.mint, alpha: a});
      text(String(k), x, yc - 72, {size: 12, font: F.mono, color: C.dim, alpha: a}); }
    line(462, yc - 18, 816, yc - 18, C.coral, 4, a);
    text('all 8 done → open · 全部完成 → 开', 470, yc + 14, {size: 17, font: F.zh, color: C.mint, align: 'left', alpha: a});
    text('any still running → wait · 有一个没完 → 等', 470, yc + 42, {size: 17, font: F.zh, color: C.coral, align: 'left', alpha: a});
    text("the lab's rule, not given code · Lab 的规定", 470, yc + 72, {size: 15, font: F.zh, color: C.dim, align: 'left', alpha: a});
  } else {
    for (let k = 0; k < 4; k++) fileIcon(468 + k * 6, yc - 24 + k * 6, 30, 38, {color: C.violet, alpha: a, rows: 0});
    text('mr-0-6 … mr-7-6', 488, yc + 38, {size: 15, font: F.mono, color: C.dim, alpha: a});
    const st = [['sort', 590], ['group', 680], ['Reduce', 780]];
    st.forEach(([s, x], k) => { arrow({x: x - 50, y: yc - 10}, {x: x - 22, y: yc - 10}, C.mint, {alpha: a, lw: 2, head: 8}); text(s, x + 8, yc - 10, {size: 15, font: F.code, weight: 700, color: C.mint, alpha: a}); });
    arrow({x: 820, y: yc - 10}, {x: 850, y: yc - 10}, C.mint, {alpha: a, lw: 2, head: 8});
    fileIcon(885, yc - 10, 40, 50, {color: C.mint, alpha: a, rows: 0, glow: lit ? .4 : 0});
    text('mr-out-Y', 885, yc + 38, {size: 15, font: F.mono, color: C.mint, alpha: a});
    text('same steps as mrsequential · 和 mrsequential 一样', 660, yc + 70, {size: 16, font: F.zh, color: C.dim, alpha: a});
  }
}
function partCode(i, y0, a) {
  if (a <= 0) return; const x = 1130, y = y0 + 26;
  if (i === 0) { pageCode(x, y, ['pgA'], a); text('M = number of books · nReduce = 10', x, y + 90, {size: 16, font: F.mono, color: C.sky, align: 'left', alpha: a}); text('M 是书的本数；nReduce 写死为 10', x, y + 114, {size: 16, font: F.zh, color: C.dim, align: 'left', alpha: a}); }
  if (i === 1) pageCode(x, y, ['pgB'], a, {size: 17});
  if (i === 2) pageCode(x, y, ['pgC'], a, {lh: 23});
  if (i === 3) { text('no code: Lab 1 says reduce waits for every map', x, y + 30, {size: 16, font: F.mono, color: C.coral, align: 'left', alpha: a});
                 text('不是代码：Lab 1 要求 reduce 等所有 map 完成', x, y + 58, {size: 16, font: F.zh, color: C.dim, align: 'left', alpha: a});
                 text('who guards it: the coordinator → ep03 · 第 3 集', x, y + 96, {size: 15, font: F.mono, color: C.dim, align: 'left', alpha: a}); }
  if (i === 4) pageCode(x, y, ['pgE1', 'pgE2', 'pgE3'], a, {size: 15, lh: 25});
}

/* ---------- the stop strip: a small copy of the page, under the progress ticks ---------- */
function strip(lt, hot, o = {}) {
  const a = fi(lt, .2) * (o.alpha ?? 1), H = Array.isArray(hot) ? hot : [hot];
  PART.forEach((P, i) => { const x = 1170 + i * 136, on = H.includes(i), y = 128;
    rr(x, y - 17, 126, 34, 8); ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = on ? rgba(P.c, .25) : C.panel; ctx.fill(); ctx.strokeStyle = on ? P.c : rgba(C.faint, .9); ctx.lineWidth = on ? 2 : 1; ctx.stroke(); ctx.restore();
    text(P.s, x + 63, y + 1, {size: 14, font: F.mono, weight: 700, color: on ? C.ink : C.dim, alpha: a});
    if (i < 4) text('›', x + 131, y, {size: 14, font: F.mono, color: C.faint, alpha: a}); });
}
const toyTag = (x, y, a) => tag('玩具例子 · toy', x, y, C.coral, {size: 18, alpha: a});

/* ---- 0. Intro ---- */
SCN.intro = (lt, b, d) => {
  const a1 = fi(lt, .3, 1), out = fo(lt, b[2] - .8, .5);
  text('EPISODE 02', 960, 300, {size: 24, font: F.mono, weight: 700, color: C.gold, ls: 10, alpha: a1 * out});
  text('The MapReduce Model', 960, 390 + 30 * (1 - a1), {size: 104, font: F.disp, weight: 700, alpha: a1 * out, shadow: 'rgba(0,0,0,.6)'});
  text('MapReduce 模型：Map、分桶、Reduce', 960, 478, {size: 38, font: F.zh, color: C.dim, alpha: a1 * out});
  // b1: one slice, in one process's memory
  const k1 = fi(lt, b[1], .7), fly = eio(ramp(lt, b[3] + .3, b[3] + 2.3)), memA = k1 * fo(lt, b[3], .6);
  panel(960, 640, 1520, 120, {alpha: memA * fo(lt, b[2] + .2), edge: rgba(C.sky, .6), dash: [8, 6]});
  text('one process · its memory · 一个进程的内存', 960, 562, {size: 18, font: F.zh, color: C.sky, alpha: memA * fo(lt, b[2] + .2)});
  const G = {x: 560, y: 250, cw: 90, ch: 54};
  for (let i = 0; i < 80; i++) {
    const r = Math.floor(i / 10), c = i % 10, sx = 260 + i * 17.5, sy = 640, p = cellXY(G, r, c);
    const x = lerp(sx, p.x, fly), y = lerp(sy, p.y, fly), w = lerp(15, G.cw - 8, fly), h = lerp(40, G.ch - 8, fly);
    ctx.save(); ctx.globalAlpha *= k1; rr(x - w / 2, y - h / 2, w, h, 4); ctx.fillStyle = rgba(C.gold, lerp(.55, .14, fly)); ctx.fill();
    ctx.strokeStyle = rgba(C.gold, .5); ctx.lineWidth = 1.2; ctx.stroke(); ctx.restore();
  }
  text('intermediate · every pair, one slice · 所有词对，一个切片', 960, 700, {size: 22, font: F.mono, color: C.gold, alpha: k1 * fo(lt, b[3], .6)});
  // b2: many machines, each with only its own memory
  const k2 = win(lt, b[2] + .2, b[3] + .2);
  [0, 1, 2].forEach(j => { const x = 560 + j * 400; server(x, 330, 170, 100, {t: lt, alpha: k2, rows: 2, seed: j});
    text('own memory · 自己的内存', x, 410, {size: 16, font: F.zh, color: C.dim, alpha: k2}); text('?', x + 110, 270, {size: 40, font: F.disp, weight: 700, color: C.coral, alpha: k2}); });
  note('no machine holds "one slice"', '没有哪台机器拿得到“同一个切片”', 960, 480, {alpha: k2, size: 26, color: C.coral});
  // b3: cut into pieces
  text('8 × 10 = 80 pieces · 80 块', 960, 720, {size: 26, font: F.mono, weight: 700, color: C.gold, alpha: fi(lt, b[3] + 2)});
};

/* ---- 1. The whole idea first: two sentences, then the framework page ---- */
SCN.idea = (lt, b, d) => {
  text('in two sentences · 两句话说完', 960, 560, {size: 34, font: F.disp, weight: 700, color: C.dim, alpha: win(lt, .3, b[1] + .3)});
  heading(fi(lt, b[1] + .1), fi(lt, b[2] + .1));
  const p = PART.map((_, i) => fi(lt, b[3 + i] + .2, .7));
  const skel = fi(lt, b[1] + .6) * .5;
  const cam = camPath(lt, [[0, CAM_FULL], [b[3], camBand(0)], [b[4], camBand(1)], [b[5], camBand(2)], [b[6], camBand(3)], [b[7], camBand(4)], [b[8] + .3, CAM_FULL]]);
  const reading = lt < b[8] + .3 ? clamp(Math.floor(knots(lt, [[b[3] - .01, -1], [b[3], 0], [b[4], 1], [b[5], 2], [b[6], 3], [b[7], 4]]) + .001), -1, 4) : -1;
  const ofK = lt > b[8] ? 5 * ramp(lt, b[8] + 1.4, b[8] + 6.4) : 0;
  onPage(cam, () => {
    PART.forEach((P, i) => { if (p[i] >= 1) return; panel(PW / 2, bandC(i), PW, BH, {alpha: skel * (1 - p[i]), fill: C.panel, edge: rgba(C.faint, .7), lw: 1.5});
      text(P.L, 62, bandC(i), {size: 40, font: F.disp, weight: 700, color: P.c, alpha: skel * (1 - p[i])}); });
    board({p, hot: reading >= 0 ? [reading] : [], of: ofK, t: lt});
  });
};

/* ---- 2. The comment that starts it ---- */
SCN.comment = (lt, b, d) => {
  strip(lt, 0);
  srcView(80, 200, 900, 'comment', {alpha: fi(lt, .2), fn: 'main()', hl: n => inR(n, 54, 56) * fi(lt, b[1]) * fo(lt, b[2]) + inR(n, 49, 50) * ((1 - fi(lt, b[1])) * fi(lt, .6) + fi(lt, b[2])),
    mark: n => n === 50 ? ['all pairs → one slice', C.gold, fi(lt, .8) * fo(lt, b[1])] : n === 56 ? ['NxM buckets', C.violet, fi(lt, b[1] + .8)] : null});
  // b2: the gloss of "intermediate data"
  const kg = win(lt, b[2] + .2, b[3]);
  tag('intermediate = Map\'s output, before Reduce · 中间数据：Map 的输出，还没交给 Reduce', 530, 640, C.gold, {size: 18, alpha: kg});
  // right: Map → intermediate → Reduce, in one process
  const k0 = fi(lt, .4) * fo(lt, b[3] + .2);
  panel(1420, 440, 700, 240, {alpha: k0, edge: rgba(C.sky, .5), dash: [8, 6]});
  text('one process · 一个进程', 1420, 352, {size: 18, font: F.zh, color: C.sky, alpha: k0});
  text('Map', 1150, 440, {size: 22, font: F.code, weight: 700, color: C.gold, alpha: k0});
  arrow({x: 1195, y: 440}, {x: 1240, y: 440}, C.gold, {alpha: k0, lw: 2, head: 10});
  rr(1250, 420, 340, 40, 6); ctx.save(); ctx.globalAlpha *= k0; ctx.fillStyle = rgba(C.gold, .5); ctx.fill(); ctx.restore();
  text('intermediate', 1420, 441, {size: 18, font: F.code, weight: 700, color: C.ink, alpha: k0});
  arrow({x: 1600, y: 440}, {x: 1645, y: 440}, C.gold, {alpha: k0, lw: 2, head: 10});
  text('Reduce', 1695, 440, {size: 22, font: F.code, weight: 700, color: C.mint, alpha: k0});
  text(fmtN(D.st.mapPairs.reduce((s, x) => s + x, 0)) + ' pairs · 个词对', 1420, 500, {size: 18, font: F.mono, color: C.gold, alpha: k0 * fi(lt, b[2] + .4)});
  // b3: two cuts
  const k3 = fi(lt, b[3] + .2), cut1 = eo(ramp(lt, b[3] + .5, b[3] + 1.3)), cut2 = eo(ramp(lt, b[3] + 1.8, b[3] + 2.6));
  const X0 = 1120, Y0 = 300, Wd = 600, Hd = 400;
  if (k3 > 0) {
    ctx.save(); ctx.globalAlpha *= k3; rr(X0, Y0, Wd, Hd, 8); ctx.fillStyle = rgba(C.gold, .12); ctx.fill(); ctx.strokeStyle = rgba(C.gold, .6); ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
    for (let r = 1; r < 8; r++) line(X0, Y0 + r * Hd / 8, X0 + Wd * cut1, Y0 + r * Hd / 8, C.sky, 2, k3);
    for (let c = 1; c < 10; c++) line(X0 + c * Wd / 10, Y0, X0 + c * Wd / 10, Y0 + Hd * cut2, C.violet, 2, k3);
    text('cut 1: by book · 按书切', X0, Y0 - 22, {size: 18, font: F.zh, color: C.sky, align: 'left', alpha: k3 * cut1});
    text('cut 2: by bucket · 按桶切', X0 + Wd / 2, Y0 + Hd + 36, {size: 18, font: F.zh, color: C.violet, alpha: k3 * cut2});
  }
};

/* ---- 3. Where M and R come from ---- */
SCN.grid = (lt, b, d) => {
  strip(lt, 0);
  const G = {x: 300, y: 300, cw: 64, ch: 52};
  const kr = fi(lt, .3), kc = fi(lt, b[4]);
  grid(G, {alpha: 1, rows: kr, cols: kc, axis: fi(lt, b[4] + .3), reveal: (r, c) => fi(lt, b[4] + .2 + (r + c) * .04, .3),
    cell: (r, c) => lt > b[5] && r === 2 && c === 6 ? {k: fi(lt, b[5] + .3), color: C.gold, label: 'mr-2-6', size: 13, tc: C.ink} : null});
  tag('M = 8', 120, G.y + 4 * G.ch, C.sky, {size: 24, alpha: fi(lt, .8)});
  zt('one map task per input file · 每个输入文件一个', 150, 760, {alpha: fi(lt, .8) * fo(lt, b[4]), align: 'left', size: 18});
  // b1: what a task is
  const kt = win(lt, b[1] + .2, b[2] + .2);
  note('task = one piece of work, handed to one machine', '任务：能单独交给一台机器的一份活', 1400, 420, {alpha: kt, size: 28});
  server(1400, 560, 160, 90, {t: lt, alpha: kt, rows: 2, label: 'worker'});
  fileIcon(1180, 560, 60, 76, {color: C.sky, alpha: kt, rows: 3, seed: 2}); arrow({x: 1220, y: 560}, {x: 1310, y: 560}, C.sky, {alpha: kt, lw: 2});
  // b2: the question; b3: mrcoordinator.go
  text('nReduce = ?', 1400, 260, {size: 44, font: F.code, weight: 700, color: C.violet, alpha: win(lt, b[2] + .2, b[3] + .4)});
  zt('nReduce：reduce 任务的个数 · the number of reduce tasks', 1400, 310, {alpha: win(lt, b[2] + .4, b[3] + .4), size: 18});
  srcView(1010, 200, 870, 'coord', {alpha: fi(lt, b[3]) * fo(lt, b[5] - .2), fn: 'main()', size: 15.5, hl: n => inR(n, 23, 23), hc: () => C.violet,
    mark: n => n === 23 ? ['nReduce = 10', C.violet, fi(lt, b[3] + .8)] : null});
  text('mrcoordinator.go says: "Please do not change this file."', 1010, 600, {size: 16, font: F.mono, color: C.dim, align: 'left', alpha: fi(lt, b[3] + 1.2) * fo(lt, b[5] - .2)});
  // b4: 8 × 10 = 80
  eq([['8', C.sky], [' × ', C.dim], ['10', C.violet], [' = ', C.dim], ['80', C.gold]], 1440, 650, 72, {alpha: fi(lt, b[4] + 1.2) * fo(lt, b[5] - .2)});
  zt('intermediate files · 个中间文件', 1440, 720, {alpha: fi(lt, b[4] + 1.4) * fo(lt, b[5] - .2)});
  // b5: the naming
  const k4 = fi(lt, b[5] + .2), p = cellXY(G, 2, 6);
  text('mr-X-Y', 1440, 330, {size: 72, font: F.code, weight: 700, alpha: k4});
  text('X', 1440 - 3 * 43.4 + 43, 410, {size: 28, font: F.code, weight: 700, color: C.sky, alpha: k4}); text('Y', 1440 + 3 * 43.4 - 43, 410, {size: 28, font: F.code, weight: 700, color: C.violet, alpha: k4});
  note('X = map task · Y = reduce bucket', 'X 是 map 任务，Y 是 reduce 桶', 1440, 470, {alpha: k4, size: 26});
  tag("the lab's suggested naming, not code · Lab 建议的命名", 1440, 560, C.dim, {size: 17, alpha: fi(lt, b[5] + .8)});
  arrow({x: 1240, y: 340}, {x: p.x + 40, y: p.y}, rgba(C.gold, .8), {alpha: fi(lt, b[5] + .5), lw: 2, dash: [6, 6]});
};

/* ---- 4. A rule that picks a bucket (toy, then the real skew) ---- */
const TW = D.toy.words, TB = [560, 960, 1360];
function toyBuckets(a, counts, o = {}) {
  TB.forEach((x, j) => { panel(x, 610, 300, 170, {alpha: a, fill: C.panel, edge: rgba(C.violet, .6)});
    text('bucket ' + j + ' · ' + j + ' 号桶', x, 545, {size: 18, font: F.mono, weight: 700, color: C.violet, alpha: a});
    if (counts) { const n = counts[j]; text(String(n), x, 720, {size: 30, font: F.mono, weight: 700, color: o.even ? C.mint : n >= 4 ? C.red : n === 0 ? C.coral : C.ink, alpha: a * (o.ka ?? 1)}); } });
}
// a word card at the top row (slot i) or inside bucket j (place k), with t = flight progress
function wordCard(w, i, j, k, t, a, sub) {
  const sx = 360 + i * 240, sy = 300, tx = TB[j] - 70 + (k % 2) * 140, ty = 585 + Math.floor(k / 2) * 44 - (k >= 4 ? 0 : 0);
  const x = lerp(sx, tx, eio(t)), y = lerp(sy, ty, eio(t)), wd = lerp(170, 120, eio(t)), ht = lerp(64, 36, eio(t));
  ctx.save(); ctx.globalAlpha *= a; rr(x - wd / 2, y - ht / 2, wd, ht, 10); ctx.fillStyle = C.panel2; ctx.fill(); ctx.strokeStyle = rgba(C.gold, .8); ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
  text(w, x, y, {size: lerp(30, 20, eio(t)), font: F.code, weight: 700, color: C.gold, alpha: a});
  if (sub && t < .05) text(sub, sx, sy + 56, {size: 18, font: F.mono, color: C.ink, alpha: a});
}
SCN.rule = (lt, b, d) => {
  strip(lt, 2);
  const real = win(lt, b[5] + .55, b[6]), toyA = fi(lt, .2) * (lt < b[6] ? fo(lt, b[5], .5) : fi(lt, b[6] + .1, .5));
  toyTag(180, 200, toyA);
  // phase 1 (b1–b4): first-letter rule; phase 2 (b6–b9): tiny hash
  const ph2 = lt >= b[6], cardsA = toyA;
  const rule1 = D.toy.byLetter, rule2 = D.toy.byHash;
  const c1 = rule1.map(x => x.length), c2 = rule2.map(x => x.length);
  toyBuckets(toyA * fi(lt, b[1] + .4), lt >= b[4] + 1 && !ph2 ? c1 : lt >= b[8] + 4.4 && ph2 ? c2 : null, {even: ph2, ka: ph2 ? fi(lt, b[8] + 4.4) : fi(lt, b[4] + 1)});
  const where = (rule, w) => { const j = rule.findIndex(bk => bk.includes(w)); return [j, rule[j].indexOf(w)]; };
  TW.forEach((w, i) => {
    const kin = fi(lt, b[1] + .2 + i * .15);
    if (!ph2) { const [j, k] = where(rule1, w); wordCard(w, i, j, k, ramp(lt, b[4] + .2 + i * .2, b[4] + 1.2 + i * .2), cardsA * kin); }
    else { const [j, k] = where(rule2, w), sum = D.toy.sums[i];
      const tFly = w === 'sea' ? ramp(lt, b[7] + 4, b[7] + 5) : ramp(lt, b[8] + 2 + i * .25, b[8] + 3 + i * .25);
      const showSub = w === 'sea' ? fi(lt, b[7] + .3) : fi(lt, b[8] + .2 + i * .1);
      wordCard(w, i, j, k, tFly, cardsA, showSub > 0 ? `${sum} % 3 = ${sum % 3}` : null);
      if (showSub > 0 && tFly < .05) text(`${sum} % 3 = ${sum % 3}`, 360 + i * 240, 356, {size: 18, font: F.mono, color: C.ink, alpha: cardsA * showSub}); }
  });
  // the rule text
  const r1 = win(lt, b[2] + .1, b[5]);
  text('rule 1: first letter · 规则一：首字母', 960, 420, {size: 26, weight: 600, color: C.ink, alpha: r1});
  text('a–h → 0     i–r → 1     s–z → 2', 960, 462, {size: 24, font: F.code, color: C.violet, alpha: r1});
  const q = win(lt, b[3] + .2, b[4] - .05);
  tag('how full is each bucket? · 每个桶有多满？', 960, 800, C.gold, {size: 22, alpha: q});
  if (!ph2) tag('bucket 1 empty, bucket 2 drowns · 1 号空着，2 号挤爆', 960, 800, C.red, {size: 20, alpha: fi(lt, b[4] + 2.2) * fo(lt, b[5])});
  // b5: the real books do the same (first letters of the 22,107 distinct words, mrsequential output)
  if (real > 0) {
    const L = 'abcdefghijklmnopqrstuvwxyz'.split(''), mx = Math.max(...L.map(l => D.first[l] || 0));
    tag('real run · 真实运行: the eight books', 960, 205, C.mint, {size: 18, alpha: real});
    axes(260, 720, 1440, 420, {alpha: real, yl: 'distinct words · 不同单词数'});
    text('first letter · 首字母', 960, 785, {size: 20, font: F.zh, color: C.dim, alpha: real});
    L.forEach((l, i) => { const v = D.first[l] || 0, h = 400 * v / mx * eo(ramp(lt, b[5] + .7 + i * .03, b[5] + 1.7 + i * .03)), x = 300 + i * 54;
      const c = l === 's' ? C.red : l === 'z' ? C.sky : C.gold;
      ctx.save(); ctx.globalAlpha *= real; rr(x - 18, 720 - h, 36, h, 4); ctx.fillStyle = rgba(c, l === 's' || l === 'z' ? .9 : .45); ctx.fill(); ctx.restore();
      text(l, x, 745, {size: 18, font: F.mono, color: C.dim, alpha: real}); });
    text(fmtN(D.first.s), 300 + 18 * 54, 720 - 400 - 22, {size: 24, font: F.mono, weight: 700, color: C.red, alpha: real * fi(lt, b[5] + 1.4)});
    text(String(D.first.z), 300 + 25 * 54, 720 - 400 * D.first.z / mx - 24, {size: 24, font: F.mono, weight: 700, color: C.sky, alpha: real * fi(lt, b[5] + 1.6)});
  }
  // b6: rule 2
  const r2 = win(lt, b[6] + .3, b[9]);
  text('rule 2: add letter places, then % 3 · 规则二：字母位置相加，再对 3 取余', 960, 420, {size: 24, weight: 600, color: C.ink, alpha: r2});
  text('a = 1   b = 2   …   z = 26', 960, 462, {size: 22, font: F.code, color: C.violet, alpha: r2});
  // b7: sea by hand
  const ks = win(lt, b[7] + .3, b[8]);
  eq([['s 19', C.gold], [' + ', C.dim], ['e 5', C.gold], [' + ', C.dim], ['a 1', C.gold], [' = ', C.dim], ['25', C.ink], ['   25 % 3 = ', C.dim], ['1', C.violet]], 960, 810, 34, {alpha: ks});
  // b9: same word, same bucket, whichever book
  const k9 = fi(lt, b[9] + .2) * fo(lt, b[10] + 4);
  ['Frankenstein', 'Grimm'].forEach((bk, j) => { const y = 300 + j * 90;
    fileIcon(420, y, 44, 56, {color: C.sky, alpha: k9, rows: 2, seed: j}); text(bk, 520, y, {size: 20, font: F.mono, color: C.dim, align: 'left', alpha: k9});
    text('sea → 25 → % 3 → 1', 900, y, {size: 26, font: F.code, weight: 700, color: C.gold, align: 'left', alpha: k9 * fi(lt, b[9] + .6 + j * .6)});
    arrow({x: 1240, y}, {x: 1340, y}, C.violet, {alpha: k9 * fi(lt, b[9] + .8 + j * .6), lw: 2});
    text('bucket 1', 1360, y, {size: 22, font: F.mono, weight: 700, color: C.violet, align: 'left', alpha: k9 * fi(lt, b[9] + .8 + j * .6)}); });
  // b10: the name for it
  chip('HASH FUNCTION: SCRAMBLES, NEVER CHANGES ITS ANSWER · 哈希函数：打乱，但答案不变', 960, 800, C.violet, eback(ramp(lt, b[10] + .2, b[10] + .8)), {size: 20});
};

/* ---- 5. ihash, by hand ---- */
SCN.ihash = (lt, b, d) => {
  strip(lt, 2);
  const X = 100, codeOn = fi(lt, b[8]);
  text('ihash("of")', X, 220, {size: 40, font: F.code, weight: 700, color: C.violet, align: 'left', alpha: fi(lt, .2)});
  text('FNV-1a · 32 bits', X + 300, 222, {size: 22, font: F.mono, color: C.dim, align: 'left', alpha: fi(lt, b[1])});
  const S = D.of.steps, rowY = i => 300 + i * 78;
  const R = [
    [b[1], 'start', 'h = ' + hex(2166136261), '固定的起始值', C.ink],
    [b[2], 'each byte', 'h = (h ^ byte) × 16777619   keep 32 bits', '异或：字节为 1 的位翻过来 · 乘质数 · 只留低 32 位', C.dim],
    [b[4], '"o" 0x6f', 'h ^ 0x6f = ' + hex(S[0].xor) + '   × → ' + hex(S[0].h), '第一个字节', C.ink],
    [b[5], '"f" 0x66', 'h ^ 0x66 = ' + hex(S[1].xor) + '   × → ' + hex(S[1].h), '= ' + fmtN(S[1].h), C.ink],
    [b[6], '& 0x7fffffff', fmtN(D.of.masked) + '   (top bit already 0)', '最高位本来就是 0', C.ink],
    [b[7], '% 10', String(D.of.bucket), '6 号桶', C.violet],
  ];
  R.forEach(([t, l, v, z, c], i) => {
    const a = fi(lt, t + .2, .6), y = rowY(i), hot = i === R.findLastIndex(r => lt >= r[0]);
    if (a <= 0) return;
    if (hot) { ctx.save(); ctx.globalAlpha *= a * .9; rr(X - 20, y - 30, 900, 62, 10); ctx.fillStyle = rgba(C.violet, .1); ctx.fill(); ctx.restore(); }
    text(l, X, y - 2, {size: 22, font: F.code, weight: 700, color: i >= 2 && i <= 3 ? C.gold : C.violet, align: 'left', alpha: a});
    text(v, X + 190, y - 2, {size: i === 5 ? 44 : 24, font: F.code, weight: i === 5 ? 700 : 500, color: c, align: 'left', alpha: a});
    text(z, X + 190, y + 24, {size: 15, font: F.zh, color: C.dim, align: 'left', alpha: a});
  });
  // b2: XOR, by bits; b3: multiply, keep 32 bits
  const kx = win(lt, b[2] + .4, b[4]);
  if (kx > 0) { const bits = n => n.toString(2).padStart(8, '0');
    const h8 = 2166136261 & 0xff, by = 0x6f;
    [['low byte of h', bits(h8), C.ink], ['^ "o" 0x6f', bits(by), C.gold], ['=', bits(h8 ^ by), C.violet]].forEach(([l, v, c], i) => {
      text(l, 1100, 300 + i * 50, {size: 20, font: F.mono, color: C.dim, align: 'right', alpha: kx}); text(v.split('').join(' '), 1130, 300 + i * 50, {size: 26, font: F.code, weight: 700, color: c, align: 'left', alpha: kx}); });
    zt('XOR：下面是 1 的位，上面就翻过来', 1380, 460, {alpha: kx, size: 18});
    const km = fi(lt, b[3] + .2) * kx;
    text('× 16777619, then & 0xffffffff', 1380, 560, {size: 24, font: F.code, color: C.ink, alpha: km});
    zt('乘一个固定的质数，超出 32 位的部分丢掉 · keep only the low 32 bits', 1380, 600, {alpha: km, size: 17}); }
  // b7: the bucket lands on the grid (mini)
  const Gm = {x: 1190, y: 640, cw: 56, ch: 20};
  grid(Gm, {alpha: win(lt, b[7] + .4, b[8]), small: true, rows: 0, cols: 1, cell: (r, c) => c === 6 ? {k: 1, color: C.violet} : null});
  text('"of" → bucket 6', 1470, 600, {size: 26, font: F.mono, weight: 700, color: C.violet, alpha: win(lt, b[7] + .6, b[8])});
  // b8: the real code; b9: the real run agrees
  srcView(1010, 190, 870, 'ihash', {alpha: codeOn, fn: 'ihash()', hl: n => inR(n, 16, 17) * fi(lt, b[8] + 1.4) + inR(n, 19, 19) * fi(lt, b[8] + .4) + inR(n, 21, 21) * fi(lt, b[8] + .9), hc: () => C.violet,
    mark: n => n === 19 ? ['New32a = FNV-1a', C.violet, fi(lt, b[8] + .5)] : n === 21 ? ['mask: never negative', C.violet, fi(lt, b[8] + 1)] : n === 16 ? ['% NReduce → 6', C.violet, fi(lt, b[8] + 1.5)] : null});
  const k8 = fi(lt, b[9] + .2);
  panel(1445, 720, 870, 70, {alpha: k8, fill: '#0E1628', edge: rgba(C.mint, .6)});
  text(`real run: "of" → bucket ${D.st.bucket.of}   ✓`, 1445, 720, {size: 26, font: F.code, weight: 700, color: C.mint, alpha: k8});
};

/* ---- 6. Same word, same column ---- */
SCN.column = (lt, b, d) => {
  strip(lt, 2);
  const G = G_FULL, show = fi(lt, b[2] + .2), hotRows = lt > b[3] ? [2, 6, 0] : [];
  grid(G, {alpha: fi(lt, .2), col: lt > b[2] ? 6 : -1, cell: (r, c) => {
    if (c === B_OF) { const k = fi(lt, b[2] + .2 + r * .15, .4); return k > 0 ? {k: hotRows.length && !hotRows.includes(r) ? .45 : k, color: C.gold, label: fmtN(OF[r]), tc: C.ink} : null; }
    if (lt > b[4] + .3) return {k: 0, label: '0', la: .5 * fi(lt, b[4] + .3), tc: C.faint};
    return null; }});
  text('ihash(word) — not the book, not the machine', 960, 196, {size: 26, font: F.code, color: C.violet, alpha: fi(lt, .4) * fo(lt, b[1])});
  zt('和玩具例子一样：只看这个词，不看书、不看机器', 960, 226, {size: 18, alpha: fi(lt, .4) * fo(lt, b[1])});
  const q = win(lt, b[1] + .2, b[2] - .05);
  if (q > 0) { ctx.save(); ctx.globalAlpha = q * .85; ctx.fillStyle = C.bg; ctx.fillRect(0, 170, W, 670); ctx.restore(); }
  text('How many files hold "of"?', 960, 450, {size: 60, font: F.disp, weight: 700, alpha: q});
  text('有几个中间文件装着 "of"？', 960, 525, {size: 30, font: F.zh, color: C.dim, alpha: q});
  text('8 files · mr-0-6 … mr-7-6', 1530, 400, {size: 22, font: F.mono, weight: 700, color: C.gold, align: 'left', alpha: show});
  text('每行一格，全在第 6 列', 1530, 432, {size: 18, font: F.zh, color: C.dim, align: 'left', alpha: show});
  [[2, 'Frankenstein'], [6, 'Sherlock'], [0, 'Earnest']].forEach(([r, n], j) => { const p = cellXY(G, r, B_OF), ka = fi(lt, b[3] + .3 + j * .6);
    arrow({x: 1525, y: 500 + j * 50}, {x: p.x + G.cw / 2 + 4, y: p.y}, rgba(C.gold, .7), {alpha: ka, lw: 2, head: 10});
    text(`${n}: ${fmtN(OF[r])}`, 1537, 500 + j * 50, {size: 20, font: F.mono, color: C.gold, align: 'left', alpha: ka}); });
  tag('no other column holds one · 其他列一个都没有', 960, 790, C.violet, {size: 22, alpha: fi(lt, b[4] + .8)});
};

/* ---- 7. So far, on the page ---- */
SCN.sofar = (lt, b, d) => {
  heading(1, 1);
  const cam = camPath(lt, [[0, CAM_FULL], [b[0], camBand(0)], [b[1], camBands(1, 2)], [b[2], camBands(2, 3)], [b[2] + 4.2, CAM_FULL]]);
  const hot = lt < b[1] ? [0] : lt < b[2] ? [1, 2] : lt < b[2] + 4.2 ? [2, 3] : [];
  const ofK = lt < b[1] ? fi(lt, b[0] + .8) : lt < b[2] ? 1 + 2 * ramp(lt, b[1] + .8, b[1] + 2.4) : 3;
  onPage(cam, () => board({hot, of: ofK, t: lt}));
  // D waits: a pulse on the gate
  if (lt > b[2] + 1) { const k = (lt - b[2] - 1) % 1.6 / 1.6; onPage(cam, () => pulse(62, bandC(3), k, C.coral, 34, 90)); }
  tag('next: the gate D · 下一步：闸门 D', 960, 856, C.coral, {size: 18, alpha: fi(lt, b[2] + 1.2)});
};

/* ---- 8. The gate: reduce must wait ---- */
SCN.wait = (lt, b, d) => {
  strip(lt, 3);
  const G = {x: 360, y: 260, cw: 70, ch: 44}, done7 = lt > b[2] + 1;
  grid(G, {alpha: fi(lt, .2), col: 6, axis: 0, cell: (r, c) => {
    if (r === 7 && !done7) return {k: .5, color: C.coral, dash: true, label: c === 6 ? '…' : ''};
    return c === 6 ? {k: 1, color: C.gold, label: fmtN(OF[r]), size: 13, tc: C.ink} : {k: .25, color: C.sky}; }});
  if (!done7) { const p = cellXY(G, 7, 0); text('map 7 · Tom Sawyer · still running · 还在跑', G.x + 10 * G.cw + 20, p.y, {size: 18, font: F.zh, color: C.coral, align: 'left', alpha: fi(lt, .6)}); }
  tag('can reducer 6 start? · 6 号 reducer 能开始吗？', 1450, 330, C.gold, {size: 22, alpha: win(lt, .8, b[1] - .05)});
  const k1 = fi(lt, b[1] + .3) * fo(lt, b[2] + .8);
  eq([['13,536', C.gold], [' − ', C.dim], ['1,565', C.coral], [' = ', C.dim], ['11,971', C.red]], 1450, 430, 46, {alpha: k1});
  zt('reducer 6 would print the wrong count · 6 号 reducer 会数错', 1450, 490, {alpha: k1});
  const k2 = fi(lt, b[2] + .2);
  text('all map tasks done → reduce starts', 1450, 540, {size: 26, weight: 600, color: C.mint, alpha: k2});
  zt('所有 map 完成 → reduce 才开始', 1450, 575, {alpha: k2});
  line(G.x - 10, G.y + 8 * G.ch + 14, G.x + 10 * G.cw, G.y + 8 * G.ch + 14, C.coral, 4, k2);
  text('the gate D · 闸门 D', G.x + 5 * G.cw, G.y + 8 * G.ch + 42, {size: 18, font: F.zh, color: C.coral, alpha: k2});
  // b3: who guards it → episode 3
  const k3 = fi(lt, b[3] + .2);
  note('who checks the gate, and how? the coordinator', '谁来守这道闸、怎么守？协调者', 1450, 660, {alpha: k3, size: 24});
  epTag(3, 1450, 740, fi(lt, b[3] + .8), C.coral);
};

/* ---- 9. Sort, then group (toy) ---- */
SCN.group = (lt, b, d) => {
  strip(lt, 4);
  toyTag(180, 200, fi(lt, .2));
  const P = D.toy.pairs, S = D.toy.sorted, X = i => 420 + i * 220;
  const sortT = eio(ramp(lt, b[1] + .3, b[1] + 1.8));
  P.forEach(([k], i) => { const j = S.findIndex((s, n) => s[0] === k && S.slice(0, n).filter(z => z[0] === k).length === P.slice(0, i).filter(z => z[0] === k).length);
    const x = lerp(X(i), X(j), sortT), y = 320 - Math.sin(sortT * Math.PI) * 60 * (i % 2 ? 1 : -1), a = fi(lt, b[0] + .2 + i * .15);
    ctx.save(); ctx.globalAlpha *= a; rr(x - 90, y - 34, 180, 68, 10); ctx.fillStyle = C.panel2; ctx.fill(); ctx.strokeStyle = rgba(C.gold, .8); ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
    text(`(${k}, 1)`, x, y, {size: 26, font: F.code, weight: 700, color: k === 'of' ? C.gold : C.ink, alpha: a}); });
  text('sorted by word · 按词排序', 860, 230, {size: 20, font: F.zh, color: C.mint, alpha: fi(lt, b[1] + 1.8)});
  // b2: cut where the word changes → three runs
  const runs = [[0, 1, 'a'], [2, 3, 'of'], [4, 4, 'the']], k2 = fi(lt, b[2] + .2);
  [1.5, 3.5].forEach((c, n) => line(X(0) + c * 220, 270, X(0) + c * 220, 370, C.coral, 3, k2 * fi(lt, b[2] + .4 + n * .4)));
  runs.forEach(([s, e, w], n) => { const ka = k2 * fi(lt, b[2] + .8 + n * .3), x1 = X(s) - 80, x2 = X(e) + 80;
    brace(x1, x2, 395, `run ${n + 1} · 第 ${n + 1} 段`, C.mint, ka); });
  // b3: each run → Reduce once; wc.go's Reduce counts
  const k3 = fi(lt, b[3] + .2);
  runs.forEach(([s, e, w], n) => { const x = (X(s) + X(e)) / 2, ka = k3 * fi(lt, b[3] + .3 + n * .3);
    arrow({x, y: 450}, {x, y: 500}, C.mint, {alpha: ka, lw: 2});
    text(`${w} ${e - s + 1}`, x, 530, {size: 30, font: F.code, weight: 700, color: w === 'of' ? C.gold : C.ink, alpha: ka}); });
  srcView(560, 590, 800, 'wcreduce', {alpha: k3, fn: 'Reduce()', size: 17, lh: 30, hl: n => inR(n, 39, 39) * fi(lt, b[3] + .8), hc: () => C.mint,
    mark: n => n === 39 ? ['count the values', C.mint, fi(lt, b[3] + 1)] : null});
};

/* ---- 10. Reduce reads a column ---- */
const RSTOPS = [['Read column', '读一列'], ['Sort', '排序'], ['Group', '分组'], ['Reduce', 'Reduce'], ['Write', '写结果']];
SCN.reduce = (lt, b, d) => {
  strip(lt, 4);
  const cur = knots(lt, [[0, 0], [b[2], 0], [b[2] + .5, 1], [b[3], 1], [b[3] + .5, 2.5], [b[5], 2.5], [b[5] + .5, 4]]);
  RSTOPS.forEach((s, i) => { const k = clamp(1 - Math.abs(cur - i), 0, 1), x = 110 + i * 170, a = fi(lt, .2);
    if (i) line(x - 170 + 30, 210, x - 30, 210, C.faint, 2, a);
    ctx.save(); ctx.globalAlpha *= a; ctx.beginPath(); ctx.arc(x, 210, 13, 0, Math.PI * 2); ctx.fillStyle = k > .5 ? C.mint : (i < cur ? rgba(C.mint, .5) : C.panel2); ctx.fill(); ctx.strokeStyle = C.mint; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
    text(s[0], x, 242, {size: 18, weight: 600, color: k > .5 ? C.ink : C.dim, alpha: a}); text(s[1], x, 264, {size: 14, font: F.zh, color: C.dim, alpha: a}); });
  for (let r = 0; r < 8; r++) { const y = 320 + r * 58, ka = fi(lt, .3 + r * .08);
    fileIcon(130, y, 40, 50, {color: C.sky, alpha: ka, rows: 0});
    text(`mr-${r}-6`, 170, y - 8, {size: 18, font: F.mono, weight: 700, color: C.ink, align: 'left', alpha: ka});
    text(`"of" × ${fmtN(OF[r])}`, 170, y + 14, {size: 15, font: F.mono, color: C.gold, align: 'left', alpha: ka * fi(lt, b[1])}); }
  const k1 = fi(lt, b[1] + .3);
  arrow({x: 360, y: 520}, {x: 470, y: 520}, C.violet, {alpha: k1});
  text(fmtN(D.st.reduceIn[6]), 600, 500, {size: 46, font: F.mono, weight: 700, color: C.violet, alpha: k1});
  text('pairs read · 读入的词对', 600, 545, {size: 18, font: F.zh, color: C.dim, alpha: k1});
  const k2 = fi(lt, b[2] + .3);
  tag('like the toy · 和玩具例子一样', 600, 300, C.coral, {size: 16, alpha: win(lt, b[2] + .3, b[4])});
  for (let i = 0; i < 9; i++) { const isOf = i >= 3 && i <= 6, ka = k2 * fi(lt, b[2] + .4 + i * .06);
    const y = 600 + i * 26; text(isOf ? (i === 4 ? '⋮  × ' + fmtN(D.st.out.of.split(' ')[1]) : 'of  "1"') : '·', 600, y, {size: 17, font: F.code, color: isOf ? C.gold : C.faint, alpha: ka}); }
  const k3 = fi(lt, b[3] + .5);
  arrow({x: 690, y: 690}, {x: 760, y: 690}, C.gold, {alpha: k3});
  text('Reduce("of", [13,536 × "1"])', 770, 680, {size: 16, font: F.code, color: C.gold, align: 'left', alpha: k3 * fo(lt, b[5])});
  text('→ "13536"', 770, 708, {size: 16, font: F.code, color: C.gold, align: 'left', alpha: k3 * fo(lt, b[5])});
  const k5 = fi(lt, b[5] + .3);
  fileIcon(820, 700, 60, 76, {color: C.mint, alpha: k5, rows: 0}); text('mr-out-6', 820, 756, {size: 15, font: F.mono, color: C.mint, alpha: k5});
  text(D.st.out.of, 870, 700, {size: 30, font: F.code, weight: 700, color: C.ink, align: 'left', alpha: k5});
  tag('"of" reached the bottom of the page · 走到了图的最底下', 560, 800, C.gold, {size: 18, alpha: fi(lt, b[5] + 2)});
  srcView(1060, 300, 830, 'seqsort', {alpha: win(lt, b[2] + .2, b[3] + .1), fn: 'main()', hl: n => inR(n, 59, 59), mark: n => n === 59 ? ['"of" pairs side by side', C.gold, fi(lt, b[2] + .8)] : null});
  srcView(1060, 200, 830, 'seqreduce', {alpha: fi(lt, b[3] + .1), fn: 'main()', size: 15, lh: 29, hl: n => lt < b[5] ? inR(n, 70, 73) + inR(n, 78, 78) * fi(lt, b[3] + 1) : inR(n, 81, 81),
    mark: n => n === 72 ? ['13,536 equal keys', C.gold, fi(lt, b[3] + .6) * fo(lt, b[5])] : n === 78 ? ['→ "13536"', C.gold, fi(lt, b[3] + 1.2)] : n === 81 ? ['"of 13536"', C.mint, fi(lt, b[5] + .3)] : null});
  tag('reuse from mrsequential.go — the lab says you may · Lab 允许复用', 540, 800, C.dim, {size: 16, alpha: fi(lt, b[4] + .2) * fo(lt, b[5] + 1.5)});
};

/* ---- 11. The real run: 80 files ---- */
SCN.evidence = (lt, b, d) => {
  strip(lt, [0, 1, 2, 3, 4], {alpha: .7});
  text('real run · nReduce = 10 · 真实运行', 960, 205, {size: 22, font: F.mono, weight: 700, color: C.mint, alpha: fi(lt, .2)});
  const k1 = win(lt, b[1] + .1, b[2]);
  for (let i = 0; i < 80; i++) { const r = Math.floor(i / 10), c = i % 10; fileIcon(520 + c * 56, 300 + r * 54, 30, 38, {color: C.violet, alpha: k1 * fi(lt, b[1] + .2 + i * .015, .2), rows: 0}); }
  for (let c = 0; c < 10; c++) fileIcon(1350 + (c % 5) * 60, 400 + Math.floor(c / 5) * 110, 40, 52, {color: C.mint, alpha: k1 * fi(lt, b[1] + 1.5 + c * .05), rows: 0});
  text('80 intermediate · 80 个中间文件', 770, 760, {size: 22, font: F.zh, color: C.violet, alpha: k1}); text('10 mr-out', 1470, 600, {size: 22, font: F.mono, color: C.mint, alpha: k1});
  const bars = (x0, y0, vals, max, color, a, hl) => { for (let c = 0; c < 10; c++) { const h = 280 * vals[c] / max * eo(ramp(lt, hl.t + c * .05, hl.t + .8 + c * .05)), x = x0 + c * 70;
    ctx.save(); ctx.globalAlpha *= a; rr(x - 24, y0 - h, 48, h, 4); ctx.fillStyle = rgba(color, hl.c && hl.c.includes(c) ? .95 : .55); ctx.fill(); ctx.restore();
    text(String(c), x, y0 + 22, {size: 16, font: F.mono, color: C.violet, alpha: a}); } };
  const k2 = fi(lt, b[2] + .1), K = D.st.keys, P = D.st.reduceIn;
  bars(160, 740, K, 2400, C.violet, k2, {t: b[2] + .2});
  text('distinct words per bucket · 每桶不同单词数', 475, 300, {size: 20, font: F.zh, color: C.violet, alpha: k2});
  text(`${fmtN(Math.min(...K))} – ${fmtN(Math.max(...K))}`, 475, 336, {size: 30, font: F.mono, weight: 700, color: C.violet, alpha: fi(lt, b[2] + 1)});
  tag('even · 均匀', 475, 380, C.mint, {size: 18, alpha: fi(lt, b[2] + 1.3)});
  const k3 = fi(lt, b[3] + .1);
  bars(1100, 740, P, Math.max(...P), C.gold, k3, {t: b[3] + .2, c: lt > b[4] ? [2, 6] : []});
  text('pairs per bucket · 每桶词对数', 1415, 300, {size: 20, font: F.zh, color: C.gold, alpha: k3});
  text(`${fmtN(Math.min(...P))} – ${fmtN(Math.max(...P))}`, 1415, 336, {size: 30, font: F.mono, weight: 700, color: C.gold, alpha: fi(lt, b[3] + 1)});
  tag('uneven · 不均匀', 1415, 380, C.red, {size: 18, alpha: fi(lt, b[3] + 1.3)});
  [[2, 'the', D.st.out.the], [6, 'of', D.st.out.of]].forEach(([c, w, o], j) => { const ka = fi(lt, b[4] + .3 + j * .6), x = 1100 + c * 70, h = 280 * P[c] / Math.max(...P), hw = 280 * (+o.split(' ')[1]) / Math.max(...P);
    ctx.save(); ctx.globalAlpha *= ka; rr(x - 24, 740 - hw, 48, hw, 4); ctx.fillStyle = C.red; ctx.fill(); ctx.restore();
    text(`"${w}" ${fmtN(+o.split(' ')[1])}`, x, 740 - h - 16, {size: 16, font: F.mono, weight: 700, color: C.red, alpha: ka}); });
  chip('A HASH BALANCES WORDS, NOT WORK · 哈希平衡的是词，不是工作量', 960, 790, C.gold, eback(ramp(lt, b[5] + .2, b[5] + .8)), {size: 20});
};

/* ---- 12. How the test judges it ---- */
SCN.test = (lt, b, d) => {
  strip(lt, 4);
  srcView(80, 190, 880, 'testwc', {alpha: fi(lt, .2), fn: 'TestWc()', size: 16.5, lh: 29,
    hl: n => (lt < b[2] ? inR(n, 18, 18) * fi(lt, b[1]) : 0) + (lt >= b[2] && lt < b[3] ? inR(n, 19, 20) : 0) + (lt >= b[3] ? inR(n, 21, 22) : 0),
    hc: n => n >= 21 ? C.mint : C.gold,
    mark: n => n === 19 ? ['your coordinator + 3 workers', C.dim, fi(lt, b[2] + .4)] : null});
  const X = 1060;
  const k1 = fi(lt, b[1] + .2);
  panel(X + 180, 300, 340, 80, {alpha: k1, edge: rgba(C.gold, .6)}); text('mrsequential → sort', X + 180, 290, {size: 20, font: F.code, color: C.gold, alpha: k1}); text('mr-wc-correct.txt', X + 180, 318, {size: 15, font: F.mono, color: C.dim, alpha: k1});
  srcView(X, 360, 820, 'mkcorrect', {alpha: k1 * fo(lt, b[4] - .1), fn: 'mkCorrectOutput()', size: 15});
  const k2 = fi(lt, b[2] + .2);
  panel(X + 620, 300, 340, 80, {alpha: k2, edge: rgba(C.violet, .6)}); text('mr-out-0…9 → sort', X + 620, 290, {size: 20, font: F.code, color: C.violet, alpha: k2}); text('mr-wc-all.txt', X + 620, 318, {size: 15, font: F.mono, color: C.dim, alpha: k2});
  srcView(X, 470, 820, 'merge', {alpha: k2 * fo(lt, b[4] - .1), fn: 'mergeOutput()', size: 15});
  const k3 = fi(lt, b[3] + .2);
  arrow({x: X + 180, y: 345}, {x: X + 380, y: 600}, C.mint, {alpha: k3 * fo(lt, b[4] - .1), lw: 2}); arrow({x: X + 620, y: 345}, {x: X + 420, y: 600}, C.mint, {alpha: k3 * fo(lt, b[4] - .1), lw: 2});
  srcView(X, 580, 820, 'cmp', {alpha: k3 * fo(lt, b[4] - .1), fn: 'runCmp()', size: 15});
  text('byte for byte · 逐字节', X + 410, 700, {size: 20, font: F.zh, color: C.mint, alpha: k3 * fo(lt, b[4] - .1)});
  tag('our run: identical ✓ · 完全相同', X + 410, 760, C.mint, {size: 22, alpha: fi(lt, b[3] + 2.4) * fo(lt, b[4] - .1)});
  // b4–b5: what if "of" were in two buckets (a made-up split)
  const k5 = fi(lt, b[4] + .2);
  if (k5 > 0) { panel(X + 410, 490, 820, 280, {alpha: k5, fill: C.panel, edge: rgba(C.red, .5)});
    text('what if · 假如', X + 410, 375, {size: 20, font: F.zh, color: C.red, alpha: k5});
    text('correct:  of 13536', X + 160, 420, {size: 24, font: F.code, color: C.mint, align: 'left', alpha: k5});
    text('yours:    of 6000', X + 160, 470, {size: 24, font: F.code, color: C.red, align: 'left', alpha: fi(lt, b[5] + .2)});
    text('          of 7536', X + 160, 510, {size: 24, font: F.code, color: C.red, align: 'left', alpha: fi(lt, b[5] + .5)});
    text('made-up split · 编造的拆分', X + 660, 490, {size: 15, font: F.zh, color: C.dim, alpha: fi(lt, b[5] + .5)});
    cross(X + 410, 560, 18, C.red, 6, fi(lt, b[5] + 1));
    text('cmp: differ → test fails · 测试失败', X + 410, 598, {size: 22, font: F.zh, color: C.red, alpha: fi(lt, b[5] + 1)}); }
};

/* ---- 13. What this episode skipped ---- */
SCN.limits = (lt, b, d) => {
  strip(lt, []);
  const G = {x: 560, y: 260, cw: 80, ch: 46}, gA = fi(lt, .2) * fo(lt, b[3] - .2);
  grid(G, {alpha: gA, small: true, cell: (r, c) => r === 4 && lt > b[1] ? (c < 5 ? {k: .7, color: C.sky} : c === 5 ? {k: .7, color: C.red, dash: true, label: 'half'} : {k: 0}) : {k: .3, color: C.sky}});
  tag('one process, nothing went wrong · 单进程，没出错', 960, 690, C.dim, {size: 20, alpha: fi(lt, .4) * fo(lt, b[1])});
  const p = cellXY(G, 4, 5), k1 = fi(lt, b[1] + .3) * fo(lt, b[3] - .2);
  server(1580, p.y, 150, 90, {t: lt, alpha: k1, state: lt > b[1] + 1.2 ? 'dead' : 'ok', label: 'worker', rows: 2});
  arrow({x: 1500, y: p.y}, {x: p.x + 40, y: p.y}, rgba(C.red, .8), {alpha: k1, lw: 2, dash: [6, 5]});
  note('who hands out rows and columns? a worker dies halfway?', '谁派任务？worker 做到一半死了？', 960, 690, {alpha: k1 * fo(lt, b[2]), size: 24});
  note('a half-written mr-X-Y must never be read', '写了一半的 mr-X-Y 绝不能被读到', 960, 690, {alpha: fi(lt, b[2] + .2) * fo(lt, b[3] - .2), size: 24, color: C.red});
  epTag(3, 960, 790, fi(lt, b[2] + .8) * fo(lt, b[3] - .2), C.coral);
  // b3: inside one file, your choice (encoding/json is the lab's suggestion)
  const k3 = fi(lt, b[3] + .2);
  fileIcon(560, 470, 160, 200, {color: C.violet, alpha: k3, rows: 0}); text('mr-2-6', 560, 600, {size: 20, font: F.mono, color: C.violet, alpha: k3});
  panel(1180, 470, 820, 220, {alpha: k3, fill: '#0E1628'});
  ['{"Key":"of","Value":"1"}', '{"Key":"of","Value":"1"}', '{"Key":"offer","Value":"1"}', '…'].forEach((s, i) => text(s, 820, 400 + i * 46, {size: 24, font: F.code, color: i < 2 ? C.gold : C.dim, align: 'left', alpha: k3 * fi(lt, b[3] + .4 + i * .2)}));
  tag('if you use encoding/json (the lab\'s suggestion) · 你的选择', 1180, 630, C.dim, {size: 17, alpha: fi(lt, b[3] + 1)});
};

/* ---- 14. Recap, on the page ---- */
SCN.recap = (lt, b, d) => {
  heading(1, 1);
  const cam = camPath(lt, [[0, CAM_FULL], [b[0], camBands(0, 1)], [b[1], camBand(2)], [b[2], camBands(3, 4)], [b[2] + 5, CAM_FULL]]);
  const hot = lt < b[1] ? [0] : lt < b[2] ? [2] : lt < b[2] + 5 ? [3, 4] : [];
  const badge = {0: [1, fi(lt, b[0] + .3)], 2: [2, fi(lt, b[1] + .3)], 3: [3, fi(lt, b[2] + .3)], 4: [3, fi(lt, b[2] + .3)]};
  onPage(cam, () => board({hot, of: 5, badge, t: lt}));
};

/* ---- 15. Your turn ---- */
SCN.turn = (lt, b, d) => {
  strip(lt, 2);
  text('Your Turn', 960, 200, {size: 56, font: F.disp, weight: 700, alpha: fi(lt, .2)});
  text('轮到你：手算 ihash("the")', 960, 255, {size: 26, font: F.zh, color: C.dim, alpha: fi(lt, .2)});
  const S = D.the.steps, rev = fi(lt, b[2] + .1);
  const rows = [['start', hex(2166136261), true], ...S.map(s => [`"${s.ch}" 0x${s.byte.toString(16)}`, hex(s.h), false]), ['& 0x7fffffff', fmtN(D.the.masked), false], ['% 10', String(D.the.bucket), false]];
  rows.forEach(([l, v, given], i) => { const y = 330 + i * 64, a = fi(lt, b[0] + .3 + i * .15);
    panel(960, y, 900, 54, {alpha: a, fill: C.panel});
    text(l, 560, y, {size: 24, font: F.code, weight: 700, color: i >= 1 && i <= 3 ? C.gold : C.violet, align: 'left', alpha: a});
    const shown = given ? 1 : rev; text(shown > 0 ? v : '?', 1360, y, {size: 24, font: F.code, weight: 700, color: given ? C.ink : C.violet, align: 'right', alpha: a * (given ? 1 : Math.max(rev, .6))});
    if (i === 3) text(fmtN(S[2].h) + ' — top bit set · 最高位是 1', 1420, y, {size: 17, font: F.mono, color: C.coral, align: 'left', alpha: rev});
  });
  text('careful with the mask · 小心掩码', 960, 790, {size: 22, font: F.zh, color: C.coral, alpha: win(lt, b[1] + .2, b[2])});
  const k3 = fi(lt, b[3] + .1);
  text('mr-out-2:  ' + D.st.out.the, 960, 790, {size: 30, font: F.code, weight: 700, color: C.mint, alpha: k3});
};

// filled by build.py with every Chinese character in this file (so the font subset loads them)
const EXTRA_ZH = '__AUTO__';
