/**
 * Created by WANGXIAOFEI on 2018/9/6.
 */

'use strict';

let pt=require('../../index');

module.exports=function (postData,cb){
    let {seller,adorderid}=postData;
    pt.iExt.getApi({
        filename:__filename,
    },{
        seller:seller,
        adorderid:adorderid
    },cb);
};