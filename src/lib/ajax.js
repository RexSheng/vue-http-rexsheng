import randomPlugin from './random'
import {queue} from './queue'
/**
 * author:RexSheng
 * date:2018/11/06
 */
let defaultFormatCallback=function(d){return d.data;};
let STRATEGY={
    LOCAL_GLOBAL:0,//局部配置优先，全局次之
    GLOBAL_LOCAL:1,//全局配置优先，局部次之
}
let AJAXCONF={
    instanceName:"$ajax",
    mockInstanceName:"$mock",
    wsInstanceName:"$socket",
    VueGlobalInstanceName:"$ajax".replace(/\$/g,''),
    WSGlobalInstanceName:"$socket".replace(/\$/g,''),
    successFormatCallback:defaultFormatCallback,
    errorFormatCallback:defaultFormatCallback,
    userDefaultConfig:function(option){return {}},
    successStatus:function(status){return status===200;},
    missingMockCallback(option){
        //false： 缺失mock配置时，不使用mock，使用真实url请求
        return false; 
        //true: 缺失mock配置时，会error终止
        //return true;
    },
    baseUrl:"",
    jsonp:{
        callbackName:"callback",
        callbackFunction:null
    },
    mockCache:{},
    mockMode:false,
    /**
     * global:全局配置为主，忽略局部配置
     * scope：局部配置为主
     */
    mockStrategy:"scope",
    timeout:null,
    queue:{
        requestInterceptorQueue:{
            "0":function(opt,req){return opt;}
        },
        responseInterceptorQueue:{
            "0":function(res,req){return res;}
        },
    },
    
}
// let defaultFormatCallback=function(d){return d.data;};
// let successFormatCallback=options.successFormat || options.resultFormat || defaultFormatCallback;//返回数据的格式化
// let errorFormatCallback=options.errorFormat || options.resultFormat || defaultFormatCallback;
// let userDefaultConfig=options.defaultConfig || {};
// let requestInterceptor=function(d){return d;};
// let responseInterceptor=function(res){return res;};
// let baseUrl="";
// let mockCache={};
// let mockMode=false;

let ajax = {
    xmlHttpRequest:function(sc) {
        this.instance = null;
        this.scope = sc || this;
        this.mockInstance=null;
        this.createInstance = function() {
            if (window.XMLHttpRequest) { // code for all new browsers
                this.instance = new XMLHttpRequest();
            } else if (window.ActiveXObject) { // code for IE5 and IE6
                this.instance = new ActiveXObject("Microsoft.XMLHTTP");
            }
            return this.instance;
        };
        this.defaultConfig = {
            async: true,
            type: "GET",
            data: null,
            dataType: "json"
        };
        this.isNull=function(p){
            return p===undefined || p===null;
        };
        this.isMock=function(option){
            if((AJAXCONF.mockStrategy==="scope" || (AJAXCONF.mockStrategy==="global" && AJAXCONF.mockMode===true)) 
                && (option.mockMode==undefined || option.mockMode===true) ){
                var useMock=AJAXCONF.mockMode;
                //strict
                if(option.mockMode===true){
                    useMock=true;
                }
                this.mockInstance=AJAXCONF.mockCache["@"+option.type.toLowerCase()+":"+option.url];            
                if(option.mock!==undefined && option.mock!==null){
                    if(option.mock===true){
                        //启用mock
                        useMock=true;
                        if(this.isNull(this.mockInstance)){
                            this.mockInstance=AJAXCONF.mockCache[option.url];
                            if(this.isNull(this.mockInstance)){
                                useMock=false;
                            }
                        }
                    }
                    if(Object.prototype.toString.call(option.mock) === '[object Function]'){
                        //启用mock
                        useMock=true;
                        this.mockInstance=option.mock;
                    }
                    if(Object.prototype.toString.call(option.mock) === '[object String]'){
                        //指向文件地址，不启用mock
                        useMock=false;
                        option.url=option.mock;
                        option.type="GET";
                    }
                    if(Object.prototype.toString.call(option.mock) === '[object Object]'){
                        //不启用mock
                        useMock=false;
                        this.mockInstance=option.mock;
                    }
                }
                else{
                    //全局使用mock，但是未配置实现方法，设置useMock=false,会直接默认请求option.url
                    if(useMock){
                        if(this.isNull(this.mockInstance)){
                            this.mockInstance=AJAXCONF.mockCache[option.url];
                            if(this.isNull(this.mockInstance)){
                                useMock=AJAXCONF.missingMockCallback(option);
                            }
                        }
                    }
                }
                if(useMock && (Object.prototype.toString.call(this.mockInstance) === '[object String]')){
                    useMock=false;
                    option.url=this.mockInstance;
                    option.type="GET";
                }
                if(Object.prototype.toString.call(this.mockInstance) === '[object Object]'){
                    option=Object.assign(option,this.mockInstance);
                    option.mock=true;
                    return this.isMock(option);
                }
                if(option.url.substr(0,5)==="@get:"){
                    option.url=option.url.substr(5);
                }
                else if(option.url.substr(0,6)==="@post:"){
                    option.url=option.url.substr(6);
                }
                else if(option.url.substr(0,8)==="@delete:"){
                    option.url=option.url.substr(8);
                }
                else if(option.url.substr(0,5)==="@put:"){
                    option.url=option.url.substr(5);
                }
                else if(option.url.substr(0,6)==="@patch:"){
                    option.url=option.url.substr(7);
                }
                else if(option.url.substr(0,6)==="@head:"){
                    option.url=option.url.substr(6);
                }
                else if(option.url.substr(0,6)==="@options:"){
                    option.url=option.url.substr(9);
                }
                return useMock;
            }
            else {
                return false; 
            }
            
        };
        this.interceptorQueue=function(methods, option, scope,req){
            var i = 0, j = methods.length - 1;
            var internalPromise = function (methods, option, scope,req, i, j) {
                return new Promise(function (resolve, reject) {
                    Promise.resolve(methods[i].call(scope, option,req)).then(d => {
                        if (i < j) {
                            i++;
                            resolve(internalPromise(methods, d, scope,req, i, j));
                        }
                        else {
                            resolve(d);
                        }
                    }).catch(e => {
                        reject(e);
                    })
                });
            }
            return internalPromise(methods, option, scope,req, i, j);
        }
        this.getAllRequestInterceptors=function(scope,option,req){
            var keys=Object.keys(AJAXCONF.queue.requestInterceptorQueue);
            keys.sort(function(a,b){
                return parseInt(a)-parseInt(b)
            })
            var methods=keys.map(key=>AJAXCONF.queue.requestInterceptorQueue[key])
            return this.interceptorQueue(methods,option,scope,req);
        },
        this.getAllResponseInterceptors=function(scope,option,req){
            var keys=Object.keys(AJAXCONF.queue.responseInterceptorQueue);
            keys.sort(function(a,b){
                return parseInt(a)-parseInt(b)
            })
            var methods=keys.map(key=>AJAXCONF.queue.responseInterceptorQueue[key])
            return this.interceptorQueue(methods,option,scope,req);
        }
        this.globalTransformOption=function(opt){
            if (opt.dataType.toLowerCase() === 'formdata') {
                if (opt.data != null && Object.prototype.toString.call(opt.data) !=='[object FormData]') {
                    var formData = new FormData();
                    Object.keys(opt.data).forEach(key => {
                        if (opt.data[key].constructor === Array || opt.data[key].constructor === FileList) {
                            for (var i = 0; i < opt.data[key].length; i++) {
                                var subItem = opt.data[key][i];
                                if (subItem.constructor == Object) {
                                    Object.keys(subItem).forEach(subKey => {
                                        formData.append(key + (i==0?"":"[" + i + "]")+"[" + subKey + "]", subItem[subKey]);
                                    });
                                } else {
                                    formData.append(key + (i==0?"":"[" + i + "]"), subItem);
                                }
                            }
                        } else {
                            formData.append(key, opt.data[key]);
                        }
                    });
                    opt.data = formData;
                }
            }
            if (opt.dataType.toLowerCase() === 'form') {
                if (opt.data != null) {
                    var formData = '';
                    for (let it in opt.data) {
                        formData += encodeURIComponent(it) + '=' + encodeURIComponent(opt.data[it]) + '&'
                    }
                    if(formData.length>0){
                        opt.data = formData.substr(0,formData.length-1);
                    }
                }
            }
            if (opt.dataType.toLowerCase() === 'json' && opt.data) {
                opt.data = JSON.stringify(opt.data);
            }
        };
        /**
         * 格式化Url（替换占位符）
         *
         * @param {String} url,如/user/{userId}
         * @param {Object} data,如{userId:3}
         * @return {String} 如 /user/3
         */
        this.formatUrl = function(url, data,opt) {
            if (!url) return null;
            var keys = url.match(/\{\w+\}/g);
            keys = (keys === null) ? [] : keys;
            if (keys) {
                if(keys.length>0){
                    keys.forEach(function(key) {
                        var rawKey = key.substr(1, key.length - 2);
                        var replace;
                        if (data===undefined || data===null || data[rawKey]===undefined || data[rawKey]===null) {
                            replace = '';
                        } else {
                            replace = data[rawKey];
                        }
                        url = url.replace(new RegExp(key, 'g'), replace);
                    });
                }
                else{
                    //url中不包含{}
                    if(opt.type.toLowerCase()==="get" || opt.type.toLowerCase()==="delete" || this.isJsonp(opt)){
                        if (data===undefined || data===null) {
                            return url;
                        } else {
                            var newData=null;
                            if(Object.prototype.toString.call(data) ==='[object Array]'){
                                newData={};
                                for(var i=0;i<data.length;i++){
                                    newData[i]=data[i];
                                }
                            }
                            else if(Object.prototype.toString.call(data) ==='[object Object]'){
                                newData=data;
                            }
                            if(newData!==null){
                                var firstUrl=url.indexOf("?")>-1?url.substr(0,url.indexOf("?")):url;
                                //有旧数据则合并
                                if(url.indexOf("?")>-1){
                                    var lastUrl=url.substr(url.indexOf("?")+1);
                                    var strs = lastUrl.trim()==""?[]:lastUrl.split("&");
                                    var oldData={}
                                    url=firstUrl+"?"
                                    var oldKeys=[];
                                    for(var i = 0; i < strs.length; i ++) {
                                        var key=strs[i].split("=")[0];
                                        oldKeys.push(key)
                                        if(Object.keys(newData).indexOf(key)<0){
                                            //将新数据合并到旧数据上
                                            url+=key+"="+(strs[i].split("=").length>1?strs[i].split("=")[1]:"")+"&";
                                        }
                                        else{
                                            //将新数据合并到旧数据上
                                            url+=key+"="+encodeURIComponent(newData[key]==null?"":newData[key])+"&";
                                        }
                                    }
                                    Object.keys(newData).forEach(key=>{
                                        if(oldKeys.indexOf(key)<0){
                                            url+=key+"="+encodeURIComponent(newData[key]==null?"":newData[key])+"&";
                                        }
                                    });
                                }
                                else{
                                    url=firstUrl+"?"
                                    Object.keys(newData).forEach(key=>{
                                        url+=key+"="+encodeURIComponent(newData[key]==null?"":newData[key])+"&";
                                    });
                                }
                                
                                if(url.endsWith("&")){
                                    url=url.substr(0,url.length-1);
                                }
                            }
                        }
                       
                    }
                }
                
            }
            return url;
        };
        this.formatResult=function(scope,data,req,config,success){
            var headers={};
            if(req && req.getAllResponseHeaders){
                req.getAllResponseHeaders().trim().split(/[\r\n]+/).forEach(item=>{
                    var parts=item.split(": ")
                    var header = parts.shift();
                    var value = parts.join(': ');
                    headers[header]=value;
                })
            }
            var d={
                data:data,
                status:req.status,
                statusText:req.statusText,
                headers:headers,
                config:config,
                request:req
            }
            var _this_=this
            return new Promise((res,rej)=>{
                _this_.getAllResponseInterceptors(scope,d,req).then(rlt=>{
                    if(success){
                        res([AJAXCONF.successFormatCallback(rlt),d]) ;
                    }
                    else{
                        res([AJAXCONF.errorFormatCallback(rlt),d]) ;
                    }
                }).catch(err=>{
                    rej([err,d]) ;
                });
            });
            
        },
        this.mock=function(option,scope){
            var instance=this.mockInstance;
            return new Promise(function(resolve, reject) {
                try {
                    if(instance==null){
                        if(option.error){
                            option.error.call(scope,"mock未定义:"+option.url);
                        }
                        reject("mock未定义:"+option.url)
                        return;
                    }
                    new Promise(function(res,rej){
                        var dd=instance.call(scope, option.data,option,res, rej);
                        // var dd=new randomPlugin().handle(dj);
                        res(dd);
                    }).then(function(dd){
                        if(option.success){
                            option.success.call(scope,dd);
                        }
                        resolve(dd);
                    }).catch(function(ee){
                        if(option.error){
                            option.error.call(scope,ee);
                        }
                        reject(ee);
                    })
                    
                } catch (err) {
                    if(option.error){
                        option.error.call(scope,d);
                    }
                    reject(err);
                }
            });
        },
        this.isJsonp=function(option){
            return option.dataType.toLowerCase()==="jsonp";
        },
        this.jsonp=function(option,scope){
            var _this_=this;
            return new Promise(function(resolve,reject){
                var callbackName = option.jsonp || AJAXCONF.jsonp.callbackName
                var callbackFunction = option.jsonpCallback || 'jsonp_' + _this_.getRandomJsonpCallbackStr();
                var newData=option.data || {}
                newData[callbackName]=callbackFunction;
                option.url = _this_.formatUrl(option.url, newData,option);
                delete option.jsonp;
                delete option.jsonpCallback;

                var timeoutTimer = null
                if (option.timeout!==undefined && option.timeout!==null) {
                    timeoutTimer = setTimeout(function () {
                        removeErrorListener()
                        headNode.removeChild(paddingScript)
                        delete window[callbackFunction]
                        // reject({ statusText: 'Request Timeout', status: 408 })
                        _this_.formatResult(scope,{ statusText: 'Request Timeout', status: 408 }, null,option,false).then(dd=>{
                            if(option.error){
                                option.error.apply(scope,dd);
                            }
                            reject(dd[0]);
                        }).catch(ee=>{
                            if(option.error){
                                option.error.apply(scope,ee);
                            }
                            reject(ee[0]);
                        })
                      }, option.timeout)
                }
                // Create global function.
                window[callbackFunction] = function (json) {
                    clearTimeout(timeoutTimer)
                    removeErrorListener()
                    headNode.removeChild(paddingScript)
                    _this_.formatResult(scope,json, { statusText: 'Success', status: 200 },option,true).
                        then(dd=>{
                            if(option.success){
                                option.success.apply(scope,dd);
                            }
                            resolve(dd[0]);
                        }).
                        catch(ee=>reject(ee[0]))
                    delete window[callbackFunction]
                }

                var headNode = document.querySelector('head')
                var paddingScript = document.createElement('script');
                
                // Add error listener.
                paddingScript.addEventListener('error', onError)

                // Append to head element.
                paddingScript.src = option.url
                headNode.appendChild(paddingScript)

                /**
                 * Padding script on-error event.
                 * @param {Event} event
                 */
                function onError (event) {
                    removeErrorListener()
                    clearTimeout(timeoutTimer);
                    _this_.formatResult(scope,event, { statusText: 'Bad Request', status: 400 },option,false).then(dd=>{
                        if(option.error){
                            option.error.apply(scope,dd);
                        }
                        reject(dd[0]);
                    }).catch(ee=>{
                        if(option.error){
                            option.error.apply(scope,ee);
                        }
                        reject(ee[0]);
                    })
                    delete window[callbackFunction]
                }

                /**
                 * Remove on-error event listener.
                 */
                function removeErrorListener () {
                    paddingScript.removeEventListener('error', onError)
                }
            });
        },
        this.getRandomJsonpCallbackStr=function(){
            return (Math.floor(Math.random() * 100000) * Date.now()).toString(16)
        }
        /**
         * author:RexSheng
         * date:2018/11/06
         * 
         * config={
         * type:"GET",//get,post,delete,put
         * url:"http://www.baidu.com/user/23",
         * async:true,
         * headers:{"Content-type":"application/json;charset=UTF-8"},
         * timeout:10000//超时时间毫秒
         * withCredentials:true//跨域响应设置cookie，默认false
         * formData:true//使用formdata表单发送数据，通常用于文件上传
         * data:Object/Array //请求发送的数据
         * dataType:"json"//表明要发送的数据格式，
         * responseType:""//返回的数据类型"","json","blob","text","arraybuffer","document"
         * transform:function(data){}//自定义格式化数据
         * loadstart:function(){}//请求开始时的事件，
         * ontimeout:function(d){}//超时事件
         * onprogress:function(d){}//进度事件
         * onloadend:function(d){}//请求结束事件
         * cancel:function(cb){}//取消请求函数，若要取消该请求时在函数内部调用cb()来执行取消
         * }
         */
        
        this.send = function(config) {
            var scope=this.scope;
            var formatResult=this.formatResult;
            var opt=Object.assign(this.defaultConfig,AJAXCONF.userDefaultConfig(config), config);
            if(this.isMock(opt)){
                return this.mock(opt,scope);
            }
            else if(this.isJsonp(opt)){
                return this.jsonp(opt,scope);
            }
            var request = this.createInstance();
            opt.url = this.formatUrl(opt.url, opt.data,opt);
            if(opt.baseUrl!==undefined && opt.baseUrl===false){
                request.open(opt.type, opt.url, opt.async);
            }
            else if(opt.baseUrl!==undefined && opt.baseUrl!==false){
                request.open(opt.type, opt.baseUrl+(opt.url || ""), opt.async);
            }
            else{
                request.open(opt.type, AJAXCONF.baseUrl+opt.url, opt.async);
            }
            
            //加入header
            if (opt.headers) {
                Object.keys(opt.headers).forEach(item => {
                    if(item.toLowerCase()==="content-type"){
                        //用户无设置自定义header
                        if (opt.dataType.toLowerCase() === 'json') {
                            request.setRequestHeader("Content-type", "application/json;charset=UTF-8");
                        } 
                        else if (opt.dataType.toLowerCase() === 'form') {
                            request.setRequestHeader("Content-type", "application/x-www-form-urlencoded;charset=UTF-8");
                        }
                        else{
                            request.setRequestHeader(item, opt.headers[item]);
                        }
                    }
                    else{
                        request.setRequestHeader(item, opt.headers[item]);
                    }
                    
                });
            }
            else{
                //用户无设置自定义header
                if (opt.dataType.toLowerCase() === 'json') {
                    request.setRequestHeader("Content-type", "application/json;charset=UTF-8");
                } 
                else if (opt.dataType.toLowerCase() === 'form') {
                    request.setRequestHeader("Content-type", "application/x-www-form-urlencoded;charset=UTF-8");
                }else {}
            }
            
            if(opt.responseType!=null){
                request.responseType=opt.responseType;
            }
            if (opt.timeout!==undefined && opt.timeout!==null) {
                request.timeout = opt.timeout;
            }
            if(AJAXCONF.timeout!==null){
                request.timeout = AJAXCONF.timeout;
            }
            if (opt.withCredentials) {
                request.withCredentials = opt.withCredentials;
            }

            if(opt.transform){
                opt.data = opt.transform.call(scope,opt.data);
            }
            else{
                this.globalTransformOption(opt);
            }
            
            /**
             * request.readyState
             * 0	Uninitialized	初始化状态。XMLHttpRequest 对象已创建或已被 abort() 方法重置。
            1	Open	open() 方法已调用，但是 send() 方法未调用。请求还没有被发送。
            2	Sent	Send() 方法已调用，HTTP 请求已发送到 Web 服务器。未接收到响应。
            3	Receiving	所有响应头部都已经接收到。响应体开始接收但未完成。
            4	Loaded	HTTP 响应已经完全接收。
             */
            var _this_=this;
            var currentRequest = new Promise(function(resolve, reject) {
                try {
                    _this_.getAllRequestInterceptors(scope,opt,request).then(function(newOpt){
                        if (newOpt.uploadProgress) {
                            request.upload.onprogress = function(pe) {
                                newOpt.uploadProgress.call(scope, pe);
                            }
                        }
                        if (newOpt.loadstart) {
                            request.onloadstart = function() {
                                newOpt.loadstart.call(scope);
                            }
                        }
                        if (newOpt.ontimeout) {
                            request.ontimeout = function(pe) {
                                newOpt.ontimeout.call(scope,pe);
                            }
                        }
                        if (newOpt.progress) {
                            request.onprogress = function(pe) {
                                newOpt.progress.call(scope, pe);
                            }
                        }
                        
                        if (newOpt.loaded) {
                            request.onloadend = function() {
                                newOpt.loaded.call(scope, request);
                            }
                        }
                        request.send(newOpt.data);
                        if (newOpt.cancel) {
                            newOpt.cancel.call(scope, function() {
                                var oldState=request.readyState;
                                request.abort();
                                if(oldState<4){
                                    if(newOpt.complete){
                                        newOpt.complete.call(scope);
                                    }
                                    if(newOpt.error){
                                        newOpt.error.apply(scope,[request]);
                                    }
                                    reject(request);
                                }
                            });
                        }
                        // var abortIntervalHandler=null;
                        // if (newOpt.cancel) {
                        //     abortIntervalHandler = setInterval(function() {
                        //         newOpt.cancel.call(scope, function() {
                        //             request.abort();
                        //             clearInterval(abortIntervalHandler);
                        //             abortIntervalHandler = null;
                        //         });
                        //     }, 0);
                        // }
                        request.onreadystatechange = function() {
                            if (request.readyState === 4) { // 4代表执行完成
                                request._complete = true;
                                if(newOpt.complete){
                                    newOpt.complete.call(scope);
                                }
                                var responseContentType=(request.getResponseHeader('content-type') || "").toLowerCase()
                                if (AJAXCONF.successStatus(request.status)) { // 200代表执行成功
                                    if (responseContentType.indexOf("application/json")>-1) {
                                            new Promise(function(res, rej) {
                                                var cc = JSON.parse(request.response);
                                                res(cc);
                                            })
                                            .then(d =>
                                                formatResult.call(_this_,scope,d, request,newOpt,true).
                                                    then(dd=>{
                                                        if(newOpt.success){
                                                            newOpt.success.apply(scope,dd);
                                                        }
                                                        resolve(dd[0]);
                                                    }).
                                                    catch(ee=>{
                                                        if(newOpt.error){
                                                            newOpt.error.apply(scope,ee);
                                                        }
                                                        reject(ee[0]);
                                                    })
                                             )
                                            .catch(e => formatResult.call(_this_,scope,e, request,newOpt,false).then(dd=>{
                                                if(newOpt.error){
                                                    newOpt.error.apply(scope,dd);
                                                }
                                                reject(dd[0]);
                                            }).catch(ee=>{
                                                if(newOpt.error){
                                                    newOpt.error.apply(scope,ee);
                                                }
                                                reject(ee[0]);
                                            })
                                            )
                                        
                                    } else if (responseContentType.indexOf("application/xml")>-1) {
                                        formatResult.call(_this_,scope,request.responseXML, request,newOpt,true).then(dd=>{
                                            if(newOpt.success){
                                                newOpt.success.apply(scope,dd);
                                            }
                                            resolve(dd[0]);
                                        }).catch(ee=>{
                                            if(newOpt.error){
                                                newOpt.error.apply(scope,ee);
                                            }
                                            reject(ee[0]);
                                        });
                                    } else {
                                        formatResult.call(_this_,scope,request.response, request,newOpt,true).then(dd=>{
                                            if(newOpt.success){
                                                newOpt.success.apply(scope,dd);
                                            }
                                            resolve(dd[0]);
                                        }).catch(ee=>{
                                            if(newOpt.error){
                                                newOpt.error.apply(scope,ee);
                                            }
                                            reject(ee[0]);
                                        });
                                    }

                                } else {
                                    new Promise(function(d2,r2){
                                        var cc = request.response;
                                        if (responseContentType.indexOf("application/json")>-1) {
                                            cc = JSON.parse(request.response);
                                        } else if (responseContentType.indexOf("application/xml")>-1) {
                                            cc = request.responseXML;
                                        } else {
                                            cc = request.response;
                                        }
                                        formatResult.call(_this_,scope,cc, request,newOpt,false).
                                            then(dd=>{
                                                if(newOpt.error){
                                                    newOpt.error.apply(scope,dd);
                                                }
                                                r2(dd[0]);
                                            }).
                                            catch(ee=>r2(ee[0]))
                                    }).then(function(d){
                                        reject(d);
                                    }).catch(function(e){
                                        try{
                                            reject(e);
                                        }
                                        catch(err){

                                        }
                                        
                                    })
                                    
                                }
                                delete request["_complete"]
                            }
                        };
                    })
                    .catch(function(e){
                        formatResult.call(_this_,scope,request.responseText || e, request,opt,false).then(dd=>{
                            if(opt.error){
                                opt.error.apply(scope,dd);
                            }
                            reject(dd[0]);
                        }).catch(ee=>{
                            if(opt.error){
                                opt.error.apply(scope,ee);
                            }
                            reject(ee[0])
                        })
                    })
                    
                } catch (err) {
                    formatResult.call(_this_,scope,err, request,opt,false).then(dd=>reject(dd[0])).catch(ee=>reject(ee[0]));
                }
            });

            return currentRequest;
        };
    }
}

export default ajax;

export {AJAXCONF}