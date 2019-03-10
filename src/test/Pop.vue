<template>
  <div>
    <h3>{{title}}</h3>
    <button type="button" @click="showAlert">Alert</button>
    <input type="checkbox" v-model="checked">
    <button type="button" @click="showConfirm">Confirm</button>
    <button type="button" @click="showHtmlConfirm">HtmlConfirm</button>
    <button type="button" @click="asyncConfirm">asyncConfirm</button>
    <button type="button" @click="showModal">showModal</button>
  </div>
</template>
<script>
import PopModalTest from "./PopModalTest";
export default {
  data() {
    return {
      title: "弹框测试页面",
      checked: true
    };
  },
  mounted() {},
  methods: {
    showAlert() {
      this.$dialog.alert("内容", "大标题", {
        showCloseBtn: this.checked
      });
    },
    showConfirm() {
      this.$dialog.confirm("内容", "大标题", {
        onConfirm: function() {
          this.$dialog.alert(
            "第二个框1第二个弹框1第二个弹框1第二个弹框1第二个弹框1第二个弹框1第二个弹框1第二个弹框1第二个弹框1第二个弹框1第二个弹框1第二个弹框1第二个弹框1第二个弹框1第二个弹框1第二个弹框1第二个弹框1第二个弹框1第二个弹框1弹框1第二个弹框1第二个弹框1第二个弹框1第二个弹框1第二个弹框1第二个弹框1第二个弹框1第二个弹框1第二个弹框1第二个弹框1第二个弹框1第二个弹框1第二个第二个框1第二个弹框1第二个弹框1第二个弹框1第二个弹框1第二个弹框1第二个弹框1第二个弹框1第二个弹框1第二个弹框1第二个弹框1第二个弹框1第二个弹框1第二个弹框1第二个弹框1第二个弹框1第二个弹框1第二个弹框1第二个弹框1弹框1第二个弹框1第二个弹框1第二个弹框1第二个弹框1第二个弹框1第二个弹框1第二个弹框1第二个弹框1第二个弹框1第二个弹框1第二个弹框1第二个弹框1第二个弹框1第二个弹框1第二个弹框1第二个弹框1第二个弹框1第二个弹框1第二个弹框1vddd弹框1第二个弹框1第二个弹框1第二个弹框1第二个弹框1第二个弹框1第二个弹框1vddd",
            "第二个标题",
            { width: "large" }
          );
        },
        onCancel() {
          this.$dialog.alert(
            "如今的屏幕分辨率，小至320px（iPhone），大到2560px甚至更高（大显示器），变化范围极大。",
            {
              width: "small",
              showCloseBtn: true,
              type: "error",
              showIcon: false
            }
          );
        }
      });
    },
    showHtmlConfirm() {
      this.$dialog.confirm("<span style='color:red;'>你好</span>", {
        onConfirm: () => {
          console.log("close1", this.tempData);
          // return false;
          // res(false)
          // setTimeout(()=>{
          //   res(true)
          // },1000)
          this.$dialog.alert("click ok", "", { type: "success" });
        },
        onCancel: () => {
          this.$dialog.alert("click cancel", "", { type: "warn" });
        }
      });
    },
    asyncConfirm: function() {
      this.$dialog.confirm("<span style='color:red;'>你好</span>", {
        onConfirm: cb => {
          setTimeout(() => {
            cb(true);
          }, 2000);
        }
      });
    },
    showModal: function() {
      this.$dialog.modal({
        component: PopModalTest,
        title: "标题22",
        showCloseBtn: this.checked,
        width: "1000px",
        params:{firstInput:"初始值"},
        callback: p => {
          console.log("return:", p,this.title);
          this.$dialog.alert("输入了："+p, { type: "error" });
        }
      });
    }
  }
};
</script>
