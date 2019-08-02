/**
 * Created by Dbit on 2016/10/17.
 */

'use strict';

let _=require('lodash');
let pt=require('../../index');
let Thenjs=require('thenjs');

let my=require('../../../../common/MyUtil');

/**
 * 卖家同意退货，支持淘宝和天猫的订单。重复调用会返回:退款单状态不符合执行操作
 * 淘宝退款必填项:[name],[address],[post],[tel],[mobile]
 * tmall退款必填项:[refund_phase],[refund_version],[remark],[seller_address_id]
 * @param postData {{seller_nick,refund_id,[refund_phase],[refund_version],[remark],[seller_address_id],[name],[address],[post],[tel],[mobile]}}
 * @param cb
 */
module.exports=function (postData,cb){
    if(postData) cb('aolaigo未开放同意退货接口');
    // let ret = my.checkNull(postData, ['seller_nick', 'refund_id']);
    // if (ret) return cb(ret);
    // let seller_nick = postData.seller_nick;
    // let refund_id = postData.refund_id;

    // Thenjs((cont)=> {
    //     pt.theParms.getSeller(seller_nick,cont);
    // }).then((cont,shopInfo)=>{

    //     if (shopInfo.type==='C'){ //淘宝卖家
    //         let ret = my.checkNull(postData, ['name','address','post','tel','mobile']);
    //         if (ret) return cont(ret);
    //         cont(); //
    //     }else { //TMALL卖家
    //         let ret = my.checkNull(postData, ['remark','seller_address_id']); //'refund_phase','refund_version',
    //         if (ret) return cont(ret);

    //         if (postData.refund_phase && postData.refund_version){ //已指定退货类型及版本号
    //             return cont();
    //         }else {
    //             let table=pt.theParms.getTable(seller_nick,'refunds');
    //             table.findOne({refund_id: Number(refund_id)}, {fields: {refund_phase: 1, refund_version: 1}}, (err,result)=> {
    //                 if (err) return cont(err);
    //                 if (result){
    //                     postData = _.merge({
    //                         refund_phase: result.refund_phase,
    //                         refund_version: result.refund_version
    //                     }, postData);
    //                 }
    //                 cont();
    //             });
    //         }
    //     }
    // }).then((cont)=>{
    //     pt.iExt.getApi({
    //         filename:__filename,
    //         tablename:'',
    //         rowsprop:'',
    //         keyfield:''
    //     },postData,cb);
    // }).fail((cont,err)=>{
    //     cb(err);
    // });
};
