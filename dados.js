// ===== Ilhas da Luiza — dados do jogo =====
'use strict';
const TILE = 40;
// As 5 primeiras ilhas ficam onde sempre estiveram (o progresso salvo depende disso).
// As novas ficam a leste e ao sul, ligadas em sequência por pontes (de = ilha de onde sai a ponte).
const MAP_W = 200, MAP_H = 168;

const ILHAS = [
  { id: 0, nome: 'Campina do Sol', cx: 48, cy: 48, r: 13, grama: '#7fc65a', grama2: '#70b74d', areia: 0.10, arvores: 0.05, npc: 'rosa', arv: ['redonda', 'redonda', 'pinheiro'] },
  { id: 1, nome: 'Floresta Encantada', cx: 48, cy: 18, r: 12.5, grama: '#5ca94a', grama2: '#4f9a40', areia: 0.08, arvores: 0.20, rio: true, npc: 'tom', arv: ['pinheiro', 'redonda', 'pinheiro'] },
  { id: 2, nome: 'Praia dos Coqueiros', cx: 78, cy: 48, r: 12, grama: '#93d067', grama2: '#84c259', areia: 0.38, arvores: 0.04, palmeiras: true, npc: 'pedro', arv: ['redonda'] },
  { id: 3, nome: 'Vale dos Cavalos', cx: 48, cy: 78, r: 13, grama: '#a2cf5f', grama2: '#93c152', areia: 0.09, arvores: 0.035, rio: true, npc: 'ana', arv: ['redonda', 'pinheiro'] },
  { id: 4, nome: 'Ilha Encantada', cx: 17, cy: 48, r: 12, grama: '#c39be6', grama2: '#b48ad9', areia: 0.12, arvores: 0.07, magica: true, npc: 'lila', arv: ['rosa', 'rosa', 'azul'], areiaCor: ['#e7c3dc', '#f6dcee'] },
  // ---- ilhas novas ----
  { id: 5, de: 2, nome: 'Jardim das Abelhas', cx: 116, cy: 50, r: 12, grama: '#8fd65f', grama2: '#80c853', areia: 0.10, arvores: 0.04, npc: 'mel', arv: ['frutas', 'redonda', 'cereja'], flores: ['#ffe36a', '#ff8fb8', '#ffffff', '#ffb13d', '#c9a7ff'], muitasFlores: true },
  { id: 6, de: 5, nome: 'Pomar Dourado', cx: 116, cy: 18, r: 12, grama: '#a8d45a', grama2: '#9bc64e', areia: 0.08, arvores: 0.09, npc: 'joaquim', arv: ['dourada', 'frutas', 'dourada'] },
  { id: 7, de: 6, nome: 'Vila dos Pescadores', cx: 148, cy: 18, r: 12, grama: '#9fd56c', grama2: '#90c75f', areia: 0.34, arvores: 0.02, palmeiras: true, cidade: true, npc: 'marina', arv: ['redonda'] },
  { id: 8, de: 7, nome: 'Lagoa dos Cisnes', cx: 180, cy: 18, r: 12, grama: '#78c96a', grama2: '#6abb5d', areia: 0.10, arvores: 0.06, rio: true, npc: 'bia', arv: ['salgueiro', 'redonda'] },
  { id: 9, de: 8, nome: 'Bosque das Raposas', cx: 180, cy: 50, r: 12.5, grama: '#b9b35a', grama2: '#aaa54f', areia: 0.08, arvores: 0.16, npc: 'caio', arv: ['outono', 'outono', 'pinheiro', 'dourada'], flores: ['#ff9a3d', '#ffd23f', '#d9541a'] },
  { id: 10, de: 9, nome: 'Fazenda Feliz', cx: 148, cy: 50, r: 13, grama: '#98d35b', grama2: '#89c54f', areia: 0.08, arvores: 0.03, rio: true, npc: 'ze', arv: ['redonda', 'frutas'] },
  { id: 11, de: 10, nome: 'Montanha Nevada', cx: 148, cy: 82, r: 12.5, grama: '#eef4fb', grama2: '#e1eaf5', areia: 0.10, arvores: 0.10, npc: 'nina', arv: ['neve', 'neve', 'neve', 'pinheiro'], areiaCor: ['#c4d2e2', '#dce7f2'], flores: ['#ffffff', '#cfe8ff'], rochas: 0.05 },
  { id: 12, de: 11, nome: 'Vale das Lhamas', cx: 116, cy: 82, r: 12.5, grama: '#b5cf6a', grama2: '#a7c15e', areia: 0.08, arvores: 0.03, rio: true, npc: 'inti', arv: ['pinheiro', 'redonda'], rochas: 0.05 },
  { id: 13, de: 12, nome: 'Deserto Dourado', cx: 116, cy: 114, r: 12.5, grama: '#ecd08a', grama2: '#e2c47c', areia: 0.20, arvores: 0.05, npc: 'omar', arv: ['cacto', 'cacto', 'cacto'], areiaCor: ['#e0b664', '#f2d18a'], palmeiras: true, flores: ['#ff6f91', '#ffd23f'] },
  { id: 14, de: 13, nome: 'Savana Africana', cx: 148, cy: 114, r: 13, grama: '#cfc364', grama2: '#c2b657', areia: 0.08, arvores: 0.04, npc: 'zuri', arv: ['acacia', 'acacia', 'redonda'], flores: ['#ffd23f', '#ff9a3d'] },
  { id: 15, de: 14, nome: 'Selva Tropical', cx: 180, cy: 114, r: 12.5, grama: '#3f9a42', grama2: '#358c39', areia: 0.10, arvores: 0.22, rio: true, palmeiras: true, npc: 'julia', arv: ['selva', 'selva', 'pinheiro'], flores: ['#ff3d6e', '#ffd23f', '#ff8a3d', '#ffffff'] },
  { id: 16, de: 15, nome: 'Bosque de Bambu', cx: 180, cy: 146, r: 12, grama: '#93cf6a', grama2: '#84c15d', areia: 0.08, arvores: 0.14, npc: 'li', arv: ['bambu', 'bambu', 'cereja'], flores: ['#ffc4dd', '#ffffff'] },
  { id: 17, de: 16, nome: 'Ilha dos Cangurus', cx: 148, cy: 146, r: 12.5, grama: '#b6c95c', grama2: '#a8bb50', areia: 0.30, arvores: 0.05, palmeiras: true, npc: 'kai', arv: ['eucalipto', 'eucalipto', 'acacia'], areiaCor: ['#e8b77a', '#f6d39e'] },
  { id: 18, de: 17, nome: 'Ilha dos Golfinhos', cx: 116, cy: 146, r: 11.5, grama: '#8ed27c', grama2: '#80c46f', areia: 0.42, arvores: 0.02, palmeiras: true, npc: 'iara', arv: ['redonda'] },
  { id: 19, de: 18, nome: 'Cidade das Flores', cx: 82, cy: 146, r: 13, grama: '#9cdb7a', grama2: '#8ecd6d', areia: 0.08, arvores: 0.02, cidade: true, npc: 'sofia', arv: ['cereja', 'redonda', 'rosa'], flores: ['#ff8fb8', '#ffe36a', '#c9a7ff', '#ff5c5c', '#ffffff'], muitasFlores: true },
  { id: 20, de: 19, nome: 'Ilha do Arco-Íris', cx: 82, cy: 114, r: 12.5, grama: '#b8eccf', grama2: '#a6e0c0', areia: 0.10, arvores: 0.06, magica: true, cristais: 4, npc: 'luna', arv: ['rosa', 'azul', 'cereja', 'dourada'], areiaCor: ['#f2d0e8', '#fde6f4'], flores: ['#ff5a5a', '#ff9f3f', '#ffe04a', '#5fd35f', '#4fa8ff', '#9b6cff'], muitasFlores: true },
  { id: 21, de: 20, nome: 'Ilha da Doceria', cx: 50, cy: 114, r: 12, grama: '#ffc8e2', grama2: '#ffb9da', areia: 0.10, arvores: 0.07, npc: 'cora', arv: ['doce', 'doce', 'rosa'], areiaCor: ['#e8c49a', '#f7dcb8'], flores: ['#ffffff', '#ff5c8a', '#7fe3ff', '#ffe36a'] },
  { id: 22, de: 21, nome: 'Ilha dos Piratas', cx: 18, cy: 114, r: 12, grama: '#86c75a', grama2: '#78b94e', areia: 0.40, arvores: 0.03, palmeiras: true, npc: 'barba', arv: ['selva'] },
  { id: 23, de: 22, nome: 'Reino dos Dragões', cx: 18, cy: 146, r: 12.5, grama: '#8f86b8', grama2: '#8279ab', areia: 0.10, arvores: 0.07, magica: true, cristais: 4, npc: 'arturo', arv: ['azul', 'pinheiro', 'rosa'], areiaCor: ['#5e5874', '#7a7392'], flores: ['#ff7a3d', '#ffd23f', '#b07cff'], rochas: 0.06 },
  { id: 24, de: 23, nome: 'Ilha das Estrelas', cx: 50, cy: 146, r: 12, grama: '#5b5fb0', grama2: '#5054a3', areia: 0.10, arvores: 0.05, magica: true, cristais: 4, npc: 'estela', arv: ['azul', 'rosa', 'azul'], areiaCor: ['#c9c2ec', '#e2ddfa'], flores: ['#fff7a8', '#ffffff', '#ffd23f'] },
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
  // ---- bichos novos ----
  abelha: { nome: 'Abelha', v: [['🐝']], casa: 'colmeia', come: ['girassol'], preco: 30, nivel: 2, prod: 'mel', tProd: 60, tAmor: 35, tam: 16, voa: true },
  borboleta: { nome: 'Borboleta', v: [['🦋'], ['🦋', 'hue-rotate(110deg) saturate(1.4)'], ['🦋', 'hue-rotate(250deg) saturate(1.6)']], casa: 'viveiro', come: ['girassol', 'morango'], preco: 40, nivel: 3, prod: null, tAmor: 30, tam: 18, voa: true },
  pato: { nome: 'Pato', v: [['🦆']], casa: 'lago', come: ['milho', 'alface'], preco: 45, nivel: 3, prod: 'ovo', tProd: 60, tAmor: 45, tam: 24, nada: true },
  cisne: { nome: 'Cisne', v: [['🦢']], casa: 'lago', come: ['alface', 'milho'], preco: 140, nivel: 6, prod: 'pena', tProd: 90, tAmor: 60, tam: 30, nada: true },
  tartaruga: { nome: 'Tartaruga', v: [['🐢'], ['🐢', 'hue-rotate(60deg) saturate(1.3)']], casa: 'lago', come: ['alface', 'morango'], preco: 70, nivel: 4, prod: null, tAmor: 50, tam: 24, nada: true },
  pinguim: { nome: 'Pinguim', v: [['🐧']], casa: 'lago', come: ['peixe', 'racao'], preco: 160, nivel: 6, prod: null, tAmor: 55, tam: 26, nada: true },
  golfinho: { nome: 'Golfinho', v: [['🐬'], ['🐬', 'hue-rotate(160deg) saturate(1.3) brightness(1.2)']], casa: 'lago', come: ['peixe', 'peixe2'], preco: 400, nivel: 9, prod: 'concha', tProd: 90, tAmor: 70, tam: 30, nada: true },
  porco: { nome: 'Porquinho', v: [['🐖'], ['🐷']], casa: 'chiqueiro', come: ['batata', 'milho', 'abobora'], preco: 90, nivel: 3, prod: null, tAmor: 45, tam: 30 },
  cabra: { nome: 'Cabra', v: [['🐐']], casa: 'celeiro', come: ['alface', 'milho'], preco: 110, nivel: 4, prod: 'leite', tProd: 70, tAmor: 55, tam: 32 },
  lhama: { nome: 'Lhama', v: [['🦙'], ['🦙', 'brightness(1.3) saturate(0.4)'], ['🦙', 'sepia(1) saturate(1.6) brightness(0.8)']], casa: 'celeiro', come: ['alface', 'batata'], preco: 170, nivel: 6, prod: 'la', tProd: 90, tAmor: 60, tam: 36 },
  esquilo: { nome: 'Esquilo', v: [['🐿️']], casa: 'toca', come: ['girassol', 'maca'], preco: 50, nivel: 4, prod: 'castanha', tProd: 70, tAmor: 40, tam: 20 },
  raposa: { nome: 'Raposa', v: [['🦊'], ['🦊', 'grayscale(1) brightness(1.4)']], casa: 'toca', come: ['racao', 'maca'], preco: 130, nivel: 5, prod: null, tAmor: 55, tam: 28 },
  ourico: { nome: 'Ouriço', v: [['🦔']], casa: 'toca', come: ['maca', 'morango'], preco: 70, nivel: 4, prod: null, tAmor: 40, tam: 20 },
  coruja: { nome: 'Coruja', v: [['🦉'], ['🦉', 'grayscale(1) brightness(1.5)']], casa: 'viveiro', come: ['racao', 'girassol'], preco: 120, nivel: 5, prod: 'pena', tProd: 100, tAmor: 50, tam: 24, voa: true },
  pavao: { nome: 'Pavão', v: [['🦚']], casa: 'viveiro', come: ['milho', 'girassol'], preco: 220, nivel: 7, prod: 'pena', tProd: 80, tAmor: 60, tam: 32 },
  urso: { nome: 'Urso', v: [['🐻'], ['🐻', 'grayscale(1) brightness(1.6)']], casa: 'caverna', come: ['mel', 'peixe', 'maca'], preco: 320, nivel: 7, prod: null, tAmor: 75, tam: 38 },
  panda: { nome: 'Panda', v: [['🐼']], casa: 'casaArvore', come: ['bambu'], preco: 350, nivel: 7, prod: null, tAmor: 70, tam: 34 },
  coala: { nome: 'Coala', v: [['🐨']], casa: 'casaArvore', come: ['bambu', 'alface'], preco: 260, nivel: 7, prod: null, tAmor: 60, tam: 28 },
  macaco: { nome: 'Macaco', v: [['🐒'], ['🐵']], casa: 'casaArvore', come: ['banana', 'abacaxi'], preco: 150, nivel: 6, prod: 'presente', tProd: 110, tAmor: 50, tam: 28 },
  camelo: { nome: 'Camelo', v: [['🐫'], ['🐪']], casa: 'savana', come: ['melancia', 'milho'], preco: 300, nivel: 8, prod: 'leite', tProd: 100, tAmor: 70, tam: 42, monta: true },
  girafa: { nome: 'Girafa', v: [['🦒']], casa: 'savana', come: ['maca', 'alface'], preco: 380, nivel: 8, prod: null, tAmor: 75, tam: 48 },
  zebra: { nome: 'Zebra', v: [['🦓']], casa: 'savana', come: ['milho', 'alface'], preco: 280, nivel: 8, prod: null, tAmor: 65, tam: 40, monta: true },
  elefante: { nome: 'Elefante', v: [['🐘'], ['🐘', 'sepia(0.5) hue-rotate(290deg) saturate(2) brightness(1.3)']], casa: 'savana', come: ['banana', 'melancia'], preco: 450, nivel: 9, prod: null, tAmor: 80, tam: 48, monta: true },
  leao: { nome: 'Leão', v: [['🦁']], casa: 'savana', come: ['racao', 'peixe'], preco: 500, nivel: 9, prod: null, tAmor: 80, tam: 40 },
  canguru: { nome: 'Canguru', v: [['🦘']], casa: 'savana', come: ['cenoura', 'alface'], preco: 260, nivel: 8, prod: null, tAmor: 60, tam: 38 },
  dragao: { nome: 'Dragão', v: [['🐉'], ['🐉', 'hue-rotate(200deg) saturate(1.4)'], ['🐉', 'hue-rotate(300deg) saturate(1.6)']], casa: 'ninhoDragao', come: ['abobora', 'morango', 'cristal'], preco: 0, nivel: 99, prod: 'cristal', tProd: 200, tAmor: 90, tam: 46, monta: true, magico: true },
};
const ORDEM_ALBUM = ['passarinho', 'cachorro', 'gato', 'coelho', 'galinha', 'vaca', 'ovelha', 'cavalo', 'ponei', 'peixe', 'unicornio',
  'abelha', 'borboleta', 'pato', 'cisne', 'tartaruga', 'porco', 'cabra', 'esquilo', 'ourico', 'raposa', 'coruja', 'pavao', 'lhama', 'pinguim',
  'urso', 'macaco', 'panda', 'coala', 'camelo', 'zebra', 'girafa', 'canguru', 'elefante', 'leao', 'golfinho', 'dragao'];

// Animais selvagens que aparecem em cada ilha (para fazer amizade)
const SELVAGENS = {
  0: [['passarinho', 3], ['gato', 1], ['coelho', 1]],
  1: [['coelho', 4], ['passarinho', 4], ['cachorro', 1]],
  2: [['gato', 2], ['passarinho', 2], ['cachorro', 1]],
  3: [['cavalo', 3], ['ponei', 2], ['ovelha', 2], ['vaca', 2], ['galinha', 2]],
  4: [['unicornio', 2], ['coelho', 2], ['passarinho', 3], ['ponei', 1]],
  5: [['abelha', 4], ['borboleta', 3], ['passarinho', 2]],
  6: [['esquilo', 3], ['passarinho', 3], ['abelha', 2]],
  7: [['pato', 3], ['gato', 2], ['cachorro', 1]],
  8: [['cisne', 2], ['pato', 3], ['tartaruga', 3]],
  9: [['raposa', 2], ['esquilo', 2], ['ourico', 3], ['coruja', 2]],
  10: [['porco', 2], ['cabra', 2], ['galinha', 3], ['vaca', 1]],
  11: [['pinguim', 4], ['urso', 2], ['coelho', 2]],
  12: [['lhama', 3], ['cabra', 2], ['ovelha', 2]],
  13: [['camelo', 3], ['coelho', 1]],
  14: [['girafa', 2], ['zebra', 3], ['elefante', 2], ['leao', 1]],
  15: [['macaco', 4], ['pavao', 2], ['passarinho', 3], ['borboleta', 2]],
  16: [['panda', 3], ['passarinho', 2]],
  17: [['canguru', 3], ['coala', 3]],
  18: [['tartaruga', 3], ['pato', 2], ['gato', 1]],
  19: [['cachorro', 3], ['gato', 3], ['passarinho', 2]],
  20: [['unicornio', 2], ['borboleta', 4], ['ponei', 2]],
  21: [['coelho', 3], ['porco', 2], ['abelha', 2]],
  22: [['passarinho', 3], ['macaco', 2], ['tartaruga', 2]],
  23: [['dragao', 2], ['coruja', 2], ['unicornio', 1]],
  24: [['coruja', 3], ['unicornio', 2], ['borboleta', 3]],
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
  pepino: { nome: 'Pepino', e: '🥒', tempo: 55, semente: 6, venda: 13, xp: 5, nivel: 2 },
  uva: { nome: 'Uva', e: '🍇', tempo: 110, semente: 12, venda: 26, xp: 9, nivel: 3 },
  brocolis: { nome: 'Brócolis', e: '🥦', tempo: 95, semente: 11, venda: 24, xp: 8, nivel: 4 },
  bambu: { nome: 'Bambu', e: '🎋', tempo: 80, semente: 9, venda: 18, xp: 7, nivel: 5 },
  abacaxi: { nome: 'Abacaxi', e: '🍍', tempo: 160, semente: 18, venda: 40, xp: 12, nivel: 5 },
  berinjela: { nome: 'Berinjela', e: '🍆', tempo: 130, semente: 15, venda: 33, xp: 11, nivel: 6 },
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
  mel: { nome: 'Pote de mel', e: '🍯', venda: 28 },
  castanha: { nome: 'Castanha', e: '🌰', venda: 12 },
  pera: { nome: 'Pera', e: '🍐', venda: 14 },
  limao: { nome: 'Limão', e: '🍋', venda: 13 },
  pessego: { nome: 'Pêssego', e: '🍑', venda: 18 },
  manga: { nome: 'Manga', e: '🥭', venda: 22 },
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
  lago: { nome: 'Lago', ic: '🐟', w: 2, h: 2, custo: { moedas: 100, pedra: 6 }, nivel: 3, cat: 'animais', abriga: ['peixe', 'pato', 'cisne', 'tartaruga', 'pinguim', 'golfinho'], vagas: 6, desc: 'Para peixes, patos, cisnes, tartarugas, pinguins e golfinhos' },
  celeiro: { nome: 'Celeiro', ic: '🐄', w: 3, h: 2, custo: { moedas: 180, madeira: 10, pedra: 4 }, nivel: 4, cat: 'animais', abriga: ['vaca', 'ovelha', 'cabra', 'lhama'], vagas: 4, desc: 'Para vacas, ovelhas, cabras e lhamas' },
  estabulo: { nome: 'Estábulo', ic: '🐴', w: 3, h: 2, custo: { moedas: 220, madeira: 10, pedra: 6 }, nivel: 5, cat: 'animais', abriga: ['cavalo', 'ponei', 'unicornio'], vagas: 4, desc: 'Para cavalos, pôneis e unicórnios' },

  flores: { nome: 'Flores', ic: '🌷', w: 1, h: 1, custo: { moedas: 5 }, nivel: 1, cat: 'enfeites', chao: true, repete: true, desc: 'Deixa tudo mais bonito' },
  caminho: { nome: 'Caminho de Pedra', ic: '🪨', w: 1, h: 1, custo: { moedas: 2, pedra: 1 }, nivel: 1, cat: 'enfeites', chao: true, repete: true, desc: 'Um caminho para passear' },
  cerca: { nome: 'Cerca', ic: '🪵', w: 1, h: 1, custo: { moedas: 3, madeira: 1 }, nivel: 1, cat: 'enfeites', repete: true, desc: 'Cerca de madeira' },
  banco: { nome: 'Banco', ic: '🪑', w: 1, h: 1, custo: { moedas: 15, madeira: 2 }, nivel: 2, cat: 'enfeites', desc: 'Para sentar e descansar' },
  poste: { nome: 'Poste de Luz', ic: '💡', w: 1, h: 1, custo: { moedas: 25, pedra: 1 }, nivel: 3, cat: 'enfeites', desc: 'Acende à noite' },
  balanco: { nome: 'Balanço', ic: '🎠', w: 1, h: 1, custo: { moedas: 40, madeira: 4 }, nivel: 3, cat: 'enfeites', desc: 'Um balanço no jardim' },
  fonte: { nome: 'Fonte', ic: '⛲', w: 2, h: 2, custo: { moedas: 150, pedra: 10 }, nivel: 6, cat: 'enfeites', desc: 'Fonte de água' },
  arcoiris: { nome: 'Arco-íris', ic: '🌈', w: 2, h: 1, custo: { moedas: 300, cristal: 1 }, nivel: 9, cat: 'enfeites', chao: true, desc: 'Um arco-íris mágico' },
  // ---- novidades ----
  pereira: { nome: 'Pereira', ic: '🍐', w: 1, h: 1, custo: { moedas: 70 }, nivel: 3, cat: 'fazenda', fruta: 'pera', tempo: 160, desc: 'Dá peras' },
  limoeiro: { nome: 'Limoeiro', ic: '🍋', w: 1, h: 1, custo: { moedas: 70 }, nivel: 4, cat: 'fazenda', fruta: 'limao', tempo: 150, desc: 'Dá limões' },
  pessegueiro: { nome: 'Pessegueiro', ic: '🍑', w: 1, h: 1, custo: { moedas: 100 }, nivel: 5, cat: 'fazenda', fruta: 'pessego', tempo: 180, desc: 'Dá pêssegos' },
  mangueira: { nome: 'Mangueira', ic: '🥭', w: 1, h: 1, custo: { moedas: 130 }, nivel: 6, cat: 'fazenda', fruta: 'manga', tempo: 200, desc: 'Dá mangas' },
  moinho: { nome: 'Moinho de Vento', ic: '🌾', w: 2, h: 2, custo: { moedas: 260, madeira: 14, pedra: 6 }, nivel: 5, cat: 'fazenda', desc: 'Um moinho que gira com o vento' },

  chale: { nome: 'Chalé da Montanha', ic: '🏔️', w: 2, h: 2, custo: { moedas: 220, madeira: 16 }, nivel: 5, cat: 'casas', casa: true, desc: 'Casinha de madeira aconchegante' },
  iglu: { nome: 'Iglu', ic: '⛄', w: 2, h: 2, custo: { moedas: 180, pedra: 10 }, nivel: 6, cat: 'casas', casa: true, desc: 'Casa redondinha de gelo' },
  casaPraia: { nome: 'Casa de Praia', ic: '🏖️', w: 3, h: 2, custo: { moedas: 500, madeira: 20, pedra: 8 }, nivel: 7, cat: 'casas', casa: true, desc: 'Casa colorida com varanda' },
  palacio: { nome: 'Palácio das Estrelas', ic: '🌟', w: 4, h: 4, custo: { moedas: 5000, madeira: 60, pedra: 60, cristal: 12 }, nivel: 14, cat: 'casas', casa: true, desc: 'O palácio mais lindo de todas as ilhas' },

  colmeia: { nome: 'Colmeia', ic: '🐝', w: 1, h: 1, custo: { moedas: 40, madeira: 3 }, nivel: 2, cat: 'animais', abriga: ['abelha'], vagas: 5, desc: 'Para 5 abelhas (dão mel!)' },
  chiqueiro: { nome: 'Chiqueiro', ic: '🐷', w: 2, h: 2, custo: { moedas: 90, madeira: 6 }, nivel: 3, cat: 'animais', abriga: ['porco'], vagas: 4, desc: 'Para 4 porquinhos' },
  viveiro: { nome: 'Viveiro', ic: '🦉', w: 2, h: 2, custo: { moedas: 140, madeira: 8, pedra: 2 }, nivel: 3, cat: 'animais', abriga: ['borboleta', 'coruja', 'pavao'], vagas: 5, desc: 'Para borboletas, corujas e pavões' },
  toca: { nome: 'Toca da Floresta', ic: '🦊', w: 2, h: 1, custo: { moedas: 110, madeira: 8 }, nivel: 4, cat: 'animais', abriga: ['esquilo', 'raposa', 'ourico'], vagas: 4, desc: 'Para esquilos, raposas e ouriços' },
  casaArvore: { nome: 'Casa na Árvore', ic: '🐒', w: 2, h: 2, custo: { moedas: 260, madeira: 18 }, nivel: 6, cat: 'animais', abriga: ['macaco', 'panda', 'coala'], vagas: 4, desc: 'Para macacos, pandas e coalas' },
  caverna: { nome: 'Caverna', ic: '🐻', w: 2, h: 2, custo: { moedas: 280, pedra: 20 }, nivel: 7, cat: 'animais', abriga: ['urso'], vagas: 3, desc: 'Para 3 ursos' },
  savana: { nome: 'Cercado da Savana', ic: '🦒', w: 3, h: 2, custo: { moedas: 380, madeira: 16, pedra: 8 }, nivel: 8, cat: 'animais', abriga: ['camelo', 'girafa', 'zebra', 'elefante', 'leao', 'canguru'], vagas: 4, desc: 'Para camelos, girafas, zebras, elefantes, leões e cangurus' },
  ninhoDragao: { nome: 'Ninho do Dragão', ic: '🐉', w: 3, h: 2, custo: { moedas: 800, pedra: 30, cristal: 4 }, nivel: 11, cat: 'animais', abriga: ['dragao'], vagas: 3, desc: 'Para dragões mágicos' },

  farol: { nome: 'Farol', ic: '🗼', w: 1, h: 1, custo: { moedas: 160, pedra: 10 }, nivel: 4, cat: 'enfeites', desc: 'Ilumina o mar à noite' },
  sorveteria: { nome: 'Sorveteria', ic: '🍦', w: 2, h: 1, custo: { moedas: 200, madeira: 8 }, nivel: 5, cat: 'enfeites', desc: 'Sorvete para todo mundo!' },
  rodaGigante: { nome: 'Roda-gigante', ic: '🎡', w: 3, h: 3, custo: { moedas: 900, madeira: 20, pedra: 20 }, nivel: 9, cat: 'enfeites', desc: 'Gira e gira lá no alto!' },
  estatua: { nome: 'Estátua de Unicórnio', ic: '🗿', w: 1, h: 1, custo: { moedas: 300, pedra: 12 }, nivel: 7, cat: 'enfeites', desc: 'Uma estátua de pedra brilhante' },
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
  // ---- amigos novos ----
  mel: { nome: 'Apicultora Melissa', ilha: 5, dx: 2, dy: -2, look: { pele: '#f6cba5', cabelo: 'rabo', corCabelo: '#d9a441', olhos: '#5b3a1e', roupa: 'macacao', corRoupa: '#ffcf3f', acc: 'chapeu' } },
  joaquim: { nome: 'Seu Joaquim', ilha: 6, dx: -2, dy: 2, look: { pele: '#e8b08a', cabelo: 'curto', corCabelo: '#e6e6e6', olhos: '#3a2a1a', roupa: 'macacao', corRoupa: '#4fb3ff', acc: 'chapeu' } },
  marina: { nome: 'Capitã Marina', ilha: 7, dx: 2, dy: -2, look: { pele: '#c98d62', cabelo: 'trancas', corCabelo: '#2b1a12', olhos: '#2d6a3e', roupa: 'camiseta', corRoupa: '#ffffff', acc: 'chapeu' } },
  bia: { nome: 'Veterinária Bia', ilha: 8, dx: -2, dy: -2, look: { pele: '#ffe0c8', cabelo: 'coque', corCabelo: '#c2452d', olhos: '#2f6fc0', roupa: 'saia', corRoupa: '#4fd18b', acc: 'oculos' } },
  caio: { nome: 'Guarda Caio', ilha: 9, dx: 2, dy: -2, look: { pele: '#9c643f', cabelo: 'curto', corCabelo: '#2b1a12', olhos: '#3a2a1a', roupa: 'macacao', corRoupa: '#c9503a', acc: 'chapeu' } },
  ze: { nome: 'Fazendeiro Zé', ilha: 10, dx: -2, dy: -2, look: { pele: '#f6cba5', cabelo: 'curto', corCabelo: '#8a5a2b', olhos: '#5b3a1e', roupa: 'macacao', corRoupa: '#3f7fd6', acc: 'chapeu' } },
  nina: { nome: 'Guia Nina', ilha: 11, dx: 2, dy: -2, look: { pele: '#ffe0c8', cabelo: 'trancas', corCabelo: '#f3d47a', olhos: '#2f6fc0', roupa: 'macacao', corRoupa: '#e8364f', acc: 'nada' } },
  inti: { nome: 'Pastora Inti', ilha: 12, dx: -2, dy: -2, look: { pele: '#c98d62', cabelo: 'trancas', corCabelo: '#2b1a12', olhos: '#3a2a1a', roupa: 'saia', corRoupa: '#ff8a4c', acc: 'chapeu' } },
  omar: { nome: 'Viajante Omar', ilha: 13, dx: 2, dy: -2, look: { pele: '#c98d62', cabelo: 'curto', corCabelo: '#2b1a12', olhos: '#5b3a1e', roupa: 'camiseta', corRoupa: '#ffffff', acc: 'oculos' } },
  zuri: { nome: 'Guia Zuri', ilha: 14, dx: -2, dy: -2, look: { pele: '#6b4128', cabelo: 'cacheado', corCabelo: '#2b1a12', olhos: '#3a2a1a', roupa: 'camiseta', corRoupa: '#ffcf3f', acc: 'chapeu' } },
  julia: { nome: 'Exploradora Júlia', ilha: 15, dx: 2, dy: -2, look: { pele: '#e8b08a', cabelo: 'rabo', corCabelo: '#5b3420', olhos: '#2d6a3e', roupa: 'macacao', corRoupa: '#8a6a3a', acc: 'chapeu' } },
  li: { nome: 'Mestre Li', ilha: 16, dx: -2, dy: -2, look: { pele: '#f6cba5', cabelo: 'coque', corCabelo: '#2b1a12', olhos: '#3a2a1a', roupa: 'vestido', corRoupa: '#e8364f', acc: 'nada' } },
  kai: { nome: 'Surfista Kai', ilha: 17, dx: 2, dy: -2, look: { pele: '#c98d62', cabelo: 'cacheado', corCabelo: '#d9a441', olhos: '#2f6fc0', roupa: 'camiseta', corRoupa: '#4fb3ff', acc: 'oculos' } },
  iara: { nome: 'Bióloga Iara', ilha: 18, dx: -2, dy: -2, look: { pele: '#9c643f', cabelo: 'longo', corCabelo: '#2b1a12', olhos: '#2d6a3e', roupa: 'camiseta', corRoupa: '#4fd18b', acc: 'flores' } },
  sofia: { nome: 'Prefeita Sofia', ilha: 19, dx: 2, dy: -2, look: { pele: '#e8b08a', cabelo: 'curto', corCabelo: '#5b3420', olhos: '#5b3a1e', roupa: 'saia', corRoupa: '#b77cff', acc: 'oculos' } },
  luna: { nome: 'Fada Luna', ilha: 20, dx: -2, dy: -2, look: { pele: '#ffe0c8', cabelo: 'longo', corCabelo: '#5ab0ff', olhos: '#7a4fc9', roupa: 'vestido', corRoupa: '#4fd18b', acc: 'asas' }, fada: true },
  cora: { nome: 'Confeiteira Cora', ilha: 21, dx: 2, dy: -2, look: { pele: '#f6cba5', cabelo: 'cacheado', corCabelo: '#ff7eb6', olhos: '#5b3a1e', roupa: 'vestido', corRoupa: '#ff6fa5', acc: 'laco' } },
  barba: { nome: 'Capitão Barba-Ruiva', ilha: 22, dx: -2, dy: -2, look: { pele: '#e8b08a', cabelo: 'cacheado', corCabelo: '#c2452d', olhos: '#2f6fc0', roupa: 'camiseta', corRoupa: '#e8364f', acc: 'chapeu' } },
  arturo: { nome: 'Mago Arturo', ilha: 23, dx: 2, dy: -2, look: { pele: '#f6cba5', cabelo: 'longo', corCabelo: '#e6e6e6', olhos: '#7a4fc9', roupa: 'vestido', corRoupa: '#3f4fb0', acc: 'tiara' } },
  estela: { nome: 'Rainha Estela', ilha: 24, dx: -2, dy: -2, look: { pele: '#9c643f', cabelo: 'longo', corCabelo: '#f3d47a', olhos: '#7a4fc9', roupa: 'vestido', corRoupa: '#ffcf3f', acc: 'coroa' }, fada: true },
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
  // ================= ilhas novas =================
  {
    npc: 'mel', premio: 500,
    fala: 'Bzzz! Olá, {n}! Aqui no Jardim das Abelhas tudo é florido. As abelhas fazem um mel delicioso. Vamos cuidar delas?',
    missoes: [
      { t: 'Construa uma Colmeia', ic: '🐝', dica: 'Fica em 🔨 Construir › Bichos.', c: s => [cons(s, 'colmeia'), 1] },
      { t: 'Tenha 3 abelhas', ic: '🐝', dica: 'Compre na 🛒 Loja ou faça amizade com as abelhas do jardim (elas gostam de girassol).', c: s => [anim(s, 'abelha'), 3] },
      { t: 'Colete 3 potes de mel', ic: '🍯', dica: 'Dê girassol para as abelhas e espere o mel.', c: s => [prd(s, 'mel'), 3] },
      { t: 'Plante 10 flores', ic: '🌷', dica: 'Construa Flores em 🔨 Construir › Enfeites.', c: s => [cons(s, 'flores'), 10] },
    ],
  },
  {
    npc: 'joaquim', premio: 550,
    fala: 'Bom dia, {n}! O Pomar Dourado tem as frutas mais doces do mundo. Me ajuda a plantar mais árvores?',
    missoes: [
      { t: 'Tenha 4 árvores de frutas', ic: '🌳', dica: 'Macieira, laranjeira, pereira, limoeiro... em 🔨 Construir › Fazenda.', c: s => [cons(s, 'macieira', 'laranjeira', 'bananeira', 'cerejeira', 'pereira', 'limoeiro', 'pessegueiro', 'mangueira'), 4] },
      { t: 'Colha 10 morangos no total', ic: '🍓', dica: 'Plante morango num canteiro.', c: s => [col(s, 'morango'), 10] },
      { t: 'Colha 5 cachos de uva', ic: '🍇', dica: 'Sementes de uva na 🛒 Loja.', c: s => [col(s, 'uva'), 5] },
      { t: 'Faça amizade com um esquilo', ic: '🐿️', dica: 'Construa uma Toca da Floresta e leve girassol ou maçã.', c: s => [am(s, 'esquilo'), 1] },
    ],
  },
  {
    npc: 'marina', premio: 600,
    fala: 'Ahoy, {n}! Bem-vinda à Vila dos Pescadores. Aqui todo mundo pesca, nada e cuida do mar!',
    missoes: [
      { t: 'Pesque 15 peixes no total', ic: '🎣', dica: 'Toque na água perto da margem.', c: s => [s.st.pescou || 0, 15] },
      { t: 'Junte 10 conchas no total', ic: '🐚', dica: 'As conchas ficam na areia das praias.', c: s => [s.st.conchas || 0, 10] },
      { t: 'Tenha 2 patos', ic: '🦆', dica: 'Patos moram no Lago.', c: s => [anim(s, 'pato'), 2] },
      { t: 'Construa um Farol', ic: '🗼', dica: 'Fica em 🔨 Construir › Enfeites.', c: s => [cons(s, 'farol'), 1] },
    ],
  },
  {
    npc: 'bia', premio: 650,
    fala: 'Oi, {n}! Sou veterinária e cuido dos bichinhos da Lagoa dos Cisnes. Vamos fazer novos amigos na água?',
    missoes: [
      { t: 'Faça amizade com um cisne', ic: '🦢', dica: 'Construa um Lago e leve alface ou milho.', c: s => [am(s, 'cisne'), 1] },
      { t: 'Faça amizade com uma tartaruga', ic: '🐢', dica: 'Tartarugas adoram alface e morango.', c: s => [am(s, 'tartaruga'), 1] },
      { t: 'Tenha 2 lagos', ic: '💧', dica: 'Construa mais um Lago.', c: s => [cons(s, 'lago'), 2] },
      { t: 'Dê comida 30 vezes no total', ic: '🥣', dica: 'Toque nos seus bichos e dê comida.', c: s => [s.st.alimentou || 0, 30] },
    ],
  },
  {
    npc: 'caio', premio: 700,
    fala: 'Psiu, {n}... fale baixinho! O Bosque das Raposas é cheio de bichinhos tímidos. Vamos ganhar a confiança deles?',
    missoes: [
      { t: 'Construa uma Toca da Floresta', ic: '🪵', dica: 'Fica em 🔨 Construir › Bichos.', c: s => [cons(s, 'toca'), 1] },
      { t: 'Faça amizade com uma raposa', ic: '🦊', dica: 'Raposas gostam de ração e maçã.', c: s => [am(s, 'raposa'), 1] },
      { t: 'Faça amizade com um ouriço', ic: '🦔', dica: 'Ouriços gostam de maçã e morango.', c: s => [am(s, 'ourico'), 1] },
      { t: 'Junte 40 madeiras no total', ic: '🪵', dica: 'Corte árvores.', c: s => [s.st.madeira || 0, 40] },
    ],
  },
  {
    npc: 'ze', premio: 750,
    fala: 'Ô de casa, {n}! Na Fazenda Feliz tem porquinho, cabra e galinha. Bora deixar essa fazenda ainda mais animada?',
    missoes: [
      { t: 'Construa um Chiqueiro', ic: '🐷', dica: 'Fica em 🔨 Construir › Bichos.', c: s => [cons(s, 'chiqueiro'), 1] },
      { t: 'Tenha 2 porquinhos', ic: '🐖', dica: 'Porquinhos adoram batata e milho.', c: s => [anim(s, 'porco'), 2] },
      { t: 'Tenha 2 cabras', ic: '🐐', dica: 'Cabras moram no Celeiro.', c: s => [anim(s, 'cabra'), 2] },
      { t: 'Colete 10 ovos no total', ic: '🥚', dica: 'Galinhas e patos botam ovos.', c: s => [prd(s, 'ovo'), 10] },
    ],
  },
  {
    npc: 'nina', premio: 800,
    fala: 'Brrr! Que frio, {n}! Na Montanha Nevada moram pinguins e ursos. Vista um casaco e vamos lá!',
    missoes: [
      { t: 'Faça amizade com um pinguim', ic: '🐧', dica: 'Pinguins moram no Lago e comem peixe.', c: s => [am(s, 'pinguim'), 1] },
      { t: 'Construa um Iglu', ic: '⛄', dica: 'Fica em 🔨 Construir › Casas.', c: s => [cons(s, 'iglu'), 1] },
      { t: 'Junte 30 pedras no total', ic: '🪨', dica: 'Quebre as pedras.', c: s => [s.st.pedra || 0, 30] },
      { t: 'Faça amizade com um urso', ic: '🐻', dica: 'Construa uma Caverna. Ursos adoram mel e peixe!', c: s => [am(s, 'urso'), 1] },
    ],
  },
  {
    npc: 'inti', premio: 850,
    fala: 'Olá, {n}! No Vale das Lhamas a gente planta batata e faz roupas quentinhas de lã. Vem ajudar!',
    missoes: [
      { t: 'Faça amizade com uma lhama', ic: '🦙', dica: 'Lhamas moram no Celeiro e comem alface e batata.', c: s => [am(s, 'lhama'), 1] },
      { t: 'Colete 6 lãs no total', ic: '🧶', dica: 'Ovelhas e lhamas dão lã.', c: s => [prd(s, 'la'), 6] },
      { t: 'Colha 10 batatas no total', ic: '🥔', dica: 'Plante batata num canteiro.', c: s => [col(s, 'batata'), 10] },
      { t: 'Construa um Moinho de Vento', ic: '🌾', dica: 'Fica em 🔨 Construir › Fazenda.', c: s => [cons(s, 'moinho'), 1] },
    ],
  },
  {
    npc: 'omar', premio: 900,
    fala: 'Salam, {n}! O Deserto Dourado é quente, mas tem camelos muito simpáticos. Leve bastante água!',
    missoes: [
      { t: 'Construa um Cercado da Savana', ic: '🏜️', dica: 'Camelos moram lá. Fica em 🔨 Construir › Bichos.', c: s => [cons(s, 'savana'), 1] },
      { t: 'Faça amizade com um camelo', ic: '🐫', dica: 'Camelos adoram melancia e milho.', c: s => [am(s, 'camelo'), 1] },
      { t: 'Colha 5 melancias no total', ic: '🍉', dica: 'Plante melancia num canteiro.', c: s => [col(s, 'melancia'), 5] },
      { t: 'Junte 20 cocos no total', ic: '🥥', dica: 'Toque nos coqueiros.', c: s => [s.st.coco || 0, 20] },
    ],
  },
  {
    npc: 'zuri', premio: 1000,
    fala: 'Jambo, {n}! Bem-vinda à Savana Africana! Aqui vivem girafas, zebras, elefantes e até o rei leão!',
    missoes: [
      { t: 'Faça amizade com uma girafa', ic: '🦒', dica: 'Girafas comem maçã e alface.', c: s => [am(s, 'girafa'), 1] },
      { t: 'Faça amizade com uma zebra', ic: '🦓', dica: 'Zebras comem milho e alface.', c: s => [am(s, 'zebra'), 1] },
      { t: 'Faça amizade com um elefante', ic: '🐘', dica: 'Elefantes adoram banana e melancia.', c: s => [am(s, 'elefante'), 1] },
      { t: 'Faça amizade com um leão', ic: '🦁', dica: 'O leão come ração e peixe.', c: s => [am(s, 'leao'), 1] },
    ],
  },
  {
    npc: 'julia', premio: 1100,
    fala: '{n}! Que bom que chegou! A Selva Tropical é cheia de aventuras: macacos, pavões e frutas gigantes!',
    missoes: [
      { t: 'Construa uma Casa na Árvore', ic: '🌳', dica: 'Fica em 🔨 Construir › Bichos.', c: s => [cons(s, 'casaArvore'), 1] },
      { t: 'Faça amizade com um macaco', ic: '🐒', dica: 'Macacos adoram banana e abacaxi.', c: s => [am(s, 'macaco'), 1] },
      { t: 'Faça amizade com um pavão', ic: '🦚', dica: 'Pavões moram no Viveiro e comem milho.', c: s => [am(s, 'pavao'), 1] },
      { t: 'Colha 8 abacaxis no total', ic: '🍍', dica: 'Plante abacaxi num canteiro.', c: s => [col(s, 'abacaxi'), 8] },
    ],
  },
  {
    npc: 'li', premio: 1200,
    fala: 'Ni hao, {n}! No Bosque de Bambu vivem os pandas. Eles passam o dia todo comendo bambu!',
    missoes: [
      { t: 'Colha 10 bambus no total', ic: '🎋', dica: 'Plante bambu num canteiro.', c: s => [col(s, 'bambu'), 10] },
      { t: 'Faça amizade com um panda', ic: '🐼', dica: 'Pandas moram na Casa na Árvore e só comem bambu.', c: s => [am(s, 'panda'), 1] },
      { t: 'Tenha 2 pandas', ic: '🐼', dica: 'Faça amizade ou espere nascer um bebê.', c: s => [anim(s, 'panda'), 2] },
      { t: 'Tenha 2 cerejeiras', ic: '🌸', dica: 'Fica em 🔨 Construir › Fazenda.', c: s => [cons(s, 'cerejeira'), 2] },
    ],
  },
  {
    npc: 'kai', premio: 1300,
    fala: 'E aí, {n}! Na Ilha dos Cangurus tem praia, surfe e uns bichos que pulam muito alto!',
    missoes: [
      { t: 'Faça amizade com um canguru', ic: '🦘', dica: 'Cangurus moram no Cercado da Savana e comem cenoura.', c: s => [am(s, 'canguru'), 1] },
      { t: 'Faça amizade com um coala', ic: '🐨', dica: 'Coalas moram na Casa na Árvore.', c: s => [am(s, 'coala'), 1] },
      { t: 'Colha 30 cenouras no total', ic: '🥕', dica: 'Plante cenoura nos canteiros.', c: s => [col(s, 'cenoura'), 30] },
      { t: 'Pesque 30 peixes no total', ic: '🎣', dica: 'Toque na água perto da margem.', c: s => [s.st.pescou || 0, 30] },
    ],
  },
  {
    npc: 'iara', premio: 1400,
    fala: 'Olá, {n}! Eu estudo os animais do mar. Na Ilha dos Golfinhos a gente protege as tartarugas e os golfinhos!',
    missoes: [
      { t: 'Tenha um golfinho', ic: '🐬', dica: 'Golfinhos são vendidos na 🛒 Loja e moram no Lago.', c: s => [anim(s, 'golfinho'), 1] },
      { t: 'Tenha 3 tartarugas', ic: '🐢', dica: 'Faça amizade ou compre na Loja.', c: s => [anim(s, 'tartaruga'), 3] },
      { t: 'Junte 25 conchas no total', ic: '🐚', dica: 'Procure nas praias.', c: s => [s.st.conchas || 0, 25] },
      { t: 'Veja nascer 10 bebês no total', ic: '🍼', dica: 'Animais felizes têm filhotes!', c: s => [s.st.nasceu || 0, 10] },
    ],
  },
  {
    npc: 'sofia', premio: 1500,
    fala: 'Seja bem-vinda à Cidade das Flores, {n}! Eu sou a prefeita. Vamos deixar a cidade ainda mais linda?',
    missoes: [
      { t: 'Tenha 4 casas', ic: '🏘️', dica: 'Qualquer casa vale!', c: s => [cons(s, 'casa1', 'casa2', 'casa3', 'castelo', 'chale', 'iglu', 'casaPraia', 'palacio'), 4] },
      { t: 'Construa 4 postes de luz', ic: '💡', dica: 'Fica em 🔨 Construir › Enfeites.', c: s => [cons(s, 'poste'), 4] },
      { t: 'Construa uma Sorveteria', ic: '🍦', dica: 'Fica em 🔨 Construir › Enfeites.', c: s => [cons(s, 'sorveteria'), 1] },
      { t: 'Construa uma Roda-gigante', ic: '🎡', dica: 'Precisa do nível 9.', c: s => [cons(s, 'rodaGigante'), 1] },
    ],
  },
  {
    npc: 'luna', premio: 1600,
    fala: 'Olá, olá, {n}! Eu sou a Fada Luna. Na Ilha do Arco-Íris a magia está em todo lugar!',
    missoes: [
      { t: 'Junte 12 cristais no total', ic: '💎', dica: 'Procure os brilhos pela ilha.', c: s => [s.st.cristal || 0, 12] },
      { t: 'Faça amizade com 3 borboletas', ic: '🦋', dica: 'Borboletas moram no Viveiro e gostam de girassol.', c: s => [am(s, 'borboleta'), 3] },
      { t: 'Tenha 2 unicórnios', ic: '🦄', dica: 'Unicórnios adoram morangos!', c: s => [anim(s, 'unicornio'), 2] },
      { t: 'Construa 2 arco-íris', ic: '🌈', dica: 'Fica em 🔨 Construir › Enfeites.', c: s => [cons(s, 'arcoiris'), 2] },
    ],
  },
  {
    npc: 'cora', premio: 1700,
    fala: 'Hummm, {n}! Sente esse cheirinho de bolo? Na Ilha da Doceria eu preciso de ingredientes para a maior festa de todas!',
    missoes: [
      { t: 'Colha 25 morangos no total', ic: '🍓', dica: 'Plante morango nos canteiros.', c: s => [col(s, 'morango'), 25] },
      { t: 'Colete 10 potes de mel no total', ic: '🍯', dica: 'Abelhas felizes dão mel.', c: s => [prd(s, 'mel'), 10] },
      { t: 'Colete 15 leites no total', ic: '🥛', dica: 'Vacas, cabras e camelos dão leite.', c: s => [prd(s, 'leite'), 15] },
      { t: 'Colha 8 abóboras no total', ic: '🎃', dica: 'Plante abóbora num canteiro.', c: s => [col(s, 'abobora'), 8] },
    ],
  },
  {
    npc: 'barba', premio: 1800,
    fala: 'Arrr, marujinha {n}! Na Ilha dos Piratas a gente procura tesouros. Mas pirata bom também cuida dos bichos!',
    missoes: [
      { t: 'Ache 3 baús do dia', ic: '🎁', dica: 'Todo dia tem um baú escondido em alguma ilha.', c: s => [s.st.baus || 0, 3] },
      { t: 'Pesque 50 peixes no total', ic: '🎣', dica: 'Às vezes vem até um tesouro no anzol!', c: s => [s.st.pescou || 0, 50] },
      { t: 'Junte 40 cocos no total', ic: '🥥', dica: 'Toque nos coqueiros.', c: s => [s.st.coco || 0, 40] },
      { t: 'Tenha 20 animais', ic: '🐾', dica: 'Sua fazenda está crescendo!', c: s => [s.animais.length, 20] },
    ],
  },
  {
    npc: 'arturo', premio: 2000,
    fala: 'Saudações, {n}! Eu sou o Mago Arturo. No Reino dos Dragões, só quem tem coração bondoso faz amizade com um dragão...',
    missoes: [
      { t: 'Junte 16 cristais no total', ic: '💎', dica: 'Procure os brilhos nas ilhas mágicas.', c: s => [s.st.cristal || 0, 16] },
      { t: 'Construa o Ninho do Dragão', ic: '🐉', dica: 'Precisa do nível 11.', c: s => [cons(s, 'ninhoDragao'), 1] },
      { t: 'Faça amizade com um dragão', ic: '🐉', dica: 'Dragões gostam de abóbora, morango e cristal.', c: s => [am(s, 'dragao'), 1] },
      { t: 'Passeie montada 10 vezes no total', ic: '🏇', dica: 'Toque no seu cavalo, camelo, zebra, elefante ou dragão e escolha Montar.', c: s => [s.st.montou || 0, 10] },
    ],
  },
  {
    npc: 'estela', premio: 5000,
    fala: 'Que alegria, {n}! Você viajou por todas as ilhas. Agora falta só construir o Palácio das Estrelas para virar a Lenda das Ilhas!',
    missoes: [
      { t: 'Junte 20 cristais no total', ic: '💎', dica: 'Procure em todas as ilhas mágicas.', c: s => [s.st.cristal || 0, 20] },
      { t: 'Tenha 30 bichos diferentes no álbum', ic: '📖', dica: 'Faça amizade com bichos de todas as ilhas.', c: s => [s.album.length, 30] },
      { t: 'Veja nascer 25 bebês no total', ic: '👶', dica: 'Dê comida para dois bichos iguais.', c: s => [s.st.nasceu || 0, 25] },
      { t: 'Construa o Palácio das Estrelas', ic: '🌟', dica: 'Precisa do nível 14.', c: s => [cons(s, 'palacio'), 1] },
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
  { id: 'apicultora', ic: '🍯', t: 'Apicultora: 10 potes de mel', c: s => prd(s, 'mel') >= 10 },
  { id: 'zoo', ic: '🦒', t: 'Zoológico: 20 bichos no álbum', c: s => s.album.length >= 20 },
  { id: 'safari', ic: '🐘', t: 'Safári: amiga da savana', c: s => am(s, 'girafa') && am(s, 'zebra') && am(s, 'elefante') && am(s, 'leao') },
  { id: 'polar', ic: '🐧', t: 'Amiga dos pinguins', c: s => am(s, 'pinguim') >= 1 },
  { id: 'dragoes', ic: '🐉', t: 'Domadora de dragões', c: s => am(s, 'dragao') >= 1 },
  { id: 'n15', ic: '💫', t: 'Nível 15', c: s => s.nivel >= 15 },
  { id: 'fazendona', ic: '🏞️', t: '30 animais', c: s => s.animais.length >= 30 },
  { id: 'viajante', ic: '🧭', t: 'Viajante: 15 ilhas', c: s => s.fase >= 15 },
  { id: 'lenda', ic: '🌟', t: 'Lenda das Ilhas', c: s => s.fase >= FASES.length },
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
// atalhos para as missões
function cons(s, ...tipos) { return tipos.reduce((n, t) => n + contaConstru(s, t), 0); }
function anim(s, ...sps) { return sps.reduce((n, sp) => n + contaAnimais(s, sp), 0); }
function am(s, sp) { return (s.st.amizade && s.st.amizade[sp]) || 0; }
function col(s, p) { return (s.st.colheu && s.st.colheu[p]) || 0; }
function prd(s, it) { return (s.st.prod && s.st.prod[it]) || 0; }
const FIM = FASES.length; // fase final (todas as ilhas completas)
