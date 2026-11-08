// ===== Ilhas da Luiza — dados do jogo =====
'use strict';
const TILE = 40;
const MAP_W = 96, MAP_H = 96;

const ILHAS = [
  { id: 0, nome: 'Campina do Sol', cx: 48, cy: 48, r: 13, grama: '#7fc65a', grama2: '#70b74d', areia: 0.10, arvores: 0.05, npc: 'rosa', arv: ['redonda', 'redonda', 'pinheiro'] },
  { id: 1, nome: 'Floresta Encantada', cx: 48, cy: 18, r: 12.5, grama: '#5ca94a', grama2: '#4f9a40', areia: 0.08, arvores: 0.20, rio: true, npc: 'tom', arv: ['pinheiro', 'redonda', 'pinheiro'] },
  { id: 2, nome: 'Praia dos Coqueiros', cx: 78, cy: 48, r: 12, grama: '#93d067', grama2: '#84c259', areia: 0.38, arvores: 0.04, palmeiras: true, npc: 'pedro', arv: ['redonda'] },
  { id: 3, nome: 'Vale dos Cavalos', cx: 48, cy: 78, r: 13, grama: '#a2cf5f', grama2: '#93c152', areia: 0.09, arvores: 0.035, rio: true, npc: 'ana', arv: ['redonda', 'pinheiro'] },
  { id: 4, nome: 'Ilha Encantada', cx: 17, cy: 48, r: 12, grama: '#c39be6', grama2: '#b48ad9', areia: 0.12, arvores: 0.07, magica: true, npc: 'lila', arv: ['rosa', 'rosa', 'azul'] },
];

// ---- Animais ----
// v: variações (emoji + filtro opcional)
const ESPECIES = {
  passarinho: { nome: 'Passarinho', v: [['🐦'], ['🐤'], ['🦜']], casa: 'ninho', come: ['milho', 'girassol'], preco: 40, nivel: 1, prod: 'pena', tProd: 50, tAmor: 40, tam: 22, voa: true },
  cachorro: { nome: 'Cachorro', v: [['🐕'], ['🐩'], ['🐕', 'sepia(0.8) brightness(0.8)']], casa: 'casinhaPet', come: ['racao'], preco: 60, nivel: 1, prod: 'presente', tProd: 120, tAmor: 60, tam: 30 },
  gato: { nome: 'Gato', v: [['🐈'], ['🐈‍⬛'], ['🐈', 'grayscale(1) brightness(1.3)']], casa: 'casinhaPet', come: ['racao', 'peixe'], preco: 60, nivel: 1, prod: 'presente', tProd: 120, tAmor: 60, tam: 28 },
  coelho: { nome: 'Coelho', v: [['🐇'], ['🐇', 'sepia(1) saturate(1.5) brightness(0.85)'], ['🐇', 'grayscale(1) brightness(0.7)']], casa: 'coelheira', come: ['cenoura', 'alface'], preco: 50, nivel: 2, prod: null, tAmor: 30, tam: 26 },
  galinha: { nome: 'Galinha', v: [['🐔'], ['🐓']], casa: 'galinheiro', come: ['milho', 'girassol'], preco: 50, nivel: 2, prod: 'ovo', tProd: 40, tAmor: 45, tam: 26 },
  vaca: { nome: 'Vaca', v: [['🐄'], ['🐄', 'sepia(1) saturate(2) brightness(0.8)']], casa: 'celeiro', come: ['milho', 'alface'], preco: 150, nivel: 4, prod: 'leite', tProd: 60, tAmor: 70, tam: 40 },
  ovelha: { nome: 'Ovelha', v: [['🐑'], ['🐑', 'brightness(0.75) sepia(0.6)']], casa: 'celeiro', come: ['alface', 'milho'], preco: 120, nivel: 4, prod: 'la', tProd: 90, tAmor: 60, tam: 34 },
  cavalo: { nome: 'Cavalo', v: [['🐎'], ['🐎', 'brightness(1.6) saturate(0.3)'], ['🐎', 'brightness(0.55)']], casa: 'estabulo', come: ['maca', 'cenoura'], preco: 250, nivel: 5, prod: null, tAmor: 80, tam: 40, monta: true },
  ponei: { nome: 'Pônei', v: [['🐎', 'hue-rotate(290deg) saturate(1.6) brightness(1.25)'], ['🐎', 'hue-rotate(170deg) saturate(1.3) brightness(1.3)'], ['🐎', 'hue-rotate(40deg) saturate(2) brightness(1.4)']], casa: 'estabulo', come: ['maca', 'cenoura', 'morango'], preco: 200, nivel: 5, prod: null, tAmor: 60, tam: 32, monta: true },
  peixe: { nome: 'Peixe', v: [['🐟'], ['🐠'], ['🐡']], casa: 'lago', come: ['racao'], preco: 20, nivel: 3, prod: null, tAmor: 40, tam: 20, nada: true },
  unicornio: { nome: 'Unicórnio', v: [['🦄'], ['🦄', 'hue-rotate(120deg) saturate(1.5)']], casa: 'estabulo', come: ['morango', 'maca'], preco: 0, nivel: 99, prod: 'cristal', tProd: 240, tAmor: 90, tam: 34, monta: true, magico: true },
};
const ORDEM_ALBUM = ['passarinho', 'cachorro', 'gato', 'coelho', 'galinha', 'vaca', 'ovelha', 'cavalo', 'ponei', 'peixe', 'unicornio'];

// Animais selvagens que aparecem em cada ilha (para fazer amizade)
const SELVAGENS = {
  0: [['passarinho', 3], ['gato', 1], ['coelho', 1]],
  1: [['coelho', 4], ['passarinho', 4], ['cachorro', 1]],
  2: [['gato', 2], ['passarinho', 2], ['cachorro', 1]],
  3: [['cavalo', 3], ['ponei', 2], ['ovelha', 2], ['vaca', 2], ['galinha', 2]],
  4: [['unicornio', 2], ['coelho', 2], ['passarinho', 3], ['ponei', 1]],
};

// ---- Plantas ----
const PLANTAS = {
  cenoura: { nome: 'Cenoura', e: '🥕', tempo: 30, semente: 4, venda: 9, xp: 4, nivel: 1 },
  alface: { nome: 'Alface', e: '🥬', tempo: 45, semente: 5, venda: 11, xp: 5, nivel: 1 },
  milho: { nome: 'Milho', e: '🌽', tempo: 60, semente: 7, venda: 15, xp: 6, nivel: 2 },
  girassol: { nome: 'Girassol', e: '🌻', tempo: 70, semente: 8, venda: 17, xp: 6, nivel: 2 },
  tomate: { nome: 'Tomate', e: '🍅', tempo: 90, semente: 10, venda: 22, xp: 8, nivel: 3 },
  batata: { nome: 'Batata', e: '🥔', tempo: 100, semente: 10, venda: 23, xp: 8, nivel: 3 },
  morango: { nome: 'Morango', e: '🍓', tempo: 120, semente: 14, venda: 30, xp: 10, nivel: 4 },
  abobora: { nome: 'Abóbora', e: '🎃', tempo: 180, semente: 20, venda: 45, xp: 14, nivel: 6 },
  melancia: { nome: 'Melancia', e: '🍉', tempo: 220, semente: 25, venda: 55, xp: 16, nivel: 7 },
};

// ---- Itens da mochila ----
const ITENS = {
  madeira: { nome: 'Madeira', e: '🪵', venda: 3 },
  pedra: { nome: 'Pedra', e: '🪨', venda: 3 },
  cristal: { nome: 'Cristal mágico', e: '💎', venda: 60 },
  racao: { nome: 'Ração', e: '🥣', venda: 1, preco: 3 },
  ovo: { nome: 'Ovo', e: '🥚', venda: 12 },
  leite: { nome: 'Leite', e: '🥛', venda: 22 },
  la: { nome: 'Lã', e: '🧶', venda: 26 },
  pena: { nome: 'Pena', e: '🪶', venda: 8 },
  presente: { nome: 'Presentinho', e: '🎁', venda: 15 },
  coco: { nome: 'Coco', e: '🥥', venda: 10 },
  concha: { nome: 'Concha', e: '🐚', venda: 8 },
  peixe: { nome: 'Peixe', e: '🐟', venda: 14, peixe: 0 },
  peixe2: { nome: 'Peixe tropical', e: '🐠', venda: 24, peixe: 1 },
  peixe3: { nome: 'Baiacu', e: '🐡', venda: 30, peixe: 2 },
  maca: { nome: 'Maçã', e: '🍎', venda: 10 },
  laranja: { nome: 'Laranja', e: '🍊', venda: 12 },
  banana: { nome: 'Banana', e: '🍌', venda: 14 },
  cereja: { nome: 'Cereja', e: '🍒', venda: 20 },
};
for (const k in PLANTAS) ITENS[k] = { nome: PLANTAS[k].nome, e: PLANTAS[k].e, venda: PLANTAS[k].venda };
for (const k in PLANTAS) ITENS['s_' + k] = { nome: 'Semente de ' + PLANTAS[k].nome.toLowerCase(), e: '🌱', semente: k, venda: 1 };

// ---- Construções ----
// chao: dá para andar por cima
const CONSTRU = {
  canteiro: { nome: 'Canteiro', ic: '🌱', w: 1, h: 1, custo: { moedas: 5 }, nivel: 1, cat: 'fazenda', chao: true, repete: true, desc: 'Para plantar frutas e verduras' },
  macieira: { nome: 'Macieira', ic: '🍎', w: 1, h: 1, custo: { moedas: 40 }, nivel: 2, cat: 'fazenda', fruta: 'maca', tempo: 120, desc: 'Dá maçãs sem parar' },
  laranjeira: { nome: 'Laranjeira', ic: '🍊', w: 1, h: 1, custo: { moedas: 60 }, nivel: 3, cat: 'fazenda', fruta: 'laranja', tempo: 150, desc: 'Dá laranjas' },
  bananeira: { nome: 'Bananeira', ic: '🍌', w: 1, h: 1, custo: { moedas: 80 }, nivel: 4, cat: 'fazenda', fruta: 'banana', tempo: 170, desc: 'Dá bananas' },
  cerejeira: { nome: 'Cerejeira', ic: '🍒', w: 1, h: 1, custo: { moedas: 120 }, nivel: 7, cat: 'fazenda', fruta: 'cereja', tempo: 200, desc: 'Árvore florida que dá cerejas' },

  casa1: { nome: 'Casinha', ic: '🏠', w: 2, h: 2, custo: { moedas: 60, madeira: 5 }, nivel: 1, cat: 'casas', casa: true, desc: 'Sua primeira casa!' },
  casa2: { nome: 'Casa de Campo', ic: '🏡', w: 3, h: 2, custo: { moedas: 250, madeira: 12, pedra: 6 }, nivel: 4, cat: 'casas', casa: true, desc: 'Casa grande com varanda' },
  casa3: { nome: 'Casarão', ic: '🏘️', w: 3, h: 3, custo: { moedas: 700, madeira: 25, pedra: 15 }, nivel: 8, cat: 'casas', casa: true, desc: 'Uma casa de dois andares' },
  castelo: { nome: 'Castelo', ic: '🏰', w: 4, h: 4, custo: { moedas: 2000, madeira: 40, pedra: 40, cristal: 5 }, nivel: 10, cat: 'casas', casa: true, desc: 'O castelo da princesa das ilhas' },

  casinhaPet: { nome: 'Casinha de Pet', ic: '🐶', w: 1, h: 1, custo: { moedas: 30, madeira: 2 }, nivel: 1, cat: 'animais', abriga: ['cachorro', 'gato'], vagas: 4, desc: 'Para 4 cachorros ou gatos' },
  ninho: { nome: 'Casinha de Passarinho', ic: '🐦', w: 1, h: 1, custo: { moedas: 25, madeira: 2 }, nivel: 1, cat: 'animais', abriga: ['passarinho'], vagas: 4, desc: 'Para 4 passarinhos' },
  coelheira: { nome: 'Coelheira', ic: '🐰', w: 2, h: 1, custo: { moedas: 60, madeira: 4 }, nivel: 2, cat: 'animais', abriga: ['coelho'], vagas: 4, desc: 'Para 4 coelhos' },
  galinheiro: { nome: 'Galinheiro', ic: '🐔', w: 2, h: 2, custo: { moedas: 80, madeira: 5 }, nivel: 2, cat: 'animais', abriga: ['galinha'], vagas: 5, desc: 'Para 5 galinhas' },
  lago: { nome: 'Lago', ic: '🐟', w: 2, h: 2, custo: { moedas: 100, pedra: 6 }, nivel: 3, cat: 'animais', abriga: ['peixe'], vagas: 6, desc: 'Para 6 peixes' },
  celeiro: { nome: 'Celeiro', ic: '🐄', w: 3, h: 2, custo: { moedas: 180, madeira: 10, pedra: 4 }, nivel: 4, cat: 'animais', abriga: ['vaca', 'ovelha'], vagas: 4, desc: 'Para 4 vacas ou ovelhas' },
  estabulo: { nome: 'Estábulo', ic: '🐴', w: 3, h: 2, custo: { moedas: 220, madeira: 10, pedra: 6 }, nivel: 5, cat: 'animais', abriga: ['cavalo', 'ponei', 'unicornio'], vagas: 4, desc: 'Para cavalos, pôneis e unicórnios' },

  flores: { nome: 'Flores', ic: '🌷', w: 1, h: 1, custo: { moedas: 5 }, nivel: 1, cat: 'enfeites', chao: true, repete: true, desc: 'Deixa tudo mais bonito' },
  caminho: { nome: 'Caminho de Pedra', ic: '🪨', w: 1, h: 1, custo: { moedas: 2, pedra: 1 }, nivel: 1, cat: 'enfeites', chao: true, repete: true, desc: 'Um caminho para passear' },
  cerca: { nome: 'Cerca', ic: '🪵', w: 1, h: 1, custo: { moedas: 3, madeira: 1 }, nivel: 1, cat: 'enfeites', repete: true, desc: 'Cerca de madeira' },
  banco: { nome: 'Banco', ic: '🪑', w: 1, h: 1, custo: { moedas: 15, madeira: 2 }, nivel: 2, cat: 'enfeites', desc: 'Para sentar e descansar' },
  poste: { nome: 'Poste de Luz', ic: '💡', w: 1, h: 1, custo: { moedas: 25, pedra: 1 }, nivel: 3, cat: 'enfeites', desc: 'Acende à noite' },
  balanco: { nome: 'Balanço', ic: '🎠', w: 1, h: 1, custo: { moedas: 40, madeira: 4 }, nivel: 3, cat: 'enfeites', desc: 'Um balanço no jardim' },
  fonte: { nome: 'Fonte', ic: '⛲', w: 2, h: 2, custo: { moedas: 150, pedra: 10 }, nivel: 6, cat: 'enfeites', desc: 'Fonte de água' },
  arcoiris: { nome: 'Arco-íris', ic: '🌈', w: 2, h: 1, custo: { moedas: 300, cristal: 1 }, nivel: 9, cat: 'enfeites', chao: true, desc: 'Um arco-íris mágico' },
};
const CATS_CONSTRU = [['casas', '🏠 Casas'], ['fazenda', '🌱 Fazenda'], ['animais', '🐾 Bichos'], ['enfeites', '🌷 Enfeites']];

const CORES_PAREDE = ['#ffd6e7', '#e3d4ff', '#fff1b8', '#cfeaff', '#ffffff', '#d4f5d0', '#ffd9b8'];
const CORES_TELHADO = ['#e25a6b', '#7b6cf0', '#3fa7d6', '#58b368', '#f08c3a', '#c95fd0'];

// ---- Visual do personagem ----
const PELES = ['#ffe0c8', '#f6cba5', '#e8b08a', '#c98d62', '#9c643f', '#6b4128'];
const CABELOS = [['longo', 'Longo'], ['cacheado', 'Cacheado'], ['rabo', 'Rabo de cavalo'], ['trancas', 'Tranças'], ['coque', 'Coque'], ['curto', 'Curtinho']];
const CORES_CABELO = ['#2b1a12', '#5b3420', '#8a5a2b', '#d9a441', '#f3d47a', '#c2452d', '#ff7eb6', '#9b6cff', '#5ab0ff'];
const CORES_OLHOS = ['#5b3a1e', '#2d6a3e', '#2f6fc0', '#3a2a1a', '#8a6a3a', '#7a4fc9'];
const ROUPAS = [['vestido', 'Vestido'], ['camiseta', 'Camiseta e short'], ['macacao', 'Macacão'], ['saia', 'Blusa e saia']];
const CORES_ROUPA = ['#ff6fa5', '#b77cff', '#4fb3ff', '#ffcf3f', '#4fd18b', '#ff8a4c', '#ffffff', '#e8364f'];
const ACESSORIOS = {
  nada: { nome: 'Nada', ic: '🙂', preco: 0 },
  laco: { nome: 'Laço', ic: '🎀', preco: 0 },
  oculos: { nome: 'Óculos', ic: '👓', preco: 0 },
  chapeu: { nome: 'Chapéu de Palha', ic: '👒', preco: 40 },
  flores: { nome: 'Coroa de Flores', ic: '🌸', preco: 60 },
  orelhas: { nome: 'Orelhinhas de Gato', ic: '🐱', preco: 80 },
  tiara: { nome: 'Tiara de Brilho', ic: '✨', preco: 120, nivel: 3 },
  asas: { nome: 'Asas de Fada', ic: '🧚', preco: 300, nivel: 6 },
  coroa: { nome: 'Coroa de Rainha', ic: '👑', preco: 0, premio: true },
};

// ---- Amigos (personagens das ilhas) ----
const NPCS = {
  rosa: { nome: 'Vovó Rosa', ilha: 0, dx: 3, dy: -2, look: { pele: '#f6cba5', cabelo: 'coque', corCabelo: '#e6e6e6', olhos: '#5b3a1e', roupa: 'vestido', corRoupa: '#7bc4a5', acc: 'oculos' } },
  tom: { nome: 'Guarda Tom', ilha: 1, dx: 1, dy: 5, look: { pele: '#c98d62', cabelo: 'curto', corCabelo: '#2b1a12', olhos: '#3a2a1a', roupa: 'macacao', corRoupa: '#5d8f3a', acc: 'chapeu' } },
  pedro: { nome: 'Pescador Pedro', ilha: 2, dx: -4, dy: 2, look: { pele: '#e8b08a', cabelo: 'curto', corCabelo: '#8a5a2b', olhos: '#2f6fc0', roupa: 'camiseta', corRoupa: '#3f7fd6', acc: 'chapeu' } },
  ana: { nome: 'Fazendeira Ana', ilha: 3, dx: 2, dy: -4, look: { pele: '#9c643f', cabelo: 'trancas', corCabelo: '#2b1a12', olhos: '#5b3a1e', roupa: 'macacao', corRoupa: '#c9503a', acc: 'chapeu' } },
  lila: { nome: 'Fada Lila', ilha: 4, dx: 3, dy: 1, look: { pele: '#ffe0c8', cabelo: 'longo', corCabelo: '#ff7eb6', olhos: '#7a4fc9', roupa: 'vestido', corRoupa: '#b77cff', acc: 'asas' }, fada: true },
};

// ---- Fases e missões ----
// cond(s) devolve [feito, meta]
const FASES = [
  {
    npc: 'rosa', premio: 150,
    fala: 'Olá, {n}! Que bom que você chegou na Campina do Sol! A ponte para a Floresta está quebrada... Me ajude e eu conserto ela para você!',
    missoes: [
      { t: 'Junte 5 madeiras cortando árvores', ic: '🪵', dica: 'Toque numa árvore para cortar.', c: s => [s.st.madeira || 0, 5] },
      { t: 'Construa uma Casinha', ic: '🏠', dica: 'Toque em 🔨 Construir.', c: s => [contaConstru(s, 'casa1') + contaConstru(s, 'casa2') + contaConstru(s, 'casa3') + contaConstru(s, 'castelo'), 1] },
      { t: 'Faça um canteiro e colha 3 cenouras', ic: '🥕', dica: 'Construa um Canteiro e toque nele para plantar.', c: s => [(s.st.colheu && s.st.colheu.cenoura) || 0, 3] },
      { t: 'Tenha um cachorro ou um gato', ic: '🐶', dica: 'Construa uma Casinha de Pet e compre na 🛒 Loja (ou faça amizade com o gatinho da ilha).', c: s => [contaAnimais(s, 'cachorro') + contaAnimais(s, 'gato'), 1] },
    ],
  },
  {
    npc: 'tom', premio: 250,
    fala: 'Bem-vinda à Floresta Encantada! Aqui moram muitos coelhinhos e passarinhos. Vamos cuidar deles juntos?',
    missoes: [
      { t: 'Faça amizade com um coelho', ic: '🐇', dica: 'Construa uma Coelheira, plante cenouras e toque num coelho selvagem.', c: s => [(s.st.amizade && s.st.amizade.coelho) || 0, 1] },
      { t: 'Junte 8 pedras', ic: '🪨', dica: 'Toque nas pedras cinzas.', c: s => [s.st.pedra || 0, 8] },
      { t: 'Tenha 2 passarinhos', ic: '🐦', dica: 'Construa uma Casinha de Passarinho.', c: s => [contaAnimais(s, 'passarinho'), 2] },
      { t: 'Colha 5 alfaces', ic: '🥬', dica: 'Plante alface num canteiro.', c: s => [(s.st.colheu && s.st.colheu.alface) || 0, 5] },
    ],
  },
  {
    npc: 'pedro', premio: 400,
    fala: 'Ahoy! Aqui na Praia dos Coqueiros o mar está cheio de peixes. Pegue sua vara de pescar!',
    missoes: [
      { t: 'Pesque 5 peixes', ic: '🎣', dica: 'Toque na água perto da margem.', c: s => [s.st.pescou || 0, 5] },
      { t: 'Pegue 3 cocos', ic: '🥥', dica: 'Toque nos coqueiros da praia.', c: s => [s.st.coco || 0, 3] },
      { t: 'Tenha 2 peixes no seu lago', ic: '🐟', dica: 'Construa um Lago e solte peixes nele.', c: s => [contaAnimais(s, 'peixe'), 2] },
      { t: 'Veja nascer um bebê', ic: '🍼', dica: 'Dê comida para 2 animais iguais e eles terão um filhote!', c: s => [s.st.nasceu || 0, 1] },
    ],
  },
  {
    npc: 'ana', premio: 600,
    fala: 'Oi, {n}! O Vale dos Cavalos é o lugar mais bonito para cavalgar. Vamos montar uma fazenda de verdade!',
    missoes: [
      { t: 'Faça amizade com um cavalo ou pônei', ic: '🐴', dica: 'Construa um Estábulo e leve maçã ou cenoura.', c: s => [((s.st.amizade && s.st.amizade.cavalo) || 0) + ((s.st.amizade && s.st.amizade.ponei) || 0), 1] },
      { t: 'Tenha 2 vacas', ic: '🐄', dica: 'Construa um Celeiro.', c: s => [contaAnimais(s, 'vaca'), 2] },
      { t: 'Colete 3 leites', ic: '🥛', dica: 'Dê comida para a vaca e espere o leite.', c: s => [(s.st.prod && s.st.prod.leite) || 0, 3] },
      { t: 'Passeie a cavalo', ic: '🏇', dica: 'Toque no seu cavalo e escolha Montar.', c: s => [s.st.montou || 0, 1] },
    ],
  },
  {
    npc: 'lila', premio: 2000,
    fala: 'Olá, pequena aventureira! Esta é a Ilha Encantada. Dizem que unicórnios vivem aqui... e que só uma rainha pode construir o Castelo!',
    missoes: [
      { t: 'Encontre 5 cristais mágicos', ic: '💎', dica: 'Procure os brilhos pela ilha.', c: s => [s.st.cristal || 0, 5] },
      { t: 'Faça amizade com um unicórnio', ic: '🦄', dica: 'Unicórnios adoram morangos!', c: s => [(s.st.amizade && s.st.amizade.unicornio) || 0, 1] },
      { t: 'Veja nascer 5 bebês', ic: '👶', dica: 'Cuide bem dos seus animais.', c: s => [s.st.nasceu || 0, 5] },
      { t: 'Construa o Castelo', ic: '🏰', dica: 'Precisa do nível 10.', c: s => [contaConstru(s, 'castelo'), 1] },
    ],
  },
];

const TROFEUS = [
  { id: 'colheita', ic: '🥕', t: 'Primeira colheita', c: s => (s.st.colheuTotal || 0) >= 1 },
  { id: 'bicho', ic: '🐾', t: 'Primeiro animal', c: s => s.animais.length >= 1 },
  { id: 'bebe', ic: '🍼', t: 'Primeiro bebê', c: s => (s.st.nasceu || 0) >= 1 },
  { id: 'fazendinha', ic: '🏡', t: '10 animais', c: s => s.animais.length >= 10 },
  { id: 'mamae', ic: '💕', t: '10 bebês nascidos', c: s => (s.st.nasceu || 0) >= 10 },
  { id: 'pescadora', ic: '🎣', t: 'Pescadora: 15 peixes', c: s => (s.st.pescou || 0) >= 15 },
  { id: 'construtora', ic: '🔨', t: 'Construtora: 15 construções', c: s => (s.st.construiu || 0) >= 15 },
  { id: 'rica', ic: '💰', t: 'Juntar 1000 moedas', c: s => s.moedas >= 1000 },
  { id: 'n5', ic: '⭐', t: 'Nível 5', c: s => s.nivel >= 5 },
  { id: 'n10', ic: '🌟', t: 'Nível 10', c: s => s.nivel >= 10 },
  { id: 'amazona', ic: '🏇', t: 'Amazona: montar a cavalo', c: s => (s.st.montou || 0) >= 1 },
  { id: 'cristais', ic: '💎', t: 'Achar todos os cristais', c: s => (s.st.cristal || 0) >= 8 },
  { id: 'album', ic: '📖', t: 'Álbum completo', c: s => ORDEM_ALBUM.every(e => s.album.includes(e)) },
  { id: 'rainha', ic: '👑', t: 'Rainha das Ilhas', c: s => s.fase >= 5 },
];

const NOMES_BICHOS = ['Pipoca', 'Floquinho', 'Mel', 'Biscoito', 'Fofinho', 'Estrela', 'Luna', 'Bolinha', 'Pingo', 'Nina', 'Thor', 'Amora', 'Caramelo', 'Paçoca', 'Jujuba', 'Pérola', 'Algodão', 'Brisa', 'Cacau', 'Lili', 'Tico', 'Bento', 'Mimi', 'Sol', 'Lua', 'Docinho', 'Princesa', 'Faísca', 'Nuvem', 'Pudim', 'Bombom', 'Chiclete', 'Lulu', 'Kiwi', 'Manchinha', 'Trovão', 'Safira', 'Rubi', 'Dengo', 'Sorvete'];

const DESAFIOS = [
  { k: 'colheuTotal', t: 'Colha {n} plantas', ic: '🧺', n: [5, 8, 12] },
  { k: 'alimentou', t: 'Dê comida {n} vezes', ic: '🥣', n: [4, 6, 10] },
  { k: 'pescou', t: 'Pesque {n} peixes', ic: '🎣', n: [2, 4, 6] },
  { k: 'madeira', t: 'Junte {n} madeiras', ic: '🪵', n: [5, 8, 12] },
  { k: 'pedra', t: 'Junte {n} pedras', ic: '🪨', n: [4, 6, 10] },
  { k: 'coletou', t: 'Colete {n} produtos dos animais', ic: '🥚', n: [3, 5, 8] },
  { k: 'carinho', t: 'Faça {n} carinhos nos bichinhos', ic: '❤️', n: [5, 8, 12] },
];

function contaConstru(s, tipo) { let n = 0; for (const b of s.constru) if (b.tipo === tipo) n++; return n; }
function contaAnimais(s, sp) { let n = 0; for (const a of s.animais) if (a.sp === sp) n++; return n; }
function xpProximo(nv) { return 30 + nv * 25; }
