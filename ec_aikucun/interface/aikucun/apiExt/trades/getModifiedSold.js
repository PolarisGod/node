/**
 * Created by WANGXIAOFEI on 2018/8/30.
 */
'use strict';

let  pt = require('../../index');
let moment = require('moment');

module.exports=function (postData,cb) {
    let  {seller_nick,activityid,page,pagesize,withwaybill}=postData;
    let table = pt.theParms.getTable(seller_nick, 'incrementTable');
    pt.iExt.getApi({
        filename:__filename,
        tablename:'trades',
        rowsprop:'data.list',
        keyfield:'adorderid',
        seller:seller_nick
    },{
        seller:seller_nick,
        activityid:activityid,
        version:'2',
        page:Number(page||1),
        pagesize:Number(pagesize||3),
        withwaybill:Number(withwaybill||1)
    },(err,result) => {
        if (err) return cb(err);
        return cb(null,result);
    });
};