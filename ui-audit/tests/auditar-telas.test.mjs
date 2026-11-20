// Runs scripts/auditar-telas.mjs against tests/fixture.html (planted violations) and checks that every
// violation lands in medidas.json — and that the conforming text does not.
// Usage: node --test .ai/skills/ui-audit/tests/auditar-telas.test.mjs   (needs Chrome; see CHROME in the script header)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const aqui = path.dirname(fileURLToPath(import.meta.url))
const script = path.join(aqui, '..', 'scripts', 'auditar-telas.mjs')
const saida = fs.mkdtempSync(path.join(os.tmpdir(), 'ui-audit-teste-'))

const execucao = spawnSync(
  process.execPath,
  [script, '--base', pathToFileURL(aqui + path.sep).href, '--saida', saida, '--rota', '/fixture.html=fixture', '--tema', 'ambos', '--larguras', '1440,390', '--esperar', 'main'],
  { encoding: 'utf8', env: { ...process.env, MSYS_NO_PATHCONV: '1' } }
)
const medidas = execucao.status === 0 ? JSON.parse(fs.readFileSync(path.join(saida, 'medidas.json'), 'utf8')) : null
const captura = (tema, largura) => medidas.capturas.find((c) => c.tema === tema && c.largura === largura).medidas

test('o script termina sem erro e grava 4 capturas', () => {
  assert.equal(execucao.status, 0, execucao.stderr)
  assert.equal(medidas.capturas.length, 4)
  for (const c of medidas.capturas) for (const png of c.pngs) assert.ok(fs.statSync(path.join(saida, png)).size > 1000, png)
})

test('o tema pedido é o tema renderizado', () => {
  assert.equal(captura('claro', 1440).temaRenderizado.escuro, false)
  assert.equal(captura('escuro', 1440).temaRenderizado.escuro, true)
})

test('texto de 12 px aparece; o de 16 px não', () => {
  const m = captura('claro', 1440)
  assert.ok(m.textoPequeno.some((g) => g.tamanho === 12 && g.seletor.endsWith('p.pequeno')))
  assert.ok(!m.textoPequeno.some((g) => g.seletor.endsWith('p.conforme')))
})

test('cinza sobre cinza falha o contraste; o texto conforme passa', () => {
  const m = captura('claro', 1440)
  const ruim = m.contrasteBaixo.find((g) => g.seletor.endsWith('p.apagado'))
  assert.ok(ruim, JSON.stringify(m.contrasteBaixo))
  assert.ok(ruim.razao < 4.5)
  assert.ok(!m.contrasteBaixo.some((g) => g.seletor.endsWith('p.conforme')))
})

test('texto sobre gradiente vira indeterminado, não achado', () => {
  const m = captura('claro', 1440)
  assert.ok(m.contrasteIndeterminado.some((g) => g.motivo.includes('gradiente') || g.motivo.includes('imagem')))
  assert.ok(!m.contrasteBaixo.some((g) => g.seletor.endsWith('p.gradiente')))
})

test('select de 32 px ao lado de input de 40 px aparece desalinhado', () => {
  const par = captura('claro', 1440).controlesDesalinhados.find((p) => p.diferencaAltura === 8)
  assert.ok(par, JSON.stringify(captura('claro', 1440).controlesDesalinhados))
})

test('overflow horizontal é medido nas duas larguras', () => {
  assert.ok(captura('claro', 1440).overflowHorizontal.excesso > 0)
  const celular = captura('claro', 390).overflowHorizontal
  assert.ok(celular.excesso > 1000)
  assert.ok(celular.culpados.some((c) => c.seletor.endsWith('div.largo')))
})

test('alvo de toque pequeno só é medido no celular', () => {
  assert.equal(captura('claro', 1440).alvosPequenos, null)
  assert.ok(captura('claro', 390).alvosPequenos.some((g) => g.seletor.endsWith('button.botao-mini')))
})

test('imagem esticada aparece como distorcida e ampliada', () => {
  const img = captura('claro', 1440).imagens.find((i) => i.alt === 'pixel esticado')
  assert.ok(img?.distorcida && img?.ampliada)
})

test('salto de h1 para h3 aparece', () => {
  const t = captura('claro', 1440).titulos
  assert.equal(t.quantidadeH1, 1)
  assert.ok(t.saltos.some((s) => s.startsWith('h1 → h3')))
})

test('rótulo fora do marcador escuro é medido contra o fundo que está atrás dele', () => {
  assert.ok(!captura('claro', 1440).contrasteBaixo.some((g) => g.seletor.endsWith('span.rotulo-fora')))
})

test('nav com scroll horizontal interno aparece em rolagemInterna', () => {
  const r = captura('claro', 1440).rolagemInterna.find((x) => x.seletor.endsWith('nav.abas'))
  assert.ok(r && r.escondido > 0 && r.overflowX === 'auto', JSON.stringify(captura('claro', 1440).rolagemInterna))
})

test('painel quase da cor da página aparece em superficiesFracas nos dois temas', () => {
  for (const tema of ['claro', 'escuro']) {
    assert.ok(captura(tema, 1440).superficiesFracas.some((s) => s.seletor.endsWith('div.painel')), tema)
  }
})

test('alvo de exatamente 44 px não é marcado; totais não são o teto de amostras', () => {
  const m = captura('claro', 390)
  assert.ok(!m.alvosPequenos.some((g) => g.seletor.endsWith('button.alvo-ok')))
  assert.equal(m.totais.alvosPequenos, m.alvosPequenos.length) // fixture has fewer groups than the cap
})

test.after(() => console.log(`PNGs para olhar: ${saida}`))
