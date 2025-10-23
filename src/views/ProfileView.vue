<script setup lang="ts">
// (script 部分代码不变)
import { useAuthStore } from '../stores/authStore'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

if (!authStore.isLoggedIn) {
  router.push('/')
}

const formattedLastCheckIn = computed(() => {
  if (authStore.user?.lastCheckIn) {
    try {
      const [year, month, day] = authStore.user.lastCheckIn.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) {
      console.error("Error formatting date:", e);
      return '日期无效';
    }
  }
  return '从未签到过';
});

const cultureTestResultTitle = computed(() => {
  return authStore.testResult ? authStore.testResult.title : '尚未测试';
});

</script>

<template>
  <div class="page-container profile-view">
    <!-- (页面标题可以保留，也可以融入卡片) -->
    <!-- <h1 class="page-title">个人主页</h1> -->

    <div v-if="authStore.isLoggedIn && authStore.user" class="profile-card-wrapper">
      <div class="profile-card">
        
        <!-- 页眉/标题区 -->
        <header class="profile-header">
          <h2 class="username">{{ authStore.user.username }}</h2>
          <p class="greeting">欢迎回到文心雕龙</p>
        </header>

        <!-- 主要内容区 -->
        <div class="profile-body">

          <!-- 左侧：统计数据 -->
          <section class="profile-section stats-section">
            <div class="stat-item">
              <span class="stat-label">当前积分</span>
              <span class="stat-value points">{{ authStore.user.points }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">上次签到</span>
              <span class="stat-value date">{{ formattedLastCheckIn }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">文化属性</span>
              <RouterLink v-if="authStore.testResult" to="/culture-test" class="stat-value result-link">
                 {{ cultureTestResultTitle }} <span class="arrow">→</span>
              </RouterLink>
              <span v-else class="stat-value pending">
                <RouterLink to="/culture-test">前往测试 <span class="arrow">→</span></RouterLink>
              </span>
            </div>
          </section>

          <!-- 右侧：占位或未来扩展 -->
          <section class="profile-section placeholder-section">
            <!-- 这里可以放用户的头像、徽章、或其他信息 -->
            <div class="avatar-placeholder">
              <!--  -->
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="#bdc3c7"><path d="M50 0a50 50 0 100 100A50 50 0 0050 0zm0 15a20 20 0 110 40 20 20 0 010-40zm0 48c-19.1 0-35.8 11.2-43.3 27.5A49.7 49.7 0 0050 99a49.7 49.7 0 0043.3-9.5C85.8 74.2 69.1 63 50 63z"/></svg>
            </div>
            <p class="placeholder-text">(未来可展示头像或徽章)</p>
          </section>

        </div>

        <!-- 页脚：操作区 -->
        <footer class="profile-footer">
           <button @click="authStore.logout" class="logout-button">退出登录</button>
        </footer>

      </div>
    </div>
    
    <div v-else class="login-prompt">
      <p>请先 <RouterLink to="/login">登录</RouterLink> 查看个人主页。</p>
    </div>

  </div>
</template>

<style scoped>
/* --- 页面基础 --- */
.profile-view {
  max-width: 900px; /* 稍微加宽 */
  margin: 40px auto; /* 增加顶部间距 */
}

/* --- 卡片包裹层 (可选, 用于背景或阴影) --- */
.profile-card-wrapper {
  /* 可以添加背景纹理 */
  /* background-image: url('...'); */
}

/* --- 主卡片样式 --- */
.profile-card {
  background-color: #fdfbf5; /* 米白色/淡褐色 */
  border-radius: 10px;
  /* 模拟宣纸/羊皮纸边缘的细微阴影 */
  box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 5px 15px rgba(0,0,0,0.05);
  overflow: hidden; /* 确保内部元素不溢出圆角 */
  border: 1px solid #eeebe2; /* 非常浅的边框 */
}

/* --- 页眉/标题区 --- */
.profile-header {
  padding: 30px 40px;
  /* background-color: #f8f5ed; */ /* 稍深一点的页眉背景 */
  border-bottom: 1px solid #e0dccc; /* 分隔线 */
  text-align: center; /* 居中 */
}
.username {
  font-family: 'Times New Roman', 'KaiTi', serif; /* 衬线字体 */
  font-size: 2.8em;
  font-weight: 500;
  color: #3a3f58; /* 墨蓝色 */
  margin: 0;
  line-height: 1.2;
}
.greeting {
  font-size: 1.1em;
  color: #8a8d9a; /* 灰色 */
  margin-top: 5px;
}

/* --- 主要内容区 (左右布局) --- */
.profile-body {
  display: grid;
  grid-template-columns: 2fr 1fr; /* 左侧宽，右侧窄 */
  gap: 0px; /* 先无缝隙 */
}

.profile-section {
  padding: 30px 40px;
}

/* 左侧：统计数据 */
.stats-section {
  border-right: 1px solid #e0dccc; /* 右侧分隔线 */
}

.stat-item {
  margin-bottom: 25px;
}
.stat-item:last-child {
  margin-bottom: 0;
}

.stat-label {
  display: block;
  font-size: 0.9em;
  color: #7f8c8d; /* 灰色标签 */
  margin-bottom: 8px;
  text-transform: uppercase; /* 标签大写 (可选) */
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 1.3em;
  font-weight: 600;
  color: #3a3f58; /* 墨蓝色 */
}
.stat-value.points {
  font-size: 2em; /* 突出积分 */
  color: #c89b4f; /* 暗金色 */
}
.stat-value.date {
  font-family: 'Georgia', serif; /* 日期用不同字体 */
}
.stat-value a { /* 统一链接样式 */
   color: #5b6ca8; /* 另一种蓝色 */
   text-decoration: none;
   font-weight: 500;
   transition: color 0.3s ease;
}
.stat-value a:hover {
   color: #3a3f58; /* 悬浮变深 */
   text-decoration: underline;
}
.arrow { /* 链接箭头 */
  display: inline-block;
  margin-left: 5px;
  transition: transform 0.3s ease;
}
.stat-value a:hover .arrow {
  transform: translateX(3px);
}
.stat-value.pending a { color: #8a8d9a; } /* 未测试链接颜色浅点 */


/* 右侧：占位区 */
.placeholder-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f8f5ed; /* 更深的背景，与左侧区分 */
}
.avatar-placeholder {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-color: #e0dccc;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 15px;
}
.avatar-placeholder svg {
  width: 60%;
  height: 60%;
}
.placeholder-text {
  font-size: 0.9em;
  color: #a0a5b8;
  text-align: center;
}

/* --- 页脚：操作区 --- */
.profile-footer {
  padding: 20px 40px;
  text-align: right; /* 按钮靠右 */
  background-color: #f8f5ed; /* 页脚背景 */
  border-top: 1px solid #e0dccc;
}

.logout-button {
  padding: 8px 20px; /* 按钮缩小 */
  font-size: 0.95em;
  font-weight: 500;
  color: #8a8d9a; /* 灰色文字 */
  background-color: transparent;
  border: 1px solid #d0d5dd; /* 浅灰色边框 */
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}
.logout-button:hover {
  background-color: #e8eaee;
  color: #3a3f58;
  border-color: #b0b5c1;
}

/* --- 未登录提示 --- */
.login-prompt {
  text-align: center;
  margin-top: 50px;
}

/* --- 响应式布局：手机屏幕 --- */
@media (max-width: 768px) {
  .profile-body {
    grid-template-columns: 1fr; /* 变为单列 */
  }
  .stats-section {
    border-right: none; /* 移除右边框 */
    border-bottom: 1px solid #e0dccc; /* 改为下边框 */
  }
  .profile-header, .profile-section, .profile-footer {
    padding: 20px 25px; /* 手机上内边距减小 */
  }
  .username { font-size: 2.2em; }
  .stat-value.points { font-size: 1.8em; }
}
</style>

