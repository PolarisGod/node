/**
 * Created by WANGXIAOFEI on 2018/8/30.
 */
const moment = require("moment");
const _ = require('lodash');
const yhdApi = require('../../sdk/api');
let thenjs = require('thenjs');
const path = require('path');
const logTable = path.basename(__dirname) + '_' + path.basename(__filename, '.js');

module.exports = getModifiedSold;

function getModifiedSold(params, cb) {
    let {seller} = params;
    delete params.seller;
    //提取参数
    let appParams = _.pick(params, ['activityid','page','pagesize','withwaybill','version']);
    thenjs((cont)=>{
        let topCall = require("../../rest").Call;
        _.merge(appParams);
        return topCall({
            method:'api/v2/order/listall',
            reqType:'GET',
            logTable:logTable,
        },seller,appParams,cont);
    }).then((cont,data)=>{
        _.forEach(data.data.list,(rs) => {
            rs.activityid = appParams.activityid;
        });
        cb(null,data);
    }).fail((cont, err) => {
         cb(err);
     });
}

