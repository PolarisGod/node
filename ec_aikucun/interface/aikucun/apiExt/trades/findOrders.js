/**
 * Modified by WXANGFEIFEI on 2018/11/15.
 */
'use strict';

const _ = require('lodash');
let pt = require('../../index');
const format = require('../../convert/trades/format');
module.exports = findOrders;

/**
 * 从中间库中按id增量获取需要发货的订单记录
 * @param data {{seller,maxId,limit}}
 * @param cb
 */
function findOrders(data, cb) {
    let { seller, maxId, limit } = data;
    let where = {
        seller_nick: seller,
        tableName: 'trades', //中间库表名
        where: JSON.stringify(_.merge({ orderstatus: { $in: [1,2] } },   maxId ? { _id: { $gt: maxId } } :{})), //指定需要发货的状态
        option: '{}',
        sort: '{"_id":1}',
        limit: limit
    };
    pt.find(where, (err, result) => {
        //global.logger.debug('wallce',111,where,333,err,222,result);
        if(err) return cb(err);
        let temp = [];
        _.map(result,(row)=>{
            format({seller,source:2},row,(err,res)=>{
                if (err) return cb(err);
                if (res) {
                    res._id = row._id.toString();
                    res.head.seller = seller;
                    temp.push(res);
                }
                return;
            },cb)
        });
        return cb(null,temp);
    });
}
