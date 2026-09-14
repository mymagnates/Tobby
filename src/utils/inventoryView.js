export function legacyInventoryView(record, leaseId) {
  if (!record) return null
  return {
    revision: 0,
    context: {
      lease_id: leaseId,
      lease_label: record.lease_lsid || leaseId,
      property_id: record.property_id,
      property_label: record.property_address || '',
      pm_name: '',
      tenant_name: '',
    },
    batch: null,
    legacy_keys: record.ktcs_items || null,
    items: (record.custom_items || []).map((item, index) => ({
      id: `legacy-${index}`,
      name: item.item || 'Item',
      area: item.area || '',
      closed: false,
      baseline: null,
      latest: null,
      legacy: { ...item },
    })),
  }
}
