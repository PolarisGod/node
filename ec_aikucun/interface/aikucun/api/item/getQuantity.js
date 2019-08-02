'use strict'
const _ = require('lodash')
let Thenjs = require('thenjs')
const yhdApi = require('../../sdk/api')
const path = require('path');
const logTable = path.basename(__dirname) + '_' + path.basename(__filename, '.js');
/**
 * 
 * @param params {{seller_nick,pid}}
 * @param cb 
 */
function getSkus(params, cb) {
  let { seller_nick, pid } = params;
  if (!seller_nick) return cb('商家(seller_nick)不能为空!');
  Thenjs((cont) => {
    let topCall = require("../../rest").Call;
    return topCall({
      method: 'item_fullinfo_get',
      v: '2.0',
      format: "json",
      logTable: logTable,
    }, seller_nick, { pid }, (err, data) => {
      if (err) return cont(err);
      cont(null,data);
    });
  }).then((cont,data) => {
    cb(null, data);
  }).fail((cont, err) => {
    cb(err);
  });
}
module.exports = getSkus