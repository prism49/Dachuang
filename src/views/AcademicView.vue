<template>
  <div class="page-container">
    <h2>学术成果</h2>
    <p class="intro">
      在这里，我们汇集了团队在中西古典文化比较研究领域的核心研究成果。这些文章与论文不仅是我们学术探索的结晶，也是与广大文化爱好者交流思想的桥梁。
    </p>
    <div class="article-list">
      <!-- 这是一个示例文章卡片，你可以根据这个结构用 v-for 循环来展示你的真实文章列表 -->
      <div class="article-card">
        <h3>文章标题一：论中西神话叙事的差异</h3>
        <p>摘要：本文旨在探讨中国古代神话与古希腊神话在叙事结构、英雄形象塑造以及世界观构建等方面的显著差异...</p>
        <a href="#">阅读全文 &rarr;</a>
      </div>
      <div class="article-card">
        <h3>文章标题二：...</h3>
        <p>摘要：...</p>
        <a href="#">阅读全文 &rarr;</a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.article-list {
  margin-top: 40px;
}
.article-card {
  background-color: #fff;
  border: 1px solid #eee;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 8px;
  transition: box-shadow 0.3s;
}
.article-card:hover {
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}
.article-card h3 {
  margin-top: 0;
}
</style>
