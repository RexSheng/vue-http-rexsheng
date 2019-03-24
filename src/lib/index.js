var rexShengPlugin = {}
rexShengPlugin.config = {}

rexShengPlugin.install = function(Vue, options={}) {
    /**
     * author:RexSheng
     * date:2018/11/06
     */
    let defaultFormatCallback=function(d){return d.data;};
    let instanceName=options.instanceName || "$ajax";
    let mockInstanceName=options.mockInstanceName || "$mock";
    let VueGlobalInstanceName=instanceName.replace(/\$/g,'');//全局替换
    let successFormatCallback=options.successFormat || options.resultFormat || defaultFormatCallback;//返回数据的格式化
    let errorFormatCallback=options.errorFormat || options.resultFormat || defaultFormatCallback;
    let userDefaultConfig=options.defaultConfig || {};
    let requestInterceptor=function(d){return d;};
    let responseInterceptor=function(res){return res;};

    let xmlHttpRequest = function(sc) {
        this.instance = null;
        this.scope = sc || this;
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
        /**
         * 格式化Url（替换占位符）
         *
         * @param {String} url,如/user/{userId}
         * @param {Object} data,如{userId:3}
         * @return {String} 如 /user/3
         */
        this.formatUrl = function(url, data) {
            if (!url) return null;
            var keys = url.match(/\{\w+\}/g);
            keys = (keys === null) ? [] : keys;
            if (keys) {
                keys.forEach(function(key) {
                    var rawKey = key.substr(1, key.length - 2);
                    var replace;
                    if (!data || !data[rawKey]) {
                        replace = '';
                    } else {
                        replace = data[rawKey];
                    }
                    url = url.replace(new RegExp(key, 'g'), replace);
                });
            }
            return url;
        };
        this.formatResult=function(scope,data,req,config,success){
            var headers={};
            req.getAllResponseHeaders().trim().split(/[\r\n]+/).forEach(item=>{
                var parts=item.split(": ")
                var header = parts.shift();
                var value = parts.join(': ');
                headers[header]=value;
            })
            var d={
                data:data,
                status:req.status,
                statusText:req.statusText,
                headers:headers,
                config:config,
                request:req
            }
            return new Promise((resolve,reject)=>{
                Promise.resolve(responseInterceptor.call(scope,d)).then(rlt=>{
                    if(success){
                        resolve([successFormatCallback(rlt),d]) ;
                    }
                    else{
                        resolve([errorFormatCallback(rlt),d]) ;
                    }
                }).catch(err=>{
                    reject([err,d]) ;
                });
            });
            
        },
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
            var opt=Object.assign(this.defaultConfig,userDefaultConfig, config);
            var request = this.createInstance();
            opt.url = this.formatUrl(opt.url, opt.data);
            request.open(opt.type, opt.url, opt.async);
            if (opt.dataType.toLowerCase() === 'json') {
                request.setRequestHeader("Content-type", "application/json;charset=UTF-8");
            } else {}
            //加入header
            if (opt.headers) {
                Object.keys(opt.headers).forEach(item => {
                    request.setRequestHeader(item, opt.headers[item]);
                });
            }
            if(opt.responseType!=null){
                request.responseType=opt.responseType;
            }
            if (opt.timeout) {
                request.timeout = opt.timeout;
            }
            if (opt.withCredentials) {
                request.withCredentials = opt.withCredentials;
            }

            if(opt.transform){
                opt.data = opt.transform.call(scope,opt.data);
            }
            else{
                if (opt.dataType.toLowerCase() === 'formdata') {
                    if (opt.data != null) {
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
                if (opt.type.toLowerCase() === "post" && opt.dataType.toLowerCase() === 'json' && opt.data) {
                    opt.data = JSON.stringify(opt.data);
                }
            }

            /**
             * request.readyState
             * 0	Uninitialized	初始化状态。XMLHttpRequest 对象已创建或已被 abort() 方法重置。
            1	Open	open() 方法已调用，但是 send() 方法未调用。请求还没有被发送。
            2	Sent	Send() 方法已调用，HTTP 请求已发送到 Web 服务器。未接收到响应。
            3	Receiving	所有响应头部都已经接收到。响应体开始接收但未完成。
            4	Loaded	HTTP 响应已经完全接收。
             */
            var currentRequest = new Promise(function(resolve, reject) {
                try {
                    Promise.resolve(requestInterceptor.call(scope,opt)).then(function(newOpt){
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
                        request.onreadystatechange = function() {
                            
                            if (newOpt.cancel) {
                                abortIntervalHandler = setInterval(function() {
                                    newOpt.cancel.call(scope, function() {
                                        request.abort();
                                        clearInterval(abortIntervalHandler);
                                        abortIntervalHandler = null;
                                    });
                                }, 0);
                            }
                            if (request.readyState === 4) { // 4代表执行完成
                                request._complete = true;
                                if(newOpt.complete){
                                    newOpt.complete.call(scope);
                                }
                                var responseContentType=(request.getResponseHeader('content-type') || "").toLowerCase()
                                if (request.status === 200) { // 200代表执行成功
                                    if (responseContentType.indexOf("application/json")>-1) {
                                            new Promise(function(res, rej) {
                                                var cc = JSON.parse(request.response);
                                                res(cc);
                                            })
                                            .then(d =>
                                                formatResult(scope,d, request,newOpt,true).
                                                    then(dd=>{
                                                        if(newOpt.success){
                                                            newOpt.success.apply(scope,dd);
                                                        }
                                                        resolve(dd[0]);
                                                    }).
                                                    catch(ee=>reject(ee[0]))
                                             )
                                            .catch(e => formatResult(scope,e, request,newOpt,false).then(dd=>{
                                                if(newOpt.error){
                                                    newOpt.error.apply(scope,dd);
                                                }
                                                reject(dd[0]);
                                            }).catch(ee=>reject(ee[0]))
                                            )
                                        
                                    } else if (responseContentType.indexOf("application/xml")>-1) {
                                        formatResult(scope,request.responseXML, request,newOpt,true).then(dd=>{
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
                                        formatResult(scope,request.response, request,newOpt,true).then(dd=>{
                                            if(newOpt.success){
                                                newOpt.success.apply(scope,dd);
                                            }
                                            resolve(dd);
                                        }).catch(ee=>{
                                            if(newOpt.error){
                                                newOpt.error.apply(scope,ee);
                                            }
                                            reject(ee[0]);
                                        });
                                    }

                                } else {
                                    new Promise(function(res, rej) {
                                        var cc = request.response;
                                        if (responseContentType.indexOf("application/json")>-1) {
                                            cc = JSON.parse(request.response);
                                        } else if (responseContentType.indexOf("application/xml")>-1) {
                                            cc = request.responseXML;
                                        } else {
                                            cc = request.response;
                                        }
                                        rej(cc);
                                    })
                                    .then(d => formatResult(scope,d, request,newOpt,true).
                                        then(dd=>{
                                            if(newOpt.error){
                                                newOpt.error.apply(scope,dd);
                                            }
                                            reject(dd);
                                        }).
                                        catch(ee=>reject(ee[0]))
                                    )
                                    .catch(e => 
                                        formatResult(scope,e, request,newOpt,false).
                                        then(dd=>{
                                            if(newOpt.error){
                                                newOpt.error.apply(scope,dd);
                                            }
                                            reject(dd[0]);
                                        }).
                                        catch(ee=>reject(ee))
                                    )
                                }
                                delete request["_complete"]
                            }
                        };
                    })
                    .catch(function(e){
                        formatResult(scope,request.responseText, request,opt,false).then(dd=>reject(dd)).catch(ee=>reject(ee))
                    })
                    
                } catch (err) {
                    formatResult(scope,err, request,opt,false).then(dd=>reject(dd)).catch(ee=>reject(ee));
                }
            });

            return currentRequest;
        };
    };

    Vue[VueGlobalInstanceName]=Vue.prototype[instanceName]={
        send:function(config,scope) {
            // 逻辑...
            return new xmlHttpRequest(scope).send(config);
        },
        interceptors:{
            setRequest:function(fn){
                requestInterceptor=fn;
            },
            setResponse:function(fn){
                responseInterceptor=fn;
            }
        }
    }  

    Vue.mock = Vue.prototype[mockInstanceName] = function(url, params, render) {
        if (Object.prototype.toString.call(url) === '[object Function]') {
            return new Promise(function(resolve, reject) {
                try {
                    var d = url.call(render || this, params);
                    resolve([d, this]);
                } catch (err) {
                    reject([err, this])
                }

            });
        } else {
            return Vue[VueGlobalInstanceName]({ url: url, data: params });
            // var newUrl = new xmlHttpRequest().formatUrl(url, params);
            // return new Promise(function(resolve, reject) {
            //     try {
            //         console.log(newUrl)
            //         console.log(express())
            //         var d = require("" + newUrl);

            //         resolve([d]);
            //     } catch (err) {
            //         reject([err]);
            //     }
            // });
        }

    }
    
    
    Vue[VueGlobalInstanceName+"Success"] = function(data, message) {
        return resultFormat.call(this,arguments);
    }
    Vue[VueGlobalInstanceName+"Error"] = function(message) {
        return resultFormat.call(this,arguments);
    }

}

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