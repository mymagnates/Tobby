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

function buildSvg(size) {
  const radius = Math.round(size * 0.24)
  const stroke = Math.max(2, Math.round(size * 0.045))
  const fontSize = Math.round(size * 0.56)
  const shadowY = Math.max(1, Math.round(size * 0.03))

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#82A6D7"/>
      <stop offset="100%" stop-color="#5D8BC4"/>
    </linearGradient>
    <linearGradient id="stroke" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#DCE8F8"/>
      <stop offset="100%" stop-color="#FFFFFF"/>
    </linearGradient>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="${shadowY}" stdDeviation="${Math.max(1, Math.round(size * 0.03))}" flood-color="#1E3A5C" flood-opacity="0.25"/>
    </filter>
  </defs>
  <rect x="0" y="0" width="${size}" height="${size}" rx="${radius}" fill="url(#bg)"/>
  <text x="50%" y="54%"
        text-anchor="middle"
        dominant-baseline="middle"
        font-family="Pacifico, Brush Script MT, Segoe Script, cursive"
        font-size="${fontSize}"
        font-weight="700"
        fill="#FFFFFF"
        stroke="url(#stroke)"
        stroke-width="${stroke}"
        paint-order="stroke fill"
        filter="url(#softShadow)">H</text>
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

  console.log('Favicons generated from Handout text logo.')
}

run().catch((err) => {
  console.error('Failed to generate favicons:', err)
  process.exit(1)
})
