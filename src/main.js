import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import '@/styles/index.scss' // global css
import { Buffer } from 'buffer'
window.Buffer = Buffer
const app = createApp(App)

//import vuex
import store from './store'
app.use(store)
import * as ElSvg from '@element-plus/icons-vue'

for(const name in ElSvg) {
  app.component(name, ElSvg[name])
}
//element svg icon
import ElSvgIcon from "@/layout/components/ElSvgIcon.vue"
app.component("e-icon",ElSvgIcon)

import { ElMessage } from 'element-plus'
app.config.globalProperties.$elmsg = ElMessage

import './permission'

app.use(router).mount('#app')