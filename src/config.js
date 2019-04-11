import Vue from 'vue'
import ajax from './lib/index'
Vue.use(ajax)
// Vue.ajax.interceptors.setResponse(d=>{
//   console.warn("response",d);
//   return Promise.resolve(d.data);
// //   return rlt;
// })
// Vue.ajax.interceptors.setRequest(d=>{
//   console.warn("request",d,this);
//   return d;
// })
console.log(ajax.ajax.config)
Vue.ajax.prefix="http://192.168.8.72:8700";
Vue.ajax.config.baseUrl="";
Vue.ajax.config.mockMode=true
// Vue.ajax.addMock("/test/mock001",function(d){return d;})
Vue.ajax.addMock({"/test/mock001":function(d){return d;}})
// Vue.ajax.config.successStatus=function(d){return d>300};
Vue.ajax.config.default={type:"get",headers:{"Content-type":"application/json;charset=UTF-8"}}
Vue.socket.config.reconnectTimeout=30
Vue.socket.config.baseUrl="ws://47.104.154.110:8701"