# Browser pass — starting the app, logging in, choosing routes

> The audit only judges what it saw. This file is how to see it without disturbing the user's
> environment and without touching a secret.

## 1. Start the app on its own ports

The user may already have `yarn dev` on 3333 (front) and 3693 (back). Starting another one makes Vite
fall to 3334 and the login hit the user's backend. So:

1. **The project already has a throwaway-server harness?** Use it. Example: consorcio-explica's
   `scripts/navegador/servidor-de-teste.mjs` exports `subirServidor()` — free ports, a random test
   password, the real `.env` never used, and `encerrar()` that stops only what it started. Import it
   from a small runner and pass its `base` and `senha` to the script.
2. **Otherwise**, start backend and front by hand on fixed free ports, with the secrets the app needs
   **set in the environment** (dotenv does not overwrite a variable that already exists, so the real
   `.env` is never read for them):

   ```bash
   SENHA_DO_SUPORTE=teste-local-123456 SEGREDO_DO_COOKIE=<32+ random chars> PORT=3701 yarn dev:backend
   VITE_BACKEND_URL=http://localhost:3701 yarn dev --port 3702 --strictPort   # in frontend/
   ```

   Variable names come from `.env.example` / `docs/ambiente-e-operacao.md`, never from reading `.env`.
3. **Front-only app**: `yarn dev --port 3702 --strictPort`.
4. **A URL from the user** (HML, a preview): use it as `--base`; ask for a test login if it has one.

**Stopping on Windows.** Stopping the background task leaves the children alive. Kill by port, and only
the ports you started:

```bash
netstat -ano | grep LISTENING | grep -E ':(3701|3702) '
taskkill //PID <pid> //T //F
```

Check at the end that the ports are free. Leaving a server running is a defect of the run.

## 2. Log in

Secrets go through the environment only, and the script never prints them:

| App's login | Variables |
|---|---|
| POST that answers with `Set-Cookie` | `CAPTURA_LOGIN_URL=/api/login` + `CAPTURA_LOGIN_CORPO='{"senha":"…"}'` |
| A cookie you already have | `CAPTURA_COOKIE="nome=valor"` |
| A token in `localStorage` | `CAPTURA_LOCAL_STORAGE='{"token":"…"}'` |

On Git Bash prefix the command with `MSYS_NO_PATHCONV=1`, or `/api/login` and every `/rota` turn into
`C:/Program Files/Git/...` (the script refuses to run when that happens).

## 3. The theme

The script emulates `prefers-color-scheme`. Apps that **store** the choice ignore it after the first visit:
find the key (`grep -rn localStorage src | grep -i -e tema -e theme`) and pass `--chave-tema <key>`
(plus `--valor-claro` / `--valor-escuro` if the values are not `light` / `dark`). Then trust the terminal's
`⚠ tema pedido` line: if it appears, the theme was not applied.

## 4. Routes

Read the router (`App.tsx`, `routes/`) and `docs/frontend.md`. Cover, at least:

| Kind | Why |
|---|---|
| Home / landing | first impression, hierarchy |
| The main happy flow, **with a result on screen** | where the user spends the day; often reachable by a URL with state (`/simular?caso=…`) |
| A dense list or table | where small type and alignment break first |
| A form, empty | controls side by side, labels, disabled states |
| Empty state, error, loading | if cheap to reach (below) |

Name each route after the screen (`--rota /dicionario=campos`). A route that loads data asynchronously
needs its own ready selector: `--esperar-em campos=table`, and `--tempo 120` for slow results. Long pages:
`--dobras 2` or 3.

## 5. Loading and error states without touching the backend

Use the DevTools `Fetch` domain from a small runner (the script does not do this): `Fetch.enable` with
`urlPattern: "*/api/*"`, then on `Fetch.requestPaused` delay and `Fetch.continueRequest` (loading), or
`Fetch.fulfillRequest` with `responseCode: 500` and a base64 body (error). If the project already has a
states smoke (consorcio-explica: `yarn smoke:estados --saida <pasta>`), run it and read its PNGs instead.

## 6. Cursor

In Cursor, the browser MCP (`cursor-ide-browser`) can navigate and screenshot interactively, which helps
to reach a state the script cannot (a dialog, an open dropdown). It does not replace the script: the
measured `medidas.json` and the light/dark × desktop/phone matrix come only from the script.

## 7. When it fails

Chrome not found, the app not starting, the login refused, a ready selector that never appears: **stop**.
Report the blocker in the chat with the exact error. Do not write a report from the code alone.
