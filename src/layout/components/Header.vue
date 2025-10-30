<template>
  <div class="flex items-center justify-between h-full">
    <div class="mr-8 flex-auto-size">
      <router-link class="inline-block" to="/">
        <el-space>
          <img src="@/assets/logo.svg" class="h-10 mx-auto" />
          <strong class="logo-title">AshSol</strong>
        </el-space>
      </router-link>
    </div>
    <div class="flex-auto-size">
      <ConnectHeader direction="horizontal"></ConnectHeader>
    </div>
  </div>
</template>
<script setup>
import {getCurrentInstance, ref} from "vue";
import ConnectHeader from "@/layout/components/ConnectHeader";
let {proxy} = getCurrentInstance();
defineProps({
  isMobile: {
    type: Boolean,
    default: false,
  },
});
</script>
