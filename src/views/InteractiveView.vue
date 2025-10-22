<template>
  <div class="page-container">
    <h2>互动体验</h2>
    <p class="intro">通过生动的视频和有趣的问答，带你沉浸式体验中西文化的魅力。</p>

    <!-- 视频展示区 -->
    <section class="interactive-section">
      <h3>视频鉴赏</h3>
      <div class="video-gallery">
        <!-- 示例视频占位符 -->
        <div class="video-placeholder">[视频播放器位置 1]</div>
        <div class="video-placeholder">[视频播放器位置 2]</div>
        <div class="video-placeholder">[视频播放器位置 3]</div>
      </div>
    </section>

    <!-- 互动环节区 -->
    <section class="interactive-section">
      <h3>趣味问答</h3>
      <div class="quiz-container">
        <p class="question">问题一：以下哪位是古希腊神话中的智慧女神？</p>
        <div class="options">
          <button>A. 赫拉</button>
          <button>B. 雅典娜</button>
          <button>C. 阿佛洛狄忒</button>
        </div>
        <!-- 
          提示：
          完整的答题、计分和讨论区功能需要后端数据库来存储数据。
          目前这只是一个前端UI的展示。
          你可以使用Pinia来管理答题状态和分数。
        -->
      </div>
    </section>

     <!-- 讨论区 -->
    <section class="interactive-section">
      <h3>文化沙龙 (讨论区)</h3>
      <div class="discussion-forum">
        <textarea placeholder="在这里发表你的看法..."></textarea>
        <button class="submit-btn">提交</button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.interactive-section {
  margin-top: 40px;
}
.video-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}
.video-placeholder {
  height: 200px;
  background-color: #e9ecef;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  color: #6c757d;
}

.quiz-container {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #eee;
}
.question {
  font-weight: bold;
}
.options button {
  margin-right: 10px;
  margin-top: 10px;
}

.discussion-forum textarea {
  width: 100%;
  min-height: 100px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-bottom: 10px;
}
.submit-btn {
  float: right;
}
</style>
