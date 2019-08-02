/**
 * Created by Dbit on 2016/10/17.
 */

'use strict';

let pt=require('../../index');
let moment=require('moment')
/**
 *
 * @param postData {{seller_nick,end_modified,start_modified,[page_size],[page_no]}} //按创建时间获取退单
 * @param cb
 */
module.exports=function (postData,cb){
    let {seller_nick,end_modified,start_modified,page_no,page_size} = postData;
    pt.iExt.getApi({
        filename:__filename,
        tablename:'refundsList',//中间库表名
        rowsprop:'refunds_receive_get_response.refunds.refund',//数据行属性
        keyfield:'refund_id'//行唯品标识:订单号  
    },{
        seller_nick:seller_nick,
        start_modified:start_modified,
        end_modified:end_modified,
        page_size:Number(page_size||50),
        page_no:Number(page_no||1),
    },cb);
};

