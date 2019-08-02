/**
 * Created by chenqi on 2017/09/01.
 */
let pt=require('../../index');

/**
 *
 * @param postData {{seller_nick,start_modified,end_modified,page_no,page_size}}
 * @param cb
 */
module.exports=function (postData,cb){
    let {seller_nick,start_modified,end_modified,page_no,page_size}=postData;
    pt.iExt.getApi({
        filename:__filename,
        tablename:'items',
        rowsprop:'items_onsale_get_response.items.item',
        keyfield:'num_iid'
    },{
        seller_nick:seller_nick,
        start_modified:start_modified,
        end_modified:end_modified,
        page_no:page_no,
        page_size:page_size,
  },cb);
};