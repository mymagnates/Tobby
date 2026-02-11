import { defineBoot } from '#q-app/wrappers'
import { createI18n } from 'vue-i18n'
import messages from 'src/i18n'

export default defineBoot(({ app }) => {
  // Get saved locale from localStorage or default to browser language
  const savedLocale = localStorage.getItem('handout-locale')
  const browserLocale = navigator.language || 'en-US'
  const defaultLocale = savedLocale || (browserLocale.startsWith('es') ? 'es-ES' : 'en-US')

  const i18n = createI18n({
    locale: defaultLocale,
    fallbackLocale: 'en-US',
    globalInjection: true,
    messages,
    legacy: false,
  })

  // Save locale preference
  i18n.global.locale.value = defaultLocale
  localStorage.setItem('handout-locale', defaultLocale)

  // Set i18n instance on app
  app.use(i18n)
  
  // Export i18n for use in components
  app.config.globalProperties.$i18n = i18n
})
