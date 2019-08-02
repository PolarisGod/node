/**
 * Created by Dbit on 2016/10/17.
 */

'use strict';

let _=require('lodash');
let pt=require('../../index');
let Thenjs=require('thenjs');

let my=require('../../../../common/MyUtil');

/**
 *
 * @param postData {{seller,refund_id,remark}}
 * @param cb
 */
module.exports=function (postData,cb){
    if(postData) cb('aolaigo未开放同意退货接口');
    // let {seller,refund_id,remark}=postData
    // Thenjs((cont) => {
    //     let data = {
    //         seller_nick:seller,
    //         refund_id: String(refund_id), //订单号
    //         remark:remark,
    //     };
    //     pt.iExt.getApi({
    //         filename: __filename
    //     }, data, cb);
    // }).fin((c, err, result) => cb(err, result));
};

