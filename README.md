# vue-http-rexsheng

> A Vue.js plugin for proving http request

## Build Setup

``` bash
# install plugin
npm install vue-http-rexsheng --save-dev

# config in entry file like 'src/main.js'
import http from 'vue-http-rexsheng';

Vue.use(http,{instanceName:"$ajax",mockInstanceName:"$mock",
  resultFormat:function(d){
    return d.data;
  },
  successFormat:function(d){
    return d.data;
  },errorFormat:function(d){
    return d.data;
  },defaultConfig:{}})
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
|async           |是否异步请求              | 默认`true` |
|headers         |请求headers对象           | 例如`{"Content-type":"application/json;charset=UTF-8"}` |
|timeout         |超时时间毫秒               | 毫秒数 |
|withCredentials |跨域响应设置cookie         |默认`false` |
|formData |使用formdata表单发送数据，通常用于文件上传         |默认`false` |
|data |请求发送的数据         |Object/Array |
|dataType |表明要发送的数据格式         |默认`"json"` |
|transform |自定义格式化请求前数据的函数         | 有一个参数为当前配置的data数据 例如`function(data){return JSON.stringify(data);}` |
|loadstart |请求开始时的事件         |`function(){}` |
|ontimeout |超时事件         |`function(d){}` |
|onprogress |进度事件         |`function(d){}` |
|onloadend |请求结束事件         |`function(d){}` |
|cancel |取消请求函数，若要取消该请求时在函数内部调用cb()来执行取消         |`function(cb){if(someCondition){cb();}}` |


For detailed explanation on how things work, consult the [docs for vue-http-rexsheng](https://github.com/RexSheng/vue-http-rexsheng).
