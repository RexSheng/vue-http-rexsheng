let getType= function(obj) {
    const toString = Object.prototype.toString;
    const map = {
        '[object Boolean]': 'boolean',
        '[object Number]': 'number',
        '[object String]': 'string',
        '[object Function]': 'function',
        '[object Array]': 'array',
        '[object Date]': 'date',
        '[object RegExp]': 'regExp',
        '[object Undefined]': 'undefined',
        '[object Null]': 'null',
        '[object Object]': 'object'
    };
    return map[toString.call(obj)];
}
let createRandomNumber=function(minNum,maxNum){
    return Math.floor(Math.random()*(maxNum-minNum+1)+parseInt(minNum));
}
/**
 * 从min-max之间取count个随机数
 * @param {*} count 
 * @param {*} minNum 
 * @param {*} maxNum 
 */
let getRandomByCount=function(count,minNum,maxNum){
    var arr=[];
    while(arr.length<count){
        var digit=createRandomNumber(minNum,maxNum);
        console.log(digit)
        if(arr.indexOf(digit)<0){
            arr.push(digit);
        }
    }
    return arr;
}
let rd={
    classHandle:function(param){
        this.propertyHandle=function(property,value){
            var obj={};
            if(property.indexOf("|")<0){
                if(getType(value)==="function"){
                    var rlt=value();
                    obj[property]=this.handle(rlt);
                }
                else{
                    obj[property]=value;
                }
                
            }
            else{
                var resultKey,resultValue;
                var min=Number.MIN_VALUE,max=Number.MAX_VALUE;
                var min2=Number.MIN_VALUE,max2=Number.MAX_VALUE
                var properties=property.split("|");
                resultKey=properties[0];
                var dotRange=properties[1].split(".");
                if(dotRange.length==1){
                    //整数
                    var scopeRange=dotRange[0].split("-");
                    if(scopeRange.length==1){
                        min=scopeRange[0];
                        max=scopeRange[0];
                    }
                    else{
                        min=scopeRange[0];
                        max=scopeRange[1];
                    }
                    
                }
                else{
                    //小数
                    var scopeRange=dotRange[0].split("-");
                    if(scopeRange.length==1){
                        min=scopeRange[0];
                        max=scopeRange[0];
                    }
                    else{
                        min=scopeRange[0];
                        max=scopeRange[1];
                    }
                    var scopeRange=dotRange[1].split("-");
                    if(scopeRange.length==1){
                        min2=scopeRange[0];
                        max2=scopeRange[0];
                    }
                    else{
                        min2=scopeRange[0];
                        max2=scopeRange[1];
                    }
                }
                if(getType(value)==="number"){
                    //造一个范围内的随机数
                    var digit=createRandomNumber(min,max);
                    
                    if(min2!==Number.MIN_VALUE){
                        var postfix=-1;
                        if(min2===max2){
                            postfix=createRandomNumber(Math.pow(10,min2-1),Math.pow(10,max2)-1);
                        }
                        else{
                            postfix=createRandomNumber(Math.pow(10,min2)-1,Math.pow(10,max2)-1);
                        }
                        var postFixStr=postfix+"";
                        while(postFixStr.length>0 && postFixStr.substr(-1)==="0"){
                            postFixStr=postFixStr.substr(0,postFixStr.length-2);
                        }
                        digit=parseFloat(digit+"."+postFixStr);
                    }
                    resultValue=digit; 
                }
                else if(getType(value)==="string"){
                    var digit=createRandomNumber(min,max);
                    resultValue="";
                    var newValue=this.handle(value);
                    for(var i=0;i<digit;i++){
                        resultValue+=newValue;
                    }
                }
                else if(getType(value)==="boolean"){
                    //带+号的只返回一个随机值
                    if((min+"").substr(0,1)==="+"){
                        var digit=createRandomNumber(0,1);
                        if(digit===0){
                            resultValue=value;
                        }
                        else{
                            resultValue=!value;
                        }
                    }
                    else{
                        //不带加号，返回数组，minlength=0
                        resultValue=[];
                        var count=createRandomNumber(min,max);
                        for(var i=0;i<count;i++){
                            var digit=createRandomNumber(0,1);
                            if(digit===0){
                                resultValue.push(true);
                            }
                            else{
                                resultValue.push(false);
                            }
                        }
                    }
                    
                }
                else if(getType(value)==="object"){
                    resultValue={}
                    var keys=Object.keys(value);
                    var self=this;
                    max=max>keys.length?keys.length:max;
                    min=min<0?0:min;
                    //需要取几个数
                    var count=createRandomNumber(min,max);
                    if(count>0){
                        var arr=getRandomByCount(count,0,keys.length-1);
                        arr.forEach(digit=>{
                            resultValue[keys[digit]]=self.handle(value[keys[digit]]);
                        })
                    }
                }
                else if(getType(value)==="array"){
                    resultValue=[]
                    var tempArr=[];
                    if((min+"").substr(0,1)==="+"){
                        //+1 只随机取一个，不作为数组
                        if((min+"").substr(1)==="1"){
                            var count=createRandomNumber(0,value.length-1);
                            resultValue=this.handle(value[count]);
                        }
                        else{
                            console.warn(parseInt((min+"").substr(1)),value.length)
                            var count=0;
                            if(parseInt((min+"").substr(1))>value.length){
                                count=getRandomByCount(value.length,0,value.length-1);
                            }
                            else{
                                count=getRandomByCount(parseInt((min+"").substr(1)),0,value.length-1);
                            }
                            resultValue=[];
                            var self=this;
                            count.forEach(i=>{
                                resultValue.push(self.handle(value[i]));
                            })
                        }
                    }
                    else{
                        //获取数组数量
                        var count=createRandomNumber(min,max);
                        if(count>0){
                            for(var i=0;i<count;i++){
                                tempArr=tempArr.concat(value);
                            }
                        }
                        var self=this
                        tempArr.forEach(item=>{
                            resultValue.push(self.handle(item));
                        })
                    }
                }
                else if(getType(value)==="function"){
                    var rlt=value();
                    resultValue=this.handle(rlt);
                }
                obj[resultKey]=resultValue;
            }
            
            return obj
        }
        this.handle=function(param)
        {
            if(getType(param)==="string"){
                // @datetime("yyyy")
                // @now("")当前时间
                // @word(min,max)
                // @cword(min,max)
                // @word(pool,min,max)
                // @cword(pool,min,max)
                // @city
                // @privince
                return param;
            }
            else if(getType(param)==="object"){
                var result={}
                for(var key in param){
                    result=Object.assign(result,this.propertyHandle(key,param[key]));
                }
                return result;
            }
            else{
                return param;
            }
        }
    }
}

export default rd.classHandle