/**
 * Created by Dbit on 2017/3/28.
 */

const _=require('lodash');
let pt=require('../../index');
let moment = require('moment');

module.exports=findSkus;

/**
 *
 * @param data {{seller,maxId,limit}}
 * @param cb
 */
function findSkus(data,cb){
    let {seller,maxId,limit}=data;
    if(!seller) return cb('商家(seller)不能为空');
    let where= {
        seller_nick:seller,
        tableName: 'skus',
        where: JSON.stringify(maxId ? {_id: {$gt: maxId}} : {}),
        option: '{}',
        sort: '{"_id":1}',
        limit
    };
    let dict={
        'normal':'ONSALE',
        'onsale':'ONSALE',
        'instock':'INVENTORY'
    }
    pt.find(where, (err,rows)=>{
        if (err) return cb(err);
        rows=_.map(rows,(r)=> {
            return {
                _id: String(r._id), //将ID转换为string
                item_id: String(r.iid),
                sku_id: String(r.sku_id)||'',
                words: String(r.outer_id)||'',
                quantity: Number(r.quantity),
                created: moment(r.created||new Date(),['YYYY-M-D HH:mm:ss']).format('YYYY-MM-DD HH:mm:ss'),
                modified:moment(r.created||new Date(),['YYYY-M-D HH:mm:ss']).format('YYYY-MM-DD HH:mm:ss'),
                status: dict[r.status],
                price: Number(r.price), //价格转为数字类型
                seller:seller,
                platform:'aolaigo',
                properties:r.properties||'',
                properties_name:r.properties_name||''
            };
        });
        cb(null,rows);
    });
}