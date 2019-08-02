'use strict';
let path=require('path');
const _=require('lodash');
const requireDir=require('require-dir');
let project={
    path:{
        data:__dirname,
        root:process.cwd() //根目录
    }
};

let www={
    "port": 3002, //网站http端口号
    "host":'0.0.0.0',
    "cluster":false, //
    "virtualdir":"eshop"
};


// let enablelist= {
//     security: false,
// 	service:false,
//     interface: true
// };
let enablelist= {
    security: false,
	service: {
        post: 'http://127.0.0.1:8001',
        path:'/service/ec_service.io'
    },
    interface: true
};


let interfaceList={
    aikucun:true
};

let jdbc= {
    list: {runsa:true}
};

let log={
    "log": true,
    "logtime": false, //redirect时有问题
    "logurl": true,
    "request": [], /*['host','body']*/
    "response": false,
    // "email":true,
    // "morgan":'dev',
    "console":"ALL"
};

/**
 *
 * @type {{path: string, rundev: number, log: {log: boolean, logtime: boolean, logurl: boolean, request: null, response: boolean, email: boolean, morgan: boolean}, www: {port: number, cluster: boolean}, enablelist: {wechat: boolean, taobao: boolean, jos: boolean, demo: boolean, auth: boolean, interface: boolean}, session: function, jdbc: {driver: [], list: {taobao: {url: string, drivername: string, minpoolsize: number, maxpoolsize: number, properties: {user: string, password: string}, keepalive: {interval: number, query: string, enabled: boolean}, maxidle: number, logging: string}, test: {url: string, drivername: string, minpoolsize: number, maxpoolsize: number, properties: {user: string, password: string}, keepalive: {interval: number, query: string, enabled: boolean}, maxidle: number, logging: string}}}, mongodb: {host: string, port: number, master: string}, maintain: {g_color_len: number, g_color_s: number, g_size_s: number, g_size_len: number}}}
 */
module.exports={
    type:path.basename(__filename,'.js'),
    path:project.path,
    rundev: 1,
    log:log ,
    www: www,
    enablelist: enablelist, //功能启用列表
    "jdbc": jdbc,
    mongodb:{
        host: '192.168.15.185',
        // host:'127.0.0.1',
        // host:'tel.runsa.cn',
        port: 27017,
        user: 'runsa',
        pwd: 'Runsa&345',
        master: 'master'
    },
    redis:{
        host:'127.0.0.1',
        port:6379,
        // pwd:'123456',
        db:0
    },
    interfaceList:interfaceList,
    module:{
        "cors":false,
        "compression":false,
        "morgan":'dev'
    }
};
