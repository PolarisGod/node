/**
 * Created by Dbit on 2016/10/13.
 */
'use strict';

let pt=require('../../index');

/**
 *
 * @param postData
 * @param cb
 */
module.exports=function (postData,cb){
    pt.iExt.getApi({
        filename:__filename,
        tablename:'',
        rowsprop:'',
        keyfield:''
    },postData,cb);
};


