import router from '@/router'
import settings from './settings'
import store from './store'
import NProgress from 'nprogress'
NProgress.configure({ showSpinner: false }) // NProgress Configuration
import 'nprogress/nprogress.css'
import getPageTitle from '@/utils/getPageTitle'

router.beforeEach(async (to, from, next) => {
  // start progress bar
  if (settings.isNeedNprogress) NProgress.start()
  document.title = getPageTitle(to.meta.title)
  // next()
  let accessRoutes = []
  accessRoutes = await store.dispatch('permission/generateRoutes', [])
  accessRoutes.forEach((route) => {
    router.addRoute(route)
  })
  next()
})

router.afterEach(() => {
  if (settings.isNeedNprogress) NProgress.done()
})
