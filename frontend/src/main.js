import Vue from 'vue'
import App from './App.vue'
import Element from 'element-ui'
import locale from 'element-ui/lib/locale/lang/en'
import './assets/theme/theme/index.css'
locale.el.colorpicker.confirm = 'Apply'
locale.el.colorpicker.clear = 'Cancel'
Vue.use(Element, { locale })

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
