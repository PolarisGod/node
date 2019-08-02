
/**
 * Created by Dbit on 2016/10/13.
 */
'use strict';
const _ = require('lodash');
let pt = require('../../index');
let Thenjs = require('thenjs');
let common = require('../../../common');
/**
 * 物流发货
 * @param form {{seller,transcorp,[item],movenos,[outnos]}}
 * @param cb
 */
module.exports = function (form, cb) {
    let { seller, item, movenos, outnos, transcorp} = form;
    Thenjs((cont) => {
        common.base.transcorp.sys2ptCode({
            sysCode: transcorp,
            platform: 'aikucun'
        }, cont);
    }).then((cont,code) => {
        if (!code) return cb('平台不支持的快递公司:'+code);
        let data = {
            activityid:form.bz1,
            size:item.length,
            list:[{
                adorderid:outnos,
                deliverNo:movenos,
                status:1,
                size:form.item.length,
                logisticsCompany:code,
                list:[]
            }]
        };
        for (var i in item){
            data.list[0].list[i] = {
                pinpai:item[i].item_id||'',
                barcode:item[i].words,
                kuanhao:item[i].sku_id||'',
                num:item[i].nb,
                realnum:item[i].nb,
                lacknum:0,
            };
        };
        pt.iExt.getApi({
            filename: __filename,
        }, {data,seller}, cb);
    }).fail((cont, err) => {
        if (err) return cb(err);
    });
};
