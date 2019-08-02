'use strict';

let thenjs = require('thenjs');
let _ = require('lodash');
let path = require('path');
let logTable = path.basename(__dirname) + '_' + path.basename(__filename, '.js');
/**
 * @param params {seller_nick,tid} 
 * @param cb 
 */

module.exports = getFullinfo

function getFullinfo(params, cb) {

    let {seller} = params;
    //删除
    delete params.seller;
    let appParams = _.pick(params, ['adorderid','withwaybill','version']);
    thenjs((cont) => {
        let topCall = require("../../rest").Call;
        _.merge(appParams);
        return topCall({
            method: 'api/v2/order/detail',
            foramt: 'json',
            reqType:'GET',
            logTable:logTable,
        }, seller, appParams, cont);
    }).then((cont,data) => {
        cb(null, data);
    }).fail((cont, err) => {
        cb(err);
    })
}



