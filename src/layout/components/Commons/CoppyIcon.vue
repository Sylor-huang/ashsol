<template>
  <el-icon class="text-success" :size="icon_size" v-if="copySuccess"><CircleCheck /></el-icon>
  <el-icon class="text-gray-400 cursor-pointer" :size="icon_size" v-else @click="copyText"><DocumentCopy /></el-icon
    >
</template>
<script setup>
import {getCurrentInstance, reactive, ref} from "vue";
import {sliceString} from "@/utils/validate.js";
let {proxy} = getCurrentInstance();

defineProps({
  copy_text: {
    type: String,
    default: "",
  },
  icon_size: {
    type: Number,
    default: 8,
  }
});

let copySuccess = ref(false);

let copyText = async () => {
  try {
    await navigator.clipboard.writeText(proxy.copy_text);
    copySuccess.value = true;
    setTimeout(() => (copySuccess.value = false), 2000);
  } catch (err) {
    copySuccess.value = false;
    proxy.$elmsg.error("Copy Error");
  }
};
</script>
