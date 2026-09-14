import { readFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { init, parse } from 'es-module-lexer'
await init
const root = resolve('dist/spa')
const html = await readFile(resolve(root, 'index.html'), 'utf8')
const entry = html.match(/<script[^>]+src="([^"]+\.js)"/)?.[1]
if (!entry) throw new Error('Build the Web app before checking PDF code splitting.')
const visited = new Set()
async function walk(file) {
  if (visited.has(file)) return
  visited.add(file)
  const source = await readFile(file, 'utf8')
  for (const specifier of parse(source)[0]) {
    if (specifier.d !== -1 || !specifier.n?.startsWith('.')) continue
    await walk(resolve(dirname(file), specifier.n))
  }
}
await walk(resolve(root, entry.replace(/^\//, '')))
if ([...visited].some(file => /(?:pdf-vendor|reportPdf)-/.test(file)))
  throw new Error('PDF code leaked into the startup static import graph.')
if (/modulepreload[^>]+(?:pdf-vendor|reportPdf)-/.test(html))
  throw new Error('PDF code is preloaded at startup.')
console.log(`PASS: ${visited.size} startup chunks inspected; PDF dependencies load only through the export import.`)
