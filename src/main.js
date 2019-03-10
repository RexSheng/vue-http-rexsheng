import Vue from 'vue'
import App from './App.vue'
import dlg from './lib/index'
Vue.use(dlg,{
  successFormat:function(d){
    return d.data;
  }
})
var root=new Vue({
  el: '#app',
  render: h => h(App)
})
console.log(root)
