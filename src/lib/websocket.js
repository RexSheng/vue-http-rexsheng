

let socketConfig={
    baseUrl:"",
    timeout:20,
    globalInstances:{

    },
    formatData:function(data,type){
        var type=(type || "").toLowerCase();
        if(type===""){
            if(typeof data ==="string"){
                return data;
            }
            else if(typeof data ==="object"){
                return JSON.stringify(data);;
            }
        }
        else if(type==="json"){
            return JSON.stringify(data);
        }
        else if(type==="text"){
            return data;
        }
        return data;
    }
}
let socketjs=function(sc){
    var scope=sc || this;
    this.socketClientInstance=null;
    var formatOption=function(opt){
        var option=Object.assign({},opt);
        option.onmessage=option.onmessage || function(e){};
        option.onopen=option.onopen || function(){};
        option.onerror=option.onerror || function(e){};
        option.onclose=option.onclose || function(e){};
        option.url=option.baseUrl!=undefined?(option.baseUrl+(option.url || "")):(socketConfig.baseUrl+(option.url || ""));
        option.dataType=option.dataType || "";
        return option;
    }
    var returnObj={
        instance:null,
        send:function(data,opt){
            opt=opt || {}
            if(!opt._resolve){
                var _this=this;
                return new Promise(function(resolve,reject){
                    opt._resolve=resolve;
                    opt._reject=reject;
                    _this.send(data,opt);
                })
            }
            if (this.instance.readyState === 1) {
                // 若是ws开启状态0,
                if (this.instance.bufferedAmount == 0){
                    var newData=null;
                    if(opt.format){
                        newData=opt.format(data,opt.dataType);
                    }
                    else{
                        newData=socketConfig.formatData(data,opt.dataType);
                    }
                    this.instance.send(newData);
                    if(opt._resolve){
                        opt._resolve(this);
                    }
                }
                else{
                    var _this=this;
                    setTimeout(function () {
                        _this.send(data,opt);
                    }, socketConfig.timeout)
                }
                
              } else if (this.instance.readyState === 0) {
                // 若是 正在开启状态1，则等待20ms后重新调用
                var _this=this;
                setTimeout(function () {
                    _this.send(data,opt);
                }, socketConfig.timeout)
              } else {
                // 若正在关闭2，已关闭3 ，则等待20ms后重新调用
                var _this=this;
                setTimeout(function () {
                    _this.send(data,opt);
                }, socketConfig.timeout)
              } 
        },
        close:function(){
            this.instance.close();
            if(this.instance._instanceId){
                delete socketConfig.globalInstances[this.instance._instanceId]
            }
        },
    }
    
    this.send=function(opt){
        var option=formatOption(opt);
        if(option.instanceId){
            var old=socketConfig.globalInstances[option.instanceId]
            if(old){
                return old;
            }
        }
        this.socketClientInstance = new WebSocket(option.url);        
        this.socketClientInstance.onmessage = function(e){
            option.onmessage.call(scope,e);
        };        
        this.socketClientInstance.onopen = function(e){
            option.onopen.call(scope,e);
        };        
        this.socketClientInstance.onerror= function(e){
            option.onerror.call(scope,e);
        };              
        this.socketClientInstance.onclose = function(e){
            option.onclose.call(scope,e);
        };
        returnObj.instance=this.socketClientInstance;
        if(option.instanceId){
            this.socketClientInstance._instanceId=option.instanceId;
            socketConfig.globalInstances[option.instanceId]=returnObj;
        }
       return returnObj.send(option.data,option);
        // var result=new Promise(function(resolve,reject){
        //     option._resolve=resolve;
        //     option._reject=reject;
        //     returnObj.send(option.data,option);
        // })
        // if(option.instanceId){
        //     this.socketClientInstance._instanceId=option.instanceId;
        //     socketConfig.globalInstances[option.instanceId]=result;
        // }
        // return result;
    }
    this.listen=function(opt){
        var option=formatOption(opt);
        if(option.instanceId){
            var old=socketConfig.globalInstances[option.instanceId]
            if(old){
                return old;
            }
        }
        this.socketClientInstance = new WebSocket(option.url);        
        this.socketClientInstance.onmessage = function(e){
            option.onmessage.call(scope,e);
        };        
        this.socketClientInstance.onopen = function(e){
            option.onopen.call(scope,e);
        };        
        this.socketClientInstance.onerror= function(e){
            option.onerror.call(scope,e);
        };              
        this.socketClientInstance.onclose = function(e){
            option.onclose.call(scope,e);
        };
        var _this=this;
        window.addEventListener("beforeunload", function(event) {
            _this.close();
        });
        returnObj.instance=this.socketClientInstance;
        if(option.instanceId){
            socketConfig.globalInstances[option.instanceId]=returnObj;
        }
        return returnObj;     
    }
    this.close=function(){
        if(this.socketClientInstance!=null){
            this.socketClientInstance.close();
        }
    }
}
export default socketjs;
export {socketConfig};