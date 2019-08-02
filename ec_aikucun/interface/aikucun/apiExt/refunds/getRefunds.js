/**
 * Created by Dbit on 2016/10/17.
 */

'use strict';

let Thenjs=require('thenjs');
let _=require('lodash');
let pt=require('../../index');

let mongoHelper=require('../../../common/mongoHelper');
// let api=require('../../api/refunds');
let moment=require('moment');
let my=require(rootpath+'/common/MyUtil');

module.exports=main;

/**
 *
 * @param option {{seller_nick,buyer_nick,[end_modified],[end_created],[start_created],[start_modified]}}
 * @param cb
 */
function main(option,cb){
    let getCall;
    let incField;
    // if (option.end_created){
    //     syncOrders=api.getCreatedSold;
    //     incField='sold_created';
    // }else
    if(option.end_modified) {
        getCall = pt.api.getModifiedRefunds;
        incField='refunds_modified';
    }else{
        return cb('必须传输 end_modified !'); //end_created 或
    }

    let seller_nick=option.seller_nick;
    let dataTable='refunds';
    let postData={};

    Thenjs((cont)=> {
        let incrementTable=pt.theParms.getTable(option.seller_nick,'incrementTable');
        incrementTable.findOne({tablename:incField},cont);
    }).then((cont,row)=>{
        postData = {
            use_has_next: true,
            page_size: 10,
            seller_nick: option.seller_nick
        };

        // if (option.end_created){
        //     _.merge(postData, {
        //         start_created: option.start_created || (row && row.maxCreated) || null,
        //         end_created: option.end_created || moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
        //     });
        // }else{
            _.merge(postData, {
                start_modified: option.start_modified || (row && row.maxCreated) || null,
                end_modified: option.end_modified || moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
            });
        // }

        my.restPages(getCall,postData,{
            page_no: 'page_no',
            totals: 'total_results',
            page_size: 'page_size',
            key: 'modified',
            sort_value: 'desc',
            rows: 'refunds.refund',
            first: {
                fields: 'refund_id', use_has_next: false, page_size: 1
            },
            first_data: false
        },(data,maxCreated,cont)=>{
            if (_.size(data) < postData.page_size) { //不满一页时,取结束时间减5分钟
                maxCreated = moment(new Date(postData.end_created || postData.end_modified).getTime() - (5 * 60 * 1000)).format('YYYY-MM-DD HH:mm:ss');
            }
            insertData(dataTable, data,maxCreated,cont);
        },cont);
    }).then((cont,total_results)=>{ //成功
        cb(null,total_results);
    }).fail((cont,err)=>{
        if (err===0) return cb(); //0定义为无记录
        cb(err);
    });

    //incrementTable
    function insertData(tableName,data,maxCreated,cb){

        let table=pt.theParms.getTable(seller_nick,tableName);
        let incrementTable=pt.theParms.getTable(seller_nick,'incrementTable');

        Thenjs((cont)=> {
            let refund_ids = _.map(data, 'refund_id');
            mongoHelper.removeAndInsert(table,{'refund_id': {$in: refund_ids}},data,cont); //删除并插入记录
        }).then((cont)=>{
            //查询最大更新时间
            incrementTable.findOne({tablename:incField}, {fields:{maxCreated:1}},(err, result)=> {
                if (err) return cont(err);
                if (result === null) {
                    incrementTable.insertOne({tablename: incField, maxCreated: maxCreated}, cont);
                } else if (maxCreated > (result.maxCreated || '')) {
                    incrementTable.updateOne({tablename: incField}, {$set: {maxCreated: maxCreated}}, cont);
                } else {
                    cont();
                }
            });
        }).fin((cont,err,result)=>{
            if (err) return cb(err);
            cb(null,result);
        });
    }
}




