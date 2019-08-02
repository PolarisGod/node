/**
 * Created by Dbit on 2016/10/17.
 */

'use strict';

let _=require('lodash');
let pt=require('../../index');
let Thenjs=require('thenjs');

let my=require('../../../../common/MyUtil');

/**
 * 获取验证码和打款都不会部分成功,(2017052x出现bug,提示部分失败,却全成功的情况)
 * @param postData {{seller,refund_id,[grfDetails],[productAmount],isDeliveryFee,sendBackType,isDefaultContactName,[contactName],[contactPhone],[sendBackAddress],[remark]}}
 * @param cb //成功返回:[{refund_id,message,succ}]
 */
module.exports=function (postData,cb){
    if(postData) cb('aolaigo未开放同意退款接口');
    // let {seller,refund_id,grfDetails,productAmount,isDeliveryFee,sendBackType,isDefaultContactName,contactName,contactPhone,sendBackAddress,remark}=postData
    // Thenjs((cont) => {
    //     let data = {
    //         seller_nick:seller,
    //         refund_id: String(refund_id), 
    //         grfDetails:grfDetails||null,
    //         productAmount:productAmount||null,
    //         isDeliveryFee:Number(isDeliveryFee),//订单号
    //         sendBackType:Number(sendBackType),
    //         isDefaultContactName:Number(isDefaultContactName),
    //         contactName:contactName||null,
    //         contactPhone:contactPhone||null,
    //         sendBackAddress:sendBackAddress||null,
    //         remark:remark||null
    //     };
    //     pt.iExt.getApi({
    //         filename: __filename
    //     }, data, cb);
    // }).fin((c, err, result) => cb(err, result));
};




