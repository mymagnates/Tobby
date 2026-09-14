// Firestore Standard does not support arrays directly nested in arrays.
// Keep the public stroke format unchanged and encode only at the storage boundary.
export function storeInventoryBatch(batch) {
  if (!batch) return batch
  return { ...batch, signatures: Object.fromEntries(Object.entries(batch.signatures || {}).map(([role, signature]) => {
    const { strokes, ...metadata } = signature
    return [role, { ...metadata, strokes_json: JSON.stringify(strokes || []) }]
  })) }
}

export function readInventoryBatch(batch) {
  if (!batch) return batch
  return { ...batch, signatures: Object.fromEntries(Object.entries(batch.signatures || {}).map(([role, signature]) => {
    const { strokes_json, ...metadata } = signature
    return [role, { ...metadata, strokes: typeof strokes_json === 'string' ? JSON.parse(strokes_json) : signature.strokes || [] }]
  })) }
}

export const storeInventory = state => ({ ...state, batch: storeInventoryBatch(state.batch) })
export const readInventory = state => ({ ...state, batch: readInventoryBatch(state.batch) })
