/**
 * Created by WANGXIAOFEI on 2018/9/6.
 */
'use strict';
const format = require('../../convert/trades/format')
let  pt = require('../..');

//新增运单
module.exports=function (postData,cb) {
    let  {seller,adorderid}=postData;

    pt.iExt.getApi({
        filename:__filename
    },{
        seller:seller,
        version:'2',
        adorderid:adorderid
    },cb);
};