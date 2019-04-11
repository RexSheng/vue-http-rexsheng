<template>
  <div id="app">
    <h1>{{ msg }}</h1>

    <h2>Ajax请求测试</h2>
    <ul>
      <li>
        <button @click="getData">Get数据</button>
      </li>
      <li>
        <button @click="get404">Get url 404</button>
      </li>
      <li>
        <button @click="postLogin">Post登陆</button>
      </li>
      <li>
        <button @click="postFetchData(false)">Post error headers</button>
      </li>
      <li>
        <button @click="postFetchData(true)">Post用户列表</button>
      </li>
      <li>
        <button @click="form()">form请求</button>
      </li>
      <li>
        <button @click="mockGlobal()">全局mock</button>
      </li>
      <li>
        <button @click="mockStaticFile()">mock静态文件json</button>
      </li>
    </ul>
    <ul>
      <li>
        <div class="fileupload">
          <input
            type="file"
            multiple
            title="请选择文件"
            @click="clearFile($event)"
            @change="postFile($event)"
          >
          <button type="button">选择文件</button>
        </div>
      </li>
      <li>
        <input type="text" v-model="downloadFileName"/>
        <button @click="downloadFile" style="width:100px;height:20px;">下载文件</button>
      </li>
    </ul>
    <div class="progress" v-if="uploadPro>0" :style="{'width':uploadPro+'%'}">{{uploadPro}}%</div>
    <div class="progress" v-if="downloadPro>0" :style="{'width':downloadPro+'%'}">已下载{{downloadPro}}%</div>
    <table>
      <tr v-for="(item,index) in files" :key="index">
        <td>{{item.name}}</td>
        <td>{{item.size}}</td>
        <td>{{item.type}}</td>
        <td>{{item.lastModifiedDate}}</td>
      </tr>
    </table>
  </div>
</template>

<script>
import Vue from "vue";
export default {
  name: "app",
  data() {
    return {
      msg: "Welcome to Your Vue.js App",
      files: [],
      uploadPro: 0,
      downloadPro:0,
      downloadFileName:"LongPathTool(jb51.net).rar"
    };
  },
  mounted() {
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
      instanceId:'12'
    },this)//.send({user:"神你敢信"});
    console.warn("pageInstance",pageInstance)
    this.$socket.send("测试"+new Date(),{
      url:"/websocket"
    }).then((a)=>{
      a.close()
    })

    setTimeout(function(){
      pageInstance.close();
      console.log("closed")
    },30000)
  },
  methods: {
    getData() {
      this.$ajax
        .send({
          url:
            "http://xconsole.rrslj.com/datacenter/userxw/getCenterData?dateFlag=2018-08-10",
          type: "get"
        })
        .then(d => {
          console.log("success1", d, this.msg);
        })
        .catch(d => {
          console.log("error1", d);
        });
    },
    get404() {
      Vue.ajax
        .send({
          url:
            "http://xconsole.rrslj.com/datacenter/userxw/getCenterData2?dateFlag=2018-08-10",
          type: "get"
        })
        .then(d => {
          console.log("success2", d, this.msg);
        })
        .catch(d => {
          console.log("error2", d);
        });
    },
    postLogin() {
      Vue.ajax
        .send({
          url: Vue.ajax.prefix+"/api/user/login",
          type: "post",
          data: { loginName: "shengxp", loginPassword: "123" }
        })
        .then(d => {
          console.log("success post", d, this.msg);
        })
        .catch(d => {
          console.log("error post", d);
        });
    },
    postFetchData(h) {
      Vue.ajax
        .send({
          url: Vue.ajax.prefix+"/api/user/query",
          type: "post",
          headers: h ? { Authorization: "Basic c2hlbmd4cDoxMjM=" } : {},
          data: { keyWord: "管理" }
        })
        .then(d => {
          console.log("success post", d, this.msg);
        })
        .catch(d => {
          console.log("error post", d);
        });
    },
    postFile: function(e) {
      for (var i = 0; i < e.target.files.length; i++) {
        this.files.push(e.target.files[i]);
      }

      console.log(this.files);
      var self = this;
      Vue.ajax
        .send({
          url: Vue.ajax.prefix+"/api/upload",
          type: "post",
          dataType: "formdata",
          headers: { Authorization: "Basic c2hlbmd4cDoxMjM=" },
          data: {
            file: this.files,
            userName: "fileUser上传",
            selected: [1, 4, 199]
          },
          uploadProgress: function(ev) {
            console.log("uploadProgress", ev);
            if (ev.lengthComputable) {
              self.uploadPro = (100 * ev.loaded) / ev.total;
            }
          }
        })
        .then(d => {
          console.log("success file", d, this.msg);
        })
        .catch(d => {
          console.log("error file", d);
        });
    },
    clearFile(e) {
      this.files = [];
      e.target.value = "";
    },
    downloadFile:function(){
      this.downloadPro=0;
      Vue.ajax
        .send({
          url: Vue.ajax.prefix+"/api/download?file={file}",
          type: "get",
          dataType: "formdata",
          headers: { Authorization: "Basic c2hlbmd4cDoxMjM=" },
          data: {
             file:this.downloadFileName
          },
          progress:function(ev){
            console.log("downloading",ev);
            if (ev.lengthComputable) {
                this.downloadPro = (100 * ev.loaded) / ev.total;
            }
          },
          responseType:"blob",
          success:function(d,allData){
            console.log("success download file", d,allData,this.msg);
            console.log(allData.request.getResponseHeader("Content-Disposition"))
            var filename=this.downloadFileName
            if (typeof window.chrome !== 'undefined') {
                // Chrome version
                var link = document.createElement('a');
                link.href = window.URL.createObjectURL(d);
                link.download = filename;
                link.click();
            } else if (typeof window.navigator.msSaveBlob !== 'undefined') {
                // IE version
                var blob = new Blob([d], { type: 'application/force-download' });
                window.navigator.msSaveBlob(blob, filename);
            } else {
                // Firefox version
                var file = new File([d], filename, { type: 'application/force-download' });
                window.open(URL.createObjectURL(file));
            }
          }
        },this)
        .then(d => {
          
        })
        .catch(d => {
          console.log("error download file", d);
        });
    },
    form:function(){
      Vue.ajax
        .send({
          url: "http://localhost:83/disease/section",
          type: "post",
          dataType: "form",
          data: { keyword: "管理",arr:["生",'12f'] },
          // success:function(d){
          //   console.log("success form", d, this.msg);
          // },
          // error:function(d,req){
          //   console.log("error form", d,req);
          // }
        }).then(d => {
          console.log("success file", d, this.msg);
        }).catch(function(e){
          console.log("error2 form", e);
        })
    },
    mockGlobal:function(){
      Vue.ajax
        .send({
          url: "/test/mock001",
          data: { keyword: "管理",arr:["生",'12f'] },
          success:function(d){
            console.log("success mockGlobal", d, this.msg);
          },
          error:function(d,req){
            console.log("error mockGlobal", d,req);
          }
        })
    },
    mockStaticFile:function(){
      Vue.ajax
        .send({
          url: "../static/mock/test.json",
          success:function(d){
            console.log("success mockGlobal", d, this.msg);
          },
          error:function(d,req){
            console.log("error mockGlobal", d,req);
          }
        })
    },
  }
};
</script>

<style>
.fileupload {
  width: 100px;
  height: 50px;
  display: block;
  position: relative;
}
.fileupload input {
  width: 100px;
  height: 50px;
  position: relative;
  z-index: 10;
  opacity: 0;
  cursor: pointer;
}
.fileupload input:hover {
  border:1px solid rgb(134, 119, 98);
}
.fileupload button {
  width: 100px;
  height: 50px;
  position: absolute;
  z-index: 5;
  top: 0;
  left: 0;
  background-color: bisque;
  border:1px solid rgb(248, 195, 122);
}
.fileupload button:hover {
  border:1px solid rgb(134, 119, 98);
}
table td {
  border: 1px solid black;
}
.progress {
  margin-bottom: 10px;
  height: 12px;
  background-color: rgb(20, 199, 80);
  color: black;
  font-size: 10px;
  text-align: center;
  border-radius: 5px;
  transition: width 300ms;
  -moz-transition: width 300ms; /* Firefox 4*/
  -webkit-transition: width 300ms; /* Safari 和 Chrome */
  -o-transition: width 300ms;
}
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

h1,
h2 {
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
