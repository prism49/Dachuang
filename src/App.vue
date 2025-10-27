<!-- 文件路径: src/App.vue -->
<script setup lang="ts">
import { RouterView } from 'vue-router'
import NavBar from './components/NavBar.vue'
</script>

<template>
  <NavBar />

  <RouterView v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </RouterView>

</template>

<style scoped>
/* 定义名为 "fade" 的 transition 效果 */
/* (我们稍后会把这个移到全局 main.css) */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease; /* 持续 0.3 秒的透明度过渡 */
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0; /* 进入前 和 离开后 透明度为 0 */
}
</style>