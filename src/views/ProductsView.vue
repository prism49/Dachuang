<template>
  <div class="page-container">
    <h2>文创展示</h2>
    <p class="intro">我们将中西古典文化的元素融入现代设计，创造出独一无二的文创产品。</p>
    <div class="product-gallery">
      <!-- 示例产品卡片 -->
      <div class="product-card">
        <div class="product-image-placeholder">[产品图片]</div>
        <h3>产品名称A</h3>
        <p>产品简介...</p>
      </div>
      <div class="product-card">
        <div class="product-image-placeholder">[产品图片]</div>
        <h3>产品名称B</h3>
        <p>产品简介...</p>
      </div>
      <div class="product-card">
        <div class="product-image-placeholder">[产品图片]</div>
        <h3>产品名称C</h3>
        <p>产品简介...</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 40px;
}
.product-card {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  text-align: center;
}
.product-image-placeholder {
  height: 200px;
  background-color: #e9ecef;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #6c757d;
}
.product-card h3, .product-card p {
  padding: 0 15px 15px;
}
</style>
