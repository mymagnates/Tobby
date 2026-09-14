<template>
  <div>
    <div class="ios-photos">
      <div v-for="(photo, index) in photos" :key="photo.path" class="ios-photo">
        <button
          type="button"
          style="padding: 0; border: 0; background: none"
          @click="$emit('open', photo.url)"
        >
          <img :src="photo.url" alt="Item attachment" /></button
        ><q-btn
          type="button"
          flat
          dense
          icon="close"
          aria-label="Remove photo from draft"
          @click="$emit('remove', index)"
        />
      </div>
      <div
        v-for="row in uploads.filter((row) => row.status !== 'done')"
        :key="row.id"
        class="ios-photo"
      >
        <img :src="row.preview" :alt="row.name" /><q-spinner
          v-if="row.status === 'uploading'"
          aria-label="Uploading photo"
        /><template v-else
          ><span class="text-negative text-caption">Upload failed</span
          ><q-btn
            type="button"
            flat
            dense
            no-caps
            label="Retry"
            @click="$emit('retry', row)"
          /><q-btn
            type="button"
            flat
            dense
            icon="close"
            aria-label="Discard failed photo"
            @click="$emit('discard', row)"
          /><q-tooltip>{{ row.error }}</q-tooltip></template
        >
      </div>
    </div>
    <q-btn
      type="button"
      flat
      no-caps
      icon="photo_camera"
      label="Take photo"
      @click="$emit('capture')"
    /><q-btn
      type="button"
      flat
      no-caps
      icon="photo_library"
      label="Photos"
      @click="$emit('choose')"
    />
  </div>
</template>
<script setup>
defineProps({
  photos: { type: Array, default: () => [] },
  uploads: { type: Array, default: () => [] },
})
defineEmits(['open', 'remove', 'retry', 'discard', 'capture', 'choose'])
</script>
