/**
 * Created by Dbit on 2016/11/8.
 */
// cainiao.cloudprint.stdtemplates.get



'use strict';

let Thenjs=require('thenjs');
let _=require('lodash');

module.exports=main;

/**
 * 查询卖家用户信息（只能查询有店铺的用户） 只能卖家类应用调用。
 * @param content {{[seller_nick],method}}
 * @param cb {function}
 * @returns {*}
 */

function main(content,cb) {

    let seller_nick = content.seller_nick;
    //if (!seller_nick) return cb('卖家不能为空!');
    let method=content.method;
    if (!method) return cb('method不能为空!');
    console.debug(method);
    content=_.omit(content,['seller_nick','method']);

    let outData;
    Thenjs((cont)=> {
        let postData ={};
        _.merge(postData,content);
        let topCall = require("../../rest").Call;
        return topCall(method,seller_nick, postData, (err, data)=> {
            if (err) return cont(err);
            outData = data;// _.result(data,'items.item');
            cont();
        });
    }).then((cont)=> {
        cb(null,outData);
    }).fail((cont,err)=>{
        cb(err);
    });
}

