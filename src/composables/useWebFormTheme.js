import { onMounted, onUnmounted, toValue } from 'vue'

let activeScopes = 0

// Quasar teleports dialogs and select menus outside the layout's DOM subtree.
export function useWebFormTheme(enabled = true) {
  let applied = false
  onMounted(() => {
    if (!toValue(enabled)) return
    activeScopes += 1
    document.body.classList.add('workspace-forms-theme')
    applied = true
  })
  onUnmounted(() => {
    if (!applied) return
    activeScopes -= 1
    if (activeScopes === 0) document.body.classList.remove('workspace-forms-theme')
  })
}
