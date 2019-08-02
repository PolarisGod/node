/**
 * Created by Dbit on 2016/12/19.
 */

'use strict';

const _=require('lodash');
let pt=require('../../index');
let format=require('../../convert/refund/format')
const Thenjs=require('thenjs');
module.exports=findList;
/**
 *
 * @param data {{seller,maxId}}
 * @param cb
 */
function findList(data, cb){
    let {seller,maxId}=data;
    let where= {
        seller_nick:seller,
        tableName: 'refunds',
        where: JSON.stringify(_.merge({ status: { $in: ['-3','-2','-1','1','2','4','8','16','32','64','79','128'] } }, maxId ? { _id: { $gt: maxId } } : {})), //_.merge({status:'WAIT_SELLER_AGREE'},
        option: '{}',
        sort: '{"_id":1}'
    };
    pt.find(where, (err, result) => {
        if (err) return cb(err);
        Thenjs.eachLimit(result, (cont,trade) => {
            format(trade,cont);
        },5000)
        .then((cont,data) => {
            cb(null, data);
        }).fail((cont,err)=> {
            cb(err);
        })
    });
}
