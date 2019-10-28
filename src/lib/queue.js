var queue = function (methods, option, scope) {
    var i = 0, j = methods.length - 1;
    var internalPromise = function (methods, option, scope, i, j) {
        return new Promise(function (resolve, reject) {
            Promise.resolve(methods[i].call(scope, option)).then(d => {
                if (i < j) {
                    i++;
                    resolve(internalPromise(methods, d, scope, i, j));
                }
                else {
                    resolve(d);
                }
            }).catch(e => {
                reject(e);
            })
        });
    }
    return internalPromise(methods, option, scope, i, j);
}
export {queue}