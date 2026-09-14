import { describe, expect, it } from 'vitest'
import { legacyInventoryView } from '../../../src/utils/inventoryView.js'

describe('legacy inventory read-only projection', () => {
  it('keeps an absent list absent', () => {
    expect(legacyInventoryView(null, 'lease-1')).toBeNull()
  })

  it('inherits canonical lease context and preserves both inspection records', () => {
    const record = {
      lease_lsid: 'LS-123',
      property_id: 'property-1',
      property_address: 'Example property',
      ktcs_items: { front_door: { received: 2, returned: 1 } },
      custom_items: [
        {
          item: 'Refrigerator',
          area: 'Kitchen',
          move_in_comment: 'Clean',
          move_in_photo_url: 'https://example.test/in.jpg',
          move_out_comment: 'Scratch',
          move_out_photo_url: 'https://example.test/out.jpg',
        },
      ],
    }
    const view = legacyInventoryView(record, 'lease-1')
    expect(view.context).toMatchObject({
      lease_id: 'lease-1',
      lease_label: 'LS-123',
      property_id: 'property-1',
      property_label: 'Example property',
    })
    expect(view.items[0].legacy).toEqual(record.custom_items[0])
    expect(view.legacy_keys).toEqual(record.ktcs_items)
    expect(view.batch).toBeNull()
    expect(view.items[0]).toMatchObject({ baseline: null, latest: null, closed: false })
    expect(record.custom_items[0]).not.toHaveProperty('baseline')
  })

  it('supports an existing empty list without inventing items or confirmation', () => {
    expect(legacyInventoryView({}, 'lease-1')).toMatchObject({
      context: { lease_label: 'lease-1' },
      items: [],
      batch: null,
    })
  })
})
