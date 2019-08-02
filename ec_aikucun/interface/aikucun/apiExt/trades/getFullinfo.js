'use strict';

let pt = require('../../index');
let format = require('../../convert/trades/format');
let moment = require('moment');
/**
 * 
 * @param params {{seller,outnos}}
 * @param cb 
 */
module.exports = function (postData, cb) {
    let  {seller,outnos,withwaybill}=postData;
    let incrementTable = pt.theParms.getTable(seller, 'incrementTable');
    let incTrades = 'trades_modified';
    //重置增量标志的时间
    let update_time = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
    //重置增量标志的接口
    let update_interface = 'getFullinfo';
    if (outnos === 'ALL') {
        incrementTable.updateOne({ tablename: incTrades }, { $set: { acNo : '', update_time : update_time, update_interface : update_interface } }, (err,result) => {
            if (err) return cb(err);
            return cb('增量表数据已经清空，等待自动拉单!');
        });
    } else {
        pt.iExt.getApi({
            filename:__filename,
            tablename:'trades',
            rowsprop:'data',
            keyfield:'adorderid',
            seller
        },{
            seller:seller,
            version:'2',
            adorderid:outnos,
            withwaybill:Number(withwaybill||1)
        },(err, result) => {
            if (err) return cb(err);
            format(postData, result.data, cb); //输出格式化
        });
    }  
};







