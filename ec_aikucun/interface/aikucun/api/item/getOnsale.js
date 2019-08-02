'use strict';
const _ = require('lodash')
const yhdApi = require('../../sdk/api')
let thenjs = require('thenjs');
const path = require('path');
const logTable = path.basename(__dirname) + '_' + path.basename(__filename, '.js');
module.exports = main;
/**
 * @param params {{seller_nick,start_modifed,end_modfied,page_no,page_size}}
 * @param cb {function}
 * @returns {*}
 */

function main(params, cb) {
    return cb(null,params);
    // let { seller_nick } = params;
    // //let appParams = _.pick(params, ['start_modified', 'end_modified', 'page_no', 'page_size']);
    // Thenjs((cont) => {
    //     // let topCall = require("../../rest").Call;
    //     // return topCall({
    //     //     method: 'items_onsale_get',
    //     //     version: '2.0',
    //     //     format:'json',
    //     //     logTable:logTable,
    //     // }, seller_nick, appParams, (err, data) => {
    //     //     if (err) return cont(err);
    //     //     cont(null, data);
    //     // });
    // }).then((cont, data) => {  
    //     cb(null, data);
    // }).fail((cont, err) => {
    //     cb(err);
    // });
}

