/**
 * Created by Dbit on 2016/12/19.
 */

'use strict';

const _=require('lodash');
let pt=require('../index');

module.exports=main;

/**
 *
 * @param data {{platform,seller,maxId}}
 * @param cb
 */
function main(data, cb){

    let maxId=_.get(data,'maxId');
    let tableName='transcorp';
    // if (data.platform!=='common') tableName+='_'+data.platform;
    let where= {
        tableName:tableName,
        where: JSON.stringify(_.merge({},_.get(data,'where'),maxId ? {_id: {$gt: maxId}} : {})),
        option: '{}',
        sort: '{"_id":1}'
    };

    pt.find(where,cb);
}