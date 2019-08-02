/**
 * Created by Dbit on 2016/11/17.
 */
'use strict';

// let service=require(rootpath + '/service');

/**
 * 统一消息中转 平台,group,消息内容 (消息名称,关键字段)
 * @param body {{platform,group,topic,content}}
 * @param callback
 */
exports.send=function(body,callback) {
    // let {group}=body || {};
    // console.debug(__filename,JSON.stringify(body));
    // let service=global.interface.clients.get(group);
    global.service('interface.message',body, (err,result)=>{
        if (err) console.error(err);
        callback(err,result);
    });
};

// let topMessage=require('./top/message').onMessage;
// exports.topMessage=topMessage;