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
 * @param params {{seller_nick,refundCode,[grfDetails],[productAmount],isDeliveryFee,sendBackType,isDefaultContactName,[contactName],[contactPhone],[sendBackAddress],[remark]}}
 * @param cb {function}
 * @returns {*}
 */

function agreeRefund(params, cb) {
    if (params) return cb('aolaigo未开放同意退款接口');
    // let seller_nick = params.seller_nick
    // let sysParams = {
    //     method: 'yhd.refund.approve',
    //     version: '1.0',
    // }
    // let appParams = {
    //     refundCode: params.refund_id,
    //     isDeliveryFee: params.isDeliveryFee,//订单号
    //     sendBackType: params.sendBackType,
    //     isDefaultContactName: params.isDefaultContactName,
    // }
    // if (params.grfDetails) appParams.grfDetails = params.grfDetails
    // if (params.contactName) appParams.contactName = params.contactName
    // if (params.sendBackAddress) appParams.sendBackAddress = params.sendBackAddress
    // if (params.remark) appParams.remark = params.remark
    // let outData = {}
    // thenjs((cont) => {
    //     let topCall = require("../../rest").Call;
    //     return topCall(sysParams, seller_nick, appParams, (err, data) => {
    //         if (err) return cont(err);
    //         outData = data;
    //         cont();
    //     });
    // }).then((cont) => {
    //     cb(null, outData);
    // }).fail((cont, err) => {
    //     cb(err);
    // });
}
module.exports = agreeRefund


