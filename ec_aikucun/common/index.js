'use strict';
/**
 * Created by Dbit on 2016/12/29.
 */
const HOSTNAME=require('os').hostname();
const USER=process.env.USERNAME || process.env.USER;
const util=require('util');
const _=require('lodash');
const path=require('path');
const mkdirp=require('mkdirp');
const qs=require('querystring');
/**
 * @type {{get,set,stores:{redis:{getValue,setValue}}}}
 */
const nconf=require('nconf');

/**
 *
 * @type {MyUtil}
 */
exports.MyUtil=require('./MyUtil');
exports.Model=require('./MyJdbc/lib/Model');
exports.SqlHelper=require('./MyJdbc/lib/SqlHelper');
exports.xlsx=require('./xlsx');
exports.request=require('./request');
// exports.logger=require('./logger');
exports.security=null;
exports.getAbout=(option,cb)=>{
    cb(null, {
        time: global.MyUtil.DateTimeString(new Date()),
        HOSTNAME: HOSTNAME,
        USER: USER,
        cwd: process.cwd(),
        type: global.config.type,
        www: _.get(global.config, 'www'),
        args:process.argv.slice(1).join(' ')
    });
};

/**
 *
 * @param option {{text}}
 * @param cb
 */
exports.sendErrorReport=(option,cb)=> {
    let {text}=option || {};
    if (!_.get(global.config,'log.email')) {
        cb && cb();
        return;
    }
    exports.getAbout({}, (err, result) => {
        let sendMail = require("./email").sendMail;
        sendMail({
            subject: HOSTNAME + '_' + global.config.type + '_ErrorReport',
            text: global.MyUtil.String(text)+'\n'+util.inspect(err || result)
        }, (err) => {
            err && console.error(err);
            cb && cb(err);
        });
    });
};


/**
 * 动态加载socket模块
 * @param modulePath
 * @param option {{socket,path}}
 * @param cb
 */
function requireSocket(modulePath,option,cb){
    let {socket,path,transports}=option;
    const io = require('socket.io-client');
    /**
     * @type {{emit,on,id}}
     */
    const client = io(socket, {
        transports: transports || ['websocket'],
        path: path,
        query: {
            "target": path
        }
    });
    // self[name]=function(cb) {
    //     cb = arguments[arguments.length - 1];
    //     cb(new Error(name + '中心还未连接!'));
    // };
    client.on('connect_error',(err)=>{
        global.logger.error('连接错误', modulePath,socket,path,global.MyUtil.String(err.message||err));
        // cb('connect_error');
    });
    client.on('connect_timeout', (timeout) => {
        global.logger.error('连接超时', modulePath, socket,path,timeout);
        cb('connect_timeout');
    });
    client.on('connect', () => { //timeout
        global.logger.info('连接成功',modulePath,socket,path,client.id);
        client.emit('registerGroup',_.keys(global.config.jdbc.list),(err)=>{
            err && console.error(err);
        });
        cb(null,client.emit.bind(client,'rpc'));
    });
    // client.on('rpc',serverObject);
}

/**
 *
 * @param modulePath
 * @param args
 * @param cb
 */
function requirePost_getAddPath(modulePath,args,cb) {
    let addPath = '';
    let query = '?host=' + HOSTNAME + '&target=' + modulePath + '&pid=' + process.pid + '&from=' + global.config.type + (args.length === 1 ? '&check=1' : '');
    if (modulePath === 'service') {
        let group, method;
        if ((typeof args[0]) === 'object') {
            let args0 = args[0] || {};
            group = args0['group'] || ''; //service({group,method},data,cb)
            method = args0['method'] || '';
        } else { //service(method,{group,content,[topic]},cb)
            method = args[0] || '';
            let args1 = args[1] || {};
            group = args1['group'] || '';
            if (method === 'interface.message') method += '.' + args1['topic'] || '';
        }
        addPath += '/' + group + '/' + method;
    } else if (modulePath === 'interface') { //interface('common',props,{platform...},cb) //interface(platform,props,{platform...},cb)
        let platform, props, seller, group;
        if (args.length === 3) { //({platform,method,group},data,cb)
            query += '&' + qs.stringify(args[0]);
            platform = args[0].platform;
            props = args[0].props || args[0].method;
            group = args[0].group;
            if (platform === 'common') platform = (args[1] && args[1]['platform'] || platform);
            seller = args[1].seller || '';
            args[3] = args[2];
            args[2] = args[1];
            args[1] = props;
            args[0] = args[0].platform;
        } else { //(platform,method,data,cb)
            platform = args[0];
            if (platform === 'common') platform = (args[2] && args[2]['platform'] || platform);
            props = args[1];
            seller = args[2].seller || '';
        }
        addPath += '/' + platform + '.' + encodeURIComponent(seller || '') + '/' + props;
        if (group) addPath += '/' + group;
    } else if (modulePath.indexOf('interface') === 0) { //interface开头 //interface(platform,props,{platform...},cb)
        let platform = args[0]; //第一个参数为平台代号
        addPath += '/' + platform;
    }
    addPath += query;
    cb && cb(null,addPath);
    return addPath;
}
exports.requirePost_getAddPath=requirePost_getAddPath;

/**
 * service
 * args [
 * {group,method:function|string,[usercode],[sourceUrl]},
 *  Object
 * ]
 */

/**
 * interface
 * args [String,String,{platform}]
 */

/**
 * 动态加载post
 * @param modulePath
 * @param option {{post,path}}
 * @param cb
 */
function requirePost(modulePath,option,cb){
    const Url=require('url');
    let restOption=Url.parse(option.post);
    const protocol=restOption.protocol==='http:'? 'post':'httpspost';
    // console.debug(restOption);

    function _main() {
        let args = Array.from(arguments);

        let addPath='';
        if (args.length>1) addPath+=requirePost_getAddPath(modulePath,args);

        let cb = args.pop();
        if (!cb.startTime) cb.startTime=(new Date()).getTime();
        let postBody = JSON.stringify(args);
        exports.request[protocol]({
            hostname: restOption.hostname,
            port: restOption.port,
            path: option.path + addPath,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                'Content-Length': Buffer.byteLength(postBody)
            }
        }, postBody, (err,status,response)=> {
            if (err) {
                if (err instanceof Error && (cb.times||0)<3 && (new Date().getTime() - cb.startTime)<30000) {
                    console.warn(modulePath,'error retrying',err);
                    if (cb.times) {
                        cb.times++;
                    }else{
                        cb.times=2;
                    }
                    return _main.apply(_main,args.concat(cb));
                }
                return cb(err);
            }
            // console.debug(postBody,response);
            let data = exports.MyUtil.parseJSON(response);
            if ((data instanceof Array) === false) {
                return cb({
                    code: -1, msg: option.path + addPath + ' ' + global.MyUtil.String(response)
                });
            }
            cb(data[0], data[1]);
        });
    }

    let fn=()=>{
        _main((err, result) => {
            let errInfo = '连接' + modulePath+' '+ option.post + option.path +' '+ global.MyUtil.String(err || result);
            global.logger[err ? "error" : "info"](errInfo);
            err && exports.sendErrorReport({text: errInfo}); //发送错误报告
        });
    };
    fn();
    let handle=setInterval(fn,3 * 60 * 1000); //每3分钟检查一次
    cb(null,_main);
}

exports.requireRemote=function(modulePath,option,cb) {
    modulePath = modulePath.slice(rootpath.length + 1); //.replace(path.sep,'.')
    global.logger.info('Loading:',modulePath);
    if (_.has(option, 'socket')) {
        return requireSocket(modulePath, option, cb);
    }
    if (_.has(option, 'post')) {
        return requirePost(modulePath, option, cb);
    }
    cb(null, null);
};

/**
 *
 * @param group
 * @param dirName
 * @param cb
 */
exports.getTempDir=(group,dirName,cb)=>{
    let _path=path.join(global.tempDir,group,dirName);
    mkdirp(_path,(err)=>{
        if (err) return cb(err);
        cb(null,_path);
    });
};

/**
 *
 * @param group
 * @param dirName
 * @param cb
 */
exports.getRemoteDir=function(group,dirName,cb){
    let _path=path.join(global.remoteDir,group,dirName);
    mkdirp(_path,(err)=>{
        if (err) return cb(err);
        cb(null,_path);
    });
};

/**
 *
 * @param [fn]:{function(path,value,cb)}
 * @param path
 * @param value
 * @param cb
 */
function _setCache(fn,path,value,cb) {
    if (arguments.length === 3) {
        [path, value, cb] = [arguments[0], arguments[1], arguments[2]];
        return nconf.stores.redis.setValue(path, value).then((v) => cb(null, v)).catch(cb);
    }
    if (Object.prototype.toString.call(fn) === '[object AsyncFunction]') {
        fn().then(result=>{
            _setCache(path, (value === null ? '' : value), (err) => cb(err, result)); //默认为'',标记为已缓存
        }).catch(cb);
    }else {
        fn((err, result) => {
            if (err) return cb(err);
            _setCache(path, (value === null ? '' : value), (err) => cb(err, result)); //默认为'',标记为已缓存
        });
    }
}
exports.setCache=exports.MyUtil.toAsync(_setCache);

/**
 *
 * @param [fn]:{function(path,cb)}
 * @param path
 * @param cb
 */
function _getCache(fn,path,cb) {
    if (arguments.length===2) {
        path = arguments[0];
        cb = arguments[1];
        return nconf.stores.redis.getValue(path).then((v) => cb(null, v)).catch(cb);
    }
    _getCache(path,(err, result) => {
        if (err) return cb(err);
        if (result !== null) return cb(null, result); //null为无缓存
        if (Object.prototype.toString.call(fn) === '[object AsyncFunction]') {
            fn().then((result) => {
                exports.setCache(path, (result === null ? '' : result), (err) => cb(err, result)); //默认为'',标记为已缓存
            }).catch(cb);
        }else{
            fn((err, result) => {
                if (err) return cb(err);
                exports.setCache(path, (result === null ? '' : result), (err) => cb(err, result)); //默认为'',标记为已缓存
            });
        }
    });
}
exports.getCache=exports.MyUtil.toAsync(_getCache);

function loadRedisConfig(cb) {
    console.warn('[' + global.MyUtil.DateTimeString(new Date()) + ']', '加载redis配置项...');
    //读取配置,
    nconf.get('config:' + global.config.type, (err, result) => {
        global.config = _.defaults({}, require(path.resolve(global.rootpath,global.configFile)), result); //本地配置key优先
        cb(null,'ok');
    });
}
exports.loadRedisConfig=loadRedisConfig;

/**
 *
 * @param path
 * @return {*}
 */
// function getConfigPath(path) {
//     let pathArray = path.split(':');
//     switch (pathArray[0]) {
//         case 'database':
//         case 'portal':
//             break;
//         default:
//             path = global.config.type + (path ? (':' + path) : '');
//     }
//     return path;
// }

/**
 *
 * @param ctx
 * @param option {{path:String|Array,[type],value,[common]:{String}}}
 * @param cb
 */
async function setConfig(ctx,option,cb) {
    let {path, value, common} = option;
    // if (path instanceof Array) {
    //     exports.MyUtil.eachLimit(path.map((k, index) => ({path: k, value: value[index]})), (cont, row) => {
    //         setConfig(ctx, Object.assign({}, option, row)).then((v) => cont(v)).catch(cont);
    //     }, 1, cb);
    //     return;
    // }
    if (!path) path = '';
    let prefixPath = 'config:' + (common || global.config.type) + ':';
    // return exports.setCache(path, value, cb);
    let ret = await global.redis.set(prefixPath + path, JSON.stringify(value));
    await global.redis.sadd(prefixPath + 'keys', path);
    return ret;
}
exports.setConfig=setConfig;

/**
 *
 * @param ctx
 * @param option {{common:{String}}}
 * @param cb
 */
function getAllConfigs(ctx,option,cb){
    let {common} = option;
    let fullPath = 'config:' + (common || global.config.type);
    delete nconf.stores.redis.cache.mtimes[fullPath];
    return nconf.get(fullPath,cb);
}
exports.getAllConfigs=getAllConfigs;

/**
 *
 * @param ctx
 * @param option {{path:String,type,common:{String}}}
 */
async function getConfig(ctx,option) {
    let {path, type, common} = option;
    let fullPath = 'config:' + (common || global.config.type) + ':' + (path || '');
    let value = await global.redis.get(fullPath);
    if (value == null) return value; //为空则直接返回
    if (value) value = JSON.parse(value);
    switch (type) {
        case 'STRING':
            return String(value);
        case 'NUMBER':
            return Number(value);
        case 'BOOLEAN':
            return Boolean(Number(value));
        case 'OBJECT': //nconf会首先JSON.parse
            // value = exports.MyUtil.parseJSON(String(value));
            // if (!value) {
            //     return cb(path + ' invalid value:'+value);
            // }
            // if (value instanceof Error) {
            //     return cb(path + ' parse error:' + exports.MyUtil.String(value));
            // }
            if ((value instanceof Object) === false) {
                console.log(typeof value, value);
                return Promise.reject(fullPath + ' invalid datatype:' + value + '-->' + type);
            }
            return value;
        default:
            return value;
    }
}
exports.getConfig=getConfig;

/**
 *
 * @param ctx {{}}
 * @param config {{version,type}}
 * @param cb
 */
function saveConfig(ctx,config,cb) {
    if (!config) return cb('config不能为空!');
    console.log('准备上传Config...');
    Thenjs((cont) => {
        if (!config.version) return cont('config.version不能为空!');
        console.log('获取远程version...');
        nconf.get('config:' + config.type + ':version', cont);
    }).then((cont, version) => {
        if (config.version <= version) return cont('version必须大于最后一次上传的值:' + config.version + '<=' + version);
    //     nconf.get('config:' + config.type, cont); // + ':version' //保持
    // }).then((cont, oldConfig) => {
    //     if (oldConfig && config.version <= oldConfig.version) return cont('version必须大于最后一次上传的值:' + config.version + '<=' + oldConfig.version);
        (function checkObject(config) {
            for (const key in config) {
                // if (!config.hasOwnProperty(key)) continue;
                let value = config[key];
                if (value == null) { //null/undefined
                    config[key] = false;
                    return;
                }
                if ((typeof value) === 'object' && (value instanceof Array) === false) {
                    if (Object.keys(value).length === 0) { //{}
                        config[key] = true;
                        return;
                    }
                    checkObject(value);
                }
            }
        })(config);
        console.log('清空远程Config...');
        nconf.clear('config:' + config.type, cont);
    }).then((cont) => {
        console.log('上传Config...');
        nconf.set('config:' + config.type, config, cont);
        //exports.setConfig(ctx,{value:config}, cont);
    }).fin((c, err) => cb(err));
}

exports.saveConfig=saveConfig;

/**
 *
 * @param redisConfig {{host,port,db,pwd,keyPrefix}|Array}
 */
function getRedisClient(redisConfig) {
    const Redis = require('ioredis');
    let redisCLient;
    if (!redisConfig) redisConfig=global.config.redis;
    if (redisConfig instanceof Array) {
        let option = redisConfig.map((row) => {
            let result = {
                host: row.host || '127.0.0.1',
                port: row.port || 6379,
                db: row.db || 0,
                keyPrefix:row.keyPrefix
            };
            let password = (row.password || row.pwd);
            if (password) result.password = password;
            return result;
        });
        redisCLient = new Redis.Cluster(option);
    } else {
        let option = {
            host: redisConfig.host || '127.0.0.1',
            port: redisConfig.port || 6379,
            db: redisConfig.db || 0,
            keyPrefix:redisConfig.keyPrefix
        };
        if (redisConfig.pwd) option.password = redisConfig.pwd;
        redisCLient = new Redis(option);
    }
    return redisCLient;
}
exports.getRedisClient=getRedisClient;