<template>
  <div id="app">
    <img src="./assets/logo.png">
    <h1>{{ msg }}</h1>
 
    <h2>Essential Links</h2>
    <ul>
      <li><a href="https://vuejs.org" target="_blank">Core Docs</a></li>
      <li><a href="https://forum.vuejs.org" target="_blank">Forum</a></li>
      <li><a href="https://chat.vuejs.org" target="_blank">Community Chat</a></li>
      <li><a href="https://twitter.com/vuejs" target="_blank">Twitter</a></li>
    </ul>
    <h2>Ecosystem</h2>
    <ul>
      <li><a href="http://router.vuejs.org/" target="_blank">vue-router</a></li>
      <li><a href="http://vuex.vuejs.org/" target="_blank">vuex</a></li>
      <li><a href="http://vue-loader.vuejs.org/" target="_blank">vue-loader</a></li>
      <li><a href="https://github.com/vuejs/awesome-vue" target="_blank">awesome-vue</a></li>
    </ul>
  </div>
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
      url:"http://xconsole.rrslj.com/datacenter/userxw/getCenterData?dateFlag=2018-08-10",
      type:"get"
    }).then((d)=>{
      console.log("success1",d,this.msg)
    }).catch((d)=>{
      console.log("error1",d)
    });
    Vue.ajax.send({
      url:"http://xconsole.rrslj.com/datacenter/userxw/getCenterData?dateFlag=2018-08-10",
      type:"get"
    }).then((d)=>{
      console.log("success2",d,this.msg)
    }).catch((d)=>{
      console.log("error2",d)
    });

  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

h1, h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
.load-container {
  border: 1px solid rgba(255, 255, 255, 0.2);
  width: 240px;
  height: 240px;
  float: left;
  position: relative;
  overflow: hidden;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
}
</style>
