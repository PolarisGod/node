/**
 * Created by Dbit on 2016/11/24.
 */
'use strict';
let _=require('lodash');
const qs=require('querystring');
let api=require('../../app');
const path=require('path');
let method=path.basename(__dirname)+'.'+path.basename(__filename,'.js');

module.exports=main;

function main(data,cb) {
    let platform=_.get(data,'platform');
    // main[platform](data);
    delete data.platform;
    api(platform, 'apiExt.' + method, data,cb);
}

main.top=true;
main.jos=true;
main.vop=true;
// main.youzan=true;
