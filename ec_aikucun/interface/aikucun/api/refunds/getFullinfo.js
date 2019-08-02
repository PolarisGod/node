/**
 * Created by Dbit on 2016/10/17.
 */
const _ = require('lodash')
let Thenjs = require('thenjs');
let theParms = require('../../index').theParms;
let pt = require('../../index');
const path = require('path');
const logTable = path.basename(__dirname) + '_' + path.basename(__filename, '.js');

/**
 * @param params {{seller_nick,refund_id}
 * @param cb {function}
 * @returns {*}
 */

function getFullinfo(params, cb) {
  let {seller_nick,refund_id}=params;
  if (!seller_nick) return cb('商家编码(seller)不能为空!');
  let appParams=_.pick(params,['refund_id']);
  Thenjs((cont) => {
    let topCall = require("../../rest").Call;
    return topCall({
        method:'refund_get',
        format:'json',
        v:'2.0',
        logTable: logTable,
    }, seller_nick, appParams,cont)
}).then((cont, data) => {
    cb(null, data);
}).fail((cont, err) => {
    cb(err);
});
}
module.exports = getFullinfo