'use strict';
let moment = require('moment');
let my = require("../../../../common/MyUtil");
let _ = require('lodash');
let pt = require('../../index');
const Thenjs = require('thenjs');
module.exports = function initToken(option, cb) {
    cb = arguments[arguments.length - 1];
    Thenjs((cont) => {
        pt.theParms.loadShops({}, cont); //获取最新token数据
    }).then((cont) => {
        pt.theParms.getShops(cont);
    }).then((cont, result) => {
        let shopNames = _.keys(result);
        if (_.size(shopNames) === 0) return cont();
        let shopsList = [];
        _(result).forEach((key) => {
            let lastresttime = _.get(key, 'token.expiresIn')
            if (moment(new Date()).format('x')>lastresttime) {
                let shop = _.pick(key, ['seller_nick', 'appKey', 'appSecret', 'apiUrl']);
                shop.method = 'auth/token';
                shop.version = 'v2'
                shopsList.push(shop)
            }
        })
        if (shopsList !== []) {
            Thenjs.eachLimit(shopsList, (cont, shop) => {
                pt.theParms.getToken(shop.seller_nick, (err, token) => {
                    if (err) return cont(err);
                    let refreshToken = require('./refreshToken');
                    return refreshToken(shop, (err, res) => {
                        if (err) return cont(err);
                        cont(null, res);
                    });
                })
            }, 100).fin(cont);
        }
        cont();
    }).fin((cont, err, res) => {
        cb && cb(err, res);
    });
}