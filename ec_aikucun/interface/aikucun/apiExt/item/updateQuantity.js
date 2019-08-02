
'use strict';
let pt = require('../../index');

/**
 *
 * @param params {{seller,quantity,item_id,words}}
 * @param cb
 */
module.exports = function (params, cb) {
    let { seller, quantity, item_id, sku_id } = params;
    let postData = {
        seller_nick: seller,
        quantity: Number(quantity || 0),
        num_iid: Number(item_id),
        sku_id: Number(sku_id)
    };
    pt.iExt.getApi({
        filename: __filename,
    }, postData, cb);
};


