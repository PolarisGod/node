/**
 * Created by Dbit on 2016/10/17.
 */

const moment = require("moment");
const _ = require('lodash')
let Thenjs = require('thenjs');
const path = require('path');
const logTable = path.basename(__dirname) + '_' + path.basename(__filename, '.js');

/**
 * @param params {{seller_nick,start_modified,end_modified,[page_no],[page_size]}}
 * @param cb {function}
 * @returns {*}
 */

function getModifiedRefund(params, cb) {
    let { seller_nick, start_modified, end_modified, page_no, page_size } = params;
    Thenjs((cont) => {
        let appParams = _.merge(_.pick(params, ['start_modified', 'end_modified']));
        let optParams = _.pick(params, ['page_no', 'page_size',]);
        _.merge(appParams, optParams);
        let topCall = require("../../rest").Call;
        return topCall({
            method:'refunds_receive_get',
            format:'json',
            v:'2.0',
            logTable: logTable,
        }, seller_nick, appParams, (err, data) => {
            if (err) return cont(err);
            cont(null, data);
        });
    }).fin((cont, err, data) => {
        if (err) cont(err)
        cb(null, data);
    }).fail((cont, err) => {
        cb(err);
    });
}

module.exports = getModifiedRefund   