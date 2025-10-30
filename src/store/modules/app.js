const state = {
  device: 'desktop',
  cachedViews: [],
  theme: localStorage["theme"] || "default",
  wallet: localStorage["MySolAddress"] || "",
}

const mutations = {

  TOGGLE_DEVICE: (state, device) => {
    state.device = device
  },
  /*keepAlive缓存*/
  M_ADD_CACHED_VIEW: (state, view) => {
    if (state.cachedViews.includes(view)) return
    state.cachedViews.push(view)
  },
  M_DEL_CACHED_VIEW: (state, view) => {
    const index = state.cachedViews.indexOf(view)
    index > -1 && state.cachedViews.splice(index, 1)
  },
  M_RESET_CACHED_VIEW: (state) => {
    state.cachedViews = []
  },
  TOGGLE_DEVICE: (state, device) => {
    state.device = device
  },
  TOGGLE_THEME: (state, theme) => {
    state.theme = theme
    localStorage.setItem('theme', theme)
  },
  TOGGLE_WALLET: (state, wallet) => {
    state.wallet = wallet
    localStorage.setItem('MySolAddress', wallet)
  },
}
const actions = {
  toggleDevice({ commit }, device) {
    commit('TOGGLE_DEVICE', device)
  },
  toggleTheme({ commit }, theme) {
    commit('TOGGLE_THEME', theme)
  },
  toggleWallet({ commit }, wallet) {
    commit('TOGGLE_WALLET', wallet)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
