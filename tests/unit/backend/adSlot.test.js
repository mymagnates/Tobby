import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createApiServer } from '../../../backend/apiServer.js'
import { createInMemoryStore } from '../../../backend/store.js'

let server
let baseUrl
let store
let impressionToken

const call = async (path, options = {}) => {
  const response = await fetch(`${baseUrl}${path}`, options)
  const contentType = response.headers.get('content-type') || ''
  const payload = contentType.includes('application/json') ? await response.json() : null
  return { response, payload }
}

describe('Ad Slot post delivery', () => {
  beforeAll(async () => {
    store = createInMemoryStore()
    const runtime = createApiServer({ store })
    server = runtime.server
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
    const { port } = server.address()
    baseUrl = `http://127.0.0.1:${port}`
  })

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve))
  })

  it('ingests an SP post with region targets', async () => {
    const { response, payload } = await call('/sp/posts/ingest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': 'u-sp-1',
      },
      body: JSON.stringify({
        source_code: 'sp_plumbing_v1',
        source_post_id: 'p_1001',
        service_type: 'plumbing',
        service_type_label: 'Plumbing',
        title: '24h Leak Fix',
        summary: 'Licensed plumber available tonight.',
        image_url: 'https://cdn.example.com/p_1001.jpg',
        landing_url_template: 'https://sp.example.com/handout/h123?post_id={post_id}',
        target_regions: [{ region_level: 'state', region_code: 'US-CA' }],
        priority: 20,
        delivery_type: 'organic',
      }),
    })
    expect(response.status).toBe(200)
    expect(payload.upserted).toBe(true)
    expect(typeof payload.post_id).toBe('string')
  })

  it('returns matched ad slot item with fixed card size and bottom-left label', async () => {
    const { response, payload } = await call('/ad-slots/pm_feed_top/feed?limit=1', {
      headers: {
        'X-User-Id': 'u-pm-1',
      },
    })
    expect(response.status).toBe(200)
    expect(payload.slot_id).toBe('pm_feed_top')
    expect(payload.items.length).toBe(1)
    const first = payload.items[0]
    expect(first.service_type_label).toBe('Plumbing')
    expect(first.label_position).toBe('bottom_left')
    expect(first.card_spec).toMatchObject({
      width_px: 320,
      height_px: 180,
      image_aspect_ratio: '16:9',
    })
    expect(first.tracking.click_url).toContain('/api/ad-events/click/')
    impressionToken = first.impression_token

    const second = await call('/ad-slots/pm_feed_top/feed?limit=1', {
      headers: {
        'X-User-Id': 'u-pm-1',
      },
    })
    expect(second.response.status).toBe(200)
    expect(second.response.headers.get('x-feed-cache')).toBe('HIT')
    expect(second.payload.items[0].impression_token).toBe(impressionToken)
  })

  it('records impression once per token (idempotent)', async () => {
    const first = await call('/ad-events/impression', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': 'u-pm-1',
      },
      body: JSON.stringify({
        impression_token: impressionToken,
        viewport_ratio: 0.8,
        dwell_ms: 1250,
      }),
    })
    expect(first.response.status).toBe(200)
    expect(first.payload.recorded).toBe(true)

    const second = await call('/ad-events/impression', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': 'u-pm-1',
      },
      body: JSON.stringify({
        impression_token: impressionToken,
        viewport_ratio: 0.8,
        dwell_ms: 1250,
      }),
    })
    expect(second.response.status).toBe(200)
    expect(second.payload.recorded).toBe(false)
    expect(store.adImpressionEvents.size).toBe(1)
  })

  it('counts click and redirects to SP handout URL with post id', async () => {
    const response = await fetch(`${baseUrl}/api/ad-events/click/${impressionToken}`, {
      headers: { 'X-User-Id': 'u-pm-1' },
      redirect: 'manual',
    })
    expect(response.status).toBe(302)
    const location = response.headers.get('location')
    expect(location).toContain('https://sp.example.com/handout/h123')
    expect(location).toContain('post_id=p_1001')
    expect(store.adClickEvents.size).toBe(1)

    const second = await fetch(`${baseUrl}/api/ad-events/click/${impressionToken}`, {
      headers: { 'X-User-Id': 'u-pm-1' },
      redirect: 'manual',
    })
    expect(second.status).toBe(302)
    expect(store.adClickEvents.size).toBe(1)
  })

  it('blocks feed when user region does not match post target region', async () => {
    const { response, payload } = await call('/ad-slots/pm_feed_top/feed?limit=1', {
      headers: {
        'X-User-Id': 'u-pm-2',
        'X-User-Role': 'pm_po',
        'X-User-Country': 'US',
        'X-User-State': 'NY',
        'X-User-City': 'US-NY-NYC',
      },
    })
    expect(response.status).toBe(200)
    expect(payload.items.length).toBe(0)
  })
})
