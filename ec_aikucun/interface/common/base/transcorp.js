/**
 * Created by Dbit on 2017/2/5.
 */

const _=require('lodash');
let theParms=require('../theParms');

/**
 *
 * @param data {{platform,ptCode}}
 * @param cb
 */
function pt2sysCode(data,cb){
    let {platform,ptCode}=data;
    let table=theParms.getTable('','transcorp');
    table.findOne({types:platform,code:ptCode},{fields: {syscode: 1}}, (err,result)=> {
        cb(err,_.get(result,'syscode')||'OTHER'); //未对照则取OTHER
    });
}

/**
 *
 * @param data {{sysCode,platform,[fields]}}
 * @param cb
 */
function sys2ptCode(data,cb){
    let {sysCode,platform,fields}=data;
    let table=theParms.getTable('','transcorp');
    table.findOne({types:platform,syscode:sysCode},{fields: fields || {code: 1}}, (err,result)=> {
        if (!result && sysCode != 'OTHER') { //找不到的话,再取OTHER
            return sys2ptCode({platform, sysCode: 'OTHER', fields}, cb);
        }
        cb(err, fields ? result : _.get(result, 'code'));
    });
}

exports.pt2sysCode=pt2sysCode;
exports.sys2ptCode=sys2ptCode;