/**
 * Created by Dbit on 2016/10/13.
 */
'use strict';

let pt = require('../../index');
let sysParm = require('../../../sysParms');
let _ = require('lodash');
let Thenjs = require('thenjs');
let my = require(rootpath + '/common/MyUtil');
let moment = require('moment');
let platform = pt.theParms.getPlatform();
/**
 *
 * @param postData {{seller,state}}
 * @param cb
 */
module.exports = function (postData, cb) {
    let ret = my.checkNull(postData, ['seller']); //未获取seller
    if (ret) return cb(ret);
    let { seller } = postData;
    Thenjs((cont) => {
        pt.theParms.getShop(seller, cont);
    }).fin((cont, err, result) => {
        if (err) return cont(err);
        let shopId = _.get(result, 'seller_nick')
        if (shopId !== seller) { //验证店铺id/店铺名称
            return cont(`授权信息不一致,需要授权的店铺是:'${seller}',而授权信息为:'${shopId}'`);
        }
        formatRes(seller, cb);
    }).fail((cont, err) => {
        cb(err);
    });
}
function formatRes(shopId, cb) {
    let data = {
        shopId: shopId,
        shopName: shopId,
        shopType: '无',
        shopStatus: ''
    };
    cb(null, data);
}

