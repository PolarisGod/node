/**
 * Created by WANGXIAOFEI on 2018/8/22.
 */

'use strict';
let pt=require('../../index');

module.exports=function (postData,cb){
    let {seller,status,page_no,page_size}=postData;
    pt.iExt.getApi({
        filename:__filename,
    },{
        seller:seller,
        status:Number(status||9),
        page_no:Number(page_no||1),
        page_size:Number(page_size||50)
    },(err, result) => {
        
        if (err) return cb(err);
        if (!result.data.list) return cb(err);
        let acData = result.data.list;
        acData = _.sortBy(acData,(rs) => {
            return rs.begintime;
        })
        
        cb(null, acData);
    });
};