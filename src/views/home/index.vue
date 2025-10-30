<template>
  <div>
    <div class="text-sm font-bold lg:text-3xl text-center mb-10">
      <div class="mb-6">{{ setting.title }}</div>
      <el-space size="large">
        <el-link
          class=""
          :href="`${setting.x}`"
          target="_blank"
          :underline="false"
        >
          <img
            src="@/assets/twitter.svg"
            class="h-10 p-2 bg-slate-400 hover:bg-slate-50 rounded-full"
          />
        </el-link>
        <el-link
          class=""
          :href="`${setting.github}`"
          target="_blank"
          :underline="false"
        >
          <img
            src="@/assets/github.svg"
            class="h-10 p-2 bg-slate-400 hover:bg-slate-50 rounded-full"
          />
        </el-link>
        <div class="ash-border px-4 py-1">
          <el-space class="h-full">
            <el-link
              :href="`https://dexscreener.com/solana/${setting.ca}`"
              target="_blank"
              :underline="false"
            >
              <span class="text-base">{{ sliceString(setting.ca, 6) }}</span>
            </el-link>
            <CoppyIcon :copy_text="setting.ca" :icon_size="16"></CoppyIcon>
          </el-space>
        </div>
      </el-space>
    </div>
    <Check></Check>
  </div>
</template>

<script setup>
import CoppyIcon from "@/layout/components/Commons/CoppyIcon";
import setting from "@/settings";
import {sliceString} from "@/utils/validate.js";
import Check from "./Check.vue"
</script>
