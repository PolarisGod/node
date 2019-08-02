/**
 * Created by Dbit on 2016/12/17.
 */
'use strict';
const _=require('lodash');
const requireDir=require('require-dir');
let IExt=require('../IExt');
let iExt=new IExt({platform:'common'});

/**
 *
 * @param ctx {{props,group,usercode}}|String}
 * @param data {{platform,[seller]}}
 * @param cb {function}
 * @returns {*}
 */
function commonIndex(ctx,data,cb) {
    // let args=Array.from(arguments);
    // cb=args[args.length - 1];
    // if (args.length!==3){
    //     throw new Error('interface.common(string,object,function)需要3个参数!');
    // }
    if (!cb) throw new Error('cb不能为空!');
    if (!ctx) return cb(Error('ctx不能为空!'));
    let {props} = ctx;
    if (!props) return cb(Error('props不能为空!'));
    let {platform, seller} = data;
    // if (!platform) return cb(Error('第二个参数必须存在platform属性!'));

    let interfaceList = _.get(global, 'config.interfaceList');
    if (_.get(interfaceList, platform + '.' + props) === false) return cb();//停用的直接返回成功
    if (seller) {
        if (_.get(interfaceList, platform + '.' + props + '.' + seller) === false) return cb();//停用的直接返回成功
    }
    // if (platform!=='vop' && _.has(fn,platform)==false){ //先注释掉,共用一个函数的检查有问题
    //     return cb('未对接的平台:'+platform);
    // }
    // console.debug(JSON.stringify(data),__filename);
    let fn = _.get(module.exports, props);
    if (_.isFunction(fn) === false) return cb({code: 404,msg:props,platform:iExt._platform});
    if (Object.prototype.toString.call(fn) === '[object AsyncFunction]') {
        if (fn.length === 2) {
            fn(ctx, data).then(r => cb(null, r)).catch(cb);
        } else {
            fn(data).then(r => cb(null, r)).catch(cb);
        }
        return;
    }
    if (fn.length === 3) { //(ctx,data,cb)
        fn(ctx, data, cb);
    } else if (data instanceof Array) {
        fn.apply(fn, data.concat(cb));
    } else {
        fn(data, cb);
    }
}

exports=module.exports=commonIndex;
exports.theParms= require('./theParms');
exports.base=requireDir('./base');
exports.find=iExt.find.bind(iExt);