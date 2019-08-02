/**
 * Created by Dbit on 2016/11/24.
 */
'use strict';
const _=require('lodash');
const Thenjs=require('thenjs');
let api=require('../../app');
const path=require('path');
let method=path.basename(__dirname)+'.'+path.basename(__filename,'.js');

module.exports=main;

//优先运行各平台的apiExt
function main(data,cb) {
    let platform=_.get(data,'platform');
    delete data.platform;

    Thenjs((cont)=>{
        api(platform, 'apiExt.' + method, data, cont);
    }).then((cont,result)=> {
    //     let convert = require('../../' + platform + '/convert/user');
    //     convert.formatRes(result, cont);
    // }).then((cont,result)=>{
        cont(null,result);
        // _.merge(result,data);
        // //模拟授权成功的消息
        // api(platform,'message.userMessage', {
        //     topic: 'user.authed',
        //     content:result
        // },cont);
    }).fin((cont,err,result)=>{
        cb(err,result);
    });
}

