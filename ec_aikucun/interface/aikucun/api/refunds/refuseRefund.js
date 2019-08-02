/**
 * Created by Dbit on 2016/10/17.
 */
const crypto = require("crypto");
const http = require("http");
const request = require('request');
const moment = require("moment");
const _ = require('lodash')
let thenjs = require('thenjs');
const yhdApi = require('../../sdk/api')

/**
 * @param params {{seller_nick,refund_id,remark}}
 * @param cb {function}
 * @returns {*}
 */

function refuseRefund(params,cb) {
  if (params) return cb('aolaigo未开放拒绝退款接口');
  // let{seller_nick,refund_id,remark}=params
  //   if (!params.seller_nick) return cb('商家(seller)不能为空!');
  //   if (!params.remark) return cb('拒绝理由(remark)不能为空!');
  //   if (!params.refund_id) return cb('退货单号(refund_id)不能为空!');
  //   let sysParams = {
  //     method:'yhd.refund.reject',
  //     version:'1.0',
  //   }
  //   let appParams = {
  //       refundCode:refund_id
  //   }
  //  if(params.remark){ appParams.remark=params.remark}
  //   let outData = {}
  //   thenjs((cont) => {
  //     let topCall = require("../../rest").Call;
  //     return topCall(sysParams, seller_nick, appParams, (err, data) => {
  //       if (err) return cont(err);
  //       outData = data;
  //       cont();
  //     });
  //   }).then((cont) => {
  //     cb(null, outData);
  //   }).fail((cont, err) => {
  //     cb(err);
  //   });
  }

module.exports = refuseRefund   

