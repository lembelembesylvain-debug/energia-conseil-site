import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

const PRETTY_URLS = {
  "/diagnostic-rapide": "/diagnostic-rapide.html",
  "/diagnostic-rapide/": "/diagnostic-rapide.html",
  "/immobilier-chagny": "/immobilier-chagny/index.html",
  "/immobilier-chagny/": "/immobilier-chagny/index.html",
  "/estimer": "/immobilier-chagny/index.html",
  "/estimer/": "/immobilier-chagny/index.html",
}

function prettyUrlAndLocalApi() {
  const rewrite = (req) => {
    const path = req.url?.split("?")[0]
    const dest = PRETTY_URLS[path]
    if (dest) req.url = dest + (req.url?.includes("?") ? `?${req.url.split("?")[1]}` : "")
  }

  const handleEstimerApi = async (req, res) => {
    const chunks = []
    for await (const chunk of req) chunks.push(chunk)
    let body = {}
    try {
      const raw = Buffer.concat(chunks).toString("utf8")
      body = raw ? JSON.parse(raw) : {}
    } catch {
      res.statusCode = 400
      res.setHeader("Content-Type", "application/json")
      res.end(JSON.stringify({ error: "JSON invalide." }))
      return
    }
    const { default: handler } = await import("./api/estimer-chagny.js")
    await handler({ method: "POST", body }, jsonRes(res))
  }

  const readJsonBody = async (req) => {
    const chunks = []
    for await (const chunk of req) chunks.push(chunk)
    const raw = Buffer.concat(chunks).toString("utf8")
    return raw ? JSON.parse(raw) : {}
  }

  const jsonRes = (res) => ({
    statusCode: 200,
    status(code) {
      this.statusCode = code
      return this
    },
    setHeader(name, value) {
      res.setHeader(name, value)
      return this
    },
    json(payload) {
      res.statusCode = this.statusCode
      res.setHeader("Content-Type", "application/json; charset=utf-8")
      res.end(JSON.stringify(payload))
    },
    end(payload) {
      res.statusCode = this.statusCode
      res.end(payload)
    },
  })

  const handleSniperApi = async (req, res) => {
    const { default: handler } = await import("./api/proptech-sniper.js")
    const url = new URL(req.url, "http://localhost")
    await handler(
      { method: "GET", query: Object.fromEntries(url.searchParams), url: req.url },
      jsonRes(res),
    )
  }

  const handleSauvegardeArtisansApi = async (req, res) => {
    let body = {}
    try {
      body = await readJsonBody(req)
    } catch {
      res.statusCode = 400
      res.setHeader("Content-Type", "application/json")
      res.end(JSON.stringify({ error: "JSON invalide." }))
      return
    }
    const { default: handler } = await import("./api/sauvegarde-artisans-rge.js")
    await handler({ method: "POST", body }, jsonRes(res))
  }

  const handleRelevesPhotosApi = async (req, res) => {
    const url = new URL(req.url, "http://localhost")
    let body = {}
    if (req.method === "POST") {
      try {
        body = await readJsonBody(req)
      } catch {
        res.statusCode = 400
        res.setHeader("Content-Type", "application/json")
        res.end(JSON.stringify({ error: "JSON invalide." }))
        return
      }
    }
    const { default: handler } = await import("./api/releves-photos.js")
    await handler(
      { method: req.method, query: Object.fromEntries(url.searchParams), body },
      jsonRes(res),
    )
  }

  const handleSauvegardeApi = async (req, res) => {
    let body = {}
    try {
      body = await readJsonBody(req)
    } catch {
      res.statusCode = 400
      res.setHeader("Content-Type", "application/json")
      res.end(JSON.stringify({ error: "JSON invalide." }))
      return
    }
    const { default: handler } = await import("./api/sauvegarde-proptech.js")
    await handler({ method: "POST", body }, jsonRes(res))
  }

  const handleMessagerieEmail = async (req, res) => {
    let body = {}
    try {
      body = await readJsonBody(req)
    } catch {
      res.statusCode = 400
      res.setHeader("Content-Type", "application/json")
      res.end(JSON.stringify({ error: "JSON invalide." }))
      return
    }
    const { default: handler } = await import("./api/messagerie-email.js")
    await handler({ method: "POST", body }, jsonRes(res))
  }

  const handleDemandeVisiteCatarina = async (req, res) => {
    let body = {}
    try {
      body = await readJsonBody(req)
    } catch {
      res.statusCode = 400
      res.setHeader("Content-Type", "application/json")
      res.end(JSON.stringify({ ok: false, error: "JSON invalide." }))
      return
    }
    const { default: handler } = await import("./api/demandes-visite-catarina.js")
    await handler({ method: "POST", body }, jsonRes(res))
  }

  const middleware = (req, res, next) => {
    const path = req.url?.split("?")[0]
    if (path === "/api/estimer-chagny" && req.method === "POST") {
      handleEstimerApi(req, res).catch(next)
      return
    }
    if (path === "/api/proptech-sniper" && req.method === "GET") {
      handleSniperApi(req, res).catch(next)
      return
    }
    if (path === "/api/sauvegarde-proptech" && req.method === "POST") {
      handleSauvegardeApi(req, res).catch(next)
      return
    }
    if (path === "/api/sauvegarde-artisans-rge" && req.method === "POST") {
      handleSauvegardeArtisansApi(req, res).catch(next)
      return
    }
    if (path === "/api/demandes-visite-catarina" && req.method === "POST") {
      handleDemandeVisiteCatarina(req, res).catch(next)
      return
    }
    if (path === "/api/messagerie-email" && req.method === "POST") {
      handleMessagerieEmail(req, res).catch(next)
      return
    }
    if (path === "/api/releves-photos" && (req.method === "GET" || req.method === "POST")) {
      handleRelevesPhotosApi(req, res).catch(next)
      return
    }
    if (path === "/estimer.php" && req.method === "POST") {
      req.resume()
      req.on("end", () => {
        res.statusCode = 200
        res.setHeader("Content-Type", "application/json; charset=utf-8")
        res.end(JSON.stringify({ ok: true, delivered: false, reason: "dev local sans PHP" }))
      })
      return
    }
    rewrite(req)
    next()
  }

  return {
    name: "pretty-url-and-local-api",
    configureServer(server) {
      server.middlewares.use(middleware)
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware)
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    prettyUrlAndLocalApi(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        'maison-3d': resolve(__dirname, 'maison-3d-thermique-interactive.html'),
      },
    },
  },
})
