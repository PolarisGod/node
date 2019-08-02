/**
 * Created by Dbit on 2017/3/28.
 */
let pt=require('../../index');

/**
 *
 * @param postData {{seller_nick,item_id}}
 * @param cb
 */
module.exports=function (postData,cb){
    let {seller,item_id}=postData;
    pt.iExt.getApi({
        filename:__filename,
        tablename:'skus',
        rowsprop:'skulist',
        keyfield:'sku_id' //按款id覆盖
    },{
        seller_nick:seller,
        pid:item_id,     
    },cb);
};