<!-- 文件路径: src/components/NavBar.vue -->

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const authStore = useAuthStore()

const navLinks = [
  { path: '/', text: '首页' },
  { path: '/academic', text: '学术成果' },
  { path: '/interactive', text: '互动体验' },
  { path: '/products', text: '文创展示' },
  { path: '/about', text: '关于我们' },
]
</script>

<template>
  <header class="navbar">
    <div class="container">
      <div class="logo">
        <RouterLink to="/">文心雕龙</RouterLink>
      </div>
      
      <nav class="nav-links">
        <RouterLink v-for="link in navLinks" :key="link.path" :to="link.path">
          {{ link.text }}
        </RouterLink>
      </nav>
      
      <div class="user-auth">
        <template v-if="authStore.isLoggedIn && authStore.user">
          
          <!-- (!!! 这是关键修改 !!!) -->
          <!-- 将原来的 span 换成 RouterLink -->
          <RouterLink to="/profile" class="welcome-msg profile-link">
            欢迎, {{ authStore.user.username }} 
            (积分: {{ authStore.user.points }})
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
/* --- 保留你原有的样式 --- */
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

/* (!!! 新增样式 !!!) 让欢迎语像链接一样 */
.profile-link {
  text-decoration: none; /* 去掉下划线 */
  transition: color 0.3s ease;
}
.profile-link:hover {
  color: #0056b3; /* 悬浮时变深蓝 */
  text-decoration: underline; /* 悬浮时加下划线 */
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

