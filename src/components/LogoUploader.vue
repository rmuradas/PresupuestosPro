<script setup>
const props = defineProps({
  modelValue: { type: String, default: '' }
})
const emit = defineEmits(['update:modelValue'])

function onFileChange(event) {
  const file = event.target.files?.[0]
  if (!file) {
    return
  }
  const reader = new FileReader()
  reader.onload = () => {
    emit('update:modelValue', reader.result)
  }
  reader.readAsDataURL(file)
}
</script>

<template>
  <label>
    Logo
    <input type="file" accept="image/png,image/jpeg" @change="onFileChange" />
  </label>
  <img v-if="modelValue" :src="modelValue" alt="Logo del freelancer" class="logo-preview" />
</template>

<style scoped>
.logo-preview {
  max-width: 160px;
  max-height: 160px;
  object-fit: contain;
}
</style>
