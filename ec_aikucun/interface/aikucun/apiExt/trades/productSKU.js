/**
 * Created by WANGXIAOFEI on 2018/8/29.
 */
'use strict';

let pt=require('../../index');

module.exports=function (postData,cb){
    let {seller,activityid,page,pagesize}=postData;
    pt.iExt.getApi({
        filename:__filename,
    },{
        seller:seller,
        activityid:activityid,
        page:Number(page||1),
        page_size:Number(pagesize||50)
    },cb);
};