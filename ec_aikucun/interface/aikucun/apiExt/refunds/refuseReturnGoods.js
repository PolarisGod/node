/**
 * Created by Dbit on 2016/10/17.
 */

'use strict';

let _=require('lodash');
let pt=require('../../index');
let Thenjs=require('thenjs');

let my=require('../../../../common/MyUtil');

/**
 * 卖家拒绝退货，目前仅支持天猫退货。
 * @param postData {{seller_nick,refund_id,[refund_phase],[refund_version],refuse_proof:string}}
 * @param cb
 */
module.exports=function (postData,cb){
    if (postData) return cb('aolaigo未开放拒绝退货接口');
    // let ret = my.checkNull(postData, ['seller_nick', 'refund_id','refuse_proof']);
    // if (ret) return cb(ret);
    // let seller_nick = postData.seller_nick;
    // let refund_id = postData.refund_id;
    // postData.refuse_proof=JSON.parse(postData.refuse_proof.replace(/\\/g,'/'));

    // Thenjs((cont)=> {
    //     pt.theParms.getSeller(seller_nick,cont);
    // }).then((cont,shopInfo)=> {
    //     if (postData.refund_phase && postData.refund_version){ //已指定退货类型及版本号
    //         return cont();
    //     }
    //     let table=pt.theParms.getTable(seller_nick,'refunds');
    //     table.findOne({refund_id: Number(refund_id)}, {fields: {refund_phase: 1, refund_version: 1}}, (err,result)=> {
    //         if (err) return cont(err);
    //         if (result){
    //             postData = _.merge({
    //                 refund_phase: result.refund_phase,
    //                 refund_version: result.refund_version
    //             }, postData);
    //         }
    //         cont();
    //     });
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

