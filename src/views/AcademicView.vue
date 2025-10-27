<script setup lang="ts">
// 示例文章数据 (将来可以从后端获取)
const articles = [
  {
    id: 1,
    title: '《论语》中的“仁”与柏拉图《理想国》中的“正义”比较初探',
    author: '研究团队 A',
    date: '2025年10月15日',
    abstract: '本文旨在探讨儒家核心概念“仁”与古希腊哲学中“正义”观念的共通之处与本质差异，分析两者在个体道德修养和社会秩序构建中的不同路径...',
    image: 'https://placehold.co/600x400/a7c5bd/333?text=论语+vs+理想国' // 替换为真实图片
  },
  {
    id: 2,
    title: '老子的“无为”思想与斯多葛派“顺应自然”哲学的对话',
    author: '研究团队 B',
    date: '2025年9月28日',
    abstract: '道家的“无为”并非无所作为，而是顺应事物发展的自然规律。本文将其与古希腊晚期斯多葛学派强调理性、接受命运、顺应自然的思想进行对比...',
    image: 'https://placehold.co/600x400/d3b8ae/333?text=道家+vs+斯多葛' // 替换为真实图片
  },
  {
    id: 3,
    title: '从《诗经》与荷马史诗看中西早期诗歌的不同焦点',
    author: '研究团队 C',
    date: '2025年8月10日',
    abstract: '《诗经》大量描绘了周朝的农耕生活、男女情爱与社会风貌，展现现实主义色彩；而荷马史诗则聚焦于英雄的战争、荣誉与命运悲剧...',
    image: 'https://placehold.co/600x400/b4a7d6/333?text=诗经+vs+史诗' // 替换为真实图片
  }
];
</script>

<template>
  <div class="page-container academic-view">
    <h1 class="page-title">学术成果</h1>
    <p class="page-subtitle">探索我们在中西古典文化比较研究领域的最新发现与思考。</p>

    <div class="article-list">
      <!-- 使用 v-for 遍历文章数组 -->
      <div v-for="article in articles" :key="article.id" class="article-card">
        <img :src="article.image" :alt="article.title + ' 配图'" class="article-image" onerror="this.src='https://placehold.co/600x400/eee/aaa?text=Image+Error'">
        <div class="article-content">
          <h2 class="article-title">{{ article.title }}</h2>
          <p class="article-meta">作者：{{ article.author }} | 发布日期：{{ article.date }}</p>
          <p class="article-abstract">{{ article.abstract }}</p>
          <button class="read-more-btn" disabled>阅读全文 (暂不可用)</button>
          <!-- 将来可以替换为 <RouterLink :to="'/academic/' + article.id">阅读全文</RouterLink> -->
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.academic-view {
  max-width: 900px; /* 限制内容宽度 */
  margin: 0 auto;
}

.page-subtitle {
  text-align: center;
  color: #555;
  margin-bottom: 40px;
  font-size: 1.1em;
}

.article-list {
  display: grid;
  gap: 40px; /* 卡片间距 */
}

.article-card {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  overflow: hidden; /* 隐藏图片溢出 */
  display: flex; /* 让图片和内容左右排列 */
  flex-direction: column; /* 手机上图片在上 */
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.article-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}

.article-image {
  width: 100%;
  height: 250px; /* 固定图片高度 */
  object-fit: cover; /* 保持图片比例并裁剪 */
}

.article-content {
  padding: 25px 30px;
}

.article-title {
  font-size: 1.6em;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 10px 0;
  line-height: 1.3;
}

.article-meta {
  font-size: 0.9em;
  color: #7f8c8d;
  margin-bottom: 15px;
}

.article-abstract {
  font-size: 1em;
  line-height: 1.7;
  color: #34495e;
  /* 最多显示 3 行 */
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 20px;
}

.read-more-btn {
  padding: 10px 20px;
  font-size: 0.95em;
  font-weight: 500;
  color: #fff;
  background-color: #007bff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
.read-more-btn:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}
.read-more-btn:not(:disabled):hover {
  background-color: #0056b3;
}

/* 响应式：在中等屏幕上恢复左右布局 */
@media (min-width: 768px) {
  .article-card {
    flex-direction: row; /* 恢复左右布局 */
  }
  .article-image {
    width: 300px; /* 左侧图片宽度 */
    height: auto; /* 高度自适应 */
    max-height: 250px; /* 限制最大高度 */
    flex-shrink: 0;
  }
}
</style>

