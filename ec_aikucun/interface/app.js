/**
 * Created by Dbit on 2016/10/16.
 */
'use strict';
let _=require('lodash');
if (!_.get(global.config,'enablelist.interface')) {
    global.logger.warn('未开启接口服务设置!');
    return;
}

require('./globals');
let Thenjs=require('thenjs');
let mongoConf=require('./config').mongodb;
const requireDir=require('require-dir');

let masterDb;
let sysParms=require('./sysParms');

let status=''; //starting,started
let events=require('events');
let emitter=new events.EventEmitter();
const moment=require('moment');
const path=require('path');
let start_time=moment(new Date()).format('YYYY-MM-DD HH:mm:ss.SSS');
let DB=require('./db');

let INTERFACE_LIST = process.env.INTERFACE_LIST; //环境变量优化
if (INTERFACE_LIST) {
    let interfaceList = {};
    INTERFACE_LIST.split(',').forEach((name) => {
        interfaceList[name] = {session: process.env[name + '_session']};
    });
    global.config.interfaceList = interfaceList;
}

function start(cb) {
    if (arguments.length > 1) cb = arguments[arguments.length - 1];
    if (status==='started') { //已经初始化过了
        // console.debug('已经初始化过了');
        return cb();
    }else if(status==='starting') { //已经在初始化过程中了,添加监听
        // console.debug('等待初始化完成');
        emitter.once('started', ()=>{
            // console.debug('监听结束');
            cb();
        });
        return;
    }
    status='starting';
    // logger.info(status,__filename);
    // let _service=global.serviceList.add({name:'interface_root'});

    //启用的interface列表
    let interfaces=[];
    _.forIn(global.config.interfaceList,(value,key)=>{
        if (value) {
            // sysParms[key+'Shops']={}; //授权信息对象
            interfaces.push(key);
        }
    });

    Thenjs((cont)=> {
        //连接mongodb
        const masterDbName=mongoConf.master;
        sysParms.addConnection(masterDbName,cont);
    }).then((cont, db)=> {
        masterDb = db;
        sysParms.dbs.master = db;
        loadPTConfig({},{platform:interfaces},cont); //
    }).then((cont)=> {

        // sysParms.getTable('top','xianzai89','skus').find().toArray(console.debug);
        // setTimeout(()=>{
        //     sysParms.getTable('xjjx','','callApi_exchange_getRefuseReason').findOne(console.debug);
        // },1000);

        exports.common=require('./common');

        //加载平台模块
        _.forEach(interfaces,(value)=>{
            if (global.config.interfaceList[value]) {
                global.common.requireRemote(path.resolve(__dirname, './' + value), global.config.interfaceList[value],
                    (err, result) => {
                        if (err) return console.error(err);
                        exports[value] = result ? result.bind(null, value) : require('./' + value);
                    });
            }
        });
        cont();
    }).fin((cont, err)=> {
        if (err) {
            global.logger.error(err);
            return cb(err);
        }

        status='started';
        // logger.info(status,__filename);
        emitter.emit(status);
        // _service.end();
        cb();
    });
}

/**
 * 加载所有平台信息,以及授权店铺
 * @param ctx
 * @param option {{[platform]:Array|String}}
 * @param cb
 */
function loadPTConfig(ctx,option,cb) {
    // let where={};
    // if (_.has(option,'platform')) where.code = {$in: [].concat(option.platform)};
    Thenjs((cont) => {
        DB.getInterfaces(masterDb,option,cont)
    }).then((cont, rows) => { //连接接口数据库mongoDB
        Thenjs.each(rows, (cont, row) => { //加载平台数据库
            let {code, dbName} = row;
            Thenjs((cont) => {
                //设置平台参数信息
                sysParms.setConfig(code, row, cont);
            }).then((cont) => {
                //接口主数据库
                //     sysParms.addConnection(dbName,cont);
                // }).then((cont)=>{
                // let groups = _.keys(_.get(global, 'config.jdbc.list'));
                sysParms.loadShops(code, {}, cont); //加载所有店铺信息group: groups
            }).fin((c,err)=>{
                if (err) {
                    global.logger.error(code,'start failed:',err);
                }else{
                    global.logger.info(code,'start success!');
                }
                cont();
            });
        }).fin(cont);
    }).fin((c, err, result) => cb(err, result));
}

/**
 *
 * @param [ctx] {{platform,props,group}}
 * @param [data] {{[platform]}}
 * @param cb {Function}
 * @returns {*}
 */
async function main(ctx,data,cb) {

    let {platform, props} = ctx;
    console.debug(JSON.stringify({platform, props, data}));

    if (status === 'starting') {
        return cb('接口服务正在启动中:' + start_time);
    } else if (status === '') {
        return cb('接口服务未开启!');
    }

    let _index = platform.indexOf('_');
    if (_index >= 0) {
        platform = platform.slice(0, _index);
        if (platform === 'c') platform = 'center';
    }

    // if (args.length === 4 && platform) {
    //     let platform0 = platform;
    //     platform = sysParms.getOpenName(platform); //转换为开放平台代码
    //     if (!platform) return cb('平台无效:' + platform0); //未开启平台,直接返回成功
    // }


    // if (props.charAt(0) === '.') { //未定义的平台
    //     global.logger.warn('无效platform值:' + platform);
    //     return cb();
    // }

    // if (_.get(global, 'config.interfaceList.' + platform + '.' + props) === false) {
    //     return cb();//停用的直接返回成功
    // }


    if (platform === 'common') {
        let _platform = data.platform;

        if (!_platform || _platform === 'common' || _.has(exports.common, props + '.' + _platform)) {
            return exports.common(ctx, data, cb); //通用入口的走这里
        }

        if (!_platform) return cb('data.platform不能为空!');
        let _index = _platform.indexOf('_');
        if (_index >= 0) {
            _platform = _platform.slice(0, _index);
            if (_platform === 'c') _platform = 'center';
        } else {
            if (platform === 'vop') delete data.platform; //vop保持
        }
        let fn = exports[_platform];
        if (!(fn instanceof Function)) return cb(_platform + '服务还未初始化!');

        try{
            cb = await setLock(ctx, {
                platform: data.platform, seller: data.seller, method: props, async: data.async, type: data.type
            },cb);
        }catch (err) {
            return cb(err);
        }

        return fn(Object.assign({}, ctx, {props: 'apiExt.' + props}), data, cb); //独立入口的走这里
    }
    if (!platform) return cb('platform不能为空!');
    let fn = exports[platform];
    if (!(fn instanceof Function)) return cb(Error('无效的平台方法:' + platform));
    fn(ctx, data, cb);
}

/**
 *
 * @param [platform] {String}
 * @param [props] {String}
 * @param [data] {{[platform]}}
 * @param cb {Function|{ctx}}
 * @returns {*}
 */
function mainExt(platform,props,data,cb) {
    if (arguments.length === 1) {
        cb = arguments[0];
        return start(cb);
    }
    let ctx;
    if (arguments.length === 3) {
        data = arguments[1];
        if (typeof arguments[0] === 'string') {
            props = String(arguments[0]).replace(/\//g, '.');
            platform = props.slice(0, props.indexOf('.'));
            props = props.slice(props.indexOf('.') + 1);
            ctx = {platform, props};
        } else {
            ctx = arguments[0]; //
        }
        cb = arguments[arguments.length - 1];
    } else if (arguments.length === 4) {
        ctx = {
            platform: arguments[0],
            props: arguments[1]
        };
    } else {
        throw new Error('不支持的参数个数:' + arguments.length);
    }
    Object.assign(ctx, cb.ctx);

    let _this = this;
    // global.MyUtil.createDomain(cb, (err, cb) => {
    const cb2 = (err, result) => {
        if (err) console.error(err);
        if (err instanceof Error) err = {code: -1, msg: global.MyUtil.String(err)}; //兼容Socket无法传出Error对象
        cb(err, result);
    };
    main.apply(_this, [ctx, data, cb2]);
    // });
}

/**
 *
 * @type {{sysParms,common}}
 */
exports=module.exports=mainExt;
exports.sysParms=sysParms;
exports.start=start;
exports.message=require('./message');
if (_.get(global.config,'enablelist.test')) {
    exports.test = requireDir('./test');
}

start((err)=>(err && console.error(err)));

//防并发的方法列表
const syncMap= {
    'item.syncSkus': "item.syncItems",//回调方法
    'trades.syncOrders': "",
    'refunds.syncList': ""
};

/**
 *
 * @param ctx
 * @param data {{seller,platform,method,async,type}}
 * @param cb
 * @return {Promise<function>}
 */
async function setLock(ctx,data,cb) {
    let {group} = ctx;
    let {method, type} = data;
    if (syncMap.hasOwnProperty(method)) { //防并发的方法
        const HOSTNAME = require('os').hostname();
        try {
            let {platform, seller, async} = data;
            const path = 'tasklist:' + platform + ':' + method + ':' + seller + ':' + (type || '');
            const value = HOSTNAME + ',' + process.pid + ',' + group;
            let ret = await global.redis.set(path, value, 'NX', 'EX', 30); //返回OK,则证明可以继续,默认锁定30秒
            if (ret !== 'OK') { //表示未锁定住,可能正在运行
                return Promise.reject({
                    code: 1,
                    msg: '任务可能正在运行:' + JSON.stringify({
                        group,
                        platform,
                        seller,
                        method,
                        type
                    }) + '->' + await global.redis.get(path)
                });
            }

            // group='runsa';
            //异步先运行回调
            if (async && global.service && group && syncMap[method]) {
                cb(null, 'async');
                cb = null;
                delete data.async;
            }

            let cb2;
            let now = Date.now();
            let intervalHandle = setInterval(() => {
                let useSS = Number(((Date.now() - now) / 1000).toFixed(0)); //计算秒数
                if (useSS > 30 * 60) { //超过30分钟
                    let err = platform + ',' + seller + ',' + method + ',执行已超时:' + useSS + 's';
                    //发送错误报告
                    global.common.sendErrorReport({text: err});
                    return cb2(err);
                }
                console.warn(platform, seller, method, useSS + 's');
                global.redis.set(path, value + ',' + useSS + 's', 'XX', 'EX', 30).catch(console.error);
            }, 10 * 1000); //每10秒,重新加锁
            cb2 = async function (err, result) {
                if (err) console.error(err);
                if (intervalHandle) {
                    clearInterval(intervalHandle);
                    intervalHandle = null;
                }

                //支持结束时回调
                if (async && global.service && group && syncMap[method]) {
                    let data = {platform, group, topic: syncMap[method], content: {platform, seller}};
                    global.interface.message.send(data, (err) => {
                        err && console.error(global.MyUtil.String(err));
                    });
                }

                try {
                    await global.redis.del(path);
                } catch (err) {
                    console.error(err);
                }

                cb && cb(err, result);
                cb = null; //防重复回调
            };
            return cb2;
        } catch (err) {
            return Promise.reject(err);
        }
    }
    return cb;
}