<template>
  <el-icon  :size="size" :color="color" :class="class">
    <component :is="IconName" />
  </el-icon>
</template>

<script setup>
import { shallowRef, watch } from 'vue'
const props = defineProps({
  name: {
    required: true,
    default: 'More',
    type: String
  },
  size:{
    required: false,
    default: 18,
    type: Number
  },
  color:{
    required: false,
    default: '',
    type: String
  },
  class: {
    required: false,
    default: '',
    type: String
  }
})

let IconName = shallowRef('')
IconName.value = props.name
watch(
  () => props.name,
  (first, second) => {
    IconName.value=  first
    // IconName.value=  ElSvg[first]
  },
  { immediate: true }
)
</script>
