<!-- 文件路径: src/views/InteractiveView.vue (显示本月所有签到) -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { storeToRefs } from 'pinia' // 引入 storeToRefs
import { RouterLink } from 'vue-router'
import type { DailyQuizResponse } from '../stores/authStore' // 引入类型

// --- 1. 状态管理 ---
const authStore = useAuthStore()
// (!!! 使用 storeToRefs 获取响应式状态 !!!)
const { user, dailyQuiz, quizLoading, isLoggedIn, monthlyCheckIns, checkInsLoading } = storeToRefs(authStore)

const message = ref<string | null>(null) // 签到操作的消息
const isLoading = ref(false) // 签到按钮 loading

// --- (每日一题相关状态) ---
const selectedOptionIndex = ref<number | null>(null)
const quizMessage = ref<string | null>(null)
const isSubmitting = ref(false)

// --- 2. 日历核心逻辑 ---
const today = new Date()
const currentYear = ref(today.getFullYear())
const currentMonth = ref(today.getMonth()) // 0 = 一月, 11 = 十二月

const monthNames = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"]
const weekDayNames = ["日", "一", "二", "三", "四", "五", "六"]

// (!!! 辅助函数：获取本地日期的 YYYY-MM-DD 字符串 !!!)
function getLocalDateString(date: Date = new Date()): string {
  // 修正时区偏移量
  const offset = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() - offset);
  return localDate.toISOString().split('T')[0];
}
const todayString = getLocalDateString(today); // 获取今天的 YYYY-MM-DD

// (!!! 核心修改：calendarGrid 计算属性 !!!)
const calendarGrid = computed(() => {
  // console.log("[Calendar] Recalculating grid. Current check-ins:", monthlyCheckIns.value); // 日志
  const year = currentYear.value
  const month = currentMonth.value // 0-11

  const firstDayOfMonth = new Date(year, month, 1).getDay() // 本月第一天是星期几
  const daysInMonth = new Date(year, month + 1, 0).getDate() // 本月总天数

  // (!!! 关键: 将 monthlyCheckIns 数组转换为 Set 以提高查找效率 !!!)
  const checkInSet = new Set(monthlyCheckIns.value || []);
  // console.log("[Calendar] Check-in Set:", checkInSet); // 日志

  const grid: Array<{
      key: string;
      day: number | null;
      isToday?: boolean;
      isCheckedIn?: boolean; // 表示这一天是否签到过
  }> = []

  // 填充空白格子
  for (let i = 0; i < firstDayOfMonth; i++) {
    grid.push({ key: `blank-${i}`, day: null })
  }

  // 填充日期格子
  for (let day = 1; day <= daysInMonth; day++) {
    // 构造当前格子的日期字符串 'YYYY-MM-DD'
    const cellDateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

    const isToday = (cellDateString === todayString)
    // (!!! 关键判断：检查当前日期是否存在于签到 Set 中 !!!)
    const hasCheckedIn = checkInSet.has(cellDateString)

    grid.push({
      key: `day-${day}`,
      day: day,
      isToday: isToday,
      isCheckedIn: hasCheckedIn // 使用新的判断结果
    })
  }
   // console.log("[Calendar] Generated grid:", grid.filter(c => c.isCheckedIn)); // 日志: 打印有签到的格子
  return grid
})

// (!!! 核心修改：判断今日是否签到 !!!)
const hasCheckedInToday = computed(() => {
  // 直接检查 Set，比 authStore.user.lastCheckIn 更可靠
  return monthlyCheckIns.value?.includes(todayString) ?? false;
});


// --- 3. 签到按钮点击事件 (不变) ---
const handleCheckIn = async () => {
  isLoading.value = true
  message.value = '正在签到...'
  const result = await authStore.checkIn() // checkIn 内部会调用 fetchMonthlyCheckIns
  message.value = result.message
  isLoading.value = false
  // 签到后 store 里的 monthlyCheckIns 会更新, calendarGrid 会自动重新计算
}

// --- 4. 每日一题 交互逻辑 (不变) ---
const handleSubmitQuiz = async () => {
  if (selectedOptionIndex.value === null || !dailyQuiz.value) return; // 使用 .value
  isSubmitting.value = true
  quizMessage.value = null
  const result = await authStore.submitQuiz(
    dailyQuiz.value.question.id,
    selectedOptionIndex.value
  )
  if (result.correct) {
    quizMessage.value = '回答正确！+1 积分'
  } else {
    quizMessage.value = '回答错误，再接再厉！'
  }
  isSubmitting.value = false
}

const selectOption = (index: number) => {
  if (dailyQuiz.value?.hasAnswered) return; // 使用 .value
  selectedOptionIndex.value = index
}

const getOptionClass = (index: number, quiz: DailyQuizResponse) => {
  if (!quiz.hasAnswered) {
    return selectedOptionIndex.value === index ? 'selected' : ''
  }
  const correctIdx = quiz.question.correct_answer
  if (index === correctIdx) {
    return 'correct'
  }
  if (index === selectedOptionIndex.value && !quiz.wasCorrect) {
    return 'incorrect'
  }
  return 'disabled'
}

// --- 5. 页面加载逻辑 (!!! 更新 !!!) ---
onMounted(async () => {
  if (isLoggedIn.value) { // 使用响应式引用
    console.log("[InteractiveView] Mounted. User logged in."); // 日志
    const year = currentYear.value;
    const month = currentMonth.value + 1; // API 需要 1-12

    // 并行获取当月签到记录和每日一题
    await Promise.all([
        authStore.fetchMonthlyCheckIns(year, month), // 获取本月签到
        dailyQuiz.value ? Promise.resolve() : authStore.fetchDailyQuiz() // 如果题目为空则获取
    ]);

    // 根据获取的数据设置初始签到消息
    if (hasCheckedInToday.value) {
      message.value = '今日已签到'
    } else {
      message.value = '今天还未签到'
    }
     console.log("[InteractiveView] Initial data fetched."); // 日志
  } else {
      console.log("[InteractiveView] Mounted. User not logged in."); // 日志
  }
})

</script>

<template>
  <div class="page-container">
    <h1 class="page-title">互动体验</h1>

    <!-- A. 登录后显示 -->
    <!-- (!!! 使用 isLoggedIn.value !!!) -->
    <div v-if="isLoggedIn" class="layout-grid">

      <!-- ================== -->
      <!--      左侧：日历     -->
      <!-- ================== -->
      <section class="interactive-card calendar-wrapper">
        <div class="calendar-card">
          <div class="calendar-header">
            <h2>{{ monthNames[currentMonth] }} {{ currentYear }}</h2>
            <!-- TODO: 可以添加切换月份的按钮 (未来功能) -->
          </div>
          <div class="calendar-weekdays">
            <div v-for="dayName in weekDayNames" :key="dayName" class="weekday">
              {{ dayName }}
            </div>
          </div>
          <!-- (!!! 日历网格现在依赖新的 calendarGrid 逻辑 !!!) -->
          <div class="calendar-grid">
            <!-- (显示加载状态) -->
            <div v-if="checkInsLoading" class="loading-overlay">
                加载签到记录中...
            </div>
            <div
              v-else
              v-for="cell in calendarGrid"
              :key="cell.key"
              class="calendar-cell"
              :class="{
                'blank': !cell.day,
                'today': cell.isToday,
                // (!!! isCheckedIn 现在表示当天是否签到过 !!!)
                'checked-in': cell.isCheckedIn
              }"
            >
              <template v-if="cell.day">
                <span class="day-number">{{ cell.day }}</span>
                <!-- (!!! 移除格子内的签到按钮 !!!) -->
                <!-- (!!! 直接在 checked-in 状态显示对勾 !!!) -->
                <div v-if="cell.isCheckedIn" class="checked-mark">
                  ✓
                </div>
              </template>
            </div>
          </div>
        </div>

        <!-- 今日签到独立卡片 -->
        <div class="checkin-today-card">
          <!-- (!!! 使用 hasCheckedInToday 计算属性 !!!) -->
          <h3 v-if="hasCheckedInToday" class="checkin-status success">
            <span class="icon">✓</span> 今日已签到
          </h3>
          <h3 v-else class="checkin-status pending">
            <span class="icon">◎</span> 今天还未签到
          </h3>
          <button
            @click="handleCheckIn"
            :disabled="isLoading || hasCheckedInToday"
            class="big-checkin-button"
          >
            <span v-if="isLoading">签到中...</span>
            <span v-else-if="hasCheckedInToday">今日已完成</span>
            <span v-else>立即签到 +1 积分</span>
          </button>
          <p class="message" :class="{ 'success': hasCheckedInToday, 'error': !hasCheckedInToday && message && message !== '正在签到...' && message !== '今天还未签到' }">
            {{ message }}
          </p>
        </div>
      </section>

      <!-- ================== -->
      <!--    右侧：每日一题   -->
      <!-- ================== -->
      <section class="interactive-card">
           <div class="quiz-card">
             <h2>每日一题</h2>
             <div v-if="quizLoading" class="loading-box"><p>正在加载今日题目...</p></div>
             <!-- (!!! 使用 dailyQuiz.value !!!) -->
             <div v-else-if="dailyQuiz" class="quiz-content">
               <p class="quiz-topic">今日主题：古典思想</p>
               <div class="quiz-question"><p><strong>问题：</strong> {{ dailyQuiz.question.question_text }}</p></div>
               <div class="quiz-options">
                 <button v-for="(option, index) in dailyQuiz.question.options" :key="index" class="option-btn" :class="getOptionClass(index, dailyQuiz)" @click="selectOption(index)" :disabled="dailyQuiz.hasAnswered">{{ option }}</button>
               </div>
               <button v-if="!dailyQuiz.hasAnswered" class="submit-btn" @click="handleSubmitQuiz" :disabled="selectedOptionIndex === null || isSubmitting">{{ isSubmitting ? '提交中...' : '提交答案' }}</button>
               <div v-if="dailyQuiz.hasAnswered" class="analysis-box"><strong>答案解析：</strong><p>{{ dailyQuiz.question.analysis }}</p></div>
               <p v-if="quizMessage" class="message" :class="quizMessage.includes('正确') ? 'success' : 'error'">{{ quizMessage }}</p>
             </div>
             <div v-else class="loading-box"><p class="error">加载题目失败，请刷新重试。</p></div>
           </div>
      </section>
    </div>

    <!-- B. 未登录时显示 (不变) -->
    <section v-else class="login-prompt-card">
       <h2>登录以参与互动</h2>
       <p><RouterLink to="/login">登录</RouterLink> 或 <RouterLink to="/register">注册</RouterLink> 后可参与每日签到和答题。</p>
    </section>

    <!-- C. 文化测试 CTA 卡片 (不变) -->
    <section class="interactive-section">
      <div class="cta-card">
        <h2>中西文化属性测试</h2>
        <p>你是更倾向于“儒道之心”还是“希腊之魂”？<br />通过 12 道题，发现你的人格底色。</p>
        <RouterLink to="/culture-test" class="cta-button">开始测试</RouterLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* --- 页面基础 --- */
.page-container { max-width: 1200px; margin: 0 auto; padding: 20px; }
.layout-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
.interactive-card, .login-prompt-card, .cta-card { background-color: #ffffff; border-radius: 12px; padding: 25px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); }
.login-prompt-card { text-align: center; max-width: 600px; margin: 20px auto; }

/* --- 日历部分 --- */
.calendar-wrapper { display: flex; flex-direction: column; gap: 20px; }
.calendar-card { /* 日历容器样式 */ }
.calendar-header { text-align: center; margin-bottom: 25px; }
.calendar-header h2 { margin: 0; color: #2c3e50; font-size: 1.6em; font-weight: 600; }
.calendar-weekdays { display: grid; grid-template-columns: repeat(7, 1fr); margin-bottom: 10px; }
.weekday { text-align: center; font-weight: 500; color: #95a5a6; font-size: 0.9em; }
.calendar-grid { position: relative; display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; }
/* (!!! 新增 Loading 覆盖层 !!!) */
.loading-overlay {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background-color: rgba(255, 255, 255, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    font-style: italic;
    color: #555;
    z-index: 5;
    border-radius: 8px;
}

.calendar-cell {
  position: relative;
  aspect-ratio: 1 / 1;
  display: flex;
  justify-content: center;
  align-items: center; /* 垂直居中数字 */
  background-color: #f8f9fa;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-size: 1.1em;
  color: #34495e;
}
.calendar-cell:not(.blank):hover { transform: translateY(-2px); box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
.calendar-cell.blank { background-color: transparent; box-shadow: none; border: none; }
.day-number { font-weight: 500; position: absolute; top: 5px; left: 5px; font-size: 0.8em;} /* 数字放在左上角 */

/* 今日格子样式 */
.calendar-cell.today {
  border: 2px solid #3498db;
  background-color: #ecf5ff;
}
.calendar-cell.today .day-number { color: #3498db; font-weight: 700; }

/* (!!! 修改 checked-in 样式，只显示对勾 !!!) */
.calendar-cell.checked-in {
   background-color: #e8f5e9; /* 淡绿色背景 */
   border: 2px solid transparent; /* 移除旧边框, 如果有的话 */
}
/* (!!! 新增 today.checked-in 样式 !!!) */
.calendar-cell.today.checked-in {
    background-color: #d4edda; /* 更深的绿色 */
    border-color: #28a745; /* 绿色边框 */
}
.calendar-cell.today.checked-in .day-number {
    color: #1a5e2f; /* 深绿色文字 */
}

.checked-mark {
  color: #2ecc71; /* 绿色对勾 */
  font-size: 1.8em;
  font-weight: bold;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.calendar-cell.today.checked-in .checked-mark {
    color: #1a5e2f; /* 深绿色对勾 */
}


/* --- 今日签到独立卡片 --- */
.checkin-today-card { text-align: center; padding: 20px; background-color: #f8f9fa; border-radius: 12px; border: 1px solid #e9ecef; }
.checkin-status { font-size: 1.3em; font-weight: 600; margin-bottom: 15px; display: flex; align-items: center; justify-content: center; }
.checkin-status .icon { font-size: 1.1em; margin-right: 8px; }
.checkin-status.success { color: #28a745; }
.checkin-status.pending { color: #6c757d; }
.big-checkin-button { width: 70%; max-width: 250px; padding: 12px 20px; font-size: 1.1em; font-weight: 600; color: white; background-color: #007bff; border: none; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 2px 5px rgba(0,0,0,0.15); }
.big-checkin-button:hover:not(:disabled) { background-color: #0056b3; transform: translateY(-2px); box-shadow: 0 4px 10px rgba(0,0,0,0.2); }
.big-checkin-button:disabled { background-color: #6c757d; color: #e9ecef; cursor: not-allowed; opacity: 0.7; box-shadow: none; }
.message { text-align: center; margin-top: 10px; font-size: 0.9em; font-weight: 500; height: 1.2em; }
.message.success { color: #28a745; }
.message.error { color: #dc3545; }

/* --- 每日一题卡片 (样式不变) --- */
.quiz-card h2 { text-align: center; color: #2c3e50; margin-top: 0; }
.loading-box { text-align: center; padding: 40px 0; color: #7f8c8d; }
.loading-box .error { color: #e74c3c; }
.quiz-topic { text-align: center; font-size: 0.9em; color: #7f8c8d; margin-top: -10px; margin-bottom: 20px; }
.quiz-question p { font-size: 1.1em; color: #34495e; line-height: 1.6; }
.quiz-options { display: flex; flex-direction: column; gap: 10px; margin: 20px 0; }
.option-btn { width: 100%; padding: 12px; text-align: left; background-color: #f8f9fa; border: 2px solid #dfe6e9; border-radius: 8px; cursor: pointer; font-size: 1em; color: #333; transition: all 0.2s ease; }
.option-btn:not(:disabled):hover { background-color: #ecf5ff; border-color: #3498db; }
.option-btn.selected { background-color: #ecf5ff; border-color: #3498db; box-shadow: 0 0 5px rgba(52, 152, 219, 0.5); }
.option-btn.correct { background-color: #e8f5e9; border-color: #2ecc71; color: #27ae60; font-weight: 600; }
.option-btn.incorrect { background-color: #fdedec; border-color: #e74c3c; color: #c0392b; font-weight: 600; }
.option-btn.disabled { opacity: 0.7; background-color: #f8f9fa; cursor: not-allowed; }
.submit-btn { width: 100%; padding: 12px 15px; background-color: #2ecc71; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1.1em; font-weight: 600; transition: background-color 0.3s ease; }
.submit-btn:hover { background-color: #27ae60; }
.submit-btn:disabled { background-color: #95a5a6; cursor: not-allowed; }
.analysis-box { margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 8px; border: 1px solid #e0e0e0; }
.analysis-box strong { color: #34495e; }
.analysis-box p { font-size: 0.95em; line-height: 1.6; margin: 5px 0 0 0; }

/* --- 文化测试 CTA 卡片 (样式不变) --- */
.interactive-section { margin-bottom: 30px; }
.cta-card { max-width: none; text-align: center; background: linear-gradient(135deg, #f5f7fa 0%, #eef2f7 100%); padding: 40px 30px; }
.cta-card h2 { margin-top: 0; font-size: 2em; color: #2c3e50; font-weight: 600; }
.cta-card p { font-size: 1.1em; color: #34495e; line-height: 1.6; margin: 15px 0 25px 0; }
.cta-button { display: inline-block; padding: 12px 35px; font-size: 1.15em; font-weight: 600; color: #fff; background-color: #3498db; border: none; border-radius: 8px; text-decoration: none; transition: all 0.3s ease; }
.cta-button:hover { background-color: #2980b9; transform: translateY(-3px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }

/* --- 响应式布局 --- */
@media (max-width: 768px) { .layout-grid { grid-template-columns: 1fr; } }
</style>