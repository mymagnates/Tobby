<template>
  <div class="signature-pad">
    <q-btn v-if="!readonly" flat no-caps :aria-pressed="trackpadMode" :label="trackpadMode ? 'Use press-and-drag mode' : 'Use trackpad mode (no holding)'" @click="toggleTrackpadMode" />
    <p v-if="!readonly" class="signature-help">{{ trackpadMode ? 'Click inside the box once, then move with your trackpad without holding down. Click again or press Escape to finish.' : 'Press and hold while dragging to draw. For a trackpad, use the no-holding mode above.' }}</p>
    <canvas
      ref="canvas"
      class="ios-signature"
      :class="{ 'is-drawing': latched }"
      :aria-label="readonly ? 'Recorded signature' : 'Draw your signature'"
      :tabindex="readonly ? undefined : 0"
      @pointerdown="start"
      @pointermove="move"
      @pointerup="release"
      @pointercancel="cancel"
      @lostpointercapture="release"
      @pointerleave="leave"
      @click="clickToDraw"
      @keydown.esc.prevent="end"
      @blur="end"
      @contextmenu.prevent
    />
    <div v-if="!readonly" class="signature-tools">
      <q-btn flat no-caps icon="undo" label="Undo last stroke" :disable="!modelValue.length" @click="undo" />
      <q-btn flat no-caps label="Clear signature" :disable="!modelValue.length" @click="clear" />
    </div>
  </div>
</template>
<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
const props = defineProps({ modelValue: { type: Array, default: () => [] }, readonly: Boolean })
const emit = defineEmits(['update:modelValue'])
const canvas = ref(null),
  strokes = []
const trackpadMode = ref(false), latched = ref(false)
let current = null,
  observer,
  pointerId = null,
  lastInput = 'mouse'
function point(event) {
  const rect = canvas.value.getBoundingClientRect()
  return [
    Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)),
    Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height)),
  ]
}
function draw() {
  const el = canvas.value
  if (!el) return
  // Layout dimensions are stable during dialog transforms; boundingClientRect
  // can briefly be zero/scaled and leave a blank backing buffer after animation.
  const ratio = Math.max(1, Number(window.devicePixelRatio) || 1)
  const width = Math.round(el.clientWidth * ratio)
  const height = Math.round(el.clientHeight * ratio)
  if (!width || !height) return
  if (el.width !== width) el.width = width
  if (el.height !== height) el.height = height
  const context = el.getContext('2d')
  if (!context) return
  context.clearRect(0, 0, el.width, el.height)
  context.strokeStyle = '#243b53'
  context.lineWidth = 2 * ratio
  context.lineCap = 'round'
  context.lineJoin = 'round'
  for (const stroke of props.readonly
    ? props.modelValue
    : [...strokes, ...(current ? [current] : [])]) {
    context.beginPath()
    stroke.forEach(([x, y], index) =>
      index
        ? context.lineTo(x * el.width, y * el.height)
        : context.moveTo(x * el.width, y * el.height),
    )
    context.stroke()
  }
}
function start(event) {
  if (props.readonly) return
  lastInput = event.pointerType || 'mouse'
  if (trackpadMode.value && lastInput === 'mouse') return
  if (current || (event.pointerType === 'mouse' && event.button !== 0) || strokes.length >= 100) return
  event.preventDefault()
  pointerId = event.pointerId
  try { canvas.value.setPointerCapture?.(event.pointerId) } catch { /* Pointer may already have been released by the device. */ }
  current = [point(event)]
  draw()
}
function move(event) {
  if (!current || (!latched.value && event.pointerId !== pointerId)) return
  if (strokes.reduce((n, s) => n + s.length, current.length) < 3000) current.push(point(event))
  draw()
}
function end() {
  if (!current) return
  if (current.length > 1) strokes.push(current)
  current = null
  latched.value = false
  pointerId = null
  emit('update:modelValue', structuredClone(strokes))
  draw()
}
function release() { if (!latched.value) end() }
function leave() {
  if (latched.value || !canvas.value.hasPointerCapture?.(pointerId)) end()
}
function clickToDraw(event) {
  if (props.readonly || !trackpadMode.value || lastInput !== 'mouse') return
  if (latched.value) { end(); return }
  if (current || strokes.length >= 100) return
  canvas.value.focus()
  current = [point(event)]
  latched.value = true
}
function toggleTrackpadMode() {
  end()
  trackpadMode.value = !trackpadMode.value
}
function cancel() {
  current = null
  latched.value = false
  pointerId = null
  draw()
}
function undo() {
  current = null
  latched.value = false
  strokes.pop()
  emit('update:modelValue', structuredClone(strokes))
  draw()
}
function clear() {
  strokes.length = 0
  current = null
  latched.value = false
  draw()
  emit('update:modelValue', [])
}
onMounted(() => {
  draw()
  observer = new ResizeObserver(draw)
  observer.observe(canvas.value)
})
onBeforeUnmount(() => observer?.disconnect())
watch(
  () => props.modelValue,
  () => {
    current = null
    latched.value = false
    strokes.splice(0, strokes.length, ...props.modelValue.map(stroke => stroke.map(point => [...point])))
    draw()
  },
  { immediate: true },
)
</script>
<style scoped>
.signature-help { margin: 0 0 12px; color: var(--brand-muted, #596e62); font-size: 14px; }
.signature-pad .ios-signature { width: 100%; height: 240px; display: block; background: #fff; border: 1px solid var(--brand-border, #cbd8ce); border-radius: 8px; touch-action: none; cursor: crosshair; }
.signature-tools { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 8px; margin-top: 8px; }
.signature-pad .ios-signature.is-drawing { border-color: var(--brand-primary, #254b39); outline: 2px solid var(--brand-primary, #254b39); outline-offset: 2px; }
.signature-tools .q-btn { min-height: 44px; }
@media (max-width: 600px) { .signature-pad .ios-signature { height: 200px; } }
</style>
