/**
 * Created by Dbit on 2016/10/13.
 */
'use strict';

let getToken=require('./getToken');
const path = require('path');
const logTable = path.basename(__dirname) + '_' + path.basename(__filename, '.js');
/**
 *
 * @param content {{appKey,appSecret,apiUrl,method,version}}
 * @param cb
 */
module.exports=(content,cb)=> {
    getToken.refreshToken(content,cb);
};
