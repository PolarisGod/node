/**
 * Created by Dbit on 2016/7/27.
 */
'use strict';

let _=require('lodash');
let iconv=require('iconv-lite');
let BufferHelper = require('bufferhelper');
const http=require("http");
const https=require("https");
/**
 *
 * @param option {{hostname,port,path,[charset]}}
 * @param sbody
 * @param cb
 */
function post(option,sbody,cb){
    const restUrl='http://' + option.hostname + ':' + (Number(option.port) || 80) + option.path;
    let cb0=cb,isCallback;
    cb=function(err,res,body) {
        if (isCallback) {
            global.logger.error('二次响应',restUrl, err, body);
            return;
        }
        isCallback = true;
        if (err) {
            if (err.stack) err.stack += restUrl;
            global.logger.error(err);
        }
        cb0(err,res, body);
    };

    _.defaults(option,{timeout:30 * 1000});
    let req = http.request(option, (res) => {
        //{statusCode:200,headers:""}
        
        let charset=option.charset||'utf8';
        _.omit(option,'charset');

        // res.setEncoding(charset || 'utf8');
        let chunks = new BufferHelper();
        res.on('data', (chunk) => {
            chunks.concat(chunk);
        });
        res.on('end', () => {
            chunks=iconv.decode(chunks.toBuffer(),charset);
            return cb(null,res,chunks);
        });
    });

    req.on('error', (e) => {
        return cb(e);
    });

    // write data to request body
    req.write(sbody);
    req.end();
}

/**
 *
 * @param option {{hostname,port,path,[charset]}}
 * @param sbody
 * @param cb
 */
function httpspost(option,sbody,cb){
    const restUrl='https://' + option.hostname + ':' + (Number(option.port) || 443) + option.path;
    let cb0=cb,isCallback;
    cb=function(err,res,body) {
        if (isCallback) {
            global.logger.error('二次响应',restUrl, err, body);
            return;
        }
        isCallback = true;
        if (err) {
            if (err.stack) err.stack += restUrl;
            global.logger.error(err);
        }
        cb0(err,res, body);
    };

    _.defaults(option,{timeout:30 * 1000});
    let req = https.request(option, (res) => {
        //{statusCode:200,headers:""}
        let charset=option.charset||'utf8';
        _.omit(option,'charset');

        // res.setEncoding(charset || 'utf8'); //utf8/ascii/hex
        let chunks = new BufferHelper();
        res.on('data', (chunk) => {
            chunks.concat(chunk);
        });
        res.on('end', () => {
            chunks=iconv.decode(chunks.toBuffer(),charset);
            return cb(null,res,chunks);
        });
    });

    req.on('error', (e) => {
        return cb(e);
    });

    // write data to request body
    req.write(sbody);
    req.end();
}

exports.post=post;
exports.httpspost=httpspost;