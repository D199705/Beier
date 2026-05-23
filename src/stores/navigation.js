import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getPage, ROOT_PAGE_ID } from '../data/pages.js'

export const useNavigationStore = defineStore('navigation', () => {
  const currentPageId = ref(ROOT_PAGE_ID)
  const history = ref([ROOT_PAGE_ID])
  const isAnimating = ref(false)
  const transitionOrigin = ref({ x: 50, y: 50 })
  const transitionDirection = ref('forward')

  const currentPage = computed(() => getPage(currentPageId.value))
  const canGoBack = computed(() => history.value.length > 1)

  const breadcrumb = computed(() => {
    const trail = []
    let id = currentPageId.value
    while (id) {
      const page = getPage(id)
      if (!page) break
      trail.unshift({ id: page.id, title: page.title })
      id = page.parentId
    }
    return trail
  })

  const siblingIndex = computed(() =>
    currentPage.value?.siblings?.indexOf(currentPageId.value) ?? -1
  )
  const hasLeftSibling = computed(() => siblingIndex.value > 0)
  const hasRightSibling = computed(() => {
    const sibs = currentPage.value?.siblings || []
    return siblingIndex.value < sibs.length - 1
  })

  function getPageById(id) { return getPage(id) }

  function goToPage(targetId, origin) {
    if (isAnimating.value || targetId === currentPageId.value) return
    const target = getPage(targetId)
    if (!target) return
    transitionDirection.value = 'forward'
    if (origin) transitionOrigin.value = origin
    isAnimating.value = true
    currentPageId.value = targetId
    history.value.push(targetId)
    setTimeout(() => { isAnimating.value = false }, 700)
  }

  function goBack() {
    if (!canGoBack.value || isAnimating.value) return
    transitionDirection.value = 'back'
    isAnimating.value = true
    history.value.pop()
    currentPageId.value = history.value[history.value.length - 1]
    setTimeout(() => { isAnimating.value = false }, 600)
  }

  function goHome() {
    if (isAnimating.value) return
    transitionDirection.value = 'back'
    isAnimating.value = true
    currentPageId.value = ROOT_PAGE_ID
    history.value = [ROOT_PAGE_ID]
    setTimeout(() => { isAnimating.value = false }, 600)
  }

  function goToSibling(siblingId) {
    if (isAnimating.value || siblingId === currentPageId.value) return
    const sibling = getPage(siblingId)
    if (!sibling) return
    transitionDirection.value = 'forward'
    transitionOrigin.value = { x: 50, y: 50 }
    isAnimating.value = true
    history.value[history.value.length - 1] = siblingId
    currentPageId.value = siblingId
    setTimeout(() => { isAnimating.value = false }, 700)
  }

  return {
    currentPageId, currentPage, history, isAnimating,
    transitionOrigin, transitionDirection,
    canGoBack, breadcrumb, siblingIndex, hasLeftSibling, hasRightSibling,
    getPageById, goToPage, goBack, goHome, goToSibling,
  }
})
