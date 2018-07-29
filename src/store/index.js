import Vue from 'vue'
import Vuex from 'vuex'
import VuexI18n from 'vuex-i18n' // load vuex i18n module

import app from './modules/app'

import * as getters from './getters'

import axios from 'axios'
import VueAxios from 'vue-axios'
import jwt_decode from 'jwt-decode' // eslint-disable-line 


Vue.use(Vuex)
Vue.use(VueAxios, axios)

const store = new Vuex.Store({
  strict: true, // process.env.NODE_ENV !== 'production',
  getters,
  modules: {
    app
  },
  state: {
    jwt: localStorage.getItem('t'),
    endpoints: {
      obtainJWT: process.env.API_ENV + 'api/auth/obtain/',
      refreshJWT: process.env.API_ENV + 'api/auth/refresh/',
      verifyJWT: process.env.API_ENV + 'api/auth/verify/'
    }
  },
  mutations: {
    updateToken (state, newToken) {
      localStorage.setItem('t', newToken)
      state.jwt = newToken
    },
    removeToken (state) {
      localStorage.removeItem('t')
      state.jwt = null
    },
    updateCsrfToken (state, newToken) {
      localStorage.setItem('csrf', newToken)
      state.csrf = newToken
    },
    removeCsrfToken (state) {
      localStorage.removeItem('csrf')
      state.csrf = null
    }
  },
  actions: {
    obtainToken (context, params) {
      const payload = {
        username: params.username,
        password: params.password
      }

      axios.post(this.state.endpoints.obtainJWT, payload)
        .then((response) => {
          this.commit('updateToken', response.data.token)
        })
        .catch((error) => {
          console.log(error)
          console.log(error.response.data)
        })
    },
    refreshToken () {
      const payload = {
        token: this.state.jwt
      }

      axios.post(this.state.endpoints.refreshJWT, payload)
        .then((response) => {
          this.commit('updateToken', response.data.token)
        })
        .catch((error) => {
          console.log(error)
        })
    },
    inspectToken () {
      const token = this.state.jwt
      if (token) {
        const decoded = jwt_decode(token)
        const exp = decoded.exp
        const origIat = decoded.orig_iat

        if (exp - (Date.now() / 1000) < 1800 && (Date.now() / 1000) - origIat < 628200) {
          this.dispatch('refreshToken')
        } else if (exp - (Date.now() / 1000) < 1800) {

        } else {
          // request auth again.
        }
      }
    }
  }
})

Vue.use(VuexI18n.plugin, store)

export default store
