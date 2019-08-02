/**
 * Created by WANGXIAOFEI on 2018/8/30.
 */
'use strict';

let  pt = require('../../index');

module.exports=function (postData,cb) {
    let  {seller,activityid,page,pagesize}=postData;
    pt.iExt.getApi({
        filename:__filename,
        tablename:'tradeList',
        rowsprop:'data',
        keyfield:'activityid'
    },{
        seller_nick:seller,
        activityid:activityid,
        page:Number(page||1),
        pagesize:Number(pagesize||3),
    },cb);
};