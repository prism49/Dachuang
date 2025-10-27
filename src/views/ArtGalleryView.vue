<script setup lang="ts">
// 示例对比数据 (将来可以扩展或从后端获取)
const comparisonPairs = [
  {
    category: '绘画 Painting',
    east: {
      title: '东方 · 写意山水',
      description: '强调“气韵生动”，通过“留白”和简练笔触捕捉山川自然的内在精神与意境，追求“象外之象，景外之景”。',
      image: new URL('../assets/images/shanshui.png', import.meta.url).href
    },
    west: {
      title: '西方 · 写实风景',
      description: '强调“模仿自然”，运用透视法、明暗对比和丰富的色彩，精确再现自然景物的形态、光影和空间感。',
      image: new URL('../assets/images/xieshi.png', import.meta.url).href
    }
  },
  {
    category: '雕塑 Sculpture',
    east: {
      title: '东方 · 佛像造像',
      description: '多服务于宗教信仰，造型或慈悲庄严，或飘逸宁静，注重表达人物的内在精神境界与象征意义，而非完全写实。',
      image: 'https://placehold.co/600x450/fcf8e3/555?text=佛像'
    },
    west: {
      title: '西方 · 人体雕塑',
      description: '崇尚理想化的人体美，通过精确的解剖结构、肌肉线条和“对偶倒列”姿态，展现人体的力量、动态与和谐比例。',
      image: 'https://placehold.co/600x450/e1eafb/555?text=希腊雕像'
    }
  },
  {
    category: '建筑 Architecture',
    east: {
      title: '东方 · 木构庭院',
      description: '以木结构为主，注重与自然的融合（如园林），讲究空间的序列、层次和意境营造，体现“天人合一”思想。',
      image: 'https://placehold.co/600x450/f4cccc/555?text=中式庭院'
    },
    west: {
      title: '西方 · 石构殿堂',
      description: '以石材结构为主（如神庙、教堂），追求宏伟、对称、几何化的形式，通过柱式、拱券等展现理性的秩序与力量感。',
      image: 'https://placehold.co/600x450/d9d2e9/555?text=希腊神庙'
    }
  }
];
</script>

<template>
  <div class="page-container art-gallery-view">
    <h1 class="page-title">艺文走廊</h1>
    <p class="page-subtitle">并置东西，对照观看，在视觉的交响中感受古典文明的异同之妙。</p>

    <!-- 遍历对比组 -->
    <div v-for="(pair, index) in comparisonPairs" :key="index" class="comparison-section">
      <h2 class="category-title">{{ pair.category }}</h2>
      <div class="comparison-grid">
        <!-- 东方卡片 -->
        <div class="comparison-card east">
          <img :src="pair.east.image" alt="东方艺术示例" class="comparison-image" onerror="this.src='https://placehold.co/600x450/eee/aaa?text=Image+Error'">
          <div class="card-content">
            <h3>{{ pair.east.title }}</h3>
            <p>{{ pair.east.description }}</p>
          </div>
        </div>
        <!-- 西方卡片 -->
        <div class="comparison-card west">
          <img :src="pair.west.image" alt="西方艺术示例" class="comparison-image" onerror="this.src='https://placehold.co/600x450/eee/aaa?text=Image+Error'">
          <div class="card-content">
            <h3>{{ pair.west.title }}</h3>
            <p>{{ pair.west.description }}</p>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.art-gallery-view {
  max-width: 1200px; /* 页面最大宽度 */
  margin: 0 auto;
}

.page-subtitle {
  text-align: center;
  color: #555;
  margin-bottom: 50px; /* 增加与下方内容的间距 */
  font-size: 1.15em;
  line-height: 1.6;
}

.comparison-section {
  margin-bottom: 60px; /* 每组对比之间的间距 */
}

.category-title {
  text-align: center;
  font-size: 2em;
  color: #34495e;
  margin-bottom: 30px;
  font-weight: 500;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 10px;
}

.comparison-grid {
  display: grid;
  grid-template-columns: 1fr 1fr; /* 两列布局 */
  gap: 30px; /* 卡片间距 */
  align-items: stretch; /* 让卡片等高 */
}

.comparison-card {
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px H (和谐/人伦)15px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column; /* 图片在上文字在下 */
  border: 1px solid #eaeaea;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.comparison-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}
.comparison-card.east {
  border-top: 5px solid #c89b4f; /* 东方卡片顶部金色边框 */
}
.comparison-card.west {
  border-top: 5px solid #5b6ca8; /* 西方卡片顶部蓝色边框 */
}

.comparison-image {
  width: 100%;
  height: 300px; /* 统一图片高度 */
  object-fit: cover;
  background-color: #f0f0f0;
}

.card-content {
  padding: 20px 25px;
  flex-grow: 1; /* 让内容区域占满 */
  display: flex;
  flex-direction: column;
}

.card-content h3 {
  font-size: 1.4em;
  font-weight: 600;
  color: #333;
  margin: 0 0 10px 0;
}
.card-content p {
  font-size: 0.95em;
  line-height: 1.7;
  color: #555;
  margin: 0;
  flex-grow: 1; /* 占据剩余空间 */
}

/* 响应式布局：手机屏幕 */
@media (max-width: 768px) {
  .comparison-grid {
    grid-template-columns: 1fr; /* 变为单列 */
  }
  .comparison-image {
    height: 250px; /* 手机上图片高度减小 */
  }
}
</style>
