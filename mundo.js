// ===== Ilhas da Luiza — o mundo (ilhas, rios, pontes, natureza, caminhos) =====
'use strict';
const NT = MAP_W * MAP_H;
const ter = new Uint8Array(NT);        // 0 água, 1 areia, 2 grama, 3 ponte aberta, 4 ponte quebrada
const ilhaDe = new Int8Array(NT).fill(-1);
const pontDir = new Uint8Array(NT);    // 0 = atravessa na horizontal, 1 = na vertical
const pontIlha = new Int8Array(NT).fill(-1);
const distTerra = new Uint8Array(NT);
const varGrama = new Uint8Array(NT);
const bloq = new Uint8Array(NT);
const natureza = [];                   // {k, tipo, sub, x, y, ilha}
const natPorTile = new Map();
const placas = {};                     // ilha -> {x,y}

function idx(x, y) { return y * MAP_W + x; }
function dentro(x, y) { return x >= 0 && y >= 0 && x < MAP_W && y < MAP_H; }
function rng(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function hash2(x, y, s) {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul((s | 0) + 1, 1013904223)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
function ruido(x, y, s) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi, s), b = hash2(xi + 1, yi, s), c = hash2(xi, yi + 1, s), d = hash2(xi + 1, yi + 1, s);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function npcPos(id) { const n = NPCS[id], il = ILHAS[n.ilha]; return { x: il.cx + n.dx, y: il.cy + n.dy }; }

const ILHAS_ANTIGAS = 5; // as 5 primeiras ilhas: a natureza delas tem que sair igualzinha (o save guarda pelo índice)
function gerarMundo() {
  // relevo das ilhas
  for (let y = 0; y < MAP_H; y++) for (let x = 0; x < MAP_W; x++) {
    let best = -9, bi = -1;
    for (const il of ILHAS) {
      const d = Math.hypot(x - il.cx, y - il.cy) / il.r;
      if (d > 1.45 && il.id >= ILHAS_ANTIGAS) continue; // longe demais: nunca vira terra

      const n = (ruido(x * 0.13, y * 0.13, il.id + 1) - 0.5) * 0.55 + (ruido(x * 0.35, y * 0.35, il.id + 9) - 0.5) * 0.2;
      const h = 1 - d + n;
      if (h > best) { best = h; bi = il.id; }
    }
    const i = idx(x, y);
    if (best > 0) { ter[i] = best < ILHAS[bi].areia + 0.02 ? 1 : 2; ilhaDe[i] = bi; }
    varGrama[i] = ruido(x * 0.22, y * 0.22, 77) > 0.52 ? 1 : 0;
  }
  // tira pedacinhos soltos (só fica o que liga no centro da ilha)
  const vis = new Uint8Array(NT), fila = new Int32Array(NT);
  for (const il of ILHAS) {
    let a = 0, b = 0; const s = idx(il.cx, il.cy); ter[s] = ter[s] || 2; ilhaDe[s] = il.id; vis[s] = 1; fila[b++] = s;
    while (a < b) {
      const c = fila[a++], cx = c % MAP_W, cy = (c / MAP_W) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = cx + dx, ny = cy + dy; if (!dentro(nx, ny)) continue;
        const n = idx(nx, ny); if (vis[n] || !ter[n] || ilhaDe[n] !== il.id) continue;
        vis[n] = 1; fila[b++] = n;
      }
    }
  }
  for (let i = 0; i < NT; i++) if (ter[i] && !vis[i]) { ter[i] = 0; ilhaDe[i] = -1; }
  // ilha 0: centro sempre de grama
  for (let y = -6; y <= 6; y++) for (let x = -6; x <= 6; x++) if (x * x + y * y <= 30) { const i = idx(ILHAS[0].cx + x, ILHAS[0].cy + y); ter[i] = 2; ilhaDe[i] = 0; }

  // rios
  for (const il of ILHAS) {
    if (!il.rio) continue;
    const off = il.id === 1 ? -2 : 3;
    const travessias = [il.cx - 5, il.cx + 4];
    for (let x = il.cx - il.r - 4; x <= il.cx + il.r + 4; x++) {
      const yc = Math.round(il.cy + off + 2.2 * Math.sin((x - il.cx) * 0.32));
      for (let dy = 0; dy <= 1; dy++) {
        const y = yc + dy; if (!dentro(x, y)) continue;
        const i = idx(x, y); if (!ter[i] || ilhaDe[i] !== il.id) continue;
        if (travessias.includes(x) || travessias.includes(x - 1)) { ter[i] = 3; pontDir[i] = 1; pontIlha[i] = -1; }
        else ter[i] = 0;
      }
    }
  }
  // pontes: as 4 primeiras saem da Campina; as novas saem da ilha anterior (il.de)
  for (let k = 1; k < ILHAS.length; k++) {
    const il = ILHAS[k], pai = il.de != null ? il.de : 0, c0 = ILHAS[pai];
    const horiz = Math.abs(il.cx - c0.cx) > Math.abs(il.cy - c0.cy);
    const dist = Math.hypot(il.cx - c0.cx, il.cy - c0.cy);
    let primeiro = null, ultimoTerra = null;
    for (let s = 0; s <= dist * 4; s++) {
      const p = s / (dist * 4);
      const x = Math.round(c0.cx + (il.cx - c0.cx) * p), y = Math.round(c0.cy + (il.cy - c0.cy) * p);
      const i = idx(x, y);
      if (ter[i] === 0 || ter[i] === 4) {
        if (!primeiro) primeiro = ultimoTerra;
        for (let o = 0; o <= 1; o++) {
          const xx = horiz ? x : x + o, yy = horiz ? y + o : y;
          const j = idx(xx, yy);
          if (ter[j] === 0 || ter[j] === 4) { ter[j] = 4; pontDir[j] = horiz ? 0 : 1; pontIlha[j] = k; if (ilhaDe[j] < 0) ilhaDe[j] = -2; }
        }
      } else if (ilhaDe[i] === pai) ultimoTerra = { x, y };
    }
    if (primeiro) placas[k] = horiz ? { x: primeiro.x, y: primeiro.y - 1 } : { x: primeiro.x - 1, y: primeiro.y };
  }
  // distância até a terra (para a cor do mar)
  {
    let a = 0, b = 0; distTerra.fill(255);
    for (let i = 0; i < NT; i++) if (ter[i] === 1 || ter[i] === 2) { distTerra[i] = 0; fila[b++] = i; }
    while (a < b) {
      const c = fila[a++], cx = c % MAP_W, cy = (c / MAP_W) | 0;
      if (distTerra[c] >= 6) continue;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = cx + dx, ny = cy + dy; if (!dentro(nx, ny)) continue;
        const n = idx(nx, ny); if (distTerra[n] !== 255) continue;
        distTerra[n] = distTerra[c] + 1; fila[b++] = n;
      }
    }
  }
  // natureza
  // 1ª passada: só as ilhas antigas, com o mesmo sorteio de sempre (as pontes novas não contam aqui)
  let antigas = true;
  const R0 = rng(2026);
  const perto = (x, y) => {
    for (const il of ILHAS) if (Math.hypot(x - il.cx, y - il.cy) < (il.id === 0 ? 6.5 : 3.5)) return true;
    for (const id in NPCS) { const p = npcPos(id); if (Math.abs(x - p.x) <= 1.5 && Math.abs(y - p.y) <= 1.5) return true; }
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
      if (!dentro(x + dx, y + dy)) continue; const j = idx(x + dx, y + dy), t = ter[j];
      if ((t === 3 || t === 4) && !(antigas && pontIlha[j] >= ILHAS_ANTIGAS)) return true;
    }
    return false;
  };
  const add = (tipo, x, y, sub) => { const k = natureza.length; const o = { k, tipo, sub, x, y, ilha: ilhaDe[idx(x, y)] }; natureza.push(o); natPorTile.set(idx(x, y), o); return o; };
  const espalhar = (R, filtro) => {
    for (let y = 1; y < MAP_H - 1; y++) for (let x = 1; x < MAP_W - 1; x++) {
      const i = idx(x, y), t = ter[i]; if (t !== 1 && t !== 2) continue;
      if (!filtro(ilhaDe[i])) continue;
      const il = ILHAS[ilhaDe[i]]; const r = R();
      if (perto(x, y)) continue;
      if (t === 2) {
        if (il.cidade && x % 4 === 0 && y % 4 === 1 && Math.hypot(x - il.cx, y - il.cy) < il.r * 0.75) { add('predio', x, y, Math.floor(hash2(x, y, 99) * 6)); continue; }
        if (r < il.arvores) add('arvore', x, y, il.arv[Math.floor(R() * il.arv.length)]);
        else if (r < il.arvores + (il.rochas || 0.02)) add('rocha', x, y, 0);
      } else {
        if (il.palmeiras) { if (r < 0.09) add('palmeira', x, y, 0); else if (r < 0.13) add('concha', x, y, 0); }
        else if (!il.magica && r < 0.02) add('palmeira', x, y, 0);
        else if (r < 0.035) add('rocha', x, y, 0);
      }
    }
  };
  const cristais = (R, il, qt) => {
    let n = 0, tent = 0;
    while (n < qt && tent++ < 5000) {
      const x = Math.round(il.cx + (R() - 0.5) * il.r * 1.7), y = Math.round(il.cy + (R() - 0.5) * il.r * 1.7);
      if (!dentro(x, y)) continue; const i = idx(x, y);
      if (ter[i] !== 2 || ilhaDe[i] !== il.id || natPorTile.has(i) || perto(x, y)) continue;
      add('cristal', x, y, n); n++;
    }
  };
  espalhar(R0, id => id < ILHAS_ANTIGAS);
  cristais(R0, ILHAS[4], 8); // cristais da Ilha Encantada
  // o que ficou em cima das pontes novas some (sem mudar a numeração)
  for (const o of natureza) {
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!dentro(o.x + dx, o.y + dy)) continue; const j = idx(o.x + dx, o.y + dy);
      if ((ter[j] === 3 || ter[j] === 4) && pontIlha[j] >= ILHAS_ANTIGAS && o.tipo !== 'nada') { natPorTile.delete(idx(o.x, o.y)); o.tipo = 'nada'; }
    }
  }
  // 2ª passada: ilhas novas
  antigas = false;
  const R1 = rng(3030);
  espalhar(R1, id => id >= ILHAS_ANTIGAS);
  for (const il of ILHAS) if (il.id >= ILHAS_ANTIGAS && il.cristais) cristais(R1, il, il.cristais);
}
const TOTAL_CRISTAIS = () => natureza.filter(o => o.tipo === 'cristal').length;
function atualizarPontes(fase) {
  for (let i = 0; i < NT; i++) if (pontIlha[i] > 0) ter[i] = fase >= pontIlha[i] ? 3 : 4;
  limparChunks();
}
function andavel(x, y) { return dentro(x, y) && !bloq[idx(x, y)]; }

// ---------- caminho (busca em largura, 8 direções) ----------
const _prev = new Int32Array(NT), _fila = new Int32Array(NT);
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
function acharCaminho(sx, sy, objetivo) {
  if (!dentro(sx, sy)) return null;
  if (objetivo(sx, sy)) return [];
  _prev.fill(-1);
  const s = idx(sx, sy); _prev[s] = s;
  let a = 0, b = 0; _fila[b++] = s;
  while (a < b) {
    const c = _fila[a++], cx = c % MAP_W, cy = (c / MAP_W) | 0;
    for (const [dx, dy] of DIRS) {
      const nx = cx + dx, ny = cy + dy;
      if (!andavel(nx, ny)) continue;
      if (dx && dy && (!andavel(cx + dx, cy) || !andavel(cx, cy + dy))) continue;
      const n = idx(nx, ny); if (_prev[n] !== -1) continue;
      _prev[n] = c;
      if (objetivo(nx, ny)) {
        const res = []; let k = n;
        while (k !== s) { res.push([k % MAP_W, (k / MAP_W) | 0]); k = _prev[k]; }
        return res.reverse();
      }
      _fila[b++] = n;
    }
  }
  return null;
}

// ---------- desenho do chão em pedaços (chunks) ----------
const CH = 8;
const chunks = new Map();
let chunkRes = 2;
function limparChunks() { chunks.clear(); }
function corAreia(il) { return (ILHAS[il] && ILHAS[il].areiaCor) || ['#dcc086', '#f1dea2']; }
function pegarChunk(cx, cy) {
  const key = cx + ',' + cy;
  let c = chunks.get(key);
  if (c) { chunks.delete(key); chunks.set(key, c); return c; }
  c = desenharChunk(cx, cy);
  chunks.set(key, c);
  while (chunks.size > 70) chunks.delete(chunks.keys().next().value);
  return c;
}
function desenharChunk(cx, cy) {
  const T = TILE, px = CH * T;
  const c = document.createElement('canvas');
  c.width = c.height = Math.ceil(px * chunkRes);
  const g = c.getContext('2d');
  g.scale(chunkRes, chunkRes);
  g.translate(-cx * px, -cy * px);
  const x0 = Math.max(0, cx * CH - 1), y0 = Math.max(0, cy * CH - 1), x1 = Math.min(MAP_W - 1, cx * CH + CH), y1 = Math.min(MAP_H - 1, cy * CH + CH);
  g.fillStyle = '#2a7cc2'; g.fillRect(cx * px, cy * px, px, px);
  const raso = ['#5dbde6', '#4aa9dd', '#3b97d3', '#3289cb', '#2d82c6'];
  for (let d = 5; d >= 1; d--) {
    g.fillStyle = raso[d - 1];
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const i = idx(x, y); if (ter[i] === 1 || ter[i] === 2 || distTerra[i] !== d) continue;
      g.beginPath(); g.arc(x * T + T / 2, y * T + T / 2, T * 0.95, 0, Math.PI * 2); g.fill();
    }
  }
  const terra = i => ter[i] === 1 || ter[i] === 2;
  const camada = (r, corFn, filtro) => {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const i = idx(x, y); if (!filtro(i)) continue;
      g.fillStyle = corFn(i);
      g.beginPath(); g.arc(x * T + T / 2, y * T + T / 2, T * r, 0, Math.PI * 2); g.fill();
    }
  };
  camada(0.84, () => '#e6f7f8', terra);
  camada(0.77, i => corAreia(ilhaDe[i])[0], terra);
  camada(0.72, i => corAreia(ilhaDe[i])[1], terra);
  camada(0.72, i => { const il = ILHAS[ilhaDe[i]]; return varGrama[i] ? il.grama2 : il.grama; }, i => ter[i] === 2);
  // detalhes
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const i = idx(x, y), h = hash2(x, y, 5), X = x * T, Y = y * T;
    if (ter[i] === 2) {
      const il = ILHAS[ilhaDe[i]];
      if (h < 0.35) {
        g.strokeStyle = escurecer(il.grama, -0.18); g.lineWidth = 1.6; g.lineCap = 'round';
        const ox = X + 8 + hash2(x, y, 6) * 22, oy = Y + 10 + hash2(x, y, 7) * 22;
        g.beginPath(); g.moveTo(ox, oy); g.lineTo(ox - 2, oy - 5); g.moveTo(ox + 2, oy); g.lineTo(ox + 3, oy - 6); g.moveTo(ox + 4, oy); g.lineTo(ox + 7, oy - 4); g.stroke();
      } else if (h < (il.muitasFlores ? 0.58 : 0.43)) {
        const cs = il.flores || (il.magica ? ['#ffffff', '#ffe36a', '#7fe3ff'] : ['#ffffff', '#ffe36a', '#ff8fb8', '#c9a7ff']);
        const cor = cs[Math.floor(hash2(x, y, 8) * cs.length)];
        for (let k = 0; k < 3; k++) { const fx = X + 8 + hash2(x, y, 10 + k) * 24, fy = Y + 8 + hash2(x, y, 20 + k) * 24; circ(g, fx, fy, 2.2, cor); circ(g, fx, fy, 0.9, '#f5a623'); }
      } else if (h < 0.47 && il.magica) {
        g.fillStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.arc(X + 20, Y + 20, 1.5, 0, Math.PI * 2); g.fill();
      }
    } else if (ter[i] === 1 && h < 0.3) {
      g.fillStyle = 'rgba(160,120,60,.35)';
      for (let k = 0; k < 4; k++) { g.beginPath(); g.arc(X + 6 + hash2(x, y, 30 + k) * 28, Y + 6 + hash2(x, y, 40 + k) * 28, 1, 0, Math.PI * 2); g.fill(); }
    }
  }
  // pontes
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const i = idx(x, y); if (ter[i] !== 3 && ter[i] !== 4) continue;
    const X = x * T, Y = y * T, quebrada = ter[i] === 4, vert = pontDir[i] === 1;
    g.save();
    if (vert) { g.translate(X + T / 2, Y + T / 2); g.rotate(Math.PI / 2); g.translate(-X - T / 2, -Y - T / 2); }
    g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(X, Y + 4, T, T - 2);
    for (let k = 0; k < 4; k++) {
      if (quebrada && hash2(x, y, k) < 0.55) continue;
      const px = X + k * (T / 4) + 1;
      g.fillStyle = k % 2 ? '#b07a45' : '#c18a52';
      rrect(g, px, Y + 1, T / 4 - 2, T - 2, 2); g.fill();
      g.fillStyle = 'rgba(80,45,20,.4)'; g.fillRect(px + 2, Y + 5, 1.2, 1.2); g.fillRect(px + 2, Y + T - 7, 1.2, 1.2);
    }
    const lado = (yy, viz) => { if (viz) return; g.fillStyle = '#7a4e2c'; g.fillRect(X, yy, T, 3); for (const px of [X + 2, X + T / 2]) { g.fillStyle = '#6b4022'; rrect(g, px, yy - 3, 4, 8, 1.5); g.fill(); } };
    const pv = (dx, dy) => { const xx = vert ? x - dy : x, yy = vert ? y : y + dy; if (!dentro(xx, yy)) return false; const t2 = ter[idx(xx, yy)]; return t2 === 3 || t2 === 4; };
    if (!quebrada || hash2(x, y, 9) < 0.5) { lado(Y, pv(0, -1)); }
    if (!quebrada || hash2(x, y, 11) < 0.5) { lado(Y + T - 3, pv(0, 1)); }
    g.restore();
  }
  return c;
}
