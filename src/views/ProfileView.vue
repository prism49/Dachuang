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
  // 为了安全构建, 如果文件不存在，Vite 会在 build 时报错
   new URL('../assets/images/avatars/avatar1.png', import.meta.url).href,
   new URL('../assets/images/avatars/avatar2.png', import.meta.url).href,
   new URL('../assets/images/avatars/avatar3.png', import.meta.url).href,
  defaultAvatar
]);
const showAvatarSelector = ref(false);

const selectedAvatar = ref<string>(defaultAvatar); // 默认值
const localStorageKey = ref<string>('userAvatar_default'); // 默认键

// 监视 user.id 的变化
watch(
  () => user.value?.id, // 监视用户ID
  (newId) => {
    if (newId) {
      localStorageKey.value = `userAvatar_${newId}`;
      const savedAvatar = localStorage.getItem(localStorageKey.value);
      // (!!! 修复 TS 错误: 确保 savedAvatar 不是 null 且有效!!!)
      if (savedAvatar && availableAvatars.value.includes(savedAvatar)) {
        selectedAvatar.value = savedAvatar;
      } else {
        selectedAvatar.value = defaultAvatar; // 使用常量默认值
      }
    } else {
      selectedAvatar.value = defaultAvatar; // 用户登出或 ID 无效时重置
    }
  },
  { immediate: true } // 立即执行一次
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
    // (!!! 修复 TS 错误 !!!)
    // 确保 user.value 存在后再获取活动
    if(user.value) {
        await Promise.all([
            authStore.fetchTestResult(),
            authStore.fetchRecentActivities()
        ]);
    }
});

// (!!! 修复 TS 错误 !!!)
const formattedLastCheckIn = computed(() => {
  if (user.value?.lastCheckIn) {
    try {
      const parts = user.value.lastCheckIn.split('-').map(Number);
      const [year, month, day] = parts;
      // (!!! 关键修复: 检查 year, month, day 是否都是有效数字 !!!)
      if (parts.length === 3 &&
          year !== undefined && month !== undefined && day !== undefined && // <-- 添加此行
          !isNaN(year) && !isNaN(month) && !isNaN(day))
      {
        // 经过检查, TS 此时知道 year, month, day 都是 'number' 类型
        const date = new Date(year, month - 1, day); // month - 1 是安全的
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

// (!!! 修复 TS 错误 !!!)
const cultureTestResultTitle = computed(() => {
  return testResult.value?.title ?? '尚未测试'; // 使用 ?? 提供默认值
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
              <div v-if="showAvatarSelector" class="avatar-selector">
                 <h4>选择你的头像</h4>
                 <div class="avatar-options">
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
          <h2 class="username">{{ user.username }}</h2>
          <p class="greeting">欢迎回来</p>
        </header>

        <div class="profile-body">
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

      </div> </div> <div v-else class="login-prompt">
      <p>请先 <RouterLink to="/login">登录</RouterLink> 查看个人主页。</p>
    </div>
  </div>
</template>

<style scoped>
/* (所有样式保持不变) */
.profile-view { max-width: 900px; margin: 40px auto; }
.profile-card-wrapper { /*...*/ }
.profile-card { background-color: #fdfbf5; border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 5px 15px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid #eeebe2; }
.profile-header { padding: 30px 40px; border-bottom: 1px solid #e0dccc; text-align: center; position: relative; }
.avatar-container { position: absolute; top: 20px; left: 30px; }
.current-avatar { width: 80px; height: 80px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.1); cursor: pointer; transition: transform 0.3s ease; object-fit: cover; background-color: #eee; }
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
.username { font-family: 'Times New Roman', 'KaiTi', serif; font-size: 2.8em; font-weight: 500; color: #3a3f58; margin: 0; line-height: 1.2; }
.greeting { font-size: 1.1em; color: #8a8d9a; margin-top: 5px; }
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
.recent-activity-section h3 { margin-top: 0; font-size: 1.4em; font-weight: 600; color: #34495e; margin-bottom: 15px; }
.activity-list { list-style: none; padding: 0; margin: 0; max-height: 400px; overflow-y: auto; &::-webkit-scrollbar { width: 6px; } &::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 3px; } &::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3px; } &::-webkit-scrollbar-thumb:hover { background: #aaa; }}
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
.profile-footer { padding: 20px 40px; text-align: right; background-color: #f8f5ed; border-top: 1px solid #e0dccc; }
.logout-button { padding: 8px 20px; font-size: 0.95em; font-weight: 500; color: #8a8d9a; background-color: transparent; border: 1px solid #d0d5dd; border-radius: 6px; cursor: pointer; transition: all 0.3s ease; }
.logout-button:hover { background-color: #e8eaee; color: #3a3f58; border-color: #b0b5c1; }
.login-prompt { text-align: center; margin-top: 50px; }
@media (max-width: 768px) { .profile-body { grid-template-columns: 1fr; } .stats-section { border-right: none; border-bottom: 1px solid #e0dccc; } .profile-header, .profile-section, .profile-footer { padding: 20px 25px; } .username { font-size: 2.2em; } .stat-value.points { font-size: 1.8em; } .avatar-container { position: static; margin-bottom: 15px; display: flex; justify-content: center; } .avatar-selector { left: 50%; transform: translateX(-50%); top: 110px; } }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>