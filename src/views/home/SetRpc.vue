<template>
  <div>
    <div class="my-6">
      <el-input
        v-model="customRpc"
        size="large"
        :clearable="true"
        placeholder="Set Custom RPC..."
      >
      </el-input>
      <div class="mt-4">
        <el-button type="primary" size="large" @click="ConfirmSet">
          Save
        </el-button>
      </div>
    </div>

    <div class="text-sm text-gray-400 mt-4 border-color-1 p-3">
      <ul class="ml-3">
        <li class="info-li">
          The current RPC uses Solana's public nodes, and will frequently report
          429 errors.
        </li>
        <li class="info-li py-2 text-primary">
          You can set up your own RPC. Your RPC will only be stored in the
          browser and don't worry risk.
        </li>
        <li class="info-li">
          Register to get free RPC:
          <a
            class="text-primary mx-2"
            href="https://www.alchemy.com/"
            target="_blank"
            >Alchemy</a
          >
          <a class="text-primary" href="https://www.helius.dev/" target="_blank"
            >Helius</a
          >
          <a
            class="text-primary  mx-2"
            href="https://www.quicknode.com/"
            target="_blank"
            >QuickNode</a
          >
        </li>
      </ul>
    </div>
  </div>
</template>
<script setup>
import {getCurrentInstance, ref, onMounted} from "vue";
let {proxy} = getCurrentInstance();
let customRpc = ref("");

onMounted(() => {
  const localRpc = localStorage.getItem("myRpc");
  if (localRpc && localRpc.length > 0) {
    customRpc.value = localRpc;
  } else {
    customRpc.value = "";
  }
});

let ConfirmSet = () => {
  if (customRpc.value && customRpc.value.length > 0) {
    localStorage.setItem("myRpc", customRpc.value);
  } else {
    localStorage.removeItem("myRpc");
  }
  proxy.$elmsg.success("Set RPC Success");
};
</script>
