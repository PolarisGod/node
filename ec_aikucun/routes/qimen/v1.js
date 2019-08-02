/**
 * Created by Dbit on 2016/10/12.
 */

'use strict';
const _=require('lodash');
let config=global.config || {};
let enablelist=config.enablelist || {};
let configEC=enablelist.service || {};
let express = require('express');
let router = express.Router();
exports.router=router;

if (enablelist.service==false) {
    global.logger.warn('未开启service服务!');
    return;
}

let my=require('../../common/MyUtil');
// let webDb=require(rootpath+'/service/db/web');
const util=require('util');
const moment=require('moment');
let iClient=require(rootpath+'/interface');
let xml2js=require('xml2js');
let xmlBuilder=new xml2js.Builder({rootName:'response'});
// var iconv=require('iconv-lite');
// var BufferHelper = require('bufferhelper');
// let service=require(rootpath+'/service');


function output(err,data){
    let lastResult;
    if (err) {
        if (err.msg) err=err.msg;
        if (err instanceof Error && err.name!=='SyntaxError') global.logger.error(util.inspect(err)); //
        return {
            flag: "failure",
            code:-1,
            message: (typeof err==='string') ? err :util.inspect(err)
        };
    }
    if (data.items){
        lastResult={
            flag:"success",
            code:0,
            message:data.message || '',
            items:data.items
        };
    } else {
        lastResult={
            flag:"success",
            code:0,
            message: data==null?[]:data
        };
    }
    return lastResult;
}

if (configEC.morgan) {
    const morgan = require('morgan');
    router.use(morgan(_.isString(configEC.morgan) ? configEC.morgan : 'dev'));
}

// var bodyParser = require('body-parser');
// require('body-parser-xml')(bodyParser);
// router.use(bodyParser.xml({
//     limit: '1MB',   // Reject payload bigger than 1 MB
//     xmlParseOptions: {
//         normalize: true,     // Trim whitespace inside text nodes
//         normalizeTags: true, // Transform tags to lowercase
//         explicitArray: false // Only put nodes in array if >1
//     }
// }));

let bodyParser = require('body-parser');
router.use(bodyParser.text({type:'application/xml', extended: false ,limit: '500000000'}));

function apiMiddleware(req,res,next){

    let {method,v,app_key,format,customerId}=req.query;
    let contentType;

    res.send=(err,data)=> {
        let result = err || data || {};
        if (['success', 'failure'].includes(result.flag) === false) {
            result = output(err, data);
        }
        // res.type('application/json');
        if (result.flag === 'success') {
            res.writeHead(200, {'Content-Type': contentType});
        } else {
            res.writeHead(202, {'Content-Type': contentType});
        }
        res.end(format === 'xml' ? xmlBuilder.buildObject(result) : JSON.stringify(result)); //callback用于JsonP"callback("++')'
    };

    if (format==='xml'){
        // console.debug('',req.body);
        contentType = 'application/xml;charset=utf-8';
        // if (req.method==='POST'){
        // let chunks = new BufferHelper();
        // req.on('data', (chunk) => {
        //     chunks.concat(chunk);
        // });
        // req.on('end', () => {
        //     chunks=iconv.decode(chunks.toBuffer(),'utf8');
        //     req.input=_.defaults({request:chunks},req.query);
        //     next();
        // });
        req.input= _.defaults((req.body ? {request:req.body} : {}),req.query);
        // }else {
        //     req.input = req.query;
        // }
        next();
    }else{
        contentType='application/json;charset=utf-8';
        req.input=_.merge({},req.query,req.body);
        next();
    }
}
exports.apiMiddleware=apiMiddleware;

router.use('/',(req,res,next)=> {
    apiMiddleware(req, res, next); //重写res.send
});

router.use('/',(req,res,next)=> {
    // console.debug(req.headers);
    iClient.qimen.message(req.input, res.send);
    // let result=await iClient.qimen.message(req.input);
    // res.send(result);
});

router.use('/',(req,res)=>{
    res.send('暂未开放'+req.originalUrl);
});

