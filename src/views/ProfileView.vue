<script setup lang="ts">
import { useAuthStore } from '../stores/authStore'
import { computed, ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { RouterLink } from 'vue-router'

const authStore = useAuthStore()
const { user, testResult, activitiesLoading, recentActivities } = storeToRefs(authStore)
const router = useRouter()

// --- 头像选择逻辑 ---
const defaultAvatar = 'https://placehold.co/100x100/bdc3c7/ffffff?text=默认';

const availableAvatars = computed(() => [
  // (!!! 警告: 确保这 3 个文件存在于 src/assets/images/avatars/ 目录下 !!!)
  // (!!! 否则头像切换会失败 !!!)
  new URL('../assets/images/avatars/avatar1.png', import.meta.url).href,
  new URL('../assets/images/avatars/avatar2.png', import.meta.url).href,
  new URL('../assets/images/avatars/avatar3.png', import.meta.url).href,
  defaultAvatar
]);
const showAvatarSelector = ref(false);

const selectedAvatar = ref<string>(defaultAvatar);
const localStorageKey = ref<string>('userAvatar_default');

// 监视 user.id 的变化
watch(
  () => user.value?.id,
  (newId) => {
    if (newId) {
      localStorageKey.value = `userAvatar_${newId}`;
      const savedAvatar = localStorage.getItem(localStorageKey.value);
      if (savedAvatar && availableAvatars.value.includes(savedAvatar)) {
        selectedAvatar.value = savedAvatar;
      } else {
        selectedAvatar.value = defaultAvatar;
      }
    } else {
      selectedAvatar.value = defaultAvatar;
    }
  },
  { immediate: true }
);

function saveAvatar() {
  if (!user.value?.id) return;
  localStorage.setItem(localStorageKey.value, selectedAvatar.value);
  showAvatarSelector.value = false;
}
// --- 头像逻辑结束 ---


onMounted(async () => {
    if (!authStore.isLoggedIn) {
        router.push('/');
        return;
    }
    if(user.value) {
        await Promise.all([
            authStore.fetchTestResult(),
            authStore.fetchRecentActivities()
        ]);
    }
});

const formattedLastCheckIn = computed(() => {
  if (user.value?.lastCheckIn) {
    try {
      const parts = user.value.lastCheckIn.split('-').map(Number);
      const [year, month, day] = parts;

      // (!!! 关键修复: 添加对 undefined 的显式检查 !!!)
      if (parts.length === 3 &&
          year !== undefined && month !== undefined && day !== undefined &&
          !isNaN(year) && !isNaN(month) && !isNaN(day))
      {
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
      }
      return '日期格式无效';
    } catch (e) {
      console.error("Error formatting date:", e);
      return '日期无效';
    }
  }
  return '从未签到过';
});

const cultureTestResultTitle = computed(() => {
  return testResult.value?.title ?? '尚未测试';
});

</script>

<template>
  <div class="page-container profile-view">
    <div v-if="user" class="profile-card-wrapper">
      <div class="profile-card">
        <header class="profile-header">
          <div class="avatar-container">
            <img :src="selectedAvatar" alt="用户头像" class="current-avatar" @click="showAvatarSelector = !showAvatarSelector" title="点击更换头像">
            <transition name="fade">
              <div v-if="showAvatarSelector" class="avatar-selector-overlay" @click.self="showAvatarSelector = false">
              <div class="avatar-selector">
                  <h4>选择你的头像</h4>
                  <div class="avatar-options">
                    <label v-for="avatarUrl in availableAvatars" :key="avatarUrl" class="avatar-option">
                        <input type="radio" v-model="selectedAvatar" :value="avatarUrl" name="avatar">
                        <img :src="avatarUrl" alt="头像选项" onerror="this.style.display='none'; this.parentElement.style.backgroundColor='#eee'; this.parentElement.title='图片加载失败, 请检查文件路径'">
                    </label>
                  </div>
                <div class="avatar-actions">
                    <button @click="showAvatarSelector = false" class="cancel-avatar-btn">取消</button>
                  <button @click="saveAvatar" class="save-avatar-btn">确定</button>
                </div>
               </div>
            </div>
            </transition>
          </div>
          <h2 class="username">{{ user.username }}</h2>
          <p class="greeting">欢迎回来</p>
        </header>

        <section class="profile-section stats-section">
          <div class="stat-item">
            <span class="stat-label">当前积分</span>
            <span class="stat-value points">{{ user.points }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">上次签到</span>
            <span class="stat-value date">{{ formattedLastCheckIn }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">文化属性</span>
            <RouterLink v-if="testResult" to="/culture-test" class="stat-value result-link">
              {{ cultureTestResultTitle }} <span class="arrow">→</span>
            </RouterLink>
            <span v-else class="stat-value pending">
              <RouterLink to="/culture-test">前往测试 <span class="arrow">→</span></RouterLink>
            </span>
          </div>
        </section>

        <div class="profile-body">
          <section class="profile-section recent-activity-section">
             <h3>最近活动记录</h3>
             <div v-if="activitiesLoading" class="loading-placeholder">
                <p>正在加载活动记录...</p>
             </div>
             <ul v-else-if="recentActivities && recentActivities.length > 0" class="activity-list">
                <li v-for="activity in recentActivities" :key="activity.id" class="activity-item">
                    <span class="activity-type" :class="activity.type === '签到' ? 'checkin' : 'quiz'">
                        {{ activity.type === '签到' ? '✓' : '?' }}
                    </span>
                    <span class="activity-details">
                        {{ activity.type }} ({{ activity.date }})
                        <span v-if="activity.type === '答题'" :class="activity.correct ? 'correct' : 'incorrect'">
                          {{ activity.correct ? '答对' : '答错' }}
                        </span>
                    </span>
                    <span class="activity-points">{{ activity.points }} 分</span>
                </li>
             </ul>
             <p v-else class="no-activity">暂无活动记录</p>
          </section>
        </div>

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
/* (!!! 这是全新的样式, 请替换掉你 <style> 标签里的所有内容 !!!) */

/* 1. 基础和页面布局 */
.profile-view {
  max-width: 700px;
  margin: 40px auto;
  padding: 0 20px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
}

.page-container {
  background-color: #f4f7f6; /* 轻量级灰色背景 */
  min-height: 100vh;
}

.profile-card {
  background-color: #ffffff; /* 纯白卡片 */
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06); /* 现代化、更柔和的阴影 */
  overflow: hidden;
  border: none; /* 移除旧边框 */
}

/* 2. 头部区域 (头像、用户名) */
.profile-header {
  padding: 30px 40px;
  border-bottom: 1px solid #edf2f7; /* 更轻的边框色 */
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative; /* 为了头像选择器定位 */
}

.avatar-container {
  position: relative; /* 为了选择器 */
  margin-bottom: 15px;
}

.current-avatar {
  width: 120px; /* 放大头像 */
  height: 120px;
  border-radius: 50%;
  border: 4px solid #fff;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  object-fit: cover;
  background-color: #eee;
}

.current-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
}

/* 3. 头像选择器 (模态框) */
.avatar-selector-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.avatar-selector {
  position: relative; /* 从 absolute 改为 relative, 因为它在 overlay 内部 */
  top: auto;
  left: auto;
  background-color: #fff;
  border: none;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  z-index: 101;
  width: 300px;
}
.avatar-selector h4 {
  margin: 0 0 15px 0;
  text-align: center;
  font-size: 1.1em;
  color: #333;
  font-weight: 600;
}
.avatar-options {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
  justify-content: center;
}
.avatar-option {
  cursor: pointer;
  border: 2px solid transparent;
  border-radius: 50%;
  padding: 3px;
  transition: border-color 0.2s ease;
  width: 60px; /* 放大选项 */
  height: 60px;
  background-color: #eee; /* 错误时的背景 */
}
.avatar-option input[type="radio"] {
  display: none;
}
.avatar-option img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: block;
  object-fit: cover;
}
.avatar-option:hover {
  border-color: #ccc;
}
.avatar-option input[type="radio"]:checked + img {
  border: 4px solid #007bff;
  padding: 0; /* 选中时移除内边距 */
  box-sizing: border-box; /* 确保边框不会增加总大小 */
}

/* 选中项的父元素边框 */
.avatar-option input[type="radio"]:checked {
  border-color: transparent;
}

.avatar-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}
.save-avatar-btn, .cancel-avatar-btn {
  padding: 8px 15px;
  font-size: 0.9em;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid;
}
.save-avatar-btn {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}
.cancel-avatar-btn {
  background-color: #f0f0f0;
  color: #333;
  border-color: #ccc;
}
.save-avatar-btn:hover { background-color: #0056b3; }
.cancel-avatar-btn:hover { background-color: #e0e0e0; }

.username {
  font-family: inherit; /* 使用统一字体 */
  font-size: 2.2em;
  font-weight: 600;
  color: #1a202c; /* 更深的黑色 */
  margin: 0;
  line-height: 1.2;
}
.greeting {
  font-size: 1.1em;
  color: #718096; /* 中性灰色 */
  margin-top: 5px;
}

/* 4. 数据统计栏 */
.stats-section {
  display: flex;
  justify-content: space-around; /* 横向排列 */
  align-items: center;
  padding: 25px 20px;
  border-bottom: 1px solid #edf2f7;
}

.stat-item {
  margin-bottom: 0; /* 移除竖向间距 */
  text-align: center; /* 居中对齐 */
}

.stat-label {
  display: block;
  font-size: 0.85em; /* 调小标签 */
  color: #a0aec0; /* 浅灰色 */
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.stat-value {
  font-size: 1.5em; /* 统一基础字号 */
  font-weight: 600;
  color: #2d3748;
}
.stat-value.points {
  font-size: 2em; /* 突出积分 */
  color: #3182ce; /* 改为蓝色调 */
}
.stat-value.date {
  font-family: inherit; /* 统一字体 */
  font-size: 1.2em; /* 日期字号 */
}
.stat-value a {
  color: #3182ce;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
  font-size: 1.2em;
}
.stat-value a:hover {
  color: #2b6cb0;
}
.arrow {
  display: inline-block;
  margin-left: 5px;
  transition: transform 0.3s ease;
}
.stat-value a:hover .arrow {
  transform: translateX(3px);
}
.stat-value.pending a {
  color: #718096;
}

/* 5. 主体内容 (最近活动) */
.profile-body {
  display: grid;
  grid-template-columns: 1fr; /* 改为单列, 因为数据栏已经提出 */
  gap: 0px;
}
.profile-section {
  padding: 25px 30px;
}
/* .stats-section 在上面被重定义了 */

.recent-activity-section h3 {
  margin-top: 0;
  font-size: 1.3em;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #edf2f7;
}

/* 6. 活动列表 */
.activity-list {
  list-style: none; padding: 0; margin: 0; max-height: 400px; overflow-y: auto;
  /* (滚动条样式保持不变) */
  &::-webkit-scrollbar { width: 6px; } &::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 3px; } &::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3px; } &::-webkit-scrollbar-thumb:hover { background: #aaa; }
}
.activity-item {
  display: flex; align-items: center; padding: 14px 5px; border-bottom: 1px solid #f0f0f0; font-size: 0.95em;
}
.activity-item:last-child { border-bottom: none; }
.activity-type {
  width: 30px; height: 30px; border-radius: 8px; /* 圆角矩形 */
  display: inline-flex; justify-content: center; align-items: center; margin-right: 15px; font-weight: bold; color: white; flex-shrink: 0;
}
.activity-type.checkin { background-color: #38a169; } /* 绿色 */
.activity-type.quiz { background-color: #3182ce; } /* 蓝色 */
.activity-details {
  flex-grow: 1; color: #4a5568; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.activity-details .correct { color: #38a169; margin-left: 5px; font-weight: 500;}
.activity-details .incorrect { color: #e53e3e; margin-left: 5px; font-weight: 500;}
.activity-points {
  font-weight: 600; color: #3182ce; /* 蓝色 */
  white-space: nowrap; margin-left: 10px;
}
.no-activity, .loading-placeholder {
  color: #a0aec0; text-align: center; padding: 20px 0; font-style: italic;
}

/* 7. 页脚 (退出登录) */
.profile-footer {
  padding: 20px 30px;
  text-align: center; /* 居中 */
  background-color: #fdfdfd;
  border-top: 1px solid #edf2f7;
}
.logout-button {
  padding: 10px 25px;
  font-size: 1em;
  font-weight: 500;
  color: #fff;
  background-color: #e53e3e; /* 醒目的红色 */
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  max-width: 300px;
}
.logout-button:hover {
  background-color: #c53030;
  box-shadow: 0 2px 5px rgba(229, 62, 62, 0.3);
}
.login-prompt { text-align: center; margin-top: 50px; }

/* 8. 响应式调整 */
@media (max-width: 768px) {
  .profile-view {
    margin: 20px auto;
  }
  .profile-header, .profile-section, .profile-footer {
    padding: 20px 25px;
  }
  .username { font-size: 2em; }
  /* 数据栏换行 */
  .stats-section {
    flex-wrap: wrap;
    gap: 20px;
  }
  .stat-item {
    /* 至少保证一行两个 */
    flex-basis: 30%; 
  }
  .stat-value.points { font-size: 1.8em; }
}

@media (max-width: 480px) {
  .stats-section {
    flex-direction: column; /* 在最小屏幕上完全堆叠 */
    align-items: stretch;
    gap: 25px;
  }
}

/* 9. 动画 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-active .avatar-selector, .fade-leave-active .avatar-selector {
  transition: all 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
.fade-enter-from .avatar-selector, .fade-leave-to .avatar-selector {
  opacity: 0;
  transform: scale(0.95) translateY(-10px);
}
</style>