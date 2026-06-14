import fs from 'node:fs'
import { createApiServer } from './apiServer.js'

const loadLocalEnv = (filePath) => {
  if (!fs.existsSync(filePath)) return
  const content = fs.readFileSync(filePath, 'utf8')
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIndex = trimmed.indexOf('=')
    if (eqIndex < 0) continue
    const key = trimmed.slice(0, eqIndex).trim()
    if (!key || process.env[key] !== undefined) continue
    const value = trimmed.slice(eqIndex + 1).trim()
    process.env[key] = value
  }
}

loadLocalEnv(new URL('./.env.local', import.meta.url))

const port = Number(process.env.PORT || 8787)
const { server } = createApiServer()

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend API listening on http://localhost:${port}`)
})
