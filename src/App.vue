<script setup>
import { RouterView } from 'vue-router'
import NavBar from './components/NavBar.vue'
</script>

<template>
  <NavBar />

  <main class="main-content">
    <!-- RouterView 是一个占位符，Vue Router 会根据当前的 URL 在这里渲染对应的页面组件 -->
    <RouterView />
  </main>
</template>

<style scoped>
.main-content {
  padding-top: 80px; /* 留出导航栏的高度 */
}
</style>
