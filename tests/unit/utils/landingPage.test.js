import { readFileSync, existsSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

const publicRoot = resolve('public')
const html = readFileSync(resolve(publicRoot, 'landing.html'), 'utf8')
const parse = () => new DOMParser().parseFromString(html, 'text/html')

describe('PM/Owner landing page', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    history.replaceState(null, '', '/')
  })

  it('keeps PM/Owner entry points and removes deferred marketplace promotion', () => {
    const page = parse()
    expect(page.querySelectorAll('h1')).toHaveLength(1)
    expect(page.querySelectorAll('a[href="/public/pmpo-signup"]').length).toBeGreaterThan(0)
    expect(page.querySelectorAll('[data-login-link]')).toHaveLength(1)
    expect(html).not.toMatch(/sp-signup|request a bid|service partners|console-property-rail/i)
    expect(page.body.textContent).toContain('Sample data')
  })

  it('references existing static files or supported application paths and anchors', () => {
    const page = parse()
    const appPaths = new Set(['/public/login', '/public/pmpo-signup'])
    const references = [...page.querySelectorAll('[href], [src], source[srcset]')].map(
      (node) =>
        node.getAttribute('href') || node.getAttribute('src') || node.getAttribute('srcset'),
    )
    for (const value of references) {
      if (value.startsWith('#')) expect(page.getElementById(value.slice(1)), value).not.toBeNull()
      else if (!appPaths.has(value))
        expect(existsSync(resolve(publicRoot, `.${value}`)), value).toBe(true)
    }
  })

  it('uses lightweight, well-formed vector previews with mobile-specific art', () => {
    const page = parse()
    expect(page.querySelector('picture source').getAttribute('media')).toBe('(max-width: 600px)')
    const files = [
      'workspace-dashboard.svg',
      'workspace-dashboard-mobile.svg',
      'workspace-property-record.svg',
    ]
    let bytes = 0
    for (const name of files) {
      const path = resolve(publicRoot, 'images', name)
      const svg = new DOMParser().parseFromString(readFileSync(path, 'utf8'), 'image/svg+xml')
      expect(svg.querySelector('parsererror')).toBeNull()
      expect(svg.querySelector('svg title')).not.toBeNull()
      expect(svg.querySelector('script, foreignObject')).toBeNull()
      bytes += statSync(path).size
    }
    expect(bytes).toBeLessThan(25000)
    expect(page.querySelector('picture img').getAttribute('fetchpriority')).toBe('high')
    expect(page.querySelector('.record-preview img').getAttribute('loading')).toBe('lazy')
  })

  it('preserves the login redirect query without executing it on the public page', () => {
    const page = parse()
    document.body.innerHTML = '<a data-login-link href="/public/login">Sign in</a>'
    history.replaceState(null, '', '/landing.html?redirect=%2Fdocuments%3FpropertyId%3Dsample')
    new Function(page.querySelector('script').textContent)()
    const login = new URL(document.querySelector('a').href)
    expect(login.pathname).toBe('/public/login')
    expect(login.searchParams.get('redirect')).toBe('/documents?propertyId=sample')
    expect(window.location.pathname).toBe('/landing.html')
  })
})
