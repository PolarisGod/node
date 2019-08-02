/**
 * Created by WANGXIAOFEI on 2018/8/22.
 */
'use strict';

let _ = require('lodash');
let thenjs = require('thenjs');
let path = require('path');
let logTable = path.basename(__dirname) + '_' + path.basename(__filename, '.js');

module.exports = activityLoad;

function activityLoad(params, cb) {
    let {seller} = params;
    //删除
    delete params.seller;
    let appParams = _.pick(params, ['status']);
    thenjs((cont) => {
        let topCall = require("../../rest").Call;
        _.merge(appParams);
        return topCall({
            method: 'api/v2/activity/list',
            reqType:'GET',
            logTable:logTable,
        }, seller, appParams, cont);
    }).then((cont,data) => {
        cb(null, data);
    }).fail((cont, err) => {
        cb(err);
    });
}

