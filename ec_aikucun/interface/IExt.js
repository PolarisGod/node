/**
 * Created by Dbit on 2016/12/20.
 */

'use strict';
// const requireDir=require('require-dir');
const Thenjs=require('thenjs');
const _=require('lodash');
const util=require('util');
let mongoHelper=require('./common/mongoHelper');
let moment=require('moment');
let my=require(rootpath+'/common/MyUtil');
let mongodb = require('mongodb');
const sysParms=require( rootpath+'/interface/sysParms');

class IExt {
    /**
     *
     * @param option {{platform,userField}}
     */
    constructor(option) {
        this._platform = option.platform;
        this._theParms=require('./'+option.platform+'/theParms');
        this._userField=option.userField;
    }

    /**
     * 通用apiExt调用API函数
     * @param option {{filename,dataprop,rowsprop,tablename,keyfield,[api],[convert],[iterator],[where],[seller]}}
     * @param [ctx]
     * @param postData
     * @param cb
     */
    getApi(option, ctx, postData, cb) {
        let args=Array.from(arguments);
        cb = args.pop();
        postData = _.last(args);
        let _this=this;
        let api;
        if (option.api) {
            api=option.api;
        }else {
            let filename = option.filename;
            filename = filename.replace(/apiExt/, 'api');
            api = require(filename);
        }
        let {rowsprop,dataprop,tablename,keyfield,logTable,seller} = option;

        // let total_results=0;
        let lastResult;
        Thenjs((cont)=> {
            if (Object.prototype.toString.call(api) === '[object AsyncFunction]') {
                api.apply(this,_.cloneDeep(args.slice(1))).then(r => cont(null, r)).catch(cont); //clone避免参数被修改
            } else {
                api.apply(this,_.cloneDeep(args.slice(1)).concat(cont)); //clone避免参数被修改
            }
        }).then((cont,result)=>{
            let iterator = option.iterator;
            if (iterator) {
                if (Object.prototype.toString.call(option.iterator) === '[object AsyncFunction]') {
                    iterator(result).then((v) => cont(null, v)).catch(cont);
                } else {
                    iterator(result, cont); //对返回数据进行处理
                }
            } else {
                cont(null, result);
            }
        }).then((cont,result)=> {
            // console.log(__filename,result);
            //{}转换为null
            if (result && typeof result === 'object') {
                if (_.isEmpty(result)) result = null;
            }

            if (dataprop) {
                lastResult = _.get(result, dataprop);
            } else {
                lastResult = result;
            }

         //   console.log(result,keyfield,rowsprop);
            if (!tablename || !result) return cont();
            if (rowsprop) result = _.get(result, rowsprop); //

            if (result == null || (typeof result === 'object' && _.isEmpty(result))) {
                return cont(); //无记录
            }

            let ids;

            if (result instanceof Array) {
                ids = _.map(result, keyfield);
            } else {
                ids = [].concat(_.get(result, keyfield));
            }
            if (_.size(ids) === 0) return cont(); //无记录
            //    console.debug(ids);
            let where = option.where;
            if (where) {
                //优先使用外面传入的where
            } else if (typeof ids[0] === 'string') {
                where = JSON.parse('{"' + keyfield + '":{"$in":["' + ids.join('","') + '"]}}'); //{Array}
            } else if (typeof ids[0] === 'number') {
                where = JSON.parse('{"' + keyfield + '":{"$in":[' + ids.join(",") + ']}}'); //{Array}
            } else {
                return cont('in不支持的数据:' + ids); //
            }
            let table = (typeof tablename ==='object') ? tablename :_this._theParms.getTable(seller || _.get(postData, _this._userField), tablename);
            mongoHelper.removeAndInsert(table, where || false, result, cont); //false为安全,避免清空
        }).then(() => { //成功
            cb(null, lastResult);
        }).fail((cont, err) => {
            cb(err);
        });
    }

    /**
     * 通用增量同步函数
     * @param option {{syncOrders, incField, startDateKey, endDateKey,
            splitSSS, allowDiffSSS, dataTable, minStartDate,
            restDefine, postData, form,test,[seller],[group]}}
     * @param cb
     */
    incSync(option, cb) {
        // console.debug('incSync',__filename);
        let _this = this;
        let {
            syncOrders, incField, startDateKey, endDateKey,
            splitSSS, allowDiffSSS, dataTable, minStartDate,
            restDefine, postData, form,test,seller,group
        } = option;

        let seller_nick = seller || _.get(form, _this._userField);
        if (!seller_nick) return cb(new Error('seller不能为空!'));
        let lastValue;
        Thenjs((cont)=> {
            let incrementTable;
            if (group) {
                incrementTable = sysParms.getTable(group,'', _this._platform + '_' + seller_nick + '_incrementTable');
            } else {
                incrementTable = _this._theParms.getTable(seller_nick, 'incrementTable');
            }
            incrementTable.findOne({tablename: incField}, cont);
        }).then((cont,row)=>{
            lastValue=_.get(row,'maxCreated');
            if (!form[startDateKey]) {
                //上次时间(-allowDiffSSS)
                form[startDateKey] = (lastValue && moment(lastValue).subtract(allowDiffSSS, "ms").format("YYYY-MM-DD HH:mm:ss"));
                if (!form[startDateKey]) form[startDateKey] = minStartDate;
                if (!form[startDateKey]) return cont('起始时间不能为空:' + startDateKey);
            }
            // if (minStartDate && form[startDateKey] < minStartDate) return cont('起始时间('+form[startDateKey]+')不能小于:'+minStartDate);
            if (!form[endDateKey]) form[endDateKey]=moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
            _.merge(postData,form); //合并其它参数

            //拆分日期段
            let dateList=my.dateRangeSplit(new Date(form[startDateKey]),new Date(form[endDateKey]),splitSSS);
            if (_.isError(dateList)) return cb(dateList);

            //多时间段
            let addWheres=[];
            for (let i=0,len=_.size(dateList) - 1;i<len;i++){
                let dateRange={};
                dateRange[startDateKey]=moment(dateList[i]).format('YYYY-MM-DD HH:mm:ss');
                dateRange[endDateKey]=moment(dateList[i+1]).format('YYYY-MM-DD HH:mm:ss');
                addWheres.push(dateRange);
            }

            restDefine.addWheres=addWheres;
            // console.debug(addWheres,__filename);

            //自动获取多页以及多时间段数据
            my.restPages(syncOrders,postData,restDefine,(rows,maxCreated,cont)=>{
                insertData(dataTable, rows,maxCreated,(err,result)=>{
                    if (err) return cont(err);
                    if (test) {
                        let isNext = test({
                            startDateValue: lastValue, rows: rows
                        });
                        if (isNext === false) return cont(0, result); //中断请求
                    }
                    cont(null,result);
                });
            },(err,result)=>{
                if (err) return cont(err);
                //取结束时间前推一段时间
                let endDateValue = moment(new Date(form[endDateKey]).getTime()).format('YYYY-MM-DD HH:mm:ss');
                insertData(dataTable, [],endDateValue,cont); //全部成功后再记录一次结束时间
            });
        }).then((cont,total_results)=>{ //成功
            cb(null,total_results);
        }).fail((cont,err)=>{
            if (err===0) return cb(); //0定义为无记录
            cb(err);
        });

        //incrementTable
        function insertData(tableName,rows,maxCreated,cb){

            // let table;
            let incrementTable;
            if (group){
                // table = sysParms.getTable(group,'',_this._platform+'_'+seller_nick+'_'+tableName);
                incrementTable= sysParms.getTable(group,'',_this._platform+'_'+seller_nick+'_incrementTable');
            }else{
                // table= _this._theParms.getTable(seller_nick,tableName);
                incrementTable= _this._theParms.getTable(seller_nick,'incrementTable');
            }


            Thenjs((cont)=> {
                //     let tids = _.map(data, idKey);
                //     if (_.size(tids)===0) return cont();
                //     let where={};
                //     where[idKey]={$in: tids};
                //     mongoHelper.removeAndInsert(table,where,data,cont); //删除并插入记录
                // }).then((cont)=>{
                if (!maxCreated) return cont(); //不记录最后成功时间
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

    /**
     *
     * @param parms {{tableName,[seller_nick],[where],[option],[sort],[limit],[skip],[count]}}
     * @param cb
     */
    find (parms,cb) {
        let _this = this;
        let ObjectID = mongodb.ObjectID;
        let seller_nick = _.get(parms, _this._userField || '');
        //if (!seller_nick) return cb('seller_nick 不能为空!');
        let tableName = parms.tableName;
        // console.debug(parms,__filename);
        let where = my.parseJSON(parms.where);
        if (where instanceof Error) return cb(where);
        let option = my.parseJSON(parms.option);
        if (option instanceof Error) return cb(option);
        let sort = my.parseJSON(parms.sort || '{}');
        if (sort instanceof Error) return cb(sort);
        let {limit, skip, count,group} = parms;
        // let limit = my.parseJSON(parms.limit || 0);
        // if (limit instanceof Error) return cb(sort);
        // let skip = my.parseJSON(parms.skip || 0);
        // if (skip instanceof Error) return cb(skip);

        // let table = _this._theParms.getTable(seller_nick, tableName);
        let table;
        if (typeof tableName ==='object') {
            table = tableName;
        }else{
            if (group){
                table = sysParms.getTable(group,'',_this._platform+'_'+seller_nick+'_'+tableName);
            }else{
                table=_this._theParms.getTable(seller_nick, tableName);
            }
        }
        if (where._id) { /*_id转换*/
            if (typeof (where._id) === 'string') {
                if (_.size(where._id) === 24) where._id = new ObjectID(where._id);
            }
            if (typeof (where._id) === 'object') {
                let keys = _.keys(where._id);
                _.forEach(keys, (o) => {
                    if (_.size(where._id[o]) === 24) where._id[o] = new ObjectID(where._id[o]);
                })
            }
        }
        // logger.debug('count',count);
        if (count) {
            return table.count(where, {limit, skip}, (err,result)=>{
                global.logger.debug('count',err,result);
                cb(err,result);
            });
        } //查询总行数
        let fn = table.find(where, option);
        if (_.size(sort)) fn = fn.sort(sort);
        if (limit) fn = fn.limit(Number(limit));
        if (skip) fn = fn.skip(Number(skip));
        fn.toArray((err, result) => {
            // console.debug(result);
            if (err) return cb(err);
            cb(null, result);
        });
    }

    invoke(props,data,cb){

    }

}

let _getApi=IExt.prototype.getApi;
let _getApiAsync=util.promisify(_getApi);
IExt.prototype.getApi=async function(...args) {
    if (args[args.length - 1] instanceof Function) return _getApi.apply(this, args);
    return await _getApiAsync.apply(this, args);
};

module.exports=IExt;