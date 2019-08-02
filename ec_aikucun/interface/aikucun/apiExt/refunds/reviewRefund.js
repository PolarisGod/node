/**
 * Created by Dbit on 2016/10/17.
 */

'use strict';

let _=require('lodash');
let pt=require('../../index');
let Thenjs=require('thenjs');

let my=require('../../../../common/MyUtil');

/**
 * 审核退款单，标志是否可用于批量退款，目前仅支持天猫订单。
 * @param postData {{seller_nick,refund_id,[code],[refund_infos]}}
 * @param cb //成功返回:[{refund_id,message,succ}]
 */
module.exports=function (postData,cb){
    if (postData) return cb('aolaigo未开放退款单审核接口');
    // let ret = my.checkNull(postData, ['seller_nick', 'refund_id']);
    // if (ret) return cb(ret);

    // let {seller_nick,refund_id} = postData;

    // let refund_ids=[];
    // if (_.isArray(refund_id)){
    //     refund_ids.push.apply(refund_ids,refund_id);
    // }else if(_.isString(refund_id) && refund_id.indexOf(',')>=0){
    //     refund_ids.push.apply(refund_ids,refund_id.split(','));
    // }else{
    //     refund_ids.push(refund_id);
    // }
    // for (let i=0;i<refund_ids.length;i++){
    //     refund_ids[i]=Number(refund_ids[i]);
    // }
    // let shopInfo;
    // Thenjs((cont)=> {
    //     pt.theParms.getSeller(seller_nick,cont);
    // }).then((cont,result)=> {
    //     shopInfo = result;

    //     if (shopInfo.type==='C') { //淘宝卖家
    //         cont();
    //     }else {
    //         let table = pt.theParms.getTable(seller_nick, 'refunds');
    //         table.find({refund_id: {$in: refund_ids}}, {
    //             fields: {
    //                 refund_id: 1,
    //                 refund_phase: 1,
    //                 refund_version: 1
    //             }
    //         }).toArray((err, rows) => {
    //             if (err) return cont(err);
    //             global.common.MyUtil.eachLimit(rows, (cont, row) => {
    //                 pt.iExt.getApi({
    //                     filename: __filename,
    //                     tablename: '',
    //                     rowsprop: '',
    //                     keyfield: ''
    //                 }, {
    //                     seller_nick,
    //                     operator: seller_nick,
    //                     result: "true",
    //                     message: "同意批量退款",
    //                     refund_id: row.refund_id,
    //                     refund_phase: row.refund_phase,
    //                     refund_version: row.refund_version
    //                 }, cont);
    //             }, 10, cont);
    //         });
    //     }
    // }).then((result)=> {
    //     cb(null,result);
    // }).fail((cont,err)=>{
    //     cb(err);
    // });
};

