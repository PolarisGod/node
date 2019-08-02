/**
 * Created by Dbit on 2016/10/17.
 */

'use strict';

let Thenjs = require('thenjs');
let _ = require('lodash');

let mongoHelper = require('../../../common/mongoHelper');
let pt = require('../../index');
let moment = require('moment');
module.exports = main;
/**
 * 支持onsale,instock
 * @param content {{seller,start_modified,end_modified,page_no,page_size}}
 * @param cb
 * @returns {*}
 */
function main(content, cb) {
    let form = {
        seller_nick: content.seller,
    };
    let syncOrders;
    let incField;
    let startDateKey, endDateKey, dateKey, idKey = 'num_iid';
    let splitSSS = 0;
    let allowDiffSSS = (3 * 24 * 60 * 60 * 1000); //3天
    let { seller_nick } = content;
    let dataTable; //预留=pt.theParms.getTable(seller_nick,'items');
    //3年内的产品
    let minStartDate = moment().subtract(1, "months").format("YYYY-MM-DD HH:mm:ss");
    incField = 'items_modified';
    syncOrders = require('./getOnsale');
    startDateKey = 'start_modified';
    endDateKey = 'end_modified';
    dateKey = 'update_time';
    //日期段拆分间隔
    splitSSS = 15 * 24 * 60 * 60 * 1000;
    let postData = {
        page_size: 50, //最大50,默认值为10
        order_by: 'update_time:desc' //修改时间降序
    };
    let restDefine = {
        page_no: 'page_no',
        page_size: 'page_size',
        totals: 'items_onsale_get_response.total_results',
        key: dateKey,
        sort_value: 'asc', //页码升序
        rows: 'items_onsale_get_response.items.item',
        has_next: (data) => {
            let currPage = _.size(_.get(data, 'items_onsale_get_response.items.item'))
            if (currPage === 50) return true;
            return false;
        },
        first: {},
        first_data: true
    };

    pt.iExt.incSync({
        syncOrders, incField, startDateKey, endDateKey, dateKey, idKey,
        splitSSS, allowDiffSSS, dataTable, minStartDate,
        restDefine, postData, form, test: (option) => {
            let { startDateValue, rows } = option;
            if (!startDateValue) return true; //
            if (_.size(rows) && _.last(rows)[dateKey] < startDateValue) return false; //不继续
            return true;
        }
    }, cb);
}
