#!/usr/bin/env node
// Captures README screens through the Chrome DevTools Protocol: viewport only (never full page,
// which repeats the page side by side), light and/or dark theme, optional login.
// Node 22.4+ (global WebSocket and fetch). No dependencies.
//
// Usage:
//   node capturar-telas.mjs --base http://localhost:3333 --saida assets/screenshots \
//     --rota /=inicio --rota "/simular?caso=x=simular" [--tema claro|escuro|ambos] \
//     [--esperar main] [--largura 1440 --altura 900] [--chave-tema app-tema]
//
// --rota <path>=<file>   Repeatable. The file name has no extension; the dark one gets "-escuro".
//                         The LAST "=" splits path and name, so paths with "=" in the query work.
// --tema                  claro (default), escuro, or ambos.
// --esperar <css>         Selector that must exist before the capture (default: body).
// --chave-tema <key>      localStorage key the app reads for its theme; set to light/dark.
// --valor-claro / --valor-escuro   Values for that key (default: light / dark).
//
// Login (all optional; secrets only through the environment, never printed):
//   CAPTURA_COOKIE="name=value"                    a session cookie for the base host
//   CAPTURA_LOCAL_STORAGE='{"token":"…"}'          localStorage entries set before loading
//   CAPTURA_LOGIN_URL=/api/login + CAPTURA_LOGIN_CORPO='{"senha":"…"}'
//                                                  a POST whose Set-Cookie is kept
// CHROME=<path> overrides the browser path.

import { spawn } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

function lerArgs(argv) {
  const args = { rotas: [], tema: 'claro', esperar: 'body', largura: 1440, altura: 900, valorClaro: 'light', valorEscuro: 'dark' }
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
      if (corte <= 0) throw new Error(`--rota ${texto}: use <caminho>=<arquivo>`)
      args.rotas.push({ caminho: texto.slice(0, corte), arquivo: texto.slice(corte + 1) })
    } else if (chave === '--tema') args.tema = usar()
    else if (chave === '--esperar') args.esperar = usar()
    else if (chave === '--largura') args.largura = Number(usar())
    else if (chave === '--altura') args.altura = Number(usar())
    else if (chave === '--chave-tema') args.chaveTema = usar()
    else if (chave === '--valor-claro') args.valorClaro = usar()
    else if (chave === '--valor-escuro') args.valorEscuro = usar()
    else throw new Error(`opção desconhecida: ${chave}`)
  }
  if (!args.base || !args.saida || args.rotas.length === 0) {
    throw new Error('obrigatórios: --base, --saida e ao menos uma --rota')
  }
  if (!['claro', 'escuro', 'ambos'].includes(args.tema)) throw new Error('--tema: claro, escuro ou ambos')
  // Git Bash (MSYS) rewrites "/x" arguments and env values into "C:/Program Files/Git/x".
  const convertidos = [...args.rotas.map((rota) => rota.caminho), process.env.CAPTURA_LOGIN_URL ?? '/'].filter((valor) => !valor.startsWith('/'))
  if (convertidos.length) {
    throw new Error(`caminho sem "/" no início (${convertidos[0]}): no Git Bash, rode com MSYS_NO_PATHCONV=1`)
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

async function main() {
  const args = lerArgs(process.argv.slice(2))
  fs.mkdirSync(args.saida, { recursive: true })
  const base = new URL(args.base)

  // Login by POST: keep the Set-Cookie (value never printed)
  let cookie = process.env.CAPTURA_COOKIE ?? ''
  if (process.env.CAPTURA_LOGIN_URL) {
    // A dev server on "localhost" may listen only on ::1 (Vite); retry before giving up.
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

  const perfil = fs.mkdtempSync(path.join(os.tmpdir(), 'capturar-telas-'))
  const porta = 9300 + Math.floor(Math.random() * 500)
  const chrome = spawn(
    caminhoDoChrome(),
    ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--remote-debugging-port=${porta}`, `--user-data-dir=${perfil}`, `--window-size=${args.largura},${args.altura}`, 'about:blank'],
    { stdio: 'ignore' }
  )
  // Windows keeps the profile locked until Chrome has really exited: wait, then clean up best-effort.
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
    const avaliar = async (expressao) =>
      (await cdp('Runtime.evaluate', { expression: expressao, awaitPromise: true, returnByValue: true })).result.value

    await cdp('Page.enable')
    await cdp('Network.enable')
    await cdp('Emulation.setDeviceMetricsOverride', { width: args.largura, height: args.altura, deviceScaleFactor: 1, mobile: false })
    if (cookie) {
      const [nome, ...resto] = cookie.split('=')
      await cdp('Network.setCookie', { name: nome.trim(), value: resto.join('='), domain: base.hostname, path: '/' })
    }

    // localStorage only exists per origin: open the base once, set the entries, then capture.
    await cdp('Page.navigate', { url: base.href })
    await espera(800)
    for (const [chave, valor] of Object.entries(armazenamento)) {
      await avaliar(`localStorage.setItem(${JSON.stringify(chave)}, ${JSON.stringify(String(valor))}); true`)
    }

    const temas = args.tema === 'ambos' ? ['claro', 'escuro'] : [args.tema]
    for (const tema of temas) {
      await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: tema === 'escuro' ? 'dark' : 'light' }] })
      if (args.chaveTema) {
        const valor = tema === 'escuro' ? args.valorEscuro : args.valorClaro
        await avaliar(`localStorage.setItem(${JSON.stringify(args.chaveTema)}, ${JSON.stringify(valor)}); true`)
      }
      for (const rota of args.rotas) {
        await cdp('Page.navigate', { url: new URL(rota.caminho, base).href })
        let pronto = false
        for (let t = 0; t < 60000 && !pronto; t += 250) {
          await espera(250)
          pronto = await avaliar(`document.readyState === 'complete' && !!document.querySelector(${JSON.stringify(args.esperar)})`)
        }
        if (!pronto) throw new Error(`${rota.caminho}: "${args.esperar}" não apareceu em 60 s`)
        await avaliar('document.fonts.ready.then(() => true)')
        await espera(1200)
        await avaliar('window.scrollTo(0, 0); true')
        const { data } = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
        const nome = `${rota.arquivo}${tema === 'escuro' ? '-escuro' : ''}.png`
        fs.writeFileSync(path.join(args.saida, nome), Buffer.from(data, 'base64'))
        console.log(`ok ${path.join(args.saida, nome)} (${args.largura}×${args.altura}, ${tema})`)
      }
    }
    ws.close()
    console.log('\nAbra cada PNG e olhe antes de usar: tela repetida, cortada ou com dado real não aparece em checagem nenhuma.')
  } finally {
    await encerrar()
  }
}

main().catch((erro) => {
  console.error(`capturar-telas: ${erro.message}`)
  process.exitCode = 1
})
