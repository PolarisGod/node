const moment = require("moment");
const _ = require('lodash');
let Thenjs = require('thenjs');
let dict = require('../../convert/dict');
const path = require('path');
const logTable = path.basename(__dirname) + '_' + path.basename(__filename, '.js');
/**
 * 
 * @param params {{activityid,size}}
 * @param cb 
 */
function sendLogisticsOffline(params, cb) {
  let {seller,data} = params;
  Thenjs((cont) => {
    let topCall = require("../../rest").Call;
    return topCall({
      method: 'api/v2/invoice/upload',
      format:'json',
      reqType:'POST',
      logTable:logTable,
    }, seller,data,cont)
  }).then((cont, data) => {
    cb(null, data);
  }).fail((cont, err) => {
    cb(err);
  });
}
module.exports = sendLogisticsOffline