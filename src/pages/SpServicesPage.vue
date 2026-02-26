<template>
  <q-page class="sp-services-page q-pa-sm">
    <div class="services-shell">
      <q-card class="services-card q-mb-sm">
        <q-card-section class="row items-center justify-between">
          <div>
            <div class="text-subtitle1 text-weight-medium">Services</div>
            <div class="text-caption text-grey-7">
              Maintain your service scope for matching and marketplace discovery.
            </div>
          </div>
          <q-btn
            color="primary"
            no-caps
            icon="save"
            label="Save"
            :loading="saving"
            @click="saveProfile"
          />
        </q-card-section>
      </q-card>

      <q-card class="services-card q-mb-sm">
        <q-card-section>
          <div class="text-subtitle2 text-weight-medium q-mb-sm">Service Descriptions</div>
          <div class="text-caption text-grey-7 q-mb-sm">
            Add multiple service descriptions. Each description is limited to 20 words.
          </div>
          <div class="row q-col-gutter-sm items-start q-mb-sm">
            <div class="col-12 col-md">
              <q-input
                v-model="newDescription"
                type="textarea"
                autogrow
                dense
                outlined
                :error="descriptionWordCount > 20"
                :error-message="'Maximum 20 words per description.'"
                label="Service description"
              />
              <div class="text-caption text-grey-6 q-mt-xs">
                {{ descriptionWordCount }}/20 words
              </div>
            </div>
            <div class="col-auto">
              <q-btn
                color="primary"
                no-caps
                icon="add"
                label="Add"
                :disable="!canAddDescription"
                @click="addDescription"
              />
            </div>
          </div>

          <q-list bordered separator v-if="serviceDescriptions.length">
            <q-item v-for="(desc, index) in serviceDescriptions" :key="`${index}-${desc}`">
              <q-item-section>
                <q-item-label>{{ desc }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn flat round dense icon="delete" color="negative" @click="removeDescription(index)" />
              </q-item-section>
            </q-item>
          </q-list>
          <q-banner v-else rounded class="bg-grey-2 text-grey-8">
            No descriptions added yet.
          </q-banner>
        </q-card-section>
      </q-card>

      <q-card class="services-card q-mb-sm">
        <q-card-section>
          <div class="text-subtitle2 text-weight-medium q-mb-sm">Service Area</div>
          <div class="text-caption text-grey-7 q-mb-sm">
            ZIP codes are generated automatically from your drawn service area and stored in background.
          </div>

          <div class="row items-center justify-between q-mb-xs">
            <div class="text-subtitle2 text-weight-medium">Coverage Map</div>
            <q-btn
              flat
              dense
              no-caps
              icon="delete_outline"
              label="Clear Drawn Area"
              color="grey-7"
              :disable="!hasDrawnArea"
              @click="clearDrawnArea"
            />
          </div>
          <div class="text-caption text-grey-7 q-mb-sm">
            Draw a circle, polygon, or rectangle on the map. ZIP codes inside the selected area are detected and added automatically.
          </div>
          <q-banner v-if="mapError" rounded class="bg-red-1 text-red-9 q-mb-sm">
            {{ mapError }}
          </q-banner>
          <q-banner v-else-if="extractingZipCodes" rounded class="bg-blue-1 text-primary q-mb-sm">
            Detecting ZIP codes from selected area...
          </q-banner>
          <div class="map-frame">
            <div ref="mapCanvasRef" class="map-canvas" />
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Notify } from 'quasar'
import { useFirebase } from 'src/composables/useFirebase'
import { useUserDataStore } from 'src/stores/userDataStore'

const userStore = useUserDataStore()
const { getDocument, createDocument, updateDocument } = useFirebase()

const saving = ref(false)
const newDescription = ref('')
const serviceDescriptions = ref([])
const serviceZipCodes = ref([])
const mapCanvasRef = ref(null)
const hasDrawnArea = ref(false)
const extractingZipCodes = ref(false)
const mapError = ref('')
const savedAreaShape = ref(null)
const savedMapView = ref(null)

const wordCount = (value) => {
  const text = String(value || '').trim()
  if (!text) return 0
  return text.split(/\s+/).length
}

const descriptionWordCount = computed(() => wordCount(newDescription.value))
const canAddDescription = computed(() => {
  const text = String(newDescription.value || '').trim()
  return Boolean(text) && wordCount(text) <= 20
})

const ENV_GOOGLE_MAPS_API_KEY = String(import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '').trim()
const LOCAL_STORAGE_MAPS_KEY = 'handout_google_maps_api_key'
const localGoogleMapsApiKey = ref('')

const effectiveGoogleMapsApiKey = computed(() =>
  String(localGoogleMapsApiKey.value || ENV_GOOGLE_MAPS_API_KEY || '').trim()
)

let mapsApiPromise = null
let mapInstance = null
let geocoder = null
let drawingManager = null
let activeOverlay = null
const getMapSnapshotKey = () => `handout_sp_service_map_snapshot_${userStore.userId || 'anonymous'}`

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const saveLocalMapSnapshot = () => {
  if (!userStore.userId) return
  try {
    const payload = {
      service_area_shape: savedAreaShape.value || null,
      service_map_view: savedMapView.value || null,
      saved_at: new Date().toISOString(),
    }
    localStorage.setItem(getMapSnapshotKey(), JSON.stringify(payload))
  } catch {
    // best-effort local cache
  }
}

const loadLocalMapSnapshot = () => {
  if (!userStore.userId) return null
  try {
    const raw = localStorage.getItem(getMapSnapshotKey())
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    return parsed
  } catch {
    return null
  }
}

const captureCurrentMapView = () => {
  if (!mapInstance) return null
  const center = mapInstance.getCenter()
  if (!center) return null
  return {
    center: { lat: center.lat(), lng: center.lng() },
    zoom: mapInstance.getZoom() || 4,
  }
}

const loadGoogleMaps = async () => {
  const key = effectiveGoogleMapsApiKey.value
  if (!key) {
    throw new Error('Google Maps API key missing. Set VITE_GOOGLE_MAPS_API_KEY to enable map drawing.')
  }

  if (window.google?.maps?.drawing && window.google?.maps?.geometry) return window.google
  if (mapsApiPromise) return mapsApiPromise

  mapsApiPromise = new Promise((resolve, reject) => {
    const callbackName = '__handoutGoogleMapsInit'
    window[callbackName] = () => {
      resolve(window.google)
      delete window[callbackName]
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=drawing,geometry&callback=${callbackName}`
    script.async = true
    script.defer = true
    script.onerror = () => {
      reject(new Error('Failed to load Google Maps script.'))
      delete window[callbackName]
    }
    document.head.appendChild(script)
  })

  return mapsApiPromise
}

const extractPostalCode = (results = []) => {
  for (const result of results) {
    const postalComponent = (result.address_components || []).find((component) =>
      Array.isArray(component.types) && component.types.includes('postal_code')
    )
    if (postalComponent?.long_name && /^\d{5}$/.test(postalComponent.long_name)) {
      return postalComponent.long_name
    }
  }
  return ''
}

const geocodeToZip = (latLng) =>
  new Promise((resolve) => {
    if (!geocoder) {
      resolve('')
      return
    }
    geocoder.geocode({ location: latLng }, (results, status) => {
      if (status !== 'OK') {
        resolve('')
        return
      }
      resolve(extractPostalCode(results))
    })
  })

const containsPointInOverlay = (latLng, overlay, overlayType) => {
  const google = window.google
  if (!google || !overlay) return false
  if (overlayType === 'polygon') {
    return google.maps.geometry.poly.containsLocation(latLng, overlay)
  }
  if (overlayType === 'circle') {
    return (
      google.maps.geometry.spherical.computeDistanceBetween(latLng, overlay.getCenter()) <= overlay.getRadius()
    )
  }
  if (overlayType === 'rectangle') {
    return overlay.getBounds()?.contains(latLng) || false
  }
  return false
}

const getOverlayBounds = (overlay, overlayType) => {
  const google = window.google
  if (!google || !overlay) return null
  if (overlayType === 'circle' || overlayType === 'rectangle') return overlay.getBounds()
  if (overlayType === 'polygon') {
    const bounds = new google.maps.LatLngBounds()
    overlay.getPath().forEach((point) => bounds.extend(point))
    return bounds
  }
  return null
}

const samplePointsFromOverlay = (overlay, overlayType) => {
  const google = window.google
  const bounds = getOverlayBounds(overlay, overlayType)
  if (!google || !bounds) return []

  const sw = bounds.getSouthWest()
  const ne = bounds.getNorthEast()
  const steps = 6
  const points = []

  for (let latStep = 0; latStep <= steps; latStep += 1) {
    for (let lngStep = 0; lngStep <= steps; lngStep += 1) {
      const lat = sw.lat() + ((ne.lat() - sw.lat()) * latStep) / steps
      const lng = sw.lng() + ((ne.lng() - sw.lng()) * lngStep) / steps
      const latLng = new google.maps.LatLng(lat, lng)
      if (containsPointInOverlay(latLng, overlay, overlayType)) points.push(latLng)
    }
  }

  if (overlayType === 'circle') points.push(overlay.getCenter())
  if (overlayType === 'rectangle') points.push(bounds.getCenter())
  if (overlayType === 'polygon' && overlay.getPath().getLength() > 0) points.push(overlay.getPath().getAt(0))

  return points.slice(0, 28)
}

const mergeZipCodes = (zips) => {
  if (!Array.isArray(zips) || !zips.length) return
  const merged = new Set(serviceZipCodes.value)
  zips.forEach((zip) => merged.add(zip))
  serviceZipCodes.value = Array.from(merged).sort()
}

const resolveZipCodesFromOverlay = async (overlay, overlayType) => {
  extractingZipCodes.value = true
  try {
    const points = samplePointsFromOverlay(overlay, overlayType)
    if (!points.length) return []

    const zips = new Set()
    for (const point of points) {
      const zip = await geocodeToZip(point)
      if (zip) zips.add(zip)
      if (zips.size >= 20) break
      await sleep(80)
    }
    return Array.from(zips)
  } finally {
    extractingZipCodes.value = false
  }
}

const serializeOverlay = (overlay, overlayType) => {
  if (!overlay) return null
  if (overlayType === 'circle') {
    const center = overlay.getCenter()
    return {
      type: 'circle',
      center: { lat: center.lat(), lng: center.lng() },
      radius: overlay.getRadius(),
    }
  }
  if (overlayType === 'rectangle') {
    const bounds = overlay.getBounds()
    const ne = bounds?.getNorthEast()
    const sw = bounds?.getSouthWest()
    if (!ne || !sw) return null
    return {
      type: 'rectangle',
      bounds: {
        ne: { lat: ne.lat(), lng: ne.lng() },
        sw: { lat: sw.lat(), lng: sw.lng() },
      },
    }
  }
  if (overlayType === 'polygon') {
    const path = []
    overlay.getPath().forEach((point) => {
      path.push({ lat: point.lat(), lng: point.lng() })
    })
    return { type: 'polygon', path }
  }
  return null
}

const createOverlayFromShape = (shape) => {
  const google = window.google
  if (!google || !mapInstance || !shape?.type) return null

  const commonStyle = {
    fillColor: '#1976d2',
    fillOpacity: 0.2,
    strokeColor: '#1976d2',
    strokeWeight: 2,
    editable: false,
    map: mapInstance,
  }

  if (shape.type === 'circle' && shape.center && shape.radius) {
    return new google.maps.Circle({
      ...commonStyle,
      center: shape.center,
      radius: shape.radius,
    })
  }

  if (shape.type === 'rectangle' && shape.bounds?.ne && shape.bounds?.sw) {
    return new google.maps.Rectangle({
      ...commonStyle,
      bounds: new google.maps.LatLngBounds(shape.bounds.sw, shape.bounds.ne),
    })
  }

  if (shape.type === 'polygon' && Array.isArray(shape.path) && shape.path.length >= 3) {
    return new google.maps.Polygon({
      ...commonStyle,
      paths: shape.path,
    })
  }

  return null
}

const clearDrawnArea = ({ resetSavedShape = true } = {}) => {
  if (activeOverlay) {
    activeOverlay.setMap(null)
    activeOverlay = null
  }
  hasDrawnArea.value = false
  if (resetSavedShape) {
    savedAreaShape.value = null
    savedMapView.value = captureCurrentMapView()
    saveLocalMapSnapshot()
  }
}

const handleOverlayComplete = async (event) => {
  clearDrawnArea({ resetSavedShape: false })
  activeOverlay = event.overlay
  hasDrawnArea.value = true

  const overlayType = event.type
  savedAreaShape.value = serializeOverlay(activeOverlay, overlayType)
  const bounds = getOverlayBounds(activeOverlay, overlayType)
  if (bounds && mapInstance) mapInstance.fitBounds(bounds)
  savedMapView.value = captureCurrentMapView()
  saveLocalMapSnapshot()

  const detectedZips = await resolveZipCodesFromOverlay(activeOverlay, overlayType)
  if (!detectedZips.length) {
    Notify.create({
      type: 'warning',
      message: 'No ZIP codes were detected in the selected area. Try drawing a smaller area.',
      position: 'top',
    })
    return
  }
  mergeZipCodes(detectedZips)
  Notify.create({
    type: 'positive',
    message: `${detectedZips.length} ZIP code(s) added from map selection.`,
    position: 'top',
  })
}

const initGoogleMap = async () => {
  mapError.value = ''
  if (!mapCanvasRef.value) return
  try {
    await loadGoogleMaps()
    const google = window.google
    mapInstance = new google.maps.Map(mapCanvasRef.value, {
      center: { lat: 37.0902, lng: -95.7129 },
      zoom: 4,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    })
    geocoder = new google.maps.Geocoder()
    drawingManager = new google.maps.drawing.DrawingManager({
      drawingMode: null,
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_CENTER,
        drawingModes: ['circle', 'polygon', 'rectangle'],
      },
      circleOptions: {
        fillColor: '#1976d2',
        fillOpacity: 0.2,
        strokeColor: '#1976d2',
        strokeWeight: 2,
        editable: false,
      },
      polygonOptions: {
        fillColor: '#1976d2',
        fillOpacity: 0.2,
        strokeColor: '#1976d2',
        strokeWeight: 2,
        editable: false,
      },
      rectangleOptions: {
        fillColor: '#1976d2',
        fillOpacity: 0.2,
        strokeColor: '#1976d2',
        strokeWeight: 2,
        editable: false,
      },
    })
    drawingManager.setMap(mapInstance)
    google.maps.event.addListener(drawingManager, 'overlaycomplete', handleOverlayComplete)

    const view = savedMapView.value
    if (view?.center && Number.isFinite(view.center.lat) && Number.isFinite(view.center.lng)) {
      mapInstance.setCenter(view.center)
      if (Number.isFinite(view.zoom)) mapInstance.setZoom(view.zoom)
    }
    if (savedAreaShape.value) {
      const overlay = createOverlayFromShape(savedAreaShape.value)
      if (overlay) {
        activeOverlay = overlay
        hasDrawnArea.value = true
        const overlayBounds = getOverlayBounds(overlay, savedAreaShape.value.type)
        if (overlayBounds) mapInstance.fitBounds(overlayBounds)
      }
    }
  } catch (error) {
    mapError.value = error?.message || 'Map failed to initialize.'
  }
}

const addDescription = () => {
  const text = String(newDescription.value || '').trim().replace(/\s+/g, ' ')
  if (!text) return
  if (wordCount(text) > 20) {
    Notify.create({ type: 'warning', message: 'Each description supports up to 20 words.', position: 'top' })
    return
  }
  serviceDescriptions.value.push(text)
  newDescription.value = ''
}

const removeDescription = (index) => {
  serviceDescriptions.value.splice(index, 1)
}

const loadProfile = async () => {
  try {
    const spId = userStore.userId
    if (!spId) return
    const userProfile = await getDocument(`users/${spId}`)
    const profile = userProfile?.sp_service_profile || {}
    serviceDescriptions.value = Array.isArray(profile?.service_descriptions)
      ? profile.service_descriptions.filter((item) => wordCount(item) <= 20)
      : []
    serviceZipCodes.value = Array.isArray(profile?.service_zip_codes)
      ? profile.service_zip_codes.filter((item) => /^\d{5}$/.test(String(item)))
      : []
    savedAreaShape.value = profile?.service_area_shape || null
    savedMapView.value = profile?.service_map_view || null

    if (!savedAreaShape.value || !savedMapView.value) {
      const localSnapshot = loadLocalMapSnapshot()
      if (localSnapshot?.service_area_shape && !savedAreaShape.value) {
        savedAreaShape.value = localSnapshot.service_area_shape
      }
      if (localSnapshot?.service_map_view && !savedMapView.value) {
        savedMapView.value = localSnapshot.service_map_view
      }
    }
  } catch (error) {
    Notify.create({ type: 'negative', message: error.message || 'Failed to load services profile.', position: 'top' })
  }
}

const saveProfile = async () => {
  if (!userStore.userId) return
  saving.value = true
  try {
    const now = new Date().toISOString()
    const sanitizedDescriptions = serviceDescriptions.value
      .map((item) => String(item || '').trim().replace(/\s+/g, ' '))
      .filter((item) => item && wordCount(item) <= 20)
    const sanitizedZipCodes = [...new Set(serviceZipCodes.value.map((item) => String(item || '').trim()))]
      .filter((item) => /^\d{5}$/.test(item))

    const existingUser = await getDocument(`users/${userStore.userId}`)
    const existingProfile = existingUser?.sp_service_profile || {}
    const nextProfile = {
      sp_id: userStore.userId,
      service_descriptions: sanitizedDescriptions,
      service_zip_codes: sanitizedZipCodes,
      service_area_shape: savedAreaShape.value || null,
      service_map_view: captureCurrentMapView() || savedMapView.value || null,
      created_at: existingProfile?.created_at || now,
      updated_at: now,
    }
    try {
      await updateDocument('users', userStore.userId, {
        sp_service_profile: nextProfile,
      })
    } catch {
      await createDocument(
        'users',
        {
          ...(existingUser || {}),
          id: userStore.userId,
          sp_service_profile: nextProfile,
        },
        userStore.userId
      )
    }
    serviceDescriptions.value = sanitizedDescriptions
    serviceZipCodes.value = sanitizedZipCodes
    savedMapView.value = captureCurrentMapView() || savedMapView.value
    saveLocalMapSnapshot()
    Notify.create({ type: 'positive', message: 'Service scope saved.', position: 'top' })
  } catch (error) {
    Notify.create({ type: 'negative', message: error.message || 'Failed to save services profile.', position: 'top' })
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  localGoogleMapsApiKey.value = String(localStorage.getItem(LOCAL_STORAGE_MAPS_KEY) || '').trim()
  await loadProfile()
  await initGoogleMap()
})

onBeforeUnmount(() => {
  if (activeOverlay && savedAreaShape.value?.type) {
    savedAreaShape.value = serializeOverlay(activeOverlay, savedAreaShape.value.type)
  }
  savedMapView.value = captureCurrentMapView() || savedMapView.value
  saveLocalMapSnapshot()
  clearDrawnArea({ resetSavedShape: false })
  if (drawingManager) drawingManager.setMap(null)
  drawingManager = null
  geocoder = null
  mapInstance = null
})
</script>

<style scoped>
.sp-services-page {
  background: var(--bg-secondary);
}

.services-shell {
  max-width: 960px;
  margin: 0 auto;
}

.services-card {
  border-radius: 12px;
  border: 1px solid var(--neutral-200);
}

.map-frame {
  border: 1px solid var(--neutral-200);
  border-radius: 10px;
  background: #ffffff;
  padding: 8px;
}

.map-canvas {
  width: 100%;
  height: 360px;
  display: block;
  border-radius: 8px;
}
</style>
