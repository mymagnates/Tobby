import { describe, expect, it } from 'vitest'
import { inventoryRooms } from '../../../src/utils/inventoryRooms.js'

describe('inventoryRooms', () => {
  it('derives rooms from the CreateProperty spec fields', () => {
    expect(
      inventoryRooms({
        spec: {
          bedroom: 2,
          full_bathroom: 2,
          half_bathroom: 1,
          kitchen: 1,
          living_room: 1,
          dinning_area: 1,
          garage: 3,
        },
      }),
    ).toEqual([
      'Bedroom 1',
      'Bedroom 2',
      'Full Bathroom 1',
      'Full Bathroom 2',
      'Half Bathroom',
      'Kitchen',
      'Living Room',
      'Dining Area',
      'Garage',
      'Other',
    ])
  })

  it.each([
    ['bedroom', 'Bedroom'],
    ['full_bathroom', 'Full Bathroom'],
    ['half_bathroom', 'Half Bathroom'],
    ['kitchen', 'Kitchen'],
    ['living_room', 'Living Room'],
    ['dinning_area', 'Dining Area'],
  ])('uses singular and numbered labels for %s', (field, label) => {
    expect(inventoryRooms({ spec: { [field]: 1 } })).toEqual([label, 'Other'])
    expect(inventoryRooms({ spec: { [field]: '2' } })).toEqual([
      `${label} 1`,
      `${label} 2`,
      'Other',
    ])
  })

  it.each([undefined, null, {}, { spec: null }, { spec: {} }])(
    'does not invent default rooms for %j',
    (property) => {
      expect(inventoryRooms(property)).toEqual(['Other'])
    },
  )

  it.each([0, -1, '', ' ', 'invalid', null, undefined, true, [], {}, 1.5, Infinity, NaN])(
    'ignores invalid or nonpositive counts: %j',
    (count) => {
      expect(inventoryRooms({ spec: { bedroom: count, garage: count } })).toEqual(['Other'])
    },
  )

  it('represents multiple garage spaces as a single Garage', () => {
    expect(inventoryRooms({ spec: { garage: '4' } })).toEqual(['Garage', 'Other'])
  })

  it.each([100, '100'])('accepts the maximum count %j', (count) => {
    expect(inventoryRooms({ spec: { bedroom: count, garage: count } })).toEqual([
      ...Array.from({ length: 100 }, (_, index) => `Bedroom ${index + 1}`),
      'Garage',
      'Other',
    ])
  })

  it.each([101, '101', 1e9, Number.MAX_SAFE_INTEGER])(
    'ignores oversized counts %j while retaining valid and saved rooms',
    (count) => {
      expect(
        inventoryRooms(
          {
            spec: {
              bedroom: count,
              full_bathroom: count,
              half_bathroom: count,
              kitchen: 1,
              living_room: count,
              dinning_area: count,
              garage: count,
            },
          },
          ['Bedroom 101'],
        ),
      ).toEqual(['Kitchen', 'Bedroom 101', 'Other'])
      expect(inventoryRooms({ spec: { kitchen: count } })).toEqual(['Other'])
    },
  )

  it('collapses internal whitespace before deduplicating saved and generated rooms', () => {
    expect(
      inventoryRooms({ spec: { living_room: 1 } }, [
        '  living   ROOM  ',
        ' Guest\t\nBedroom ',
        'guest bedroom',
        'GUEST   BEDROOM',
        ' other\t',
      ]),
    ).toEqual(['Living Room', 'Guest Bedroom', 'Other'])
  })

  it('preserves saved rooms absent from the property and deduplicates case-insensitively', () => {
    expect(
      inventoryRooms({ spec: { kitchen: 1 } }, [
        ' kitchen ',
        ' Study ',
        'STUDY',
        'Bedroom 3',
        'other',
        'OTHER',
        '',
        ' ',
        null,
        42,
      ]),
    ).toEqual(['Kitchen', 'Study', 'Bedroom 3', 'Other'])
  })

  it('retains custom rooms without any property spec', () => {
    expect(inventoryRooms(null, ['Attic', 'Basement'])).toEqual(['Attic', 'Basement', 'Other'])
  })

  it('tolerates a missing saved-room list', () => {
    expect(inventoryRooms({}, null)).toEqual(['Other'])
  })

  it('does not mutate either input', () => {
    const property = Object.freeze({ spec: Object.freeze({ bedroom: 1 }) })
    const savedRooms = Object.freeze(['Study', 'Other'])
    expect(inventoryRooms(property, savedRooms)).toEqual(['Bedroom', 'Study', 'Other'])
    expect(property.spec).toEqual({ bedroom: 1 })
    expect(savedRooms).toEqual(['Study', 'Other'])
  })
})
