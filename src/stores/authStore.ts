// 文件路径: src/stores/authStore.ts (增强错误捕获)

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import { useRouter } from 'vue-router'

// --- 1. 类型定义 ---
interface User { id: number; username: string; points: number; lastCheckIn: string | null; }
interface QuizQuestion { id: number; question_text: string; options: string[]; correct_answer?: number; analysis?: string; }
interface DailyQuizResponse { hasAnswered: boolean; wasCorrect?: boolean; question: QuizQuestion; }
interface TestQuestion { id: number; text: string; }
interface TestResult { h_score: number; r_score: number; result_type: string; title: string; analysis: string; }
interface TestStats { [key: string]: number; }

// --- 2. API URL 定义 ---
const AUTH_API_URL = 'http://localhost:3000/api/auth'
const USER_API_URL = 'http://localhost:3000/api/user'
const QUIZ_API_URL = 'http://localhost:3000/api/quiz'
const TEST_API_URL = 'http://localhost:3000/api/test'

// --- 3. Store 定义 ---
export const useAuthStore = defineStore('auth', () => {
  // --- State (状态) ---
  const user = ref<User | null>(JSON.parse(localStorage.getItem('user') || 'null'))
  const token = ref<string | null>(localStorage.getItem('token'))
  const router = useRouter()
  const dailyQuiz = ref<DailyQuizResponse | null>(null)
  const quizLoading = ref(false)
  const testQuestions = ref<TestQuestion[]>([])
  const testResult = ref<TestResult | null>(JSON.parse(localStorage.getItem('testResult') || 'null'))
  const testLoading = ref(false)
  const testStats = ref<TestStats | null>(null)
  const testStatsTotal = ref<number>(0)

  // --- Getters ---
  const isLoggedIn = computed(() => !!token.value && !!user.value)
  const authHeader = computed(() => ({ headers: { Authorization: `Bearer ${token.value}` } }))

  // --- Actions ---

  async function register(username: string, password: string) {
    try {
      await axios.post(`${AUTH_API_URL}/register`, { username, password });
      return true;
    } catch (error: any) {
      console.error('注册失败:', error.response?.data?.message || error.message);
      return false;
    }
  }

  async function login(username: string, password: string) {
    try {
      const res = await axios.post(`${AUTH_API_URL}/login`, { username, password });
      const { token: newToken, user: userData } = res.data;
      token.value = newToken;
      user.value = userData;
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      fetchTestResult(); // 登录后尝试获取结果
      return true;
    } catch (error: any) {
      console.error('登录失败:', error.response?.data?.message || error.message);
      return false;
    }
  }

  function logout() {
    token.value = null;
    user.value = null;
    dailyQuiz.value = null;
    testQuestions.value = [];
    testResult.value = null;
    testStats.value = null;
    testStatsTotal.value = 0;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('testResult');
    router.push('/');
  }

  async function checkIn() {
    if (!token.value) return { success: false, message: '请先登录' };
    try {
      const res = await axios.post(`${USER_API_URL}/checkin`, {}, authHeader.value);
      const { points, lastCheckIn } = res.data;
      if (user.value) {
        user.value.points = points;
        user.value.lastCheckIn = lastCheckIn;
        localStorage.setItem('user', JSON.stringify(user.value));
      }
      return { success: true, message: res.data.message };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || '签到失败' };
    }
  }

  async function fetchDailyQuiz() {
    if (!isLoggedIn.value) return;
    quizLoading.value = true;
    dailyQuiz.value = null;
    try {
      const res = await axios.get(`${QUIZ_API_URL}/daily`, authHeader.value);
      dailyQuiz.value = res.data;
    } catch (error: any) {
      console.error('获取每日一题失败:', error.response?.data?.message || error.message);
    } finally {
      quizLoading.value = false;
    }
  }

  async function submitQuiz(questionId: number, userAnswerIndex: number) {
    try {
      const res = await axios.post(`${QUIZ_API_URL}/submit`, { questionId, userAnswerIndex }, authHeader.value);
      const { correct, analysis, newPoints } = res.data;
      if (user.value && correct) {
        user.value.points = newPoints;
        localStorage.setItem('user', JSON.stringify(user.value));
      }
      if (dailyQuiz.value) {
        dailyQuiz.value.hasAnswered = true;
        dailyQuiz.value.wasCorrect = correct;
        dailyQuiz.value.question.analysis = analysis;
        const updatedQuizRes = await axios.get(`${QUIZ_API_URL}/daily`, authHeader.value);
        if (updatedQuizRes.data.hasAnswered && updatedQuizRes.data.question) {
            dailyQuiz.value.question.correct_answer = updatedQuizRes.data.question.correct_answer;
        }
      }
      return { correct, analysis };
    } catch (error: any) {
      console.error('提交答案失败:', error.response?.data?.message || error.message);
      return { correct: false, analysis: '提交答案时出错，请重试' };
    }
  }

  async function fetchTestQuestions() {
    if (!isLoggedIn.value) return;
    testLoading.value = true;
    try {
      const res = await axios.get(`${TEST_API_URL}/questions`, authHeader.value);
      testQuestions.value = res.data;
    } catch (error: any) { // 显式指定 error 类型
      console.error('获取测试题失败:', error instanceof Error ? error.message : error);
    } finally {
      testLoading.value = false;
    }
  }

  async function fetchTestResult() {
    console.log("[authStore] fetchTestResult function called."); // <-- (!!! 新日志 !!!) 确认函数被调用
    if (!isLoggedIn.value) {
       console.log("[authStore] fetchTestResult: Not logged in, exiting."); // <-- (!!! 新日志 !!!)
       return;
    }
    testLoading.value = true;
    try {
      console.log("[authStore] fetchTestResult: Sending API request..."); // <-- (!!! 新日志 !!!)
      const res = await axios.get(`${TEST_API_URL}/result`, authHeader.value);
      console.log("[authStore] API /result response received:", res.data); // <-- 旧日志
      if (res.data.hasResult && res.data.result) {
        testResult.value = res.data.result;
        console.log("[authStore] Fetched testResult successfully:", testResult.value); // <-- 旧日志
        localStorage.setItem('testResult', JSON.stringify(testResult.value));
        fetchTestStats(); // 获取结果后获取统计
      } else {
        console.log("[authStore] No existing test result found for user."); // <-- 旧日志
        testResult.value = null;
        localStorage.removeItem('testResult');
      }
    } catch (error) {
      // (!!! 关键修改 !!!) 明确打印 catch 到的错误
      console.error('[authStore] Error during fetchTestResult API call:', error);
      // 根据错误类型，可以提供更具体的反馈
      if (axios.isAxiosError(error) && error.response?.status === 401) {
         console.error("  -> Unauthorized (401). Token might be invalid or expired.");
         // 可以考虑在这里触发 logout
      } else if (axios.isAxiosError(error)) {
         console.error("  -> Axios error:", error.message, error.response?.data);
      } else {
         console.error("  -> Non-Axios error:", error);
      }
      // 出错时不清空本地结果，允许离线查看上次结果？或者清空？暂时不清空
      // testResult.value = null;
      // localStorage.removeItem('testResult');
    } finally {
      testLoading.value = false;
      console.log("[authStore] Finished fetchTestResult."); // <-- 旧日志
    }
  }

  async function submitTest(answers: number[]) {
    if (!isLoggedIn.value) return false;
    testLoading.value = true;
    try {
      const res = await axios.post(`${TEST_API_URL}/submit`, { answers }, authHeader.value);
      console.log("[authStore] API /submit response:", res.data); // <-- 调试日志
      if (res.data.result) { // 确保 result 存在
        testResult.value = res.data.result;
        console.log("[authStore] Submitted testResult:", testResult.value); // <-- 调试日志
        localStorage.setItem('testResult', JSON.stringify(testResult.value));
        fetchTestStats();
        return true;
      } else {
         console.error("[authStore] Submit response missing result object");
         return false;
      }
    } catch (error: any) {
      console.error('提交测试失败:', error.response?.data?.message || error.message);
      return false;
    } finally {
      testLoading.value = false;
    }
  }

  async function resetTestResult() {
     if (!isLoggedIn.value) return;
     testLoading.value = true;
     try {
       await axios.delete(`${TEST_API_URL}/result`, authHeader.value);
       testResult.value = null;
       localStorage.removeItem('testResult'); // 清除 localStorage
       testQuestions.value = [];
       // 重置后立即获取新题目
       await fetchTestQuestions();
     } catch (error: any) {
       console.error('重置测试失败:', error.response?.data?.message || error.message);
     } finally {
       testLoading.value = false;
     }
  }

  async function fetchTestStats() {
     try {
       const res = await axios.get(`${TEST_API_URL}/stats`);
       console.log("[authStore] API /stats response:", res.data); // <-- 调试日志
       testStats.value = res.data.stats;
       testStatsTotal.value = res.data.total;
       console.log("[authStore] Fetched stats:", testStats.value, "Total:", testStatsTotal.value); // <-- 调试日志
     } catch (error) {
       console.error('获取测试统计失败:', error);
       testStats.value = null;
       testStatsTotal.value = 0;
     }
  }

  // --- 4. 返回所有 ---
  return {
    // 状态
    user, token, dailyQuiz, quizLoading, testQuestions, testResult, testLoading, testStats, testStatsTotal,
    // Getters
    isLoggedIn, authHeader,
    // Actions
    register, login, logout, checkIn, fetchDailyQuiz, submitQuiz,
    fetchTestQuestions, fetchTestResult, submitTest, resetTestResult, fetchTestStats
  }
})