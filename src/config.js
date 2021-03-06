import Vue from 'vue'
import ajax from './lib/index'
Vue.use(ajax)
Vue.ajax.interceptors.setResponse(d=>{
  console.warn("response",new Date(),d);
  return Promise.resolve(d);
})
Vue.ajax.interceptors.addResponse(d=>{
    return new Promise(res=>{
        setTimeout(()=>{
            console.warn("response2",new Date(),d);
            res(d);
        },0)
        
    })
    
  },2)
Vue.ajax.interceptors.setRequest(d=>{
  console.warn("request",d,this);
  return d;
})
Vue.ajax.interceptors.addRequest(d=>{
    console.warn("request2",d,this);
    return Promise.resolve(d);
  },2)
// Vue.ajax.prefix="http://192.168.8.72:8700";
Vue.ajax.config.baseUrl="";
Vue.ajax.config.mockMode=false
Vue.ajax.config.timeout=500000
Vue.ajax.config.stripUrl=function(value,key){
    if(value===null){
        return true;
    }
    return false;
}
// Vue.ajax.addMock("/test/mock001",function(d){return d;})
Vue.ajax.addMock({
    "/test/mock001":function(d){
        var a=Object.assign({},d,{
            "name|+1":["小明",'小花','小春'],
            "value|+2":[100,89,72,74,98],
            "date":new Date(),
            "provider":function(){
                return d.arr;
            }
        });
        return Vue.ajax.mock(a);
    }
})
// Vue.ajax.addMock({"/test/mockfile":"../static/mock/test.json"})
Vue.ajax.addMock({
    "/test/mockfile":"../src/assets/data/01.json",
    "@get:/test/aaa":()=>{return {"dd":1};},
    "@post:/test/aaa":()=>{return {"dd":"post"};},
    "@post:/test/mock001":()=>{return Promise.resolve({"001":"post"});},
    "@get:datacenter/userxw/getCenterData":(d)=>{return{"ol":"ok","param":d}},
});
// Vue.ajax.config.successStatus=function(d){return d>300};
Vue.ajax.config.default=()=>{
    return{
        type:"get",
        headers:{"Content-type":"application/json;charset=UTF-8","Authorization":new Date().getTime()}
    }
}
Vue.ajax.config.missingMockCallback=(opt)=>{
    return true;
}
Vue.socket.config.reconnectTimeout=30
Vue.socket.config.baseUrl="ws://47.104.154.110:8701"