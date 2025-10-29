<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { computed } from 'vue'

const authStore = useAuthStore()

// --- 每日哲思/名言 ---
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
  // 选择了更明确的亚里士多德名言
  { text: "幸福是灵魂的一种活动，这活动是依照完美的德行进行的。", author: "亚里士多德" }
]
// 简单地根据今天的日期选择一句名言
const todayQuote = computed(() => {
  const dayOfMonth = new Date().getDate();
  // 确保索引在有效范围内
  const index = (dayOfMonth - 1) % quotes.length; // 日期从1开始，索引从0开始
  return quotes[index >= 0 ? index : 0];
})

// --- (!!! 推荐阅读数据已添加 !!!) ---
const recommendedBook = {
  title: '《理想国》(The Republic)',
  author: '柏拉图 (Plato)',
  description: '西方哲学史上最具影响力的作品之一，探讨了正义、理想国家、哲学王等核心议题。',
  // 使用 new URL 来解析图片路径 (相对于当前 HomeView.vue 文件)
  // 假设 HomeView.vue 在 src/views/ 下，图片在 src/assets/images/ 下
  coverImage: new URL('../assets/images/lixiangguo.png', import.meta.url).href,
  link: '#' // 暂时用 #
}
</script>

<template>
  <div class="home-view">

    <section class="hero-section">
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

<section class="daily-quote-section">
      <div class="quote-content">
        <p class="quote-text">“{{ todayQuote?.text }}”</p>
        <p class="quote-author">— {{ todayQuote?.author }}</p>
      </div>
    </section>

    <section class="features-section">
       <div class="features-grid">
         <RouterLink to="/interactive" class="feature-card"><h3>每日互动</h3><p>参与每日签到、古典文化答题，赢取积分，探索知识的乐趣。</p><span class="card-link">开始任务 →</span></RouterLink>
         <RouterLink to="/academic" class="feature-card"><h3>学术成果</h3><p>浏览我们的团队在《论语》与《会饮篇》等议题上的最新研究论文。</p><span class="card-link">阅读论文 →</span></RouterLink>
         <RouterLink to="/products" class="feature-card"><h3>文创展示</h3><p>使用你在互动中获得的积分，兑换独家设计的文化创意产品。</p><span class="card-link">浏览文创 →</span></RouterLink>
         <RouterLink to="/about" class="feature-card"><h3>关于我们</h3><p>了解我们团队的背景、使命，以及我们对古典文化比较的热情。</p><span class="card-link">了解团队 →</span></RouterLink>
       </div>
    </section>

    <section class="recommendation-section">
      <div class="recommendation-content">
        <h2 class="section-title">推荐阅读</h2>
        <div class="recommendation-item">
          <img :src="recommendedBook.coverImage" :alt="recommendedBook.title + '封面'" class="recommendation-cover" onerror="this.src='https://placehold.co/150x200/eee/aaa?text=Error'">
          <div class="recommendation-details">
            <h3>{{ recommendedBook.title }}</h3>
            <p>作者：{{ recommendedBook.author }}</p>
            <p>简介：{{ recommendedBook.description }}</p>
            <a :href="recommendedBook.link" class="recommendation-link disabled-link">[外部链接暂不可用]</a>
            </div>
        </div>
      </div>
    </section>

    <section class="cta-section">
       <div class="cta-content">
         <h2>你是儒道圣贤，还是希腊哲人？</h2>
         <p>这不仅仅是一个测试。通过 12 个深度情景选择，<br />发现你内心深处的文化属性与思维模式。</p>
         <RouterLink to="/culture-test" class="cta-button">立即开始测试</RouterLink>
       </div>
    </section>

    <section class="theme-section enhanced">
      <h2 class="section-title">主题对望：东与西的交响</h2>
      
      <div class="comparison-pair">
        <h3 class="comparison-title">艺术审美 Artistic Aesthetics</h3>
        <div class="comparison-grid">
          <div class="comparison-card east">
            <img src="https://placehold.co/400x300/e0dccc/555?text=中国山水画" alt="中国山水画意象" class="comparison-image" onerror="this.src='https://placehold.co/400x300/eee/aaa?text=Error'">
            <h4>东方的“神韵” (Spirit/Resonance)</h4>
            <p>强调“气韵生动”，通过“留白”和写意笔触捕捉内在精神与意境，追求“可意会不可言传”的境界。</p>
          </div>
          <div class="comparison-card west">
            <img src="https://placehold.co/400x300/d0e0e3/555?text=希腊雕塑" alt="古希腊雕塑" class="comparison-image" onerror="this.src='https://placehold.co/400x300/eee/aaa?text=Error'">
            <h4>西方的“形式” (Form/Ratio)</h4>
            <p>崇尚“模仿自然”，通过精确的比例（如黄金分割）和几何形态展现理想的人体与秩序之美，追求理性的和谐。</p>
          </div>
        </div>
      </div>

      <div class="comparison-pair">
        <h3 class="comparison-title">哲学思想 Philosophy</h3>
        <div class="comparison-grid">
          <div class="comparison-card east">
             <img src="https://placehold.co/400x300/fcf8e3/555?text=道德经+论语" alt="道德经与论语" class="comparison-image" onerror="this.src='https://placehold.co/400x300/eee/aaa?text=Error'">
            <h4>东方的“道”与“仁” (Dao / Ren)</h4>
            <p>探索宇宙万物的本源法则（道）与人伦社会的道德核心（仁），强调天人合一、内圣外王、和谐共生。</p>
          </div>
          <div class="comparison-card west">
            <img src="https://placehold.co/400x300/e1eafb/555?text=柏拉图+亚里士多德" alt="柏拉图与亚里士多德" class="comparison-image" onerror="this.src='https://placehold.co/400x300/eee/aaa?text=Error'">
            <h4>西方的“逻各斯”与“美德” (Logos / Arete)</h4>
            <p>运用理性（逻各斯）探求世界的逻辑秩序与不变真理，追求个体灵魂的卓越（美德），强调认识你自己。</p>
          </div>
        </div>
      </div>

      <div class="comparison-pair">
        <h3 class="comparison-title">文学焦点 Literary Focus</h3>
        <div class="comparison-grid">
          <div class="comparison-card east">
            <img src="https://placehold.co/400x300/f4cccc/555?text=诗经" alt="诗经中的生活场景" class="comparison-image" onerror="this.src='https://placehold.co/400x300/eee/aaa?text=Error'">
            <h4>东方：《诗经》的生活百态</h4>
            <p>中国最早的诗歌总集，大量诗篇源于民间，描绘农耕、战争、爱情、婚丧等社会生活，充满现实主义关怀。</p>
          </div>
          <div class="comparison-card west">
             <img src="https://placehold.co/400x300/d9d2e9/555?text=荷马史诗" alt="荷马史诗中的英雄" class="comparison-image" onerror="this.src='https://placehold.co/400x300/eee/aaa?text=Error'">
            <h4>西方：荷马史诗的英雄悲歌</h4>
            <p>古希腊的英雄史诗，聚焦于特洛伊战争中的英雄人物、荣誉、命运以及人与神的关系，奠定西方文学叙事传统。</p>
          </div>
        </div>
      </div>

    </section>

  </div>
</template>

<style scoped>
/* (!!! 移除并替换旧的 .theme-section 样式 !!!) */
/* (其他部分的样式保持不变) */
.home-view { width: 100%; }
.hero-section { display: flex; align-items: center; justify-content: center; text-align: center; padding: 100px 20px; background-color: #f8f9fa; }
.hero-content { max-width: 700px; }
.hero-title { font-size: 3em; font-weight: 700; color: #2c3e50; margin: 0 0 20px 0; }
.hero-subtitle { font-size: 1.2em; color: #555; line-height: 1.6; margin-bottom: 30px; }
.hero-button { display: inline-block; padding: 12px 30px; margin: 5px 10px; font-size: 1.1em; font-weight: 600; border-radius: 8px; text-decoration: none; transition: all 0.3s ease; }
.hero-button.primary { background-color: #007bff; color: white; }
.hero-button.primary:hover { background-color: #0056b3; transform: translateY(-3px); box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
.hero-button.secondary { background-color: transparent; color: #007bff; border: 2px solid #007bff; }
.hero-button.secondary:hover { background-color: #007bff; color: white; }
.daily-quote-section { background-color: #ffffff; padding: 40px 20px; border-bottom: 1px solid #eee; }
.quote-content { max-width: 800px; margin: 0 auto; text-align: center; }
.quote-text { font-size: 1.5em; font-style: italic; color: #34495e; margin-bottom: 10px; }
.quote-author { font-size: 1em; color: #7f8c8d; }
.features-section { max-width: 1200px; margin: 60px auto; padding: 0 20px; }
.features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 30px; }
.feature-card { display: block; background-color: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05); transition: all 0.3s ease; text-decoration: none; color: inherit; }
.feature-card:hover { transform: translateY(-5px); box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1); }
.feature-card h3 { font-size: 1.5em; color: #2c3e50; margin: 0 0 15px 0; }
.feature-card p { font-size: 1em; line-height: 1.6; color: #555; margin-bottom: 20px; }
.card-link { font-weight: 600; color: #007bff; }
.recommendation-section { background-color: #f8f9fa; padding: 60px 20px; }
.recommendation-content { max-width: 900px; margin: 0 auto; }
.recommendation-item { display: flex; gap: 30px; align-items: center; background-color: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05); }
.recommendation-cover { width: 150px; height: 200px; object-fit: cover; border-radius: 8px; flex-shrink: 0; }
.recommendation-details h3 { margin: 0 0 10px 0; font-size: 1.6em; color: #2c3e50; }
.recommendation-details p { font-size: 1em; line-height: 1.6; color: #555; margin: 5px 0; }
.recommendation-link { display: inline-block; margin-top: 15px; font-weight: 600; color: #007bff; text-decoration: none; }
.disabled-link { color: #aaa; cursor: not-allowed; pointer-events: none; }
.cta-section { background-color: #2c3e50; color: #ffffff; padding: 60px 20px; text-align: center; margin: 60px 0; }
.cta-content { max-width: 700px; margin: 0 auto; }
.cta-content h2 { font-size: 2.5em; font-weight: 600; margin: 0 0 20px 0; }
.cta-content p { font-size: 1.1em; line-height: 1.7; color: #f0f0f0; margin-bottom: 30px; }
.cta-button { display: inline-block; padding: 12px 35px; font-size: 1.15em; font-weight: 600; color: #2c3e50; background-color: #ffffff; border: none; border-radius: 8px; text-decoration: none; transition: all 0.3s ease; }
.cta-button:hover { background-color: #f0f0f0; transform: translateY(-3px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }

/* (!!! 新的 主题对望 样式 !!!) */
.theme-section.enhanced {
  max-width: 1200px;
  margin: 80px auto; /* 增加上下间距 */
  padding: 0 20px;
}
.section-title {
  text-align: center;
  font-size: 2.5em; /* 标题加大 */
  color: #2c3e50;
  margin-bottom: 60px; /* 标题和内容间距加大 */
  font-weight: 600;
}
.comparison-pair {
  margin-bottom: 60px; /* 每对比较之间的间距 */
}
.comparison-title {
  text-align: center;
  font-size: 1.8em;
  color: #34495e;
  margin-bottom: 30px;
  font-weight: 500;
  border-bottom: 2px solid #e0e0e0; /* 标题下划线 */
  padding-bottom: 10px;
}
.comparison-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px; /* 东西方卡片间距 */
  align-items: start; /* 顶部对齐 */
}
.comparison-card {
  background-color: #ffffff;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.06);
  border: 1px solid #eaeaea;
}
.comparison-card.east {
  border-left: 5px solid #c89b4f; /* 东方卡片左侧金色边框 */
}
.comparison-card.west {
  border-left: 5px solid #5b6ca8; /* 西方卡片左侧蓝色边框 */
}
.comparison-image {
  width: 100%;
  height: 200px; /* 固定图片高度 */
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 20px;
  background-color: #f0f0f0;
}
.comparison-card h4 {
  font-size: 1.3em;
  color: #333;
  margin: 0 0 10px 0;
  font-weight: 600;
}
.comparison-card p {
  font-size: 1em;
  line-height: 1.7;
  color: #555;
  margin: 0;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .hero-title { font-size: 2.5em; }
  .recommendation-item { flex-direction: column; text-align: center; }
  .recommendation-cover { margin-bottom: 20px; }
  .comparison-grid { grid-template-columns: 1fr; } /* 手机上变为单列 */
}
</style>
