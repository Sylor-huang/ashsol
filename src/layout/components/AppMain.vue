<template>
  <router-view v-slot="{ Component }">
    <transition name="fade-transform" mode="out-in">
      <div class="full-heightp-2 " :key="key">
        <keep-alive :include="cachedViews">
          <component :is="Component" :key="key" />
        </keep-alive>
      </div>
    </transition>
  </router-view>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
const key = computed(() => {
  return useRoute().path
})
let store = useStore()
const cachedViews = computed(() => {
  return store.state.app.cachedViews
})
</script>

