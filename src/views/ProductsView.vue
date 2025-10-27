<script setup lang="ts">
import { useAuthStore } from '../stores/authStore'
import { storeToRefs } from 'pinia'

const authStore = useAuthStore();
const { user } = storeToRefs(authStore); // 获取用户积分

// 示例文创产品数据 (将来可以从后端获取)
const products = [
  {
    id: 1,
    name: '“知行合一”系列黄铜书签',
    description: '采用优质黄铜蚀刻工艺，刻有王阳明“知行合一”思想精髓，伴你阅读，时时自省。',
    points: 50, // 兑换所需积分
    image: 'https://placehold.co/400x400/f0e6d2/333?text=书签' // 替换为真实图片
  },
  {
    id: 2,
    name: '“爱智求真”希腊纹样笔记本',
    description: '封面采用经典古希腊回纹图案，象征无限与理性。内页选用优质书写纸，适合记录哲学思辨与灵感火花。',
    points: 80,
    image: 'https://placehold.co/400x400/d9ead3/333?text=笔记本' // 替换为真实图片
  },
  {
    id: 3,
    name: '“道法自然”水墨风手机壳',
    description: '将老子“道法自然”的意境融入现代设计，采用写意水墨风格图案，选用环保 TPU 材质。',
    points: 120,
    image: 'https://placehold.co/400x400/cfe2f3/333?text=手机壳' // 替换为真实图片
  }
];

// (将来兑换逻辑会放在 store 里)
function handleRedeem(product: any) {
  // 检查积分是否足够
  if (user.value && user.value.points >= product.points) {
    // 调用 store 的兑换 action (待实现)
    console.log(`尝试兑换 ${product.name}, 需要 ${product.points} 积分，用户有 ${user.value.points} 积分`);
    alert(`兑换 ${product.name} 成功！(功能实现中)`); // 暂时用 alert
    // 实际应用中：
    // const success = await authStore.redeemProduct(product.id);
    // if(success) { /* 更新UI */} else { /* 显示错误 */}
  } else {
    alert(`积分不足，无法兑换 ${product.name}。(需要 ${product.points} 积分)`); // 暂时用 alert
  }
}
</script>

<template>
  <div class="page-container products-view">
    <h1 class="page-title">文创展示</h1>
    <p class="page-subtitle">
      用你在互动中积累的积分，兑换独具匠心的文化创意产品。
      <!-- 登录后显示当前积分 -->
      <span v-if="user" class="current-points">你的当前积分: <strong class="user-points">{{ user.points }}</strong></span>
      <!-- 未登录提示 -->
      <span v-else class="login-tip">(<RouterLink to="/login">登录</RouterLink>后可查看积分与兑换)</span>
    </p>

    <div class="product-grid">
      <!-- 使用 v-for 遍历产品数组 -->
      <div v-for="product in products" :key="product.id" class="product-card">
        <img :src="product.image" :alt="product.name + ' 图片'" class="product-image" onerror="this.src='https://placehold.co/400x400/eee/aaa?text=Image+Error'">
        <div class="product-content">
          <h2 class="product-name">{{ product.name }}</h2>
          <p class="product-description">{{ product.description }}</p>
          <div class="product-footer">
            <span class="product-points">所需积分: <strong>{{ product.points }}</strong></span>
            <button
              class="redeem-btn"
              @click="handleRedeem(product)"
              :disabled="!user || user.points < product.points"
            >
              <!-- 根据登录状态和积分显示不同文字 -->
              <span v-if="!user">请先登录</span>
              <span v-else-if="user.points < product.points">积分不足</span>
              <span v-else>立即兑换</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.products-view {
  max-width: 1200px;
  margin: 0 auto;
}

.page-subtitle {
  text-align: center;
  color: #555;
  margin-bottom: 40px;
  font-size: 1.1em;
}
.current-points {
  margin-left: 10px; /* 与前面文字稍微隔开 */
  font-weight: 500;
}
.user-points {
  color: #e67e22; /* 橙色 */
  font-weight: 700;
  font-size: 1.1em; /* 稍微放大 */
}
.login-tip {
  margin-left: 10px;
  font-size: 0.9em;
  color: #7f8c8d;
}
.login-tip a {
    color: #007bff;
    text-decoration: none;
}
.login-tip a:hover {
    text-decoration: underline;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.product-card {
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}

.product-image {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  background-color: #f0f0f0; /* 图片加载失败时的底色 */
}

.product-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.product-name {
  font-size: 1.3em;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 10px 0;
  line-height: 1.3;
}

.product-description {
  font-size: 0.95em;
  line-height: 1.6;
  color: #555;
  flex-grow: 1;
  margin-bottom: 15px;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  border-top: 1px solid #eee;
  padding-top: 15px;
}

.product-points {
  font-size: 1em;
  color: #34495e;
}
.product-points strong {
  color: #e67e22;
  font-size: 1.2em;
}

.redeem-btn {
  padding: 8px 18px;
  font-size: 0.9em;
  font-weight: 500;
  color: #fff;
  background-color: #2ecc71; /* 绿色 */
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
.redeem-btn:disabled {
  background-color: #bdc3c7; /* 灰色 */
  cursor: not-allowed;
}
.redeem-btn:not(:disabled):hover {
  background-color: #27ae60; /* 深绿 */
}
</style>

