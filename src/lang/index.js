import { createI18n } from 'vue-i18n'

import zh_CN from './zh-CN'
import us_EN from './en.js'

// 语言库
const messages = {
  'zh-CN': zh_CN,
  'en': us_EN
}

const appLocal = localStorage.getItem('language');
const languageIsEn = appLocal && appLocal.indexOf('english') > -1

// 默认语言
// const langDefault = 'zh-CN'
const langDefault = languageIsEn ? 'en' : 'zh-CN'

const i18n = createI18n({
  legacy:false,
  locale: langDefault,		//默认显示的语言 
  messages
})

export default i18n; // 将i18n暴露出去，在main.js中引入挂载