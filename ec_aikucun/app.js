/**
 * Created by Dbit on 2016/6/1.
 */
'use strict';
let config=global.config || {};
// let logConfig=config.log || {};
let enablelist=config.enablelist ||{};

const express = require('express');
const uuid=require('uuid');
const _ = require('lodash');
// const util=require("util");
// const fs = require('fs');
// const path = require('path');
// const querystring=require("querystring");
// const bodyParser = require('body-parser');

//let options = {
//    key: fs.readFileSync('E:/ssl/myserver.key'),
//    cert: fs.readFileSync('E:/ssl/myserver.crt'),
//    passphrase: '1234'
//};

let app = express();
app.set('trust proxy', _.get(config,'www.trustProxy',true)); //从X-Forwarded-For中解析客户端IP
app.disable('x-powered-by');
app.all('/slb',(req,res,next)=> {
    // if (req.method==='HEAD')
    return res.sendStatus(200); //SLB检查
    // next();
});
const HOSTNAME=require('os').hostname();
app.use((req,res,next)=>{
	res.append('App-Name',config.type+'/'+HOSTNAME+'/'+process.pid);
    next();
});
let timeout = require('connect-timeout');
app.use(timeout(300 * 1000,{})); //请求超时设置

if (_.get(config,'module.cors',false)) {
    /**
     * added by wcy
     * see:https://www.npmjs.com/package/cors
     */
    let cors = require('cors');
    app.use(cors());
}

if (_.get(config,'module.compression',false)) {
    // gzip/deflate outgoing responses
    let compression = require('compression');
    app.use(compression());
}

//代理转发功能
if (enablelist.proxy) app.use(require('./routes/proxy').router);

// let favicon = require('serve-favicon')
// app.use(favicon(__dirname + '/public/favicon.ico'));
// app.use(express.static(__dirname + '/public')); //静态网页目录  请求都优先访问该目录,获取不到才会触发后端程序

 //静态网页目录  请求都优先访问该目录,获取不到才会触发后端程序
app.use('/:virtualdir/public',express.static(__dirname + '/public')); //静态网页目录  请求都优先访问该目录,获取不到才会触发后端程序

if (_.get(config,'module.morgan','dev')) {
    const morgan = require('morgan');
    app.use(morgan(_.get(config,'module.morgan','dev')));
}
app.use('/',function(req,res,next){
    res.locals.requestId = uuid.v1();
    if (!req.headers.protocol) req.headers.protocol = req.protocol;
    // res.set('AppType',config.type);
    // res.set('Host',req.headers.host);
    // if(logConfig.logurl) logger.info(req.protocol + '://' + req.headers.host + req.originalUrl);
    next();
});

// app.use(bodyParser.urlencoded({ extended: false ,limit: '500000000'}));
let cookieParser = require('cookie-parser');
app.use(cookieParser());

// const io = require('socket.io-client');

// let iclient=require(rootpath+'/interface'); //统一接口通道
// iclient(platform,method,data,callback);


// if (enablelist.interface){
//     let {socket}=enablelist.interface;
//     if (socket){
//         const client = io(socket, {
//             // transports: [ 'websocket' ], // <-- the default being [ 'polling', 'websocket' ]
//             // transportOptions: {
//             //     polling: {
//                     extraHeaders: {
//                         'x-clientid': 'runsaec'
//                     }
//                 // }
//             // }
//         });
//         global.interface=client.emit.bind(client,'interface');
//         client.on('connect_error',(err)=>{
//             global.logger.error('连接interface',socket,'错误',global.MyUtil.String(err.message||err));
//         });
//         client.on('connect_timeout', (timeout) => {
//             global.logger.error('连接interface',socket,'超时',timeout);
//         });
//         client.on('connect', (timeout) => {
//             global.logger.info('连接interface',socket,'成功');
//         });
//     }else{
//         global.interface=require('./interface/app');
//         global.interface((err,result)=>{
//             if (err) return console.error(err,result);
//         });
//     }
// }

// if (_.get(enablelist,'ec')) {
//     let {socket}=enablelist.ec||{};
//     if (socket) {
//         const client = io(socket,{
//             transports: [ 'websocket' ],
//             transportOptions: {
//                 polling: {
//                     extraHeaders: {
//                         'x-clientid': 'runsaec'
//                     }
//                 }
//             }
//         });
//         global.service = client.emit.bind(client, 'service');
//         client.on('connect_error',(err)=>{
//             global.logger.error('连接service',socket,'错误',global.MyUtil.String(err.message||err));
//         });
//         client.on('connect_timeout', (timeout) => {
//             global.logger.error('连接service',socket,'超时',timeout);
//         });
//         client.on('connect', (timeout) => {
//             global.logger.info('连接service',socket,'成功');
//         });
//     }else{
//         global.service=require('./service');
//     }
// } //默认开启service

app.use('/',require('./routes'));

app.use(function(req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    res.status(404).send(err);
});

module.exports = app;