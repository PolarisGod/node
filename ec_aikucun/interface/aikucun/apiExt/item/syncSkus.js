/**
 * Created by Dbit on 2016/10/17.
 */

'use strict'
let Thenjs = require('thenjs');
let _ = require('lodash');
let pt = require('../../index');
let syncItems = require('./syncItems');

/**
 *
 * @type {getSkus}
 */
module.exports = getSkus;

/**
 * 根据num_iid获取sku
 * @param option {{seller,[start_created],[end_created],[start_modified],[end_modified]}}
 * @param cb {function}
 * @returns {*}
 */
function getSkus(option, cb) {
    let {seller,start_modified,end_modified}=option;
    let form={
        seller:seller
    };
    let sourceTable = 'items';
    let incTableName = 'skus_modifed';
    let incrementTable;
    if (start_modified||end_modified) { //按创建时间
        form.start_modified = start_modified;
        form.end_modified = end_modified;
    }
    Thenjs((cont) => {
        syncItems(form, cont);
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
                    item_id: rows[i].num_iid, //商品数字编号
                };
                loadData(content, (err) => {
                    if (err) return cont(err);
                    //查询最大更新时间
                    incrementTable.findOne({ tablename: incTableName }, { fields: { maxId: 1 } }, (err, result) => {
                        if (err) return cont(err);
                        if (result === null) {
                            incrementTable.insertOne({ tablename: incTableName, maxId: maxId }, cont);
                        } else if (maxId > (result.maxId || '')) {
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
function loadData(content, cb) {
    let getSkus = require('./getSkus');
    let postData = content;
    let total_results = 0;
    Thenjs((cont) => {
        getSkus(postData, cont);
    }).then((cont, data) => {
        total_results = _.size(_.get(data, 'skulist'));
        cont(null, total_results);
    }).then(() => { //成功
        cb(null, total_results);
    }).fail((cont, err) => {
        if (err === 0) return cb(); //0定义为无记录
        cb(err);
    });
}