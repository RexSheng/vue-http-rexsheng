# vue-http-rexsheng

> A Vue.js plugin for proving http request

## Build Setup

``` bash
# 页面直接引用（放在vue.js引用之后）
<script src="https://rexsheng.github.io/vue-http-rexsheng/latest/http.js"></script>

# npm安装
npm install vue-http-rexsheng --save-dev

# config in entry file like 'src/main.js'
import http from 'vue-http-rexsheng';

Vue.use(http,{instanceName:"$ajax",mockInstanceName:"$mock",wsInstanceName:"$socket",
  resultFormat:function(d){
    return d.data;
  },
  successFormat:function(d){
    return d.data;
  },errorFormat:function(d){
    return d.data;
  },defaultConfig:{}})
#设置ajax全局请求过滤器，option参数为当前请求option
Vue.ajax.interceptors.setRequest(function(option,request){return option;})
#设置ajax全局响应过滤器,option参数为全部响应对象
{
  data:data,//响应数据
  status:req.status,//响应状态码
  statusText:req.statusText,//状态
  headers:headers,//响应头
  config:config,//配置option
  request:req//当前请求
}
Vue.ajax.interceptors.setResponse(function(option,request){return option;})
#设置ajax全局前缀路径
Vue.ajax.config.baseUrl="http://localhost:8080"
#设置ajax全局是否启用mockserver,默认`false`
Vue.ajax.config.mockMode=false
#成功的status码
Vue.ajax.config.successStatus=function(status){return status==200;}
#mock缺失时的自定义处理
Vue.ajax.config.missingMockCallback=(opt)=>{
    //false： 缺失mock配置时，不使用mock，使用真实url请求
    //true: 缺失mock配置时，会error终止
    return false; 
}
#修改默认配置
Vue.ajax.config.default={type:"get",headers:{"Content-type":"application/json;charset=UTF-8"}}
Vue.ajax.config.default=()=>{return {type:"get",headers:{"Content-type":"application/json;charset=UTF-8","Lang":localStorage.getItem("language")}}}
#设置mock请求方法或者指向的文件路径
Vue.ajax.addMock(`String` mockUrl,function(param){return xxx;})
Vue.ajax.addMock(`String` mockUrl,"../static/file.json")
#mock代理请求
Vue.ajax.addMock(`String` mockUrl,{url:"/api/newurl",data:{},type:"get",success:function(d){},error:function(err){},complete:function(){}})
#@get: @post: @delete: @put: 用于相同url但是不同请求类型的拦截
Vue.ajax.addMock(
  {
    "/url1":function(param){return {code:0,data:param};},
    "/url2":"../static/file.json",
    "/url3":{url:"/api/newurl",data:{},type:"get",success:function(d){},error:function(err){},complete:function(){}},
    //{url:"/user/3",type:"get"}的请求会匹配到
    "@get:/user/3":"../static/filedetail.json",
    //{url:"/user/3",type:"delete"}的请求会匹配到
    "@delete:/user/3":"../static/filedetail.json",
  }
)
#全局配置发送socket未开启时数据延迟毫秒
Vue.socket.config.reconnectTimeout=30
#全局配置发送socket的url前缀路径
Vue.socket.config.baseUrl="ws://47.104.xx.xx:8701"
```
# 用法
```javascript
<template>
   
</template>
<script>
import Vue from 'vue'
export default {
  name: 'app',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App'
    }
  },
  mounted(){
    this.$ajax.send({
      url:"http://xxxxxxxxxxxxxxxxx/xxxxxxxxxx",
      type:"get"
    }).then((d)=>{
      console.log("success1",d,this.msg)
    }).catch((d)=>{
      console.log("error1",d)
    });
    Vue.ajax.send({
      url:"http://test.http.cn/user/{userId}",
      type:"post",
      data:{
          userId:12
      }
    }).then((d)=>{
      console.log("success2",d,this.msg)
    }).catch((d)=>{
      console.log("error2",d)
    });

  }
}
</script>


```
# 配置项
```
this.$ajax.send(option)
```
## option配置如下
|选项            |      说明                |  备注 |
|------          |---------------          |:-----:|
|type            |类型                     |`get` `post` `delete` `put`|
|url             |请求地址                  | 必填 |
|baseUrl             |请求地址的前缀                  | `boolean` `string`  设置为`false`时，不使用全局配置url：Vue.ajax.config.baseUrl；设置为字符串时，优先级高于全局配置 |
|~~async~~           |~~是否异步请求~~              | ~~默认`true`~~ |
|headers         |请求headers对象           | 例如`{"Content-type":"application/json;charset=UTF-8"}` |
|timeout         |超时时间毫秒               | 毫秒数 |
|withCredentials |跨域响应设置cookie         |默认`false` |
|data |请求发送的数据         |Object/Array |
|dataType |表明要发送的数据格式         |默认`"json"` `"xml"` `"form"` `"formData"`(使用formdata表单发送数据，通常用于文件上传)|
|responseType|返回的数据类型|默认`""` `"json"` `"blob"` `"text"` `"arraybuffer"` `"document"`
|transform |自定义格式化请求前数据的函数         | 参数为当前配置的data数据<br/> 例如`function(data){return JSON.stringify(data);}` |
|mock|mock模拟数据请求|`true(需调用Vue.ajax.addMock(url,function)来拦截本次请求)` `function(data){//模拟请求，参数data为option的data}` `String请求的json文件地址` `{url:'/newurl',type:'get',data:{},complete:function(){},success:function(d){},error:function(err){}}`|
|success|请求成功的回调|`function(data,req){}` |
|error|请求失败的回调|`function(err,req){}` |
|complete|请求完成的回调|`function(){}` |
|uploadProgress|文件上传的进度事件|`function(d){}` |
|loadstart |请求开始时的事件         |`function(){}` |
|ontimeout |超时事件         |`function(d){}` |
|onprogress |进度事件         |`function(d){}` |
|onloadend |请求结束事件         |`function(d){}` |
|cancel |取消请求函数，若要取消该请求时在函数内部调用cb()来执行取消         |`function(cb){if(someCondition){cb();}}` |

#socket配置
```javascript
//调用listen方法返回值结构：
//{
//  instance：“socket实例”,
//  send:function(data,opt){//发送数据函数，返回promise,then参数为当前对象},
//  close:function(){//关闭当前socket实例}
//}
var pageInstance=this.$socket.listen({
      url:"/websocket",
      onmessage:function(e){
        console.log("msg"+new Date(),e)
      },
      onopen:function(e){
        console.log("open",e)
      },
      onerror:function(e){
        console.log("onerror",e)
      },
      onclose:function(e){
        console.log("onclose",e)
      },
      instanceId:'12'//设置全局id,不会重复创建
    },this)
//调用send方法，发送数据，返回promise
//send可选参数
//(message(消息String|Object),option(配置项),scope（作用域，一般为页面实例this）)
//(message(消息String|Object),option(配置项))
//(message(消息String|Object),url(路径String))
//(message(消息String|Object))
//(option(配置项))
this.$socket.send("测试"+new Date(),{
      url:"/websocket"
    }).then((a)=>{
      a.close()
    })

```
## websocket option配置如下
|选项            |      说明                |  备注 |
|------          |---------------          |:-----:|
|dataType            |数据类型                     |`json` `text` `""`|
|url             |请求地址                  | String类型 |
|data |请求发送的数据         |Object/String |
|format |对参数data进行格式化输出         |默认Object会进行JSON序列化，`format(data,type)`参数data用户数据【对应配置中data】,type用户的数据类型【对应配置中的dataType】|
|onopen             |连接打开事件                  |  |
|onmessage             |消息接收事件                  |  |
|onerror             |错误事件                  |  |
|onclose             |关闭事件                  |  |
|instanceId             |全局id                  | String类型，设置此参数在页面跳转回来时，不会重复创建相同instanceId的socket连接，除非用户已经关闭对应的WebSocket |
|baseUrl             | 当前请求的url前缀   | 若不使用全局配置的url:Vue.socket.config.baseUrl  ,可配置当前请求使用的前缀url,优先级高于全局配置 |


For detailed explanation on how things work, consult the [docs for vue-http-rexsheng](https://github.com/RexSheng/vue-http-rexsheng).