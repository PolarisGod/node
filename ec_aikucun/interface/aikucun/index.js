/**
 * Created by Dbit on 2016/12/11.
 */
'use strict';
const platform='aikucun';
const userField='seller_nick'; /*调用API的卖家标识字段,(如:vop为vendor_id)如果是session,则用seller_nick(如:top,jos,youzan)*/

const _=require('lodash');

/**
 *
 * @param ctx {{platform,group,props,[id]}|String}
 * @param data
 * @param cb
 * @return {*}
 */
function main(ctx,data,cb) {
    if (!cb) throw new Error('cb不能为空!');
    if (typeof ctx === 'string') ctx = {props:ctx};
    let {props} = ctx;

    let fn = _.get(exports, props);

    if (_.isFunction(fn) === false) return cb('无效的方法:' + props);
    // console.debug(!!cb.ctx,fn.length,__filename);
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
exports=module.exports=main;
let BaseInfo=require('../sysParms').BaseInfo;
exports.theParms=new BaseInfo(platform);

let IExt=require('../IExt');
exports.iExt=new IExt({platform,userField}); //先初始化基础组件
let requireDir=require('require-dir');
exports.api=requireDir('./api',{recurse: true});
exports.apiExt=requireDir('./apiExt',{recurse: true});
exports.find=exports.iExt.find.bind(exports.iExt);

