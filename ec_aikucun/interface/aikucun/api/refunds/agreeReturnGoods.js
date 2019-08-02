/**
 * Created by Dbit on 2016/10/17.
 */

'use strict';

let Thenjs=require('thenjs');
let _=require('lodash');

let my=require('../../../../common/MyUtil');

module.exports=main;

/**
 * 卖家同意退货，支持淘宝和天猫的订单。
 * @param content {{seller_nick,refund_id,[refund_phase],[refund_version],[remark],[seller_address_id],[name],[address],[post],[tel],[mobile]}}
 * @param cb {function}
 * @returns {*}
 */

function main(content,cb) {
    if (content) return cb('aolaigo未开放同意退货接口');
    // let ret=my.checkNull(content,['seller_nick','refund_id']);
    // if (ret) return cb(ret);
    // let seller_nick = content.seller_nick;
    // delete content.seller_nick;
    // let resData={};
    // Thenjs((cont)=> {
    //     let postData = _.merge({
    //     },content);
    //     let topCall = require("../../rest").Call;
    //     return topCall({method:'taobao.rp.returngoods.agree'},seller_nick, postData, (err, data)=> {
    //         if (err) return cont(err);
    //         resData = data;
    //         cont();
    //     });
    // }).then((cont)=> {
    //     cb(null,resData);
    // }).fail((cont,err)=>{
    //     cb(err);
    // });
}

