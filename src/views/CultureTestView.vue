<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { storeToRefs } from 'pinia'
import { RouterLink } from 'vue-router'

console.log("CultureTestView: Script setup started."); // <-- 日志 0

// --- 1. 状态定义 ---
const authStore = useAuthStore()
const {
  isLoggedIn,
  user,
  testLoading,
  testResult, // This is now a reactive ref
  testQuestions,
  testStats,
  testStatsTotal
} = storeToRefs(authStore)

console.log("CultureTestView: Initial testResult from storeToRefs:", JSON.stringify(testResult.value)); // <-- 日志 1

const ratingOptions = [
  { label: '非常同意', score: 2, class: 'rate-strong-agree' },
  { label: '同意', score: 1, class: 'rate-agree' },
  { label: '中立', score: 0, class: 'rate-neutral' },
  { label: '不同意', score: -1, class: 'rate-disagree' },
  { label: '非常不同意', score: -2, class: 'rate-strong-disagree' },
]
const answers = ref<(number | null)[]>(new Array(12).fill(null))
const isSubmitting = ref(false)
const isResetting = ref(false)
const shareMessage = ref<string | null>(null)

// --- 2. 核心逻辑 ---
const allQuestionsAnswered = computed(() => {
  if (!testQuestions.value || testQuestions.value.length === 0) return false;
  return answers.value.slice(0, testQuestions.value.length).every(answer => answer !== null);
});

const handleSubmitTest = async () => {
  if (!allQuestionsAnswered.value) return
  isSubmitting.value = true
  const answersToSubmit = answers.value.slice(0, testQuestions.value.length);
  // submitTest returns true/false, result is updated reactively via store
  await authStore.submitTest(answersToSubmit as number[]);
  console.log("CultureTestView: handleSubmitTest finished. Check if testResult updated:", JSON.stringify(testResult.value)); // <-- 日志 10
  isSubmitting.value = false
}

const handleResetTest = async () => {
  isResetting.value = true
  await authStore.resetTestResult() // This clears testResult in store and fetches questions
  // Update local answers based on potentially newly fetched questions
  answers.value = new Array(testQuestions.value?.length > 0 ? testQuestions.value.length : 12).fill(null);
  shareMessage.value = null
  isResetting.value = false
  console.log("CultureTestView: handleResetTest finished. testResult should be null:", testResult.value); // <-- 日志 11
}

const shareResult = () => {
  if (!testResult.value) return; // Use the reactive ref
  const textToCopy = `我在“文心雕龙”中西文化属性测试中，测得的结果是【${testResult.value.title}】！你也来试试吧：[你的网站链接]`;
  // ... (clipboard logic remains the same) ...
   try {
     navigator.clipboard.writeText(textToCopy).then(() => {
       shareMessage.value = '结果已复制到剪贴板！';
     }).catch(err => {
       console.warn('Clipboard API failed, trying execCommand:', err);
       const textArea = document.createElement('textarea');
       textArea.value = textToCopy;
       textArea.style.position = 'fixed'; textArea.style.top = '-9999px'; textArea.style.left = '-9999px';
       document.body.appendChild(textArea);
       textArea.select();
       try {
           const successful = document.execCommand('copy');
           shareMessage.value = successful ? '结果已复制到剪贴板！' : '复制失败，请手动分享。';
       } catch (err) {
           console.error('execCommand copy failed:', err);
           shareMessage.value = '复制失败，请手动分享。';
       }
       document.body.removeChild(textArea);
     });
   } catch (e) { console.error('Failed to copy text:', e); shareMessage.value = '复制失败，请手动分享。'; }
   setTimeout(() => { shareMessage.value = null; }, 3000);
}

// 计算百分比
const resultPercentage = computed(() => {
  console.log("--- Calculating Percentage ---"); // 日志 P1
  // Use reactive refs directly
  if (!testResult.value) { console.log("  -> Perc% Failed: testResult is null."); return null;}
  if (!testStats.value) { console.log("  -> Perc% Failed: testStats is null."); return null; }
  if (typeof testStatsTotal.value !== 'number') { console.log("  -> Perc% Failed: testStatsTotal is not a number."); return null; }

  const resultType = testResult.value.result_type;
  console.log(`  -> Perc% My Type: "${resultType}"`); // 日志 P2
  console.log("  -> Perc% Stats Obj:", JSON.stringify(testStats.value)); // 日志 P3

  let count = testStats.value[resultType];
  if (typeof count !== 'number' && typeof resultType === 'string') {
      const trimmedType = resultType.trim();
      count = testStats.value[trimmedType];
  }
  count = typeof count === 'number' ? count : 0;
  console.log(`  -> Perc% Count for type: ${count}`); // 日志 P4

  const total = testStatsTotal.value;
  console.log(`  -> Perc% Total: ${total}`); // 日志 P5

  if (total === 0) { console.log("  -> Perc% Result: 0.0% (Total is zero)"); return '0.0'; }

  const percentage = ((count / total) * 100).toFixed(1);
  console.log(`  -> Perc% Final: ${percentage}%`); // 日志 P6
  return percentage;
});


// 页面加载逻辑
onMounted(async () => {
  console.log("CultureTestView: Component Mounted"); // 日志 M1
  if (isLoggedIn.value) { // Use reactive ref
    console.log("CultureTestView: User logged in. Initial testResult:", JSON.stringify(testResult.value)); // 日志 M2

    // If result exists (from localStorage), fetch stats
    if (testResult.value) {
      console.log("CultureTestView: Result exists in store/localStorage. Fetching stats..."); // 日志 M3
      // Only fetch stats if they are missing
      if (!testStats.value) {
         await authStore.fetchTestStats();
         console.log("CultureTestView: fetchTestStats finished after finding local result."); // 日志 M4
      } else {
         console.log("CultureTestView: Stats already exist in store."); // 日志 M4a
      }
    }
    // If no result, fetch result (which includes stats if found)
    else {
      console.log("CultureTestView: No result in store/localStorage. Calling fetchTestResult..."); // 日志 M5
      await authStore.fetchTestResult();
      console.log("CultureTestView: fetchTestResult finished. Current testResult:", JSON.stringify(testResult.value)); // 日志 M6

      // If still no result after fetching, fetch questions
      if (!testResult.value) {
        console.log("CultureTestView: Still no result. Calling fetchTestQuestions..."); // 日志 M7
        await authStore.fetchTestQuestions();
        console.log("CultureTestView: fetchTestQuestions finished. Count:", testQuestions.value?.length); // 日志 M8
        // Initialize answers array based on fetched questions
        answers.value = new Array(testQuestions.value?.length > 0 ? testQuestions.value.length : 12).fill(null);
      } else {
         console.log("CultureTestView: Result was fetched from API. Stats should be loaded."); // 日志 M9
         // Double check if stats loaded, sometimes needed if fetchTestResult was very fast
         if (!testStats.value){
            console.log("CultureTestView: Stats seem missing even after fetchResult, fetching stats manually..."); // 日志 M9a
            await authStore.fetchTestStats();
         }
      }
    }
  } else {
    console.log("CultureTestView: User not logged in."); // 日志 M10
    // No need to clear store refs here, v-if handles display
  }
  console.log("CultureTestView: onMounted sequence finished."); // 日志 M11
});

</script>

<template>
  <div class="page-container">
    <h1 class="page-title">中西文化属性测试</h1>

    <!-- A. 未登录 -->
    <div v-if="!isLoggedIn" class="test-card login-prompt">
      <h2>请先登录</h2>
      <p>
        <RouterLink to="/login">登录</RouterLink> 或
        <RouterLink to="/register">注册</RouterLink>
        后才能开始测试。
      </p>
    </div>

    <!-- B. 加载中 -->
    <div v-else-if="testLoading && !testResult" class="test-card loading">
      <h2>正在加载测试数据...</h2>
      <p>（请稍候）</p>
    </div>

    <!-- C. 已有结果 (已测过) -->
    <!-- (!!! 使用响应式引用 testResult !!!) -->
    <div v-else-if="testResult" class="test-card result-card">
      <h2 class="result-title">你的测试结果</h2>
      <h3>{{ testResult.title }}</h3>
      <pre class="result-analysis">{{ testResult.analysis }}</pre>

      <!-- 分数显示，确保数据存在 -->
      <!-- (!!! 使用 testResult.value !!!) -->
      <div class="result-scores" v-if="typeof testResult.h_score === 'number' && typeof testResult.r_score === 'number'">
        <p>H 分 (和谐/人伦): <strong>{{ testResult.h_score }}</strong></p>
        <p>R 分 (理性/个体): <strong>{{ testResult.r_score }}</strong></p>
      </div>
      <div v-else class="result-scores"><p>分数加载中...</p></div>

      <!-- 统计信息显示，确保数据存在 -->
      <!-- (!!! 使用 testStats.value 和 testStatsTotal.value !!!) -->
      <div v-if="testStats && typeof testStatsTotal === 'number'" class="result-stats">
        <p v-if="resultPercentage !== null && testStatsTotal > 0">
          📊 已有 <strong>{{ resultPercentage }}%</strong> 的用户和你得到了相同的结果类型！
          <span>(共 {{ testStatsTotal }} 人参与测试)</span>
        </p>
         <p v-else-if="testStatsTotal === 0">📊 你是第一个完成测试的用户！</p>
         <p v-else class="error-text">无法计算统计百分比。</p>
      </div>
      <div v-else class="result-stats loading-stats">
          <p>正在加载统计数据...</p>
      </div>

      <p class="result-footer">*本测试结果仅供参考</p>
      <div class="result-actions">
        <button @click="shareResult" class="share-btn">分享结果</button>
        <button @click="handleResetTest" :disabled="isResetting" class="reset-btn">{{ isResetting ? '重置中...' : '重新测试' }}</button>
      </div>
      <p v-if="shareMessage" class="share-message">{{ shareMessage }}</p>
    </div>

    <!-- D. 未测过, 显示题目 -->
    <!-- (!!! 使用 testQuestions.value !!!) -->
    <div v-else-if="testQuestions.length > 0" class="test-card">
       <div class="test-intro">
         <p>你好！本测试包含 {{ testQuestions.length }} 个问题，请你对每一个陈述句，选择你内心的认同程度。</p>
       </div>
       <div class="rating-legend">
         <span class="legend-item rate-strong-agree">非常同意</span>
         <span class="legend-item rate-agree">同意</span>
         <span class="legend-item rate-neutral">中立</span>
         <span class="legend-item rate-disagree">不同意</span>
         <span class="legend-item rate-strong-disagree">非常不同意</span>
       </div>
       <form class="test-form" @submit.prevent="handleSubmitTest">
         <div v-for="(question, index) in testQuestions" :key="question.id" class="question-item">
           <p class="question-text"><strong>{{ index + 1 }}.</strong> {{ question.text }}</p>
           <div class="rating-group">
             <label v-for="option in ratingOptions" :key="option.score" :class="[ option.class, 'rating-label', { 'selected': answers[index] === option.score }]">
               <input type="radio" :name="'q' + index" :value="option.score" v-model.number="answers[index]" class="rating-input">
               <span class="rating-text">{{ option.label }}</span>
             </label>
           </div>
         </div>
         <button type="submit" class="submit-btn" :disabled="!allQuestionsAnswered || isSubmitting">{{ isSubmitting ? '计算中...' : (allQuestionsAnswered ? '查看结果' : '请先完成所有题目') }}</button>
       </form>
    </div>

    <!-- E. 出错页面 (或题目为空) -->
    <div v-else class="test-card loading">
       <h2>加载失败</h2>
       <p>无法加载测试题，请刷新页面重试。</p>
    </div>
  </div>
</template>

<style scoped>
/* (所有样式保持不变) */
.page-container { padding: 20px; }
.test-card{max-width:800px;margin:20px auto;background-color:#fff;border-radius:12px;padding:30px 40px;box-shadow:0 4px 15px rgba(0,0,0,.08)}.loading,.login-prompt{text-align:center}.test-intro p{font-size:1.1em;color:#333;line-height:1.6}.rating-legend{display:flex;justify-content:space-around;flex-wrap:wrap;background-color:#f8f9fa;padding:10px;border-radius:8px;margin:20px 0;font-size:.9em}.legend-item{font-weight:500;padding:5px}.question-item{margin-bottom:30px;border-bottom:1px solid #eee;padding-bottom:20px}.question-text{font-size:1.1em;font-weight:500;line-height:1.6;color:#2c3e50}.rating-group{display:flex;justify-content:space-between;flex-wrap:wrap;margin-top:15px}.rating-input{display:none}.rating-label{display:flex;flex-direction:column;align-items:center;cursor:pointer;padding:10px;border-radius:8px;border:2px solid #dfe6e9;transition:all .2s ease;min-width:100px;text-align:center;background-color:#f8f9fa;margin:5px}.rating-label:hover{background-color:#f0f0f0;border-color:#bdc3c7}.rating-text{font-size:.9em}.rating-label.selected{background-color:#ecf5ff;border-color:#3498db;box-shadow:0 0 10px rgba(52,152,219,.3);transform:translateY(-2px)}.rating-label.selected .rating-text{font-weight:700;color:#2980b9}.rate-strong-agree .rating-text{color:#16a085}.rate-agree .rating-text{color:#27ae60}.rate-neutral .rating-text{color:#7f8c8d}.rate-disagree .rating-text{color:#e74c3c}.rate-strong-disagree .rating-text{color:#c0392b}.submit-btn{width:100%;padding:15px 20px;font-size:1.2em;font-weight:600;background-color:#3498db;color:#fff;border:none;border-radius:8px;cursor:pointer;margin-top:20px;transition:background-color .3s ease}.submit-btn:hover{background-color:#2980b9}.submit-btn:disabled{background-color:#bdc3c7;cursor:not-allowed}.result-card{text-align:center}.result-title{color:#2c3e50}.result-card h3{font-size:1.8em;font-weight:600;color:#3498db;margin-top:0}.result-analysis{font-family:'KaiTi','SimSun',serif;font-size:1.1em;line-height:1.8;color:#333;text-align:left;background-color:#f8f9fa;padding:20px;border-radius:8px;white-space:pre-wrap;margin-bottom:20px}.result-scores{display:flex;justify-content:space-around;margin-bottom:20px}.result-scores p{font-size:1.1em;color:#555}.result-stats{background-color:#ecf5ff;padding:15px;border-radius:8px;margin-bottom:20px;font-size:1em;color:#2980b9}.result-stats.loading-stats{color:#7f8c8d; background-color: #f8f9fa;} .result-stats strong{font-weight:700}.result-stats span{font-size:.9em;color:#7f8c8d} .error-text { color: #e74c3c; font-weight: 500;} .result-footer{margin-bottom:20px;font-size:.9em;color:#999}.result-actions{display:flex;justify-content:center;gap:20px;margin-top:20px;padding-top:20px;border-top:1px solid #eee}.share-btn,.reset-btn{padding:10px 25px;font-size:1em;font-weight:500;border-radius:8px;cursor:pointer;transition:all .3s ease}.share-btn{color:#fff;background-color:#2ecc71;border:none}.share-btn:hover{background-color:#27ae60}.reset-btn{color:#7f8c8d;background-color:transparent;border:2px solid #bdc3c7}.reset-btn:not(:disabled):hover{background-color:#f8f9fa;color:#34495e;border-color:#95a5a6}.reset-btn:disabled{opacity:.6;cursor:not-allowed}.share-message{margin-top:15px;font-size:.9em;color:#28a745}
</style>