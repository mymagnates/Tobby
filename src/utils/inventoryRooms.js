const roomSpecs = [
  ['bedroom', 'Bedroom'],
  ['full_bathroom', 'Full Bathroom'],
  ['half_bathroom', 'Half Bathroom'],
  ['kitchen', 'Kitchen'],
  ['living_room', 'Living Room'],
  ['dinning_area', 'Dining Area'],
  ['garage', 'Garage'],
]

/** Return property-derived room names, saved/custom names, and a final Other option. */
export function inventoryRooms(property, savedRooms = []) {
  const rooms = []
  const seen = new Set(['other'])
  const addRoom = (value) => {
    if (typeof value !== 'string') return
    const name = value.trim().replace(/\s+/g, ' ')
    const key = name.toLowerCase()
    if (!name || seen.has(key)) return
    seen.add(key)
    rooms.push(name)
  }

  for (const [field, label] of roomSpecs) {
    const value = property?.spec?.[field]
    if (typeof value !== 'number' && typeof value !== 'string') continue
    const count = Number(value)
    // Ignore implausible counts rather than expanding corrupted property data.
    if (!Number.isSafeInteger(count) || count <= 0 || count > 100) continue
    // Garage counts parking spaces, not separate inventory rooms.
    if (field === 'garage' || count === 1) {
      addRoom(label)
    } else {
      for (let index = 1; index <= count; index += 1) {
        addRoom(`${label} ${index}`)
      }
    }
  }

  if (Array.isArray(savedRooms)) savedRooms.forEach(addRoom)
  return [...rooms, 'Other']
}
