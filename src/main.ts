import { createApp } from 'vue'
<<<<<<< HEAD
import { createPinia } from 'pinia'
import App from './App.vue'
import './registerServiceWorker'

import '@icon-park/vue-next/styles/index.css'
import 'prosemirror-view/style/prosemirror.css'
import 'animate.css'

import '@/assets/styles/prosemirror.scss'
import '@/assets/styles/global.scss'
import '@/assets/styles/antd.scss'
import '@/assets/styles/font.scss'

import Icon from '@/plugins/icon'
import Directive from '@/plugins/directive'

const app = createApp(App)

app.use(Icon)
app.use(Directive)

app.use(createPinia())
app.mount('#app')
=======
import App from './App.vue'
import router from './router'
import store from './store'

createApp(App).use(store).use(router).mount('#app')
>>>>>>> a291994 (init)
