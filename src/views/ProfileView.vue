<!-- 文件路径: src/views/ProfileView.vue -->
<script setup lang="ts">
import { useAuthStore } from '../stores/authStore'
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { RouterLink } from 'vue-router' // 确保导入 RouterLink

const authStore = useAuthStore()
// 从 store 中获取响应式状态
const { user, testResult, activitiesLoading, recentActivities } = storeToRefs(authStore)
const router = useRouter()

// --- 头像选择逻辑 ---
const availableAvatars = computed(() => [
  // 确保这些图片在你的 src/assets/images/avatars/ 目录下存在
  new URL('../assets/images/avatars/avatar1.png', import.meta.url).href,
  new URL('../assets/images/avatars/avatar2.png', import.meta.url).href,
  new URL('../assets/images/avatars/avatar3.png', import.meta.url).href,
  'https://placehold.co/100x100/bdc3c7/ffffff?text=默认' // 默认占位符
]);

// 定义动态的 localStorage 键
const localStorageKey = computed(() => user.value?.id ? `userAvatar_${user.value.id}` : 'userAvatar_default');

// selectedAvatar 的初始值需要在 onMounted 中根据 user.id 设置
const selectedAvatar = ref<string>(availableAvatars.value[availableAvatars.value.length - 1]); // 先给个默认值
const showAvatarSelector = ref(false); // 控制选择器显隐

// 保存头像选择
function saveAvatar() {
  if (!user.value?.id) { // 添加检查
      console.error("无法保存头像：用户未登录或用户ID无效");
      showAvatarSelector.value = false;
      return;
  }
  localStorage.setItem(localStorageKey.value, selectedAvatar.value); // 使用动态键保存
  showAvatarSelector.value = false;
}
// --- 头像逻辑结束 ---

// 页面加载时的逻辑
onMounted(async () => {
    if (!authStore.isLoggedIn || !user.value?.id) { // 同时检查 user.id
        router.push('/'); // 未登录则跳转到首页
        return;
    }

    // 在 onMounted 中读取正确的初始头像
    const savedAvatar = localStorage.getItem(localStorageKey.value); // 使用动态键读取
    if (savedAvatar && availableAvatars.value.includes(savedAvatar)) { // 检查读取到的值是否有效
      selectedAvatar.value = savedAvatar;
    } else {
       selectedAvatar.value = availableAvatars.value[availableAvatars.value.length - 1]; // 无效则用默认
    }

    // 并行获取测试结果和活动记录，提高效率
    await Promise.all([
        authStore.fetchTestResult(), // 获取测试结果 (内部会获取统计)
        authStore.fetchRecentActivities() // 获取活动记录
    ]);
});

// 格式化上次签到日期
const formattedLastCheckIn = computed(() => {
  if (user.value?.lastCheckIn) {
    try {
      // 后端返回的是 'YYYY-MM-DD' 格式
      const [year, month, day] = user.value.lastCheckIn.split('-').map(Number);
      // 创建 Date 对象时月份需要减 1
      const date = new Date(year, month - 1, day);
      // 使用中文格式化日期
      return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) {
      console.error("Error formatting date:", e);
      return '日期无效'; // 返回错误提示或原始字符串
    }
  }
  return '从未签到过';
});

// 获取文化测试结果标题
const cultureTestResultTitle = computed(() => {
  return testResult.value ? testResult.value.title : '尚未测试';
});

</script>

<template>
  <div class="page-container profile-view">
    <!-- 只有在用户信息加载后才显示卡片 -->
    <div v-if="user" class="profile-card-wrapper">
      <div class="profile-card">

        <header class="profile-header">
          <!-- 头像显示与编辑区域 -->
          <div class="avatar-container">
            <img :src="selectedAvatar" alt="用户头像" class="current-avatar" @click="showAvatarSelector = !showAvatarSelector" title="点击更换头像">
            <!-- 头像选择弹窗/区域 -->
            <transition name="fade">
              <div v-if="showAvatarSelector" class="avatar-selector">
                 <h4>选择你的头像</h4>
                 <div class="avatar-options">
                    <!-- 循环显示可选头像 -->
                    <label v-for="avatarUrl in availableAvatars" :key="avatarUrl" class="avatar-option">
                       <input type="radio" v-model="selectedAvatar" :value="avatarUrl" name="avatar">
                       <img :src="avatarUrl" alt="头像选项" onerror="this.style.display='none'; this.parentElement.style.backgroundColor='#eee';">
                    </label>
                 </div>
                 <button @click="saveAvatar" class="save-avatar-btn">确定</button>
                 <button @click="showAvatarSelector = false" class="cancel-avatar-btn">取消</button>
              </div>
            </transition>
          </div>
          <!-- 显示用户名和问候语 -->
          <h2 class="username">{{ user.username }}</h2>
          <p class="greeting">欢迎回来</p>
        </header>

        <div class="profile-body">
          <!-- 左侧：显示统计数据 -->
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
              <!-- 如果有测试结果，显示结果并链接到测试页 -->
              <RouterLink v-if="testResult" to="/culture-test" class="stat-value result-link">
                 {{ cultureTestResultTitle }} <span class="arrow">→</span>
              </RouterLink>
              <!-- 如果没有测试结果，显示提示并链接到测试页 -->
              <span v-else class="stat-value pending">
                <RouterLink to="/culture-test">前往测试 <span class="arrow">→</span></RouterLink>
              </span>
            </div>
          </section>

          <!-- 右侧：显示最近活动记录 -->
          <section class="profile-section recent-activity-section">
             <h3>最近活动记录</h3>
             <!-- 如果正在加载，显示提示 -->
             <div v-if="activitiesLoading" class="loading-placeholder">
                <p>正在加载活动记录...</p>
             </div>
             <!-- 如果加载完成且有记录，显示列表 -->
             <ul v-else-if="recentActivities && recentActivities.length > 0" class="activity-list">
                <!-- 循环显示所有获取到的活动记录 -->
                <li v-for="activity in recentActivities" :key="activity.id" class="activity-item">
                    <!-- 活动类型图标 -->
                    <span class="activity-type" :class="activity.type === '签到' ? 'checkin' : 'quiz'">
                        {{ activity.type === '签到' ? '✓' : '?' }}
                    </span>
                    <!-- 活动详情 -->
                    <span class="activity-details">
                        {{ activity.type }} ({{ activity.date }})
                        <!-- 如果是答题，显示是否答对 -->
                        <span v-if="activity.type === '答题'" :class="activity.correct ? 'correct' : 'incorrect'">
                          {{ activity.correct ? '答对' : '答错' }}
                        </span>
                    </span>
                    <!-- 获得的积分 -->
                    <span class="activity-points">{{ activity.points }} 分</span>
                </li>
                <!-- 移除了“查看全部”链接 -->
             </ul>
             <!-- 如果加载完成但没有记录，显示提示 -->
             <p v-else class="no-activity">暂无活动记录</p>
          </section>

        </div>

        <!-- 页脚：退出登录按钮 -->
        <footer class="profile-footer">
           <button @click="authStore.logout" class="logout-button">退出登录</button>
        </footer>

      </div>
    </div>

    <!-- 如果未登录，显示提示 -->
    <div v-else class="login-prompt">
      <p>请先 <RouterLink to="/login">登录</RouterLink> 查看个人主页。</p>
    </div>

  </div>
</template>

<style scoped>
/* --- 页面基础 --- */
.profile-view { max-width: 900px; margin: 40px auto; }
.profile-card-wrapper { /*...*/ }
.profile-card { background-color: #fdfbf5; border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 5px 15px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid #eeebe2; }

/* --- 页眉 --- */
.profile-header { padding: 30px 40px; border-bottom: 1px solid #e0dccc; text-align: center; position: relative; }
/* 头像 */
.avatar-container { position: absolute; top: 20px; left: 30px; }
.current-avatar { width: 80px; height: 80px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.1); cursor: pointer; transition: transform 0.3s ease; object-fit: cover; background-color: #eee; /* 头像加载失败时的底色 */ }
.current-avatar:hover { transform: scale(1.1); }
.avatar-selector { position: absolute; top: 90px; left: 0; background-color: #fff; border: 1px solid #e0dccc; border-radius: 8px; padding: 15px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); z-index: 10; width: 250px; }
.avatar-selector h4 { margin: 0 0 10px 0; text-align: left; font-size: 1em; color: #333;}
.avatar-options { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 15px; }
.avatar-option { cursor: pointer; border: 2px solid transparent; border-radius: 50%; padding: 2px; transition: border-color 0.2s ease; }
.avatar-option input[type="radio"] { display: none; }
.avatar-option img { width: 50px; height: 50px; border-radius: 50%; display: block; object-fit: cover; background-color: #eee; }
.avatar-option input[type="radio"]:checked + img { border: 3px solid #007bff; }
.avatar-option:hover img { opacity: 0.8; }
.save-avatar-btn, .cancel-avatar-btn { padding: 5px 10px; font-size: 0.9em; border-radius: 5px; cursor: pointer; margin-right: 10px; border: 1px solid; }
.save-avatar-btn { background-color: #007bff; color: white; border-color: #007bff;}
.cancel-avatar-btn { background-color: #eee; color: #333; border-color: #ccc;}

/* 用户名和问候语 */
.username { font-family: 'Times New Roman', 'KaiTi', serif; font-size: 2.8em; font-weight: 500; color: #3a3f58; margin: 0; line-height: 1.2; }
.greeting { font-size: 1.1em; color: #8a8d9a; margin-top: 5px; }

/* 内容区 */
.profile-body { display: grid; grid-template-columns: 1fr 1fr; gap: 0px; }
.profile-section { padding: 30px 40px; }
.stats-section { border-right: 1px solid #e0dccc; }
.stat-item { margin-bottom: 25px; }
.stat-item:last-child { margin-bottom: 0; }
.stat-label { display: block; font-size: 0.9em; color: #7f8c8d; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
.stat-value { font-size: 1.3em; font-weight: 600; color: #3a3f58; }
.stat-value.points { font-size: 2em; color: #c89b4f; }
.stat-value.date { font-family: 'Georgia', serif; }
.stat-value a { color: #5b6ca8; text-decoration: none; font-weight: 500; transition: color 0.3s ease; }
.stat-value a:hover { color: #3a3f58; text-decoration: underline; }
.arrow { display: inline-block; margin-left: 5px; transition: transform 0.3s ease; }
.stat-value a:hover .arrow { transform: translateX(3px); }
.stat-value.pending a { color: #8a8d9a; }

/* 最近活动 */
.recent-activity-section h3 { margin-top: 0; font-size: 1.4em; font-weight: 600; color: #34495e; margin-bottom: 15px; }
.activity-list {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 400px; /* 增加最大高度 */
  overflow-y: auto; /* 超出高度时显示滚动条 */
  /* 为滚动条添加简单样式 (可选, 兼容性注意) */
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 3px; }
  &::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3px; }
  &::-webkit-scrollbar-thumb:hover { background: #aaa; }
}
.activity-item { display: flex; align-items: center; padding: 12px 5px; border-bottom: 1px solid #f0f0f0; font-size: 0.95em; }
.activity-item:last-child { border-bottom: none; }
.activity-type { width: 28px; height: 28px; border-radius: 50%; display: inline-flex; justify-content: center; align-items: center; margin-right: 15px; font-weight: bold; color: white; flex-shrink: 0; }
.activity-type.checkin { background-color: #2ecc71; }
.activity-type.quiz { background-color: #3498db; }
.activity-details { flex-grow: 1; color: #555; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.activity-details .correct { color: #28a745; margin-left: 5px; font-weight: 500;}
.activity-details .incorrect { color: #e74c3c; margin-left: 5px; font-weight: 500;}
.activity-points { font-weight: 600; color: #e67e22; white-space: nowrap; margin-left: 10px; }
.no-activity, .loading-placeholder { color: #999; text-align: center; padding: 20px 0; font-style: italic; }

/* 页脚 */
.profile-footer { padding: 20px 40px; text-align: right; background-color: #f8f5ed; border-top: 1px solid #e0dccc; }
.logout-button { padding: 8px 20px; font-size: 0.95em; font-weight: 500; color: #8a8d9a; background-color: transparent; border: 1px solid #d0d5dd; border-radius: 6px; cursor: pointer; transition: all 0.3s ease; }
.logout-button:hover { background-color: #e8eaee; color: #3a3f58; border-color: #b0b5c1; }

/* 未登录 */
.login-prompt { text-align: center; margin-top: 50px; }

/* 响应式 */
@media (max-width: 768px) {
  .profile-body { grid-template-columns: 1fr; }
  .stats-section { border-right: none; border-bottom: 1px solid #e0dccc; }
  .profile-header, .profile-section, .profile-footer { padding: 20px 25px; }
  .username { font-size: 2.2em; }
  .stat-value.points { font-size: 1.8em; }
  .avatar-container { position: static; margin-bottom: 15px; display: flex; justify-content: center; }
  .avatar-selector { left: 50%; transform: translateX(-50%); top: 110px; }
}

/* 淡入淡出 */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>