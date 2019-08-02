/**
 * Created by Dbit on 2016/10/17.
 */

'use strict';

let pt = require('../../index');
let _ = require('lodash');
let format = require('../../convert/refund/format')
/**
 *
 * @param postData{seller,outnos}
 * @param cb
 */
module.exports = function (params, cb) {
    let { seller, outnos } = params;
    pt.iExt.getApi({
        filename: __filename,
        tablename: 'refunds',
        rowsprop: 'refund_get_response.refund',
        keyfield: 'refund_id'
        }, {
            seller_nick: seller,
            refund_id: outnos,
        }, (err, result) => {
            if (err) return cb(err);
            format(_.merge(result,{seller}), cb); //输出格式化
        });
};
