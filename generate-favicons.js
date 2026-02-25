import fs from 'fs/promises'
import path from 'path'
import sharp from 'sharp'

const projectRoot = process.cwd()
const publicDir = path.join(projectRoot, 'public')
const iconsDir = path.join(publicDir, 'icons')

const sizes = [
  { file: 'favicon-16x16.png', size: 16 },
  { file: 'favicon-32x32.png', size: 32 },
  { file: 'favicon-96x96.png', size: 96 },
  { file: 'favicon-128x128.png', size: 128 },
  { file: 'apple-touch-icon.png', size: 180 },
  { file: 'android-chrome-192x192.png', size: 192 },
  { file: 'android-chrome-512x512.png', size: 512 },
]

// V3 Soft design from design_samples_v4 - icon-only h-block for favicon
function buildSvg(size) {
  const radius = Math.round(size * (72 / 280))
  const fontSize = Math.round(size * (220 / 280))
  const x = Math.round(size * (83 / 280))
  const y = Math.round(size * (206 / 280))

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="${size}" height="${size}" rx="${radius}" fill="#1E3A5F"/>
  <text x="${x}" y="${y}" font-family="Helvetica, Arial, sans-serif" font-size="${fontSize}" font-weight="700" fill="#F8FAFC">h</text>
</svg>`
}

async function writeFileFromSvg(outPath, size) {
  const svg = buildSvg(size)
  await sharp(Buffer.from(svg))
    .png()
    .toFile(outPath)
}

async function run() {
  await fs.mkdir(iconsDir, { recursive: true })

  await Promise.all(
    sizes.map(({ file, size }) => writeFileFromSvg(path.join(iconsDir, file), size)),
  )

  // Keep favicon.ico path used by index.html. Browsers accept PNG payload.
  await writeFileFromSvg(path.join(publicDir, 'favicon.ico'), 32)

  // SVG favicon reference in index.html.
  const svgLogo = buildSvg(200)
  await fs.writeFile(path.join(publicDir, 'logo.svg'), svgLogo, 'utf8')

  console.log('Favicons generated from Handout h-block logo.')
}

run().catch((err) => {
  console.error('Failed to generate favicons:', err)
  process.exit(1)
})
