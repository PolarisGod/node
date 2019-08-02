/**
 * Created by Dbit on 2016/10/17.
 */

'use strict';

let pt = require('../../index');

/**
 *
 * @param postData
 * @param cb
 */
module.exports = function (postData, cb) {
    if (postData) cb('aolaigo未开放获取退单备注接口');
    // let { seller, outnos } = params
    // pt.iExt.getApi(
    //     {
    //         filename: __filename,
    //     },
    //     {
    //         seller_nick: seller,
    //         refund_id: outnos,
    //     }, (err, result) => {
    //         if (err) return cb(err);
    //         let refundMsg = _.get(result, 'refund_get_response.refund.reason');
    //         let data = {
    //             refundMsg: refundMsg,
    //         }
    //         cb(null, data)
    //     });
};

