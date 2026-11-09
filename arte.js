// ===== Ilhas da Luiza — desenhos (tudo feito com curvas, nada quadrado) =====
'use strict';
let ESCALA_ARTE = 2;
const FONTE_EMOJI = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji","Segoe UI Symbol",sans-serif';
const _emo = new Map();

// Celulares/computadores antigos não têm alguns emojis novos: troca por parecidos.
const TROCA_EMOJI = { '🪙': '💰', '🪵': '🌲', '🪨': '⛰️', '🪶': '🕊️', '🐈‍⬛': '🐈' };
const RE_TROCA = /🪙|🪵|🪨|🪶|🐈‍⬛/g;
let EMOJI_NOVO = true;
(function () {
  try {
    const c = document.createElement('canvas'); c.width = c.height = 28;
    const x = c.getContext('2d'); x.font = '22px ' + FONTE_EMOJI; x.textBaseline = 'top';
    x.fillText('🪵', 0, 0);
    const d = x.getImageData(0, 0, 28, 28).data; let cor = 0;
    for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 50 && Math.max(d[i], d[i + 1], d[i + 2]) - Math.min(d[i], d[i + 1], d[i + 2]) > 50) cor++;
    EMOJI_NOVO = cor > 10;
  } catch (e) { }
})();
function fx(s) { return EMOJI_NOVO || typeof s !== 'string' ? s : s.replace(RE_TROCA, m => TROCA_EMOJI[m]); }

function emoCanvas(ch, px, filtro) {
  if (!EMOJI_NOVO && ch === '🐈‍⬛') { ch = '🐈'; filtro = 'brightness(0.35)'; }
  ch = fx(ch);
  px = Math.max(4, Math.round(px));
  const rs = ESCALA_ARTE;
  const key = ch + '|' + px + '|' + (filtro || '') + '|' + rs;
  let c = _emo.get(key);
  if (c) return c;
  const sz = Math.ceil(px * rs * 1.35);
  c = document.createElement('canvas');
  c.width = c.height = sz;
  const g = c.getContext('2d');
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `${px * rs}px ${FONTE_EMOJI}`;
  if (filtro) g.filter = filtro;
  g.fillText(ch, sz / 2, sz / 2 + px * rs * 0.06);
  if (_emo.size > 700) { let i = 0; for (const k of _emo.keys()) { _emo.delete(k); if (++i > 150) break; } }
  _emo.set(key, c);
  return c;
}
function emoji(g, ch, x, y, px, o) {
  o = o || {};
  const c = emoCanvas(ch, px, o.filtro);
  const s = c.width / ESCALA_ARTE;
  g.save();
  g.translate(x, y);
  if (o.flip) g.scale(-1, 1);
  if (o.rot) g.rotate(o.rot);
  if (o.alpha != null) g.globalAlpha *= o.alpha;
  if (o.sy) g.scale(1, o.sy);
  g.drawImage(c, -s / 2, -s / 2, s, s);
  g.restore();
}
function sombra(g, x, y, rx, ry, a) {
  g.fillStyle = `rgba(20,40,30,${a == null ? 0.22 : a})`;
  g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fill();
}
function circ(g, x, y, r, cor) { g.fillStyle = cor; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); }
function rrect(g, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  g.beginPath();
  g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}
function escurecer(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255, gg = (n >> 8) & 255, b = n & 255;
  if (f < 0) { r *= 1 + f; gg *= 1 + f; b *= 1 + f; } else { r += (255 - r) * f; gg += (255 - gg) * f; b += (255 - b) * f; }
  return '#' + ((1 << 24) | (Math.round(r) << 16) | (Math.round(gg) << 8) | Math.round(b)).toString(16).slice(1);
}

// ---------------- Pessoa ----------------
// (x,y) = pés. look = {pele, cabelo, corCabelo, olhos, roupa, corRoupa, acc}
function desenharPessoa(g, x, y, L, o) {
  o = o || {};
  const t = o.t || 0, andando = !!o.andando, montada = !!o.montada;
  const s = o.s || 1;
  g.save();
  g.translate(x, y);
  g.scale(s * (o.dir || 1), s);
  const bob = andando ? Math.abs(Math.sin(t * 11)) * 2.2 : Math.sin(t * 2.2) * 0.6;
  const passo = andando ? Math.sin(t * 11) : 0;
  if (!montada) sombra(g, 0, 0, 11, 4);
  const pele = L.pele, peleSombra = escurecer(pele, -0.12);
  const roupa = L.corRoupa, roupaSombra = escurecer(roupa, -0.18);

  // asas atrás
  if (L.acc === 'asas' || o.asas) {
    const bat = Math.sin(t * (o.fada ? 9 : 4)) * 0.25;
    g.save(); g.globalAlpha = 0.75;
    for (const lado of [-1, 1]) {
      g.save(); g.translate(lado * 4, -26 - bob); g.rotate(lado * (0.5 + bat));
      const gr = g.createLinearGradient(0, 0, lado * 18, -10);
      gr.addColorStop(0, '#ffffff'); gr.addColorStop(1, '#c8a6ff');
      g.fillStyle = gr;
      g.beginPath(); g.ellipse(lado * 10, -6, 11, 7, lado * -0.4, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(lado * 8, 5, 7, 5, lado * 0.4, 0, Math.PI * 2); g.fill();
      g.restore();
    }
    g.restore();
  }
  // pernas
  if (!montada) {
    for (const [lx, ph] of [[-3.6, 1], [3.6, -1]]) {
      const dy = passo * ph * 2.2;
      g.fillStyle = L.roupa === 'macacao' ? roupaSombra : pele;
      rrect(g, lx - 2.4, -12 + Math.min(0, dy), 4.8, 11 + Math.abs(dy) * 0.2, 2.3); g.fill();
      g.fillStyle = '#5a3b2e';
      g.beginPath(); g.ellipse(lx, -1.2 + Math.min(0, dy) * 0.5, 3.3, 2.2, 0, 0, Math.PI * 2); g.fill();
    }
  }
  const by = -bob;
  // cabelo de trás
  const hc = L.corCabelo, hcS = escurecer(hc, -0.2);
  const hy = by - 37;
  g.fillStyle = hcS;
  if (L.cabelo === 'longo') { rrect(g, -12.5, hy - 4, 25, 26, 9); g.fill(); }
  if (L.cabelo === 'cacheado') { for (let i = 0; i < 9; i++) { const a = Math.PI * 0.05 + i * Math.PI * 0.9 / 8; circ(g, Math.cos(a) * 12.5, hy + Math.sin(a) * 10 + 2, 5.2, hcS); } circ(g, -11, hy + 14, 4.5, hcS); circ(g, 11, hy + 14, 4.5, hcS); }
  if (L.cabelo === 'trancas') { for (const lx of [-10.5, 10.5]) { for (let i = 0; i < 4; i++) circ(g, lx + Math.sin(t * 3 + i) * (andando ? 0.8 : 0.2), hy + 4 + i * 4.5, 3.2 - i * 0.2, i % 2 ? hc : hcS); g.fillStyle = '#ff6fa5'; circ(g, lx, hy + 21, 2, '#ff6fa5'); } }
  if (L.cabelo === 'rabo') { g.save(); g.translate(9, hy - 6); g.rotate(0.5 + Math.sin(t * 6) * (andando ? 0.18 : 0.05)); g.fillStyle = hcS; g.beginPath(); g.ellipse(4, 8, 5, 11, 0.2, 0, Math.PI * 2); g.fill(); g.restore(); }

  // corpo / roupa
  g.fillStyle = roupa;
  if (L.roupa === 'vestido') {
    g.beginPath(); g.moveTo(-7, by - 26); g.lineTo(7, by - 26); g.quadraticCurveTo(12, by - 15, 12.5, by - 9); g.quadraticCurveTo(0, by - 6, -12.5, by - 9); g.quadraticCurveTo(-12, by - 15, -7, by - 26); g.fill();
    g.fillStyle = roupaSombra; g.beginPath(); g.moveTo(-12.5, by - 9); g.quadraticCurveTo(0, by - 6, 12.5, by - 9); g.quadraticCurveTo(0, by - 4.5, -12.5, by - 9); g.fill();
    g.fillStyle = 'rgba(255,255,255,.55)'; for (let i = -1; i <= 1; i++) circ(g, i * 5, by - 12, 1.1, 'rgba(255,255,255,.6)');
  } else if (L.roupa === 'saia') {
    rrect(g, -7.5, by - 26, 15, 10, 4); g.fill();
    g.fillStyle = roupaSombra; g.beginPath(); g.moveTo(-7, by - 17); g.lineTo(7, by - 17); g.lineTo(11, by - 9); g.quadraticCurveTo(0, by - 7, -11, by - 9); g.closePath(); g.fill();
  } else if (L.roupa === 'macacao') {
    g.fillStyle = '#ffffff'; rrect(g, -7.5, by - 26, 15, 9, 4); g.fill();
    g.fillStyle = roupa; rrect(g, -7.5, by - 21, 15, 11, 3.5); g.fill();
    g.fillRect(-6, by - 26, 2.5, 6); g.fillRect(3.5, by - 26, 2.5, 6);
    circ(g, -4.7, by - 21, 1.1, '#ffd54a'); circ(g, 4.7, by - 21, 1.1, '#ffd54a');
  } else {
    rrect(g, -7.5, by - 26, 15, 11, 4); g.fill();
    g.fillStyle = '#3d5a9e'; rrect(g, -7.5, by - 16.5, 15, 6.5, 2.5); g.fill();
    g.fillStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.arc(0, by - 21, 2.4, 0, Math.PI * 2); g.fill();
  }
  // braços
  for (const [ax, ph] of [[-9, -1], [9, 1]]) {
    g.save(); g.translate(ax, by - 24); g.rotate((andando ? passo * ph * 0.5 : 0) + (ax < 0 ? 0.15 : -0.15));
    g.fillStyle = L.roupa === 'vestido' || L.roupa === 'macacao' ? pele : roupa;
    rrect(g, -2.3, -1, 4.6, 8, 2.3); g.fill();
    circ(g, 0, 9, 2.4, pele);
    g.restore();
  }
  // cabeça
  circ(g, 0, hy + 1, 11.5, peleSombra);
  circ(g, 0, hy, 11.5, pele);
  // orelhas
  circ(g, -11, hy + 1, 2.5, pele); circ(g, 11, hy + 1, 2.5, pele);
  // franja
  g.fillStyle = hc;
  g.beginPath();
  g.arc(0, hy - 1, 12.3, Math.PI * 1.02, Math.PI * 1.98);
  if (L.cabelo === 'curto') { g.quadraticCurveTo(9, hy - 9, 4, hy - 6); g.quadraticCurveTo(0, hy - 9, -5, hy - 5); g.quadraticCurveTo(-9, hy - 8, -12.2, hy - 2); }
  else { g.quadraticCurveTo(8, hy - 7, 3, hy - 6.5); g.quadraticCurveTo(-2, hy - 9, -6, hy - 4); g.quadraticCurveTo(-10, hy - 6, -12.2, hy + 2); }
  g.closePath(); g.fill();
  if (L.cabelo === 'longo' || L.cabelo === 'cacheado') { g.fillStyle = hc; rrect(g, -13, hy - 4, 4.5, 18, 2.2); g.fill(); rrect(g, 8.5, hy - 4, 4.5, 18, 2.2); g.fill(); }
  if (L.cabelo === 'cacheado') { for (let i = 0; i < 6; i++) circ(g, -9 + i * 3.6, hy - 9 + Math.abs(i - 2.5) * 1.2, 3.4, hc); }
  if (L.cabelo === 'coque') { circ(g, 0, hy - 13, 6, hc); circ(g, -1.5, hy - 14.5, 2, escurecer(hc, 0.25)); }
  g.fillStyle = 'rgba(255,255,255,.28)'; g.beginPath(); g.ellipse(-4, hy - 8, 4, 1.6, -0.3, 0, Math.PI * 2); g.fill();
  // olhos
  const pisca = (Math.floor(t * 10) % 37) === 0;
  for (const ex of [-4.2, 4.2]) {
    if (pisca) { g.strokeStyle = '#3a2418'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(ex - 2.3, hy + 1); g.lineTo(ex + 2.3, hy + 1); g.stroke(); continue; }
    g.fillStyle = '#fff'; g.beginPath(); g.ellipse(ex, hy + 1, 2.7, 3.2, 0, 0, Math.PI * 2); g.fill();
    circ(g, ex, hy + 1.4, 2.1, L.olhos);
    circ(g, ex, hy + 1.5, 1.05, '#1a1010');
    circ(g, ex - 0.7, hy + 0.5, 0.7, '#fff');
    g.strokeStyle = '#3a2418'; g.lineWidth = 0.9; g.beginPath(); g.arc(ex, hy + 1, 3.1, Math.PI * 1.15, Math.PI * 1.85); g.stroke();
  }
  // bochechas e boca
  g.fillStyle = 'rgba(255,110,130,.35)'; g.beginPath(); g.ellipse(-7, hy + 5, 2.4, 1.5, 0, 0, Math.PI * 2); g.fill(); g.beginPath(); g.ellipse(7, hy + 5, 2.4, 1.5, 0, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#b4424e'; g.lineWidth = 1.2; g.lineCap = 'round';
  g.beginPath(); g.arc(0, hy + 4.5, 2.6, Math.PI * 0.2, Math.PI * 0.8); g.stroke();
  // acessórios
  const acc = L.acc;
  if (acc === 'laco') { g.fillStyle = '#ff4f8b'; g.beginPath(); g.moveTo(7, hy - 10); g.lineTo(2, hy - 14); g.lineTo(2.5, hy - 6); g.closePath(); g.fill(); g.beginPath(); g.moveTo(7, hy - 10); g.lineTo(12, hy - 15); g.lineTo(12.5, hy - 6); g.closePath(); g.fill(); circ(g, 7, hy - 10, 2, '#d8306c'); }
  if (acc === 'oculos') { g.strokeStyle = '#4a3030'; g.lineWidth = 1.1; g.beginPath(); g.arc(-4.2, hy + 1, 3.6, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.arc(4.2, hy + 1, 3.6, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.moveTo(-0.6, hy + 0.5); g.lineTo(0.6, hy + 0.5); g.stroke(); }
  if (acc === 'chapeu') { g.fillStyle = '#e9c46a'; g.beginPath(); g.ellipse(0, hy - 8, 18, 5, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#f4d58d'; g.beginPath(); g.ellipse(0, hy - 12, 10, 7, 0, Math.PI, 0); g.fill(); g.fillStyle = '#e05a6b'; g.fillRect(-10, hy - 11, 20, 2.5); }
  if (acc === 'flores') { const cs = ['#ff6fa5', '#ffd54a', '#fff', '#b77cff', '#ff8a4c']; for (let i = 0; i < 7; i++) { const a = Math.PI * 1.05 + i * Math.PI * 0.9 / 6; const fx = Math.cos(a) * 11.5, fy = hy - 1 + Math.sin(a) * 11; circ(g, fx, fy, 2.6, cs[i % 5]); circ(g, fx, fy, 1, '#ffb000'); } }
  if (acc === 'orelhas') { g.fillStyle = hc; for (const lx of [-1, 1]) { g.beginPath(); g.moveTo(lx * 4, hy - 9); g.lineTo(lx * 10, hy - 19); g.lineTo(lx * 11.5, hy - 6); g.closePath(); g.fill(); } g.fillStyle = '#ffb3c8'; for (const lx of [-1, 1]) { g.beginPath(); g.moveTo(lx * 6, hy - 9); g.lineTo(lx * 9.7, hy - 15.5); g.lineTo(lx * 10.4, hy - 8); g.closePath(); g.fill(); } }
  if (acc === 'tiara') { g.strokeStyle = '#ffd54a'; g.lineWidth = 2; g.beginPath(); g.arc(0, hy - 1, 12, Math.PI * 1.15, Math.PI * 1.85); g.stroke(); circ(g, 0, hy - 13, 2.2, '#ff5fa2'); circ(g, -5, hy - 11.6, 1.5, '#5ab0ff'); circ(g, 5, hy - 11.6, 1.5, '#5ab0ff'); }
  if (acc === 'coroa') { g.fillStyle = '#ffcc33'; g.beginPath(); g.moveTo(-8, hy - 9); g.lineTo(-9, hy - 19); g.lineTo(-4, hy - 14); g.lineTo(0, hy - 21); g.lineTo(4, hy - 14); g.lineTo(9, hy - 19); g.lineTo(8, hy - 9); g.closePath(); g.fill(); circ(g, 0, hy - 13, 1.8, '#e8364f'); circ(g, -5, hy - 11.5, 1.3, '#4fb3ff'); circ(g, 5, hy - 11.5, 1.3, '#4fd18b'); }
  g.restore();
}

// ---------------- Natureza ----------------
const CORES_COPA = {
  redonda: ['#3f8f3a', '#4fa846', '#6cc35a'],
  rosa: ['#d36fb4', '#e78ccb', '#f7b6e0'],
  azul: ['#5a7fe0', '#7598f0', '#9fb8ff'],
  frutas: ['#3f8f3a', '#4fa846', '#6cc35a'],
  cereja: ['#e58fb7', '#f2a9cb', '#ffd0e5'],
};
Object.assign(CORES_COPA, {
  dourada: ['#d9a521', '#efc23a', '#ffe27a'],
  outono: ['#c8521f', '#ea7b2c', '#ffb25a'],
  selva: ['#1f6e2c', '#2b8a37', '#46a94c'],
  salgueiro: ['#6fae4a', '#86c25a', '#a9db7a'],
  eucalipto: ['#6f9e86', '#86b59b', '#a8cfb9'],
});
function desenharArvore(g, x, y, tipo, t, sway) {
  const bal = Math.sin(t * 1.3 + x * 0.05) * (sway == null ? 1 : sway);
  if (tipo === 'cacto') {
    sombra(g, x, y - 2, 11, 4);
    g.fillStyle = '#3f9a4a'; rrect(g, x - 6, y - 40, 12, 39, 6); g.fill();
    rrect(g, x - 17, y - 28, 8, 16, 4); g.fill(); rrect(g, x - 17, y - 16, 14, 7, 3.5); g.fill();
    rrect(g, x + 9, y - 34, 8, 18, 4); g.fill(); rrect(g, x + 3, y - 20, 14, 7, 3.5); g.fill();
    g.fillStyle = '#5cb866'; g.fillRect(x - 2, y - 37, 2.5, 33);
    circ(g, x, y - 41, 3.5, '#ff6f91'); circ(g, x + 13, y - 35, 2.5, '#ffd23f');
    return;
  }
  if (tipo === 'bambu') {
    sombra(g, x, y - 2, 14, 5);
    for (let i = -1; i <= 1; i++) {
      const bx = x + i * 7, alt = 52 + (i === 0 ? 10 : 0) - Math.abs(i) * 4, b2 = bal * (1 + i * 0.3);
      g.strokeStyle = '#7fb84a'; g.lineWidth = 5; g.lineCap = 'round';
      g.beginPath(); g.moveTo(bx, y - 2); g.quadraticCurveTo(bx, y - alt / 2, bx + b2, y - alt); g.stroke();
      g.strokeStyle = '#5e9636'; g.lineWidth = 6;
      for (let k = 1; k < 4; k++) { const yy = y - 2 - k * alt / 4; g.beginPath(); g.moveTo(bx - 3 + b2 * k / 4, yy); g.lineTo(bx + 3 + b2 * k / 4, yy); g.stroke(); }
      g.fillStyle = '#62a93e';
      for (const s of [-1, 1]) { g.beginPath(); g.ellipse(bx + b2 + s * 7, y - alt + 6, 8, 2.6, s * 0.5, 0, Math.PI * 2); g.fill(); }
    }
    return;
  }
  if (tipo === 'doce') {
    sombra(g, x, y - 2, 12, 4);
    g.fillStyle = '#fff4e8'; rrect(g, x - 2, y - 34, 4, 33, 2); g.fill();
    const cy = y - 44 + bal * 0.5;
    const cs = ['#ff5c8a', '#ffffff', '#7fd0ff', '#ffffff', '#ffd23f', '#ffffff'];
    for (let i = 0; i < 6; i++) { circ(g, x, cy, 15 - i * 2.4, cs[(i + Math.floor(x)) % cs.length]); }
    g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 2; g.beginPath(); g.arc(x - 4, cy - 4, 6, Math.PI, Math.PI * 1.6); g.stroke();
    return;
  }
  if (tipo === 'acacia') {
    sombra(g, x, y - 2, 22, 6);
    g.strokeStyle = '#7a4e2c'; g.lineWidth = 5; g.lineCap = 'round';
    g.beginPath(); g.moveTo(x, y - 2); g.lineTo(x, y - 24); g.lineTo(x - 12, y - 40); g.moveTo(x, y - 24); g.lineTo(x + 12, y - 42); g.stroke();
    const cx = x + bal;
    g.fillStyle = '#6a8f2e'; g.beginPath(); g.ellipse(cx, y - 44, 30, 9, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#86ad3c'; g.beginPath(); g.ellipse(cx - 2, y - 47, 24, 6, 0, 0, Math.PI * 2); g.fill();
    return;
  }
  sombra(g, x, y - 2, 17, 6);
  if (tipo === 'neve') {
    g.fillStyle = '#7a4e2c'; rrect(g, x - 4, y - 18, 8, 17, 3); g.fill();
    for (let i = 0; i < 3; i++) {
      const yy = y - 14 - i * 13, w = 22 - i * 5;
      g.fillStyle = ['#2f6f5a', '#3b8569', '#4d9c7c'][i];
      g.beginPath(); g.moveTo(x - w, yy); g.quadraticCurveTo(x, yy + 6, x + w, yy); g.lineTo(x + bal * (i + 1) * 0.5, yy - 22 + i * 2); g.closePath(); g.fill();
      g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(x - w * 0.55, yy - 8); g.quadraticCurveTo(x, yy - 4, x + w * 0.55, yy - 8); g.lineTo(x + bal * (i + 1) * 0.5, yy - 21 + i * 2); g.closePath(); g.fill();
    }
    return;
  }
  g.fillStyle = '#7a4e2c'; rrect(g, x - 4, y - 24, 8, 23, 3); g.fill();
  g.fillStyle = '#5f3b20'; g.fillRect(x + 1, y - 22, 2.5, 20);
  if (tipo === 'pinheiro') {
    const cs = ['#2f6f3a', '#3b8545', '#4d9c54'];
    for (let i = 0; i < 3; i++) {
      const yy = y - 18 - i * 13, w = 22 - i * 5;
      g.fillStyle = cs[i];
      g.beginPath(); g.moveTo(x - w + bal * i * 0.6, yy); g.quadraticCurveTo(x, yy + 6, x + w + bal * i * 0.6, yy); g.lineTo(x + bal * (i + 1), yy - 22 + i * 2); g.closePath(); g.fill();
    }
    circ(g, x + bal * 3, y - 57, 2.5, '#5aad60');
    return;
  }
  const cs = CORES_COPA[tipo] || CORES_COPA.redonda;
  const cx = x + bal, cy = y - 38;
  circ(g, cx - 10, cy + 6, 13, cs[0]); circ(g, cx + 11, cy + 5, 13, cs[0]); circ(g, cx, cy + 8, 14, cs[0]);
  circ(g, cx - 6, cy - 4, 14, cs[1]); circ(g, cx + 8, cy - 2, 13, cs[1]); circ(g, cx, cy - 10, 12, cs[1]);
  circ(g, cx - 4, cy - 10, 7, cs[2]); circ(g, cx + 7, cy - 6, 5, cs[2]);
  if (tipo === 'rosa' || tipo === 'azul' || tipo === 'cereja') {
    for (let i = 0; i < 5; i++) { const a = i * 1.3 + x; circ(g, cx + Math.cos(a) * 12, cy + Math.sin(a) * 9, 1.6, 'rgba(255,255,255,.8)'); }
  }
}
function desenharToco(g, x, y) {
  sombra(g, x, y - 2, 10, 4);
  g.fillStyle = '#7a4e2c'; rrect(g, x - 7, y - 10, 14, 9, 3); g.fill();
  g.fillStyle = '#c99a62'; g.beginPath(); g.ellipse(x, y - 10, 7, 3, 0, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#a5753f'; g.lineWidth = 0.8; g.beginPath(); g.ellipse(x, y - 10, 4, 1.6, 0, 0, Math.PI * 2); g.stroke();
  circ(g, x + 9, y - 3, 2.5, '#6cc35a'); circ(g, x + 11, y - 5, 2, '#4fa846');
}
function desenharPalmeira(g, x, y, t, cocos) {
  const bal = Math.sin(t * 1.1 + x) * 1.5;
  sombra(g, x + 6, y - 2, 18, 5);
  g.strokeStyle = '#a07040'; g.lineWidth = 6; g.lineCap = 'round';
  g.beginPath(); g.moveTo(x, y - 2); g.quadraticCurveTo(x - 2, y - 30, x + 8 + bal, y - 52); g.stroke();
  g.strokeStyle = '#8a5d32'; g.lineWidth = 1.2;
  for (let i = 1; i < 7; i++) { const p = i / 7; const px = x + (-2 * 2 * p * (1 - p)) + (8 + bal) * p * p, py = y - 2 - 50 * p; g.beginPath(); g.moveTo(px - 3, py); g.lineTo(px + 3, py - 1); g.stroke(); }
  const tx = x + 8 + bal, ty = y - 53;
  for (let i = 0; i < 6; i++) {
    const a = -Math.PI / 2 + (i - 2.5) * 0.75 + Math.sin(t * 1.5 + i) * 0.05;
    g.save(); g.translate(tx, ty); g.rotate(a);
    g.fillStyle = i % 2 ? '#3f9a45' : '#4fb352';
    g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(12, -6, 26, 4); g.quadraticCurveTo(12, 2, 0, 0); g.fill();
    g.restore();
  }
  if (cocos) { circ(g, tx - 3, ty + 3, 3.4, '#6b4423'); circ(g, tx + 3, ty + 4, 3.4, '#7a5030'); circ(g, tx, ty + 6, 3.2, '#5e3a1c'); }
}
function desenharRocha(g, x, y, k) {
  sombra(g, x, y - 2, 15, 5);
  const c1 = '#8d96a0', c2 = '#a9b2bb', c3 = '#c9d0d6';
  g.fillStyle = c1; g.beginPath(); g.ellipse(x, y - 9, 15, 10, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = c2; g.beginPath(); g.ellipse(x - 3, y - 12, 10, 7, -0.2, 0, Math.PI * 2); g.fill();
  g.fillStyle = c1; g.beginPath(); g.ellipse(x + 9, y - 5, 7, 5, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = c3; g.beginPath(); g.ellipse(x - 5, y - 15, 4, 2, -0.3, 0, Math.PI * 2); g.fill();
  if (k % 3 === 0) { circ(g, x + 4, y - 14, 2, '#79b86a'); circ(g, x + 7, y - 13, 1.6, '#6aa65c'); }
}
function desenharCristal(g, x, y, t) {
  const fl = Math.sin(t * 2.5 + x) * 3;
  sombra(g, x, y - 2, 8, 3, 0.15);
  const gr = g.createRadialGradient(x, y - 16 + fl, 2, x, y - 16 + fl, 20);
  gr.addColorStop(0, 'rgba(255,240,255,.75)'); gr.addColorStop(1, 'rgba(200,150,255,0)');
  g.fillStyle = gr; g.beginPath(); g.arc(x, y - 16 + fl, 20, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#b07cff'; g.beginPath(); g.moveTo(x, y - 30 + fl); g.lineTo(x + 7, y - 17 + fl); g.lineTo(x, y - 5 + fl); g.lineTo(x - 7, y - 17 + fl); g.closePath(); g.fill();
  g.fillStyle = '#e0c8ff'; g.beginPath(); g.moveTo(x, y - 30 + fl); g.lineTo(x + 2.5, y - 17 + fl); g.lineTo(x, y - 5 + fl); g.lineTo(x - 7, y - 17 + fl); g.closePath(); g.fill();
  if (Math.sin(t * 4 + x) > 0.7) emoji(g, '✨', x + 8, y - 28 + fl, 10);
}
function desenharBau(g, x, y, t) {
  const pulo = Math.max(0, Math.sin(t * 4)) * 3;
  sombra(g, x, y - 2, 12, 4);
  g.fillStyle = '#9a5b2a'; rrect(g, x - 12, y - 18 - pulo, 24, 16, 4); g.fill();
  g.fillStyle = '#b86f34'; g.beginPath(); g.ellipse(x, y - 18 - pulo, 12, 6, 0, Math.PI, 0); g.fill();
  g.fillStyle = '#ffcc33'; g.fillRect(x - 12, y - 14 - pulo, 24, 2.5); circ(g, x, y - 12 - pulo, 3, '#ffcc33');
  emoji(g, '✨', x + 12, y - 26, 11, { alpha: 0.5 + Math.sin(t * 5) * 0.5 });
}

// casinhas que já existem nas vilas e cidades (x,y = pé da casa)
function desenharPredio(g, x, y, sub, noite) {
  const paredes = ['#ffd6e7', '#fff1b8', '#cfeaff', '#d4f5d0', '#ffd9b8', '#e3d4ff'];
  const tetos = ['#e25a6b', '#3fa7d6', '#f08c3a', '#58b368', '#7b6cf0', '#c95fd0'];
  const p = paredes[sub % 6], tt = tetos[(sub + 2) % 6];
  sombra(g, x, y - 2, 19, 5);
  g.fillStyle = p; rrect(g, x - 16, y - 30, 32, 29, 4); g.fill();
  telhado(g, x - 16, x + 16, y - 27, y - 50, tt, sub % 2 === 1);
  porta(g, x - 5, y - 18, 10, 17, '#8a5530');
  janela(g, x - 13, y - 25, 7, 7, noite); janela(g, x + 6, y - 25, 7, 7, noite);
  if (sub % 3 === 0) emoji(g, '🌷', x + 11, y - 4, 8);
}

// ---------------- Construções ----------------
function janela(g, x, y, w, h, noite) {
  g.fillStyle = '#fff'; rrect(g, x - 1.5, y - 1.5, w + 3, h + 3, 3); g.fill();
  g.fillStyle = noite ? '#ffe27a' : '#9fd8ff'; rrect(g, x, y, w, h, 2); g.fill();
  if (!noite) { g.fillStyle = 'rgba(255,255,255,.6)'; g.fillRect(x + 1.5, y + 1.5, w * 0.3, h * 0.3); }
  g.strokeStyle = '#fff'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(x + w / 2, y); g.lineTo(x + w / 2, y + h); g.moveTo(x, y + h / 2); g.lineTo(x + w, y + h / 2); g.stroke();
}
function porta(g, x, y, w, h, cor) {
  g.fillStyle = cor || '#8a5530';
  g.beginPath(); g.moveTo(x, y + h); g.lineTo(x, y + w / 2); g.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0); g.lineTo(x + w, y + h); g.closePath(); g.fill();
  circ(g, x + w * 0.78, y + h * 0.6, 1.4, '#ffd54a');
}
function telhado(g, x0, x1, yBase, yTopo, cor, curvo) {
  g.fillStyle = cor;
  g.beginPath();
  g.moveTo(x0 - 5, yBase);
  if (curvo) g.quadraticCurveTo((x0 + x1) / 2, yTopo - (yBase - yTopo) * 0.4, x1 + 5, yBase);
  else { g.lineTo((x0 + x1) / 2, yTopo); g.lineTo(x1 + 5, yBase); }
  g.closePath(); g.fill();
  g.lineJoin = 'round'; g.strokeStyle = cor; g.lineWidth = 5; g.stroke();
  g.fillStyle = escurecer(cor, -0.18);
  g.beginPath(); g.moveTo(x0 - 6, yBase); g.lineTo(x1 + 6, yBase); g.lineTo(x1 + 3, yBase + 4); g.lineTo(x0 - 3, yBase + 4); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = 2;
  g.beginPath(); g.moveTo(x0 + 4, yBase - 3); g.lineTo((x0 + x1) / 2, yTopo + 5); g.stroke();
}
function desenharConstru(g, b, t, noite) {
  const T = TILE, X = b.x * T, Y = b.y * T, def = CONSTRU[b.tipo], W = def.w * T, H = def.h * T;
  const parede = CORES_PAREDE[(b.cor || 0) % CORES_PAREDE.length], teto = CORES_TELHADO[(b.cor || 0) % CORES_TELHADO.length];
  switch (b.tipo) {
    case 'casa1': {
      sombra(g, X + W / 2, Y + H - 4, W / 2, 8);
      g.fillStyle = parede; rrect(g, X + 7, Y + H * 0.3, W - 14, H * 0.66, 6); g.fill();
      g.fillStyle = escurecer(parede, -0.1); g.fillRect(X + 7, Y + H * 0.86, W - 14, H * 0.1);
      telhado(g, X + 7, X + W - 7, Y + H * 0.34, Y - H * 0.25, teto);
      g.fillStyle = '#b5523e'; rrect(g, X + W - 24, Y - 6, 8, 16, 2); g.fill();
      porta(g, X + W / 2 - 8, Y + H * 0.58, 16, H * 0.38 - 4);
      janela(g, X + 13, Y + H * 0.48, 13, 12, noite); janela(g, X + W - 26, Y + H * 0.48, 13, 12, noite);
      for (let i = 0; i < 3; i++) emoji(g, '🌷', X + 15 + i * 5, Y + H * 0.88, 8);
      break;
    }
    case 'casa2': {
      sombra(g, X + W / 2, Y + H - 4, W / 2, 9);
      g.fillStyle = parede; rrect(g, X + 6, Y + H * 0.22, W - 12, H * 0.74, 6); g.fill();
      telhado(g, X + 6, X + W - 6, Y + H * 0.28, Y - H * 0.45, teto, true);
      g.fillStyle = '#c08a5a'; g.fillRect(X + 4, Y + H * 0.86, W - 8, 6);
      g.fillStyle = '#e8d2b0'; for (let i = 0; i < 7; i++) g.fillRect(X + 8 + i * (W - 16) / 6 - 1.5, Y + H * 0.7, 3, H * 0.17);
      g.fillRect(X + 6, Y + H * 0.7, W - 12, 3);
      porta(g, X + W / 2 - 9, Y + H * 0.45, 18, H * 0.41);
      janela(g, X + 14, Y + H * 0.38, 18, 16, noite); janela(g, X + W - 32, Y + H * 0.38, 18, 16, noite);
      janela(g, X + W / 2 - 7, Y + 2, 14, 12, noite);
      break;
    }
    case 'casa3': {
      sombra(g, X + W / 2, Y + H - 4, W / 2, 10);
      g.fillStyle = parede; rrect(g, X + 6, Y + H * 0.12, W - 12, H * 0.84, 6); g.fill();
      g.fillStyle = escurecer(parede, -0.08); g.fillRect(X + 6, Y + H * 0.52, W - 12, 4);
      telhado(g, X + 6, X + W - 6, Y + H * 0.17, Y - H * 0.32, teto);
      for (let i = 0; i < 3; i++) janela(g, X + 14 + i * (W - 28) / 2 - 8, Y + H * 0.24, 16, 15, noite);
      janela(g, X + 14, Y + H * 0.62, 16, 15, noite); janela(g, X + W - 30, Y + H * 0.62, 16, 15, noite);
      porta(g, X + W / 2 - 10, Y + H * 0.62, 20, H * 0.34);
      g.fillStyle = '#ffffff'; g.fillRect(X + W / 2 - 16, Y + H * 0.58, 32, 3);
      break;
    }
    case 'castelo': {
      sombra(g, X + W / 2, Y + H - 4, W / 2 + 4, 12);
      const pc = '#ffd6ec', pcs = '#f2b8d6', tc = '#9b6cff';
      g.fillStyle = pc; rrect(g, X + 22, Y + H * 0.2, W - 44, H * 0.76, 6); g.fill();
      for (let i = 0; i < 6; i++) { g.fillStyle = pc; rrect(g, X + 24 + i * (W - 56) / 5, Y + H * 0.2 - 8, 10, 12, 3); g.fill(); }
      for (const tx of [X + 16, X + W - 16]) {
        g.fillStyle = pcs; rrect(g, tx - 15, Y + H * 0.05, 30, H * 0.91, 8); g.fill();
        g.fillStyle = tc; g.beginPath(); g.moveTo(tx - 19, Y + H * 0.08); g.lineTo(tx, Y - H * 0.32); g.lineTo(tx + 19, Y + H * 0.08); g.closePath(); g.fill();
        g.strokeStyle = '#7a4fc9'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(tx, Y - H * 0.32); g.lineTo(tx, Y - H * 0.42); g.stroke();
        g.fillStyle = '#ff5fa2'; g.beginPath(); g.moveTo(tx, Y - H * 0.42); g.lineTo(tx + 10 + Math.sin(t * 4) * 2, Y - H * 0.39); g.lineTo(tx, Y - H * 0.36); g.fill();
        janela(g, tx - 6, Y + H * 0.3, 12, 16, noite); janela(g, tx - 6, Y + H * 0.6, 12, 16, noite);
      }
      g.fillStyle = tc; g.beginPath(); g.moveTo(X + W / 2 - 22, Y + H * 0.2); g.lineTo(X + W / 2, Y - H * 0.18); g.lineTo(X + W / 2 + 22, Y + H * 0.2); g.fill();
      porta(g, X + W / 2 - 16, Y + H * 0.55, 32, H * 0.41, '#a0623a');
      janela(g, X + W / 2 - 25, Y + H * 0.3, 14, 14, noite); janela(g, X + W / 2 + 11, Y + H * 0.3, 14, 14, noite);
      emoji(g, '👑', X + W / 2, Y + H * 0.08, 18);
      break;
    }
    case 'celeiro': {
      sombra(g, X + W / 2, Y + H - 4, W / 2, 9);
      g.fillStyle = '#d2453c'; rrect(g, X + 6, Y + H * 0.2, W - 12, H * 0.76, 5); g.fill();
      g.fillStyle = '#a8322b';
      g.beginPath(); g.moveTo(X, Y + H * 0.26); g.lineTo(X + W * 0.2, Y - H * 0.22); g.lineTo(X + W * 0.5, Y - H * 0.42); g.lineTo(X + W * 0.8, Y - H * 0.22); g.lineTo(X + W, Y + H * 0.26); g.closePath(); g.fill();
      g.strokeStyle = '#fff'; g.lineWidth = 3; g.stroke();
      const dx = X + W / 2 - 18, dy = Y + H * 0.45, dw = 36, dh = H * 0.51;
      g.fillStyle = '#8f2a24'; g.fillRect(dx, dy, dw, dh);
      g.strokeStyle = '#fff'; g.lineWidth = 3; g.strokeRect(dx, dy, dw, dh);
      g.beginPath(); g.moveTo(dx, dy); g.lineTo(dx + dw, dy + dh); g.moveTo(dx + dw, dy); g.lineTo(dx, dy + dh); g.stroke();
      g.fillStyle = '#fff'; rrect(g, X + W / 2 - 8, Y - 2, 16, 14, 3); g.fill(); g.fillStyle = '#f4d58d'; rrect(g, X + W / 2 - 6, Y, 12, 10, 2); g.fill();
      break;
    }
    case 'estabulo': {
      sombra(g, X + W / 2, Y + H - 4, W / 2, 9);
      g.fillStyle = '#b07a4a'; rrect(g, X + 6, Y + H * 0.2, W - 12, H * 0.76, 5); g.fill();
      g.strokeStyle = '#8d5c33'; g.lineWidth = 1.2; for (let i = 1; i < 6; i++) { g.beginPath(); g.moveTo(X + 6, Y + H * 0.2 + i * H * 0.13); g.lineTo(X + W - 6, Y + H * 0.2 + i * H * 0.13); g.stroke(); }
      telhado(g, X + 6, X + W - 6, Y + H * 0.26, Y - H * 0.3, '#4f8f4a');
      for (let i = 0; i < 2; i++) { const bx = X + 18 + i * (W - 60); g.fillStyle = '#5a3a22'; rrect(g, bx, Y + H * 0.45, 24, H * 0.51, 4); g.fill(); g.fillStyle = '#e8c35a'; g.fillRect(bx + 2, Y + H * 0.8, 20, H * 0.15); }
      g.fillStyle = '#f2cf6b'; rrect(g, X + W - 26, Y + H * 0.7, 20, 16, 4); g.fill(); g.strokeStyle = '#c9a23f'; g.beginPath(); g.moveTo(X + W - 26, Y + H * 0.78); g.lineTo(X + W - 6, Y + H * 0.78); g.stroke();
      emoji(g, '🐴', X + W / 2, Y + H * 0.32, 14);
      break;
    }
    case 'galinheiro': {
      sombra(g, X + W / 2, Y + H - 4, W / 2, 8);
      g.fillStyle = '#7a4e2c'; for (const px of [X + 14, X + W - 18]) g.fillRect(px, Y + H * 0.7, 4, H * 0.26);
      g.fillStyle = '#e0a868'; rrect(g, X + 8, Y + H * 0.3, W - 16, H * 0.45, 5); g.fill();
      telhado(g, X + 8, X + W - 8, Y + H * 0.34, Y - H * 0.05, '#f2b632');
      g.fillStyle = '#5a3520'; g.beginPath(); g.arc(X + W / 2, Y + H * 0.6, 8, Math.PI, 0); g.lineTo(X + W / 2 + 8, Y + H * 0.75); g.lineTo(X + W / 2 - 8, Y + H * 0.75); g.fill();
      g.strokeStyle = '#a0703c'; g.lineWidth = 4; g.beginPath(); g.moveTo(X + W / 2, Y + H * 0.75); g.lineTo(X + W / 2 + 18, Y + H - 4); g.stroke();
      break;
    }
    case 'coelheira': {
      sombra(g, X + W / 2, Y + H - 3, W / 2, 6);
      g.fillStyle = '#7a4e2c'; g.fillRect(X + 10, Y + H * 0.6, 3, H * 0.35); g.fillRect(X + W - 13, Y + H * 0.6, 3, H * 0.35);
      g.fillStyle = '#d9a46a'; rrect(g, X + 6, Y - 6, W - 12, H * 0.72, 4); g.fill();
      g.strokeStyle = 'rgba(80,60,40,.6)'; g.lineWidth = 0.8;
      for (let i = 0; i < 8; i++) { g.beginPath(); g.moveTo(X + 30 + i * 5, Y); g.lineTo(X + 30 + i * 5, Y + H * 0.58); g.stroke(); }
      for (let j = 0; j < 4; j++) { g.beginPath(); g.moveTo(X + 30, Y + j * 7); g.lineTo(X + W - 10, Y + j * 7); g.stroke(); }
      g.fillStyle = '#5a3520'; g.beginPath(); g.arc(X + 18, Y + 12, 7, Math.PI, 0); g.lineTo(X + 25, Y + 20); g.lineTo(X + 11, Y + 20); g.fill();
      telhado(g, X + 6, X + W - 6, Y - 4, Y - 18, '#c95f3a', true);
      break;
    }
    case 'casinhaPet': {
      sombra(g, X + W / 2, Y + H - 3, 17, 5);
      g.fillStyle = '#e9b26b'; rrect(g, X + 6, Y + 6, W - 12, H - 9, 4); g.fill();
      telhado(g, X + 6, X + W - 6, Y + 10, Y - 12, '#e25a6b');
      g.fillStyle = '#4a2f20'; g.beginPath(); g.arc(X + W / 2, Y + 22, 7, Math.PI, 0); g.lineTo(X + W / 2 + 7, Y + H - 4); g.lineTo(X + W / 2 - 7, Y + H - 4); g.fill();
      g.fillStyle = '#fff'; rrect(g, X + W / 2 - 7, Y + 7, 14, 6, 3); g.fill(); emoji(g, '🦴', X + W / 2, Y + 10, 7);
      break;
    }
    case 'ninho': {
      sombra(g, X + W / 2, Y + H - 3, 9, 3);
      g.fillStyle = '#7a4e2c'; g.fillRect(X + W / 2 - 2, Y + 4, 4, H - 6);
      g.fillStyle = '#7fd1ff'; rrect(g, X + W / 2 - 10, Y - 14, 20, 18, 4); g.fill();
      telhado(g, X + W / 2 - 10, X + W / 2 + 10, Y - 12, Y - 26, '#ff8a4c');
      circ(g, X + W / 2, Y - 6, 4, '#2a4560');
      g.fillStyle = '#7a4e2c'; g.fillRect(X + W / 2 - 1, Y - 1, 2, 4); g.fillRect(X + W / 2 - 4, Y + 2, 8, 1.5);
      break;
    }
    case 'colmeia': {
      sombra(g, X + T / 2, Y + T - 3, 12, 4);
      g.fillStyle = '#7a4e2c'; g.fillRect(X + T / 2 - 2, Y + T * 0.55, 4, T * 0.42);
      const cs = ['#e8a21f', '#f2b632', '#ffc94a'];
      for (let i = 0; i < 4; i++) { g.fillStyle = cs[i % 3]; g.beginPath(); g.ellipse(X + T / 2, Y + T * 0.48 - i * 7, 14 - i * 2.5, 5, 0, 0, Math.PI * 2); g.fill(); }
      g.fillStyle = '#5a3520'; g.beginPath(); g.arc(X + T / 2, Y + T * 0.45, 3.5, 0, Math.PI * 2); g.fill();
      const v = t * 3; emoji(g, '🐝', X + T / 2 + Math.cos(v) * 16, Y - 4 + Math.sin(v * 1.3) * 6, 9);
      break;
    }
    case 'chiqueiro': {
      sombra(g, X + W / 2, Y + H - 4, W / 2, 8);
      g.fillStyle = '#9a6b4a'; g.beginPath(); g.ellipse(X + W / 2, Y + H * 0.78, W / 2 - 6, H * 0.18, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#7d5638'; g.beginPath(); g.ellipse(X + W * 0.62, Y + H * 0.8, 12, 5, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#f3b6c4'; rrect(g, X + 8, Y + H * 0.15, W * 0.55, H * 0.45, 5); g.fill();
      telhado(g, X + 8, X + 8 + W * 0.55, Y + H * 0.2, Y - H * 0.12, '#c95f3a');
      g.fillStyle = '#5a3520'; g.beginPath(); g.arc(X + 8 + W * 0.275, Y + H * 0.45, 7, Math.PI, 0); g.lineTo(X + 15 + W * 0.275, Y + H * 0.6); g.lineTo(X + 1 + W * 0.275, Y + H * 0.6); g.fill();
      g.fillStyle = '#b07a4a'; for (let i = 0; i < 5; i++) { rrect(g, X + 4 + i * (W - 12) / 4, Y + H * 0.62, 4, H * 0.32, 2); g.fill(); }
      g.fillRect(X + 4, Y + H * 0.7, W - 8, 3); g.fillRect(X + 4, Y + H * 0.84, W - 8, 3);
      break;
    }
    case 'viveiro': {
      sombra(g, X + W / 2, Y + H - 4, W / 2, 8);
      g.fillStyle = 'rgba(200,235,255,.35)'; g.beginPath(); g.moveTo(X + 6, Y + H - 4); g.lineTo(X + 6, Y + H * 0.2); g.quadraticCurveTo(X + W / 2, Y - H * 0.35, X + W - 6, Y + H * 0.2); g.lineTo(X + W - 6, Y + H - 4); g.closePath(); g.fill();
      g.strokeStyle = '#ffffff'; g.lineWidth = 2;
      for (let i = 0; i <= 5; i++) { const px = X + 6 + i * (W - 12) / 5; g.beginPath(); g.moveTo(px, Y + H - 4); g.lineTo(px, Y + H * 0.2 - Math.sin(i / 5 * Math.PI) * H * 0.26); g.stroke(); }
      g.beginPath(); g.moveTo(X + 6, Y + H * 0.2); g.quadraticCurveTo(X + W / 2, Y - H * 0.35, X + W - 6, Y + H * 0.2); g.stroke();
      g.strokeStyle = '#8a5530'; g.lineWidth = 3; g.beginPath(); g.moveTo(X + 14, Y + H * 0.55); g.lineTo(X + W - 14, Y + H * 0.45); g.stroke();
      emoji(g, '🌿', X + 16, Y + H - 10, 14); emoji(g, '🌸', X + W - 16, Y + H - 10, 12);
      break;
    }
    case 'toca': {
      sombra(g, X + W / 2, Y + H - 3, W / 2, 6);
      g.fillStyle = '#8a5a35'; g.beginPath(); g.ellipse(X + W / 2, Y + H * 0.45, W / 2 - 4, H * 0.5, 0, Math.PI, 0); g.lineTo(X + W - 4, Y + H - 4); g.lineTo(X + 4, Y + H - 4); g.closePath(); g.fill();
      g.fillStyle = '#a8744a'; g.beginPath(); g.ellipse(X + W / 2, Y + H * 0.45, W / 2 - 10, H * 0.38, 0, Math.PI, 0); g.fill();
      g.fillStyle = '#3a2416'; g.beginPath(); g.arc(X + W * 0.35, Y + H * 0.75, 9, Math.PI, 0); g.lineTo(X + W * 0.35 + 9, Y + H - 4); g.lineTo(X + W * 0.35 - 9, Y + H - 4); g.fill();
      g.fillStyle = '#4caf50'; g.beginPath(); g.ellipse(X + W * 0.6, Y - 2, 18, 6, 0, 0, Math.PI * 2); g.fill();
      emoji(g, '🍄', X + W - 14, Y + H - 8, 12);
      break;
    }
    case 'casaArvore': {
      g.save(); g.translate(X + W / 2, Y + H - 2); desenharArvore(g, 0, 0, 'redonda', t, 0.3); g.restore();
      g.fillStyle = '#7a4e2c'; g.fillRect(X + W / 2 - 3, Y + H * 0.3, 6, H * 0.7);
      g.fillStyle = '#c9925c'; rrect(g, X + 10, Y - H * 0.05, W - 20, H * 0.34, 4); g.fill();
      telhado(g, X + 10, X + W - 10, Y, Y - H * 0.3, '#e25a6b');
      janela(g, X + W / 2 - 7, Y + H * 0.06, 14, 11, noite);
      g.strokeStyle = '#a5753f'; g.lineWidth = 2;
      for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(X + W - 18, Y + H * 0.3 + i * 9); g.lineTo(X + W - 8, Y + H * 0.3 + i * 9); g.stroke(); }
      g.beginPath(); g.moveTo(X + W - 18, Y + H * 0.28); g.lineTo(X + W - 18, Y + H - 4); g.moveTo(X + W - 8, Y + H * 0.28); g.lineTo(X + W - 8, Y + H - 4); g.stroke();
      break;
    }
    case 'caverna': {
      sombra(g, X + W / 2, Y + H - 4, W / 2, 9);
      g.fillStyle = '#7d8691'; g.beginPath(); g.moveTo(X + 2, Y + H - 4); g.quadraticCurveTo(X + 4, Y - H * 0.1, X + W / 2, Y - H * 0.15); g.quadraticCurveTo(X + W - 4, Y - H * 0.1, X + W - 2, Y + H - 4); g.closePath(); g.fill();
      g.fillStyle = '#9aa3ad'; g.beginPath(); g.ellipse(X + W * 0.35, Y + H * 0.15, 16, 10, -0.3, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#2a2420'; g.beginPath(); g.moveTo(X + W * 0.3, Y + H - 4); g.quadraticCurveTo(X + W / 2, Y + H * 0.2, X + W * 0.7, Y + H - 4); g.closePath(); g.fill();
      circ(g, X + 10, Y + H - 8, 5, '#6aa65c'); circ(g, X + W - 10, Y + H - 9, 6, '#79b86a');
      break;
    }
    case 'savana': {
      sombra(g, X + W / 2, Y + H - 4, W / 2, 8);
      g.fillStyle = '#d9c27a'; rrect(g, X + 4, Y + H * 0.35, W - 8, H * 0.6, 8); g.fill();
      g.save(); g.translate(X + W * 0.25, Y + H * 0.75); desenharArvore(g, 0, 0, 'acacia', t, 0.4); g.restore();
      g.fillStyle = '#4aa9dd'; g.beginPath(); g.ellipse(X + W * 0.7, Y + H * 0.72, 16, 7, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#9a6a3c';
      for (let i = 0; i < 9; i++) { rrect(g, X + 4 + i * (W - 12) / 8, Y + H * 0.3, 4, H * 0.66, 2); g.fill(); }
      g.fillRect(X + 4, Y + H * 0.42, W - 8, 3); g.fillRect(X + 4, Y + H * 0.62, W - 8, 3);
      break;
    }
    case 'ninhoDragao': {
      sombra(g, X + W / 2, Y + H - 4, W / 2, 10);
      g.fillStyle = '#5e5874'; g.beginPath(); g.moveTo(X + 4, Y + H - 4); g.lineTo(X + W * 0.2, Y + H * 0.1); g.lineTo(X + W * 0.4, Y + H * 0.3); g.lineTo(X + W * 0.55, Y - H * 0.3); g.lineTo(X + W * 0.75, Y + H * 0.2); g.lineTo(X + W - 4, Y + H - 4); g.closePath(); g.fill();
      g.fillStyle = '#7a7392'; g.beginPath(); g.moveTo(X + W * 0.55, Y - H * 0.3); g.lineTo(X + W * 0.62, Y + H * 0.1); g.lineTo(X + W * 0.48, Y + H * 0.05); g.closePath(); g.fill();
      g.fillStyle = '#8a5a35'; g.beginPath(); g.ellipse(X + W / 2, Y + H * 0.8, W * 0.3, H * 0.15, 0, 0, Math.PI * 2); g.fill();
      for (let i = 0; i < 3; i++) { g.fillStyle = ['#ff7a3d', '#b07cff', '#4fd18b'][i]; g.beginPath(); g.ellipse(X + W * 0.4 + i * 12, Y + H * 0.72, 5, 7, 0, 0, Math.PI * 2); g.fill(); }
      const fl = Math.sin(t * 5) * 2; emoji(g, '🔥', X + W * 0.2, Y + H * 0.85 + fl, 12); emoji(g, '✨', X + W * 0.8, Y + H * 0.2 - fl, 10);
      break;
    }
    case 'chale': {
      sombra(g, X + W / 2, Y + H - 4, W / 2, 8);
      g.fillStyle = '#a8703f'; rrect(g, X + 7, Y + H * 0.3, W - 14, H * 0.66, 5); g.fill();
      g.strokeStyle = '#8a5530'; g.lineWidth = 1.5; for (let i = 1; i < 5; i++) { g.beginPath(); g.moveTo(X + 7, Y + H * 0.3 + i * H * 0.13); g.lineTo(X + W - 7, Y + H * 0.3 + i * H * 0.13); g.stroke(); }
      telhado(g, X + 7, X + W - 7, Y + H * 0.34, Y - H * 0.3, '#4f6f8f');
      g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(X + 4, Y + H * 0.3); g.lineTo(X + W / 2, Y - H * 0.28); g.lineTo(X + W - 4, Y + H * 0.3); g.lineTo(X + W - 12, Y + H * 0.22); g.lineTo(X + W / 2, Y - H * 0.16); g.lineTo(X + 12, Y + H * 0.22); g.closePath(); g.fill();
      porta(g, X + W / 2 - 8, Y + H * 0.58, 16, H * 0.38 - 4, '#5a3520');
      janela(g, X + 12, Y + H * 0.45, 12, 12, noite); janela(g, X + W - 24, Y + H * 0.45, 12, 12, noite);
      g.fillStyle = '#7a7a7a'; rrect(g, X + W - 22, Y - 10, 8, 16, 2); g.fill();
      break;
    }
    case 'iglu': {
      sombra(g, X + W / 2, Y + H - 4, W / 2, 8);
      g.fillStyle = '#e8f3ff'; g.beginPath(); g.ellipse(X + W / 2, Y + H - 4, W / 2 - 4, H * 0.85, 0, Math.PI, 0); g.fill();
      g.strokeStyle = '#bcd3ea'; g.lineWidth = 1.5;
      for (let i = 1; i < 4; i++) { g.beginPath(); g.ellipse(X + W / 2, Y + H - 4, W / 2 - 4, H * 0.85 * (1 - i * 0.24), 0, Math.PI, 0); g.stroke(); }
      g.fillStyle = '#d6e8fa'; g.beginPath(); g.ellipse(X + W * 0.72, Y + H - 4, 13, 18, 0, Math.PI, 0); g.fill();
      g.fillStyle = noite ? '#ffd76a' : '#2a3b50'; g.beginPath(); g.ellipse(X + W * 0.72, Y + H - 4, 7, 12, 0, Math.PI, 0); g.fill();
      break;
    }
    case 'casaPraia': {
      sombra(g, X + W / 2, Y + H - 4, W / 2, 9);
      g.fillStyle = '#c9a06a'; for (const px of [X + 12, X + W - 16, X + W / 2 - 2]) g.fillRect(px, Y + H * 0.7, 4, H * 0.28);
      g.fillStyle = '#7fd6e0'; rrect(g, X + 6, Y + H * 0.15, W - 12, H * 0.58, 6); g.fill();
      g.fillStyle = '#ffffff'; for (let i = 0; i < 4; i++) g.fillRect(X + 6, Y + H * 0.2 + i * H * 0.14, W - 12, 2);
      telhado(g, X + 6, X + W - 6, Y + H * 0.2, Y - H * 0.25, '#ff8a4c', true);
      porta(g, X + W / 2 - 9, Y + H * 0.38, 18, H * 0.35, '#e8574a');
      janela(g, X + 16, Y + H * 0.32, 18, 14, noite); janela(g, X + W - 34, Y + H * 0.32, 18, 14, noite);
      g.fillStyle = '#c9a06a'; g.fillRect(X + 2, Y + H * 0.72, W - 4, 5);
      emoji(g, '🌺', X + 12, Y + H * 0.66, 10);
      break;
    }
    case 'palacio': {
      sombra(g, X + W / 2, Y + H - 4, W / 2 + 4, 12);
      const pc = '#f3ecff', ts = '#ffd23f';
      g.fillStyle = pc; rrect(g, X + 18, Y + H * 0.22, W - 36, H * 0.74, 8); g.fill();
      for (const tx of [X + 14, X + W - 14, X + W / 2]) {
        const alto = tx === X + W / 2 ? 0.5 : 0.3;
        g.fillStyle = '#e3d4ff'; rrect(g, tx - 13, Y + H * (0.22 - alto * 0.5), 26, H * (0.74 + alto * 0.5), 8); g.fill();
        g.fillStyle = '#7b6cf0'; g.beginPath(); g.moveTo(tx - 17, Y + H * (0.24 - alto * 0.5)); g.quadraticCurveTo(tx, Y - H * alto, tx + 17, Y + H * (0.24 - alto * 0.5)); g.closePath(); g.fill();
        emoji(g, '⭐', tx, Y - H * alto + 6 + Math.sin(t * 3 + tx) * 2, 14);
        janela(g, tx - 6, Y + H * 0.35, 12, 16, true);
      }
      porta(g, X + W / 2 - 16, Y + H * 0.58, 32, H * 0.38, '#b08a3a');
      g.fillStyle = ts; for (let i = 0; i < 7; i++) circ(g, X + 26 + i * (W - 52) / 6, Y + H * 0.24, 3, ts);
      for (let i = 0; i < 4; i++) { const a = t * 1.5 + i * 1.6; emoji(g, '✨', X + W / 2 + Math.cos(a) * W * 0.45, Y + H * 0.3 + Math.sin(a) * H * 0.3, 10, { alpha: 0.7 }); }
      break;
    }
    case 'moinho': {
      sombra(g, X + W / 2, Y + H - 4, W / 3, 7);
      g.fillStyle = '#f2e3c4'; g.beginPath(); g.moveTo(X + W * 0.3, Y + H - 4); g.lineTo(X + W * 0.38, Y + H * 0.05); g.lineTo(X + W * 0.62, Y + H * 0.05); g.lineTo(X + W * 0.7, Y + H - 4); g.closePath(); g.fill();
      telhado(g, X + W * 0.36, X + W * 0.64, Y + H * 0.08, Y - H * 0.12, '#c95f3a', true);
      porta(g, X + W / 2 - 6, Y + H * 0.68, 12, H * 0.28, '#8a5530');
      const cx = X + W / 2, cy = Y + H * 0.08, a0 = t * 1.2;
      for (let i = 0; i < 4; i++) {
        const a = a0 + i * Math.PI / 2;
        g.save(); g.translate(cx, cy); g.rotate(a);
        g.fillStyle = '#8a5530'; g.fillRect(-1.5, 0, 3, 34);
        g.fillStyle = '#fff8ea'; g.fillRect(1.5, 8, 9, 24); g.strokeStyle = '#c9a06a'; g.lineWidth = 1; g.strokeRect(1.5, 8, 9, 24);
        g.restore();
      }
      circ(g, cx, cy, 4, '#5a3520');
      break;
    }
    case 'farol': {
      sombra(g, X + T / 2, Y + T - 4, 12, 4);
      g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(X + 8, Y + T - 3); g.lineTo(X + 13, Y - 40); g.lineTo(X + T - 13, Y - 40); g.lineTo(X + T - 8, Y + T - 3); g.closePath(); g.fill();
      g.fillStyle = '#e8364f'; for (let i = 0; i < 3; i++) { const y0 = Y + T - 12 - i * 22; g.fillRect(X + 9 + i * 1.6, y0, T - 18 - i * 3.2, 9); }
      g.fillStyle = noite ? '#fff2a8' : '#cfe8ff'; rrect(g, X + 12, Y - 52, T - 24, 12, 3); g.fill();
      g.fillStyle = '#e8364f'; g.beginPath(); g.moveTo(X + 9, Y - 52); g.lineTo(X + T / 2, Y - 64); g.lineTo(X + T - 9, Y - 52); g.fill();
      if (noite) { const a = t * 1.5; g.fillStyle = 'rgba(255,240,160,.25)'; g.beginPath(); g.moveTo(X + T / 2, Y - 46); g.lineTo(X + T / 2 + Math.cos(a) * 140 - 20, Y - 46 + Math.sin(a) * 50); g.lineTo(X + T / 2 + Math.cos(a) * 140 + 20, Y - 46 + Math.sin(a) * 50 + 20); g.closePath(); g.fill(); }
      break;
    }
    case 'sorveteria': {
      sombra(g, X + W / 2, Y + H - 4, W / 2, 6);
      g.fillStyle = '#ffffff'; rrect(g, X + 6, Y + H * 0.2, W - 12, H * 0.76, 5); g.fill();
      g.fillStyle = '#ff8fc8'; for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(X + 6 + (i + 0.5) * (W - 12) / 6, Y + H * 0.1, (W - 12) / 12, 0, Math.PI); g.fill(); }
      g.fillRect(X + 4, Y - H * 0.1, W - 8, H * 0.2);
      g.fillStyle = '#7fd0ff'; rrect(g, X + 12, Y + H * 0.4, W - 24, H * 0.25, 3); g.fill();
      emoji(g, '🍦', X + W / 2, Y - H * 0.35, 18); emoji(g, '🍨', X + 18, Y + H * 0.52, 10); emoji(g, '🍧', X + W - 18, Y + H * 0.52, 10);
      break;
    }
    case 'rodaGigante': {
      sombra(g, X + W / 2, Y + H - 4, W / 2, 10);
      const cx = X + W / 2, cy = Y + H * 0.35, r = W * 0.42;
      g.strokeStyle = '#7b6cf0'; g.lineWidth = 4; g.beginPath(); g.moveTo(cx - 24, Y + H - 4); g.lineTo(cx, cy); g.lineTo(cx + 24, Y + H - 4); g.stroke();
      g.strokeStyle = '#ff6fa5'; g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.stroke();
      const cs = ['#ff5c5c', '#ffd23f', '#4fd18b', '#4fa8ff', '#b77cff', '#ff8a4c', '#ff6fa5', '#7fe3ff'];
      for (let i = 0; i < 8; i++) {
        const a = t * 0.5 + i * Math.PI / 4, px = cx + Math.cos(a) * r, py = cy + Math.sin(a) * r;
        g.strokeStyle = 'rgba(123,108,240,.6)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(cx, cy); g.lineTo(px, py); g.stroke();
        g.fillStyle = cs[i]; rrect(g, px - 7, py, 14, 11, 4); g.fill();
      }
      circ(g, cx, cy, 6, '#ffd23f');
      break;
    }
    case 'estatua': {
      sombra(g, X + T / 2, Y + T - 4, 14, 4);
      g.fillStyle = '#b8c2cc'; rrect(g, X + 6, Y + T * 0.55, T - 12, T * 0.42, 3); g.fill();
      emoji(g, '🦄', X + T / 2, Y + T * 0.2, 30, { filtro: 'grayscale(1) brightness(1.15)' });
      if (Math.sin(t * 3 + b.id) > 0.6) emoji(g, '✨', X + T - 6, Y - 6, 10);
      break;
    }
    case 'macieira': case 'laranjeira': case 'bananeira': case 'cerejeira': case 'pereira': case 'limoeiro': case 'pessegueiro': case 'mangueira': {
      const tipo = b.tipo === 'cerejeira' ? 'cereja' : 'frutas';
      g.save(); g.translate(X + T / 2, Y + T - 4); g.scale(0.85, 0.85);
      desenharArvore(g, 0, 0, tipo, t, 0.6);
      g.restore();
      const pronto = b.frutaEm && Date.now() >= b.frutaEm;
      const e = ITENS[def.fruta].e;
      const pts = [[-10, -36], [8, -38], [-2, -28], [10, -26], [-12, -24]];
      const n = pronto ? 5 : 2;
      for (let i = 0; i < n; i++) emoji(g, e, X + T / 2 + pts[i][0] * 0.85, Y + T - 4 + pts[i][1] * 0.85, pronto ? 11 : 6, { alpha: pronto ? 1 : 0.6 });
      if (pronto && Math.sin(t * 3 + b.id) > 0.6) emoji(g, '✨', X + T / 2 + 14, Y - 14, 10);
      break;
    }
    case 'cerca': {
      const viz = (dx, dy) => b.vizinhos && b.vizinhos[dx + ',' + dy];
      g.fillStyle = '#9a6a3c';
      if (viz(1, 0)) { g.fillRect(X + T / 2, Y + T * 0.42, T / 2 + 1, 4); g.fillRect(X + T / 2, Y + T * 0.62, T / 2 + 1, 4); }
      if (viz(-1, 0)) { g.fillRect(X, Y + T * 0.42, T / 2, 4); g.fillRect(X, Y + T * 0.62, T / 2, 4); }
      if (viz(0, 1)) { g.fillRect(X + T / 2 - 2, Y + T * 0.5, 4, T * 0.5 + 6); }
      if (viz(0, -1)) { g.fillRect(X + T / 2 - 2, Y - 6, 4, T * 0.6); }
      sombra(g, X + T / 2, Y + T * 0.86, 6, 2.5);
      g.fillStyle = '#b07a4a'; rrect(g, X + T / 2 - 4, Y + T * 0.2, 8, T * 0.66, 3); g.fill();
      g.fillStyle = '#c9925c'; g.beginPath(); g.ellipse(X + T / 2, Y + T * 0.22, 4, 2, 0, 0, Math.PI * 2); g.fill();
      break;
    }
    case 'banco': {
      sombra(g, X + T / 2, Y + T - 6, 16, 4);
      g.fillStyle = '#6b4a30'; g.fillRect(X + 8, Y + T * 0.55, 3, T * 0.35); g.fillRect(X + T - 11, Y + T * 0.55, 3, T * 0.35);
      g.fillStyle = '#b07a4a'; rrect(g, X + 4, Y + T * 0.5, T - 8, 6, 2); g.fill();
      rrect(g, X + 4, Y + T * 0.2, T - 8, 5, 2); g.fill(); rrect(g, X + 4, Y + T * 0.32, T - 8, 5, 2); g.fill();
      g.fillStyle = '#6b4a30'; g.fillRect(X + 7, Y + T * 0.2, 3, T * 0.32); g.fillRect(X + T - 10, Y + T * 0.2, 3, T * 0.32);
      break;
    }
    case 'poste': {
      sombra(g, X + T / 2, Y + T - 5, 7, 3);
      g.fillStyle = '#3e4a5a'; g.fillRect(X + T / 2 - 2, Y - 18, 4, T + 12);
      g.fillStyle = '#3e4a5a'; rrect(g, X + T / 2 - 7, Y + T - 9, 14, 5, 2); g.fill();
      g.fillStyle = noite ? '#fff2a8' : '#e6eef5'; g.beginPath(); g.arc(X + T / 2, Y - 22, 7, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#3e4a5a'; g.beginPath(); g.moveTo(X + T / 2 - 9, Y - 26); g.lineTo(X + T / 2 + 9, Y - 26); g.lineTo(X + T / 2, Y - 34); g.fill();
      break;
    }
    case 'balanco': {
      sombra(g, X + T / 2, Y + T - 5, 16, 4);
      g.strokeStyle = '#8d5c33'; g.lineWidth = 3.5; g.lineCap = 'round';
      g.beginPath(); g.moveTo(X + 4, Y + T - 4); g.lineTo(X + 9, Y - 18); g.lineTo(X + T - 9, Y - 18); g.lineTo(X + T - 4, Y + T - 4); g.stroke();
      const a = Math.sin(t * 2) * 0.35;
      g.save(); g.translate(X + T / 2, Y - 18); g.rotate(a);
      g.strokeStyle = '#6b6b6b'; g.lineWidth = 1; g.beginPath(); g.moveTo(-7, 0); g.lineTo(-7, 30); g.moveTo(7, 0); g.lineTo(7, 30); g.stroke();
      g.fillStyle = '#ff6fa5'; rrect(g, -10, 29, 20, 5, 2); g.fill();
      g.restore();
      break;
    }
    case 'fonte': {
      sombra(g, X + W / 2, Y + H - 8, W / 2 - 2, 10);
      g.fillStyle = '#b8c2cc'; g.beginPath(); g.ellipse(X + W / 2, Y + H * 0.66, W / 2 - 4, H * 0.26, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#5ab0ff'; g.beginPath(); g.ellipse(X + W / 2, Y + H * 0.64, W / 2 - 10, H * 0.19, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#b8c2cc'; g.fillRect(X + W / 2 - 4, Y + H * 0.3, 8, H * 0.34);
      g.fillStyle = '#cfd7de'; g.beginPath(); g.ellipse(X + W / 2, Y + H * 0.3, 14, 5, 0, 0, Math.PI * 2); g.fill();
      for (let i = 0; i < 10; i++) {
        const p = ((t * 0.8 + i / 10) % 1); const ang = i * 0.63;
        const px = X + W / 2 + Math.cos(ang) * p * 22, py = Y + H * 0.28 - Math.sin(p * Math.PI) * 26 + p * 14;
        circ(g, px, py, 2.2 * (1 - p * 0.5), 'rgba(170,220,255,.9)');
      }
      break;
    }
    case 'arcoiris': {
      const cs = ['#ff5a5a', '#ff9f3f', '#ffe04a', '#5fd35f', '#4fa8ff', '#9b6cff'];
      g.lineCap = 'round';
      for (let i = 0; i < cs.length; i++) { g.strokeStyle = cs[i]; g.lineWidth = 4; g.beginPath(); g.arc(X + W / 2, Y + H - 4, W / 2 - 4 - i * 4, Math.PI, 0); g.stroke(); }
      circ(g, X + 8, Y + H - 4, 8, '#fff'); circ(g, X + 15, Y + H - 6, 7, '#fff'); circ(g, X + W - 8, Y + H - 4, 8, '#fff'); circ(g, X + W - 15, Y + H - 6, 7, '#fff');
      break;
    }
  }
}
// construções que ficam no chão (desenhadas antes de tudo)
function desenharChao(g, b, t) {
  const T = TILE, X = b.x * T, Y = b.y * T, def = CONSTRU[b.tipo];
  if (b.tipo === 'canteiro') {
    const molhado = b.planta && b.planta.regado;
    g.fillStyle = molhado ? '#5e3b22' : '#8a5a35'; rrect(g, X + 3, Y + 4, T - 6, T - 7, 8); g.fill();
    g.strokeStyle = molhado ? '#4a2d18' : '#6e4426'; g.lineWidth = 2; g.lineCap = 'round';
    for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(X + 9, Y + 12 + i * 8); g.lineTo(X + T - 9, Y + 12 + i * 8); g.stroke(); }
  } else if (b.tipo === 'caminho') {
    const k = b.x * 7 + b.y * 13;
    for (let i = 0; i < 4; i++) { const px = X + 10 + ((k + i * 5) % 3) * 4 + (i % 2) * 14, py = Y + 10 + Math.floor(i / 2) * 18; g.fillStyle = '#a9a9a0'; g.beginPath(); g.ellipse(px, py + 1.5, 8, 6, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#cfcfc4'; g.beginPath(); g.ellipse(px, py, 8, 6, 0, 0, Math.PI * 2); g.fill(); }
  } else if (b.tipo === 'flores') {
    const fl = ['🌷', '🌸', '🌼', '🌺', '💐'];
    const k = (b.x * 31 + b.y * 17) % 5;
    emoji(g, fl[k], X + 11, Y + 14, 15); emoji(g, fl[(k + 2) % 5], X + 28, Y + 20, 14); emoji(g, fl[(k + 1) % 5], X + 16, Y + 30, 14);
  } else if (b.tipo === 'lago') {
    const W = def.w * T, H = def.h * T;
    g.fillStyle = '#9aa4ad'; g.beginPath(); g.ellipse(X + W / 2, Y + H / 2 + 2, W / 2 - 1, H / 2 - 2, 0, 0, Math.PI * 2); g.fill();
    const gr = g.createRadialGradient(X + W / 2, Y + H / 2, 4, X + W / 2, Y + H / 2, W / 2);
    gr.addColorStop(0, '#3d9be0'); gr.addColorStop(1, '#5fc0ef');
    g.fillStyle = gr; g.beginPath(); g.ellipse(X + W / 2, Y + H / 2, W / 2 - 6, H / 2 - 7, 0, 0, Math.PI * 2); g.fill();
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; circ(g, X + W / 2 + Math.cos(a) * (W / 2 - 3), Y + H / 2 + 2 + Math.sin(a) * (H / 2 - 4), 4.5, '#b9c2ca'); }
    g.fillStyle = '#4caf50'; g.beginPath(); g.ellipse(X + W * 0.3, Y + H * 0.35, 6, 4, 0.3, 0.3, Math.PI * 2); g.fill();
    emoji(g, '🌸', X + W * 0.3, Y + H * 0.33, 7);
    g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 1.2;
    const p = (t * 0.5) % 1; g.beginPath(); g.ellipse(X + W * 0.62, Y + H * 0.6, 4 + p * 10, 2 + p * 5, 0, 0, Math.PI * 2); g.globalAlpha = 1 - p; g.stroke(); g.globalAlpha = 1;
  } else if (b.tipo === 'arcoiris') {
    // nada no chão
  }
}
function desenharPlanta(g, b, t) {
  const p = b.planta; if (!p) return;
  const T = TILE, x = b.x * T + T / 2, y = b.y * T + T / 2;
  const def = PLANTAS[p.tipo];
  const prog = Math.min(1, (Date.now() - p.inicio) / (p.dur * 1000));
  if (prog >= 1) {
    const pulo = Math.abs(Math.sin(t * 3 + b.id)) * 2.5;
    emoji(g, '🌿', x, y + 4, 22);
    emoji(g, def.e, x, y - 6 - pulo, 24);
    if (Math.sin(t * 2.5 + b.id * 2) > 0.5) emoji(g, '✨', x + 13, y - 18, 11);
  } else if (prog > 0.66) {
    emoji(g, '🌿', x, y, 24); emoji(g, def.e, x + 3, y - 2, 11, { alpha: 0.85 });
  } else if (prog > 0.33) {
    emoji(g, '🌱', x, y, 20);
  } else {
    emoji(g, '🌱', x, y + 4, 12);
  }
}
// ponte quebrada: placa
function desenharPlaca(g, x, y, texto) {
  sombra(g, x, y - 2, 9, 3);
  g.fillStyle = '#7a4e2c'; g.fillRect(x - 2, y - 26, 4, 25);
  g.fillStyle = '#e9c48a'; rrect(g, x - 15, y - 36, 30, 16, 4); g.fill();
  g.strokeStyle = '#a5753f'; g.lineWidth = 1.5; g.stroke();
  emoji(g, texto || '🚧', x, y - 28, 11);
}
