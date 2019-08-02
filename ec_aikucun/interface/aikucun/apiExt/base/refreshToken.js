
/**
 * Created by Dbit on 2016/10/13.
 */

'use strict';
let pt = require('../../index');
let sysParm = require('../../../sysParms');
let _ = require('lodash');
let moment = require('moment');
let my = require(rootpath + '/common/MyUtil');
/**
 *
 * @param postData {{seller}}
 * @param cb
 */
module.exports = function (postData, cb) {
    let ret = my.checkNull(postData, ['seller_nick']);
    if (ret) return cb(ret);
    let { seller_nick } = postData;
    pt.iExt.getApi({
        filename: __filename,
    }, postData, (err, res) => {
        if (err) return cb(err);
        Thenjs((cont) => {
            let result = {
                accessToken: _.get(res, ['access_token']),
            };
            result.expiresIn = Number(moment(new Date()).add(7, 'days').format('x'));
            result.expiresInYMD = moment(new Date()).add(7, 'days').format('YYYY-MM-DD HH:mm:ss');
            result.created = new Date().getTime();
            result.createdYMD = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
            let table = sysParm.getTable('', '', 'biyaoShops'); //master.topShops
            table.updateOne({ seller_nick: seller_nick }, { $set: { token: result } }, { upsert: true }, cont); //
        }).then((cont) => {
            sysParm.loadShops('biyao', { seller_nick }, cont);
        }).fin((cont, err, data) => {
            cb(err, data);
        })
    })
};









