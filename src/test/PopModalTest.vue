<template>
    <div>
        <input type='text' v-model="info"/>
        请输入内容 
        <div>
        <button type="button" @click="confirm">确定</button>
        </div>
    </div>
</template>
<script>
import Vue from 'vue'
export default {
    name:"modalTest",
    props:{
        params:{

        }
    },
    data(){
        return{
            info:this.params.firstInput
        }
    },
    created(){
        console.log(this.params.firstInput)
    },
    methods:{
        confirm(){
            this.$emit("close",this.info)
        }
    }
}
</script>
