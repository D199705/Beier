<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useNavigationStore } from '../stores/navigation.js'
import { getPage } from '../data/pages.js'
import HotspotLayer from './HotspotLayer.vue'

const nav = useNavigationStore()

const imgLoaded = ref(false)
const imgError = ref(false)
const animPhase = ref('idle') // 'idle' | 'forward-in' | 'back-out'
const leavingPage = ref(null) // 过渡期间保留离开的页面
const ripples = ref([])
let rippleId = 0

// 为特定页面生成占位渐变
function placeholderGradient(page) {
  const c = page?.color || '#4a3728'
  return {
    background: `
      radial-gradient(ellipse at 20% 50%, ${lighten(c, 30)} 0%, transparent 50%),
      radial-gradient(ellipse at 80% 20%, ${lighten(c, 15)} 0%, transparent 40%),
      radial-gradient(ellipse at 60% 80%, ${darken(c, 10)} 0%, transparent 50%),
      linear-gradient(160deg, ${c} 0%, ${darken(c, 20)} 100%)
    `,
  }
}

function lighten(hex, amount) { return adjust(hex, amount) }
function darken(hex, amount) { return adjust(hex, -amount) }
function adjust(hex, amount) {
  const num = parseInt(hex.replace('#',''), 16)
  const r = Math.max(0,Math.min(255,((num>>16)&0xff)+amount))
  const g = Math.max(0,Math.min(255,((num>>8)&0xff)+amount))
  const b = Math.max(0,Math.min(255,(num&0xff)+amount))
  return `#${((r<<16)|(g<<8)|b).toString(16).padStart(6,'0')}`
}

const isOverview = computed(() => nav.currentPageId === 'dayun-overview')
const hasImage = computed(() => nav.currentPage?.image && !imgError.value)

// 缩放原点 CSS 值
const zoomOrigin = computed(() => {
  const o = nav.transitionOrigin
  return `${o.x}% ${o.y}%`
})

// 目标页（当前页）的 CSS class
const targetClass = computed(() => {
  if (animPhase.value === 'forward-in') return 'bg--zoom-in'
  if (animPhase.value === 'back-out') return 'bg--settle-in'
  return ''
})

// 离开页的 CSS class
const leavingClass = computed(() => {
  if (animPhase.value === 'forward-in') return 'bg--push-out'
  if (animPhase.value === 'back-out') return 'bg--shrink-out'
  return ''
})

watch(() => nav.currentPageId, async (newId, oldId) => {
  if (!oldId || oldId === newId) return
  imgLoaded.value = false
  imgError.value = false

  const leaving = getPage(oldId)
  if (leaving) {
    leavingPage.value = leaving
    animPhase.value = nav.transitionDirection === 'forward' ? 'forward-in' : 'back-out'
    await nextTick()
    // 触发浏览器重排后启动动画
    await nextTick()
  }

  setTimeout(() => {
    leavingPage.value = null
    animPhase.value = 'idle'
    imgLoaded.value = false
    imgError.value = false
    // 缓存图片的 @load 不会重新触发，手动检测
    nextTick(() => {
      const img = document.querySelector('.viewer__img')
      if (img?.complete && img.naturalWidth > 0) imgLoaded.value = true
    })
  }, 650)
})

function descLines(page) {
  return (page?.description || '').split('\n')
}

function triggerRipple(event, targetId) {
  if (nav.isAnimating) return
  const layer = event.currentTarget.closest('.overlay-layer')
  const lr = layer.getBoundingClientRect()
  const px = event.clientX - lr.left
  const py = event.clientY - lr.top
  const origin = { x: (event.clientX / window.innerWidth) * 100, y: (event.clientY / window.innerHeight) * 100 }
  ;[0, 1, 2].forEach(d => {
    ripples.value.push({ id: ++rippleId, x: px, y: py, delay: d })
  })
  setTimeout(() => {
    ripples.value = []
    nav.goToPage(targetId, origin)
  }, 700)
}
</script>

<template>
  <div class="viewer" :class="'viewer--' + nav.currentPageId">
    <!-- 底层：目标页（新页面） -->
    <div
      class="viewer__bg"
      :class="targetClass"
      :style="animPhase === 'forward-in'
        ? { transformOrigin: zoomOrigin }
        : {}"
    >
      <img
        v-if="hasImage"
        :src="nav.currentPage.image"
        class="viewer__img"
        :class="{ 'viewer__img--ready': imgLoaded }"
        @load="imgLoaded = true"
        @error="imgError = true"
      />
      <div v-if="hasImage && nav.currentPage?.description && nav.currentPageId !== 'dayun-overview'" class="viewer__caption">
        <template v-for="(line, i) in descLines(nav.currentPage)" :key="i">
          {{ line }}<br v-if="i < descLines(nav.currentPage).length - 1" />
        </template>
      </div>
      <div v-else class="viewer__placeholder" :class="{ 'viewer__placeholder--paper': isOverview }" :style="placeholderGradient(nav.currentPage)">
        <div class="viewer__grid"></div>
        <div class="viewer__ornament-top"></div>
        <div class="viewer__hero" :class="{ 'viewer__hero--top': isOverview }">
          <div class="viewer__title">{{ nav.currentPage?.title || '' }}</div>
          <div class="viewer__deco-line"></div>
          <div class="viewer__desc">
            <template v-for="(line, i) in descLines(nav.currentPage)" :key="i">
              {{ line }}<br v-if="i < descLines(nav.currentPage).length - 1" />
            </template>
          </div>
        </div>
        <!-- 概览页照片叠加层 -->
        <div v-if="isOverview && nav.currentPage?.overlay" class="overlay-layer">
          <div
            v-for="item in nav.currentPage.overlay" :key="item.targetId"
            class="overlay-photo"
            :style="{
              left: item.x + '%',
              top: item.y + '%',
              width: item.width + '%',
              transform: 'rotate(' + (item.rotate || 0) + 'deg)',
            }"
            @click.stop="triggerRipple($event, item.targetId)"
          >
            <img :src="item.image" class="overlay-photo__img" />
            <span class="overlay-photo__label">{{ item.label }}</span>
          </div>
          <span
            v-for="r in ripples" :key="r.id"
            class="ripple-ring"
            :style="{ left: r.x + 'px', top: r.y + 'px', animationDelay: r.delay * 100 + 'ms' }"
          ></span>
        </div>
        <div class="viewer__hint" v-if="nav.currentPage?.hotspots?.length && !isOverview">
          <span class="viewer__hint-arrow">&#8595;</span>
          <span>点击图中标记探索</span>
        </div>
        <div class="viewer__ornament-bottom"></div>
      </div>
      <HotspotLayer />
    </div>

    <!-- 上层：离开页（过渡期间） -->
    <div
      v-if="leavingPage"
      class="viewer__bg viewer__bg--overlay"
      :class="leavingClass"
      :style="animPhase === 'back-out'
        ? { transformOrigin: '50% 50%' }
        : {}"
    >
      <div class="viewer__placeholder" :style="placeholderGradient(leavingPage)">
        <div class="viewer__grid"></div>
        <div class="viewer__ornament-top"></div>
        <div class="viewer__hero">
          <div class="viewer__title">{{ leavingPage.title || '' }}</div>
          <div class="viewer__deco-line"></div>
          <div class="viewer__desc">
            <template v-for="(line, i) in descLines(leavingPage)" :key="i">
              {{ line }}<br v-if="i < descLines(leavingPage).length - 1" />
            </template>
          </div>
        </div>
        <div class="viewer__ornament-bottom"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.viewer {
  position: fixed; inset: 0; overflow: hidden;
  background: #f5f1e6;
}

.viewer__bg {
  position: absolute; inset: 0;
}

.viewer__bg--overlay {
  z-index: 100;
  pointer-events: none;
}

/* ===== 图片 ===== */
.viewer__img {
  width: 100%; height: 100%; object-fit: cover;
  opacity: 0; transition: opacity 0.4s ease;
}
.viewer__img--ready { opacity: 1; }

/* ===== 子页面文字说明 ===== */
.viewer__caption {
  position: absolute; top: 2%; left: 0; right: auto;
  max-width: 60%;
  padding: 16px 20px;
  background: transparent;
  color: #000;
  font-size: 13px;
  line-height: 1.8;
  text-align: left;
  z-index: 5;
  pointer-events: none;
}

/* ===== 占位插画 ===== */
.viewer__placeholder {
  width: 100%; height: 100%;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  position: relative; overflow: hidden;
}

/* 概览页 — 莫兰迪米色 */
.viewer__placeholder--paper {
  justify-content: flex-start;
  background: #f5f1e6 !important;
}
.viewer__placeholder--paper .viewer__grid,
.viewer__placeholder--paper .viewer__ornament-top,
.viewer__placeholder--paper .viewer__ornament-bottom {
  display: none;
}
.viewer__grid {
  position: absolute; inset: 0; opacity: 0.06; pointer-events: none;
  background-image:
    linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px);
  background-size: 60px 60px, 60px 60px;
}
.viewer__ornament-top {
  position: absolute; top: 60px; left: 50%; transform: translateX(-50%);
  width: 60px; height: 2px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
}
.viewer__ornament-top::after {
  content: ''; position: absolute; top: -3px; left: 50%; transform: translateX(-50%);
  width: 8px; height: 8px; border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.2);
}
.viewer__hero {
  text-align: center; color: #fff; padding: 0 32px; max-width: 500px;
  position: relative; z-index: 1;
}
.viewer__hero--top {
  margin-top: 36px;
  margin-left: 32px;
  text-align: left;
  align-self: flex-start;
  color: #000;
}
.viewer__hero--top .viewer__title {
  color: #000;
  text-shadow: none;
  font-size: 32px;
}
.viewer__hero--top .viewer__desc {
  color: #000;
  text-shadow: none;
}
.viewer__hero--top .viewer__deco-line {
  background: linear-gradient(90deg, transparent, rgba(140,120,90,0.4), transparent);
}
.viewer__title {
  font-size: 36px; font-weight: 700; letter-spacing: 2px;
  text-shadow: none;
  margin-bottom: 16px;
  color: #000;
}
.viewer__deco-line {
  width: 40px; height: 2px; margin: 0 auto 20px;
  background: linear-gradient(90deg, transparent, rgba(0,0,0,0.15), transparent);
}
.viewer__desc {
  font-size: 15px; line-height: 1.8; color: #000;
  text-shadow: none;
}
.viewer__hint {
  position: absolute; bottom: 100px;
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  color: rgba(255,255,255,0.5); font-size: 13px;
  animation: float 3s ease-in-out infinite;
  z-index: 1;
}
.viewer__hint-arrow { font-size: 20px; }
@keyframes float {
  0%,100% { transform: translateY(0); opacity: 0.4; }
  50% { transform: translateY(-6px); opacity: 0.7; }
}
.viewer__ornament-bottom {
  position: absolute; bottom: 60px; left: 50%; transform: translateX(-50%);
  width: 100px; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
}

/* ===== Atlas 缩放过渡 ===== */

/* 前进：新页面从热点位置放大进入 */
.bg--zoom-in {
  animation: atlasZoomIn 0.65s cubic-bezier(0.4, 0, 0.2, 1) both;
}
@keyframes atlasZoomIn {
  0%   { transform: scale(0.12); opacity: 0; }
  40%  { opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}

/* 前进：旧页面被放大推出 */
.bg--push-out {
  animation: atlasPushOut 0.65s cubic-bezier(0.4, 0, 0.2, 1) both;
}
@keyframes atlasPushOut {
  0%   { transform: scale(1); opacity: 1; }
  100% { transform: scale(2.8); opacity: 0; }
}

/* 后退：旧页面缩小收起 */
.bg--shrink-out {
  animation: atlasShrinkOut 0.55s cubic-bezier(0.4, 0, 0.6, 1) both;
}
@keyframes atlasShrinkOut {
  0%   { transform: scale(1); opacity: 1; }
  100% { transform: scale(0.12); opacity: 0; }
}

/* 后退：新页面（父页面）从略缩小状态恢复 */
.bg--settle-in {
  animation: atlasSettleIn 0.55s cubic-bezier(0, 0, 0.2, 1) both;
}
@keyframes atlasSettleIn {
  0%   { transform: scale(0.9); opacity: 0.3; }
  100% { transform: scale(1); opacity: 1; }
}

/* ===== 概览页照片叠加 ===== */
.overlay-layer {
  position: absolute; inset: 0; z-index: 5;
  pointer-events: none;
}
.overlay-photo {
  position: absolute;
  pointer-events: auto;
  cursor: pointer;
  background: transparent;
  padding: 0;
  border-radius: 0;
  box-shadow: none;
  transition: transform 0.3s ease, z-index 0s;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.overlay-photo:hover {
  z-index: 30;
}
.overlay-photo__img {
  width: 100%; height: auto; display: block;
  border-radius: 1px;
  pointer-events: none;
}
.overlay-photo__label {
  text-align: center;
  font-size: 11px; color: #000;
  font-weight: 500;
  white-space: nowrap;
  margin-top: 0.2cm;
}
.overlay-photo:first-child .overlay-photo__label {
  margin-top: -0.3cm;
}

/* ===== 水波纹场景转换 ===== */
.ripple-ring {
  position: absolute;
  width: 40px; height: 40px;
  margin-left: -20px; margin-top: -20px;
  border-radius: 50%;
  border: none;
  box-shadow:
    0 0 0 3px rgba(0, 0, 0, 0.12),
    inset 0 0 0 1px rgba(0, 0, 0, 0.08);
  background: radial-gradient(circle, rgba(0, 0, 0, 0.06) 0%, rgba(0, 0, 0, 0.02) 50%, transparent 70%);
  pointer-events: none;
  animation: rippleExpand 0.8s cubic-bezier(0.22, 0.61, 0.36, 1) both;
  filter: blur(0.5px);
}
.ripple-ring:nth-child(2) {
  animation-duration: 0.75s;
  animation-delay: 0.1s;
  box-shadow:
    0 0 0 2.5px rgba(0, 0, 0, 0.1),
    inset 0 0 0 0.5px rgba(0, 0, 0, 0.06);
}
.ripple-ring:nth-child(3) {
  animation-duration: 0.85s;
  animation-delay: 0.2s;
  box-shadow:
    0 0 0 2px rgba(0, 0, 0, 0.08),
    inset 0 0 0 0.5px rgba(0, 0, 0, 0.04);
}
@keyframes rippleExpand {
  0%   { transform: scale(0.4); opacity: 0.9; filter: blur(1px); }
  30%  { opacity: 0.6; filter: blur(0.3px); }
  70%  { opacity: 0.25; }
  100% { transform: scale(22); opacity: 0; filter: blur(2px); }
}

@media (max-width: 768px) {
  /* 子页面文字 */
  .viewer__caption {
    font-size: 11px;
    padding: 30px 14px 18px;
    line-height: 1.6;
  }

  /* 子页面图片完整显示 */
  .viewer--caojia-service .viewer__img,
  .viewer--yunlan-hotspring .viewer__img,
  .viewer--xiangwang-coffee .viewer__img,
  .viewer--xinyi-farm .viewer__img,
  .viewer--xiyu-yard .viewer__img,
  .viewer--jinyun-homestay .viewer__img,
  .viewer--yunbao-museum .viewer__img,
  .viewer--coffee-391 .viewer__img {
    object-fit: contain;
  }
  .viewer--caojia-service .viewer__img {
    transform: scale(1.2) translate(-6%, 15%);
  }

  /* Hero 文字缩小置顶 */
  .viewer__hero--top {
    margin-top: 14px;
    margin-left: 16px;
    padding: 0;
    max-width: 260px;
    color: #000;
  }
  .viewer__hero--top .viewer__title {
    font-size: 18px;
    letter-spacing: 1px;
    margin-bottom: 6px;
    color: #000;
  }
  .viewer__hero--top .viewer__desc {
    font-size: 10px;
    line-height: 1.5;
    color: #000;
  }
  .viewer__hero--top .viewer__deco-line {
    width: 24px; margin-bottom: 8px;
  }

  /* 概览页照片缩小保持原位 */
  .overlay-photo {
    width: 34% !important;
  }
  .overlay-photo__label {
    font-size: 10px;
  }
}

@media (max-width: 380px) {
  .viewer__hero--top {
    margin-top: 10px;
    margin-left: 12px;
    max-width: 220px;
  }
  .viewer__hero--top .viewer__title {
    font-size: 16px;
  }
  .viewer__hero--top .viewer__desc {
    font-size: 9px;
    line-height: 1.4;
  }
  .overlay-photo {
    width: 32% !important;
  }
}
</style>
