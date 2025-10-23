<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { computed } from 'vue' // 引入 computed

const authStore = useAuthStore()

// --- (!!! 新增 !!!) 每日哲思/名言 ---
const quotes = [
  { text: "学而不思则罔，思而不学则殆。", author: "《论语》" },
  { text: "认识你自己。", author: "德尔菲神庙箴言 / 苏格拉底" },
  { text: "道可道，非常道；名可名，非常名。", author: "《道德经》" },
  { text: "未经审视的人生是不值得过的。", author: "苏格拉底" },
  { text: "吾生也有涯，而知也无涯。", author: "《庄子·养生主》" },
  { text: "美德即知识。", author: "苏格拉底" },
  { text: "上善若水。水善利万物而不争。", author: "《道德经》" },
  { text: "人是万物的尺度。", author: "普罗泰戈拉" },
  { text: "己所不欲，勿施于人。", author: "《论语》" },
  { text: "勇敢乃是人类美德中最重要的一种，因为这种美德保证了所有其余的美德。", author: "亚里士多德 (意译)" } // 找一个更贴切的亚里士多德名言可能更好
]
// 简单地根据今天的日期选择一句名言
const todayQuote = computed(() => {
  const dayOfMonth = new Date().getDate();
  return quotes[dayOfMonth % quotes.length]; // 用日期除以数组长度取余
})
</script>

<template>
  <div class="home-view">

    <!-- 1. 英雄区 (首屏) -->
    <section class="hero-section">
       <!-- ... (代码不变) ... -->
       <div class="hero-content">
         <template v-if="authStore.isLoggedIn && authStore.user">
           <h1 class="hero-title">欢迎回来, {{ authStore.user.username }}!</h1>
           <p class="hero-subtitle">今天的每日任务刷新了，去看看吧！</p>
           <RouterLink to="/interactive" class="hero-button primary">前往互动体验</RouterLink>
         </template>
         <template v-else>
           <h1 class="hero-title">跨越时空：探索中西古典智慧</h1>
           <p class="hero-subtitle">加入我们，通过每日签到、趣味答题和深度测试，开启你的智慧之旅。</p>
           <RouterLink to="/register" class="hero-button primary">立即注册 (送 0 积分)</RouterLink>
           <RouterLink to="/login" class="hero-button secondary">已有账户？去登录</RouterLink>
         </template>
       </div>
    </section>

    <!-- (!!! 新增 !!!) 2. 每日哲思 -->
    <section class="daily-quote-section">
      <div class="quote-content">
        <p class="quote-text">“{{ todayQuote.text }}”</p>
        <p class="quote-author">— {{ todayQuote.author }}</p>
      </div>
    </section>

    <!-- 3. 核心功能网格 (原第2部分) -->
    <section class="features-section">
       <!-- ... (代码不变) ... -->
       <div class="features-grid">
         <RouterLink to="/interactive" class="feature-card"><h3>每日互动</h3><p>参与每日签到、古典文化答题，赢取积分，探索知识的乐趣。</p><span class="card-link">开始任务 →</span></RouterLink>
         <RouterLink to="/academic" class="feature-card"><h3>学术成果</h3><p>浏览我们的团队在《论语》与《会饮篇》等议题上的最新研究论文。</p><span class="card-link">阅读论文 →</span></RouterLink>
         <RouterLink to="/products" class="feature-card"><h3>文创展示</h3><p>使用你在互动中获得的积分，兑换独家设计的文化创意产品。</p><span class="card-link">浏览文创 →</span></RouterLink>
         <RouterLink to="/about" class="feature-card"><h3>关于我们</h3><p>了解我们团队的背景、使命，以及我们对古典文化比较的热情。</p><span class="card-link">了解团队 →</span></RouterLink>
       </div>
    </section>

    <!-- (!!! 新增 !!!) 4. 推荐阅读 -->
    <section class="recommendation-section">
      <div class="recommendation-content">
        <h2 class="section-title">推荐阅读</h2>
        <div class="recommendation-item">
          <img src="https://placehold.co/150x200/eee/333?text=Book+Cover" alt="书籍封面占位图" class="recommendation-cover">
          <div class="recommendation-details">
            <h3>《理想国》(The Republic)</h3>
            <p>作者：柏拉图 (Plato)</p>
            <p>简介：西方哲学史上最具影响力的作品之一，探讨了正义、理想国家、哲学王等核心议题。</p>
            <a href="#" class="recommendation-link disabled-link">[外部链接暂不可用]</a>
            <!-- 你可以链接到豆瓣读书或其他介绍页面 -->
            <!-- <RouterLink to="/academic/slug-of-plato-review" class="recommendation-link">阅读站内书评 →</RouterLink> -->
          </div>
        </div>
      </div>
    </section>

    <!-- 5. "文化测试" 专属CTA (原第3部分) -->
    <section class="cta-section">
       <!-- ... (代码不变) ... -->
       <div class="cta-content">
         <h2>你是儒道圣贤，还是希腊哲人？</h2>
         <p>这不仅仅是一个测试。通过 12 个深度情景选择，<br />发现你内心深处的文化属性与思维模式。</p>
         <RouterLink to="/culture-test" class="cta-button">立即开始测试</RouterLink>
       </div>
    </section>

    <!-- 6. 主题对望 (原第4部分) -->
    <section class="theme-section">
      <!-- ... (代码不变) ... -->
      <h2 class="section-title">主题对望：东与西</h2>
      <div class="theme-grid">
        <div class="theme-card"><h3>东方的“神韵”</h3><p>在中国古典美学中，无论是山水画的“留白”还是书法的“气韵”，都追求一种超越形态的、可意会不可言传的内在精神与意境。</p></div>
        <div class="theme-card"><h3>西方的“理性”</h3><p>在古希腊美学中，无论是雕塑的“黄金分割”还是建筑的“柱式”，都体现了对数学、几何和逻辑的极致追求，崇尚清晰、可分析的形式美。</p></div>
      </div>
    </section>

  </div>
</template>

<style scoped>
/* (!!! 新增样式 !!!) */
.home-view { width: 100%; }

/* --- 1. 英雄区 --- */
.hero-section { display: flex; align-items: center; justify-content: center; text-align: center; padding: 100px 20px; background-color: #f8f9fa; }
.hero-content { max-width: 700px; }
.hero-title { font-size: 3em; font-weight: 700; color: #2c3e50; margin: 0 0 20px 0; }
.hero-subtitle { font-size: 1.2em; color: #555; line-height: 1.6; margin-bottom: 30px; }
.hero-button { display: inline-block; padding: 12px 30px; margin: 5px 10px; font-size: 1.1em; font-weight: 600; border-radius: 8px; text-decoration: none; transition: all 0.3s ease; }
.hero-button.primary { background-color: #007bff; color: white; }
.hero-button.primary:hover { background-color: #0056b3; transform: translateY(-3px); box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
.hero-button.secondary { background-color: transparent; color: #007bff; border: 2px solid #007bff; }
.hero-button.secondary:hover { background-color: #007bff; color: white; }

/* (!!! 新增样式 !!!) --- 2. 每日哲思 --- */
.daily-quote-section {
  background-color: #ffffff; /* 白色背景 */
  padding: 40px 20px;
  border-bottom: 1px solid #eee; /* 分隔线 */
}
.quote-content {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}
.quote-text {
  font-size: 1.5em; /* 放大名言 */
  font-style: italic;
  color: #34495e; /* 深灰 */
  margin-bottom: 10px;
}
.quote-author {
  font-size: 1em;
  color: #7f8c8d; /* 灰色 */
}

/* --- 3. 核心功能网格 --- */
.features-section { max-width: 1200px; margin: 60px auto; padding: 0 20px; }
.features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 30px; }
.feature-card { display: block; background-color: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05); transition: all 0.3s ease; text-decoration: none; color: inherit; }
.feature-card:hover { transform: translateY(-5px); box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1); }
.feature-card h3 { font-size: 1.5em; color: #2c3e50; margin: 0 0 15px 0; }
.feature-card p { font-size: 1em; line-height: 1.6; color: #555; margin-bottom: 20px; }
.card-link { font-weight: 600; color: #007bff; }

/* (!!! 新增样式 !!!) --- 4. 推荐阅读 --- */
.recommendation-section {
  background-color: #f8f9fa; /* 浅灰背景 */
  padding: 60px 20px;
}
.recommendation-content {
  max-width: 900px;
  margin: 0 auto;
}
.recommendation-item {
  display: flex;
  gap: 30px; /* 图片和文字间距 */
  align-items: center; /* 垂直居中 */
  background-color: #ffffff;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}
.recommendation-cover {
  width: 150px;
  height: 200px;
  object-fit: cover; /* 保持图片比例 */
  border-radius: 8px;
  flex-shrink: 0; /* 防止图片被压缩 */
}
.recommendation-details h3 {
  margin: 0 0 10px 0;
  font-size: 1.6em;
  color: #2c3e50;
}
.recommendation-details p {
  font-size: 1em;
  line-height: 1.6;
  color: #555;
  margin: 5px 0;
}
.recommendation-link {
  display: inline-block;
  margin-top: 15px;
  font-weight: 600;
  color: #007bff;
  text-decoration: none;
}
.disabled-link {
  color: #aaa;
  cursor: not-allowed;
  pointer-events: none; /* 禁止点击 */
}


/* --- 5. CTA --- */
.cta-section { background-color: #2c3e50; color: #ffffff; padding: 60px 20px; text-align: center; margin: 60px 0; }
.cta-content { max-width: 700px; margin: 0 auto; }
.cta-content h2 { font-size: 2.5em; font-weight: 600; margin: 0 0 20px 0; }
.cta-content p { font-size: 1.1em; line-height: 1.7; color: #f0f0f0; margin-bottom: 30px; }
.cta-button { display: inline-block; padding: 12px 35px; font-size: 1.15em; font-weight: 600; color: #2c3e50; background-color: #ffffff; border: none; border-radius: 8px; text-decoration: none; transition: all 0.3s ease; }
.cta-button:hover { background-color: #f0f0f0; transform: translateY(-3px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }

/* --- 6. 主题对望 --- */
.theme-section { max-width: 1200px; margin: 60px auto; padding: 0 20px; }
.section-title { text-align: center; font-size: 2.2em; color: #2c3e50; margin-bottom: 40px; }
.theme-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
.theme-card { background-color: #f8f9fa; padding: 30px; border-radius: 12px; }
.theme-card h3 { font-size: 1.5em; color: #333; margin: 0 0 15px 0; }
.theme-card p { font-size: 1em; line-height: 1.7; color: #555; margin: 0; }

/* --- 响应式布局 --- */
@media (max-width: 768px) {
  .hero-title { font-size: 2.5em; }
  .theme-grid { grid-template-columns: 1fr; }
  .recommendation-item { flex-direction: column; text-align: center; } /* 手机上图片在上文字在下 */
  .recommendation-cover { margin-bottom: 20px; }
}
</style>

