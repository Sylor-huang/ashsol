<template>
  <div class="min-h-screen black-bg-color">
    <el-container>
      <el-header
        class="shadow-md fixed w-full z-50 black-bg-color ht-60"
      >
        <Header :isMobile="isMobile"></Header>
      </el-header>
      <el-main class="mat-60">
        <AppMain />
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import {ref, onMounted,getCurrentInstance,computed} from "vue";
import {AppMain, Header} from "./components";
import ResizeHook from "./hook/ResizeHandler";
ResizeHook();
let { proxy } = getCurrentInstance();

let isMobile = computed(() => {
  return proxy.$store.state.app.device === "mobile";
});
</script>
