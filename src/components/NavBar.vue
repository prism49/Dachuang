<script setup>
import { RouterLink } from 'vue-router';

// 导航链接数据
// 我根据你的主题“中西古典文化比较研究”额外加了一个“文化专题”，方便你日后扩展深度内容
const navLinks = [
  { path: '/', text: '首页' },
  { path: '/academic', text: '学术成果' },
  { path: '/interactive', text: '互动体验' },
  { path: '/products', text: '文创展示' },
  // { path: '/features', text: '文化专题' }, // 你可以取消这行注释来添加这个新页面
  { path: '/about', text: '关于我们' },
];
</script>

<template>
  <header class="navbar">
    <div class="container">
      <div class="logo">
        <!-- 你可以将这里的文字替换成你的Logo图片 -->
        <RouterLink to="/">文心雕龙</RouterLink>
      </div>
      <nav class="nav-links">
        <RouterLink v-for="link in navLinks" :key="link.path" :to="link.path">
          {{ link.text }}
        </RouterLink>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 60px;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.container {
  width: 100%;
  max-width: 1200px;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo a {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  text-decoration: none;
}

.nav-links a {
  margin: 0 15px;
  text-decoration: none;
  color: #555;
  font-size: 1rem;
  transition: color 0.3s;
}

.nav-links a:hover,
.nav-links a.router-link-exact-active { /* 当前激活的链接样式 */
  color: #007bff;
}
</style>
