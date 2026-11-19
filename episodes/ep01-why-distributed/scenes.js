/* =========================================================
   Episode 1 — Why Distributed Is Hard: Counting Eight Books
   Colour legend (the whole episode):
     gold   = the data: books, (word, "1") pairs, counts
     sky    = machines and processes (workers, servers); band A of the framework page
     ink    = the coordinator
     the four markers: red = 1 a machine dies · coral = 2 two writers · violet = 3 a lost message · mint = 4 copies agree
   Every number comes from ep01_data.js (data.py runs mrsequential + wc.go on the eight books and cuts the code).
   The framework page (page(), drawn in its own coordinates and filmed through a clipped window under the heading) is
   built in "idea", told again in "sofar", "labs" and "recap"; miniPage() is its small copy in every other scene.
   ========================================================= */
const SCN = {};

/* ---------- helpers ---------- */
const fi = (lt, t, d = .5) => eo(ramp(lt, t, t + d));
const fo = (lt, t, d = .5) => 1 - ramp(lt, t, t + d);
const win = (lt, t0, t1, d = .45) => fi(lt, t0, d) * (t1 === undefined ? 1 : fo(lt, t1 - d, d));
const fmtN = n => Math.round(n).toLocaleString('en-US');
const zt = (s, x, y, o = {}) => text(s, x, y, {font: F.zh, size: 22, color: C.dim, ...o});
function line(x1, y1, x2, y2, color, lw = 2, a = 1, dash) { if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = color; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.restore(); }
// a small bilingual note: English, Chinese under it
function note(en, zh, x, y, o = {}) {
  const a = o.alpha ?? 1, c = o.color || C.ink, al = o.align || 'center', s = o.size || 26;
  text(en, x, y, {size: s, weight: 600, color: c, align: al, alpha: a});
  text(zh, x, y + s * 1.1, {size: s * .74, font: F.zh, color: C.dim, align: al, alpha: a});
}
// a tag pointing to a later episode
const epTag = (n, x, y, a, c = C.dim) => tag(`→ ep${String(n).padStart(2, '0')} · 第 ${n} 集`, x, y, c, {size: 18, alpha: a});
// 玩具例子 / toy: a made-up setup to see the idea, not a real run
const toyTag = (a, x = 200, y = 196) => tag('TOY · 玩具例子', x, y, C.gold, {size: 18, alpha: a});

/* ---- the four markers ---- */
const PC = [C.red, C.coral, C.violet, C.mint];
const PN = [['a machine can die halfway', '机器可能做到一半就死了'], ['two machines can write one file at once', '两台机器可能同时写同一个文件'],
            ['a message can vanish', '一条消息可能消失'], ['copies of the one record must agree', '那份唯一的记录，副本必须一致']];
function marker(i, x, y, r, a, hot = 0) {
  if (a <= 0) return;
  const c = PC[i];
  ctx.save(); ctx.globalAlpha *= a; if (hot > 0) glow(x, y, r * 3.2, c, .55 * hot);
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = mixHex(C.panel, c, .3 + .45 * hot); ctx.fill();
  ctx.lineWidth = Math.max(2, r * .12); ctx.strokeStyle = c; ctx.stroke(); ctx.restore();
  text(String(i + 1), x, y + 1, {size: r * 1.1, font: F.mono, weight: 700, color: C.ink, alpha: a});
}

/* =========================================================
   The framework page: one pass of the episode, top to bottom.
   A = one process (mrsequential) · B = the same job over machines, with markers 1–4 where it breaks ·
   cards = each marker's real cause (cut from 6.5840/ by data.py) · L = the five labs, tied to their markers.
   ========================================================= */
const PW = 1800, PH = 1020;
const WIN = {x: 60, y: 252, w: 1800, h: 582}, WC = {x: 960, y: 252 + 291};
const FIT = Math.min(WIN.w / PW, WIN.h / PH);
const CAM = {whole: [PW / 2, PH / 2, FIT], A: [705, 200, 1.25], B: [705, 470, 1.25], m12: [700, 612, 1.2], m34: [705, 705, .92], all4: [900, 700, .75]};
function camAt(lt, ks, d = 1.4) { // ks: [[t, cam], …] — glide to each cam from its t
  let c = ks[0][1];
  for (let i = 1; i < ks.length; i++) { const k = eio(ramp(lt, ks[i][0], ks[i][0] + d)); if (k <= 0) break; c = c.map((v, j) => lerp(v, ks[i][1][j], k)); }
  return c;
}
const HEAD = ['One machine counts eight books in a fraction of a second. Many machines scale, and bring four problems one process never has.',
              '一台机器零点几秒数完八本书。很多台机器能扩大规模，也带来四个单进程里没有的难题。'];
function heading(a) { if (a <= 0) return; text(HEAD[0], 960, 190, {size: 25, weight: 600, alpha: a}); text(HEAD[1], 960, 224, {size: 19, font: F.zh, color: C.dim, alpha: a}); }
function pageView(c, a, o) {
  if (a <= 0) return;
  panel(WC.x, WC.y, WIN.w + 6, WIN.h + 6, {alpha: a, fill: 'rgba(12,19,36,.55)', edge: C.line, lw: 1.5, r: 10});
  ctx.save(); ctx.globalAlpha *= a; ctx.beginPath(); ctx.rect(WIN.x, WIN.y, WIN.w, WIN.h); ctx.clip();
  ctx.translate(WC.x, WC.y); ctx.scale(c[2], c[2]); ctx.translate(-c[0], -c[1]);
  page(o); ctx.restore();
}
// a caption laid on the page window (the "so far" / recap line being told)
function caption(en, zh, a, c = C.gold) {
  if (a <= 0) return;
  panel(960, 868, 1400, 62, {alpha: a * .95, fill: '#0B1226', edge: rgba(c, .6)});
  text(en, 960, 857, {size: 24, weight: 600, color: c, alpha: a}); text(zh, 960, 884, {size: 17, font: F.zh, color: C.dim, alpha: a});
}
const AN = [['8 books', '八本书', 'L39–48'], ['Map', 'wc.go', 'L49'], ['intermediate', '一个切片', 'L50'], ['Sort', '排序', 'L59'], ['Reduce', 'wc.go', 'L68–84'], ['mr-out-0', '一个输出文件', 'L61']];
const BW = [{x: 600, y: 350}, {x: 600, y: 465}, {x: 600, y: 580}], BCO = {x: 190, y: 480}, BRD = [{x: 930, y: 420}, {x: 930, y: 540}], BF = [{x: 1220, y: 420}, {x: 1220, y: 540}];
const MK = [{x: 700, y: 425}, {x: 1268, y: 378}, {x: 415, y: 525}, {x: 330, y: 400}];
const CARD = [0, 1, 2, 3].map(i => ({x: i % 2 ? 710 : 0, y: i < 2 ? 705 : 865, w: 690, h: 145}));
const LABS = [['Lab 1', 'MapReduce', 'MapReduce', [0, 1]], ['Lab 2', 'KV server', '键值服务器', [2]], ['Lab 3', 'Raft', 'Raft', [3]],
              ['Lab 4', 'KV on Raft', 'Raft 上的键值服务', [0, 2, 3]], ['Lab 5', 'Sharded KV', '分片键值服务', []]];
const LY = i => 80 + i * 188;
const cl = s => s.replace(/^\t+/, '');
function page(o) {
  const A = o.A || 0, B = o.B || 0, m = o.m || [], mh = o.mh || [], L = o.L || 0, lh = o.lh || [], link = o.link || [];
  // ---- band A: one process
  if (A > 0) {
    const ka = clamp(A * 3, 0, 1), hot = o.aHot || 0;
    ctx.save(); ctx.globalAlpha *= ka; if (hot > 0) glow(700, 125, 700, C.sky, .18 * hot);
    rr(0, 10, 1410, 225, 16); ctx.fillStyle = mixHex('#0E1628', C.sky, .06 + .08 * hot); ctx.fill(); ctx.setLineDash([10, 8]); ctx.lineWidth = 2; ctx.strokeStyle = rgba(C.sky, .45 + .4 * hot); ctx.stroke(); ctx.restore();
    text('A', 26, 46, {size: 30, font: F.mono, weight: 700, color: C.sky, align: 'left', alpha: ka});
    text('one process · 一个进程', 62, 46, {size: 22, font: F.zh, weight: 600, color: C.ink, align: 'left', alpha: ka});
    text('src/main/mrsequential.go', 330, 46, {size: 19, font: F.code, color: C.dim, align: 'left', alpha: ka});
    tag(D.med.toFixed(2) + ' s · this run · 本次运行', 1180, 46, C.sky, {size: 17, alpha: ka * clamp(A * 6 - 5, 0, 1)});
    AN.forEach(([en, zh, ln], i) => {
      const k = clamp(A * 6 - i, 0, 1), x = 120 + i * 235, y = 128; if (k <= 0) return;
      if (i) arrow({x: x - 235 + 102, y}, {x: x - 104, y}, C.dim, {alpha: k, lw: 2.5, head: 12});
      panel(x, y, 200, 84, {alpha: k, fill: i === 2 ? mixHex(C.panel2, C.gold, .12) : C.panel2, edge: i === 2 ? rgba(C.gold, .6) : rgba(C.sky, .45)});
      text(en, x, y - 12, {size: en.length > 9 ? 22 : 25, font: i === 2 || i === 5 ? F.code : F.sans, weight: 600, color: i === 2 ? C.gold : C.ink, alpha: k});
      text(zh, x, y + 20, {size: 17, font: /[一-鿿]/.test(zh) ? F.zh : F.code, color: C.dim, alpha: k});
      text(ln, x, y + 66, {size: 17, font: F.code, color: C.dim, alpha: k});
    });
  }
  // ---- band B: the same job over machines that pass messages
  if (B > 0) {
    const kb = clamp(B * 3, 0, 1), hot = o.bHot || 0;
    ctx.save(); ctx.globalAlpha *= kb; if (hot > 0) glow(700, 470, 760, C.sky, .14 * hot);
    rr(0, 255, 1410, 430, 16); ctx.fillStyle = mixHex('#0E1628', C.sky, .04 + .06 * hot); ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = rgba(C.dim, .35 + .3 * hot); ctx.stroke(); ctx.restore();
    text('B', 26, 291, {size: 30, font: F.mono, weight: 700, color: C.sky, align: 'left', alpha: kb});
    text('many machines, passing messages · 多台机器，互相发消息', 62, 291, {size: 22, font: F.zh, weight: 600, color: C.ink, align: 'left', alpha: kb});
    const k1 = clamp(B * 4 - .5, 0, 1), k2 = clamp(B * 4 - 1.5, 0, 1), k3 = clamp(B * 4 - 2.5, 0, 1);
    server(BCO.x, BCO.y, 250, 160, {alpha: k1, edge: C.ink, led: C.ink, rows: 3, label: 'coordinator · 协调者', lsize: 20, seed: 9, t: 0});
    BW.forEach((p, j) => { line(BCO.x + 126, BCO.y, p.x - 86, p.y, C.dim, 2, k2 * .8, [7, 6]); server(p.x, p.y, 170, 70, {alpha: k2, rows: 1, label: 'worker ' + (j + 1) + (j === 1 ? ' · Frankenstein' : ''), lsize: 17, seed: j, t: 0}); });
    BRD.forEach((p, j) => { BW.forEach(w => line(w.x + 86, w.y, p.x - 81, p.y, C.dim, 1.5, k3 * .5, [5, 6]));
      server(p.x, p.y, 160, 66, {alpha: k3, rows: 1, label: 'reduce', lsize: 17, seed: 5 + j, t: 0});
      arrow({x: p.x + 82, y: p.y}, {x: BF[j].x - 34, y: p.y}, C.gold, {alpha: k3, lw: 2, head: 10});
      fileIcon(BF[j].x, BF[j].y, 54, 66, {color: C.gold, alpha: k3, rows: 3, seed: j}); });
    text('mr-out-*', BF[1].x, BF[1].y + 58, {size: 16, font: F.code, color: C.gold, alpha: k3});
  }
  // ---- markers and their cards
  for (let i = 0; i < 4; i++) {
    const k = m[i] || 0, h = mh[i] || 0; if (k <= 0) continue;
    marker(i, MK[i].x, MK[i].y, 25, k, h);
    const c = CARD[i], col = PC[i];
    ctx.save(); ctx.globalAlpha *= k; if (h > 0) glow(c.x + c.w / 2, c.y + c.h / 2, 420, col, .14 * h);
    rr(c.x, c.y, c.w, c.h, 14); ctx.fillStyle = mixHex('#0E1628', col, .07 + .1 * h); ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = rgba(col, .35 + .55 * h); ctx.stroke(); ctx.restore();
    marker(i, c.x + 38, c.y + 38, 20, k, h);
    text(PN[i][0], c.x + 72, c.y + 30, {size: 23, weight: 600, color: C.ink, align: 'left', alpha: k});
    text(PN[i][1], c.x + 72, c.y + 58, {size: 17, font: F.zh, color: C.dim, align: 'left', alpha: k});
    const rows = i === 0 ? [['crash.go', 23, cl(D.code.crash.lines[3]), '→ os.Exit(1)'], ['', 26, cl(D.code.crash.lines[6]), '→ sleep ≤ 10 s']]
               : i === 2 ? [['labrpc.go', 302, cl(D.code.dropreq.lines[0]), ''], ['', 349, cl(D.code.droprep.lines[5]), '']] : null;
    if (rows) {
      rows.forEach(([f, n, s, gl], r) => { const y = c.y + 94 + r * 30;
        text(String(n), c.x + 58, y, {size: 15, font: F.code, color: C.dim, align: 'right', alpha: k});
        text(s, c.x + 70, y, {size: i === 0 ? 19 : 17, font: F.code, color: C.ink, align: 'left', alpha: k});
        if (gl) text(gl, c.x + c.w - 18, y, {size: 16, font: F.mono, weight: 700, color: col, align: 'right', alpha: k}); });
      text(i === 0 ? 'src/mrapps/crash.go' : 'src/labrpc/labrpc.go · processReq()', c.x + c.w - 18, c.y + 30, {size: 14, font: F.code, color: C.dim, align: 'right', alpha: k});
      if (k > .5 && (o.alpha ?? 1) > .5) codeShown(i === 0 ? {key: 'pg-crash', file: 'src/mrapps/crash.go', a: 23, b: 26, fn: 'maybeCrash'} : {key: 'pg-drop', file: 'src/labrpc/labrpc.go', a: 302, b: 349, fn: 'processReq'});
    } else {
      const t = i === 1 ? ['one task handed out twice: the first worker was only slow', '同一个任务派了两次：第一个 worker 只是慢']
                        : ['only the coordinator knows which tasks are done', '只有协调者知道哪些任务做完了'];
      text(t[0], c.x + 72, c.y + 98, {size: 18, color: C.dim, align: 'left', alpha: k}); text(t[1], c.x + 72, c.y + 124, {size: 15, font: F.zh, color: C.dim, align: 'left', alpha: k});
    }
  }
  // the root of markers 1–3 (told in "sofar")
  if (o.root > 0) { line(30, 678, 1380, 678, C.gold, 3, o.root); text('all from one fact: machines share nothing, they only send messages · 都来自同一个事实：机器什么都不共享，只能发消息', 705, 663, {size: 18, font: F.zh, weight: 600, color: C.gold, alpha: o.root}); }
  // ---- column L: the five labs
  if (L > 0) {
    const kl = clamp(L * 3, 0, 1);
    text('L', 1458, 40, {size: 30, font: F.mono, weight: 700, color: C.gold, align: 'left', alpha: kl});
    text('five labs · 五个 Lab', 1494, 40, {size: 22, font: F.zh, weight: 600, color: C.ink, align: 'left', alpha: kl});
    LABS.forEach(([n, en, zh, mm], i) => {
      const k = clamp(L * 5 - i, 0, 1), h = lh[i] || 0, y0 = LY(i); if (k <= 0) return;
      ctx.save(); ctx.globalAlpha *= k; if (h > 0) glow(1620, y0 + 82, 260, C.gold, .25 * h);
      rr(1450, y0, 340, 165, 14); ctx.fillStyle = mixHex(C.panel, C.gold, .1 * h); ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = h > 0 ? rgba(C.gold, .4 + .6 * h) : C.line; ctx.stroke(); ctx.restore();
      text(n, 1474, y0 + 38, {size: 28, font: F.mono, weight: 700, color: h > 0 ? C.gold : C.ink, align: 'left', alpha: k});
      text(en, 1474, y0 + 76, {size: 22, weight: 600, color: C.ink, align: 'left', alpha: k});
      text(zh, 1474, y0 + 102, {size: 16, font: F.zh, color: C.dim, align: 'left', alpha: k});
      mm.forEach((t, j) => marker(t, 1490 + j * 48, y0 + 138, 16, k));
      if (i === 4) tag('speed · 速度', 1545, y0 + 138, C.gold, {size: 16, alpha: k});
      const lk = (link[i] || 0) * k;
      if (lk > 0) { mm.forEach(t => line(1450, y0 + 82, MK[t].x + 24, MK[t].y, PC[t], 3, lk * .9, [9, 7]));
        if (i === 4) line(1450, y0 + 82, 1290, 60, C.gold, 3, lk * .9, [9, 7]); }
    });
  }
}
// the small copy of the page under the progress ticks: lit parts {A, B, m:[4], L}
function miniPage(o, a = 1) {
  if (a <= 0) return;
  const y = 130, h = 38, x0 = 1238, m = o.m || [];
  const seg = (x, w, k, lab, c) => { ctx.save(); ctx.globalAlpha *= a; rr(x, y - h / 2, w, h, 9); ctx.fillStyle = mixHex(C.panel, c, .16 * k); ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = k > 0 ? rgba(c, .35 + .6 * k) : C.line; ctx.stroke(); ctx.restore();
    text(lab, x + 17, y + 1, {size: 16, font: F.mono, weight: 700, color: k > 0 ? c : C.faint, alpha: a}); };
  const kA = o.A || 0, kB = Math.max(o.B || 0, ...m.map(v => v || 0)), kL = o.L || 0;
  seg(x0, 130, kA, 'A', C.sky);
  for (let i = 0; i < 6; i++) { ctx.save(); ctx.globalAlpha *= a * (.35 + .65 * kA); ctx.fillStyle = kA > 0 ? C.sky : C.faint; ctx.beginPath(); ctx.arc(x0 + 44 + i * 15, y, 4.5, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
  seg(x0 + 140, 236, kB, 'B', C.sky);
  for (let i = 0; i < 4; i++) marker(i, x0 + 140 + 60 + i * 46, y, 13, a * (.3 + .7 * (m[i] || 0)), m[i] || 0);
  seg(x0 + 386, 216, kL, 'L', C.gold);
  for (let i = 0; i < 5; i++) { ctx.save(); ctx.globalAlpha *= a * (.35 + .65 * kL); rr(x0 + 386 + 40 + i * 33, y - 10, 24, 20, 4); ctx.fillStyle = kL > 0 ? rgba(C.gold, .7) : C.faint; ctx.fill(); ctx.restore(); }
}

/* ---- real source panes, cut from 6.5840/ by data.py ---- */
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
    if (m && m[2] > 0) { // the value beside the line; when the line is too long for it, in a callout row under the pane (never over the code)
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
const inR = (n, a, b) => n >= a && n <= b ? 1 : 0;

/* ---- a book ---- */
const BOOKS = D.books.map(b => b.file.replace(/^pg-|\.txt$/g, ''));
const BOOKT = {being_ernest: 'Ernest', dorian_gray: 'Dorian Gray', frankenstein: 'Frankenstein', grimm: 'Grimm', huckleberry_finn: 'Huck Finn', metamorphosis: 'Metamorphosis', sherlock_holmes: 'Sherlock', tom_sawyer: 'Tom Sawyer'};
const FRANK = BOOKS.indexOf('frankenstein');
function book(i, x, y, a = 1, o = {}) {
  if (a <= 0) return;
  const s = o.s || 1, c = o.color || C.gold;
  fileIcon(x, y, 58 * s, 74 * s, {color: c, alpha: a, rows: 3, seed: i * 3, glow: o.glow, dash: o.dash});
  if (o.label !== false) text(BOOKT[BOOKS[i]], x, y + 37 * s + 18, {size: 16 * Math.max(.9, s), font: F.mono, color: o.tc || C.dim, alpha: a});
}

/* ---- 0. Intro ---- */
SCN.intro = (lt, b, d) => {
  const a1 = fi(lt, .3, 1), out = fo(lt, b[3] - .2, .6);
  text('EPISODE 01', 960, 300, {size: 24, font: F.mono, weight: 700, color: C.gold, ls: 10, alpha: a1 * out});
  text('Why Distributed Is Hard', 960, 390 + 30 * (1 - a1), {size: 110, font: F.disp, weight: 700, alpha: a1 * out, shadow: 'rgba(0,0,0,.6)'});
  text('分布式系统难在哪', 960, 480, {size: 40, font: F.zh, color: C.dim, alpha: a1 * out});
  // b1: what a distributed system is: several computers, one job, over a network
  const k1 = win(lt, b[1] + .1, b[2] - .1);
  const P = [{x: 700, y: 650}, {x: 960, y: 600}, {x: 1220, y: 650}];
  P.forEach((p, j) => P.slice(j + 1).forEach(q => line(p.x, p.y, q.x, q.y, C.dim, 2, k1 * fi(lt, b[1] + .8), [7, 6])));
  P.forEach((p, j) => server(p.x, p.y, 150, 80, {t: lt, rows: 1, alpha: k1 * fi(lt, b[1] + j * .2, .5), seed: j}));
  for (let j = 0; j < 3; j++) { const t0 = b[1] + 1.4 + j * .9; packet(P[j], P[(j + 1) % 3], ramp(lt, t0, t0 + .8), C.gold, {r: 7}); }
  note('several computers, one job, over a network', '几台计算机，一件事，通过网络', 960, 735, {alpha: k1 * fi(lt, b[1] + 1), size: 24, color: C.dim});
  // b2: eight books → a few machines
  const k2 = win(lt, b[2], b[3] - .1);
  for (let i = 0; i < 8; i++) book(i, 330 + i * 100, 640, fi(lt, b[2] + i * .08, .5) * k2, {s: .8});
  for (let j = 0; j < 3; j++) { arrow({x: 1140, y: 640}, {x: 1330, y: 560 + j * 80}, C.dim, {alpha: k2 * fi(lt, b[2] + 1, .5), lw: 2}); server(1420, 560 + j * 80, 140, 64, {t: lt, rows: 1, alpha: k2 * fi(lt, b[2] + 1.2, .5), seed: j}); }
  // b3: src/
  const k3 = fi(lt, b[3] + .2, .7);
  text('6.5840/src/', 960, 430, {size: 64, font: F.code, weight: 700, color: C.sky, alpha: k3});
  note('given to you  ·  yours to write', '发给你的  ·  你要写的', 960, 540, {alpha: fi(lt, b[3] + .9, .6), size: 30, color: C.dim});
};

/* ---- 1. The whole idea first: two sentences, then the framework page built part by part ---- */
SCN.idea = (lt, b, d) => {
  // b0: "in two sentences"; b1, b2: the sentences, large; b3: they become the heading and the page opens under them
  const big = fo(lt, b[3] - .5, .5);
  text('In two sentences', 960, 470, {size: 56, font: F.disp, weight: 700, alpha: win(lt, .3, b[1]) * big});
  text('两句话说完这一集', 960, 535, {size: 26, font: F.zh, color: C.dim, alpha: win(lt, .3, b[1]) * big});
  const s1 = fi(lt, b[1] + .1, .6) * big, s2 = fi(lt, b[2] + .1, .6) * big;
  text('One machine counts our eight books', 960, 360, {size: 50, font: F.disp, weight: 700, alpha: s1});
  text('in a fraction of a second.', 960, 420, {size: 50, font: F.disp, weight: 700, color: C.sky, alpha: s1});
  text('一台机器数完八本书，只要零点几秒。', 960, 472, {size: 26, font: F.zh, color: C.dim, alpha: s1});
  text('Many machines are how the job scales,', 960, 580, {size: 44, font: F.disp, weight: 700, alpha: s2});
  text('and they bring four problems one process never has.', 960, 636, {size: 44, font: F.disp, weight: 700, color: C.coral, alpha: s2});
  text('要扩大规模就得用很多台机器，而它们带来四个单进程里从来没有的难题。', 960, 688, {size: 26, font: F.zh, color: C.dim, alpha: s2});
  for (let i = 0; i < 4; i++) marker(i, 810 + i * 100, 760, 22, s2 * fi(lt, b[2] + 1 + i * .25, .4));
  const pa = fi(lt, b[3] + .1, .7);
  heading(fi(lt, b[3] - .1, .7));
  const c = camAt(lt, [[0, CAM.A], [b[4] - .3, CAM.B], [b[5] - .3, CAM.m12], [b[7] - .3, CAM.m34], [b[9] - .2, CAM.whole]]);
  const m = [0, 1, 2, 3].map(i => fi(lt, b[5 + i] + .2, .7)), mh = [0, 1, 2, 3].map(i => win(lt, b[5 + i] + .2, b[6 + i] ?? b[9]));
  pageView(c, pa, {A: ramp(lt, b[3] + .4, b[3] + 5), aHot: win(lt, b[3] + .4, b[4]), B: ramp(lt, b[4] + .2, b[4] + 4.5), bHot: win(lt, b[4] + .2, b[5]),
    m, mh, L: ramp(lt, b[9] + .3, b[9] + 4), lh: [0, 1, 2, 3, 4].map(i => win(lt, b[9] + .5 + i * .7, b[9] + 1.4 + i * .7)), alpha: pa});
};

/* ---- 2. One machine: mrsequential, read in the order it runs ---- */
const STOPS = [['Read', '读文件'], ['Map', 'Map'], ['Sort', '排序'], ['Reduce', 'Reduce'], ['Write', '写结果']];
function stopStrip(x, y, cur, a) { // cur: fractional index of the current stop
  if (a <= 0) return;
  const w = 150;
  STOPS.forEach((s, i) => {
    const k = clamp(1 - Math.abs(cur - i), 0, 1), xx = x + i * w;
    if (i) line(xx - w + 34, y, xx - 34, y, C.faint, 2, a);
    ctx.save(); ctx.globalAlpha *= a; ctx.beginPath(); ctx.arc(xx, y, 14, 0, Math.PI * 2); ctx.fillStyle = k > .5 ? C.gold : (i < cur ? rgba(C.gold, .5) : C.panel2); ctx.fill(); ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
    text(s[0], xx, y + 34, {size: 20, weight: 600, color: k > .5 ? C.ink : C.dim, alpha: a});
    text(s[1], xx, y + 58, {size: 15, font: F.zh, color: C.dim, alpha: a});
  });
}
// the 18 pairs of the Frankenstein sentence: positions before (sentence order) and after sorting
function pairPos(i) { const c = i % 3, r = Math.floor(i / 3); return {x: 75 + c * 245, y: 410 + r * 50}; }
SCN.one = (lt, B, d) => {
  miniPage({A: 1}, fi(lt, .2));
  // beats: B2 plugin, B3 Map splits, B4 emits pairs, B5 the loop, B6 sort, B7 Reduce, B8 mr-out-0
  const b = [B[0], B[1], B[2], B[3], B[5], B[6], B[7], B[8]];
  const a = fi(lt, .2, .6);
  const cur = knots(lt, [[0, 0], [b[2], 0], [b[2] + .6, 1], [b[4], 1], [b[4] + .6, 0], [b[5] - .4, 0], [b[5] + .3, 2], [b[6], 2], [b[6] + .6, 3], [b[7], 3], [b[7] + .6, 4]]);
  stopStrip(110, 228, cur, a);
  // b1: one process around everything
  const kp = fi(lt, b[1], .7);
  panel(430, 505, 800, 640, {alpha: kp * .9, fill: 'rgba(18,27,49,.35)', edge: rgba(C.sky, .55), dash: [10, 8]});
  text('one process · 一个进程', 812, 208, {size: 18, font: F.zh, color: C.sky, align: 'right', alpha: kp});
  // b2: the sentence (Map gets one book's whole text; we follow one sentence of it)
  const ks = fi(lt, b[2] + .3, .7) * fo(lt, b[3] + 1.6, .6);
  text('pg-frankenstein.txt · L610–611', 60, 312, {size: 17, font: F.mono, color: C.gold, align: 'left', alpha: ks});
  ctx.save(); ctx.font = `500 26px ${F.sans}`; const sl = wrapLines(D.sentence, 740); ctx.restore();
  sl.forEach((s, i) => text(s, 60, 352 + i * 38, {size: 26, align: 'left', alpha: ks}));
  // b3: split into pairs; b5: they move to sorted order
  const kpair = fi(lt, b[3] + .4, .6), ksort = eio(ramp(lt, b[5] + .3, b[5] + 2.2));
  const used = {};
  D.words.forEach((w, i) => {
    let j = D.sorted.indexOf(w, 0); while (used[j]) j = D.sorted.indexOf(w, j + 1); used[j] = 1;
    const p0 = pairPos(i), p1 = pairPos(j), x = lerp(p0.x, p1.x, ksort), y = lerp(p0.y, p1.y, ksort) + 30 * (1 - kpair);
    const isOf = w === 'of', hot = isOf ? fi(lt, b[6] + .3, .5) : 0, dimO = 1 - .55 * fi(lt, b[6] + .3, .5) * (isOf ? 0 : 1);
    const ka = fi(lt, b[3] + .4 + i * .05, .4) * dimO;
    if (ka <= 0) return;
    tag(`${w}  "1"`, x + 100, y, hot > .5 ? C.gold : mixHex(C.dim, C.gold, .6), {size: 18, alpha: ka});
  });
  // b4: all of it goes into intermediate
  const ki = fi(lt, b[4] + .4, .6) * fo(lt, b[6]);
  brace(60, 800, 680, '', C.gold, ki, 1);
  text('intermediate  []mr.KeyValue', 430, 728, {size: 20, font: F.code, color: C.gold, alpha: ki});
  text(`18 pairs from this sentence · ${fmtN(D.total_words)} from all eight books`, 430, 762, {size: 17, color: C.dim, alpha: ki});
  text('18 个来自这句话 · 八本书一共 ' + fmtN(D.total_words) + ' 个', 430, 788, {size: 15, font: F.zh, color: C.dim, alpha: ki});
  // b6: the run of "of" (sorted slots 12 and 13) → Reduce → "2"; b7: one line of mr-out-0
  const kr = fi(lt, b[6] + .8, .6), o1 = pairPos(12), o2 = pairPos(13), mx = (o1.x + o2.x) / 2 + 100;
  brace(o1.x + 40, o2.x + 160, o1.y + 22, '', C.gold, kr * fo(lt, b[7]), 1);
  arrow({x: mx, y: o1.y + 62}, {x: mx, y: 706}, C.gold, {alpha: kr * fo(lt, b[7]), p: eo(ramp(lt, b[6] + .8, b[6] + 1.4))});
  text('Reduce("of", ["1", "1"])  →  "2"', 430, 740, {size: 22, font: F.code, color: C.gold, alpha: kr * fo(lt, b[7])});
  const ko = fi(lt, b[7] + .3, .6);
  fileIcon(110, 750, 64, 80, {color: C.gold, alpha: ko, rows: 0});
  text('mr-out-0', 110, 808, {size: 15, font: F.mono, color: C.gold, alpha: ko});
  text('of 2', 170, 730, {size: 28, font: F.code, align: 'left', alpha: ko});
  text(`the ${D.top[0][1]}    ← all eight books · 八本书合计`, 170, 772, {size: 22, font: F.code, color: C.dim, align: 'left', alpha: fi(lt, b[7] + 1.2, .6)});
  // the code, right side, in the order it runs
  const X = 860, Y = 186, Wd = 1020;
  srcView(X, Y, Wd, 'map', {alpha: win(lt, b[2] + .2, b[4]), fn: 'Map()', hl: n => b[3] > lt ? inR(n, 19, 19) : (inR(n, 21, 21) + inR(n, 24, 24) + inR(n, 28, 28)),
    mark: n => n === 21 ? ['separator = not a letter · 分隔符', C.gold, fi(lt, b[3] + .3)] : n === 28 ? ['("of", "1")', C.gold, fi(lt, B[4] + .2)] : null});
  tag('plugin = Map + Reduce, loaded at run time · 插件：运行时加载的 Map 和 Reduce', 1370, 740, C.sky, {size: 17, alpha: win(lt, b[2] + .6, b[4])});
  srcView(X, Y, Wd, 'seqread', {alpha: win(lt, b[4], b[5]), fn: 'main()', hl: n => inR(n, 49, 50),
    mark: n => n === 49 ? ['mapf = wc.go Map', C.gold, fi(lt, b[4] + .5)] : n === 50 ? ['+18 pairs · 词对', C.gold, fi(lt, b[4] + 1)] : null});
  srcView(X, Y, Wd, 'seqsort', {alpha: win(lt, b[5], b[6]), fn: 'main()', hl: n => inR(n, 59, 59),
    mark: n => n === 59 ? ['sort by Key · 按键排序', C.gold, fi(lt, b[5] + .5)] : null});
  srcView(X, Y, Wd, 'seqreduce', {alpha: win(lt, b[6]), fn: 'main()', lh: 30, hl: n => lt < b[7] ? inR(n, 70, 73) * fi(lt, b[6] + .2) + inR(n, 78, 78) * fi(lt, b[6] + 1.2) : inR(n, 81, 81),
    mark: n => n === 72 ? ['j stops after the 2nd "of"', C.gold, fi(lt, b[6] + .5) * fo(lt, b[7])] : n === 78 ? ['reducef = wc.go Reduce → "2"', C.gold, fi(lt, b[6] + 1.2)] : n === 81 ? ['"of 2"', C.gold, fi(lt, b[7] + .3)] : null});
};

/* ---- 3. The real run ---- */
function stat(x, y, val, en, zh, a, c = C.gold) {
  if (a <= 0) return;
  panel(x, y, 400, 170, {alpha: a, fill: C.panel});
  text(val, x, y - 18, {size: 54, font: F.mono, weight: 700, color: c, alpha: a});
  text(en, x, y + 40, {size: 22, color: C.ink, alpha: a});
  text(zh, x, y + 66, {size: 16, font: F.zh, color: C.dim, alpha: a});
}
SCN.run = (lt, b, d) => {
  miniPage({A: 1}, fi(lt, .2));
  const out = fo(lt, b[4] - .1, .6);
  panel(960, 230, 1100, 76, {alpha: fi(lt, .2) * out, fill: '#0E1628'});
  text('$ ./mrsequential wc.so pg-*.txt', 440, 230, {size: 26, font: F.code, color: C.mint, align: 'left', alpha: fi(lt, .2) * out});
  const c1 = eo(ramp(lt, b[1], b[1] + 2.5));
  stat(540, 420, (D.total_bytes / 1e6 * c1).toFixed(1) + ' MB', 'of text, 8 books', '文本，八本书', fi(lt, b[1]) * out);
  stat(960, 420, fmtN(D.total_words * c1), 'words', '个词', fi(lt, b[1] + .4) * out);
  stat(1380, 420, fmtN(D.distinct * c1), 'different words', '个不同的词', fi(lt, b[1] + .8) * out);
  const c2 = eo(ramp(lt, b[2], b[2] + 1.6));
  stat(750, 640, '"the" ' + fmtN(D.top[0][1] * c2), 'the top word', '出现最多的词', fi(lt, b[2]) * out);
  const k3 = fi(lt, b[3]) * out, f3 = eio(ramp(lt, b[3] + .2, b[3] + 1.4));
  panel(1170, 640, 400, 170, {alpha: k3});
  ringArc(1060, 640, 52, f3 * D.med, C.sky, 8, k3);
  text((D.med * f3).toFixed(2) + ' s', 1250, 622, {size: 54, font: F.mono, weight: 700, color: C.sky, alpha: k3});
  text('one laptop, median of ' + D.times.length + ' runs', 1250, 676, {size: 18, color: C.dim, alpha: k3});
  text('一台笔记本，' + D.times.length + ' 次运行的中位数', 1250, 700, {size: 15, font: F.zh, color: C.dim, alpha: k3});
  // b4: the question
  const q = fi(lt, b[4] + .3, .7);
  text('So why more than one machine?', 960, 470, {size: 64, font: F.disp, weight: 700, alpha: q});
  text('为什么还要用不止一台机器？', 960, 550, {size: 34, font: F.zh, color: C.dim, alpha: q});
};

/* ---- 4. Now make it a terabyte ---- */
SCN.scale = (lt, b, d) => {
  miniPage({A: 1}, fi(lt, .2));
  const k0 = fi(lt, b[0] + .3) * fo(lt, b[3] - .2);
  // area: 1 TB square vs the 3.3 MB speck (side ratio = sqrt(302,929) ≈ 550)
  const side = 520, sp = side / Math.sqrt(D.scale), grow = eio(ramp(lt, b[0] + .8, b[0] + 2.4));
  ctx.save(); ctx.globalAlpha *= k0; rr(1240 - side / 2 * grow, 490 - side / 2 * grow, side * grow, side * grow, 6); ctx.fillStyle = rgba(C.gold, .12); ctx.fill(); ctx.strokeStyle = rgba(C.gold, .7); ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
  ctx.save(); ctx.globalAlpha *= k0; ctx.fillStyle = C.gold; ctx.fillRect(1240 - side / 2 + 4, 490 - side / 2 + 4, Math.max(2, sp), Math.max(2, sp)); ctx.restore();
  pulse(1240 - side / 2 + 5, 490 - side / 2 + 5, ramp(lt, b[0] + 1.2, b[0] + 2.4), C.gold, 6, 60);
  text('8 books · 3.3 MB', 1240 - side / 2 + 20, 490 - side / 2 - 22, {size: 20, font: F.mono, color: C.gold, align: 'left', alpha: k0});
  text('1 TB', 1240, 500, {size: 72, font: F.mono, weight: 700, color: C.gold, alpha: k0 * grow});
  // b1: the ratio, b2: the time, worked out from this run's time
  const k1 = fi(lt, b[1] + .2) * fo(lt, b[3] - .2);
  eq([['1 TB ÷ 3.3 MB', C.gold], ['  ≈  ', C.dim], [fmtN(D.scale), C.gold]], 120, 330, 50, {left: true, alpha: k1});
  const k2 = fi(lt, b[2] + .2) * fo(lt, b[3] - .2);
  eq([[D.med.toFixed(2) + ' s', C.sky], ['  ×  ', C.dim], [fmtN(D.scale), C.gold]], 120, 450, 50, {left: true, alpha: k2});
  eq([['≈  ', C.dim], [fmtN(D.scale * D.med), C.sky], [' s  ≈  ', C.dim], [D.hours.toFixed(1), C.sky], [' hours', C.sky]], 120, 540, 50, {left: true, alpha: fi(lt, b[2] + 1) * fo(lt, b[3] - .2)});
  tag('worked out, not measured · 推算，不是实测', 380, 640, C.dim, {size: 18, alpha: fi(lt, b[2] + 1.6) * fo(lt, b[3] - .2)});
  // b3: memory
  const k3 = win(lt, b[3] + .2, b[4]);
  panel(560, 560, 520, 290, {alpha: k3, edge: C.sky});
  text('RAM', 560, 740, {size: 24, font: F.mono, weight: 700, color: C.sky, alpha: k3});
  const rowsUp = 13 * eo(ramp(lt, b[3] + .6, b[3] + 3.4));
  for (let r = 0; r < 13; r++) { if (r > rowsUp) break; const over = r >= 8, yy = 680 - r * 32;
    for (let c = 0; c < 10; c++) { ctx.save(); ctx.globalAlpha *= k3 * Math.min(1, rowsUp - r + .3); rr(330 + c * 46, yy - 11, 40, 22, 4); ctx.fillStyle = over ? C.red : rgba(C.gold, .7); ctx.fill(); ctx.restore(); } }
  text("won't fit · 装不下", 830, 300, {size: 22, font: F.zh, color: C.red, align: 'left', alpha: k3 * fi(lt, b[3] + 2.6)});
  text('intermediate []mr.KeyValue', 1280, 430, {size: 24, font: F.code, color: C.gold, alpha: k3});
  text(fmtN(D.total_words) + ' pairs × ' + fmtN(D.scale), 1280, 490, {size: 26, font: F.mono, color: C.ink, alpha: k3});
  text('≈ ' + (D.total_words * D.scale / 1e11).toFixed(1) + ' × 10¹¹ pairs, all in memory', 1280, 540, {size: 26, font: F.mono, color: C.red, alpha: fi(lt, b[3] + 1.5) * k3});
  text('全部放在内存里 · 推算', 1280, 580, {size: 18, font: F.zh, color: C.dim, alpha: fi(lt, b[3] + 1.5) * k3});
  // b4: the paper's run
  const k4 = fi(lt, b[4] + .2);
  for (let i = 0; i < 1800; i++) { const c = i % 60, r = Math.floor(i / 60); const ka = k4 * ramp(lt, b[4] + .2 + r * .04, b[4] + .6 + r * .04);
    if (ka > 0) { ctx.fillStyle = rgba(C.sky, .85 * ka); ctx.fillRect(220 + c * 12, 300 + r * 12, 7, 7); } }
  text('≈ 1,800 machines · 约 1800 台机器', 580, 690, {size: 24, color: C.sky, alpha: k4});
  eq([['1 TB grep', C.gold], ['  ≈  ', C.dim], ['150 s', C.sky]], 1400, 440, 64, {alpha: fi(lt, b[4] + 1)});
  tag('MapReduce paper (OSDI 2004) · 论文数据', 1400, 540, C.dim, {size: 18, alpha: fi(lt, b[4] + 1.6)});
  // b5: the goal
  const k5 = fi(lt, b[5] + .2);
  chip('GOAL: SPEED · 目标：速度', 1400, 650, C.gold, eback(ramp(lt, b[5] + .2, b[5] + .8)), {size: 24, alpha: k5});
};

/* ---- 5. Two machines share nothing (toy) ---- */
SCN.nothing = (lt, b, d) => {
  miniPage({B: 1}, fi(lt, .2));
  toyTag(fi(lt, .3));
  const MA = {x: 470, y: 420}, MB = {x: 1450, y: 420};
  const k0 = fi(lt, .3, .7), last = fo(lt, b[6] - .2, .6);
  // b0–b1: two machines, each with its own memory
  [[MA, 'machine A', '机器 A'], [MB, 'machine B', '机器 B']].forEach(([p, en, zh], j) => {
    server(p.x, p.y - 40, 260, 120, {t: lt, alpha: k0, rows: 2, seed: j * 4});
    text(en, p.x, p.y - 140, {size: 26, font: F.mono, weight: 700, color: C.sky, alpha: k0}); zt(zh, p.x, p.y - 112, {alpha: k0, size: 18});
    const km = fi(lt, b[1] + .2 + j * .4) * last;
    panel(p.x, p.y + 110, 300, 110, {alpha: km, fill: '#0E1628', edge: rgba(C.sky, .5), dash: [6, 5]});
    text('memory · 内存', p.x - 135, p.y + 72, {size: 15, font: F.zh, color: C.sky, align: 'left', alpha: km});
    text(j === 0 ? 'intermediate = [ (I,1) (am,1) … ]' : 'none of A\'s data · 没有 A 的数据', p.x, p.y + 118, {size: j ? 17 : 18, font: j ? F.zh : F.code, color: j ? C.dim : C.gold, alpha: km});
  });
  // B reaches for A's slice and can't
  const kr = win(lt, b[1] + 1.4, b[2] + .4);
  arrow({x: MB.x - 160, y: MB.y + 110}, {x: MA.x + 160, y: MA.y + 110}, C.red, {alpha: kr, lw: 3, dash: [10, 8], p: eo(ramp(lt, b[1] + 1.4, b[1] + 2.6))});
  cross(960, MA.y + 110, 30, C.red, 8, kr * fi(lt, b[1] + 2.6));
  text("B can't read A's memory · B 读不到 A 的内存", 960, MA.y + 175, {size: 20, font: F.zh, color: C.red, alpha: kr * fi(lt, b[1] + 2.8)});
  // b2: the only link: the network
  const kn = fi(lt, b[2] + .2);
  line(MA.x + 132, MA.y - 40, MB.x - 132, MB.y - 40, C.violet, 4, kn * last);
  text('network · 网络', 960, MA.y - 72, {size: 22, font: F.zh, weight: 600, color: C.violet, alpha: kn * last});
  text('only messages · 只能发消息', 960, MA.y - 8, {size: 18, font: F.zh, color: C.dim, alpha: fi(lt, b[2] + 1) * last * fo(lt, b[3])});
  // b3: a call that travels as a message
  const kc = win(lt, b[3] + .2, b[5]);
  text('Count("Frankenstein")', MA.x, MA.y - 205, {size: 22, font: F.code, color: C.gold, alpha: kc});
  text('a call, sent as a message · 作为消息发出去的调用', 960, MA.y + 260, {size: 20, font: F.zh, color: C.dim, alpha: kc * fo(lt, b[4])});
  packet({x: MA.x + 132, y: MA.y - 40}, {x: MB.x - 132, y: MB.y - 40}, ramp(lt, b[3] + .8, b[3] + 2.6), C.gold, {label: 'args · 参数', ls: 16});
  text('runs Count · 执行', MB.x, MB.y - 205, {size: 20, font: F.zh, color: C.mint, alpha: win(lt, b[3] + 2.6, b[5])});
  // b4: RPC = send the arguments, wait for a reply message
  const kp = win(lt, b[4] + .2, b[6] - .2);
  chip('RPC = remote procedure call · 远程过程调用', 960, MA.y + 260, C.violet, eback(ramp(lt, b[4] + .2, b[4] + .8)), {size: 22, alpha: kp});
  packet({x: MB.x - 132, y: MB.y - 10}, {x: MA.x + 132, y: MA.y - 10}, ramp(lt, b[4] + 1.2, b[4] + 3), C.mint, {label: 'reply · 回复: 30', ls: 16});
  tag('returned ✓', MA.x + 220, MA.y - 205, C.mint, {size: 18, alpha: win(lt, b[4] + 3, b[5])});
  // b5: across a network the reply might never come
  const k5 = win(lt, b[5] + .2, b[6] - .2);
  packet({x: MA.x + 132, y: MA.y - 40}, {x: MB.x - 132, y: MB.y - 40}, ramp(lt, b[5] + .4, b[5] + 1.8), C.gold, {label: 'args', ls: 16});
  packet({x: MB.x - 132, y: MB.y - 10}, {x: 960, y: MB.y - 10}, ramp(lt, b[5] + 2.2, b[5] + 3.2), C.mint, {label: 'reply', ls: 16});
  burst(960, MB.y - 10, ramp(lt, b[5] + 3.2, b[5] + 3.9), C.violet);
  const wt = clamp(lt - (b[5] + .4), 0, 99);
  ringArc(MA.x + 200, MA.y - 150, 24, (wt % 2) / 2, C.violet, 5, k5);
  text('waiting… · 还在等', MA.x + 200, MA.y - 108, {size: 16, font: F.zh, color: C.violet, alpha: k5});
  note('one process: a call always returns', '单进程：调用总会返回', 960, 730, {alpha: k5 * fi(lt, b[5] + .6), size: 22, color: C.dim});
  // b6: all four markers grow out of it
  const k6 = fi(lt, b[6] + .2);
  line(MA.x + 132, MA.y - 40, MB.x - 132, MB.y - 40, C.violet, 4, k6);
  for (let i = 0; i < 4; i++) { const x0 = 690 + i * 180, x = 390 + i * 380, y0 = MA.y - 40, k = eo(ramp(lt, b[6] + .6 + i * .35, b[6] + 1.4 + i * .35));
    line(x0, y0, lerp(x0, x, k), y0 + 250 * k, PC[i], 2.5, k6 * k, [6, 5]); marker(i, lerp(x0, x, k), y0 + 250 * k, 30, k6 * k, k);
    text(PN[i][0], x, y0 + 320, {size: 20, weight: 600, color: C.ink, alpha: k6 * fi(lt, b[6] + 1.4 + i * .35)});
    text(PN[i][1], x, y0 + 346, {size: 16, font: F.zh, color: C.dim, alpha: k6 * fi(lt, b[6] + 1.4 + i * .35)}); }
};

/* ---- 6. Split the work ---- */
const CO = {x: 560, y: 500}, WK = [{x: 1000, y: 300}, {x: 1000, y: 500}, {x: 1000, y: 700}], RD = [{x: 1420, y: 400}, {x: 1420, y: 600}];
function coord(x, y, a, o = {}) { server(x, y, 200, 130, {t: o.t || 0, alpha: a, edge: C.ink, led: C.ink, rows: 3, state: o.state, label: o.label ?? 'coordinator · 协调者', seed: 9}); }
function splitStage(lt, b, a, o = {}) {
  coord(CO.x, CO.y, a, {t: lt});
  for (let i = 0; i < 8; i++) book(i, 170 + (i % 2) * 90, 250 + Math.floor(i / 2) * 140, a, {s: .75});
  WK.forEach((p, j) => server(p.x, p.y, 180, 110, {t: lt, alpha: a, label: 'worker ' + (j + 1), seed: j}));
  RD.forEach((p, j) => server(p.x, p.y, 160, 100, {t: lt, alpha: a * (o.reduce ?? 1), label: 'reduce ' + (j + 1), seed: 5 + j, edge: C.sky}));
}
const SMK = [{x: 1100, y: 448}, {x: 1738, y: 352}, {x: 780, y: 600}, {x: 668, y: 438}];
SCN.split = (lt, b, d) => {
  const mk = [0, 1, 2, 3].map(i => eback(ramp(lt, b[5] + .6 + i * .45, b[5] + 1.2 + i * .45)));
  miniPage({B: 1, m: mk}, fi(lt, .2));
  splitStage(lt, b, fi(lt, .2, .7), {reduce: fi(lt, b[3] + 3)});
  // b1: the coordinator holds the to-do list; b2: workers ask, do, report
  const k1 = win(lt, b[1] + .2, b[3]);
  glow(CO.x, CO.y, 200, C.ink, .2 * k1);
  tag('holds the to-do list, hands out tasks · 拿着任务清单、负责分活', CO.x + 40, 636, C.ink, {size: 17, alpha: k1});
  const k2 = win(lt, b[2] + .2, b[3]);
  WK.forEach(p => glow(p.x, p.y, 160, C.sky, .2 * k2));
  tag('asks → does → reports, all by RPC · 要任务 → 做 → 回报，都用 RPC', 1000, 205, C.sky, {size: 17, alpha: k2});
  packet({x: WK[0].x - 90, y: WK[0].y - 10}, {x: CO.x + 100, y: CO.y - 30}, ramp(lt, b[2] + .8, b[2] + 1.8), C.sky, {r: 7, label: 'ask', ls: 14});
  packet({x: CO.x + 100, y: CO.y - 20}, {x: WK[0].x - 90, y: WK[0].y}, ramp(lt, b[2] + 2, b[2] + 3), C.gold, {r: 7, label: 'task', ls: 14});
  packet({x: WK[0].x - 90, y: WK[0].y + 10}, {x: CO.x + 100, y: CO.y - 10}, ramp(lt, b[2] + 4, b[2] + 5), C.mint, {r: 7, label: 'done', ls: 14});
  // b3: books go out as map tasks, then the pairs move on to the reducers
  for (let i = 0; i < 8; i++) { const t0 = b[3] + .3 + i * .35; packet(CO, WK[i % 3], ramp(lt, t0, t0 + .9), C.gold, {bend: .12, label: i === FRANK ? 'Frankenstein' : null, ls: 16}); }
  text('8 map tasks · 8 个 map 任务', CO.x, CO.y - 110, {size: 20, font: F.zh, color: C.gold, alpha: fi(lt, b[3] + .4)});
  for (let i = 0; i < 6; i++) { const t0 = b[3] + 3.4 + i * .3; packet(WK[i % 3], RD[i % 2], ramp(lt, t0, t0 + .8), C.gold, {bend: -.1, r: 6}); }
  RD.forEach((p, j) => { const ka = fi(lt, b[3] + 4.6); arrow({x: p.x + 90, y: p.y}, {x: p.x + 230, y: p.y}, C.gold, {alpha: ka}); fileIcon(p.x + 290, p.y, 56, 70, {color: C.gold, alpha: ka, rows: 3, seed: j}); });
  // b4: the loop, now across machines
  const k4 = win(lt, b[4] + .2, b[5] + .3);
  panel(960, 790, 1000, 64, {alpha: k4, fill: '#0E1628'});
  text('for _, filename := range os.Args[2:] {   // mrsequential.go:39', 960, 790, {size: 22, font: F.code, color: C.dim, alpha: k4});
  // b5: every marker on the page is now possible, at its place on this picture
  mk.forEach((k, i) => marker(i, SMK[i].x, SMK[i].y, 26, clamp(k, 0, 1), clamp(k, 0, 1)));
  note('every marker on our page can now happen', '图上的每个标记现在都可能发生', 1480, 245, {alpha: fi(lt, b[5] + 2.6), size: 24, color: C.ink});
};

/* ---- 7. Marker 1: a worker dies ---- */
const W3 = [{x: 560, y: 320}, {x: 960, y: 320}, {x: 1360, y: 320}];
SCN.fail = (lt, B, d) => {
  miniPage({B: .4, m: [1, 0, 0, 0]}, fi(lt, .2));
  // beats: B3 toy clock, B4 dead = slow; the rest as before
  const b = [B[0], B[1], B[2], B[3], B[5], B[6], B[7]];
  const stageA = fo(lt, B[3] - .3, .6);
  const dieT = b[0] + 1.8;
  W3.forEach((p, j) => {
    const dead = j === 1 && lt > dieT;
    const prog = j === 1 ? Math.min(.5, ramp(lt, 0, dieT) * .5) : clamp(.3 + lt / 14, 0, 1);
    server(p.x, p.y, 220, 140, {t: lt, alpha: fi(lt, .2) * stageA, state: dead ? 'dead' : 'ok', prog, label: 'worker ' + (j + 1), seed: j});
    book([2, FRANK, 6][j], p.x, p.y - 140, fi(lt, .2) * stageA, {s: .6, label: false, color: j === 1 && dead ? C.red : C.gold});
  });
  burst(W3[1].x, W3[1].y, ramp(lt, dieT, dieT + .7));
  marker(0, W3[1].x + 130, W3[1].y - 80, 24, fi(lt, dieT + .2) * stageA, 1);
  text('power lost halfway · 数到一半断电', W3[1].x, W3[1].y + 120, {size: 20, font: F.zh, color: C.red, alpha: fi(lt, dieT + .3) * stageA * fo(lt, b[1] - .2)});
  // b1: in one process, a crash takes everything with it
  const k1 = win(lt, b[1] + .2, b[2]);
  panel(960, 610, 760, 170, {alpha: k1, edge: rgba(C.sky, .6), dash: [8, 6]});
  for (let i = 0; i < 8; i++) book(i, 680 + i * 80, 600, k1 * .5, {s: .5, label: false, color: C.dim});
  cross(960, 610, 70, C.red, 10, k1);
  note('one process: crash = nothing left half-done', '单进程：一崩全没，不存在“做了一半”', 960, 730, {alpha: k1, size: 22, color: C.dim});
  // b2: the other seven books are fine
  const k2 = fi(lt, b[2] + .2) * stageA;
  for (let i = 0; i < 8; i++) { const x = 400 + i * 160; book(i, x, 600, k2 * (i === FRANK ? .9 : 1), {s: .62, color: i === FRANK ? C.red : C.gold, dash: i === FRANK ? [6, 5] : null});
    if (i !== FRANK) check(x, 690 + 20, 16, C.mint, fi(lt, b[2] + .5 + i * .08) * stageA); else cross(x, 710, 14, C.red, 6, fi(lt, b[2] + .5) * stageA); }
  // B3 (toy): the coordinator watches a clock; B4: dead and slow send the same thing
  const k3 = win(lt, B[3] + .2, B[5]);
  if (k3 > 0) {
    toyTag(k3);
    coord(800, 330, k3, {t: lt, label: 'coordinator · 协调者'});
    const quiet = clamp(lt - (B[3] + .6), 0, B[4] - B[3]);
    ringArc(1080, 330, 58, quiet / (B[4] - B[3]), C.coral, 8, k3);
    text('no word from worker 2', 1260, 312, {size: 22, weight: 600, color: C.coral, align: 'left', alpha: k3});
    text('worker 2 一直没消息', 1260, 344, {size: 17, font: F.zh, color: C.dim, align: 'left', alpha: k3});
    text('?', 1080, 333, {size: 56, font: F.disp, weight: 700, color: C.red, alpha: k3 * fi(lt, B[3] + 2)});
    const kp = fi(lt, B[4] + .2) * k3;
    [['dead', '死了', C.red], ['slow', '只是慢', C.coral]].forEach(([en, zh, c], j) => {
      const x = 640 + j * 640; panel(x, 620, 480, 190, {alpha: kp});
      text('worker 2 · ' + en, x, 560, {size: 24, font: F.mono, weight: 700, color: c, alpha: kp}); zt(zh, x, 590, {alpha: kp});
      line(x - 200, 650, x + 200, 650, C.dim, 3, kp); text('messages: none · 没有任何消息', x, 690, {size: 18, font: F.zh, color: C.dim, alpha: kp});
    });
    text('=', 960, 620, {size: 80, font: F.disp, weight: 700, color: C.ink, alpha: fi(lt, B[4] + 1.4) * kp});
  }
  // b4–b5: crash.go does both on purpose
  const k4 = fi(lt, b[4] + .2);
  srcView(120, 190, 860, 'crash', {alpha: k4, fn: 'maybeCrash()', hl: n => lt < b[5] ? inR(n, 22, 22) : (inR(n, 23, 25) * 1 + inR(n, 26, 30)),
    hc: n => n <= 25 ? C.red : C.coral,
    mark: n => n === 22 ? ['rr: random 0..999', C.gold, fi(lt, b[4] + .8)] : n === 23 ? ['< 330: exit', C.red, fi(lt, b[5] + .3)] : n === 26 ? ['< 660: stall', C.coral, fi(lt, b[5] + 1)] : n === 28 ? ['up to 10 s', C.coral, fi(lt, b[5] + 1.5)] : null});
  const kb = fi(lt, b[5] + .3), segs = [[.33, C.red, 'exit', '退出'], [.33, C.coral, 'stall ≤ 10 s', '卡住'], [.34, C.mint, 'normal', '正常']];
  let x = 1080;
  segs.forEach(([f, c, en, zh], j) => { const w = 720 * f * eo(ramp(lt, b[5] + .3 + j * .5, b[5] + .9 + j * .5)); ctx.save(); ctx.globalAlpha *= kb; rr(x, 420, Math.max(0, w - 6), 70, 8); ctx.fillStyle = rgba(c, .8); ctx.fill(); ctx.restore();
    text(en, x + 720 * f / 2, 530, {size: 22, weight: 600, color: c, alpha: kb * fi(lt, b[5] + .6 + j * .5)}); zt(zh, x + 720 * f / 2, 560, {alpha: kb * fi(lt, b[5] + .6 + j * .5), size: 18}); x += 720 * f; });
  text('each Map / Reduce call · 每次调用', 1440, 380, {size: 20, font: F.zh, color: C.dim, alpha: kb});
  epTag(3, 1440, 680, fi(lt, b[6] + .2), C.red);
  note('how the coordinator recovers', '协调者怎么恢复', 1440, 740, {alpha: fi(lt, b[6] + .4), size: 24});
};

/* ---- 8. Marker 2: two writers, one file ---- */
SCN.conc = (lt, B, d) => {
  miniPage({B: .4, m: [.35, 1, 0, 0]}, fi(lt, .2));
  // beats: B4 "that's concurrency"; B5 threads; B6 the episodes that teach it
  const b = [B[0], B[1], B[2], B[3], B[5], B[6]];
  const stA = fo(lt, b[4] - .3, .6);
  const w2 = {x: 520, y: 330}, w3 = {x: 1400, y: 330}, fileP = {x: 960, y: 610};
  coord(960, 260, fi(lt, .2) * stA * fo(lt, b[1]), {t: lt, label: 'coordinator · 协调者'});
  server(w2.x, w2.y, 220, 140, {t: lt, alpha: fi(lt, .2) * stA, state: lt < b[1] ? 'dead' : 'hot', prog: lt < b[1] ? .5 : .5 + .5 * ramp(lt, b[1], b[2] + 1), label: 'worker 2', seed: 1});
  text(lt < b[1] ? 'presumed dead · 以为死了' : 'only slow · 只是慢', w2.x, w2.y + 120, {size: 20, font: F.zh, color: lt < b[1] ? C.red : C.coral, alpha: fi(lt, .4) * stA});
  server(w3.x, w3.y, 220, 140, {t: lt, alpha: fi(lt, .6) * stA, prog: ramp(lt, b[0] + 2, b[2] + 1), label: 'worker 3', seed: 2});
  packet({x: 1060, y: 260}, {x: w3.x - 110, y: w3.y}, ramp(lt, b[0] + .6, b[0] + 1.8), C.gold, {label: 'Frankenstein', ls: 16, bend: -.1});
  // b1: both counting the same book
  book(FRANK, w2.x, w2.y - 140, fi(lt, b[1]) * stA, {s: .6, label: false});
  book(FRANK, w3.x, w3.y - 140, fi(lt, b[0] + 1.8) * stA, {s: .6, label: false});
  // b2: both write the same file at the same time
  const k2 = fi(lt, b[2]) * stA;
  fileIcon(fileP.x, fileP.y, 150, 190, {color: C.coral, alpha: k2, glow: .3});
  marker(1, fileP.x + 100, fileP.y - 110, 24, k2, 1);
  text('same output file · 同一个输出文件', fileP.x, fileP.y + 125, {size: 18, font: F.zh, color: C.coral, alpha: k2});
  for (let i = 0; i < 6; i++) { const t0 = b[2] + .3 + i * .4, from = i % 2 ? w3 : w2; packet({x: from.x + (i % 2 ? -110 : 110), y: from.y + 40}, {x: fileP.x + (i % 2 ? 40 : -40), y: fileP.y - 40}, ramp(lt, t0, t0 + .9), i % 2 ? C.sky : C.coral, {r: 7}); }
  for (let r = 0; r < 6; r++) { const ka = k2 * fi(lt, b[2] + 1.2 + r * .4); ctx.save(); ctx.globalAlpha *= ka; rr(fileP.x - 52, fileP.y - 66 + r * 24, 100 * (.6 + .4 * rnd(r)), 12, 3); ctx.fillStyle = r % 2 ? C.sky : C.coral; ctx.fill(); ctx.restore(); }
  // b3: what a reader might see
  const k3 = fi(lt, b[3] + .2) * stA;
  [['Frankenstein 30', C.mint, '✓ real count'], ['Frankenstein 60', C.coral, 'both, added'], ['Frankenstein 17', C.coral, 'half of each']].forEach(([s, c, n], j) => {
    const ka = k3 * fi(lt, b[3] + .4 + j * .5); tag(s, 1560, 560 + j * 80, c, {size: 22, alpha: ka}); text(n, 1760, 560 + j * 80, {size: 16, color: C.dim, align: 'left', alpha: ka});
  });
  text('only 30 is right · 只有 30 是对的', 360, 640, {size: 22, font: F.zh, color: C.dim, alpha: k3});
  // B4: the word for it
  chip('concurrency: two things at once, same data · 并发：同时进行，碰同一份数据', 960, 790, C.coral, eback(ramp(lt, B[4] + .2, B[4] + .8)), {size: 20, alpha: fi(lt, B[4] + .2) * stA});
  // b4: the same thing between threads in one machine
  const k4 = win(lt, b[4] + .2);
  if (k4 > 0) {
    panel(960, 500, 1100, 480, {alpha: k4, edge: rgba(C.coral, .6)});
    text('one machine, two goroutines · 一台机器，两个 goroutine', 960, 300, {size: 24, font: F.zh, color: C.coral, alpha: k4});
    [0, 1].forEach(j => { const x = 640 + j * 640; text('goroutine ' + (j + 1), x, 380, {size: 22, font: F.mono, color: C.sky, alpha: k4});
      for (let s = 0; s < 3; s++) { const ka = k4 * fi(lt, b[4] + .6 + s * .35 + j * .15); rr(x - 120, 410 + s * 46, 240, 34, 6); ctx.save(); ctx.globalAlpha *= ka; ctx.fillStyle = rgba(C.sky, .25); ctx.fill(); ctx.restore();
        text(['read count', 'count + 1', 'write count'][s], x, 427 + s * 46, {size: 18, font: F.code, alpha: ka}); } });
    cylinder(960, 470, 120, 90, {color: C.coral, alpha: k4, inner: 'count', label: 'shared variable · 共享变量'});
    tag('go test -race  → reports the race · 报告数据竞争', 960, 670, C.coral, {size: 20, alpha: k4 * fi(lt, b[4] + 1.6)});
    epTag(3, 760, 760, fi(lt, b[5] + .2), C.coral); text('atomic rename · 原子改名', 760, 800, {size: 18, font: F.zh, color: C.dim, alpha: fi(lt, b[5] + .3)});
    epTag(4, 1160, 760, fi(lt, b[5] + .6), C.coral); text('locks and races · 锁和竞争', 1160, 800, {size: 18, font: F.zh, color: C.dim, alpha: fi(lt, b[5] + .7)});
  }
};

/* ---- 9. Marker 3: did it arrive? ---- */
SCN.net = (lt, b, d) => {
  miniPage({B: .4, m: [.35, .35, 1, 0]}, fi(lt, .2));
  const cl = {x: 330, y: 300}, sv = {x: 1590, y: 300}, top = fo(lt, b[6] - .2, .5);
  const k0 = fi(lt, .2) * top;
  server(cl.x, cl.y, 200, 120, {t: lt, alpha: k0, label: 'caller · 调用方', seed: 1});
  server(sv.x, sv.y, 200, 120, {t: lt, alpha: k0, label: 'server · 服务器', seed: 3, state: lt > b[4] + 1 && lt < b[4] + 2.2 ? 'hot' : 'ok'});
  tag('RPC', 960, 205, C.violet, {size: 18, alpha: win(lt, .4, b[1]) * top});
  // b1: the fake network in the middle
  const k1 = fi(lt, b[1]) * top;
  panel(960, 300, 560, 150, {alpha: k1, edge: rgba(C.violet, .7), dash: [10, 8], fill: rgba(C.violet, .06)});
  text('labrpc', 960, 280, {size: 34, font: F.code, weight: 700, color: C.violet, alpha: k1});
  text('a fake network inside one process · 进程内的假网络', 960, 325, {size: 18, font: F.zh, color: C.dim, alpha: k1});
  line(cl.x + 100, 300, 680, 300, C.faint, 2, k1, [6, 6]); line(1240, 300, sv.x - 100, 300, C.faint, 2, k1, [6, 6]);
  // b2: a normal call
  const t2 = b[2] + .4;
  packet({x: cl.x + 100, y: 270}, {x: sv.x - 100, y: 270}, ramp(lt, t2, t2 + 1.4), C.gold, {label: 'request', ls: 16});
  packet({x: sv.x - 100, y: 330}, {x: cl.x + 100, y: 330}, ramp(lt, t2 + 1.6, t2 + 3), C.mint, {label: 'reply', ls: 16});
  tag('true', cl.x, 205, C.mint, {size: 22, alpha: win(lt, t2 + 3, b[3]) * top});
  // b3: request dropped
  const t3 = b[3] + .5;
  packet({x: cl.x + 100, y: 270}, {x: 960, y: 270}, ramp(lt, t3, t3 + .8), C.gold, {label: 'request', ls: 16});
  burst(960, 270, ramp(lt, t3 + .8, t3 + 1.5), C.violet);
  text('handler never ran · 处理函数没执行', 960, 200, {size: 18, font: F.zh, color: C.violet, alpha: win(lt, t3 + .9, b[4]) * top});
  // b4: reply dropped, after the handler ran
  const t4 = b[4] + .3;
  packet({x: cl.x + 100, y: 270}, {x: sv.x - 100, y: 270}, ramp(lt, t4, t4 + 1), C.gold, {label: 'request', ls: 16});
  text('ran ✓', sv.x, sv.y - 100, {size: 22, font: F.mono, weight: 700, color: C.mint, alpha: win(lt, t4 + 1, b[6]) * top});
  packet({x: sv.x - 100, y: 330}, {x: 960, y: 330}, ramp(lt, t4 + 2.2, t4 + 3), C.mint, {label: 'reply', ls: 16});
  burst(960, 330, ramp(lt, t4 + 3, t4 + 3.7), C.violet);
  // b5: both cases → false
  const k5 = fi(lt, b[5] + .2) * top;
  [['lost request', '丢了请求', 760], ['lost reply', '丢了回复', 1160]].forEach(([en, zh, x], j) => {
    const ka = k5 * fi(lt, b[5] + .2 + j * .4);
    text(en + ' · ' + zh + '  →  false', x, 410, {size: 18, font: F.zh, color: C.violet, alpha: ka});
  });
  tag('false', cl.x, 205, C.violet, {size: 24, alpha: k5});
  marker(2, 960 + 300, 240, 22, fi(lt, b[3] + 1.4) * top, 1);
  // the code under the picture
  const Y = 456;
  srcView(80, Y, 860, 'call', {alpha: win(lt, b[2] + .2, b[3] + .2) * top, fn: 'Call()', hl: n => inR(n, 112, 113),
    mark: n => n === 113 ? ['false = no reply came back', C.gold, fi(lt, b[2] + 1)] : null});
  srcView(80, Y, 860, 'dropreq', {alpha: win(lt, b[3] + .2) * top, fn: 'processReq()', lh: 30, size: 16.5, hl: n => inR(n, 302, 305) * (lt < b[5] ? 1 : .6), hc: () => C.violet,
    mark: n => n === 302 ? ['< 100 of 1000 = 10%', C.violet, fi(lt, b[3] + .8)] : n === 304 ? ['Call returns false', C.violet, fi(lt, b[3] + 1.4)] : null});
  tag('processReq: delivers each request · 投递每个请求', 510, 434, C.violet, {size: 16, alpha: win(lt, b[3] + .6, b[5]) * top});
  srcView(980, Y, 860, 'droprep', {alpha: fi(lt, b[4] + .2) * top, fn: 'processReq()', lh: 30, size: 16.5, hl: n => inR(n, 349, 351) * (lt < b[5] ? 1 : .6), hc: () => C.violet,
    mark: n => n === 344 ? ['the handler already ran', C.mint, fi(lt, b[4] + 1.2)] : n === 349 ? ['another 10%', C.violet, fi(lt, b[4] + 2.6)] : n === 351 ? ['false again', C.violet, fi(lt, b[4] + 3)] : null});
  // b6: the question; b7: the answer
  const q = fi(lt, b[6] + .2, .6);
  tag('false', 960, 320, C.violet, {size: 40, alpha: q});
  text('Did the server do the work?', 960, 450, {size: 60, font: F.disp, weight: 700, alpha: q * fo(lt, b[7] - .1)});
  text('服务器到底做了没有？', 960, 525, {size: 32, font: F.zh, color: C.dim, alpha: q * fo(lt, b[7] - .1)});
  const k7 = fi(lt, b[7] + .1, .6);
  text("You can't tell.", 960, 450, {size: 72, font: F.disp, weight: 700, color: C.violet, alpha: k7});
  text('你分不出来。', 960, 530, {size: 34, font: F.zh, color: C.dim, alpha: k7});
  epTag(5, 840, 640, fi(lt, b[7] + .8), C.violet); epTag(8, 1080, 640, fi(lt, b[7] + 1), C.violet);
  text('labrpc · ErrMaybe', 960, 700, {size: 20, font: F.code, color: C.dim, alpha: fi(lt, b[7] + 1.2)});
};

/* ---- 10. So far, on the page ---- */
SCN.sofar = (lt, b, d) => {
  heading(fi(lt, .2));
  const c = camAt(lt, [[0, CAM.whole], [b[0] + 1.6, CAM.A], [b[1] - .2, CAM.all4], [b[2] - .2, CAM.B], [b[3] - .2, CAM.m34]]);
  const m4 = .3 + .7 * fi(lt, b[3] + .3);
  pageView(c, fi(lt, .2, .6), {A: 1, aHot: win(lt, b[0] + 1.6, b[1]), B: 1, bHot: win(lt, b[1], b[3]), m: [1, 1, 1, m4], mh: [0, 1, 2].map(i => win(lt, b[1] + .3 + i * .6, b[3])).concat([win(lt, b[3] + .3)]),
    L: .4, root: fi(lt, b[2] + .4, .8), alpha: 1});
};

/* ---- 11. Marker 4: the coordinator dies (toy: three notebooks) ---- */
function taskTable(x, y, s, a, done, o = {}) { // the coordinator's record: which of the eight tasks are done
  if (a <= 0) return;
  panel(x, y, 190 * s, 290 * s, {alpha: a, fill: '#0E1628', edge: o.edge || C.line});
  for (let i = 0; i < 8; i++) { const yy = y - 120 * s + i * 34 * s, dd = done[i];
    if (o.hot === i) { ctx.save(); ctx.globalAlpha *= a; rr(x - 90 * s, yy - 14 * s, 180 * s, 28 * s, 5); ctx.fillStyle = rgba(C.mint, .16); ctx.fill(); ctx.restore(); }
    text('task ' + i, x - 80 * s, yy, {size: 15 * s, font: F.mono, color: o.hot === i ? C.ink : C.dim, align: 'left', alpha: a});
    if (dd === 1) check(x + 70 * s, yy, 9 * s, C.mint, a); else if (dd === 2) text('?', x + 70 * s, yy, {size: 20 * s, font: F.mono, weight: 700, color: C.red, alpha: a}); else text('·', x + 70 * s, yy, {size: 20 * s, color: C.faint, alpha: a}); }
}
const DONE = [1, 1, 0, 1, 1, 0, 0, 0];
SCN.agree = (lt, b, d) => {
  miniPage({B: .4, m: [.35, .35, .35, 1]}, fi(lt, .2));
  const k0 = fi(lt, .2) * fo(lt, b[1] - .2);
  coord(700, 460, k0, {t: lt, label: 'the only coordinator · 唯一的协调者'}); taskTable(1180, 460, 1.2, k0, DONE);
  marker(3, 820, 380, 24, k0, 1);
  text('which tasks are done · 哪些任务做完了', 1180, 260, {size: 18, font: F.zh, color: C.dim, alpha: k0});
  // b1: three copies, each a replica; b2 (toy): one notebook says task 6 is done
  const R = [{x: 480, y: 420}, {x: 960, y: 420}, {x: 1440, y: 420}];
  const k1 = fi(lt, b[1] + .2), cut = lt > b[4] + .2, inCharge = j => fi(lt, b[5] + .6 + (j ? .5 : 0));
  tag('replica = one copy of the record · 副本：记录的一份拷贝', 960, 215, C.mint, {size: 18, alpha: win(lt, b[1] + .6, b[2])});
  toyTag(fi(lt, b[2] + .2));
  R.forEach((p, j) => {
    server(p.x - 90, p.y, 130, 100, {t: lt, alpha: k1, label: ['A', 'B', 'C'][j], seed: j, edge: C.ink, led: C.ink});
    const dd = DONE.slice(); if (j === 0 && lt > b[2] + .8) dd[6] = 1;
    taskTable(p.x + 80, p.y, .8, k1, dd, {hot: lt > b[2] + .5 ? 6 : -1, edge: lt > b[2] + .5 && lt < b[4] ? rgba(C.mint, .6) : C.line});
  });
  text('task 6: done? · 任务 6 做完了吗？', 960, 640, {size: 22, font: F.zh, color: C.mint, alpha: win(lt, b[2] + 1, b[3])});
  text('?', 960, 300, {size: 64, font: F.disp, weight: 700, color: C.red, alpha: win(lt, b[2] + 1.6, b[3] + .4)});
  // b3: nobody can say: the copies must agree on every entry, while machines crash and messages get lost
  const k3 = win(lt, b[3] + .2, b[4] + .2);
  text('every entry must match · 每一条都要一致', 960, 640, {size: 24, font: F.zh, weight: 600, color: C.mint, alpha: k3});
  packet({x: R[0].x + 80, y: R[0].y + 150}, {x: R[1].x + 80, y: R[1].y + 150}, ramp(lt, b[3] + 1, b[3] + 2), C.mint, {r: 7, label: 'task 6 done', ls: 14});
  burst(R[0].x + 320, R[0].y + 150, ramp(lt, b[3] + 2, b[3] + 2.7), C.violet);
  // b4: cut the network between notebook one and the other two; both sides keep working
  const k4 = fi(lt, b[4] + .2);
  line(720, 230, 720, 640, C.red, 4, k4, [14, 10]);
  text('network cut · 网络断开', 720, 670, {size: 20, font: F.zh, color: C.red, alpha: k4});
  text('still working · 还在工作', 480, 700, {size: 17, font: F.zh, color: C.dim, alpha: win(lt, b[4] + 1, b[5])});
  text('still working · 还在工作', 1200, 700, {size: 17, font: F.zh, color: C.dim, alpha: win(lt, b[4] + 1.3, b[5])});
  // b5: both sides think they're in charge: the record splits
  [R[0], R[1]].forEach((p, j) => { const ka = inCharge(j) * fo(lt, b[6]); text('♛', p.x - 90, p.y - 90, {size: 44, color: C.gold, alpha: ka}); text("I'm in charge", p.x - 90, p.y - 140, {size: 16, font: F.mono, color: C.gold, alpha: ka}); });
  cross(960, 760, 22, C.red, 7, fi(lt, b[5] + 2) * fo(lt, b[6]));
  text('two in charge: the record splits in two · 两边都说了算：记录分裂成两份', 960, 800, {size: 20, font: F.zh, color: C.red, alpha: fi(lt, b[5] + 2) * fo(lt, b[6])});
  // b6: consensus
  const k6 = fi(lt, b[6] + .2);
  if (k6 > 0) { ctx.save(); ctx.globalAlpha = k6 * .85; ctx.fillStyle = C.bg; ctx.fillRect(0, 170, W, 670); ctx.restore(); }
  text('Consensus', 960, 420, {size: 84, font: F.disp, weight: 700, color: C.mint, alpha: k6});
  text('共识：让副本对每一条都达成一致', 960, 500, {size: 30, font: F.zh, color: C.dim, alpha: k6});
  tag('Paxos → ep13–14 · 第 13–14 集', 760, 600, C.mint, {size: 22, alpha: fi(lt, b[6] + .8)});
  tag('Raft → ep15+ · 第 15 集起', 1180, 600, C.mint, {size: 22, alpha: fi(lt, b[6] + 1.2)});
  void cut;
};

/* ---- 12. Five labs, on the page ---- */
SCN.labs = (lt, b, d) => {
  heading(fi(lt, .2));
  const cur = b.reduce((c, t, i) => lt >= t ? i : c, 0);
  const lh = [0, 1, 2, 3, 4].map(i => i === cur ? fi(lt, b[i] + .2) : 0);
  const link = [0, 1, 2, 3, 4].map(i => i === cur ? fi(lt, b[i] + .5, .7) : 0);
  const m = [0, 1, 2, 3].map(t => LABS[cur][3].includes(t) ? fi(lt, b[cur] + .5) : 0);
  pageView(CAM.whole, fi(lt, .2, .6), {A: 1, aHot: cur === 4 ? fi(lt, b[4] + .6) : 0, B: 1, m: [1, 1, 1, 1], mh: m, L: 1, lh, link, alpha: 1});
};

/* ---- 13. Finding your way in src/ ---- */
const GIVEN = [['labrpc/', 'the fake network', '假网络'], ['labgob/', 'encoding for RPC', 'RPC 编码'], ['tester1/', 'runs, crashes, checks your servers', '启动、弄崩、检查'], ['mrapps/', 'MapReduce plugins (wc.go …)', 'MapReduce 插件'], ['main/', 'the books, the launchers', '书和启动程序'], ['kvtest1/  models1/', 'the linearizability checker', '一致性检查器'], ['raftapi/', 'the interface your Raft implements', 'Raft 接口']];
SCN.src = (lt, b, d) => {
  miniPage({L: 1}, fi(lt, .2));
  const kt = fi(lt, .2);
  text('src/', 100, 205, {size: 34, font: F.code, weight: 700, color: C.sky, align: 'left', alpha: kt});
  text('given · 发给你的，不用改', 200, 205, {size: 18, font: F.zh, color: C.dim, align: 'left', alpha: kt});
  GIVEN.forEach(([f, en, zh], i) => {
    const y = 270 + i * 72, hot = (i === 0 || i === 2) ? win(lt, b[1] + .2, b[2]) : (i === 3 || i === 4) ? win(lt, b[2] + .2, b[3]) : 0, ka = kt * fi(lt, .3 + i * .1) * (1 - .5 * fi(lt, b[4]));
    if (hot > 0) { ctx.save(); ctx.globalAlpha *= hot; rr(90, y - 30, 780, 62, 10); ctx.fillStyle = rgba(C.sky, .12); ctx.fill(); ctx.restore(); }
    text(f, 120, y - 6, {size: 24, font: F.code, weight: 700, color: C.sky, align: 'left', alpha: ka});
    text(en, 420, y - 10, {size: 20, color: hot > 0 ? C.ink : C.dim, align: 'left', alpha: ka});
    text(zh, 420, y + 16, {size: 15, font: F.zh, color: C.dim, align: 'left', alpha: ka});
  });
  // b3: the ten files you write
  const k3 = win(lt, b[3] + .2, b[4]);
  text('yours · 你要写的', 1000, 205, {size: 22, font: F.zh, color: C.gold, align: 'left', alpha: k3});
  D.yours.forEach((f, i) => { const ka = k3 * fi(lt, b[3] + .4 + i * .12); text(f, 1000, 260 + i * 50, {size: 22, font: F.code, color: f.startsWith('mr/') ? C.gold : C.ink, align: 'left', alpha: ka});
    text(['Lab 4', 'Lab 4', 'Lab 2', 'Lab 2', 'Lab 1', 'Lab 1', 'Lab 3', 'Lab 5', 'Lab 5', 'Lab 5'][i] || '', 1780, 260 + i * 50, {size: 18, font: F.mono, color: C.dim, align: 'right', alpha: ka}); });
  text(`${D.yours.length} files with comments like "// Your code here"`, 1000, 780, {size: 20, font: F.mono, color: C.dim, align: 'left', alpha: k3});
  // b4: MakeCoordinator today; b5: make mr
  srcView(900, 200, 980, 'mkcoord', {alpha: win(lt, b[4] + .1, b[5]), fn: 'MakeCoordinator()', size: 17, hl: n => inR(n, 55, 55) + inR(n, 58, 58),
    mark: n => n === 55 ? ['yours: hand out tasks …', C.gold, fi(lt, b[4] + .6)] : n === 58 ? ['given: start the RPC server', C.sky, fi(lt, b[4] + 1.2)] : null});
  srcView(900, 190, 980, 'make', {alpha: fi(lt, b[5] + .1), fn: 'mr', size: 15.5, lh: 28, hl: n => inR(n, 47, 49) * fi(lt, b[5] + .4) + inR(n, 50, 57) * fi(lt, b[5] + 1) + inR(n, 44, 44) * fi(lt, b[5] + 1.6), hc: n => n === 44 ? C.gold : C.sky,
    mark: n => n === 48 ? ['launchers', C.sky, fi(lt, b[5] + .6)] : n === 53 ? ['8 plugins', C.sky, fi(lt, b[5] + 1)] : n === 44 ? ['tests, with -race', C.gold, fi(lt, b[5] + 1.8)] : null});
  tag('$ cd src && make mr', 1390, 735, C.mint, {size: 22, alpha: fi(lt, b[5] + 2.2)});
};

/* ---- 14. Recap, on the page: each takeaway lights its part ---- */
SCN.recap = (lt, b, d) => {
  heading(fi(lt, .2));
  const c = camAt(lt, [[0, CAM.whole], [b[0] + .2, CAM.A], [b[1] - .2, CAM.all4], [b[2] - .2, CAM.m34], [b[2] + 5.5, CAM.whole]]);
  const t1 = win(lt, b[0] + .2, b[1]), t2 = win(lt, b[1] + .2, b[2]), t3 = fi(lt, b[2] + .2);
  pageView(c, fi(lt, .2, .6), {A: 1, aHot: t1, B: 1, bHot: t2, m: [1, 1, 1, 1], mh: [t2, t2, Math.max(t2, t3), t2], L: 1, alpha: 1});
  void t3;
};

/* ---- 15. Your turn ---- */
SCN.turn = (lt, b, d) => {
  text('Your Turn', 960, 200, {size: 56, font: F.disp, weight: 700, alpha: fi(lt, .2)});
  text('轮到你', 960, 255, {size: 26, font: F.zh, color: C.dim, alpha: fi(lt, .2)});
  const cmd = ['$ cd src/main', '$ go build -buildmode=plugin ../mrapps/wc.go', '$ go run mrsequential.go wc.so pg*.txt', '$ grep \'^Sherlock \' mr-out-0'];
  panel(960, 440, 1100, 250, {alpha: fi(lt, b[0] + .2), fill: '#0E1628'});
  cmd.forEach((c, i) => text(c, 450, 360 + i * 52, {size: 26, font: F.code, color: i === 3 ? C.gold : C.mint, align: 'left', alpha: fi(lt, b[0] + .4 + i * .4) * (i === 3 ? fi(lt, b[1]) : 1)}));
  const q = fi(lt, b[1] + .3) * fo(lt, b[2] - .1);
  text('"Sherlock" — how many times?', 960, 660, {size: 44, font: F.disp, weight: 700, alpha: q});
  text('"Sherlock" 出现了几次？', 960, 720, {size: 26, font: F.zh, color: C.dim, alpha: q});
  const k2 = fi(lt, b[2] + .1);
  text('Sherlock ' + D.sherlock, 960, 660, {size: 64, font: F.code, weight: 700, color: C.gold, alpha: k2});
  text('next: the MapReduce model · 下一集：MapReduce 模型', 960, 740, {size: 22, font: F.zh, color: C.dim, alpha: fi(lt, b[2] + 1.5)});
};

// filled by build.py with every Chinese character in this file (so the font subset loads them)
const EXTRA_ZH = '__AUTO__';
