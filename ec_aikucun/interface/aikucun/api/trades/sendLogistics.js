/**
 * Created by Dbit on 2016/10/13.
 */
'use strict';
let thenjs=require('thenjs');
let _=require('lodash');
let dict = require('../../convert/dict');
const path = require('path');
const logTable = path.basename(__dirname) + '_' + path.basename(__filename, '.js');

module.exports=main;

/**
 * 
 * @param params {{seller_nick,tid}}
 * @param cb 
 */
function main(params,cb) {
  let { seller_nick, tid, out_sid, company_code } = params;
  let appParams=_.pick(params,['tid']);
  Thenjs((cont) => {
    let topCall = require("../../rest").Call;
    return topCall({
      method: 'logistics_offline_send',
      v: '2.0',
      format:'json',
      logTable
    }, seller_nick,appParams,cont)
  }).then((cont, data) => {
    cb(null, data);
  }).fail((cont, err) => {
    cb(err);
  });
}

