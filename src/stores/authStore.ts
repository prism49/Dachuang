// 文件路径: src/stores/authStore.ts

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import { useRouter } from 'vue-router'

// --- 1. 类型定义 ---
export interface User { id: number; username: string; points: number; lastCheckIn: string | null; }
export interface QuizQuestion { id: number; question_text: string; options: string[]; correct_answer?: number; analysis?: string; }
export interface DailyQuizResponse { hasAnswered: boolean; wasCorrect?: boolean; question: QuizQuestion; }
export interface TestQuestion { id: number; text: string; }
export interface TestResult { h_score: number; r_score: number; result_type: string; title: string; analysis: string; }
export interface TestStats { [key: string]: number; }
export interface Activity { id: string | number; type: string; date: string; points: string; correct?: boolean; question?: string; timestamp: number; }

const API_BASE_URL = 'https://dachuang-backend.onrender.com' 

const AUTH_API_URL = `${API_BASE_URL}/api/auth`
const USER_API_URL = `${API_BASE_URL}/api/user`
const QUIZ_API_URL = `${API_BASE_URL}/api/quiz`
const TEST_API_URL = `${API_BASE_URL}/api/test`

// --- 3. Store 定义 ---
export const useAuthStore = defineStore('auth', () => {
  // --- State (状态) ---
  const user = ref<User | null>(JSON.parse(localStorage.getItem('user') || 'null'))
  const token = ref<string | null>(localStorage.getItem('token'))
  const router = useRouter()

  const dailyQuiz = ref<DailyQuizResponse | null>(null)
  const quizLoading = ref(false)

  const testQuestions = ref<TestQuestion[]>([])
  const initialTestResult = localStorage.getItem('testResult');
  const testResult = ref<TestResult | null>(initialTestResult ? JSON.parse(initialTestResult) : null)
  const testLoading = ref(false)

  const testStats = ref<TestStats | null>(null)
  const testStatsTotal = ref<number>(0)

  const recentActivities = ref<Activity[]>([])
  const activitiesLoading = ref(false)

  // (!!! 新增状态 !!!)
  const monthlyCheckIns = ref<string[]>([]) // 存储 ["YYYY-MM-DD", ...]
  const checkInsLoading = ref(false)


  // --- Getters ---
  const isLoggedIn = computed(() => !!token.value && !!user.value)
  const authHeader = computed(() => ({ headers: { Authorization: `Bearer ${token.value}` } }))

  // --- Actions ---

  async function register(username: string, password: string): Promise<boolean> {
    try {
      await axios.post(`${AUTH_API_URL}/register`, { username, password });
      return true;
    } catch (error: any) {
      console.error('注册失败:', error.response?.data?.message || error.message);
      return false;
    }
  }

  async function login(username: string, password: string): Promise<boolean> {
    try {
      const res = await axios.post<{ token: string; user: User }>(`${AUTH_API_URL}/login`, { username, password });
      const { token: newToken, user: userData } = res.data;
      token.value = newToken;
      user.value = userData;
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      // 登录后获取结果和活动记录 (并行)
      await Promise.all([
          fetchTestResult(),
          fetchRecentActivities()
      ]);
      return true;
    } catch (error: any) {
      console.error('登录失败:', error.response?.data?.message || error.message);
      return false;
    }
  }

  function logout(): void {
    token.value = null;
    user.value = null;
    dailyQuiz.value = null;
    testQuestions.value = [];
    testResult.value = null;
    testStats.value = null;
    testStatsTotal.value = 0;
    recentActivities.value = [];
    activitiesLoading.value = false;
    monthlyCheckIns.value = []; // <-- 清空签到记录
    checkInsLoading.value = false; // <-- 清空签到记录
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('testResult');
    if (router) { router.push('/'); }
    else { console.warn("Router instance not available during logout"); }
  }

  async function checkIn(): Promise<{ success: boolean; message: string }> {
    if (!token.value) return { success: false, message: '请先登录' };
    try {
      const res = await axios.post<{ points: number; lastCheckIn: string; message: string }>(`${USER_API_URL}/checkin`, {}, authHeader.value);
      const { points, lastCheckIn } = res.data; // lastCheckIn 是 todayString
      if (user.value) {
        user.value.points = points;
        user.value.lastCheckIn = lastCheckIn;
        localStorage.setItem('user', JSON.stringify(user.value));
      }
      
      // (!!! 更新 !!!) 签到成功后，刷新活动记录 和 当月签到记录
      const today = new Date();
      await Promise.all([
          fetchRecentActivities(),
          fetchMonthlyCheckIns(today.getFullYear(), today.getMonth() + 1) // 月份是 1-12
      ]);
      
      return { success: true, message: res.data.message };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || '签到失败' };
    }
  }

  async function fetchDailyQuiz(): Promise<void> {
    if (!isLoggedIn.value) return;
    quizLoading.value = true;
    dailyQuiz.value = null;
    try {
      const res = await axios.get<DailyQuizResponse>(`${QUIZ_API_URL}/daily`, authHeader.value);
      dailyQuiz.value = res.data;
    } catch (error: any) {
      console.error('获取每日一题失败:', error.response?.data?.message || error.message);
    } finally {
      quizLoading.value = false;
    }
  }

  async function submitQuiz(questionId: number, userAnswerIndex: number): Promise<{ correct: boolean; analysis: string }> {
    try {
      const res = await axios.post<{ correct: boolean; analysis: string; newPoints: number }>(`${QUIZ_API_URL}/submit`, { questionId, userAnswerIndex }, authHeader.value);
      const { correct, analysis, newPoints } = res.data;
      if (user.value && correct) {
        user.value.points = newPoints;
        localStorage.setItem('user', JSON.stringify(user.value));
      }
      if (dailyQuiz.value) {
        dailyQuiz.value.hasAnswered = true;
        dailyQuiz.value.wasCorrect = correct;
        dailyQuiz.value.question.analysis = analysis;
        const updatedQuizRes = await axios.get<DailyQuizResponse>(`${QUIZ_API_URL}/daily`, authHeader.value);
        if (updatedQuizRes.data.hasAnswered && updatedQuizRes.data.question) {
            dailyQuiz.value.question.correct_answer = updatedQuizRes.data.question.correct_answer;
        }
      }
      await fetchRecentActivities(); // 答题成功后刷新
      return { correct, analysis };
    } catch (error: any) {
      console.error('提交答案失败:', error.response?.data?.message || error.message);
      return { correct: false, analysis: '提交答案时出错，请重试' };
    }
  }

  async function fetchTestQuestions(): Promise<void> {
    if (!isLoggedIn.value) return;
    testLoading.value = true;
    try {
      const res = await axios.get<TestQuestion[]>(`${TEST_API_URL}/questions`, authHeader.value);
      testQuestions.value = res.data;
    } catch (error: any) {
      console.error('获取测试题失败:', error instanceof Error ? error.message : error);
    } finally {
      testLoading.value = false;
    }
  }

  async function fetchTestResult(): Promise<void> {
    // console.log("[authStore] fetchTestResult function called.");
    if (!isLoggedIn.value) { /*console.log("[authStore] fetchTestResult: Not logged in, exiting.");*/ return; }
    testLoading.value = true;
    try {
      // console.log("[authStore] fetchTestResult: Sending API request...");
      const res = await axios.get<{ hasResult: boolean; result?: TestResult }>(`${TEST_API_URL}/result`, authHeader.value);
      // console.log("[authStore] API /result response received:", res.data);
      if (res.data.hasResult && res.data.result && typeof res.data.result.h_score === 'number') {
        const receivedResult = res.data.result;
        // console.log("[authStore] Fetched testResult successfully (structure check):", receivedResult);
        testResult.value = receivedResult;
        // console.log("[authStore] Saving to localStorage:", JSON.stringify(receivedResult));
        localStorage.setItem('testResult', JSON.stringify(receivedResult));
        await fetchTestStats(); // 使用 await 确保 stats 获取完成? (可选)
      } else {
        // console.log("[authStore] No existing or incomplete test result found for user.");
        testResult.value = null;
        localStorage.removeItem('testResult');
      }
    } catch (error) {
      console.error('[authStore] Error during fetchTestResult API call:', error);
      if (axios.isAxiosError(error) && error.response?.status === 401) { console.error("  -> Unauthorized (401). Token might be invalid or expired."); }
      else if (axios.isAxiosError(error)) { console.error("  -> Axios error:", error.message, error.response?.data); }
      else { console.error("  -> Non-Axios error:", error); }
    } finally {
      testLoading.value = false;
      // console.log("[authStore] Finished fetchTestResult.");
    }
  }

  async function submitTest(answers: number[]): Promise<boolean> {
    if (!isLoggedIn.value) return false;
    testLoading.value = true;
    try {
      const res = await axios.post<{ result: TestResult }>(`${TEST_API_URL}/submit`, { answers }, authHeader.value);
      // console.log("[authStore] API /submit response:", res.data);
      if (res.data.result && typeof res.data.result.h_score === 'number') {
        const receivedResult = res.data.result;
        // console.log("[authStore] Submitted testResult (structure check):", receivedResult);
        testResult.value = receivedResult;
        // console.log("[authStore] Saving to localStorage:", JSON.stringify(receivedResult));
        localStorage.setItem('testResult', JSON.stringify(receivedResult));
        await fetchTestStats(); // 使用 await
        return true;
      } else { console.error("[authStore] Submit response missing result object or scores"); return false; }
    } catch (error: any) { console.error('提交测试失败:', error.response?.data?.message || error.message); return false; }
    finally { testLoading.value = false; }
  }

  async function resetTestResult(): Promise<void> {
     if (!isLoggedIn.value) return;
     testLoading.value = true;
     try {
       await axios.delete(`${TEST_API_URL}/result`, authHeader.value);
       testResult.value = null;
       localStorage.removeItem('testResult');
       testQuestions.value = [];
       testStats.value = null;
       testStatsTotal.value = 0;
       await fetchTestQuestions();
     } catch (error: any) { console.error('重置测试失败:', error.response?.data?.message || error.message); }
     finally { testLoading.value = false; }
  }

  async function fetchTestStats(): Promise<void> {
     try {
       const res = await axios.get<{ stats: TestStats; total: number }>(`${TEST_API_URL}/stats`);
       // console.log("[authStore] API /stats response:", res.data);
       testStats.value = res.data.stats;
       testStatsTotal.value = res.data.total;
       // console.log("[authStore] Fetched stats:", testStats.value, "Total:", testStatsTotal.value);
     } catch (error) {
       console.error('获取测试统计失败:', error);
       testStats.value = null;
       testStatsTotal.value = 0;
     }
  }

  async function fetchRecentActivities(): Promise<void> {
      if (!isLoggedIn.value) {
          recentActivities.value = [];
          return;
      }
      activitiesLoading.value = true;
      try {
          console.log("[authStore] Fetching recent activities...");
          const res = await axios.get<Activity[]>(`${USER_API_URL}/activities`, authHeader.value);
          recentActivities.value = res.data;
          console.log("[authStore] Fetched activities:", recentActivities.value);
      } catch (error) {
          console.error("获取活动记录失败:", error);
          recentActivities.value = [];
      } finally {
          activitiesLoading.value = false;
      }
  }

  // --- (!!! 新增 Action !!!) ---
  /**
   * 获取指定月份的签到记录
   * @param year 年份 (e.g., 2025)
   * @param month 月份 (1-12)
   */
  async function fetchMonthlyCheckIns(year: number, month: number): Promise<void> {
      if (!isLoggedIn.value) {
          monthlyCheckIns.value = [];
          return;
      }
      checkInsLoading.value = true;
      console.log(`[authStore] Fetching check-ins for ${year}-${month}...`); // 日志
      try {
          const res = await axios.get<string[]>(`${USER_API_URL}/checkins/${year}/${month}`, authHeader.value);
          monthlyCheckIns.value = res.data; // 存储 ["YYYY-MM-DD", ...]
          console.log(`[authStore] Fetched ${monthlyCheckIns.value.length} check-in dates for ${year}-${month}:`, monthlyCheckIns.value); // 日志
      } catch (error) {
          console.error(`获取 ${year}-${month} 签到记录失败:`, error);
          monthlyCheckIns.value = []; // 出错时清空
      } finally {
          checkInsLoading.value = false;
      }
  }


  // --- 4. 返回所有 ---
  return {
    // 状态
    user, token, dailyQuiz, quizLoading, testQuestions, testResult, testLoading, testStats, testStatsTotal,
    recentActivities, activitiesLoading,
    monthlyCheckIns, checkInsLoading, // <-- 新增

    // Getters
    isLoggedIn, authHeader,

    // Actions
    register, login, logout, checkIn, fetchDailyQuiz, submitQuiz,
    fetchTestQuestions, fetchTestResult, submitTest, resetTestResult, fetchTestStats,
    fetchRecentActivities,
    fetchMonthlyCheckIns // <-- 新增
  }
})