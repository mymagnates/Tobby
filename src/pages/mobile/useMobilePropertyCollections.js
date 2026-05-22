import { computed, ref } from 'vue'
import { useFirebase } from 'src/composables/useFirebase'
import { useUserDataStore } from 'src/stores/userDataStore'

const COLLECTIONS = ['documents', 'reminders', 'services', 'assets']

export function useMobilePropertyCollections() {
  const userDataStore = useUserDataStore()
  const { getAllDocuments } = useFirebase()
  const loading = ref(false)
  const documents = ref([])
  const reminders = ref([])
  const services = ref([])
  const assets = ref([])

  const properties = computed(() => userDataStore.userAccessibleProperties || [])

  const loadCollection = async (propertyId, collectionName) => {
    const rows = await getAllDocuments(`properties/${propertyId}/${collectionName}`).catch(() => [])
    return (rows || []).map((row) => ({ ...row, property_id: row.property_id || propertyId }))
  }

  const loadMobilePropertyCollections = async (propertyIds = []) => {
    const ids = (propertyIds.length ? propertyIds : properties.value.map((property) => property.id || property.property_id))
      .map((id) => String(id || '').trim())
      .filter(Boolean)

    loading.value = true
    try {
      const results = await Promise.all(ids.flatMap((propertyId) =>
        COLLECTIONS.map(async (collectionName) => ({
          collectionName,
          rows: await loadCollection(propertyId, collectionName),
        })),
      ))

      documents.value = results.filter((result) => result.collectionName === 'documents').flatMap((result) => result.rows)
      reminders.value = results.filter((result) => result.collectionName === 'reminders').flatMap((result) => result.rows)
      services.value = results.filter((result) => result.collectionName === 'services').flatMap((result) => result.rows)
      assets.value = results.filter((result) => result.collectionName === 'assets').flatMap((result) => result.rows)
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    documents,
    reminders,
    services,
    assets,
    loadMobilePropertyCollections,
  }
}
