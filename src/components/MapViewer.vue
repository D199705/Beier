<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useNavigationStore } from '../stores/navigation.js'

const nav = useNavigationStore()
const mapContainer = ref(null)
let map = null
let markersLayer = null

// 暖色手绘风格地图瓦片 (CartoDB light)
const TILE_URL = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
const TILE_ATTR = '&copy; CartoDB'

// ===== 创建手绘风格建筑标记 =====
function createBuildingIcon(hotspot) {
  const catColors = {
    scenic:    { roof: '#d4845a', body: '#e8b89d', door: '#c0784a' },
    cafe:      { roof: '#a4715a', body: '#c9a892', door: '#8d5a3e' },
    stay:      { roof: '#c9926b', body: '#e0c5a8', door: '#a8754a' },
    farm:      { roof: '#b5a06a', body: '#d4cb9a', door: '#8a7a48' },
    culture:   { roof: '#b08070', body: '#d4b8a8', door: '#8d6050' },
    hotspring: { roof: '#c09070', body: '#e0c8b0', door: '#9a7050' },
    outdoor:   { roof: '#c89050', body: '#e0c090', door: '#a07038' },
    service:   { roof: '#c06050', body: '#e09888', door: '#9a4038' },
  }
  const c = catColors[hotspot.category] || catColors.scenic

  const html = `
    <div class="leaflet-marker" style="text-align:center">
      <div style="width:48px;height:8px;background:radial-gradient(ellipse,rgba(0,0,0,0.3) 0%,transparent 70%);border-radius:50%;margin:0 auto 2px"></div>
      <svg width="48" height="64" viewBox="0 0 60 80" style="display:block;margin:0 auto;filter:drop-shadow(0 2px 3px rgba(0,0,0,0.3))">
        <ellipse cx="30" cy="4" rx="14" ry="3" fill="rgba(0,0,0,0.12)"/>
        <path d="M6 32 Q8 10 30 6 Q52 10 54 32" fill="${c.roof}" stroke="rgba(0,0,0,0.25)" stroke-width="1.2" stroke-dasharray="2,3"/>
        <rect x="9" y="32" width="42" height="34" rx="3" fill="${c.body}" stroke="rgba(0,0,0,0.2)" stroke-width="1.2"/>
        <rect x="14" y="38" width="8" height="8" rx="1" fill="rgba(255,255,255,0.7)" stroke="rgba(0,0,0,0.15)" stroke-width="0.8"/>
        <rect x="38" y="38" width="8" height="8" rx="1" fill="rgba(255,255,255,0.7)" stroke="rgba(0,0,0,0.15)" stroke-width="0.8"/>
        <text x="30" y="54" text-anchor="middle" font-size="14">${hotspot.icon}</text>
        <rect x="22" y="66" width="16" height="10" rx="2" fill="${c.door}" stroke="rgba(0,0,0,0.2)" stroke-width="0.8"/>
      </svg>
      <div style="background:white;border-radius:3px;padding:1px 6px;display:inline-block;box-shadow:0 1px 3px rgba(0,0,0,0.3);margin-top:1px;border:1px dashed rgba(0,0,0,0.15)">
        <span style="font-size:10px;font-weight:700;color:#3e2723;white-space:nowrap;font-family:'KaiTi','STKaiti',cursive">${hotspot.label}</span>
      </div>
    </div>
  `

  return L.divIcon({
    html,
    className: '',
    iconSize: [60, 100],
    iconAnchor: [30, 90],
    popupAnchor: [0, -80],
  })
}

// ===== 渲染当前页面的标记 =====
function renderMarkers() {
  if (!map) return
  if (markersLayer) markersLayer.remove()
  markersLayer = L.layerGroup().addTo(map)

  const page = nav.currentPage
  if (!page || !page.hotspots) return

  page.hotspots.forEach((hs) => {
    const target = nav.getPageById(hs.targetId)
    if (!target) return

    const icon = createBuildingIcon(hs)
    const marker = L.marker([target.lat, target.lng], { icon }).addTo(markersLayer)

    marker.on('click', () => {
      nav.goToPage(hs.targetId)
    })

    // tooltip
    marker.bindTooltip(hs.label, {
      direction: 'top',
      offset: [0, -50],
      className: 'marker-tooltip',
    })
  })
}

// ===== 地图飞行 =====
function flyToPage() {
  if (!map) return
  const page = nav.currentPage
  if (!page) return
  map.flyTo([page.lat, page.lng], page.zoom, {
    duration: 0.8,
    easeLinearity: 0.25,
  })
  // 飞行结束后渲染新标记
  setTimeout(() => renderMarkers(), 400)
}

// ===== 初始化地图 =====
onMounted(() => {
  const root = nav.getPageById('dayun-overview')

  map = L.map(mapContainer.value, {
    center: [root.lat, root.lng],
    zoom: root.zoom,
    zoomControl: false,
    attributionControl: false,
    fadeAnimation: true,
    zoomAnimation: true,
  })

  L.tileLayer(TILE_URL, {
    attribution: TILE_ATTR,
    maxZoom: 19,
    className: 'warm-tiles',
  }).addTo(map)

  // 初始渲染
  renderMarkers()

  // 监听导航变化
  watch(() => nav.currentPageId, () => {
    flyToPage()
  })
})

// 暴露方法给外部调用
defineExpose({ flyToPage })
</script>

<template>
  <div class="map-wrapper">
    <div ref="mapContainer" class="map-container"></div>
  </div>
</template>

<style scoped>
.map-wrapper {
  position: fixed;
  inset: 0;
  z-index: 1;
}
.map-container {
  width: 100%;
  height: 100%;
}

/* Leaflet 暖色覆盖 */
:deep(.warm-tiles) {
  filter: sepia(0.2) saturate(0.8) brightness(1.05);
}

/* 自定义 tooltip */
:deep(.marker-tooltip) {
  background: rgba(62, 40, 20, 0.85);
  border: 1px solid rgba(180, 140, 100, 0.4);
  border-radius: 6px;
  color: #f5e6d3;
  font-size: 11px;
  font-family: 'KaiTi', 'STKaiti', cursive, sans-serif;
  padding: 2px 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
}
:deep(.marker-tooltip::before) {
  border-top-color: rgba(62, 40, 20, 0.85) !important;
}

/* 隐藏 Leaflet 默认 focus 样式 */
:deep(.leaflet-marker-icon:focus) {
  outline: none;
}
</style>
