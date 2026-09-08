import { createApp } from 'vue'
import { Quasar, QBtn, QIcon, QPopupProxy, QInput } from 'quasar'
import 'quasar/dist/quasar.css'
import '@quasar/extras/material-icons/material-icons.css'
import '../../src/css/app.scss'
import '../../src/css/web-workspace.scss'
import Fixture from './PropertySwitcherFixture.vue'

createApp(Fixture).use(Quasar, { components: { QBtn, QIcon, QPopupProxy, QInput } }).mount('#app')
