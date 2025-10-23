<!-- 文件路径: src/views/LoginView.vue -->

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { useRouter } from 'vue-router'

// 1. 初始化需要用到的变量
const username = ref('')
const password = ref('')
const errorMessage = ref<string | null>(null) // 用于显示错误信息

const authStore = useAuthStore() // 2. 获取 Pinia store
const router = useRouter() // 3. 获取路由实例，用于跳转

// 4. 定义点击“登录”按钮时执行的函数
const handleLogin = async () => {
  errorMessage.value = null // 清空上次的错误信息
  
  // 5. 调用 store 里的 login action
  const success = await authStore.login(username.value, password.value)
  
  if (success) {
    // 6. 登录成功, 跳转到首页
    router.push('/')
  } else {
    // 7. 登录失败, 显示错误
    errorMessage.value = '登录失败，请检查用户名或密码'
  }
}
</script>

<template>
  <!-- page-container 是我们在 main.css 里定义的全局样式 -->
  <div class="page-container auth-page">
    <h2>登录</h2>

    <!-- .prevent 修饰符表示表单提交时不要刷新页面 -->
    <form @submit.prevent="handleLogin" class="auth-form">
      
      <!-- 用户名输入框 -->
      <div class="form-group">
        <label for="username">用户名</label>
        <!-- v-model 把输入框的值和 script 里的 username 变量双向绑定 -->
        <input type="text" v-model="username" id="username" required />
      </div>

      <!-- 密码输入框 -->
      <div class="form-group">
        <label for="password">密码</label>
        <input type="password" v-model="password" id="password" required />
      </div>

      <!-- v-if 表示只有在 errorMessage 有值时才显示这个 <p> 标签 -->
      <p v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </p>

      <button type="submit" class="auth-button">登录</button>
    </form>
  </div>
</template>

<style scoped>
/* scoped 表示这里的样式只对这个文件生效 */
.auth-page {
  max-width: 400px;
  margin: 40px auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
}

h2 {
  text-align: center;
  color: #333;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 15px; /* 元素之间的间距 */
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 5px;
  font-weight: bold;
  color: #555;
}

.form-group input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.auth-button {
  padding: 12px 15px;
  background-color: #007bff; /* 蓝色 */
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease;
}

.auth-button:hover {
  background-color: #0056b3;
}

.error-message {
  color: #dc3545; /* 红色 */
  text-align: center;
  margin: 0;
}
</style>