/**
 * Created by Dbit on 2016/11/15.
 */
'use strict';
const moment = require('moment');
let my = require("../../common/MyUtil");
let _ = require('lodash');
let sysParms = require('../sysParms');
let pt = require('./index');
const Thenjs = require('thenjs');
function session(option, cb) {
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
            let shop = _.pick(key, ['seller_nick', 'appKey', 'appSecret', 'apiUrl']);
            shop.method = 'auth/token';
            shop.version = 'v2'
            shopsList.push(shop)
        })
        Thenjs.eachLimit(shopsList, (cont, shop) => {
            pt.theParms.getToken(shop.seller_nick, (err, token) => {
                if (err) return cont(err);
                let refreshToken = require('./apiExt/base/refreshToken');
                return refreshToken(shop, (err, res) => {
                    if (err) return cont(err);
                    cont(null, res);
                });
                cont();
            })
        }, 100).fin(cont);
    }).fin((cont, err, result) => {
        cb && cb(err, result);
    });
}
exports.refreshToken = session;

let schedule = require('node-schedule');
let taskList = [['BIYAO:刷新access_token', '00 00 00 * * *', session]];
_.forEach(taskList, (task) => {
    global.logger.info(task.slice(0, 2).join(':'));
    schedule.scheduleJob.apply(schedule, task);
});
