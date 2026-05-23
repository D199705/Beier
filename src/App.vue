<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useNavigationStore } from './stores/navigation.js'
import ImageViewer from './components/ImageViewer.vue'

const nav = useNavigationStore()

function prevSibling() {
  const sibs = nav.currentPage?.siblings || []
  const idx = nav.siblingIndex
  if (idx > 0) nav.goToSibling(sibs[idx - 1])
}
function nextSibling() {
  const sibs = nav.currentPage?.siblings || []
  const idx = nav.siblingIndex
  if (idx < sibs.length - 1) nav.goToSibling(sibs[idx + 1])
}

function onKeyDown(e) {
  if (nav.isAnimating) return
  if (e.key === 'ArrowLeft') { e.preventDefault(); prevSibling() }
  else if (e.key === 'ArrowRight') { e.preventDefault(); nextSibling() }
  else if (e.key === 'Escape' || e.key === 'Backspace') { e.preventDefault(); nav.goBack() }
}
onMounted(() => document.addEventListener('keydown', onKeyDown))
onUnmounted(() => document.removeEventListener('keydown', onKeyDown))
</script>

<template>
  <div class="app">
    <!-- 图片层 -->
    <ImageViewer />

    <!-- 顶部返回按钮 -->
    <button class="back-btn" :class="{ 'back-btn--hidden': !nav.canGoBack }"
      @click="nav.goBack()" :disabled="nav.isAnimating">‹ 返回</button>

  </div>
</template>

<style scoped>
.app {
  width: 100vw; height: 100vh; height: 100dvh;
  overflow: hidden; position: relative;
  background: #f5f1e6;
  user-select: none; -webkit-user-select: none;
}

/* ===== 返回按钮 ===== */
.back-btn {
  position: fixed; top: 12px; left: 12px; z-index: 1000;
  padding: 5px 12px; border: none; border-radius: 14px;
  background: rgba(140, 120, 90, 0.15);
  color: #000;
  font-size: 13px; cursor: pointer;
  transition: opacity 0.3s, background 0.2s;
}
.back-btn:hover { background: rgba(140, 120, 90, 0.25); }
.back-btn--hidden { opacity: 0; pointer-events: none; }
</style>
