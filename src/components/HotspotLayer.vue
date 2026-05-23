<script setup>
import { useNavigationStore } from '../stores/navigation.js'
const nav = useNavigationStore()

function onClick(hs) {
  if (nav.isAnimating) return
  const origin = {
    x: hs.x + hs.width / 2,
    y: hs.y + hs.height / 2,
  }
  nav.goToPage(hs.targetId, origin)
}
</script>

<template>
  <div class="pin-layer" v-if="nav.currentPage?.hotspots?.length">
    <div
      v-for="(hs, i) in nav.currentPage.hotspots" :key="hs.id"
      class="pin"
      :style="{
        left: (hs.x + hs.width / 2) + '%',
        top: (hs.y + hs.height / 2) + '%',
        animationDelay: (i * 0.08) + 's',
      }"
      @click.stop="onClick(hs)"
    >
      <div class="pin__head">
        <span class="pin__icon">{{ hs.icon }}</span>
      </div>
      <div class="pin__shadow"></div>
      <span class="pin__label">{{ hs.label }}</span>
    </div>
  </div>
</template>

<style scoped>
.pin-layer {
  position: absolute; inset: 0; z-index: 10;
}

.pin {
  position: absolute;
  transform: translate(-50%, -100%);
  display: flex; flex-direction: column; align-items: center;
  cursor: pointer;
  animation: pinBounceIn 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  filter: drop-shadow(0 3px 6px rgba(0,0,0,0.35));
  transition: filter 0.3s, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.pin:hover {
  filter: drop-shadow(0 5px 12px rgba(0,0,0,0.5));
  transform: translate(-50%, -100%) scale(1.15);
  z-index: 20;
}

.pin:active {
  transform: translate(-50%, -100%) scale(0.92);
}

/* 水滴形头部 */
.pin__head {
  width: 44px; height: 44px;
  background: linear-gradient(135deg, #e8b86d 0%, #c9953c 100%);
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  display: flex; align-items: center; justify-content: center;
  border: 2px solid rgba(255,255,255,0.5);
  position: relative;
  animation: pinFloat 3s ease-in-out infinite;
}

.pin:nth-child(2n) .pin__head { animation-duration: 3.4s; animation-delay: 0.3s; }
.pin:nth-child(3n) .pin__head { animation-duration: 2.8s; animation-delay: 0.6s; }
.pin:nth-child(4n) .pin__head { animation-duration: 3.2s; animation-delay: 0.2s; }

.pin__icon {
  transform: rotate(45deg); /* 抵消父级旋转，保持图标正向 */
  font-size: 20px;
  line-height: 1;
  filter: drop-shadow(0 1px 1px rgba(0,0,0,0.2));
}

/* 地面阴影 */
.pin__shadow {
  width: 18px; height: 6px;
  background: radial-gradient(ellipse, rgba(0,0,0,0.3) 0%, transparent 70%);
  border-radius: 50%;
  margin-top: -2px;
  animation: shadowPulse 3s ease-in-out infinite;
}

/* 标签 */
.pin__label {
  margin-top: 1px;
  font-size: 12px; font-weight: 600; color: #fff;
  text-shadow: 0 1px 3px rgba(0,0,0,0.6), 0 0 8px rgba(0,0,0,0.3);
  white-space: nowrap;
  letter-spacing: 0.5px;
}

@keyframes pinBounceIn {
  0%   { opacity: 0; transform: translate(-50%, -100%) scale(0); }
  60%  { opacity: 1; transform: translate(-50%, -100%) scale(1.18); }
  80%  { transform: translate(-50%, -100%) scale(0.92); }
  100% { transform: translate(-50%, -100%) scale(1); }
}

@keyframes pinFloat {
  0%, 100% { transform: rotate(-45deg) translateY(0); }
  50%      { transform: rotate(-45deg) translateY(-4px); }
}

@keyframes shadowPulse {
  0%, 100% { transform: scaleX(1); opacity: 0.3; }
  50%      { transform: scaleX(0.7); opacity: 0.15; }
}

@media (max-width: 600px) {
  .pin__head { width: 36px; height: 36px; }
  .pin__icon { font-size: 16px; }
  .pin__label { font-size: 10px; }
}
</style>
