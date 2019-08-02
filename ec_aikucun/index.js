// important:必须在所有文件的最开始加载，否则不生效
// require('tingyun');

/**
 * ref:https://blog.risingstack.com/post-mortem-diagnostics-debugging-node-js-at-scale/
 */
// require('node-report');

/**
 * Created by Dbit on 2016/9/29.
 */
'use strict';
const HOSTNAME=require('os').hostname();
function now(){
    return (new Date()).toLocaleString()+'.'+(String(1000+new Date().getMilliseconds()).slice(1));
}
console.info('['+now()+']','HostName:'+HOSTNAME,'PID:'+process.pid);
let program = require('commander');
//定义参数,以及参数内容的描述
program
    .option('-f, --config <path>','配置文件')
    .option('-u, --upload','上传配置文件')
    .parse(process.argv);
let configFile=program["config"] || './data/conf';
global.configFile=configFile;
let config=require(configFile);
config.type=process.env["APP_NAME"] || config.type;
global.config=config;
console.log('['+now()+']','AppType:',config.type);
// const Thenjs=require('thenjs');
// const nconf = require('nconf');

let enablelist; //=(config.enablelist||{})
// let log4js=require("log4js");
// log4js.configure({});
const fs=require('fs');
const path=require('path');
const util=require('util');
// const _=require('lodash');
const mkdirp = require('mkdirp');
// const requireDir=require('require-dir');

require('./globals');

// global._=_;
// global.logger=console;
// global.nconf=nconf;
// global.rootpath=process.cwd();
// global.Thenjs=Thenjs;

const exitFns=[];
let uncaughtExceptionCount=0;
function uncaughtException(err) {
    uncaughtExceptionCount++;
    if ((err instanceof Error) === false) err = new Error(global.common.MyUtil.String(err));
    if (err.stack) err = HOSTNAME + " 未捕获的异常:" + config.type + ':' + err.stack;
    global.logger.error(err);

    Thenjs((cont) => {
        if (!_.get(config,'log.email')) return cont();
        let sendMail = require("./common/email").sendMail;
        sendMail(err.replace(/\n/g, '<br/>'), cont);
    }).fin(() => {
        if (uncaughtExceptionCount > 100) {
            exitFns.forEach((fn) =>fn());
            setTimeout(() =>process.exit(1), 1000);
        }
    }).fail((c, err) => {
        global.logger.error('error when exit', err.stack);
    });
}

process.on('uncaughtException', uncaughtException);
Thenjs.onerror=(err)=>{
    global.logger.error('Thenjs.onerror');
    uncaughtException(err);
};
process.on('unhandledRejection',uncaughtException);

/**
 *
 * @type {{parallelLimit, eachLimit, String, checkNull, restPages, str_rmInvalidchars, parseJSON, dateRangeSplit, DateString, TimeString, DateTimeString}}
 */
global.MyUtil=require('./common/MyUtil');
/**
 * @type {{MyUtil,Model,encryptObject:function(object,option,cb),decryptObject:function(object,option,cb),toMix:function(data,type),getTempDir,getRemoteDir}}
 */
global.common=require('./common');
if (config.redis) {
    require('./common/nconf-redis');
    let option = {
        client:global.common.getRedisClient(),
        namespace:'ec_interface',
        ttl: 60 * 1000 //程序缓存时长
    };
    nconf.use('redis', option);
    global.redis = nconf.stores.redis.getClient();
}
nconf.file({file:'nconf.json'}); //redis时,增加这句实现同步读取,否则只能异步

if (program["upload"]) {
    global.common.saveConfig({},config,(err,result)=>{
        if (err) {
            console.error('上传失败:', err);
            process.exit(1);
            return;
        }
        console.log('上传成功.');
        process.exit(0);
    });
    return;
}

global.getTempDir=global.common.getTempDir;

// let MyList=require('./common/MyList');
// global.serviceList= new MyList();
// let _mainService=global.serviceList.add({name:'ALL Ready'});
// global.serviceList.setMainList(_mainService);

// let events=require('events');
// global.project_event=new events.EventEmitter(); //设置一个全局事件


Thenjs((cont)=> {
    if (config.use === 'redis') { //读取redis里的参数
        global.common.loadRedisConfig(cont);
        return;
    }
    cont();
}).then((cont)=>{
    enablelist=(config.enablelist||{});
    config=global.config;
    if (process.env.APP_GROUP){
        let list={};
        process.env.APP_GROUP.split(',').forEach((value)=>{
            list[value]=true;
        });
        config.jdbc.list=list;
    }
    global.tempDir=path.resolve(rootpath,_.get(config,'path.tempDir') || './temp');
    global.logDir=path.resolve(rootpath,_.get(config,'path.logDir') ||'./temp/logs');
    global.remoteDir=path.resolve(rootpath,_.get(config,'path.remoteDir') || './temp');

    let dirList = [
        global.logDir,global.remoteDir,
        path.join(global.tempDir,'downtemp')];
    Thenjs.eachLimit(dirList, (cont, value) => {
        // console.info(value);
        mkdirp(value, cont);
    }, 10).fin(cont);
}).fin((cont,err)=> {
    if (err) return console.error(err);
    if (_.get(config,'log.email')) {
        // const USER=process.env.USERNAME || process.env.USER;
        global.common.getAbout({},(err,result)=>{
        let sendMail = require("./common/email").sendMail;
        sendMail({
                subject: HOSTNAME + '_' + config.type+'_启动',
            attachments: [{
                filename: HOSTNAME + '_' + path.basename(configFile),
                path: configFile
            }],
                text: util.inspect(_.defaults({event: 'start'},err||result))
        }, (err) => {
            err && console.error(err);
        });
        });
    }
    cont();
}).fin((cont,err)=>{
    if (err) return console.error(err);
    enablelist=(config.enablelist||{});
    require('./common/logger');//加载logger
    if (!_.get(config,'www.cluster')) return cont();
    //cluster 模式
    let numCPUs = require('os').cpus().length;
    let cluster = require('cluster');
    if (cluster.worker) {
        exitFns.push(() => {
            global.logger.warn('正在断开进程连接...');
            cluster.worker.disconnect();
        });
    }
    if (cluster.isMaster) {
        // let _service={name:'cluster',total:numCPUs,created:new Date(),success:[],error:[],finish:0};
        // global.serviceList.add(_service);
        global.logger.info("master start...");

        // Fork workers.
        for (let i = 0; i < numCPUs; i++) {
            cluster.fork();
        }

        cluster.on('listening',function(worker,address){
            global.logger.info('listening: worker ' + worker.process.pid +', Address: '+address.address+":"+address.port);
            // _service.end(null,{worker,address});
        });

        cluster.on('exit', function(worker/*, code, signal*/) {
            global.logger.info('worker ' + worker.process.pid + ' died');
        });
        return
    }
    cont();
}).fin((cont,err)=>{
    if (err) return console.error(err);
    _.merge(global.common, require('./common/security'));

    const currentServer='interface';
    global.currentServer=currentServer;
    let app = require('./app');

    let port = normalizePort(process.env.PORT || _.get(config,'www.port'));
    app.set('port', port); //设定port变量，意为访问端口

    let http = require('http');
    let debug = require('debug')('express_app:server');
    let server = http.createServer(app);
    let socketPath='/' + currentServer+'/'+ (config.type || '') + '-io';
    let io = require('socket.io')(server, {
        path: socketPath
    });

    if (config.redis) {
        // let {host, port, pwd, db}=config.redis;
        // const redis = require('socket.io-redis');
        // io.adapter(redis({ host, port}));
        // const adapter = require('socket.io-redis');
        // const redis = require('redis').createClient;
        // const pub = redis({port, host, db, password: pwd});
        // const sub = redis({port, host, db, password: pwd});
        // io.adapter(adapter({pubClient: pub, subClient: sub}));
    }

    let serverObject=global[currentServer]= require('./'+currentServer);
    // serverObject((err,result)=>{
    //     if (err) return console.error(err,result);
    // });
    serverObject.clients=new Map();

    io.use((socket, next) => {
        // console.log(socket.handshake.query);
        let {target} = socket.handshake.query;
        if (target===socketPath) {
            global.logger.info('client验证通过:'+target);
            return next();
        }
        console.error('验证失败:'+target,socket.handshake.query);
        return next(new Error('authentication error'));
    });

    // global.logger.debug(path.resolve(__dirname,'./service').slice(rootpath.length + 1));
    // let
    if (enablelist.service) {
        const name = 'service';
        global.common.requireRemote(path.join(__dirname, './' + name), enablelist.service,
            (err, outExports) => {
                if (err) return console.error(err);
                global[name] = outExports || require('./' + name);
            });
    }
    // if (enablelist.interface) {
    //     connectServer('interface', () => {
    //     });
    // }

    io.on('connection', function(client) {
        // let {from} = client.handshake.query;
        global.logger.info('Client Login', client.id);
        client.on('rpc', serverObject);
        //监听group注册
        client.on('registerGroup',(groups,cb)=> {
            global.logger.debug('注册group',groups.join(','));
            _.forEach([].concat(groups),(group)=>{
                serverObject.clients.set(group,client.emit.bind(client,'rpc'));
            });
            cb();
        });
    });
    io.on('error',(err)=>console.error);

    server.on('error', onError);
    server.on('listening', onListening);
    // let _service={name:'http://'+(config.www.host||'')+':'+port,total:1,created:new Date(),success:[],error:[],finish:0};

    if (Number(port)) {
        server.listen(port, config.www.host, (err) => {
            if (err) return console.error(err);
            global.logger.info('Socket启动成功',(config.www.host || '') + ':' + port,socketPath);
            global.logger.info("启动成功", (config.www.host || '') + ':' + port,config.type);
        });

        process.on('SIGINT', () => {
            global.logger.warn('等待退出...');
            server.keepAliveTimeout=1;
            server.close(()=>{
                setTimeout(()=>{
                    process.exit(0);
                },1000);
            });
        });
    }

    function normalizePort(val) {
        let port = parseInt(val, 10);
        if (isNaN(port)) return val;
        if (port >= 0) return port;
        return false;
    }

    /**
     * Event listener for HTTP server "error" event.
     */

    function onError(error) {
        if (error.syscall !== 'listen') {
            throw error;
        }

        let bind = typeof port === 'string'
            ? 'Pipe ' + port
            : 'Port ' + port;

        // handle specific listen errors with friendly messages
        switch (error.code) {
            case 'EACCES':
                global.logger.error(bind + ' requires elevated privileges');
                process.exit(1);
                break;
            case 'EADDRINUSE':
                global.logger.error(bind + ' is already in use');
                process.exit(1);
                break;
            default:
                throw error;
        }
    }

    /**
     * Event listener for HTTP server "listening" event.
     */

    function onListening() {
        let addr = server.address();
        let bind = typeof addr === 'string'
            ? 'pipe ' + addr
            : 'port ' + addr.port;
        debug('Listening on ' + bind);
    }
}).fail((cont,err)=>{
    global.logger.error(err);
});



