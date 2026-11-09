// ===== Ilhas da Luiza — o jogo =====
'use strict';
const SAVE = 'ilhas-da-luiza-v1';
const T = TILE;
const $ = id => document.getElementById(id);
let S = null;
const tela = $('tela'), g = tela.getContext('2d');
let LW = 0, LH = 0, DPR = 1, zoom = 1;
const cam = { x: 0, y: 0, ox: 0, oy: 0 };
let tempo = 0, jogando = false, hudSujo = true, acumSeg = 0, acumSalvar = 0;
const P = { x: 0, y: 0, caminho: [], acao: null, dir: 1, andando: false, rastro: [] };
let selvagens = [], particulas = [], modoC = null, marca = null;
const mapaConstru = new Map();
let promptInstalar = null;

// ---------- utilidades ----------
function h(tag, props, ...kids) {
  const e = document.createElement(tag);
  if (props) for (const k in props) {
    const v = props[k];
    if (k === 'class') e.className = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else if (k === 'style') e.style.cssText = v;
    else if (v === true) e.setAttribute(k, '');
    else if (v !== false && v != null) e.setAttribute(k, v);
  }
  for (const c of kids.flat()) if (c != null && c !== false) e.append(c.nodeType ? c : fx(String(c)));
  return e;
}
function sorteia(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function diaHoje() { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
function mmss(ms) { const s = Math.max(0, Math.ceil(ms / 1000)); return s >= 60 ? Math.floor(s / 60) + 'min ' + (s % 60) + 's' : s + 's'; }
function tileDe(px) { return Math.floor(px / T); }
function inv(k) { return S.inv[k] || 0; }
function addInv(k, n) { S.inv[k] = (S.inv[k] || 0) + n; if (S.inv[k] <= 0) delete S.inv[k]; hudSujo = true; }
function somar(k, n, sub) {
  if (sub) { S.st[k] = S.st[k] || {}; S.st[k][sub] = (S.st[k][sub] || 0) + n; }
  else S.st[k] = (S.st[k] || 0) + n;
}
function ganhar(n, x, y) { S.moedas += n; hudSujo = true; if (x != null) flutuar(x, y, '+' + n + ' 🪙', '#c98a00'); som('moeda'); }
function ganharXP(n) {
  S.xp += n; hudSujo = true;
  while (S.xp >= xpProximo(S.nivel)) { S.xp -= xpProximo(S.nivel); S.nivel++; subiuNivel(S.nivel); }
}
function pode(c) {
  if (!c) return true;
  if ((c.moedas || 0) > S.moedas) return false;
  for (const k of ['madeira', 'pedra', 'cristal']) if ((c[k] || 0) > inv(k)) return false;
  return true;
}
function pagar(c) { S.moedas -= c.moedas || 0; for (const k of ['madeira', 'pedra', 'cristal']) if (c[k]) addInv(k, -c[k]); hudSujo = true; }
function custoNos(c) {
  const out = [];
  if (c.moedas) out.push(h('span', { class: S.moedas < c.moedas ? 'falta' : '' }, '🪙 ' + c.moedas));
  for (const k of ['madeira', 'pedra', 'cristal']) if (c[k]) out.push(h('span', { class: inv(k) < c[k] ? 'falta' : '' }, ITENS[k].e + ' ' + c[k]));
  return h('div', { class: 'custo' }, out);
}

// ---------- som ----------
let AC = null;
function nota(f, ini, dur, tipo, vol) {
  const t0 = AC.currentTime + ini;
  const o = AC.createOscillator(), v = AC.createGain();
  o.type = tipo || 'sine'; o.frequency.setValueAtTime(f, t0);
  v.gain.setValueAtTime(0.0001, t0); v.gain.linearRampToValueAtTime(vol || 0.12, t0 + 0.012); v.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(v); v.connect(AC.destination); o.start(t0); o.stop(t0 + dur + 0.05);
}
function som(tipo) {
  if (!S || !S.som) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    if (AC.state === 'suspended') AC.resume();
    switch (tipo) {
      case 'moeda': nota(988, 0, 0.08, 'square', 0.04); nota(1319, 0.07, 0.2, 'square', 0.04); break;
      case 'pop': nota(620, 0, 0.09, 'sine', 0.14); nota(930, 0.05, 0.1, 'sine', 0.1); break;
      case 'colher': nota(523, 0, 0.1, 'triangle', 0.14); nota(659, 0.07, 0.1, 'triangle', 0.14); nota(784, 0.14, 0.18, 'triangle', 0.14); break;
      case 'nivel': [523, 659, 784, 1047, 1319].forEach((f, i) => nota(f, i * 0.09, 0.3, 'triangle', 0.13)); break;
      case 'erro': nota(260, 0, 0.15, 'triangle', 0.14); nota(200, 0.12, 0.22, 'triangle', 0.14); break;
      case 'toc': nota(190, 0, 0.07, 'triangle', 0.25); nota(140, 0.06, 0.08, 'triangle', 0.18); break;
      case 'pedra': nota(330, 0, 0.05, 'square', 0.06); nota(250, 0.05, 0.07, 'square', 0.05); break;
      case 'agua': nota(700, 0, 0.12, 'sine', 0.12); nota(500, 0.08, 0.15, 'sine', 0.1); break;
      case 'bebe': [784, 988, 1175, 1568, 1175, 1568].forEach((f, i) => nota(f, i * 0.11, 0.25, 'sine', 0.12)); break;
      case 'amor': nota(880, 0, 0.12, 'sine', 0.1); nota(1175, 0.1, 0.2, 'sine', 0.1); break;
      case 'construir': nota(392, 0, 0.08, 'square', 0.05); nota(523, 0.08, 0.08, 'square', 0.05); nota(784, 0.16, 0.2, 'square', 0.05); break;
    }
  } catch (e) { /* sem som */ }
}
function vibrar(ms) { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) { } }

// ---------- estado ----------
function novoEstado(look, nome) {
  const c = ILHAS[0];
  return {
    v: 1, nome, look, moedas: 200, xp: 0, nivel: 1,
    inv: { s_cenoura: 6, s_alface: 2, racao: 4 },
    constru: [], animais: [], nat: {}, cristais: {}, fase: 0, st: {}, trofeus: [], album: [],
    acc: ['nada', 'laco', 'oculos'], px: c.cx * T + T / 2, py: (c.cy + 2) * T + T / 2, prox: 1,
    diaPresente: '', desafio: null, montado: null, companheiro: null, amor: {}, som: true, bau: null,
    selv: {}, intro: false, mfeitas: {}, hora: 60,
  };
}
function carregar() {
  try {
    const s = JSON.parse(localStorage.getItem(SAVE));
    if (s && s.v === 1) { const base = novoEstado(s.look, s.nome); for (const k in base) if (!(k in s)) s[k] = base[k]; return s; }
  } catch (e) { }
  return null;
}
function salvar() {
  if (!S) return;
  S.px = P.x; S.py = P.y;
  try { localStorage.setItem(SAVE, JSON.stringify(S)); } catch (e) { }
}

// ---------- natureza ----------
function presente(o) {
  if (o.tipo === 'cristal') return !S.cristais[o.k];
  return !(S.nat[o.k] > Date.now());
}
function construPorId(id) { for (const b of S.constru) if (b.id === id) return b; return null; }
function recalcularBloqueio() {
  for (let i = 0; i < NT; i++) bloq[i] = (ter[i] === 1 || ter[i] === 2 || ter[i] === 3) ? 0 : 1;
  mapaConstru.clear();
  for (const b of S.constru) {
    const d = CONSTRU[b.tipo];
    for (let y = b.y; y < b.y + d.h; y++) for (let x = b.x; x < b.x + d.w; x++) { const i = idx(x, y); mapaConstru.set(i, b); if (!d.chao) bloq[i] = 1; }
  }
  for (const o of natureza) {
    if (o.tipo === 'palmeira') bloq[idx(o.x, o.y)] = 1;
    else if ((o.tipo === 'arvore' || o.tipo === 'rocha') && presente(o)) bloq[idx(o.x, o.y)] = 1;
    else if (o.tipo === 'predio') bloq[idx(o.x, o.y)] = 1;
  }
  for (const id in NPCS) { const p = npcPos(id); bloq[idx(p.x, p.y)] = 1; }
  for (const b of S.constru) if (b.tipo === 'cerca') {
    b.vizinhos = {};
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const o = mapaConstru.get(idx(b.x + dx, b.y + dy)); if (o && o.tipo === 'cerca') b.vizinhos[dx + ',' + dy] = 1; }
  }
}
function soltarJogador() {
  const tx = tileDe(P.x), ty = tileDe(P.y);
  if (andavel(tx, ty)) return;
  const c = acharCaminho(tx, ty, (x, y) => andavel(x, y));
  if (c && c.length) { const [x, y] = c[c.length - 1]; P.x = x * T + T / 2; P.y = y * T + T / 2; }
}

// ---------- animais ----------
function nomeAnimal() {
  const usados = new Set(S.animais.map(a => a.nome));
  const livres = NOMES_BICHOS.filter(n => !usados.has(n));
  return sorteia(livres.length ? livres : NOMES_BICHOS) + (livres.length ? '' : ' ' + (S.prox % 100));
}
function vagasCasa(b) { const d = CONSTRU[b.tipo]; let n = 0; for (const a of S.animais) if (a.casa === b.id) n++; return d.vagas - n; }
function casaLivre(sp) {
  for (const b of S.constru) { const d = CONSTRU[b.tipo]; if (d.abriga && d.abriga.includes(sp) && vagasCasa(b) > 0) return b; }
  return null;
}
function tipoCasa(sp) { return CONSTRU[ESPECIES[sp].casa]; }
function pontoCasa(b) {
  const d = CONSTRU[b.tipo];
  if (b.tipo === 'lago') return { x: (b.x + 1) * T, y: (b.y + 1) * T };
  return { x: (b.x + d.w / 2) * T, y: (b.y + d.h + 0.6) * T };
}
function novoAnimal(sp, casa, o) {
  o = o || {};
  const esp = ESPECIES[sp];
  const p = pontoCasa(casa);
  const a = {
    id: S.prox++, sp, nome: o.nome || nomeAnimal(), v: o.v != null ? o.v : Math.floor(Math.random() * esp.v.length),
    casa: casa.id, x: o.x != null ? o.x : p.x, y: o.y != null ? o.y : p.y, nasc: Date.now(), bebe: !!o.bebe, comeu: 0, prodEm: 0,
  };
  S.animais.push(a);
  if (!S.album.includes(sp)) { S.album.push(sp); if (!o.semAviso) toast('📖 Novo no álbum: ' + esp.nome + '!'); }
  return a;
}
function feliz(a) { return Date.now() - a.comeu < 300000; }
function prodPronto(a) { return a.prodEm && Date.now() >= a.prodEm && !a.bebe; }
function emojiAnimal(a) { const v = ESPECIES[a.sp].v; return v[a.v % v.length]; }
function voltarParaCasa(a) {
  const b = construPorId(a.casa); if (!b) return;
  const p = pontoCasa(b); a.x = p.x; a.y = p.y; a.tx = null;
}
function escolherDestino(a, cx, cy, raio, ilha, voa) {
  for (let k = 0; k < 8; k++) {
    const x = Math.round(cx + (Math.random() * 2 - 1) * raio), y = Math.round(cy + (Math.random() * 2 - 1) * raio);
    if (!dentro(x, y)) continue;
    const i = idx(x, y);
    if (voa ? (ter[i] === 1 || ter[i] === 2) : !bloq[i]) { if (ilha != null && ilhaDe[i] !== ilha) continue; a.tx = x * T + T / 2 + (Math.random() - 0.5) * 16; a.ty = y * T + T / 2 + (Math.random() - 0.5) * 12; return; }
  }
}
function andarAte(a, vel, dt) {
  const dx = a.tx - a.x, dy = a.ty - a.y, d = Math.hypot(dx, dy), v = vel * dt;
  if (Math.abs(dx) > 0.5) a.dir = dx > 0 ? 1 : -1;
  if (d <= v) { a.x = a.tx; a.y = a.ty; a.tx = null; a.mov = false; return true; }
  a.x += dx / d * v; a.y += dy / d * v; a.mov = true; return false;
}
function atualizarAnimal(a, dt, selvagem) {
  if (!selvagem && S.montado === a.id) { a.x = P.x; a.y = P.y; a.dir = P.dir; a.mov = P.andando; return; }
  const esp = ESPECIES[a.sp];
  if (!selvagem && S.companheiro === a.id) {
    const r = P.rastro; const alvo = r.length > 8 ? r[r.length - 9] : null;
    if (alvo) {
      const d = Math.hypot(alvo.x - a.x, alvo.y - a.y);
      if (d > T * 7) { a.x = alvo.x; a.y = alvo.y; }
      else if (d > 6) { a.tx = alvo.x; a.ty = alvo.y; andarAte(a, Math.max(T * 2, d * 3.2), dt); return; }
    }
    a.mov = false; return;
  }
  if (a.parado && tempo < a.parado) { a.mov = false; return; }
  if (a.tx == null) {
    a.espera = (a.espera || 0) - dt; a.mov = false;
    if (a.espera <= 0) {
      a.espera = 1.5 + Math.random() * 3.5;
      if (selvagem) escolherDestino(a, a.hx, a.hy, 3, a.ilha, esp.voa);
      else {
        const b = construPorId(a.casa); if (!b) return;
        const d = CONSTRU[b.tipo];
        if (esp.nada) {
          const ang = Math.random() * Math.PI * 2, r = Math.random();
          a.tx = (b.x + 1) * T + Math.cos(ang) * r * (T * 0.55); a.ty = (b.y + 1) * T + Math.sin(ang) * r * (T * 0.45);
        } else escolherDestino(a, b.x + (d.w - 1) / 2, b.y + d.h + 0.5, 2.6, ilhaDe[idx(b.x, b.y)], esp.voa);
      }
    }
    return;
  }
  const vel = (esp.nada ? 0.8 : esp.voa ? 1.6 : 1.0) * T * (a.bebe ? 1.15 : 1);
  andarAte(a, vel, dt);
}

// ---------- animais selvagens ----------
function criarSelvagem(k, sp, j) {
  const key = k + '-' + sp + '-' + j;
  const il = ILHAS[k];
  for (let t = 0; t < 200; t++) {
    const x = Math.round(il.cx + (Math.random() * 2 - 1) * il.r * 0.8), y = Math.round(il.cy + (Math.random() * 2 - 1) * il.r * 0.8);
    if (!dentro(x, y)) continue; const i = idx(x, y);
    if (ter[i] !== 2 || ilhaDe[i] !== k || bloq[i]) continue;
    selvagens.push({ key, sp, v: Math.floor(Math.random() * ESPECIES[sp].v.length), x: x * T + T / 2, y: y * T + T / 2, hx: x, hy: y, ilha: k, dir: 1, id: -1 });
    return;
  }
}
function conferirSelvagens() {
  const agora = Date.now(), existe = new Set(selvagens.map(s => s.key));
  for (const k in SELVAGENS) for (const [sp, n] of SELVAGENS[k]) for (let j = 0; j < n; j++) {
    const key = k + '-' + sp + '-' + j;
    if (existe.has(key)) continue;
    if (S.selv[key] && agora < S.selv[key]) continue;
    criarSelvagem(+k, sp, j);
  }
}

// ---------- movimento do jogador ----------
function irPara(fn, acao) {
  const px = tileDe(P.x), py = tileDe(P.y);
  if (fn(px, py)) { P.caminho = []; P.acao = null; if (acao) acao(); return true; }
  const c = acharCaminho(px, py, fn);
  if (!c) { toast('Não dá para chegar lá 🙈'); som('erro'); return false; }
  P.caminho = c; P.acao = acao; return true;
}
function pertoDe(x0, y0, w, h) {
  return (x, y) => {
    const dx = Math.max(x0 - x, 0, x - (x0 + w - 1)), dy = Math.max(y0 - y, 0, y - (y0 + h - 1));
    return Math.max(dx, dy) <= 1;
  };
}
function moverJogador(dt) {
  if (!P.caminho.length) { P.andando = false; return; }
  const [tx, ty] = P.caminho[0];
  const gx = tx * T + T / 2, gy = ty * T + T / 2;
  const v = (S.montado ? 5.6 : 3.5) * T * dt;
  const dx = gx - P.x, dy = gy - P.y, d = Math.hypot(dx, dy);
  if (Math.abs(dx) > 0.5) P.dir = dx > 0 ? 1 : -1;
  P.andando = true;
  if (d <= v) {
    P.x = gx; P.y = gy; P.caminho.shift();
    if (!P.caminho.length) { P.andando = false; const ac = P.acao; P.acao = null; if (ac) ac(); }
  } else { P.x += dx / d * v; P.y += dy / d * v; }
  const u = P.rastro[P.rastro.length - 1];
  if (!u || Math.hypot(u.x - P.x, u.y - P.y) > 6) { P.rastro.push({ x: P.x, y: P.y }); if (P.rastro.length > 40) P.rastro.shift(); }
  cam.ox *= 0.92; cam.oy *= 0.92;
}

// ---------- partículas ----------
function flutuar(x, y, txt, cor) { particulas.push({ x, y: y - 30, txt: fx(txt), cor: cor || '#3b2a4a', vida: 1.5, max: 1.5, vy: -28 }); }
function coracoes(x, y, n, e) { for (let i = 0; i < (n || 3); i++) particulas.push({ x: x + (Math.random() - 0.5) * 24, y: y - 20, e: e || '❤️', vida: 1 + Math.random() * 0.6, max: 1.6, vy: -30 - Math.random() * 25, vx: (Math.random() - 0.5) * 24 }); }
function folhas(x, y, e) { for (let i = 0; i < 5; i++) particulas.push({ x: x + (Math.random() - 0.5) * 30, y: y - 30 - Math.random() * 20, e: e || '🍃', vida: 0.9 + Math.random() * 0.4, max: 1.3, vy: 20 + Math.random() * 30, vx: (Math.random() - 0.5) * 50, tam: 12 }); }

// ---------- avisos e festas ----------
function toast(txt) {
  const box = $('toasts');
  const el = h('div', { class: 'toast' }, fx(txt));
  box.append(el);
  while (box.children.length > 3) box.firstChild.remove();
  setTimeout(() => el.remove(), 2900);
}
const filaFesta = []; let festaAberta = false;
function festa(o) { filaFesta.push(o); if (!festaAberta) proximaFesta(); }
function proximaFesta() {
  const o = filaFesta.shift();
  if (!o) { festaAberta = false; $('festa').hidden = true; return; }
  festaAberta = true;
  $('festaIc').textContent = fx(o.ic); $('festaTit').textContent = fx(o.tit); $('festaTxt').textContent = fx(o.txt || '');
  const ex = $('festaExtra'); ex.innerHTML = ''; if (o.extra) ex.append(o.extra);
  const ok = $('festaOk'); ok.textContent = fx(o.ok || 'Oba! 🎉');
  ok.onclick = () => { if (o.onOk) o.onOk(); proximaFesta(); };
  $('festa').hidden = false;
  if (o.confete !== false) confete();
  som(o.som || 'nivel');
}
let confetes = [], confeteRodando = false;
function confete() {
  const c = $('confete'); c.width = innerWidth * DPR; c.height = innerHeight * DPR;
  const cores = ['#ff6fa5', '#ffcf3f', '#4fd18b', '#4fb3ff', '#b77cff', '#ff8a4c'];
  for (let i = 0; i < 120; i++) confetes.push({ x: Math.random() * c.width, y: -Math.random() * c.height * 0.5, vx: (Math.random() - 0.5) * 3 * DPR, vy: (2 + Math.random() * 3) * DPR, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3, cor: sorteia(cores), s: (5 + Math.random() * 5) * DPR });
  if (!confeteRodando) { confeteRodando = true; requestAnimationFrame(passoConfete); }
}
function passoConfete() {
  const c = $('confete'), cg = c.getContext('2d');
  cg.clearRect(0, 0, c.width, c.height);
  for (const p of confetes) { p.x += p.vx; p.y += p.vy; p.r += p.vr; cg.save(); cg.translate(p.x, p.y); cg.rotate(p.r); cg.fillStyle = p.cor; cg.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); cg.restore(); }
  confetes = confetes.filter(p => p.y < c.height + 20);
  if (confetes.length) requestAnimationFrame(passoConfete); else { confeteRodando = false; cg.clearRect(0, 0, c.width, c.height); }
}

// ---------- painel ----------
let painelAtual = null;
function abrirPainel(titulo, abas, render, abaIni) {
  pararPesca();
  $('pTitulo').textContent = titulo;
  painelAtual = { render, abas: abas || [], aba: abaIni || (abas && abas.length ? abas[0][0] : null) };
  const pa = $('pAbas'); pa.innerHTML = ''; pa.hidden = !painelAtual.abas.length;
  for (const [k, l] of painelAtual.abas) pa.append(h('button', { class: 'aba', 'data-k': k, onclick: () => { painelAtual.aba = k; $('pCorpo').scrollTop = 0; redesenharPainel(); } }, l));
  $('painel').hidden = false; $('fundo').hidden = false;
  $('pCorpo').scrollTop = 0;
  redesenharPainel();
}
function redesenharPainel() {
  if (!painelAtual) return;
  for (const b of $('pAbas').children) b.classList.toggle('on', b.dataset.k === painelAtual.aba);
  const c = $('pCorpo'), sc = c.scrollTop; c.innerHTML = '';
  painelAtual.render(c, painelAtual.aba);
  c.scrollTop = sc;
}
function fecharPainel() { pararPesca(); $('painel').hidden = true; $('fundo').hidden = true; painelAtual = null; }
function linha(ic, titulo, sub, botoes, cls) {
  return h('div', { class: 'linha ' + (cls || '') }, h('div', { class: 'ic' }, ic), h('div', { class: 'tx' }, h('b', null, titulo), sub ? h('small', null, sub) : null), botoes ? h('div', { class: 'bts' }, botoes) : null);
}
function botao(txt, fn, cls, desab) { return h('button', { class: 'btn ' + (cls || ''), onclick: fn, disabled: !!desab }, txt); }

// ---------- nível ----------
function subiuNivel(n) {
  const novidades = [];
  for (const k in CONSTRU) if (CONSTRU[k].nivel === n) novidades.push(CONSTRU[k].ic + ' ' + CONSTRU[k].nome);
  for (const k in ESPECIES) if (ESPECIES[k].nivel === n) novidades.push(ESPECIES[k].v[0][0] + ' ' + ESPECIES[k].nome);
  for (const k in PLANTAS) if (PLANTAS[k].nivel === n) novidades.push(PLANTAS[k].e + ' ' + PLANTAS[k].nome);
  for (const k in ACESSORIOS) if (ACESSORIOS[k].nivel === n) novidades.push(ACESSORIOS[k].ic + ' ' + ACESSORIOS[k].nome);
  const premio = 20 * n;
  S.moedas += premio; hudSujo = true;
  festa({
    ic: '⭐', tit: 'Nível ' + n + '!', txt: 'Você ganhou ' + premio + ' moedas de prêmio!',
    extra: novidades.length ? h('div', { class: 'novidades' }, h('b', null, 'Novidades liberadas:'), h('div', null, novidades.map(t => h('span', { class: 'chip' }, t)))) : null,
  });
}

// ---------- construir ----------
function podeColocar(tipo, x, y, ignorar) {
  const d = CONSTRU[tipo];
  for (let yy = y; yy < y + d.h; yy++) for (let xx = x; xx < x + d.w; xx++) {
    if (!dentro(xx, yy)) return 'Fora do mapa';
    const i = idx(xx, yy);
    if (ter[i] !== 1 && ter[i] !== 2) return 'Precisa ser em terra firme';
    if (ilhaDe[i] > S.fase) return 'Essa ilha ainda está fechada';
    const b = mapaConstru.get(i); if (b && b !== ignorar) return 'Já tem uma construção aqui';
    const o = natPorTile.get(i);
    if (o && (o.tipo === 'palmeira' || o.tipo === 'cristal' && presente(o))) return 'Tem algo no caminho';
    if (o && (o.tipo === 'arvore' || o.tipo === 'rocha') && presente(o)) return o.tipo === 'arvore' ? 'Tem uma árvore aqui. Corte ela primeiro!' : 'Tem uma pedra aqui. Quebre ela primeiro!';
    for (const id in NPCS) { const p = npcPos(id); if (p.x === xx && p.y === yy) return 'Aqui fica um amigo'; }
  }
  return null;
}
function entrarModoConstruir(tipo, mover) {
  fecharPainel();
  const d = CONSTRU[tipo];
  let x = tileDe(P.x) + 1, y = tileDe(P.y) - d.h + 1;
  if (mover) { x = mover.x; y = mover.y; }
  modoC = { tipo, x, y, mover };
  cam.ox = 0; cam.oy = 0;
  $('barra').hidden = true; $('modoConstruir').hidden = false; $('dica').hidden = true;
  atualizarModoC();
}
function atualizarModoC() {
  if (!modoC) return;
  const d = CONSTRU[modoC.tipo];
  const erro = podeColocar(modoC.tipo, modoC.x, modoC.y, modoC.mover);
  modoC.erro = erro;
  $('mcTxt').textContent = erro ? '⚠️ ' + erro : (modoC.mover ? 'Toque no chão para escolher o novo lugar.' : d.ic + ' ' + d.nome + ': toque no chão para escolher o lugar.');
  $('mcOk').disabled = !!erro;
}
function sairModoConstruir() { modoC = null; $('barra').hidden = false; $('modoConstruir').hidden = true; $('dica').hidden = false; }
function confirmarConstrucao() {
  if (!modoC || modoC.erro) { som('erro'); return; }
  const d = CONSTRU[modoC.tipo];
  for (let yy = modoC.y; yy < modoC.y + d.h; yy++) for (let xx = modoC.x; xx < modoC.x + d.w; xx++) {
    const o = natPorTile.get(idx(xx, yy)); if (o && !presente(o)) S.nat[o.k] = 9e15;
  }
  if (modoC.mover) {
    const b = modoC.mover; b.x = modoC.x; b.y = modoC.y;
    recalcularBloqueio(); soltarJogador();
    for (const a of S.animais) if (a.casa === b.id && S.montado !== a.id && S.companheiro !== a.id) voltarParaCasa(a);
    som('construir'); sairModoConstruir(); salvar(); return;
  }
  if (!pode(d.custo)) { toast('Faltam materiais ou moedas'); som('erro'); return; }
  pagar(d.custo);
  const b = { id: S.prox++, tipo: modoC.tipo, x: modoC.x, y: modoC.y, cor: Math.floor(Math.random() * 6) };
  if (d.fruta) b.frutaEm = Date.now() + d.tempo * 1000;
  S.constru.push(b);
  somar('construiu', 1);
  ganharXP(3 + Math.floor((d.custo.moedas || 0) / 20));
  recalcularBloqueio(); soltarJogador();
  som('construir');
  folhas((b.x + d.w / 2) * T, (b.y + d.h) * T, '✨');
  if (d.abriga) toast(d.ic + ' ' + d.nome + ' pronta! Agora já pode ter ' + d.abriga.map(s => ESPECIES[s].nome.toLowerCase()).join(', ') + '.');
  else if (d.casa) toast('🏠 Que casa linda!');
  if (d.repete && pode(d.custo)) { modoC.x += 1; atualizarModoC(); } else sairModoConstruir();
  salvar();
}
function guardarConstru(b) {
  const d = CONSTRU[b.tipo];
  if (S.animais.some(a => a.casa === b.id)) { toast('Tem bichinhos morando aí! Leve eles para outra casa antes.'); som('erro'); return; }
  S.constru = S.constru.filter(o => o !== b);
  const c = d.custo;
  S.moedas += Math.floor((c.moedas || 0) / 2);
  for (const k of ['madeira', 'pedra', 'cristal']) if (c[k]) addInv(k, Math.floor(c[k] / 2));
  recalcularBloqueio(); hudSujo = true; fecharPainel(); salvar();
  toast('📦 Guardado! Você recebeu metade de volta.');
}

// ---------- toque no mapa ----------
function telaParaMundo(sx, sy) { return { x: cam.x + (sx - LW / 2) / zoom, y: cam.y + (sy - LH / 2) / zoom }; }
function tocar(sx, sy) {
  const w = telaParaMundo(sx, sy), wx = w.x, wy = w.y;
  const tx = tileDe(wx), ty = tileDe(wy);
  if (modoC) {
    const d = CONSTRU[modoC.tipo];
    modoC.x = tx - Math.floor((d.w - 1) / 2); modoC.y = ty - Math.floor((d.h - 1) / 2);
    atualizarModoC(); return;
  }
  // animais
  let alvo = null;
  for (const a of S.animais.concat(selvagens)) {
    if (a.id === S.montado) continue;
    const tam = ESPECIES[a.sp].tam * (a.bebe ? 0.6 : 1);
    if (Math.abs(wx - a.x) < Math.max(18, tam * 0.6) && wy > a.y - tam * 1.15 - 6 && wy < a.y + 10) { if (!alvo || a.y > alvo.y) alvo = a; }
  }
  if (alvo) { if (alvo.key) tocarSelvagem(alvo); else tocarAnimal(alvo); return; }
  // objetos com altura (escolhe o da frente)
  let melhor = null, my = -1;
  const cand = (y, fn) => { if (y > my) { my = y; melhor = fn; } };
  for (const id in NPCS) {
    const p = npcPos(id), X = p.x * T + T / 2, Y = p.y * T + T * 0.8;
    if (Math.abs(wx - X) < 18 && wy > Y - 64 && wy < Y + 8) cand(Y, () => tocarNpc(id));
  }
  if (S.bau && !S.bau.pego && S.bau.dia === diaHoje()) {
    const X = S.bau.x * T + T / 2, Y = S.bau.y * T + T * 0.8;
    if (Math.abs(wx - X) < 20 && wy > Y - 34 && wy < Y + 8) cand(Y, () => irPara(pertoDe(S.bau.x, S.bau.y, 1, 1), abrirBau));
  }
  for (let yy = ty; yy <= ty + 2; yy++) for (let xx = tx - 1; xx <= tx + 1; xx++) {
    if (!dentro(xx, yy)) continue;
    const o = natPorTile.get(idx(xx, yy)); if (!o || o.tipo === 'predio') continue;
    const X = o.x * T + T / 2, Yb = o.y * T + T;
    const alto = (o.tipo === 'arvore' && presente(o)) || o.tipo === 'palmeira' ? 68 : 34;
    if ((o.tipo === 'rocha' || o.tipo === 'concha' || o.tipo === 'cristal') && !presente(o)) continue;
    if (o.tipo === 'arvore' && S.nat[o.k] > 9e14) continue;
    if (Math.abs(wx - X) < 20 && wy > Yb - alto && wy < Yb) cand(Yb, () => tocarNatureza(o));
  }
  for (const b of S.constru) {
    const d = CONSTRU[b.tipo], X = b.x * T, Y = b.y * T, W = d.w * T, H = d.h * T;
    const topo = d.chao && b.tipo !== 'arcoiris' ? Y : Y - Math.max(30, H * 0.45);
    if (wx >= X && wx <= X + W && wy >= topo && wy <= Y + H) cand(Y + H - (d.chao ? T : 0), () => tocarConstru(b));
  }
  for (const k in placas) {
    if (S.fase >= +k) continue;
    const p = placas[k], X = p.x * T + T / 2, Y = p.y * T + T * 0.8;
    if (Math.abs(wx - X) < 18 && wy > Y - 40 && wy < Y + 6) cand(Y, () => avisoPonte(+k));
  }
  if (melhor) { melhor(); return; }
  if (!dentro(tx, ty)) return;
  const i = idx(tx, ty);
  if (ter[i] === 4) { avisoPonte(pontIlha[i]); return; }
  if (ter[i] === 0) {
    if (distTerra[i] > 2) { toast('Chegue mais perto da margem para pescar 🎣'); return; }
    if (S.fase < 2 && !S.st.pescou) { /* pode pescar desde o começo */ }
    const ilha = ilhaDe[i] >= 0 ? ilhaDe[i] : 0;
    irPara((x, y) => Math.max(Math.abs(x - tx), Math.abs(y - ty)) <= 2 && (ter[idx(x, y)] === 1 || ter[idx(x, y)] === 2 || ter[idx(x, y)] === 3), () => { P.dir = tx * T + T / 2 > P.x ? 1 : -1; abrirPesca(ilha); });
    marca = { x: tx * T + T / 2, y: ty * T + T / 2, t: tempo };
    return;
  }
  if (bloq[i]) return;
  if (irPara((x, y) => x === tx && y === ty)) marca = { x: tx * T + T / 2, y: ty * T + T / 2, t: tempo };
}
function avisoPonte(k) {
  const il = ILHAS[k];
  const prox = S.fase + 1;
  const txt = k === prox ? 'Complete as missões de ' + NPCS[FASES[S.fase].npc].nome + ' para consertar esta ponte!' : 'Primeiro conserte a ponte para a ' + ILHAS[prox].nome + '.';
  abrirPainel('🚧 Ponte para a ' + il.nome, null, c => {
    c.append(h('p', { class: 'fala' }, txt), botao('📜 Ver missões', () => abrirMissoes(), 'azul'));
  });
}

// ---------- natureza: ações ----------
function tocarNatureza(o) {
  if (o.tipo === 'arvore' && !presente(o)) { toast('🌱 A árvore está crescendo de novo... falta ' + mmss(S.nat[o.k] - Date.now())); return; }
  irPara(pertoDe(o.x, o.y, 1, 1), () => acaoNatureza(o));
}
function acaoNatureza(o) {
  const X = o.x * T + T / 2, Y = o.y * T + T / 2;
  P.dir = X > P.x ? 1 : -1;
  const agora = Date.now();
  if (o.tipo === 'arvore') {
    if (!presente(o)) return;
    const n = 1 + (Math.random() < 0.5 ? 1 : 0);
    addInv('madeira', n); somar('madeira', n); ganharXP(2);
    S.nat[o.k] = agora + 150000; o.treme = tempo;
    folhas(X, Y); flutuar(X, Y, '+' + n + ' 🪵'); som('toc');
    recalcularBloqueio();
  } else if (o.tipo === 'rocha') {
    if (!presente(o)) return;
    const n = 1 + (Math.random() < 0.5 ? 1 : 0);
    addInv('pedra', n); somar('pedra', n); ganharXP(2);
    S.nat[o.k] = agora + 200000;
    folhas(X, Y, '💨'); flutuar(X, Y, '+' + n + ' 🪨'); som('pedra');
    recalcularBloqueio();
  } else if (o.tipo === 'palmeira') {
    if (!presente(o)) { toast('🥥 Os cocos ainda estão crescendo... falta ' + mmss(S.nat[o.k] - agora)); return; }
    const n = 1 + (Math.random() < 0.4 ? 1 : 0);
    addInv('coco', n); somar('coco', n); ganharXP(3);
    S.nat[o.k] = agora + 90000; o.treme = tempo;
    flutuar(X, Y, '+' + n + ' 🥥'); som('colher');
  } else if (o.tipo === 'cristal') {
    if (!presente(o)) return;
    S.cristais[o.k] = 1; addInv('cristal', 1); somar('cristal', 1); ganharXP(15);
    coracoes(X, Y, 6, '✨'); flutuar(X, Y, '+1 💎', '#8a4fd8'); som('bebe');
    toast('💎 Você achou um cristal mágico! (' + Object.keys(S.cristais).length + ' de ' + TOTAL_CRISTAIS() + ')');
  } else if (o.tipo === 'concha') {
    if (!presente(o)) return;
    addInv('concha', 1); somar('conchas', 1); ganharXP(2);
    S.nat[o.k] = agora + 180000;
    flutuar(X, Y, '+1 🐚'); som('pop');
  }
  hudSujo = true;
}
function abrirBau() {
  if (!S.bau || S.bau.pego) return;
  S.bau.pego = true; somar('baus', 1);
  const moedas = 40 + 5 * S.nivel;
  S.moedas += moedas;
  const sementes = Object.keys(PLANTAS).filter(k => PLANTAS[k].nivel <= S.nivel);
  const sem = sorteia(sementes); addInv('s_' + sem, 3);
  let extra = '';
  if (Math.random() < 0.25) { addInv('cristal', 1); extra = ' e um 💎 cristal'; }
  hudSujo = true; salvar();
  festa({ ic: '🎁', tit: 'Você achou o baú do dia!', txt: 'Dentro tinha ' + moedas + ' moedas, 3 sementes de ' + PLANTAS[sem].nome.toLowerCase() + extra + '!' });
}

// ---------- NPCs ----------
function tocarNpc(id) {
  const p = npcPos(id);
  irPara(pertoDe(p.x, p.y, 1, 1), () => falarNpc(id));
}
function retratoNpc(look, fada) {
  const c = h('canvas', { width: 160, height: 160, class: 'retrato' });
  const a = c.getContext('2d');
  a.fillStyle = fada ? '#f3e6ff' : '#e3f4ff'; a.beginPath(); a.arc(80, 80, 80, 0, 7); a.fill();
  a.save(); a.beginPath(); a.arc(80, 80, 80, 0, 7); a.clip();
  desenharPessoa(a, 80, 205, look, { s: 3.2, t: 1 });
  a.restore();
  return c;
}
function falarNpc(id) {
  const n = NPCS[id];
  const ilha = n.ilha;
  let fala;
  if (S.fase >= FIM) fala = 'Viva a Lenda das Ilhas, ' + S.nome + '! Todas as ilhas estão felizes graças a você. 👑';
  else if (ilha === S.fase) fala = FASES[ilha].fala.replace('{n}', S.nome);
  else if (ilha < S.fase) fala = sorteia(['Obrigada pela ajuda, ' + S.nome + '! 💕', 'Dica: animais felizes (com comida) têm bebês!', 'Dica: regue os canteiros para crescer mais rápido 💧', 'Dica: venda o que colher na 🎒 Mochila.', 'Dica: cavalos e pôneis deixam você correr mais rápido!', 'Dica: todo dia aparece um baú 🎁 escondido em alguma ilha!']);
  abrirPainel(n.nome, null, c => {
    c.append(h('div', { class: 'conversa' }, retratoNpc(n.look, n.fada), h('p', { class: 'fala' }, fala)));
    if (ilha === S.fase && S.fase < FIM) c.append(listaMissoes());
  });
}

// ---------- missões ----------
function listaMissoes() {
  const f = FASES[S.fase];
  const box = h('div', { class: 'lista' });
  f.missoes.forEach(m => {
    const [feito, meta] = m.c(S);
    const ok = feito >= meta;
    box.append(h('div', { class: 'linha missao' + (ok ? ' feita' : '') }, h('div', { class: 'ic' }, ok ? '✅' : m.ic),
      h('div', { class: 'tx' }, h('b', null, m.t), h('small', null, ok ? 'Feito!' : m.dica), h('div', { class: 'prog' }, h('i', { style: 'width:' + Math.min(100, feito / meta * 100) + '%' })), h('small', null, Math.min(feito, meta) + ' de ' + meta))));
  });
  box.append(h('p', { class: 'premio' }, '🎁 Prêmio: ' + f.premio + ' moedas' + (S.fase === 4 ? ' + Coroa de Rainha 👑' : '') + (S.fase < FIM - 1 ? ' + ponte para a ' + ILHAS[S.fase + 1].nome : ' + título de Lenda das Ilhas 🌟')));
  return box;
}
function abrirMissoes(aba) {
  abrirPainel('📜 Missões', [['fase', '🏝️ Aventura'], ['dia', '☀️ Do dia'], ['trofeus', '🏆 Troféus']], (c, a) => {
    if (a === 'fase') {
      if (S.fase >= FIM) { c.append(h('p', { class: 'fala' }, '🌟 Você completou as ' + ILHAS.length + ' ilhas! Agora é a Lenda das Ilhas. Continue criando animais, construindo e fazendo os desafios do dia!')); return; }
      const n = NPCS[FASES[S.fase].npc];
      c.append(h('p', { class: 'fala' }, ILHAS[S.fase].nome + ' — missões de ' + n.nome), listaMissoes());
    } else if (a === 'dia') {
      gerarDesafio();
      c.append(h('p', { class: 'fala' }, 'Desafios novos todo dia! Cada um vale 30 moedas.'));
      const box = h('div', { class: 'lista' });
      for (const d of S.desafio.itens) {
        const def = DESAFIOS.find(x => x.k === d.k);
        const v = Math.min(d.n, (S.st[d.k] || 0) - d.base);
        box.append(h('div', { class: 'linha missao' + (d.feito ? ' feita' : '') }, h('div', { class: 'ic' }, d.feito ? '✅' : def.ic), h('div', { class: 'tx' }, h('b', null, def.t.replace('{n}', d.n)), h('div', { class: 'prog' }, h('i', { style: 'width:' + (v / d.n * 100) + '%' })), h('small', null, v + ' de ' + d.n))));
      }
      c.append(box);
    } else {
      const grade = h('div', { class: 'grade' });
      for (const t of TROFEUS) {
        const tem = S.trofeus.includes(t.id);
        grade.append(h('div', { class: 'cartao' + (tem ? '' : ' trancado') }, h('div', { class: 'ic' }, tem ? t.ic : '🔒'), h('div', { class: 'nm' }, t.t)));
      }
      c.append(grade);
    }
  }, aba);
}
function gerarDesafio() {
  const hoje = diaHoje();
  if (S.desafio && S.desafio.dia === hoje) return;
  const r = rng(parseInt(hoje.replace(/-/g, ''), 10));
  const pool = DESAFIOS.slice(); const esc = [];
  while (esc.length < 3) esc.push(pool.splice(Math.floor(r() * pool.length), 1)[0]);
  const tier = S.nivel < 4 ? 0 : S.nivel < 8 ? 1 : 2;
  S.desafio = { dia: hoje, itens: esc.map(d => ({ k: d.k, n: d.n[tier], base: S.st[d.k] || 0, feito: false })) };
}
function conferirMissoes() {
  if (S.fase < FIM) {
    const f = FASES[S.fase];
    let todas = true;
    f.missoes.forEach((m, i) => {
      const [a, b] = m.c(S); const key = S.fase + '-' + i;
      if (a >= b) { if (!S.mfeitas[key]) { S.mfeitas[key] = 1; toast('✅ Missão cumprida: ' + m.t); som('colher'); ganharXP(15); } }
      else todas = false;
    });
    if (todas) completarFase();
  }
  if (S.desafio && S.desafio.dia === diaHoje()) for (const d of S.desafio.itens) {
    if (!d.feito && (S.st[d.k] || 0) - d.base >= d.n) { d.feito = true; S.moedas += 30; ganharXP(10); hudSujo = true; toast('☀️ Desafio do dia completo! +30 🪙'); som('moeda'); }
  }
  for (const t of TROFEUS) if (!S.trofeus.includes(t.id) && t.c(S)) { S.trofeus.push(t.id); S.moedas += 50; hudSujo = true; toast('🏆 Troféu: ' + t.t + '! +50 🪙'); }
}
function completarFase() {
  const f = FASES[S.fase];
  const n = NPCS[f.npc];
  S.moedas += f.premio; ganharXP(50); hudSujo = true;
  S.fase++;
  atualizarPontes(S.fase); recalcularBloqueio();
  if (S.fase >= FIM) {
    if (!S.acc.includes('asas')) S.acc.push('asas');
    festa({ ic: '🌟', tit: 'Você é a Lenda das Ilhas!', txt: 'Uau, ' + S.nome + '! Você passou por todas as ' + ILHAS.length + ' ilhas, fez amizade com bichos do mundo inteiro e construiu o Palácio das Estrelas. Ganhou ' + f.premio + ' moedas e as Asas de Fada!', ok: 'Que demais! 🌟' });
  } else if (S.fase === 5) {
    if (!S.acc.includes('coroa')) S.acc.push('coroa');
    festa({ ic: '👑', tit: 'Você é a Rainha das Ilhas!', txt: 'Incrível, ' + S.nome + '! Você ajudou todos os amigos, cuidou dos animais e construiu o castelo. Ganhou ' + f.premio + ' moedas e a Coroa de Rainha!', ok: 'Usar a coroa 👑', onOk: () => { S.look.acc = 'coroa'; desenharAvatar(); } });
    festa({ ic: '🌉', tit: 'Uma ponte nova apareceu!', txt: 'Lá na Praia dos Coqueiros surgiu uma ponte para o ' + ILHAS[5].nome + '. Mais ' + (ILHAS.length - 5) + ' ilhas cheias de bichos e amigos novos esperam por você!' });
  } else {
    const prox = ILHAS[S.fase];
    festa({ ic: '🌉', tit: 'Fase completa!', txt: n.nome + ' te deu ' + f.premio + ' moedas e consertou a ponte para a ' + prox.nome + '! Atravesse e fale com ' + NPCS[FASES[S.fase].npc].nome + '.' });
  }
  salvar();
}

// ---------- plantas ----------
function tocarConstru(b) {
  const d = CONSTRU[b.tipo];
  const fn = pertoDe(b.x, b.y, d.w, d.h);
  irPara(fn, () => acaoConstru(b));
}
function acaoConstru(b) {
  const d = CONSTRU[b.tipo];
  const agora = Date.now();
  if (b.tipo === 'canteiro') {
    if (b.planta && agora - b.planta.inicio >= b.planta.dur * 1000) return colher(b);
    return menuCanteiro(b);
  }
  if (d.fruta && b.frutaEm && agora >= b.frutaEm) {
    const n = 2 + Math.floor(Math.random() * 2);
    addInv(d.fruta, n); somar('colheu', n, d.fruta); somar('colheuTotal', n); ganharXP(6);
    b.frutaEm = agora + d.tempo * 1000;
    flutuar((b.x + 0.5) * T, b.y * T, '+' + n + ' ' + ITENS[d.fruta].e); som('colher');
    return;
  }
  menuConstru(b);
}
function plantar(b, tipo) {
  if (!inv('s_' + tipo)) return;
  addInv('s_' + tipo, -1);
  b.planta = { tipo, inicio: Date.now(), dur: PLANTAS[tipo].tempo, regado: false };
  ganharXP(1); som('pop');
  folhas((b.x + 0.5) * T, (b.y + 1) * T, '🌱');
}
function colher(b) {
  const p = b.planta, def = PLANTAS[p.tipo];
  const n = 1 + (p.regado ? 1 : 0);
  addInv(p.tipo, n); somar('colheu', n, p.tipo); somar('colheuTotal', n); ganharXP(def.xp);
  flutuar((b.x + 0.5) * T, b.y * T + 10, '+' + n + ' ' + def.e); som('colher');
  b.planta = null;
  if (inv('s_' + p.tipo)) { plantar(b, p.tipo); flutuar((b.x + 0.5) * T, b.y * T - 10, 'plantou de novo 🌱', '#2b9a5f'); }
  hudSujo = true;
}
function menuCanteiro(b) {
  abrirPainel('🌱 Canteiro', null, c => {
    const p = b.planta;
    if (p) {
      const def = PLANTAS[p.tipo];
      const falta = p.inicio + p.dur * 1000 - Date.now();
      c.append(linha(def.e, def.nome + ' crescendo', 'Fica pronta em ' + mmss(falta) + (p.regado ? ' · 💧 regada (vai dar 2!)' : '')));
      const ac = h('div', { class: 'acoes' });
      if (!p.regado) ac.append(botao('💧 Regar', () => { p.regado = true; p.inicio -= p.dur * 300; som('agua'); coracoes((b.x + 0.5) * T, (b.y + 0.5) * T, 4, '💧'); fecharPainel(); }, 'azul'));
      ac.append(botao('📦 Guardar canteiro', () => guardarConstru(b), 'cinza'));
      c.append(ac);
      return;
    }
    const sementes = Object.keys(PLANTAS).filter(k => inv('s_' + k) > 0);
    if (!sementes.length) {
      c.append(h('p', { class: 'fala' }, 'Você não tem sementes. Compre na Loja! 🛒'), botao('🛒 Ir para a Loja', () => abrirLoja('sementes'), 'azul'));
    } else {
      c.append(h('p', { class: 'fala' }, 'O que vamos plantar?'));
      const grade = h('div', { class: 'grade' });
      for (const k of sementes) {
        const def = PLANTAS[k];
        grade.append(h('button', { class: 'cartao clicavel', onclick: () => { plantar(b, k); fecharPainel(); } }, h('div', { class: 'ic' }, def.e), h('div', { class: 'nm' }, def.nome), h('div', { class: 'ds' }, 'Você tem ' + inv('s_' + k) + ' · ' + mmss(def.tempo * 1000))));
      }
      c.append(grade);
    }
    c.append(h('div', { class: 'acoes', style: 'margin-top:10px' }, botao('🚚 Mover', () => entrarModoConstruir(b.tipo, b), 'cinza'), botao('📦 Guardar', () => guardarConstru(b), 'cinza')));
  });
}
function menuConstru(b) {
  const d = CONSTRU[b.tipo];
  abrirPainel(d.ic + ' ' + d.nome, null, c => {
    const ac = h('div', { class: 'acoes' });
    if (d.fruta) {
      c.append(linha(ITENS[d.fruta].e, 'Frutas crescendo', 'Ficam prontas em ' + mmss(b.frutaEm - Date.now())));
    }
    if (d.abriga) {
      const moradores = S.animais.filter(a => a.casa === b.id);
      c.append(h('p', { class: 'fala' }, 'Moradores: ' + moradores.length + ' de ' + d.vagas + (moradores.length ? '' : ' — ainda está vazia!')));
      const l = h('div', { class: 'lista' });
      for (const a of moradores) l.append(linhaAnimal(a));
      c.append(l);
      if (b.tipo === 'lago') {
        for (const k of ['peixe', 'peixe2', 'peixe3']) if (inv(k)) ac.append(botao('Soltar ' + ITENS[k].e + ' ' + ITENS[k].nome, () => { soltarPeixe(k); redesenharPainel(); }, 'azul', vagasCasa(b) <= 0));
        if (!inv('peixe') && !inv('peixe2') && !inv('peixe3')) c.append(h('p', { class: 'dica-p' }, '🎣 Pesque peixes no mar ou no rio e solte aqui!'));
      }
      if (vagasCasa(b) > 0 && b.tipo !== 'lago') ac.append(botao('🛒 Comprar bichinho', () => abrirLoja('animais'), 'azul'));
    }
    if (d.casa) {
      ac.append(botao('🎨 Pintar', () => { b.cor = ((b.cor || 0) + 1) % CORES_TELHADO.length; som('pop'); salvar(); }, 'amarelo'));
      if (noite() > 0.3) ac.append(botao('😴 Dormir até de manhã', () => { S.hora = 20; fecharPainel(); toast('☀️ Bom dia, ' + S.nome + '!'); som('amor'); }, 'azul'));
    }
    ac.append(botao('🚚 Mover', () => entrarModoConstruir(b.tipo, b), 'cinza'));
    ac.append(botao('📦 Guardar', () => guardarConstru(b), 'cinza'));
    c.append(ac);
  });
}
function soltarPeixe(item) {
  const casa = casaLivre('peixe');
  if (!casa) { toast('O lago está cheio! Construa outro lago.'); som('erro'); return; }
  addInv(item, -1);
  novoAnimal('peixe', casa, { v: ITENS[item].peixe });
  som('agua'); toast(ITENS[item].e + ' Peixe solto no lago!'); salvar();
}

// ---------- animais: ações ----------
function tocarAnimal(a) {
  a.parado = tempo + 6;
  const fn = (x, y) => Math.max(Math.abs(x - tileDe(a.x)), Math.abs(y - tileDe(a.y))) <= 1;
  irPara(fn, () => { a.parado = tempo + 4; P.dir = a.x > P.x ? 1 : -1; if (prodPronto(a)) coletar(a); else menuAnimal(a); });
}
function coletar(a) {
  const esp = ESPECIES[a.sp];
  a.prodEm = 0;
  somar('coletou', 1); ganharXP(5);
  if (esp.prod === 'presente') {
    const n = 8 + Math.floor(Math.random() * 13);
    ganhar(n, a.x, a.y);
    toast(esp.v[0][0] + ' ' + a.nome + ' trouxe um presentinho: ' + n + ' moedas!');
  } else {
    addInv(esp.prod, 1); somar('prod', 1, esp.prod);
    if (esp.prod === 'cristal') somar('cristal', 1);
    flutuar(a.x, a.y, '+1 ' + ITENS[esp.prod].e); som('colher');
  }
  coracoes(a.x, a.y, 2);
}
function comidaPara(sp) { return ESPECIES[sp].come.filter(k => inv(k) > 0); }
function alimentar(a, k) {
  const esp = ESPECIES[a.sp];
  if (!inv(k)) return;
  addInv(k, -1);
  a.comeu = Date.now();
  if (esp.prod && !a.prodEm && !a.bebe) a.prodEm = Date.now() + esp.tProd * 1000;
  somar('alimentou', 1); ganharXP(2);
  coracoes(a.x, a.y, 3); som('amor');
}
function menuAnimal(a) {
  const esp = ESPECIES[a.sp], e = emojiAnimal(a);
  abrirPainel(e[0] + ' ' + a.nome, null, c => {
    const estado = [];
    if (a.bebe) estado.push('🍼 Bebê — cresce em ' + mmss(a.nasc + 180000 - Date.now()));
    estado.push(feliz(a) ? '😊 Feliz e de barriga cheia' : '🍽️ Está com fome');
    if (esp.prod && a.prodEm && !prodPronto(a)) estado.push(ITENS[esp.prod].e + ' pronto em ' + mmss(a.prodEm - Date.now()));
    c.append(h('p', { class: 'fala' }, esp.nome + (a.bebe ? ' bebê' : '') + ' · ' + estado.join(' · ')));
    const ac = h('div', { class: 'acoes' });
    const comidas = comidaPara(a.sp);
    if (comidas.length) for (const k of comidas) ac.append(botao('Dar ' + ITENS[k].e + ' ' + ITENS[k].nome + ' (' + inv(k) + ')', () => { alimentar(a, k); redesenharPainel(); }, 'verde'));
    else ac.append(h('p', { class: 'dica-p' }, 'Comida favorita: ' + esp.come.map(k => ITENS[k].e + ' ' + ITENS[k].nome).join(', ') + '. Você não tem nenhuma agora.'));
    ac.append(botao('❤️ Carinho', () => {
      if (a.ultCarinho && tempo - a.ultCarinho < 3) { coracoes(a.x, a.y, 1); return; }
      a.ultCarinho = tempo; somar('carinho', 1); ganharXP(1); coracoes(a.x, a.y, 4); som('amor');
    }, ''));
    if (esp.monta && !a.bebe) ac.append(botao('🏇 Montar', () => montar(a), 'amarelo'));
    if (!esp.nada) ac.append(botao(S.companheiro === a.id ? '⭐ Deixar em casa' : '⭐ Me seguir', () => { alternarCompanheiro(a); redesenharPainel(); }, 'azul'));
    ac.append(botao('✏️ Mudar nome', () => renomear(a), 'cinza'));
    ac.append(botao('🏡 Mandar para a fazenda da Vovó', () => doar(a), 'cinza'));
    c.append(ac);
    const amor = S.amor[a.sp] || 0;
    if (!a.bebe) c.append(h('p', { class: 'dica-p' }, '💕 Para nascer um bebê: dê comida para 2 ' + esp.nome.toLowerCase() + 's adultos e tenha espaço na ' + tipoCasa(a.sp).nome + '.' + (amor ? ' (' + Math.round(amor / esp.tAmor * 100) + '% do caminho!)' : '')));
  });
}
function montar(a) {
  if (S.montado) desmontar();
  S.montado = a.id;
  if (S.companheiro === a.id) S.companheiro = null;
  somar('montou', 1);
  fecharPainel(); $('btnDescer').hidden = false;
  toast('🏇 Segura firme! Agora você corre mais rápido!'); som('amor');
}
function desmontar() {
  const a = S.animais.find(x => x.id === S.montado);
  S.montado = null; $('btnDescer').hidden = true;
  if (!a) return;
  a.x = P.x + T * 0.7; a.y = P.y; a.tx = null;
  const b = construPorId(a.casa);
  if (b) { const p = pontoCasa(b); if (Math.hypot(p.x - a.x, p.y - a.y) > T * 10 || ilhaDe[idx(tileDe(p.x), tileDe(p.y))] !== ilhaDe[idx(tileDe(P.x), tileDe(P.y))]) { voltarParaCasa(a); toast(ESPECIES[a.sp].v[0][0] + ' ' + a.nome + ' voltou para casa.'); } }
}
function alternarCompanheiro(a) {
  if (S.companheiro === a.id) {
    S.companheiro = null;
    const b = construPorId(a.casa); if (b) { const p = pontoCasa(b); if (Math.hypot(p.x - a.x, p.y - a.y) > T * 10) voltarParaCasa(a); }
    toast(a.nome + ' voltou para casa.');
  } else {
    if (S.companheiro) { const o = S.animais.find(x => x.id === S.companheiro); if (o) voltarParaCasa(o); }
    S.companheiro = a.id; a.x = P.x - T * 0.6; a.y = P.y; P.rastro = [];
    toast('⭐ ' + a.nome + ' agora vai com você para todo lado!'); som('amor');
  }
}
function renomear(a) {
  abrirPainel('✏️ Nome do bichinho', null, c => {
    const inp = h('input', { class: 'campo', maxlength: 16, value: a.nome });
    c.append(h('p', { class: 'fala' }, 'Qual vai ser o nome?'), inp, h('div', { class: 'acoes', style: 'margin-top:10px' }, botao('✔ Salvar', () => { const v = inp.value.trim(); if (v) a.nome = v; salvar(); menuAnimal(a); }, 'verde')));
    setTimeout(() => inp.focus(), 50);
  });
}
function doar(a) {
  abrirPainel('🏡 Fazenda da Vovó', null, c => {
    const valor = a.bebe ? 15 : Math.max(15, Math.floor((ESPECIES[a.sp].preco || 200) / 2));
    c.append(h('p', { class: 'fala' }, a.nome + ' vai morar na fazenda grande da Vovó, com muito espaço e amiguinhos. A Vovó te dá ' + valor + ' moedas para comprar coisas novas. Tem certeza?'));
    c.append(h('div', { class: 'acoes' }, botao('Sim, pode levar', () => {
      if (S.montado === a.id) desmontar();
      if (S.companheiro === a.id) S.companheiro = null;
      S.animais = S.animais.filter(x => x !== a);
      S.moedas += valor; hudSujo = true; fecharPainel(); salvar();
      toast('💕 ' + a.nome + ' foi para a fazenda da Vovó. +' + valor + ' 🪙');
    }, 'verde'), botao('Não, fica comigo!', () => menuAnimal(a), 'rosa')));
  });
}
function linhaAnimal(a) {
  const esp = ESPECIES[a.sp], e = emojiAnimal(a);
  const st = [];
  if (a.bebe) st.push('🍼 bebê');
  st.push(feliz(a) ? '😊 feliz' : '🍽️ com fome');
  if (prodPronto(a)) st.push(ITENS[esp.prod].e + ' pronto!');
  if (S.companheiro === a.id) st.push('⭐ com você');
  if (S.montado === a.id) st.push('🏇 montada');
  const ic = h('span', { style: e[1] ? 'filter:' + e[1] : '' }, e[0]);
  return linha(ic, a.nome, esp.nome + ' · ' + st.join(' · '), [botao('Ver', () => { fecharPainel(); tocarAnimal(a); }, 'azul')]);
}

// ---------- bebês ----------
function tickAnimais() {
  const agora = Date.now();
  for (const a of S.animais) if (a.bebe && agora - a.nasc > 180000) { a.bebe = false; toast('🎉 ' + a.nome + ' cresceu!'); }
  const porSp = {};
  for (const a of S.animais) if (!a.bebe) (porSp[a.sp] = porSp[a.sp] || []).push(a);
  for (const sp in porSp) {
    const fel = porSp[sp].filter(feliz);
    if (fel.length < 2) continue;
    if (!casaLivre(sp)) continue;
    S.amor[sp] = (S.amor[sp] || 0) + 1;
    if (S.amor[sp] % 4 === 0) { coracoes(fel[0].x, fel[0].y, 1); coracoes(fel[1].x, fel[1].y, 1); }
    if (S.amor[sp] >= ESPECIES[sp].tAmor) { S.amor[sp] = 0; nascer(sp, fel[0], fel[1]); }
  }
}
function nascer(sp, pai, mae) {
  const casa = casaLivre(sp); if (!casa) return;
  const esp = ESPECIES[sp];
  const bebe = novoAnimal(sp, casa, { bebe: true, v: Math.random() < 0.5 ? pai.v : mae.v, x: (pai.x + mae.x) / 2, y: (pai.y + mae.y) / 2, semAviso: true });
  pai.comeu = 0; mae.comeu = 0;
  somar('nasceu', 1); ganharXP(25);
  coracoes(bebe.x, bebe.y, 8);
  const inp = h('input', { class: 'campo', maxlength: 16, value: bebe.nome });
  festa({
    ic: esp.v[bebe.v % esp.v.length][0], tit: 'Nasceu um bebê!', txt: pai.nome + ' e ' + mae.nome + ' tiveram um filhote de ' + esp.nome.toLowerCase() + '! Que nome você quer dar?',
    extra: inp, ok: 'Que fofo! 💕', som: 'bebe', onOk: () => { const v = inp.value.trim(); if (v) bebe.nome = v; salvar(); },
  });
  salvar();
}

// ---------- selvagens ----------
function tocarSelvagem(s) {
  s.parado = tempo + 8;
  const fn = (x, y) => Math.max(Math.abs(x - tileDe(s.x)), Math.abs(y - tileDe(s.y))) <= 1;
  irPara(fn, () => { s.parado = tempo + 6; menuSelvagem(s); });
}
function menuSelvagem(s) {
  const esp = ESPECIES[s.sp];
  const v = esp.v[s.v % esp.v.length];
  abrirPainel(v[0] + ' ' + esp.nome + ' selvagem', null, c => {
    c.append(h('p', { class: 'fala' }, 'Ele está curioso com você! Gosta de: ' + esp.come.map(k => ITENS[k].e + ' ' + ITENS[k].nome).join(', ') + '.'));
    const casa = casaLivre(s.sp);
    const ac = h('div', { class: 'acoes' });
    if (!casa) {
      const tc = tipoCasa(s.sp);
      c.append(h('p', { class: 'dica-p' }, 'Para ele morar com você, construa: ' + tc.ic + ' ' + tc.nome + (tc.nivel > S.nivel ? ' (libera no nível ' + tc.nivel + ')' : '') + '.'));
      if (tc.nivel <= S.nivel) ac.append(botao('🔨 Construir ' + tc.nome, () => abrirConstruir(tc.cat), 'azul'));
    } else {
      const comidas = comidaPara(s.sp);
      if (!comidas.length) c.append(h('p', { class: 'dica-p' }, 'Você não tem a comida que ele gosta. Plante ou compre na Loja!'));
      for (const k of comidas) ac.append(botao('Dar ' + ITENS[k].e + ' e fazer amizade', () => fazerAmizade(s, k, casa), 'verde'));
    }
    c.append(ac);
  });
}
function fazerAmizade(s, k, casa) {
  const esp = ESPECIES[s.sp];
  addInv(k, -1);
  selvagens = selvagens.filter(x => x !== s);
  S.selv[s.key] = Date.now() + 600000;
  const a = novoAnimal(s.sp, casa, { v: s.v, semAviso: true });
  if (!S.album.includes(s.sp)) S.album.push(s.sp);
  somar('amizade', 1, s.sp); ganharXP(20);
  coracoes(s.x, s.y, 8);
  fecharPainel(); salvar();
  festa({
    ic: esp.v[s.v % esp.v.length][0], tit: 'Novo amigo!', txt: 'O ' + esp.nome.toLowerCase() + ' adorou o presente e agora é seu amigo! Ele foi morar na ' + CONSTRU[casa.tipo].nome + '. Que nome você quer dar?',
    extra: (() => { const inp = h('input', { class: 'campo', maxlength: 16, value: a.nome }); inp.addEventListener('change', () => { if (inp.value.trim()) a.nome = inp.value.trim(); }); return inp; })(),
    ok: 'Oba! 💕', som: 'bebe', onOk: () => salvar(),
  });
}

// ---------- pesca ----------
let pesca = null;
function abrirPesca(ilha) {
  abrirPainel('🎣 Pescaria', null, c => {
    c.append(h('div', { class: 'agua' }, h('div', { class: 'fio' }), h('div', { class: 'boia', id: 'boia' }, h('i')), h('div', { class: 'onda o1' }), h('div', { class: 'onda o2' })),
      h('p', { class: 'pesca-msg', id: 'pescaMsg' }, 'Espere o peixe morder a isca...'),
      h('button', { class: 'btn azul grande', id: 'btnPuxar', onclick: puxar }, '🎣 Puxar!'));
  });
  pesca = { ilha, fase: 'espera', timer: null };
  esperarPeixe();
}
function pescaMsg(t) { const e = $('pescaMsg'); if (e) e.textContent = t; }
function boia(cls) { const e = $('boia'); if (e) e.className = 'boia ' + cls; }
function esperarPeixe() {
  if (!pesca) return;
  clearTimeout(pesca.timer);
  pesca.fase = 'espera'; boia(''); pescaMsg('Espere o peixe morder a isca...');
  const b = $('btnPuxar'); if (b) b.textContent = '🎣 Puxar!';
  pesca.timer = setTimeout(() => {
    if (!pesca) return;
    pesca.fase = 'mordeu'; boia('mordeu'); pescaMsg('MORDEU! PUXE AGORA! 🐟'); vibrar(120); som('agua');
    pesca.timer = setTimeout(() => {
      if (!pesca) return;
      pesca.fase = 'fugiu'; boia(''); pescaMsg('Ah! O peixe escapou. Tente de novo!');
      const b2 = $('btnPuxar'); if (b2) b2.textContent = '🎣 Jogar a isca de novo';
    }, 1500);
  }, 1500 + Math.random() * 3000);
}
function puxar() {
  if (!pesca) return;
  if (pesca.fase === 'espera') { pescaMsg('Calma... ainda não mordeu! 🤫'); clearTimeout(pesca.timer); setTimeout(esperarPeixe, 700); pesca.fase = 'calma'; return; }
  if (pesca.fase === 'calma') return;
  if (pesca.fase !== 'mordeu') { esperarPeixe(); return; }
  clearTimeout(pesca.timer);
  pesca.fase = 'pegou';
  const praia = !!(ILHAS[pesca.ilha] && ILHAS[pesca.ilha].palmeiras);
  const r = Math.random();
  let item;
  if (r < 0.05) { const n = 30 + Math.floor(Math.random() * 40); S.moedas += n; hudSujo = true; pescaMsg('Você pescou um baú de tesouro! +' + n + ' 🪙'); boia('pegou'); som('moeda'); }
  else {
    item = r < (praia ? 0.45 : 0.62) ? 'peixe' : r < (praia ? 0.8 : 0.88) ? 'peixe2' : 'peixe3';
    addInv(item, 1); somar('pescou', 1); ganharXP(5);
    pescaMsg('Você pescou: ' + ITENS[item].e + ' ' + ITENS[item].nome + '!'); boia('pegou'); som('colher');
  }
  const b = $('btnPuxar'); if (b) b.textContent = '🎣 Pescar de novo';
}
function pararPesca() { if (pesca) { clearTimeout(pesca.timer); pesca = null; } }

// ---------- telas: construir, loja, mochila, animais, mais ----------
function abrirConstruir(aba) {
  abrirPainel('🔨 Construir', CATS_CONSTRU, (c, cat) => {
    const grade = h('div', { class: 'grade' });
    for (const k in CONSTRU) {
      const d = CONSTRU[k]; if (d.cat !== cat) continue;
      const tranc = d.nivel > S.nivel;
      const cart = h('button', { class: 'cartao clicavel' + (tranc ? ' trancado' : ''), onclick: () => { if (tranc) { toast('🔒 Libera no nível ' + d.nivel); som('erro'); return; } if (!pode(d.custo)) { toast('Faltam moedas ou materiais 🪵🪨'); som('erro'); return; } entrarModoConstruir(k); } },
        h('div', { class: 'ic' }, d.ic), h('div', { class: 'nm' }, d.nome), h('div', { class: 'ds' }, d.desc), tranc ? h('div', { class: 'custo' }, '🔒 Nível ' + d.nivel) : custoNos(d.custo));
      grade.append(cart);
    }
    c.append(grade);
  }, aba);
}
function abrirLoja(aba) {
  abrirPainel('🛒 Loja', [['animais', '🐾 Bichos'], ['sementes', '🌱 Sementes'], ['comida', '🥣 Comida'], ['visual', '🎀 Visual']], (c, a) => {
    const grade = h('div', { class: 'grade' });
    if (a === 'animais') {
      for (const sp of ORDEM_ALBUM) {
        const esp = ESPECIES[sp]; if (!esp.preco) continue;
        const tranc = esp.nivel > S.nivel, casa = casaLivre(sp), tc = tipoCasa(sp);
        grade.append(h('div', { class: 'cartao' + (tranc ? ' trancado' : '') }, h('div', { class: 'ic' }, esp.v[0][0]), h('div', { class: 'nm' }, esp.nome),
          h('div', { class: 'ds' }, tranc ? '🔒 Nível ' + esp.nivel : casa ? 'Vai morar na ' + tc.nome : 'Precisa de ' + tc.ic + ' ' + tc.nome),
          botao('🪙 ' + esp.preco, () => comprarAnimal(sp), 'verde', tranc || S.moedas < esp.preco)));
      }
      c.append(h('p', { class: 'dica-p' }, '🦄 Unicórnios e 🐉 dragões não são vendidos... dizem que vivem nas ilhas mágicas!'));
    } else if (a === 'sementes') {
      for (const k in PLANTAS) {
        const p = PLANTAS[k], tranc = p.nivel > S.nivel;
        grade.append(h('div', { class: 'cartao' + (tranc ? ' trancado' : '') }, h('div', { class: 'ic' }, p.e), h('div', { class: 'nm' }, p.nome), h('div', { class: 'ds' }, tranc ? '🔒 Nível ' + p.nivel : 'Cresce em ' + mmss(p.tempo * 1000) + ' · você tem ' + inv('s_' + k)),
          h('div', { class: 'bts' }, botao('1 · 🪙' + p.semente, () => comprar('s_' + k, 1, p.semente), 'verde', tranc || S.moedas < p.semente), botao('5 · 🪙' + p.semente * 5, () => comprar('s_' + k, 5, p.semente * 5), 'verde', tranc || S.moedas < p.semente * 5))));
      }
    } else if (a === 'comida') {
      grade.append(h('div', { class: 'cartao' }, h('div', { class: 'ic' }, '🥣'), h('div', { class: 'nm' }, 'Ração'), h('div', { class: 'ds' }, 'Para cachorros, gatos e peixes · você tem ' + inv('racao')),
        h('div', { class: 'bts' }, botao('1 · 🪙3', () => comprar('racao', 1, 3), 'verde', S.moedas < 3), botao('10 · 🪙30', () => comprar('racao', 10, 30), 'verde', S.moedas < 30))));
      c.append(h('p', { class: 'dica-p' }, '🥕 Coelhos, vacas, ovelhas, galinhas, cavalos e pôneis comem o que você planta!'));
    } else {
      for (const k in ACESSORIOS) {
        const ac = ACESSORIOS[k], tem = S.acc.includes(k), tranc = (ac.nivel || 0) > S.nivel;
        if (ac.premio && !tem) continue;
        const usando = S.look.acc === k;
        grade.append(h('div', { class: 'cartao' + (tranc ? ' trancado' : '') }, h('div', { class: 'ic' }, ac.ic), h('div', { class: 'nm' }, ac.nome),
          tem ? botao(usando ? '✔ Usando' : 'Usar', () => { S.look.acc = k; desenharAvatar(); salvar(); redesenharPainel(); }, usando ? 'cinza' : 'azul') :
            tranc ? h('div', { class: 'ds' }, '🔒 Nível ' + ac.nivel) : botao('🪙 ' + ac.preco, () => { if (S.moedas < ac.preco) return; S.moedas -= ac.preco; S.acc.push(k); S.look.acc = k; hudSujo = true; desenharAvatar(); som('moeda'); salvar(); redesenharPainel(); }, 'verde', S.moedas < ac.preco)));
      }
      c.append(botao('👗 Mudar roupa, cabelo e cores', () => { fecharPainel(); abrirCriador(false); }, 'rosa'));
    }
    c.prepend(grade);
  }, aba);
}
function comprar(item, n, preco) {
  if (S.moedas < preco) { som('erro'); return; }
  S.moedas -= preco; addInv(item, n); som('moeda'); hudSujo = true; redesenharPainel(); salvar();
}
function comprarAnimal(sp) {
  const esp = ESPECIES[sp];
  if (S.moedas < esp.preco) return;
  const casa = casaLivre(sp);
  if (!casa) { const tc = tipoCasa(sp); toast('Construa um(a) ' + tc.nome + ' primeiro (ou a que você tem está cheia)!'); som('erro'); return; }
  S.moedas -= esp.preco; hudSujo = true;
  const a = novoAnimal(sp, casa, { semAviso: true });
  if (!S.album.includes(sp)) S.album.push(sp);
  ganharXP(5); som('amor'); salvar();
  toast(esp.v[a.v % esp.v.length][0] + ' ' + a.nome + ' chegou na ' + CONSTRU[casa.tipo].nome + '!');
  redesenharPainel();
}
function abrirMochila() {
  abrirPainel('🎒 Mochila', [['coisas', '🧺 Coisas'], ['sementes', '🌱 Sementes']], (c, a) => {
    const l = h('div', { class: 'lista' });
    const ks = Object.keys(S.inv).filter(k => S.inv[k] > 0 && ITENS[k] && (a === 'sementes' ? ITENS[k].semente : !ITENS[k].semente));
    if (!ks.length) l.append(h('p', { class: 'fala' }, a === 'sementes' ? 'Sem sementes. Compre na Loja! 🛒' : 'A mochila está vazia. Colha, pesque e junte coisas pelas ilhas!'));
    for (const k of ks) {
      const it = ITENS[k];
      const bts = [];
      if (it.peixe != null) bts.push(botao('Soltar no lago', () => { soltarPeixe(k); redesenharPainel(); }, 'azul', !casaLivre('peixe')));
      bts.push(botao('Vender 1 · 🪙' + it.venda, () => vender(k, 1), 'verde'));
      if (S.inv[k] > 1) bts.push(botao('Tudo · 🪙' + it.venda * S.inv[k], () => vender(k, S.inv[k]), 'amarelo'));
      const nome = it.semente ? PLANTAS[it.semente].e + ' ' + it.nome : it.nome;
      l.append(linha(it.semente ? '🌱' : it.e, nome + ' ×' + S.inv[k], null, bts));
    }
    c.append(l);
    if (a === 'coisas') c.append(h('p', { class: 'dica-p' }, '💡 Guarde comida para os animais! Cenoura e alface para coelhos, milho para galinhas e vacas, maçã para cavalos, morango para unicórnios.'));
  });
}
function vender(k, n) {
  const it = ITENS[k];
  n = Math.min(n, inv(k)); if (!n) return;
  addInv(k, -n); S.moedas += it.venda * n; somar('vendeu', it.venda * n);
  som('moeda'); hudSujo = true; redesenharPainel(); salvar();
}
function abrirAnimais(aba) {
  abrirPainel('🐾 Meus bichinhos', [['meus', '🐾 Meus bichos'], ['album', '📖 Álbum']], (c, a) => {
    if (a === 'album') {
      const grade = h('div', { class: 'grade' });
      for (const sp of ORDEM_ALBUM) {
        const tem = S.album.includes(sp), esp = ESPECIES[sp];
        grade.append(h('div', { class: 'cartao' + (tem ? '' : ' trancado') }, h('div', { class: 'ic' }, tem ? esp.v[0][0] : '❓'), h('div', { class: 'nm' }, tem ? esp.nome : '???'), h('div', { class: 'ds' }, tem ? 'Você tem ' + contaAnimais(S, sp) : 'Ainda não encontrado')));
      }
      c.append(h('p', { class: 'fala' }, 'Encontrados: ' + S.album.filter(s => ORDEM_ALBUM.includes(s)).length + ' de ' + ORDEM_ALBUM.length), grade);
      return;
    }
    if (!S.animais.length) { c.append(h('p', { class: 'fala' }, 'Você ainda não tem bichinhos. Construa uma casinha para eles e compre na Loja, ou faça amizade com os animais selvagens das ilhas!')); return; }
    for (const sp of ORDEM_ALBUM) {
      const lista = S.animais.filter(x => x.sp === sp); if (!lista.length) continue;
      const esp = ESPECIES[sp];
      const amor = S.amor[sp] || 0;
      const sub = amor ? '💕 Bebê a caminho: ' + Math.round(amor / esp.tAmor * 100) + '%' : 'Dê comida para 2 adultos para nascer um bebê';
      c.append(h('h3', { class: 'grupo' }, esp.v[0][0] + ' ' + esp.nome + 's (' + lista.length + ')', h('small', null, ' · ' + sub)));
      const l = h('div', { class: 'lista' });
      for (const x of lista) l.append(linhaAnimal(x));
      c.append(l);
    }
  }, aba);
}
function abrirMais() {
  abrirPainel('☰ Mais', null, c => {
    const l = h('div', { class: 'lista' });
    l.append(linha('👗', 'Mudar meu visual', 'Roupa, cabelo, cores e enfeites', [botao('Abrir', () => { fecharPainel(); abrirCriador(false); }, 'rosa')]));
    l.append(linha('🏆', 'Troféus', S.trofeus.length + ' de ' + TROFEUS.length, [botao('Ver', () => abrirMissoes('trofeus'), 'azul')]));
    l.append(linha(S.som ? '🔊' : '🔇', 'Som', S.som ? 'Ligado' : 'Desligado', [botao(S.som ? 'Desligar' : 'Ligar', () => { S.som = !S.som; salvar(); redesenharPainel(); }, 'cinza')]));
    l.append(linha('❓', 'Como jogar', null, [botao('Ver', ajuda, 'azul')]));
    if (promptInstalar) l.append(linha('📲', 'Instalar no celular', 'Coloca o jogo na tela inicial', [botao('Instalar', async () => { promptInstalar.prompt(); try { await promptInstalar.userChoice; } catch (e) { } promptInstalar = null; redesenharPainel(); }, 'verde')]));
    l.append(linha('🔄', 'Começar tudo de novo', 'Apaga o jogo salvo', [botao('Recomeçar', recomecar, 'cinza')]));
    c.append(l);
  });
}
function ajuda() {
  abrirPainel('❓ Como jogar', null, c => {
    const itens = [
      ['👆', 'Toque no chão para andar. Toque nas coisas para usar: árvores, pedras, bichos, casas.'],
      ['🪵', 'Corte árvores e quebre pedras para ter madeira e pedra.'],
      ['🔨', 'Em Construir, escolha casas, canteiros, casinhas de bichos e enfeites. Depois toque no chão e em ✔ Colocar.'],
      ['🌱', 'Toque num canteiro para plantar. Regue 💧 para crescer mais rápido e colher em dobro!'],
      ['🐾', 'Cada bicho precisa da sua casinha. Dê comida e carinho. Bichos felizes dão ovos, leite, lã...'],
      ['💕', 'Dois bichos iguais felizes e com espaço na casinha têm um bebê!'],
      ['🦊', 'Animais selvagens podem virar seus amigos se você der a comida favorita deles.'],
      ['🎣', 'Toque na água perto da margem para pescar. Puxe quando a boia afundar!'],
      ['📜', 'Faça as missões para consertar as pontes e descobrir novas ilhas.'],
      ['🏇', 'Monte em cavalos, pôneis e unicórnios para correr mais rápido.'],
      ['🤏', 'Arraste para olhar o mapa. Use dois dedos (ou ＋ e －) para dar zoom.'],
    ];
    const l = h('div', { class: 'lista' });
    for (const [i, t] of itens) l.append(linha(i, t));
    c.append(l);
  });
}
function recomecar() {
  abrirPainel('🔄 Começar de novo?', null, c => {
    c.append(h('p', { class: 'fala' }, 'Tudo vai ser apagado: casas, bichos, moedas e níveis. Tem certeza?'),
      h('div', { class: 'acoes' }, botao('Não, quero continuar', fecharPainel, 'verde'), botao('Sim, apagar tudo', () => { try { localStorage.removeItem(SAVE); } catch (e) { } location.reload(); }, 'cinza')));
  });
}

// ---------- criador de personagem ----------
function abrirCriador(novo) {
  const L = novo ? { pele: PELES[1], cabelo: 'longo', corCabelo: CORES_CABELO[1], olhos: CORES_OLHOS[0], roupa: 'vestido', corRoupa: CORES_ROUPA[0], acc: 'laco' } : Object.assign({}, S.look);
  let nome = novo ? 'Luiza' : S.nome;
  const accs = novo ? ['nada', 'laco', 'oculos'] : S.acc;
  const box = $('criador'); box.hidden = false;
  const cv = h('canvas', { width: 360, height: 400, class: 'previa' });
  let vivo = true, t0 = 0;
  const anim = () => {
    if (!vivo) return;
    t0 += 1 / 60;
    const a = cv.getContext('2d'); a.setTransform(1, 0, 0, 1, 0, 0); a.clearRect(0, 0, 360, 400);
    const gr = a.createRadialGradient(180, 220, 20, 180, 220, 190); gr.addColorStop(0, '#ffffff'); gr.addColorStop(1, '#ffe3f1');
    a.fillStyle = gr; a.beginPath(); a.arc(180, 210, 175, 0, 7); a.fill();
    a.fillStyle = '#8fd068'; a.beginPath(); a.ellipse(180, 360, 130, 26, 0, 0, 7); a.fill();
    desenharPessoa(a, 180, 362, L, { s: 5, t: t0, asas: L.acc === 'asas' });
    requestAnimationFrame(anim);
  };
  const sec = (tit, conteudo) => h('div', { class: 'cr-sec' }, h('h3', null, tit), conteudo);
  const cores = (lista, campo) => h('div', { class: 'cr-op' }, lista.map(cor => h('button', { class: 'cor' + (L[campo] === cor ? ' on' : ''), style: 'background:' + cor, onclick: () => { L[campo] = cor; montar(); } })));
  const chips = (lista, campo) => h('div', { class: 'cr-op' }, lista.map(([k, nomeOp]) => h('button', { class: 'chip-op' + (L[campo] === k ? ' on' : ''), onclick: () => { L[campo] = k; montar(); } }, nomeOp)));
  const inp = h('input', { class: 'campo', maxlength: 14, value: nome, oninput: e => { nome = e.target.value; } });
  const corpo = h('div', { class: 'cr-corpo' });
  function montar() {
    const sc = box.scrollTop;
    corpo.innerHTML = '';
    corpo.append(
      sec('Meu nome', inp),
      sec('Cor da pele', cores(PELES, 'pele')),
      sec('Cabelo', chips(CABELOS, 'cabelo')),
      sec('Cor do cabelo', cores(CORES_CABELO, 'corCabelo')),
      sec('Cor dos olhos', cores(CORES_OLHOS, 'olhos')),
      sec('Roupa', chips(ROUPAS, 'roupa')),
      sec('Cor da roupa', cores(CORES_ROUPA, 'corRoupa')),
      sec('Enfeite', chips(accs.map(k => [k, ACESSORIOS[k].ic + ' ' + ACESSORIOS[k].nome]), 'acc')),
    );
    box.scrollTop = sc;
  }
  box.innerHTML = '';
  box.append(h('div', { class: 'cr-caixa' },
    h('h1', null, novo ? '✨ Crie sua personagem' : '👗 Meu visual'),
    h('div', { class: 'cr-previa' }, cv),
    corpo,
    h('button', { class: 'btn grande verde', onclick: () => {
      vivo = false; box.hidden = true;
      nome = (inp.value || '').trim() || 'Luiza';
      if (novo) { S = novoEstado(L, nome); iniciarJogo(true); }
      else { S.look = L; S.nome = nome; desenharAvatar(); hudSujo = true; salvar(); }
    } }, novo ? 'Começar a aventura! 🏝️' : 'Salvar ✔'),
    novo ? null : h('button', { class: 'btn grande cinza', style: 'margin-top:8px', onclick: () => { vivo = false; box.hidden = true; } }, 'Voltar sem mudar'),
  ));
  montar();
  box.scrollTop = 0;
  requestAnimationFrame(anim);
}

// ---------- HUD ----------
function desenharAvatar() {
  const c = $('avatar'), a = c.getContext('2d');
  a.setTransform(1, 0, 0, 1, 0, 0); a.clearRect(0, 0, 96, 96);
  a.save(); a.beginPath(); a.arc(48, 48, 48, 0, 7); a.clip();
  a.fillStyle = '#bfe6ff'; a.fillRect(0, 0, 96, 96);
  desenharPessoa(a, 48, 150, S.look, { s: 2.5, t: 1 });
  a.restore();
}
let dicaTxt = '';
function atualizarHud() {
  hudSujo = false;
  $('hudNome').textContent = S.nome;
  $('hudNivel').textContent = 'Nível ' + S.nivel;
  $('hudXp').style.width = Math.min(100, S.xp / xpProximo(S.nivel) * 100) + '%';
  $('hudMoedas').textContent = fx('🪙 ') + S.moedas;
  $('hudMadeira').textContent = fx('🪵 ') + inv('madeira');
  $('hudPedra').textContent = fx('🪨 ') + inv('pedra');
  const cr = $('hudCristal'); cr.hidden = !inv('cristal'); cr.textContent = '💎 ' + inv('cristal');
}
function atualizarDica() {
  let t;
  if (S.fase >= FIM) t = '🌟 Lenda das Ilhas! Faça os desafios do dia ☀️';
  else {
    const f = FASES[S.fase];
    const m = f.missoes.find(m => { const [a, b] = m.c(S); return a < b; });
    if (m) { const [a, b] = m.c(S); t = m.ic + ' ' + m.t + ' (' + Math.min(a, b) + '/' + b + ') · ' + m.dica; }
    else t = '🎉 Missões completas!';
  }
  if (t !== dicaTxt) { dicaTxt = t; $('dica').textContent = fx(t); }
  let n = 0;
  if (S.desafio && S.desafio.dia === diaHoje()) n = S.desafio.itens.filter(d => !d.feito).length;
  const selo = $('seloMissoes'); selo.hidden = !n; selo.textContent = n;
}

// ---------- dia e noite ----------
const CICLO = 600;
function noite() {
  const h0 = (S.hora % CICLO) / CICLO;
  if (h0 < 0.7) return 0;
  if (h0 < 0.78) return (h0 - 0.7) / 0.08;
  if (h0 < 0.94) return 1;
  return 1 - (h0 - 0.94) / 0.06;
}

// ---------- atualizar ----------
function atualizar(dt) {
  moverJogador(dt);
  for (const a of S.animais) atualizarAnimal(a, dt, false);
  for (const s of selvagens) atualizarAnimal(s, dt, true);
  const alvoX = P.x + cam.ox, alvoY = P.y - 20 + cam.oy;
  const k = Math.min(1, dt * 6);
  cam.x += (alvoX - cam.x) * k; cam.y += (alvoY - cam.y) * k;
  cam.x = Math.max(0, Math.min(MAP_W * T, cam.x)); cam.y = Math.max(0, Math.min(MAP_H * T, cam.y));
  for (const p of particulas) { p.vida -= dt; p.y += (p.vy || 0) * dt; p.x += (p.vx || 0) * dt; }
  particulas = particulas.filter(p => p.vida > 0);
  S.hora += dt;
  acumSeg += dt;
  if (acumSeg >= 1) {
    acumSeg -= 1;
    tickAnimais();
    conferirMissoes();
    const agora = Date.now();
    let mudou = false;
    for (const o of natureza) {
      const t0 = S.nat[o.k];
      if (t0 && t0 < 9e14 && agora >= t0) {
        if ((o.tipo === 'arvore' || o.tipo === 'rocha') && tileDe(P.x) === o.x && tileDe(P.y) === o.y) { S.nat[o.k] = agora + 5000; continue; }
        delete S.nat[o.k]; mudou = true;
      }
    }
    if (mudou) recalcularBloqueio();
    if (Math.random() < 0.05) conferirSelvagens();
    atualizarDica();
    acumSalvar++;
    if (acumSalvar >= 6) { acumSalvar = 0; salvar(); }
  }
  if (hudSujo) atualizarHud();
}

// ---------- desenhar ----------
function desenhar() {
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.fillStyle = '#2a7cc2'; g.fillRect(0, 0, tela.width, tela.height);
  const esc = DPR * zoom;
  g.setTransform(esc, 0, 0, esc, tela.width / 2 - cam.x * esc, tela.height / 2 - cam.y * esc);
  const vw = LW / zoom, vh = LH / zoom;
  const wx0 = cam.x - vw / 2, wy0 = cam.y - vh / 2, wx1 = cam.x + vw / 2, wy1 = cam.y + vh / 2;
  const CP = CH * T;
  for (let cy = Math.max(0, Math.floor(wy0 / CP)); cy <= Math.min(MAP_H / CH - 1, Math.floor(wy1 / CP)); cy++)
    for (let cx = Math.max(0, Math.floor(wx0 / CP)); cx <= Math.min(MAP_W / CH - 1, Math.floor(wx1 / CP)); cx++)
      g.drawImage(pegarChunk(cx, cy), cx * CP, cy * CP, CP + 0.7, CP + 0.7);
  const tx0 = Math.max(0, Math.floor(wx0 / T) - 1), ty0 = Math.max(0, Math.floor(wy0 / T) - 1), tx1 = Math.min(MAP_W - 1, Math.ceil(wx1 / T) + 1), ty1 = Math.min(MAP_H - 1, Math.ceil(wy1 / T) + 2);
  // ondinhas
  g.strokeStyle = 'rgba(255,255,255,.45)'; g.lineWidth = 1.6; g.lineCap = 'round';
  for (let y = ty0; y <= ty1; y++) for (let x = tx0; x <= tx1; x++) {
    const i = idx(x, y); if (ter[i] !== 0) continue;
    const hh = hash2(x, y, 3); if (hh > 0.09) continue;
    const fase = tempo * 0.8 + hh * 60, a = (Math.sin(fase) + 1) / 2;
    g.globalAlpha = a * 0.8;
    const X = x * T + 10 + Math.sin(fase * 0.7) * 5, Y = y * T + 20;
    g.beginPath(); g.moveTo(X, Y); g.quadraticCurveTo(X + 5, Y - 4, X + 10, Y); g.quadraticCurveTo(X + 15, Y - 4, X + 20, Y); g.stroke();
  }
  g.globalAlpha = 1;
  const visivel = (x, y, m) => x >= tx0 - (m || 0) && x <= tx1 + (m || 0) && y >= ty0 && y <= ty1 + (m || 0);
  const nt = noite();
  // chão
  for (const b of S.constru) { const d = CONSTRU[b.tipo]; if (d.chao && b.tipo !== 'arcoiris' || b.tipo === 'lago') if (visivel(b.x, b.y, 3)) desenharChao(g, b, tempo); }
  // lista ordenada
  const lista = [];
  for (const o of natureza) {
    if (!visivel(o.x, o.y, 1)) continue;
    const X = o.x * T + T / 2, Y = o.y * T + T * 0.86;
    if (o.tipo === 'arvore') {
      if (S.nat[o.k] > 9e14) continue;
      if (presente(o)) lista.push([Y, () => { const tr = o.treme && tempo - o.treme < 0.4 ? Math.sin(tempo * 60) * 2 : 0; desenharArvore(g, X + tr, Y, o.sub, tempo); }]);
      else lista.push([Y, () => desenharToco(g, X, Y)]);
    } else if (o.tipo === 'rocha') { if (presente(o)) lista.push([Y, () => desenharRocha(g, X, Y, o.k)]); }
    else if (o.tipo === 'palmeira') lista.push([Y, () => desenharPalmeira(g, X, Y, tempo, presente(o))]);
    else if (o.tipo === 'cristal') { if (presente(o)) lista.push([Y, () => desenharCristal(g, X, Y, tempo)]); }
    else if (o.tipo === 'concha') { if (presente(o)) lista.push([Y - 10, () => emoji(g, '🐚', X, Y - 8, 18)]); }
    else if (o.tipo === 'predio') lista.push([Y, () => desenharPredio(g, X, Y, o.sub, nt)]);
  }
  for (const b of S.constru) {
    const d = CONSTRU[b.tipo]; if (!visivel(b.x, b.y, 4)) continue;
    if (b.tipo === 'canteiro') { if (b.planta) lista.push([b.y * T + T * 0.7, () => desenharPlanta(g, b, tempo)]); continue; }
    if (d.chao && b.tipo !== 'arcoiris' || b.tipo === 'lago') continue;
    const fantasma = modoC && modoC.mover === b;
    lista.push([(b.y + d.h) * T - 2, () => { if (fantasma) g.globalAlpha = 0.35; desenharConstru(g, b, tempo, nt > 0.5); g.globalAlpha = 1; }]);
  }
  for (const a of S.animais) { if (a.id === S.montado) continue; if (!visivel(tileDe(a.x), tileDe(a.y), 1)) continue; lista.push([a.y, () => desenharAnimal(a, false)]); }
  for (const s of selvagens) { if (!visivel(tileDe(s.x), tileDe(s.y), 1)) continue; lista.push([s.y, () => desenharAnimal(s, true)]); }
  for (const id in NPCS) {
    const p = npcPos(id); if (!visivel(p.x, p.y, 1)) continue;
    const n = NPCS[id], X = p.x * T + T / 2, Y = p.y * T + T * 0.8;
    lista.push([Y, () => {
      const voo = n.fada ? -8 + Math.sin(tempo * 2) * 3 : 0;
      if (n.fada) { sombra(g, X, Y, 9, 3, 0.15); const gr = g.createRadialGradient(X, Y - 30 + voo, 4, X, Y - 30 + voo, 36); gr.addColorStop(0, 'rgba(255,220,255,.6)'); gr.addColorStop(1, 'rgba(255,220,255,0)'); g.fillStyle = gr; g.beginPath(); g.arc(X, Y - 30 + voo, 36, 0, 7); g.fill(); }
      desenharPessoa(g, X, Y + voo, n.look, { t: tempo + p.x, dir: P.x < X ? -1 : 1, fada: n.fada });
      if (n.ilha === S.fase && S.fase < FIM) { const pl = Math.abs(Math.sin(tempo * 3)) * 5; circ(g, X, Y - 72 - pl + voo, 10, '#ffcf3f'); g.fillStyle = '#5a3a00'; g.font = 'bold 15px "Baloo 2",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('!', X, Y - 71 - pl + voo); }
    }]);
  }
  for (const k in placas) { if (S.fase >= +k) continue; const p = placas[k]; if (!visivel(p.x, p.y, 1)) continue; lista.push([p.y * T + T * 0.8, () => desenharPlaca(g, p.x * T + T / 2, p.y * T + T * 0.8)]); }
  if (S.bau && !S.bau.pego && S.bau.dia === diaHoje() && visivel(S.bau.x, S.bau.y, 1)) lista.push([S.bau.y * T + T * 0.8, () => desenharBau(g, S.bau.x * T + T / 2, S.bau.y * T + T * 0.8, tempo)]);
  lista.push([P.y, desenharJogador]);
  lista.sort((a, b) => a[0] - b[0]);
  for (const [, fn] of lista) fn();
  // marca do toque
  if (marca && tempo - marca.t < 0.6) {
    const p = (tempo - marca.t) / 0.6;
    g.strokeStyle = `rgba(255,255,255,${1 - p})`; g.lineWidth = 2.5;
    g.beginPath(); g.ellipse(marca.x, marca.y + 6, 6 + p * 12, 3 + p * 6, 0, 0, 7); g.stroke();
  }
  // partículas
  for (const p of particulas) {
    const a = Math.min(1, p.vida / (p.max * 0.4));
    if (p.e) emoji(g, p.e, p.x, p.y, p.tam || 16, { alpha: a });
    else {
      g.globalAlpha = a; g.font = 'bold 15px "Baloo 2",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.lineWidth = 4; g.strokeStyle = '#fff'; g.strokeText(p.txt, p.x, p.y); g.fillStyle = p.cor; g.fillText(p.txt, p.x, p.y); g.globalAlpha = 1;
    }
  }
  // fantasma de construção
  if (modoC) {
    const d = CONSTRU[modoC.tipo];
    for (let y = 0; y < d.h; y++) for (let x = 0; x < d.w; x++) {
      g.fillStyle = modoC.erro ? 'rgba(255,70,90,.35)' : 'rgba(80,230,140,.35)';
      rrect(g, (modoC.x + x) * T + 2, (modoC.y + y) * T + 2, T - 4, T - 4, 8); g.fill();
    }
    const fake = { id: 0, tipo: modoC.tipo, x: modoC.x, y: modoC.y, cor: modoC.mover ? modoC.mover.cor : 0, vizinhos: {}, planta: null, frutaEm: Date.now() + 1e9 };
    g.globalAlpha = 0.75;
    if (d.chao && modoC.tipo !== 'arcoiris' || modoC.tipo === 'lago') desenharChao(g, fake, tempo); else desenharConstru(g, fake, tempo, false);
    g.globalAlpha = 1;
  }
  // noite
  if (nt > 0) {
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.fillStyle = `rgba(25,30,95,${nt * 0.42})`; g.fillRect(0, 0, tela.width, tela.height);
    g.setTransform(esc, 0, 0, esc, tela.width / 2 - cam.x * esc, tela.height / 2 - cam.y * esc);
    g.globalCompositeOperation = 'lighter';
    for (const b of S.constru) {
      if (!visivel(b.x, b.y, 4)) continue;
      const d = CONSTRU[b.tipo];
      if (b.tipo === 'poste' || d.casa) {
        const X = b.tipo === 'poste' ? b.x * T + T / 2 : (b.x + d.w / 2) * T, Y = b.tipo === 'poste' ? b.y * T - 22 : (b.y + d.h * 0.6) * T, r = b.tipo === 'poste' ? 70 : 50;
        const gr = g.createRadialGradient(X, Y, 2, X, Y, r); gr.addColorStop(0, `rgba(255,220,120,${0.5 * nt})`); gr.addColorStop(1, 'rgba(255,220,120,0)');
        g.fillStyle = gr; g.beginPath(); g.arc(X, Y, r, 0, 7); g.fill();
      }
    }
    for (let i = 0; i < 14; i++) {
      const X = cam.x + Math.sin(tempo * 0.21 + i * 7.3) * vw * 0.45, Y = cam.y + Math.cos(tempo * 0.17 + i * 3.1) * vh * 0.4;
      const a = (Math.sin(tempo * 3 + i) + 1) / 2 * nt;
      circ(g, X, Y, 2.2, `rgba(255,250,150,${a})`);
    }
    g.globalCompositeOperation = 'source-over';
  }
}
function desenharAnimal(a, selvagem) {
  const esp = ESPECIES[a.sp], vv = esp.v[a.v % esp.v.length];
  const tam = esp.tam * (a.bebe ? 0.6 : 1);
  const hop = a.mov ? Math.abs(Math.sin(tempo * 12 + a.x * 0.1)) * (esp.voa ? 4 : 2.5) : 0;
  if (esp.nada) { emoji(g, vv[0], a.x, a.y, tam, { flip: a.dir > 0, filtro: vv[1], rot: Math.sin(tempo * 5 + a.id) * 0.12 }); return; }
  sombra(g, a.x, a.y, tam * 0.36, tam * 0.12);
  if (esp.magico) { const gr = g.createRadialGradient(a.x, a.y - tam * 0.5, 2, a.x, a.y - tam * 0.5, tam); gr.addColorStop(0, 'rgba(255,230,255,.5)'); gr.addColorStop(1, 'rgba(255,230,255,0)'); g.fillStyle = gr; g.beginPath(); g.arc(a.x, a.y - tam * 0.5, tam, 0, 7); g.fill(); }
  emoji(g, vv[0], a.x, a.y - tam * 0.45 - hop, tam, { flip: a.dir > 0, filtro: vv[1] });
  const topo = a.y - tam - 12 - Math.sin(tempo * 3 + a.x) * 2;
  if (selvagem) {
    if (Math.sin(tempo * 0.9 + a.x) > 0.55) { circ(g, a.x + 10, topo, 10, 'rgba(255,255,255,.92)'); emoji(g, ITENS[esp.come[0]].e, a.x + 10, topo, 12); }
  } else if (prodPronto(a)) {
    circ(g, a.x, topo, 12, '#fff'); g.strokeStyle = '#ffcf3f'; g.lineWidth = 2; g.beginPath(); g.arc(a.x, topo, 12, 0, 7); g.stroke();
    emoji(g, ITENS[esp.prod] ? ITENS[esp.prod].e : '🎁', a.x, topo, 15);
  } else if (S.companheiro === a.id) emoji(g, '⭐', a.x + tam * 0.4, a.y - tam * 0.9, 10);
}
function desenharJogador() {
  const montaria = S.montado ? S.animais.find(a => a.id === S.montado) : null;
  if (montaria) {
    const esp = ESPECIES[montaria.sp], vv = esp.v[montaria.v % esp.v.length], tam = esp.tam * 1.15;
    const hop = P.andando ? Math.abs(Math.sin(tempo * 12)) * 3 : 0;
    sombra(g, P.x, P.y, tam * 0.42, tam * 0.14);
    emoji(g, vv[0], P.x, P.y - tam * 0.42 - hop, tam, { flip: P.dir > 0, filtro: vv[1] });
    desenharPessoa(g, P.x - P.dir * 2, P.y - tam * 0.52 - hop + 8, S.look, { t: tempo, andando: false, dir: P.dir, montada: true });
  } else desenharPessoa(g, P.x, P.y, S.look, { t: tempo, andando: P.andando, dir: P.dir });
}

// ---------- tela e toque ----------
function redimensionar() {
  DPR = Math.min(window.devicePixelRatio || 1, 3);
  LW = innerWidth; LH = innerHeight;
  tela.width = Math.round(LW * DPR); tela.height = Math.round(LH * DPR);
  ajustarResolucao();
}
function ajustarResolucao() {
  const rs = Math.max(1, Math.min(3, Math.round(DPR * zoom * 2) / 2));
  if (rs !== ESCALA_ARTE) { ESCALA_ARTE = rs; _emo.clear(); }
  const cr = Math.max(1, Math.min(2, Math.round(DPR * zoom * 2) / 2));
  if (cr !== chunkRes) { chunkRes = cr; limparChunks(); }
}
function mudarZoom(z) { zoom = Math.max(0.55, Math.min(2.2, z)); }
const dedos = new Map();
let gesto = null;
tela.addEventListener('pointerdown', e => {
  tela.setPointerCapture(e.pointerId);
  dedos.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (dedos.size === 1) gesto = { x: e.clientX, y: e.clientY, moveu: false, ox: cam.ox, oy: cam.oy, cx: cam.x, cy: cam.y };
  else if (dedos.size === 2) { const [a, b] = [...dedos.values()]; gesto = { pinca: true, d: Math.hypot(a.x - b.x, a.y - b.y), z: zoom, moveu: true }; }
});
tela.addEventListener('pointermove', e => {
  if (!dedos.has(e.pointerId) || !gesto) return;
  dedos.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (gesto.pinca && dedos.size >= 2) { const [a, b] = [...dedos.values()]; mudarZoom(gesto.z * Math.hypot(a.x - b.x, a.y - b.y) / Math.max(20, gesto.d)); return; }
  const dx = e.clientX - gesto.x, dy = e.clientY - gesto.y;
  if (!gesto.moveu && Math.hypot(dx, dy) > 10) gesto.moveu = true;
  if (gesto.moveu && !gesto.pinca) {
    cam.ox = gesto.ox - dx / zoom; cam.oy = gesto.oy - dy / zoom;
    cam.x = gesto.cx - dx / zoom; cam.y = gesto.cy - dy / zoom;
  }
});
function fimDedo(e) {
  if (!dedos.has(e.pointerId)) return;
  dedos.delete(e.pointerId);
  if (gesto && !gesto.moveu && !gesto.pinca && dedos.size === 0 && jogando) tocar(e.clientX, e.clientY);
  if (dedos.size === 0) { if (gesto && gesto.pinca) ajustarResolucao(); gesto = null; }
}
tela.addEventListener('pointerup', fimDedo);
tela.addEventListener('pointercancel', fimDedo);
tela.addEventListener('wheel', e => { e.preventDefault(); mudarZoom(zoom * (e.deltaY < 0 ? 1.1 : 0.9)); ajustarResolucao(); }, { passive: false });
addEventListener('resize', redimensionar);
addEventListener('beforeinstallprompt', e => { e.preventDefault(); promptInstalar = e; });
document.addEventListener('visibilitychange', () => { if (document.hidden) salvar(); });
addEventListener('pagehide', salvar);

// ---------- botões fixos ----------
$('zoomMais').onclick = () => { mudarZoom(zoom * 1.2); ajustarResolucao(); };
$('zoomMenos').onclick = () => { mudarZoom(zoom / 1.2); ajustarResolucao(); };
$('btnDescer').onclick = () => { desmontar(); };
$('pFechar').onclick = fecharPainel;
$('fundo').onclick = fecharPainel;
$('mcOk').onclick = confirmarConstrucao;
$('mcSair').onclick = sairModoConstruir;
$('dica').onclick = () => abrirMissoes();
$('btnPerfil').onclick = () => abrirCriador(false);
for (const b of document.querySelectorAll('#barra button')) b.onclick = () => {
  som('pop');
  ({ construir: () => abrirConstruir(), loja: () => abrirLoja(), mochila: abrirMochila, animais: () => abrirAnimais(), missoes: () => abrirMissoes(), mais: abrirMais })[b.dataset.p]();
};

// ---------- início ----------
let mundoPronto = false;
function iniciarJogo(novo) {
  if (!mundoPronto) { gerarMundo(); mundoPronto = true; }
  $('inicio').hidden = true;
  atualizarPontes(S.fase);
  recalcularBloqueio();
  P.x = S.px; P.y = S.py; P.caminho = []; P.rastro = [];
  soltarJogador();
  cam.x = P.x; cam.y = P.y - 20;
  selvagens = []; conferirSelvagens();
  for (const a of S.animais) if (a.id !== S.montado && a.id !== S.companheiro) { const b = construPorId(a.casa); if (!b) continue; const p = pontoCasa(b); if (Math.hypot(p.x - a.x, p.y - a.y) > T * 6) voltarParaCasa(a); }
  if (S.companheiro) { const a = S.animais.find(x => x.id === S.companheiro); if (a) { a.x = P.x - T * 0.6; a.y = P.y; } else S.companheiro = null; }
  if (S.montado && !S.animais.find(x => x.id === S.montado)) S.montado = null;
  $('btnDescer').hidden = !S.montado;
  desenharAvatar(); atualizarHud(); gerarDesafio(); atualizarDica();
  jogando = true;
  const hoje = diaHoje();
  const jaJogava = S.intro;
  if (!S.intro) {
    S.intro = true;
    festa({ ic: '🏝️', tit: 'Bem-vinda, ' + S.nome + '!', txt: 'Estas são as Ilhas da Luiza! Toque no chão para andar e toque nas coisas para usar. A Vovó Rosa está te esperando ali pertinho. Toque nela! 👵', ok: 'Vamos lá!', som: 'bebe' });
  }
  if (!S.vistoIlhasNovas && jaJogava) {
    S.vistoIlhasNovas = true;
    festa({ ic: '🗺️', tit: 'O mundo ficou maior!', txt: 'Apareceram ' + (ILHAS.length - 5) + ' ilhas novas: abelhas, pinguins, girafas, pandas, cangurus, golfinhos e até dragões! ' + (S.fase >= 5 ? 'Uma ponte nova já está aberta na Praia dos Coqueiros. Vá falar com a ' + NPCS[FASES[S.fase] ? FASES[S.fase].npc : 'estela'].nome + '!' : 'Elas ficam depois da Ilha Encantada. Continue a aventura para chegar lá!'), ok: 'Oba! 🎉' });
  }
  if (!jaJogava) S.vistoIlhasNovas = true;
  if (S.diaPresente !== hoje) {
    S.diaPresente = hoje;
    const moedas = 30 + 10 * S.nivel;
    S.moedas += moedas; addInv('racao', 2);
    const sem = sorteia(Object.keys(PLANTAS).filter(k => PLANTAS[k].nivel <= S.nivel)); addInv('s_' + sem, 3);
    festa({ ic: '🎁', tit: 'Presente do dia!', txt: 'Você ganhou ' + moedas + ' moedas, 2 rações e 3 sementes de ' + PLANTAS[sem].nome.toLowerCase() + '. Volte amanhã para ganhar mais! E procure o baú escondido de hoje 😉', som: 'moeda' });
    sortearBau();
  } else if (!S.bau || S.bau.dia !== hoje) sortearBau();
  hudSujo = true; salvar();
}
function sortearBau() {
  const hoje = diaHoje();
  for (let t = 0; t < 400; t++) {
    const il = ILHAS[Math.floor(Math.random() * (Math.min(S.fase, ILHAS.length - 1) + 1))];
    const x = Math.round(il.cx + (Math.random() * 2 - 1) * il.r * 0.85), y = Math.round(il.cy + (Math.random() * 2 - 1) * il.r * 0.85);
    if (!dentro(x, y)) continue; const i = idx(x, y);
    if (bloq[i] || ter[i] === 0 || ter[i] > 2 || natPorTile.has(i) || mapaConstru.has(i) || ilhaDe[i] > S.fase) continue;
    if (Math.hypot(x * T - P.x, y * T - P.y) < T * 5) continue;
    S.bau = { dia: hoje, x, y, pego: false }; return;
  }
}
let ult = performance.now();
function loop(agora) {
  const dt = Math.min(0.05, (agora - ult) / 1000); ult = agora;
  tempo += dt;
  if (jogando && S) { atualizar(dt); desenhar(); }
  requestAnimationFrame(loop);
}
function telaInicio() {
  const salvo = carregar();
  const bt = $('inicioBotoes'); bt.innerHTML = '';
  if (salvo) {
    bt.append(h('button', { class: 'btn grande verde', onclick: () => { S = salvo; som('pop'); iniciarJogo(false); } }, '▶ Continuar como ' + salvo.nome));
    bt.append(h('button', { class: 'btn cinza', onclick: () => { if (confirm('Começar um jogo novo? O jogo salvo será apagado.')) { $('inicio').hidden = true; abrirCriador(true); } } }, '✨ Jogo novo'));
  } else bt.append(h('button', { class: 'btn grande verde', onclick: () => { $('inicio').hidden = true; abrirCriador(true); } }, '✨ Começar'));
}
redimensionar();
zoom = Math.max(0.8, Math.min(1.5, LW / (9.5 * T)));
ajustarResolucao();
telaInicio();
requestAnimationFrame(loop);
