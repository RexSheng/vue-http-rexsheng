import wsPlugin from './websocket'
import {socketConfig} from './websocket'
import ajaxPlugin from './ajax'
import {AJAXCONF} from './ajax'
import randomPlugin from './random'
// import _vue_ from 'vue'
var rexShengPlugin = {}
rexShengPlugin.config = {}

var ajaxBody={
    send:function(config,scope) {
        // 逻辑...
        return new ajaxPlugin.xmlHttpRequest(scope).send(config);
    },
    interceptors:{
        setRequest:function(fn){
            AJAXCONF.queue.requestInterceptorQueue["0"]=fn;
        },
        setResponse:function(fn){
            AJAXCONF.queue.responseInterceptorQueue["0"]=fn;
        },
        addRequest:function(fn,order){
            if(order==undefined || order==null){
                AJAXCONF.queue.requestInterceptorQueue["0"]=fn;
            }
            else{
                AJAXCONF.queue.requestInterceptorQueue[order]=fn;
            }
            
        },
        addResponse:function(fn,order){
            if(order==undefined || order==null){
                AJAXCONF.queue.responseInterceptorQueue["0"]=fn;
            }
            else{
                AJAXCONF.queue.responseInterceptorQueue[order]=fn;
            }
        }
    },
    config:{
        get baseUrl(){
            return AJAXCONF.baseUrl;
        },
        set baseUrl(value){
            AJAXCONF.baseUrl=value;
        },
        get jsonp(){
            return AJAXCONF.jsonp.callbackName;
        },
        set jsonp(value){
            AJAXCONF.jsonp.callbackName=value;
        },
        // get jsonpCallback(){
        //     return AJAXCONF.jsonp.callbackFunction;
        // },
        // set jsonpCallback(value){
        //     AJAXCONF.jsonp.callbackFunction=value;
        // },
        get mockMode(){
            return AJAXCONF.mockMode;
        },
        set mockMode(value){
            AJAXCONF.mockMode=value;
        },
        get default(){
            return AJAXCONF.userDefaultConfig();
        },
        set default(value){
            if(Object.prototype.toString.call(value) === '[object Function]'){
                AJAXCONF.userDefaultConfig=value;
            }
            else{
                AJAXCONF.userDefaultConfig=function(option){return value};
            }
            
        },
        set successStatus(fn){
            AJAXCONF.successStatus=fn;
        },
        set missingMockCallback(fn){
            AJAXCONF.missingMockCallback=fn;
        },
        get timeout(){
            return AJAXCONF.timeout;
        },
        set timeout(value){
            AJAXCONF.timeout=value;
        },
        get mockStrategy(){
            return AJAXCONF.mockStrategy;
        },
        set mockStrategy(value){
            AJAXCONF.mockStrategy=value;
        },
    },
    addMock:function(){
        if(arguments.length==3){
            AJAXCONF.mockCache["@"+arguments[1]+":"+arguments[0]]=arguments[2];
        }
        else if(arguments.length==2){
            AJAXCONF.mockCache[arguments[0]]=arguments[1];
        }
        else if(arguments.length==1){
            for(var key in arguments[0]){
                AJAXCONF.mockCache[key]=arguments[0][key];
            }
        }
        
    },
    mock:function(param){
        return new randomPlugin().handle(param);
    }
}

new Array("get","post","put","delete","patch","options","head").forEach(function(type){
    ajaxBody[type]=function(){
         //1个参数url
		 
		 //2个参数url,data
		 //2个参数url,success
		 
		 //3个参数url,data,option
		 //3个参数url,data,success
		 //3个参数url,success,error
         
         //4个参数url,data,option,success
		 //4个参数url,data,option,scope
		 //4个参数url,data,success,error
		 //4个参数url,data,success,scope
        
         //5个参数url,data,option,success,error
		 //5个参数url,data,option,success,scope
		 //5个参数url,data,success,error,scope
		 		 
         //6个参数url,data,option,success,error,scope
        var args=arguments;
        var newOption={};
        var scope=null;
        if(args.length==1){
            newOption.url=args[0];
        }
        else if(args.length==2){
            newOption.url=args[0];
            if(Object.prototype.toString.call(args[1]) === '[object Object]'){
                newOption.data=args[1];
            }
            else if(Object.prototype.toString.call(args[1]) === '[object Function]'){
                newOption.success=args[1];
            }
        }
        else if(args.length==3){
            newOption.url=args[0];
            if(Object.prototype.toString.call(args[1]) === '[object Object]'){
                newOption.data=args[1];
                if(Object.prototype.toString.call(args[2]) === '[object Object]'){
                    newOption=Object.assign({},newOption,args[2]);
                }
                else if(Object.prototype.toString.call(args[2]) === '[object Function]'){
                    newOption.success=args[2];
                }
            }
            else if(Object.prototype.toString.call(args[1]) === '[object Function]'){
                newOption.success=args[1];
                if(Object.prototype.toString.call(args[2]) === '[object Function]'){
                    newOption.error=args[2];
                }
            }
        }
        else if(args.length==4){
            newOption.url=args[0];
            if(Object.prototype.toString.call(args[1]) === '[object Object]'){
                newOption.data=args[1];
                if(Object.prototype.toString.call(args[2]) === '[object Object]'){
                    newOption=Object.assign({},newOption,args[2]);
                    if(Object.prototype.toString.call(args[3]) === '[object Function]'){
                        newOption.success=args[3];
                    }
                    else{
                        scope=args[3];
                    }
                }
                else if(Object.prototype.toString.call(args[2]) === '[object Function]'){
                    newOption.success=args[2];
                    if(Object.prototype.toString.call(args[3]) === '[object Function]'){
                        newOption.error=args[3];
                    }
                    else{
                        scope=args[3];
                    }
                }
            }
        }
        else if(args.length==5){
            newOption.url=args[0];
            if(Object.prototype.toString.call(args[1]) === '[object Object]'){
                newOption.data=args[1];
                if(Object.prototype.toString.call(args[2]) === '[object Object]'){
                    newOption=Object.assign({},args[2],newOption);
                    if(Object.prototype.toString.call(args[3]) === '[object Function]'){
                        newOption.success=args[3];
                        if(Object.prototype.toString.call(args[4]) === '[object Function]'){
                            newOption.error=args[4];
                        }
                        else{
                            scope=args[3];
                        }
                    }
                }
                else if(Object.prototype.toString.call(args[2]) === '[object Function]'){
                    newOption.success=args[2];
                    if(Object.prototype.toString.call(args[3]) === '[object Function]'){
                        newOption.error=args[3];
                        scope=args[4];
                    }
                }
            }
        }
        else if(args.length==6){
            newOption.url=args[0];
            if(Object.prototype.toString.call(args[1]) === '[object Object]'){
                newOption.data=args[1];
                if(Object.prototype.toString.call(args[2]) === '[object Object]'){
                    newOption=Object.assign({},args[2],newOption);
                    if(Object.prototype.toString.call(args[3]) === '[object Function]'){
                        newOption.success=args[3];
                        if(Object.prototype.toString.call(args[4]) === '[object Function]'){
                            newOption.error=args[4];
                            scope=args[5];
                        }
                    }
                }
            }
        }
        return new ajaxPlugin.xmlHttpRequest(scope).send(newOption);
    }
})
var wsBody={
    listen:function(option,sc){
        return new wsPlugin(sc).listen(option);
    },
    send:function(){
        if(!arguments.length || !arguments[0]) return null;
        if(arguments.length==3){
            if(typeof arguments[1]==="string"){
                return new wsPlugin(arguments[2]).send({url:arguments[1],data:arguments[0]});
            }
            else{
                var option=arguments[1]
                option.data=arguments[0]
                return new wsPlugin(arguments[2]).send(option);
            }
        }
        else if(arguments.length==2){
            if(typeof arguments[1]==="string"){
                var option={
                    data:arguments[0],
                    url:arguments[1]
                }
                return new wsPlugin(this).send(option);
            }
            else{
                var option=arguments[1]
                option.data=arguments[0]
                return new wsPlugin(this).send(option);
            }
        }
        else if(arguments.length==1){
            if(typeof arguments[0]==="string"){
                var option={
                    data:arguments[0],
                }
                return new wsPlugin(this).send(option);
            }
            else{
                return new wsPlugin(this).send(arguments[0]);
            }
        }
        
    },
    config:{
        get baseUrl(){
            return socketConfig.baseUrl;
        },
        set baseUrl(value){
            socketConfig.baseUrl=value;
        },
        get reconnectTimeout(){
            return socketConfig.timeout;
        },
        set reconnectTimeout(value){
            socketConfig.timeout=value;
        }
    }
};
rexShengPlugin.install = function(Vue, options={}) {
    /**
     * author:RexSheng
     * date:2018/11/06
     */
    AJAXCONF.instanceName=options.instanceName || AJAXCONF.instanceName;
    AJAXCONF.mockInstanceName=options.mockInstanceName || AJAXCONF.mockInstanceName;
    AJAXCONF.wsInstanceName=options.wsInstanceName || AJAXCONF.wsInstanceName;
    AJAXCONF.VueGlobalInstanceName=AJAXCONF.instanceName.replace(/\$/g,'');//全局替换
    AJAXCONF.WSGlobalInstanceName=AJAXCONF.wsInstanceName.replace(/\$/g,'');//全局替换
    AJAXCONF.successFormatCallback=options.successFormat || options.resultFormat || AJAXCONF.successFormatCallback;//返回数据的格式化
    AJAXCONF.errorFormatCallback=options.errorFormat || options.resultFormat || AJAXCONF.errorFormatCallback;
    AJAXCONF.userDefaultConfig=function(){return Object.assign({},options.defaultConfig || {},AJAXCONF.userDefaultConfig());}
    // if (!Vue) {
	// 	//
	// 	window.Vue=Vue=_vue_;
	// }
    Vue[AJAXCONF.VueGlobalInstanceName]=Vue.prototype[AJAXCONF.instanceName]=ajaxBody
    
    Vue[AJAXCONF.VueGlobalInstanceName+"Success"] = function(data, message) {
        return AJAXCONF.successFormatCallback.call(this,arguments);
    }
    Vue[AJAXCONF.VueGlobalInstanceName+"Error"] = function(message) {
        return AJAXCONF.errorFormatCallback.call(this,arguments);
    }

    Vue[AJAXCONF.WSGlobalInstanceName]= Vue.prototype[AJAXCONF.wsInstanceName]=wsBody
	
	
}
rexShengPlugin[AJAXCONF.VueGlobalInstanceName]=ajaxBody;
rexShengPlugin[AJAXCONF.WSGlobalInstanceName]=wsBody;

if (typeof window !== 'undefined' && window.Vue) {
    Vue[AJAXCONF.VueGlobalInstanceName]=Vue.prototype[AJAXCONF.instanceName]=ajaxBody;
    Vue[AJAXCONF.WSGlobalInstanceName]=Vue.prototype[AJAXCONF.wsInstanceName]=wsBody;
}  
// _vue_[AJAXCONF.VueGlobalInstanceName]=_vue_.prototype[AJAXCONF.instanceName]=ajaxBody;
// _vue_[AJAXCONF.WSGlobalInstanceName]=_vue_.prototype[AJAXCONF.wsInstanceName]=wsBody;
export default rexShengPlugin;


            // if (opt.timeout) {
            //     var timeoutRequest = new Promise(function(resolve, reject) {
            //         setTimeout(function() {
            //             if (!request._complete) {
            //                 request.abort();
            //                 reject(["timeout-" + opt.timeout, request]);
            //             }
            //             // setTimeout(function() {
            //             //     request.abort();
            //             // }, 0)
            //             // reject(["timeout-" + opt.timeout, request]);
            //         }, opt.timeout)
            //     });
            //     return Promise.race([currentRequest, timeoutRequest]);
            // }