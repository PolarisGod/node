'use strict';
const _ = require('lodash');
let pt = require('../../index');

/**
 * 物流发货
 * @param form {seller,transcorp,movenos,[outnos]}
 * @param cb
 */
module.exports = function (form, cb) {
    let { seller, transcorp, item, movenos, outnos } = form;
    if (!transcorp || !movenos) cb('奥莱购不支持无物流发货')
    let data = {
        seller: seller, //卖家
        tid: outnos, //订单                      
    };
    pt.iExt.getApi({
        filename: __filename
    }, data, cb);
};