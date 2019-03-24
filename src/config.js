import Vue from 'vue'
import ajax from './lib/index'
Vue.use(ajax,{
//   successFormat:function(d){
//     return d.data;
//   }
})
// Vue.ajax.interceptors.setResponse(d=>{
//   console.warn("response",d);
//   return Promise.resolve(d.data);
// //   return rlt;
// })
// Vue.ajax.interceptors.setRequest(d=>{
//   console.warn("request",d,this);
//   return d;
// })
Vue.ajax.prefix="http://192.168.8.72:8700"