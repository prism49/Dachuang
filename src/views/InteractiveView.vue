<!-- 文件路径: src/views/InteractiveView.vue (签到卡片 简洁版) -->

<script setup lang="ts">
// (script 部分代码不变)
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { RouterLink } from 'vue-router'
import type { DailyQuizResponse } from '../stores/authStore'

const authStore = useAuthStore()
const message = ref<string | null>(null)
const isLoading = ref(false)

function getLocalDateString() {
  const today = new Date();
  const offset = today.getTimezoneOffset() * 60000;
  const localDate = new Date(today.getTime() - offset);
  return localDate.toISOString().split('T')[0];
}

const selectedOptionIndex = ref<number | null>(null)
const quizMessage = ref<string | null>(null)
const isSubmitting = ref(false)

const today = new Date()
const currentYear = ref(today.getFullYear())
const currentMonth = ref(today.getMonth())

const monthNames = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"]
const weekDayNames = ["日", "一", "二", "三", "四", "五", "六"]

const calendarGrid = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  
  const todayString = getLocalDateString()
  const lastCheckInString = authStore.user?.lastCheckIn

  const grid: any[] = []
  for (let i = 0; i < firstDayOfMonth; i++) {
    grid.push({ key: `blank-${i}`, day: null })
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const cellDateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    
    const isToday = (cellDateString === todayString)
    const hasCheckedIn = (cellDateString === lastCheckInString)
    
    grid.push({
      key: `day-${day}`,
      day: day,
      isToday: isToday,
      isCheckedIn: hasCheckedIn
    })
  }
  return grid
})

const hasCheckedInToday = computed(() => {
  if (!authStore.user?.lastCheckIn) return false
  const todayString = getLocalDateString()
  return authStore.user.lastCheckIn === todayString
})

const handleCheckIn = async () => {
  isLoading.value = true
  message.value = '正在签到...'
  const result = await authStore.checkIn()
  message.value = result.message
  isLoading.value = false
  if (result.success) {
    if (!authStore.dailyQuiz || !authStore.dailyQuiz.question.id) {
       await authStore.fetchDailyQuiz()
    }
    quizMessage.value = null;
    selectedOptionIndex.value = null;
  }
}

const handleSubmitQuiz = async () => {
  if (selectedOptionIndex.value === null || !authStore.dailyQuiz) return
  isSubmitting.value = true
  quizMessage.value = null
  const result = await authStore.submitQuiz(
    authStore.dailyQuiz.question.id,
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
  if (authStore.dailyQuiz?.hasAnswered) return
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

onMounted(() => {
  if (authStore.isLoggedIn) {
    if (hasCheckedInToday.value) {
      message.value = '今日已签到'
    } else {
      message.value = '今天还未签到'
    }

    if (!authStore.dailyQuiz) {
      authStore.fetchDailyQuiz()
    }
  }
})

</script>

<template>
  <div class="page-container">
    <h1 class="page-title">互动体验</h1>
    
    <!-- A. 登录后显示 -->
    <div v-if="authStore.isLoggedIn" class="layout-grid">
      
      <!-- ================== -->
      <!--      左侧：日历     -->
      <!-- ================== -->
      <section class="interactive-card calendar-wrapper">
        <!-- (日历部分模板不变) -->
        <div class="calendar-card">
          <div class="calendar-header">
            <h2>{{ monthNames[currentMonth] }} {{ currentYear }}</h2>
          </div>
          <div class="calendar-weekdays">
            <div v-for="dayName in weekDayNames" :key="dayName" class="weekday">
              {{ dayName }}
            </div>
          </div>
          <div class="calendar-grid">
            <div 
              v-for="cell in calendarGrid" 
              :key="cell.key"
              class="calendar-cell"
              :class="{ 
                'blank': !cell.day,
                'today': cell.isToday,
                'checked-in': cell.isCheckedIn && !cell.isToday,
                'today-checked-in': cell.isToday && cell.isCheckedIn
              }"
            >
              <template v-if="cell.day">
                <span class="day-number">{{ cell.day }}</span>
              </template>
            </div>
          </div>
        </div>

        <!-- (签到卡片模板不变) -->
        <div class="checkin-today-card">
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

      <!-- (每日一题卡片模板不变) -->
      <section class="interactive-card">
        <div class="quiz-card">
          <h2>每日一题</h2>
          <div v-if="authStore.quizLoading" class="loading-box">
            <p>正在加载今日题目...</p>
          </div>
          <div v-else-if="authStore.dailyQuiz" class="quiz-content">
            <p class="quiz-topic">今日主题：古典思想</p>
            <div class="quiz-question">
              <p><strong>问题：</strong> {{ authStore.dailyQuiz.question.question_text }}</p>
            </div>
            <div class="quiz-options">
              <button
                v-for="(option, index) in authStore.dailyQuiz.question.options"
                :key="index"
                class="option-btn"
                :class="getOptionClass(index, authStore.dailyQuiz)"
                @click="selectOption(index)"
                :disabled="authStore.dailyQuiz.hasAnswered"
              >
                {{ option }}
              </button>
            </div>
            <button 
              v-if="!authStore.dailyQuiz.hasAnswered"
              class="submit-btn"
              @click="handleSubmitQuiz"
              :disabled="selectedOptionIndex === null || isSubmitting"
            >
              {{ isSubmitting ? '提交中...' : '提交答案' }}
            </button>
            <div v-if="authStore.dailyQuiz.hasAnswered" class="analysis-box">
              <strong>答案解析：</strong>
              <p>{{ authStore.dailyQuiz.question.analysis }}</p>
            </div>
            <p v-if="quizMessage" class="message" :class="quizMessage.includes('正确') ? 'success' : 'error'">
              {{ quizMessage }}
            </p>
          </div>
          <div v-else class="loading-box">
            <p class="error">加载题目失败，请刷新重试。</p>
          </div>
        </div>
      </section>
    </div>

    <!-- B. 未登录时显示 (不变) -->
    <section v-else class="login-prompt-card">
       <!-- ... (代码不变) ... -->
       <h2>登录以参与互动</h2>
       <p>
         <RouterLink to="/login">登录</RouterLink> 或 
         <RouterLink to="/register">注册</RouterLink> 
         后可参与每日签到和答题。
       </p>
    </section>
    
    <!-- C. 预留功能区 (不变) -->
    <section class="interactive-section">
      <!-- ... (代码不变) ... -->
      <div class="cta-card">
        <h2>中西文化属性测试</h2>
        <p>
          你是更倾向于“儒道之心”还是“希腊之魂”？
          <br />
          通过 12 道题，发现你的人格底色。
        </p>
        <RouterLink to="/culture-test" class="cta-button">
          开始测试
        </RouterLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.page-container { max-width: 1200px; margin: 0 auto; padding: 20px; }
.layout-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
.interactive-card, .login-prompt-card, .cta-card { background-color: #ffffff; border-radius: 12px; padding: 25px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); }
.login-prompt-card { text-align: center; max-width: 600px; margin: 20px auto; }

/* --- 日历部分 (样式不变) --- */
.calendar-wrapper { display: flex; flex-direction: column; gap: 20px; }
.calendar-card { /* 保持原日历卡片样式 */ }
.calendar-header { text-align: center; margin-bottom: 25px; }
.calendar-header h2 { margin: 0; color: #2c3e50; font-size: 1.6em; font-weight: 600; }
.calendar-weekdays { display: grid; grid-template-columns: repeat(7, 1fr); margin-bottom: 10px; }
.weekday { text-align: center; font-weight: 500; color: #95a5a6; font-size: 0.9em; }
.calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; }
.calendar-cell { position: relative; aspect-ratio: 1 / 1; display: flex; justify-content: center; align-items: center; background-color: #f8f9fa; border-radius: 8px; transition: all 0.2s ease; font-size: 1.1em; color: #34495e; }
.calendar-cell:not(.blank):hover { transform: translateY(-2px); box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
.calendar-cell.blank { background-color: transparent; }
.day-number { font-weight: 500; }
.calendar-cell.today { border: 2px solid #3498db; background-color: #ecf5ff; color: #3498db; font-weight: 700; }
.calendar-cell.checked-in { background-color: #e8f5e9; border: 2px solid #2ecc71; color: #2ecc71; }
.calendar-cell.checked-in .day-number::after { content: '✓'; position: absolute; top: 4px; right: 4px; font-size: 0.7em; color: #2ecc71; }
.calendar-cell.today-checked-in { background-color: #d4edda; border: 2px solid #28a745; color: #1a5e2f; }
.calendar-cell.today-checked-in .day-number::after { content: '✓'; color: #1a5e2f; }

/* --- 今日签到独立卡片 (!!! 简洁版样式 !!!) --- */
.checkin-today-card {
  text-align: center;
  padding: 20px;
  background-color: #f8f9fa; /* 浅灰色背景 */
  border-radius: 12px;
  border: 1px solid #e9ecef; /* 浅边框 */
}
.checkin-status {
  font-size: 1.3em; /* 稍微缩小 */
  font-weight: 600;
  margin-bottom: 15px; /* 缩小间距 */
  display: flex;
  align-items: center;
  justify-content: center;
}
.checkin-status .icon {
  font-size: 1.1em;
  margin-right: 8px;
}
.checkin-status.success { color: #28a745; } /* 绿色 - 已签到 */
.checkin-status.pending { color: #6c757d; } /* 灰色 - 未签到 */

.big-checkin-button {
  width: 70%; /* 按钮宽度 */
  max-width: 250px;
  padding: 12px 20px; /* 按钮缩小 */
  font-size: 1.1em; /* 字体缩小 */
  font-weight: 600; /* 字体加粗 */
  color: white;
  background-color: #007bff; /* 主题蓝 */
  border: none;
  border-radius: 8px; /* 圆角减小 */
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0,0,0,0.15); /* 阴影减小 */
}
.big-checkin-button:hover:not(:disabled) {
  background-color: #0056b3; /* 深蓝 */
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
}
.big-checkin-button:disabled {
  background-color: #6c757d; /* 禁用时灰色 */
  color: #e9ecef;
  cursor: not-allowed;
  opacity: 0.7;
  box-shadow: none;
}
.message { text-align: center; margin-top: 10px; font-size: 0.9em; font-weight: 500; height: 1.2em; /* 预留空间，防止跳动 */ }
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