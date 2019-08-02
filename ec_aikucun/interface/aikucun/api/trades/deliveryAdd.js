/**
 * Created by WANGXIAOFEI on 2018/9/6.
 */
const moment = require("moment");
const _ = require('lodash');
const yhdApi = require('../../sdk/api');
let thenjs = require('thenjs');
const path = require('path');
const logTable = path.basename(__dirname) + '_' + path.basename(__filename, '.js');

module.exports = deliveryAdd;

function deliveryAdd(params, cb) {
    let {seller} = params;
    delete params.seller;
    let appParams = _.pick(params, ['adorderid','version']);
    thenjs((cont)=>{
        let topCall = require("../../rest").Call;
        _.merge(appParams);
        return topCall({
            method:'api/v2/delivery/add',
            reqType:'POST',
            logTable:logTable,
        },seller,appParams,cont);
    }).then((cont,data)=>{
        cb(null,data);
    }).fail((cont, err) => {
         cb(err);
     });
}

