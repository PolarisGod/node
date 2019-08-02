/**
 * Created by Dbit on 2016/10/17.
 */

'use strict';
let Thenjs = require('thenjs');
let _ = require('lodash');
// let mongoHelper=require('../../../common/mongoHelper');
let pt = require('../../index');
let moment = require('moment');
let my = require(rootpath + '/common/MyUtil');

module.exports = main;
/**
 * 三个月内有订单数据
 * @param params {{seller,end_modified,start_modified}}
 * @param cb
 */
function syncList(content, cb) {
    let { seller, start_modified, end_modified } = content;
    let form = {
        seller_nick: seller,
    };
    if (start_modified) { //按创建时间
        form.start_modified = start_modified;
        form.end_modified = end_modified;
    }
    let syncOrders;
    let fn;
    let incField;
    let startDateKey, endDateKey, dateKey;
    let splitSSS = 0;
    let allowDiffSSS = (5 * 60 * 1000); //5分钟
    let dataTable = 'refundsList';
    let minStartDate = moment().subtract(7, "days").format("YYYY-MM-DD HH:mm:ss");
    incField = 'refundsList_modified'
    syncOrders = require('./getModifiedRefund');
    startDateKey = 'start_modified';
    endDateKey = 'end_modified';
    //按30天拆分
    splitSSS = 15 * 24 * 60 * 60 * 1000;
    let postData = {
        use_has_next: true,
        page_size: 50, //最大100
    };
    let idKey = 'refund_id'; //数据行唯一标记
    let restDefine = {
        page_no: 'page_no',
        page_size: 'page_size',
        totals: 'refunds_receive_get_response.total_results',
        // page_count: 'data.total_number',
        rows: 'refunds_receive_get_response.refunds.refund',
        has_next: (data) => {
            let currCount = _.get(data, 'refunds_receive_get_response.total_results')
            return (currCount === postData.page_size ? true : false)
        },
        first: { //用于指定首页的特殊参数,按需设置
            //fields: 'tid', use_has_next: false, page_size: 1
        },
        first_data: true //是否保存首页调用的数据,按需设置
    };

    pt.iExt.incSync({
        syncOrders, incField, startDateKey, endDateKey, dateKey, idKey,
        splitSSS, allowDiffSSS, dataTable, minStartDate,
        restDefine, postData, form
    }, cb);
}
function main(data, cb) {
    let { seller } = data
    let sourceTable = 'refundsList';
    let incTableName = 'refunds_modified';
    let incrementTable;
    Thenjs((cont) => {
        syncList(data, cont)
    }).then((cont) => {
        incrementTable = pt.theParms.getTable(seller, 'incrementTable');
        incrementTable.findOne({ tablename: incTableName }, cont);
    }).then((cont, row) => {
        let where = {};
        if (row && row.maxId) where = { _id: { $gt: row.maxId } };
        let table = pt.theParms.getTable(seller, sourceTable);
        table.find(where).sort({ '_id': 1 }).toArray(cont); //???限制行数
    }).then((cont, rows) => {
        let fn = [];
        if (!rows || rows.length === 0) return cont(0);
        //每40个一调用
        for (let i = 0; i < rows.length; i = i + 1) {
            // let partRows=rows.slice(i,i+1);
            fn.push((cont) => {
                let maxId = rows[i]._id;
                // let num_iids= _.map(partRows,'outer_id');
                let content = {
                    seller: seller,
                    outnos: rows[i].refund_id
                };
                loadData(content, (err) => {
                    if (err) return cont(err);
                    //查询最大更新时间
                    incrementTable.findOne({ tablename: incTableName }, { fields: { maxId: 1, maxCreated: 1 } }, (err, result) => {
                        if (err) return cont(err);
                        if (result === null) {
                            let maxCreated = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
                            incrementTable.insertOne({ tablename: incTableName, maxId: maxId }, cont);
                        } else if (maxId > (result.maxId || '')) {
                            let maxCreated = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
                            incrementTable.updateOne({ tablename: incTableName }, { $set: { maxId: maxId } }, cont);
                        } else {
                            cont();
                        }
                    });
                });
            });
        }
        Thenjs.series(fn).fin(cont);
    }).fin((cont, err, rows) => {
        cb(err || null, rows);
    });
}
function loadData(option, cb) {
    let { seller, outnos } = option;
    let total_result = 0;
    let getFullinfo = require('./getFullinfo');
    Thenjs((cont) => {
        getFullinfo({ seller, outnos }, cont);
    }).then((cont, data) => {
        total_result = 1;
        cb(null, total_result);
    }).fail((cont, err) => {
        cb(err);
    })


}



