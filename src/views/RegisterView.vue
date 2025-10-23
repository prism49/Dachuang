<!-- 文件路径: src/views/RegisterView.vue -->

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { useRouter } from 'vue-router'

const username = ref('')
const password = ref('')
const message = ref<string | null>(null) // 用于显示成功或错误信息
const isError = ref(false) // 标记信息是成功(绿色)还是失败(红色)

const authStore = useAuthStore()
const router = useRouter()

const handleRegister = async () => {
  message.value = null
  isError.value = false

  // 简单的客户端验证
  if (password.value.length < 6) {
    message.value = '密码长度不能少于6位'
    isError.value = true
    return
  }

  // 调用 store 里的 register action
  const success = await authStore.register(username.value, password.value)

  if (success) {
    message.value = '注册成功！正在跳转到登录页面...'
    isError.value = false
    // 注册成功后，等2秒钟，自动跳转到登录页
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } else {
    message.value = '注册失败，用户名可能已被占用'
    isError.value = true
  }
}
</script>

<template>
  <div class="page-container auth-page">
    <h2>注册</h2>
    <form @submit.prevent="handleRegister" class="auth-form">
      
      <div class="form-group">
        <label for="username">用户名</label>
        <input type="text" v-model="username" id="username" required />
      </div>

      <div class="form-group">
        <label for="password">密码 (至少6位)</label>
        <input type="password" v-model="password" id="password" required />
      </div>

      <!-- 
        动态绑定 class:
        如果 isError 是 true, class="error-message"
        如果 isError 是 false, class="success-message"
      -->
      <p v-if="message" :class="isError ? 'error-message' : 'success-message'">
        {{ message }}
      </p>

      <button type="submit" class="auth-button register-button">注册</button>
    </form>
  </div>
</template>

<style scoped>
/* 我们复用大部分登录页面的样式 
  注意: .auth-button.register-button 会覆盖 .auth-button 的背景色
*/
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
  gap: 15px;
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
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease;
}

.register-button {
  background-color: #28a745; /* 绿色 */
}

.register-button:hover {
  background-color: #218838;
}

.error-message {
  color: #dc3545; /* 红色 */
  text-align: center;
  margin: 0;
}

.success-message {
  color: #28a745; /* 绿色 */
  text-align: center;
  margin: 0;
}
</style>