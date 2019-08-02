/**
 * Created by WANGXIAOFEI on 2018/8/30.
 */
const moment = require("moment");
const _ = require('lodash');
const yhdApi = require('../../sdk/api');
let thenjs = require('thenjs');
const path = require('path');
const logTable = path.basename(__dirname) + '_' + path.basename(__filename, '.js');

module.exports = orderList;

function orderList(params, cb) {
    let {seller} = params;

    delete params.seller;
    //提取参数
    let appParams = _.pick(params, ['activityid','page','pagesize']);
    thenjs((cont)=>{
        let topCall = require("../../rest").Call;
        _.merge(appParams);
        return topCall({
            method:'api/v2/order/listno',
            v:'1.0',
            reqType:'GET',
            logTable:logTable,
        },seller,appParams,cont);
    }).then((cont,data)=>{
        cb(null,data);
    }).fail((cont, err) => {
         cb(err);
     });
}

