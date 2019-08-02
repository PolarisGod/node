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
    let table=theParms.getTable('','groups');
    table.findOne({platform,group:ptCode},{fields: {sysgroup: 1}}, (err,result)=> {
        cb(err,_.get(result,'sysgroup'));
    });
}

/**
 *
 * @param data {{sysCode,platform}}
 * @param cb
 */
function sys2ptCode(data,cb){
    let {sysCode,platform}=data;
    let table=theParms.getTable('','groups');
    table.findOne({platform,sysgroup:sysCode},{fields: {group: 1}}, (err,result)=> {
        cb(err,_.get(result,'group'));
    });
}

exports.pt2sysCode=pt2sysCode;
exports.sys2ptCode=sys2ptCode;