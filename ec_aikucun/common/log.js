/**
 * 打印console.log所在文件
 */

'use strict';
let getStackTrace = function () {
    let obj = {};
    Error.captureStackTrace(obj, getStackTrace);
    return obj.stack;
};
let log = console.log;
console.log = function (...args) {
    let stack = getStackTrace() || "";
    let matchResult = stack.match(/\(.*?\)/g) || [];
    let line = matchResult[1] || "";
    if (typeof args[args.length - 1] === 'object') {
        args[args.length - 1] = JSON.stringify(args[args.length - 1])
}
    args.push(' >> '+line.replace("(", "").replace(")", ""));
    log.apply(console, args)
};
