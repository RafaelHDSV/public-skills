#!/usr/bin/env node
// Captures and measures an app's screens for skill ui-audit, through the Chrome DevTools Protocol.
// For every route x theme x width: viewport PNGs (never full page, which repeats the page side by
// side) and measured facts from the DOM in medidas.json. Facts are evidence, not verdicts: the
// skill still has to look at the PNG before it writes a finding.
// Node 22.4+ (global WebSocket and fetch). No dependencies.
//
// Usage:
//   node auditar-telas.mjs --base http://localhost:3702 --saida .reviews/ui-audit/<run> \
//     --rota /=inicio --rota "/campos=campos" [--tema claro|escuro|ambos] [--larguras 1440,390] \
//     [--dobras 2] [--esperar main] [--chave-tema app-tema --valor-claro light --valor-escuro dark]
//
// --rota <path>=<name>   Repeatable. The LAST "=" splits path and name (queries with "=" work).
// --tema                  claro, escuro or ambos (default: ambos).
// --larguras              Comma list (default: 1440,390). Below 600 px the page is emulated as a
//                         touch phone (height 844); otherwise desktop (height 900).
// --dobras <n>            Viewport-height screens captured per page, scrolling down (default: 1).
//                         Every measured sample says which "dobra" shows it.
// --esperar <css>         Selector that must exist before measuring (default: body).
// --esperar-em <name>=<css>   Repeatable: a different selector for one route (async lists, results).
// --tempo <s>             How long to wait for the selector before giving up (default: 60).
// --chave-tema <key>      localStorage key the app reads for its theme; set before each theme.
// --valor-claro / --valor-escuro   Values for that key (default: light / dark).
//
// Login (all optional; secrets only through the environment, never printed) — same contract as
// the readme skill's capturar-telas.mjs:
//   CAPTURA_COOKIE="name=value"                    a session cookie for the base host
//   CAPTURA_LOCAL_STORAGE='{"token":"…"}'          localStorage entries set before loading
//   CAPTURA_LOGIN_URL=/api/login + CAPTURA_LOGIN_CORPO='{"senha":"…"}'
//                                                  a POST whose Set-Cookie is kept
// CHROME=<path> overrides the browser path.
//
// Output: <saida>/<name>-<tema>-<largura>[-<dobra>].png and <saida>/medidas.json.

import { spawn } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

function lerArgs(argv) {
  const args = {
    rotas: [],
    tema: 'ambos',
    larguras: [1440, 390],
    dobras: 1,
    esperar: 'body',
    esperarEm: {},
    tempo: 60,
    valorClaro: 'light',
    valorEscuro: 'dark',
  }
  for (let i = 0; i < argv.length; i++) {
    const chave = argv[i]
    const valor = argv[i + 1]
    const usar = () => {
      if (valor === undefined) throw new Error(`${chave} precisa de um valor`)
      i++
      return valor
    }
    if (chave === '--base') args.base = usar().replace(/\/+$/, '')
    else if (chave === '--saida') args.saida = usar()
    else if (chave === '--rota') {
      const texto = usar()
      const corte = texto.lastIndexOf('=')
      if (corte <= 0) throw new Error(`--rota ${texto}: use <caminho>=<nome>`)
      args.rotas.push({ caminho: texto.slice(0, corte), nome: texto.slice(corte + 1) })
    } else if (chave === '--tema') args.tema = usar()
    else if (chave === '--larguras') args.larguras = usar().split(',').map((n) => Number(n.trim()))
    else if (chave === '--dobras') args.dobras = Number(usar())
    else if (chave === '--esperar') args.esperar = usar()
    else if (chave === '--esperar-em') {
      const texto = usar()
      const corte = texto.indexOf('=')
      if (corte <= 0) throw new Error(`--esperar-em ${texto}: use <nome>=<css>`)
      args.esperarEm[texto.slice(0, corte)] = texto.slice(corte + 1)
    } else if (chave === '--tempo') args.tempo = Number(usar())
    else if (chave === '--chave-tema') args.chaveTema = usar()
    else if (chave === '--valor-claro') args.valorClaro = usar()
    else if (chave === '--valor-escuro') args.valorEscuro = usar()
    else throw new Error(`opção desconhecida: ${chave}`)
  }
  if (!args.base || !args.saida || args.rotas.length === 0) {
    throw new Error('obrigatórios: --base, --saida e ao menos uma --rota')
  }
  if (!['claro', 'escuro', 'ambos'].includes(args.tema)) throw new Error('--tema: claro, escuro ou ambos')
  if (args.larguras.some((n) => !Number.isInteger(n) || n < 240)) throw new Error('--larguras: inteiros ≥ 240, separados por vírgula')
  if (!Number.isInteger(args.dobras) || args.dobras < 1 || args.dobras > 6) throw new Error('--dobras: de 1 a 6')
  if (!(args.tempo > 0)) throw new Error('--tempo: segundos, maior que zero')
  const nomes = new Set(args.rotas.map((rota) => rota.nome))
  const orfao = Object.keys(args.esperarEm).find((nome) => !nomes.has(nome))
  if (orfao) throw new Error(`--esperar-em ${orfao}: nenhuma --rota com esse nome`)
  // Git Bash (MSYS) rewrites "/x" arguments and env values into "C:/Program Files/Git/x".
  if (!args.base.startsWith('file:')) {
    const convertidos = [...args.rotas.map((rota) => rota.caminho), process.env.CAPTURA_LOGIN_URL ?? '/'].filter((v) => !v.startsWith('/'))
    if (convertidos.length) throw new Error(`caminho sem "/" no início (${convertidos[0]}): no Git Bash, rode com MSYS_NO_PATHCONV=1`)
  }
  return args
}

function caminhoDoChrome() {
  if (process.env.CHROME) return process.env.CHROME
  const candidatos = {
    win32: [
      'C:/Program Files/Google/Chrome/Application/chrome.exe',
      'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
      path.join(os.homedir(), 'AppData/Local/Google/Chrome/Application/chrome.exe'),
    ],
    darwin: ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'],
    linux: ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'],
  }[process.platform] ?? []
  const achado = candidatos.find((candidato) => fs.existsSync(candidato))
  if (!achado) throw new Error('Chrome não encontrado: defina CHROME com o caminho do executável')
  return achado
}

const espera = (ms) => new Promise((ok) => setTimeout(ok, ms))

// ---------------------------------------------------------------------------------------------
// Runs INSIDE the page (serialized with toString): no closure over Node variables.
// ---------------------------------------------------------------------------------------------
function medirNaPagina(opcoes) {
  const LIMITE_AMOSTRAS = 8
  const vw = document.documentElement.clientWidth
  const vh = window.innerHeight
  const celular = opcoes.celular

  // Any CSS color (rgb, oklch, color(), named) → [r, g, b, a] through a 1x1 canvas.
  const tela = document.createElement('canvas')
  tela.width = tela.height = 1
  const ctx = tela.getContext('2d', { willReadFrequently: true })
  const cache = new Map()
  function rgba(cor) {
    if (cache.has(cor)) return cache.get(cor)
    let saida
    if (!cor || cor === 'transparent') saida = [0, 0, 0, 0]
    else {
      ctx.clearRect(0, 0, 1, 1)
      ctx.fillStyle = '#000'
      ctx.fillStyle = cor
      ctx.fillRect(0, 0, 1, 1)
      const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data
      // fillRect premultiplies nothing for opaque reads; recover alpha from the parsed value
      saida = [r, g, b, a / 255]
    }
    cache.set(cor, saida)
    return saida
  }
  const sobre = (frente, fundo) => {
    const a = frente[3]
    return [0, 1, 2].map((i) => frente[i] * a + fundo[i] * (1 - a)).concat(1)
  }
  const luminancia = ([r, g, b]) => {
    const canal = (c) => {
      const s = c / 255
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
    }
    return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b)
  }
  const razao = (a, b) => {
    const [l1, l2] = [luminancia(a), luminancia(b)].sort((x, y) => y - x)
    return (l1 + 0.05) / (l2 + 0.05)
  }
  const hex = (c) => '#' + c.slice(0, 3).map((n) => Math.round(n).toString(16).padStart(2, '0')).join('')

  function rotulo(el) {
    const classe = (e) => (e && typeof e.className === 'string' && e.className.trim() ? '.' + e.className.trim().split(/\s+/)[0] : '')
    const pai = el.parentElement
    return `${pai ? pai.tagName.toLowerCase() + classe(pai) + ' > ' : ''}${el.tagName.toLowerCase()}${classe(el)}`
  }
  const absoluto = (r) => ({ x: Math.round(r.left + scrollX), y: Math.round(r.top + scrollY), w: Math.round(r.width), h: Math.round(r.height) })
  const dobra = (r) => Math.floor((r.top + scrollY) / vh) + 1

  function visivel(el) {
    const r = el.getBoundingClientRect()
    if (r.width < 1 || r.height < 1) return false
    for (let e = el; e && e !== document.documentElement; e = e.parentElement) {
      const s = getComputedStyle(e)
      if (s.display === 'none' || s.visibility === 'hidden' || Number(s.opacity) === 0) return false
      if (s.clip === 'rect(0px, 0px, 0px, 0px)' || s.clipPath === 'inset(50%)') return false
    }
    return true
  }

  function textoProprio(el) {
    let texto = ''
    for (const n of el.childNodes) if (n.nodeType === 3) texto += n.textContent
    return texto.replace(/\s+/g, ' ').trim()
  }

  // Effective background behind an element: walk up blending translucent layers. An ancestor whose box
  // does not contain the element's center (a label positioned outside a thin marker) is not behind it.
  function fundoEfetivo(el, pularProprio = false) {
    const camadas = []
    const r0 = el.getBoundingClientRect()
    const cx = r0.left + r0.width / 2
    const cy = r0.top + r0.height / 2
    for (let e = pularProprio ? el.parentElement : el; e; e = e.parentElement) {
      if (e !== document.body && e !== document.documentElement) {
        const r = e.getBoundingClientRect()
        if (cx < r.left || cx > r.right || cy < r.top || cy > r.bottom) continue
      }
      const s = getComputedStyle(e)
      if (s.backgroundImage && s.backgroundImage !== 'none') return { indeterminado: 'imagem ou gradiente em ' + rotulo(e) }
      const c = rgba(s.backgroundColor)
      if (c[3] > 0) {
        camadas.push(c)
        if (c[3] >= 1) break
      }
    }
    let base = [255, 255, 255, 1]
    for (let i = camadas.length - 1; i >= 0; i--) base = sobre(camadas[i], base)
    return { cor: base }
  }

  function opacidadeAcumulada(el) {
    let o = 1
    for (let e = el; e; e = e.parentElement) o *= Number(getComputedStyle(e).opacity)
    return o
  }

  // 1. Text: size histogram, small text, contrast
  const histograma = {}
  const pequenos = new Map()
  const contrastes = new Map()
  const indeterminados = new Map()
  for (const el of document.body.querySelectorAll('*')) {
    if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'SVG', 'svg'].includes(el.tagName)) continue
    const texto = textoProprio(el)
    if (!texto || !/[\p{L}\p{N}]/u.test(texto)) continue
    if (!visivel(el)) continue
    const s = getComputedStyle(el)
    const tamanho = Math.round(parseFloat(s.fontSize) * 10) / 10
    const peso = Number(s.fontWeight) || 400
    histograma[tamanho] = (histograma[tamanho] || 0) + texto.length
    const r = el.getBoundingClientRect()
    const amostra = { texto: texto.slice(0, 50), ...absoluto(r), dobra: dobra(r) }

    if (tamanho < opcoes.tamanhoMinimo) {
      const chave = `${tamanho}|${rotulo(el)}`
      const g = pequenos.get(chave) || { tamanho, seletor: rotulo(el), ocorrencias: 0, caracteres: 0, amostras: [] }
      g.ocorrencias++
      g.caracteres += texto.length
      if (g.amostras.length < 3) g.amostras.push(amostra)
      pequenos.set(chave, g)
    }

    const fundo = fundoEfetivo(el)
    if (fundo.indeterminado) {
      const g = indeterminados.get(fundo.indeterminado) || { motivo: fundo.indeterminado, ocorrencias: 0, amostras: [] }
      g.ocorrencias++
      if (g.amostras.length < 2) g.amostras.push(amostra)
      indeterminados.set(fundo.indeterminado, g)
      continue
    }
    const frente = rgba(s.color)
    const efetiva = sobre([frente[0], frente[1], frente[2], frente[3] * opacidadeAcumulada(el)], fundo.cor)
    const grande = tamanho >= 24 || (tamanho >= 18.66 && peso >= 700)
    const minimo = grande ? 3 : 4.5
    const valor = razao(efetiva, fundo.cor)
    if (valor < minimo) {
      const chave = `${hex(efetiva)}|${hex(fundo.cor)}|${rotulo(el)}`
      const g = contrastes.get(chave) || {
        razao: Math.round(valor * 100) / 100,
        minimo,
        texto: hex(efetiva),
        fundo: hex(fundo.cor),
        tamanho,
        seletor: rotulo(el),
        ocorrencias: 0,
        amostras: [],
      }
      g.ocorrencias++
      if (g.amostras.length < 3) g.amostras.push(amostra)
      contrastes.set(chave, g)
    }
  }

  // 2. Controls side by side with different height or top
  const controles = [...document.querySelectorAll('input:not([type=hidden]):not([type=checkbox]):not([type=radio]), select, textarea, button')]
    .filter(visivel)
    .map((el) => ({ el, r: el.getBoundingClientRect() }))
  const desalinhados = []
  for (let i = 0; i < controles.length; i++) {
    for (let j = i + 1; j < controles.length; j++) {
      const a = controles[i].r
      const b = controles[j].r
      const mesmaLinha = Math.abs(a.top + a.height / 2 - (b.top + b.height / 2)) < Math.max(a.height, b.height) / 2
      const separados = a.right <= b.left || b.right <= a.left
      const perto = Math.min(Math.abs(b.left - a.right), Math.abs(a.left - b.right)) < 48
      if (!mesmaLinha || !separados || !perto) continue
      const dAltura = Math.round(Math.abs(a.height - b.height))
      const dTopo = Math.round(Math.abs(a.top - b.top))
      if (dAltura > 2 || dTopo > 2) {
        desalinhados.push({
          a: { seletor: rotulo(controles[i].el), ...absoluto(a) },
          b: { seletor: rotulo(controles[j].el), ...absoluto(b) },
          diferencaAltura: dAltura,
          diferencaTopo: dTopo,
          dobra: dobra(a),
        })
      }
    }
  }

  // 3. Horizontal overflow
  const larguraDoc = document.documentElement.scrollWidth
  const overflow = { larguraJanela: vw, larguraDocumento: larguraDoc, excesso: Math.max(0, larguraDoc - vw), culpados: [] }
  if (overflow.excesso > 1) {
    for (const el of document.body.querySelectorAll('*')) {
      const r = el.getBoundingClientRect()
      if (r.right <= vw + 1 || !visivel(el)) continue
      // keep only the outermost offenders
      if (overflow.culpados.some((c) => c.el.contains(el))) continue
      overflow.culpados.push({ el, seletor: rotulo(el), direita: Math.round(r.right), ...absoluto(r) })
      if (overflow.culpados.length >= 5) break
    }
    overflow.culpados = overflow.culpados.map(({ el, ...resto }) => resto)
  }

  // 3b. Horizontal scroll or clipping INSIDE an element (a nav or table that hides part of itself)
  const rolagemInterna = []
  for (const el of document.body.querySelectorAll('*')) {
    if (el.scrollWidth <= el.clientWidth + 1 || el.clientWidth < 40) continue
    const ox = getComputedStyle(el).overflowX
    if (!['auto', 'scroll', 'hidden', 'clip'].includes(ox) || !visivel(el)) continue
    if (rolagemInterna.some((x) => x.el.contains(el))) continue
    const r = el.getBoundingClientRect()
    rolagemInterna.push({ el, seletor: rotulo(el), overflowX: ox, visivel: el.clientWidth, conteudo: el.scrollWidth, escondido: el.scrollWidth - el.clientWidth, ...absoluto(r), dobra: dobra(r) })
  }

  // 3c. Surfaces (cards, panels) barely separated from what is behind them — background and border
  const superficies = []
  for (const el of document.body.querySelectorAll('*')) {
    const s = getComputedStyle(el)
    const proprio = rgba(s.backgroundColor)
    if (proprio[3] < 1) continue
    const r = el.getBoundingClientRect()
    if (r.width < 120 || r.height < 60 || !visivel(el)) continue
    const atras = fundoEfetivo(el, true)
    if (!atras.cor) continue
    const razaoFundo = razao(proprio, atras.cor)
    if (razaoFundo < 1.005) continue // same color as behind: not a separate surface
    const larguraBorda = parseFloat(s.borderTopWidth) || 0
    const borda = larguraBorda > 0 ? sobre(rgba(s.borderTopColor), atras.cor) : null
    const razaoBorda = borda ? razao(borda, atras.cor) : null
    // Calibrated on consorcio-explica (19/11/2026): white cards on #f3f5f3 with a 1.28 border read
    // fine in the PNG; a borderless #1a221f panel on #121816 (1.11) does not.
    if (razaoFundo >= 1.25 || (razaoBorda !== null && razaoBorda >= 1.2)) continue
    superficies.push({
      seletor: rotulo(el),
      fundo: hex(proprio),
      atras: hex(atras.cor),
      razaoFundo: Math.round(razaoFundo * 100) / 100,
      borda: borda ? hex(borda) : null,
      razaoBorda: razaoBorda === null ? null : Math.round(razaoBorda * 100) / 100,
      area: Math.round(r.width * r.height),
      ...absoluto(r),
      dobra: dobra(r),
    })
  }
  superficies.sort((a, b) => b.area - a.area)

  // 4. Touch targets (phone widths only)
  const alvos = new Map()
  if (celular) {
    const clicaveis = document.querySelectorAll('a[href], button, input:not([type=hidden]), select, textarea, summary, [role=button], [role=tab], [role=switch]')
    for (const el of clicaveis) {
      if (!visivel(el)) continue
      // inline links inside running text are exempt (WCAG 2.5.8)
      if (el.tagName === 'A' && el.parentElement && textoProprio(el.parentElement).length > 0) continue
      let r = el.getBoundingClientRect()
      const label = el.closest('label')
      if (label && ['checkbox', 'radio'].includes(el.type)) r = label.getBoundingClientRect()
      if (Math.round(r.width) >= opcoes.alvoMinimo && Math.round(r.height) >= opcoes.alvoMinimo) continue
      const chave = rotulo(el)
      const g = alvos.get(chave) || { seletor: chave, ocorrencias: 0, menor: { w: 1e9, h: 1e9 }, amostras: [] }
      g.ocorrencias++
      g.menor = { w: Math.min(g.menor.w, Math.round(r.width)), h: Math.min(g.menor.h, Math.round(r.height)) }
      if (g.amostras.length < 3) g.amostras.push({ texto: (el.innerText || el.value || el.getAttribute('aria-label') || '').trim().slice(0, 40), ...absoluto(r), dobra: dobra(r) })
      alvos.set(chave, g)
    }
  }

  // 5. Images
  const imagens = []
  for (const img of document.images) {
    if (!visivel(img) || !img.naturalWidth) continue
    const r = img.getBoundingClientRect()
    const s = getComputedStyle(img)
    const naturalRazao = img.naturalWidth / img.naturalHeight
    const renderRazao = r.width / r.height
    const distorcida = s.objectFit === 'fill' && Math.abs(naturalRazao / renderRazao - 1) > 0.03
    const ampliada = r.width * devicePixelRatio > img.naturalWidth * 1.1 && !/\.svg(\?|$)/i.test(img.currentSrc)
    if (distorcida || ampliada) {
      imagens.push({
        src: img.currentSrc.slice(-80),
        alt: img.alt,
        natural: `${img.naturalWidth}x${img.naturalHeight}`,
        renderizada: `${Math.round(r.width)}x${Math.round(r.height)}`,
        distorcida,
        ampliada,
        ...absoluto(r),
        dobra: dobra(r),
      })
    }
  }

  // 6. Headings
  const titulos = [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')].filter(visivel).map((h) => {
    const s = getComputedStyle(h)
    return { nivel: Number(h.tagName[1]), texto: (h.innerText || '').trim().slice(0, 60), tamanho: parseFloat(s.fontSize), peso: Number(s.fontWeight) }
  })
  const saltos = []
  for (let i = 1; i < titulos.length; i++) {
    if (titulos[i].nivel > titulos[i - 1].nivel + 1) saltos.push(`h${titulos[i - 1].nivel} → h${titulos[i].nivel} ("${titulos[i].texto}")`)
  }

  // 7. Which theme actually rendered
  const fundoPagina = fundoEfetivo(document.body)
  const lum = fundoPagina.cor ? luminancia(fundoPagina.cor) : null

  const ordenar = (mapa, campo) => [...mapa.values()].sort((a, b) => b[campo] - a[campo]).slice(0, LIMITE_AMOSTRAS)
  return {
    // Group counts before the sample cap, so a summary never mistakes the cap for the total.
    totais: {
      textoPequeno: pequenos.size,
      contrasteBaixo: contrastes.size,
      contrasteIndeterminado: indeterminados.size,
      controlesDesalinhados: desalinhados.length,
      rolagemInterna: rolagemInterna.length,
      superficiesFracas: superficies.length,
      alvosPequenos: celular ? alvos.size : null,
      imagens: imagens.length,
    },
    janela: { largura: vw, altura: vh, alturaDocumento: document.documentElement.scrollHeight, dobrasNaPagina: Math.ceil(document.documentElement.scrollHeight / vh) },
    temaRenderizado: {
      atributo: document.documentElement.getAttribute('data-theme'),
      fundoDaPagina: fundoPagina.cor ? hex(fundoPagina.cor) : fundoPagina.indeterminado,
      escuro: lum === null ? null : lum < 0.2,
    },
    tamanhosDeFonte: Object.fromEntries(Object.entries(histograma).sort((a, b) => Number(a[0]) - Number(b[0]))),
    textoPequeno: ordenar(pequenos, 'caracteres'),
    contrasteBaixo: [...contrastes.values()].sort((a, b) => a.razao - b.razao).slice(0, LIMITE_AMOSTRAS),
    contrasteIndeterminado: ordenar(indeterminados, 'ocorrencias'),
    controlesDesalinhados: desalinhados.slice(0, LIMITE_AMOSTRAS),
    overflowHorizontal: overflow,
    rolagemInterna: rolagemInterna.slice(0, LIMITE_AMOSTRAS).map(({ el, ...resto }) => resto),
    superficiesFracas: superficies.slice(0, LIMITE_AMOSTRAS),
    alvosPequenos: celular ? ordenar(alvos, 'ocorrencias') : null,
    imagens: imagens.slice(0, LIMITE_AMOSTRAS),
    titulos: { lista: titulos.slice(0, 20), quantidadeH1: titulos.filter((t) => t.nivel === 1).length, saltos },
  }
}

async function main() {
  const args = lerArgs(process.argv.slice(2))
  fs.mkdirSync(args.saida, { recursive: true })
  const base = new URL(args.base.endsWith('/') ? args.base : args.base + '/')

  let cookie = process.env.CAPTURA_COOKIE ?? ''
  if (process.env.CAPTURA_LOGIN_URL) {
    let resposta
    for (let tentativa = 1; !resposta; tentativa++) {
      try {
        resposta = await fetch(new URL(process.env.CAPTURA_LOGIN_URL, base), {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: process.env.CAPTURA_LOGIN_CORPO ?? '{}',
        })
      } catch (erro) {
        if (tentativa >= 3) throw new Error(`login inacessível (${erro.cause?.code ?? erro.message}); tente --base com 127.0.0.1 ou [::1]`)
        await espera(1000)
      }
    }
    if (!resposta.ok) throw new Error(`login falhou: HTTP ${resposta.status}`)
    cookie = (resposta.headers.get('set-cookie') ?? '').split(';')[0]
    if (!cookie) throw new Error('login sem Set-Cookie')
  }
  const armazenamento = process.env.CAPTURA_LOCAL_STORAGE ? JSON.parse(process.env.CAPTURA_LOCAL_STORAGE) : {}

  const perfil = fs.mkdtempSync(path.join(os.tmpdir(), 'auditar-telas-'))
  const porta = 9300 + Math.floor(Math.random() * 500)
  const chrome = spawn(
    caminhoDoChrome(),
    ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files', `--remote-debugging-port=${porta}`, `--user-data-dir=${perfil}`, '--window-size=1440,900', 'about:blank'],
    { stdio: 'ignore' }
  )
  const encerrar = async () => {
    const saiu = new Promise((ok) => chrome.once('exit', ok))
    chrome.kill()
    await Promise.race([saiu, espera(5000)])
    try {
      fs.rmSync(perfil, { recursive: true, force: true, maxRetries: 10, retryDelay: 300 })
    } catch {
      console.warn(`aviso: não deu para apagar o perfil temporário ${perfil}`)
    }
  }

  const relatorio = { base: args.base, geradoEm: new Date().toISOString(), rotas: args.rotas, capturas: [] }
  try {
    let alvo
    for (let i = 0; i < 75 && !alvo; i++) {
      await espera(200)
      try {
        alvo = (await (await fetch(`http://127.0.0.1:${porta}/json/list`)).json()).find((item) => item.type === 'page')
      } catch {}
    }
    if (!alvo) throw new Error('o Chrome não abriu a porta de depuração')

    const ws = new WebSocket(alvo.webSocketDebuggerUrl)
    await new Promise((ok, falha) => {
      ws.addEventListener('open', ok, { once: true })
      ws.addEventListener('error', falha, { once: true })
    })
    let id = 0
    const pendentes = new Map()
    ws.addEventListener('message', (evento) => {
      const msg = JSON.parse(evento.data)
      if (msg.id && pendentes.has(msg.id)) {
        pendentes.get(msg.id)(msg)
        pendentes.delete(msg.id)
      }
    })
    const cdp = (method, params = {}) =>
      new Promise((ok, falha) => {
        const meu = ++id
        pendentes.set(meu, (msg) => (msg.error ? falha(new Error(`${method}: ${msg.error.message}`)) : ok(msg.result)))
        ws.send(JSON.stringify({ id: meu, method, params }))
      })
    const avaliar = async (expressao) => {
      const r = await cdp('Runtime.evaluate', { expression: expressao, awaitPromise: true, returnByValue: true })
      if (r.exceptionDetails) throw new Error(`na página: ${r.exceptionDetails.exception?.description ?? r.exceptionDetails.text}`)
      return r.result.value
    }

    await cdp('Page.enable')
    await cdp('Network.enable')
    if (cookie && base.protocol.startsWith('http')) {
      const [nome, ...resto] = cookie.split('=')
      await cdp('Network.setCookie', { name: nome.trim(), value: resto.join('='), domain: base.hostname, path: '/' })
    }
    if (Object.keys(armazenamento).length) {
      await cdp('Page.navigate', { url: base.href })
      await espera(800)
      for (const [chave, valor] of Object.entries(armazenamento)) {
        await avaliar(`localStorage.setItem(${JSON.stringify(chave)}, ${JSON.stringify(String(valor))}); true`)
      }
    }

    const temas = args.tema === 'ambos' ? ['claro', 'escuro'] : [args.tema]
    for (const largura of args.larguras) {
      const celular = largura < 600
      const altura = celular ? 844 : 900
      await cdp('Emulation.setDeviceMetricsOverride', { width: largura, height: altura, deviceScaleFactor: 1, mobile: celular })
      await cdp('Emulation.setTouchEmulationEnabled', { enabled: celular, maxTouchPoints: celular ? 5 : 1 })
      for (const tema of temas) {
        await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: tema === 'escuro' ? 'dark' : 'light' }] })
        if (args.chaveTema) {
          await cdp('Page.navigate', { url: base.href })
          await espera(600)
          const valor = tema === 'escuro' ? args.valorEscuro : args.valorClaro
          await avaliar(`localStorage.setItem(${JSON.stringify(args.chaveTema)}, ${JSON.stringify(valor)}); true`)
        }
        for (const rota of args.rotas) {
          const url = new URL(rota.caminho.replace(/^\//, ''), base).href
          await cdp('Page.navigate', { url })
          const seletor = args.esperarEm[rota.nome] ?? args.esperar
          let pronto = false
          for (let t = 0; t < args.tempo * 1000 && !pronto; t += 250) {
            await espera(250)
            pronto = await avaliar(`document.readyState === 'complete' && !!document.querySelector(${JSON.stringify(seletor)})`)
          }
          if (!pronto) throw new Error(`${rota.caminho} (${tema}, ${largura}px): "${seletor}" não apareceu em ${args.tempo} s`)
          await avaliar('document.fonts.ready.then(() => true)')
          await espera(1200)
          await avaliar('window.scrollTo(0, 0); true')
          await espera(150)

          const medidas = await avaliar(
            `(${medirNaPagina.toString()})(${JSON.stringify({ celular, tamanhoMinimo: 14, alvoMinimo: 44 })})`
          )
          const pngs = []
          const total = Math.min(args.dobras, medidas.janela.dobrasNaPagina)
          for (let d = 1; d <= total; d++) {
            await avaliar(`window.scrollTo(0, ${(d - 1) * altura}); true`)
            await espera(d === 1 ? 100 : 400)
            const { data } = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
            const nome = `${rota.nome}-${tema}-${largura}${d > 1 ? `-${d}` : ''}.png`
            fs.writeFileSync(path.join(args.saida, nome), Buffer.from(data, 'base64'))
            pngs.push(nome)
          }
          relatorio.capturas.push({ rota: rota.caminho, nome: rota.nome, tema, largura, altura, url, pngs, medidas })

          const m = medidas
          const t = m.totais
          const temaOk = m.temaRenderizado.escuro === null || m.temaRenderizado.escuro === (tema === 'escuro')
          console.log(
            `ok ${rota.nome} ${tema} ${largura}px — ${pngs.length} png; grupos: ` +
              `texto<14px ${t.textoPequeno}, contraste ${t.contrasteBaixo}, controles ${t.controlesDesalinhados}, ` +
              `superfícies ${t.superficiesFracas}, rolagem interna ${t.rolagemInterna}; overflow ${m.overflowHorizontal.excesso}px` +
              (celular ? `; alvos<44 ${t.alvosPequenos}` : '') +
              (temaOk ? '' : `  ⚠ tema pedido ${tema}, fundo renderizado ${m.temaRenderizado.fundoDaPagina}`)
          )
        }
      }
    }
    ws.close()
  } finally {
    fs.writeFileSync(path.join(args.saida, 'medidas.json'), JSON.stringify(relatorio, null, 2))
    await encerrar()
  }
  console.log(`\n${path.join(args.saida, 'medidas.json')}`)
  console.log('Medida é evidência, não veredito: abra cada PNG antes de escrever um achado.')
}

main().catch((erro) => {
  console.error(`auditar-telas: ${erro.message}`)
  process.exitCode = 1
})
