<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/authStore' // 引入 authStore
import { storeToRefs } from 'pinia' // 引入 storeToRefs

// 实例化 store
const authStore = useAuthStore()
// 使用 storeToRefs 创建响应式引用
const { isLoggedIn, user } = storeToRefs(authStore)

// (!!! 修改 !!!) 导航链接数组，添加“艺文走廊”
const navLinks = [
  { path: '/', text: '首页' },
  { path: '/academic', text: '学术成果' },
  { path: '/interactive', text: '互动体验' },
  { path: '/art-gallery', text: '艺文走廊' }, // <-- 新增链接
  { path: '/products', text: '文创展示' },
  { path: '/about', text: '关于我们' },
];
</script>

<template>
  <header class="navbar">
    <div class="container">
      <div class="logo">
        <RouterLink to="/">中西古典学—从《会饮篇》和《论语》出发</RouterLink>
      </div>
      
      <!-- 左侧的基础导航 -->
      <nav class="nav-links">
        <RouterLink v-for="link in navLinks" :key="link.path" :to="link.path">
          {{ link.text }}
        </RouterLink>
      </nav>
      
      <!-- 右侧的用户认证区 -->
      <div class="user-auth">
        <!-- (!!! 使用响应式引用 isLoggedIn 和 user !!!) -->
        <template v-if="isLoggedIn && user">
          <!-- 点击用户名跳转到个人主页 -->
          <RouterLink to="/profile" class="welcome-msg profile-link">
            欢迎, {{ user.username }}
            (积分: {{ user.points }})
          </RouterLink>
          <button @click="authStore.logout" class="auth-btn logout-btn">退出</button>
        </template>
        <template v-else>
          <RouterLink to="/login" class="auth-btn">登录</RouterLink>
          <RouterLink to="/register" class="auth-btn register-btn">注册</RouterLink>
        </template>
      </div>

    </div>
  </header>
</template>

<style scoped>
/* --- 基础样式 --- */
.navbar {
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 15px 0;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.logo a {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 25px;
}

.nav-links a {
  text-decoration: none;
  color: #555;
  font-weight: 500;
  padding-bottom: 5px;
  border-bottom: 2px solid transparent;
  transition: all 0.3s ease;
}

.nav-links a.router-link-exact-active {
  color: #007bff;
  border-bottom-color: #007bff;
}
.nav-links a:hover {
    color: #007bff;
}

/* --- 用户认证区样式 --- */
.user-auth {
  display: flex;
  align-items: center;
  gap: 15px;
}

.welcome-msg {
  font-size: 0.9em;
  color: #333;
  white-space: nowrap;
}
/* (!!! 新增 !!!) 用户名作为链接的样式 */
.profile-link {
    text-decoration: none;
    color: #5b6ca8; /* 链接颜色 */
    font-weight: 500;
    transition: color 0.3s ease;
}
.profile-link:hover {
    color: #3a3f58; /* 悬浮变深 */
    text-decoration: underline;
}


.auth-btn {
  padding: 8px 12px;
  text-decoration: none;
  border: 1px solid #007bff;
  color: #007bff;
  border-radius: 4px;
  transition: all 0.3s ease;
  font-size: 0.9em;
  white-space: nowrap;
}
.auth-btn.register-btn {
  background-color: #007bff;
  color: #fff;
}
.auth-btn:hover {
  opacity: 0.8;
}
.logout-btn {
  cursor: pointer;
  background-color: #dc3545;
  color: #fff;
  border-color: #dc3545;
}
</style>

