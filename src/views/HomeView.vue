<template>
  <div class="home-container">
    <div class="hero-section">
      <h1>融贯东西，鉴古知今</h1>
      <p>这里是你的网站副标题或一句引言。</p>
      <!-- 日后你可以将你的IP形象放在这里 -->
    </div>
  </div>
</template>

<style scoped>
.home-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 80px); /* 视口高度减去导航栏高度 */
  
  /* 这里就是为你预留的背景区域
    你可以修改下面的 background-color 来改变颜色
    日后有了IP形象，可以在这里添加 background-image 
    例如: background-image: url('@/assets/your-ip-character.png');
  */
  background-color: #f0f8ff; /* 这是一个淡蓝色 (AliceBlue)，你可以换成任何你喜欢的浅色 */
}

.hero-section {
  text-align: center;
  color: #333;
}

.hero-section h1 {
  font-size: 3rem;
  margin-bottom: 20px;
}

.hero-section p {
  font-size: 1.2rem;
  color: #666;
}
</style>
