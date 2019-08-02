/**
 * Created by Dbit on 2016/10/18.
 */

'use strict';
let Thenjs=require('thenjs');
const mongodb = require('mongodb');
const ObjectID = mongodb.ObjectID;

exports.removeAndInsert=removeAndInsert;

/**
 * 删除并插入记录
 * @param table {Collection}
 * @param select {*}
 * @param data {[*]}
 * @param cb {function}
 */
function removeAndInsert(table,select,data,cb){
    // console.debug('removeAndInsert',table.s.namespace,select,__filename);
    Thenjs((cont)=> {
        if (!select) {
            console.warn('程序已禁止无条件删除数据!');
            return cont();
        }
        table.removeMany(select, cont); //删除原记录
    }).then(async (cont,result)=> {
        try{
            if (data){
                cont(null,await insertByIncId(table,data));
            }else{
                cont();
            }
        }catch (err){
            cont(err);
        }
    }).fin((cont,err,result)=>{
        cb(err,result);
    });
}

/**
 *
 * @param table
 * @param rows
 * @return {Promise<*>}
 */
async function insertByIncId (table,rows) {
    //获取tablename
    let tableName = table.s.name;
    // table=table.s.db.collection(tableName); //MyCollection-->collection
    let rowcount = (rows instanceof Array) ? rows.length : 1;
    //获取counters
    let counters = table.s.db.collection('counters');
    let result = await counters.findOneAndUpdate({_id: tableName},
        {
            $inc: {maxId: rowcount},
            $currentDate: {time: true}
        },
        {upsert: true,returnOriginal:false} //返回新数据
    );

    let incRow=result.value;
    let time=Number((incRow.time.getTime() / 1000).toFixed(0)).toString(16);
    if (rows instanceof Array && rows.length > 0) {
        rows.forEach((row, index) => {
            let incId = ((incRow.maxId - rowcount) + index + 1).toString(16);
            row._id = new ObjectID(time + '0'.repeat(24 - time.length - incId.length) + incId);
        });
        result= await table.insertMany(rows);
        return result;
    } else if (rows && (rows instanceof Array === false)) {
        let incId = (incRow.maxId).toString(16);
        rows._id = new ObjectID(time + '0'.repeat(24 - time.length - incId.length) + incId);
        return await table.insertOne(rows);
    }
    return null;
}