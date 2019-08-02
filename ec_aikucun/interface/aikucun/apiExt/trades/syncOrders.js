/**
 * Created by Dbit on 2016/10/17.
 */

'use strict';
let Thenjs = require('thenjs');
let _ = require('lodash');
let pt = require('../../index');
let moment = require('moment');
let my = require(rootpath + '/common/MyUtil');
module.exports = main;
//module.exports = syncTradeList;
/**
 * 增量同步平台订单到中间库
 * @param data {{seller,[start_created],[end_created],[start_modified],[end_modified]}}
 * @param cb
 */
function syncTradeList(option, cb) {
    let { seller, activityid ,start_modified, end_modified, start_created, end_created, incrementTable,acno } = option;
    //格式化接口入参
    /**
     *  @param form {{seller,start_modified,end_modifed,start_created,end_created}}
     */
    let form = {
        seller_nick: seller,
        activityid: activityid
    };
    if (start_created || end_created) { //按创建时间
        form.start_created = start_created;
        form.end_created = end_created;
    } else { //按修改时间
        form.start_modified = start_modified;
        form.end_modified = end_modified;
    }
    let incTrades = 'trades_modified';
    let now_acno = acno;
    let syncOrders; //按时间段获取订单
    let incField; //增量标识,自定义
    let startDateKey; //开始时间的入参
    let endDateKey; //结束时间的入参
    let dateKey; //返回结果的日期字段
    let idKey = 'tid'; //数据行唯一标记
    let splitSSS = 0; //接口允许的最大时间段,有些平台会限制,单位:毫秒
    let allowDiffSSS = (2 * 60 * 60 * 1000); //接口允许的最大当前时间差,单位:毫秒
    let dataTable = 'trades'; //中间表,同getFullinfo里的中间表
    //默认获取7天内订单
    let minStartDate = moment().subtract(7, "days").format("YYYY-MM-DD HH:mm:ss");
    //按30天拆分
    splitSSS = 15 * 24 * 60 * 60 * 1000;
    if (start_created !== undefined || end_created !== undefined) {
        incField = 'tradesList_created';
        syncOrders = pt.apiExt.trades.getModifiedSold;
        startDateKey = 'start_created';
        endDateKey = 'end_created';
        dateKey = 'created';
    } else {
        incField = 'trades_modified';
        syncOrders = pt.apiExt.trades.getModifiedSold;
        startDateKey = 'start_modified';
        endDateKey = 'end_modified';
        dateKey = 'modified';
    }
    let postData = {
        pagesize: 50,
    };
    let restDefine = {
        page_no: 'page',
        page_size: 'pagesize',
        totals: 'data.totalrecord',
        rows: 'data.list',
        has_next: data => {
            return (_.get(data, "data.totalpage") >  _.get(data, "data.page"))
        },
        //has_next:true,
        first: { //用于指定首页的特殊参数,按需设置
            // fields: 'data.list.adorderid', 
            // use_has_next: false, page_size: 1
        },
        first_data: true //是否保存首页调用的数据,按需设置
    };
    pt.iExt.incSync({
        syncOrders, incField, startDateKey, endDateKey, dateKey, idKey,
        splitSSS, allowDiffSSS, dataTable, minStartDate,
        restDefine, postData, form
    }, (cont) => {
        incrementTable.findOne({ tablename: incTrades }, (err, result) => {
            let {acNo} = result || '';
            //重置增量标志的时间
            let update_time = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
            if (err) return cb(err);
            if (!acNo || now_acno > acNo) {
                incrementTable.updateOne({ tablename: incTrades }, { $set: { acNo : now_acno, update_time : update_time } }, cont);
            } else {
                return cb();
            }
        });
        return cb();
    });
}
function main(data, cb) {
    let {seller} = data;
    let incTrades = 'trades_modified';
    let incrementTable = pt.theParms.getTable(seller, 'incrementTable');
    let activityLoad = require('./activityLoad');
    let resetInc = require('./getFullinfo');
    let acData;
    Thenjs((cont) => {
        let hour_now = new Date().getHours();
        let min_now = new Date().getMinutes();
        if (9===hour_now && 10<=min_now && min_now<=16) {
            resetInc({outnos:'ALL',seller},(err,result) => {
                if (err) return cont(err)
                return cont();
            });
        } else {
            return cont();
        }
    }).then((cont) => {
        activityLoad(data, cont); 
    }).then((cont,data) => {
        acData = data;
        incrementTable.findOne({ tablename: incTrades }, cont);
    }).then((cont,data) => {
        Thenjs.eachSeries(acData,(cont,activitydata)=>{
            let acno = activitydata.begintime;
            if (!_.get(data,'acNo')) {
                let activityid = activitydata.id;
                return syncTradeList({seller,activityid,incrementTable,acno}, cont);
            }else if (data.acNo < acno) {
                let activityid = activitydata.id;
                return syncTradeList({seller,activityid,incrementTable,acno}, cont);
            };
            return cont();
        }).fin((cont, err, rows) => {
            if (err) return cb(err);
            return cb(null, rows);
        })
    }).fin((cont, err, rows) => {
        if (err) return cb(err);
        return cb(null, rows);
    });
}