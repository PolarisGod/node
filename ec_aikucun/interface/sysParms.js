/**
 * Created by Dbit on 2016/10/17.
 */
'use strict';
let mongoConf=require('./config').mongodb;
let _=require('lodash');
let Thenjs=require('thenjs');
let mogoHelper=require('./common/mongoHelper');
const DB=require('./db');
const util=require('util');
let nconf = require('nconf');
const events=require('events');
let _emitter=new events.EventEmitter();
const SecurityUtil=require('../common/security/SecurityUtil');

/**
 *
 * @param text
 */
function encrypt(text) {
    //加密secret,token
    if (_.get(global.config, 'enablelist.security.token')) {
        return SecurityUtil.encrypt(text, 'seach', {
            secret: process.env.logpass,
            secretVersion: ''
        });
    }
    return text;
}

/**
 *
 * @param text
 */
function decrypt(text){
    return SecurityUtil.decrypt(text,'seach',{secret:process.env.logpass,secretVersion:''});
}

function getToday() {
    let now = new Date();
    return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
}

/**
 *
 * @type {{dbs,interfaces,
 * topShops,josShops,qinggeShops,vopShops,cainiaoShops,omsShops,
 * getConfig,getDbName,getDb,getTableName,getTable,getOpenName,
 * addShop,addConnecttion,getShops
 * }}
 */
let main={
    dbs:{},
    /**
     *
     * @param platform
     * @param value
     * @returns {*}
     */
    // interfaces:function(platform,value){
    //     if (arguments.length===1){
    //         return this.getConfig(platform);
    //     }
    //     return this.setConfig(platform,value);
    // },
     /**
     *
     * @param platform
     * @param value {{appSecret}}
     * @param [cb]
     */
    setConfig:function(platform,value,cb) {
        let {appSecret}=value || {};
        if (appSecret) value.appSecret=decrypt(appSecret);
        let args = ['interfaces:' + platform,value];
        if (arguments.length === 3) {
            if (_.isFunction(cb) === false) throw Error('第'+arguments.length+'个参数只能是Function!');
            args.push(cb);
        }
        return nconf.set.apply(nconf, args);
    },
    /**
     *
     * @param platform
     * @param [cb]
     */
    getConfig:function(platform,cb) {
        let args=['interfaces:' + platform];
        if (arguments.length === 2) {
            if (_.isFunction(cb) === false) throw Error('第'+arguments.length+'个参数只能是Function!');
            args.push(cb);
        }
        return nconf.get.apply(nconf, args);
    },
    // Shops:function (platform,seller_nick,value) {
    //     if (arguments.length === 1) return this.getShops(platform);
    //     if (arguments.length === 2) return this.getShop(platform, seller_nick);
    //     return this.setShop(platform, seller_nick, value);
    // },

    /**
     *
     * @param platform
     * @param [cb]
     * @returns {*}
     */
    getShops(platform,cb){
        let args = [platform+'Shops'];
        if (arguments.length === 2) {
            if (_.isFunction(cb) === false) throw Error('第'+arguments.length+'个参数只能是Function!');
            args.push(cb);
        }
        return nconf.get.apply(nconf,args);
    },

    /**
     *
     * @param platform
     * @param seller_nick
     * @param [cb]
     * @returns {*}
     */
    getShop(platform,seller_nick,cb) {
        let path = platform + 'Shops:' + seller_nick;
        if (arguments.length === 3) {
            nconf.get(path, (err, shopInfo) => {
                if (shopInfo !== null) return cb(null, shopInfo);
                main.loadShop(platform, {seller_nick}, cb);
            });
            return;
        }
        console.warn('即将废弃的调用,参数个数:' + arguments.length);
        return nconf.get(nconf, path);
    },

    /**
     *
     * @param platform
     * @param seller_nick
     * @param value {{appSecret,token:{access_token,refresh_token}}}
     * @param [cb]
     * @returns {*}
     */
    setShop(platform,seller_nick,value,cb){
        let {appSecret,token}=value || {};
        let {access_token,refresh_token}=token || {};
        if (appSecret) value.appSecret=decrypt(appSecret);
        if (access_token) token.access_token=decrypt(access_token);
        if (refresh_token) token.refresh_token=decrypt(refresh_token);
        let args = [platform + 'Shops:' + seller_nick, value];
        if (arguments.length === 4) {
            if (_.isFunction(cb) === false) throw Error('第'+arguments.length+'个参数只能是Function!');
            args.push(cb);
        }
        nconf.clear(args[0],(err)=> { //先清空
            if (err) console.error('nconf.clear', args[0], err);
        return nconf.set.apply(nconf, args);
        });
    },

    //topShops
    //josShops
    //omsShops
    //vopShops
    /**
     *
     * @param platform
     * @param [cb]
     * @return {{apiUrl,appKey,appSecret,tokenUrl,messageUrl,callback}}
     */
    // getConfig(platform,cb){
    //     return this.getConfig.apply(this,_.toArray(arguments));
    // },
    /**
     *
     * @param platform {string}
     * @param [seller_nick] {string}
     * @param cb
     */
    getDbName(platform,seller_nick,cb){
        if (!platform || (platform === 'common')) {
            cb && cb(null, mongoConf.master);
            return mongoConf.master;
        }

        if(!seller_nick) {
            // if (seller_nick===undefined) global.logger.warn('getDbName','seller_nick=undefined');
            cb && cb(null, platform); //group/platform
            return platform;
        }
        //同步(已废弃)
        // if (!cb) return global.common.getCache(platform+'Shops:'+seller_nick+':dbName'); //

        let _this = this;
        global.common.getCache((cb) => {
            _this.loadShop(platform,{seller_nick}, (err, row) => {
                if (err) return cb(err);
                return cb(null, _.get(row, 'dbName'));
            });
        },platform+'Shops:'+seller_nick+':dbName', (err, dbName) => {
            if (err) return cb(err);
            // let dbName = _.get(shopInfo, 'dbName');
            if (!dbName) {
                if (platform === 'qimen') {
                    dbName = seller_nick;
                } else {
                    global.logger.warn('getDbName失败:' + platform + '.' + seller_nick);
                }
            }
            if (!dbName) dbName = platform; //_.get(_this.interfaces(platform), 'dbName');
            return cb(null, dbName);
        });
        // console.log(_this);
        // if (!dbName) throw new Error(util.inspect({msg:'未获取到该店铺dbName',platform,seller_nick}));
    },
    /**
     *
     * @param platform {string}
     * @param [seller_nick] {string}
     * @param cb
     * @returns {Collection}
     */
    getDb(platform,seller_nick,cb){
        if (!platform || (platform === 'common')) {
            if (cb) return cb(null, this.dbs.master);
            return this.dbs.master;
        } //返回主数据库
        let _this = this;
        this.getDbName(platform, seller_nick, (err, dbName) => {
            if (err) return cb(err);
            _this.addConnection(dbName, cb);
        });
    },
    getTableName(platform,seller_nick,tableName){
        let tableName2='';
        if (seller_nick){
            if (platform && platform!='common'){
                tableName2+=platform+'_';
            }
            tableName2+=seller_nick+'_';
        }
        tableName2+=tableName;
        return tableName2;
    },
    /**
     * 获取mongodb对应的表
     * @param platform {string}
     * @param seller_nick {string}
     * @param tableName {string}
     * @returns {*|Collection}
     */
    getTable(platform,seller_nick,tableName){
        tableName=this.getTableName(platform,seller_nick,tableName);
        if (!seller_nick) {
            let dbName = this.getDbName(platform); //seller_nick为空时,可直接返回
            if (dbName && _.isObject(main.dbs[dbName])) {
                // console.log(dbName,_.isEmpty(main.dbs[dbName]),main.dbs[dbName]);
                return main.dbs[dbName].collection(tableName); //MongoTable
            }
        }
        return new MyCollection(platform, seller_nick, tableName); //包装的table
    },
    /**
     *
     * @param platform {string}
     */
    getOpenName(platform){
        if (!platform) platform='';
        if (platform==='common') return platform;
        switch (platform.toLowerCase()){
            case 'top':
            case 'tmall':
            case 'taobao':
                platform='top';
                break;
            case 'jd':
            case 'jos':
                platform='jos';
                break;
            case 'vop':
            case 'vph':
                platform='vop';
                break;
        }
        if (_.get(global.config,'interfaceList.'+platform)) return platform; //启用的才返回
        //未启用返回空
        global.logger.warn('未启用的平台接口:',platform);
        return ""; //string
    },

    /**
     * 增加新授权的shop
     * @param platform
     * @param data {{seller_nick,appSecret,dbName,token:{access_token,refresh_token}}}
     * @param cb
     */
    addShop(platform,data,cb){
        let _this=this;
        let {seller_nick,token,appSecret}=data || {};
        if (!seller_nick) return cb({code:-5,msg:'addShop:seller_nick不能为空!'});
        if (appSecret) data.appSecret=encrypt(appSecret);
        let {access_token,refresh_token}=token || {};
        if (access_token) token.access_token=encrypt(access_token);
        if (refresh_token) token.refresh_token=encrypt(refresh_token);

        Thenjs((cont)=>{
            let db=_.get(main,'dbs.master');
            /**
             *
             * @type {Collection}
             */
            let table= db.collection(platform+'Shops');
            mogoHelper.removeAndInsert(table,{seller_nick},data,cont);
        }).then((cont)=>{
            _this.loadShop(platform,{seller_nick},cont);
        }).fin((c,err,result)=>{
            cb(err,result); //失败
        });
    },
    /**
     *
     * @param dbName {string}
     * @param cb
     */
    addConnection(dbName,cb){
        let db = main.dbs[dbName];
        if (db) return cb(null,db);
        if (main.dbs.master) {
            db = main.dbs.master.db(dbName); //如果dbName已经存在,db函数会直接返回出来
            main.dbs[dbName] = db;
            return cb(null, db);
        }
        if (_.isObject(main.dbs[dbName])) return cb(null, main.dbs[dbName]); //已经打开功能
        const tempStatus = 'starting';
        _emitter.once(dbName, cb); //启动后再调用
        if (main.dbs[dbName] === tempStatus) return;
        main.dbs[dbName] = tempStatus; //'正在初始化连接池,请稍候...';

        DB.connect(dbName, (err, db)=> {
            if (err) {
                _emitter.emit(dbName,err);
                delete main.dbs[dbName]; //连接失败
                return ;//cb(err);
            }
            main.dbs[dbName] = db;
            _emitter.emit(dbName,null,db);
            // cb(null,db);
        });
    },
    /**
     *
     * @param platform
     * @param cb
     */
    // getShops(platform,cb){
    //     cb(null,this.Shops(platform));
    // },

    /**
     *
     * @param platform
     * @param where {{group,[seller_nick]}}
     * @param cb
     */
    loadShops(platform,where,cb){
        let {seller_nick,group}=where || {};
        // let tableName=platform+'Shops';
        let masterDb=main.dbs.master;
        // let shopsTable=masterDb.collection(tableName);
        // let groups=_.keys(_.get(global,'config.jdbc.list'));
        Thenjs((cont)=> {
            // shopsTable.find(_.defaults({dbName:{"$in":groups}},where)).toArray(cont); //仅加载启用的group对应的店铺
            DB.getShops(masterDb, {platform, group: group,seller_nick}, cont);
        }).then((cont,rows)=>{
            Thenjs.eachLimit(rows,(cont,row)=>{
                //店铺信息
                main.setShop(platform,row.seller_nick,row,cont);
                // if (row.dbName) {
                //     //店铺数据库
                //     main.addConnection(row.dbName, cont);
                // }else{
                //     cont();
                // }
            },100).fin(cont);
        }).fin((cont,err,result)=>{
            cb(err,result);
        });
    },

    /**
     *
     * @param platform
     * @param where {{[group],seller_nick}}
     * @param cb
     */
    loadShop(platform,where,cb) {
        let {seller_nick, group} = where || {};
        // let groups=_.keys(_.get(global,'config.jdbc.list'));
        // if (group && groups.includes(group)===false) {
        //     return cb({code: -5, msg: 'group不在允许的范围:' + group});
        // }
        DB.getShops(main.dbs.master, {platform: platform, group: null, seller_nick}, (err, rows) => {
            if (_.size(rows) === 0) return cb({ code: -5, msg: '未授权的店铺:' + seller_nick }); //!!!可优化缓存,避免数据库读取压力
            let row = rows[0];
            main.setShop(platform, seller_nick, row, (err) => {
                if (err) return cb(err);
                return cb(null, row);
            });
        });
    }

};

/**
 * 各平台参数
 */
class BaseInfo {
    constructor(platform) {
        this._platform = platform;
        this._lastRestDate = '';
    }

    getPlatform() {
        return this._platform;
    }

    /**
     *
     * @param [cb]
     * @returns {*|{apiUrl, appKey, appSecret, tokenUrl, messageUrl, callback}}
     */
    getConfig(cb) {
        return main.getConfig.apply(main,[this._platform].concat(Array.from(arguments)));
    }

    getAuthUrl() {

    }

    /**
     *
     * @param seller_nick
     * @param cb
     */
    getDbName(seller_nick,cb) {
        main.getDbName(this._platform, seller_nick, cb);
    }

    /**
     *
     * @param seller_nick
     * @param cb
     */
    getDb(seller_nick,cb) {
        main.getDb(this._platform, seller_nick,cb);
    }

    /**
     *
     * @param seller_nick
     * @param tableName
     * @returns {Collection}
     */
    getTable(seller_nick, tableName) {
        return main.getTable(this._platform, seller_nick, tableName);
    }

    /**
     *
     * @param seller_nick
     * @param tableName
     * @returns {Collection}
     */
    getTableName(seller_nick, tableName) {
        return main.getTableName(this._platform, seller_nick, tableName);
    }

    /**
     * 获取卖家资料
     * @param seller_nick
     * @param cb {function(*=,{type,token,seller_nick}=)}
     */
    getSeller(seller_nick, cb) {
        if (!seller_nick) return cb({code:-5,msg:'seller_nick不能为空!'});
        main.getShop(this._platform,seller_nick,(err,sellerInfo)=>{
            if (!sellerInfo) return cb({code:-5,msg:'未授权的店铺:' + this._platform + '.' + seller_nick});
            cb(null, sellerInfo);
        });
    }

    /**
     * 获取店铺的token
     * @param seller_nick {string}
     * @param cb {function(*=,{access_token,expire_time,r2_valid,r2_expires_in,refresh_token,r1_valid,r1_expires_in}=)}
     * @returns {*}
     */
    getToken(seller_nick, cb) {
        if (mongoConf.dbms==='mysql') {
            DB["profile"]["getValue"]({path:this._platform + ':token:' + seller_nick,cache:false}).then((row) => {
                cb(null, row && JSON.parse(row)); //!!!可优化getSession
            }).catch(cb);
            return;
        }

        this.getSeller(seller_nick, (err, result) => {
            if (err) return cb(err);
            let token = _.get(result, 'token');
            if (!token) return cb({code:-5,msg:'token为空:' + seller_nick});
            cb(null, token);
        });
    }

    /**
     * 获取店铺的session
     * @param seller_nick {string}
     * @param cb {function}
     * @returns {*}
     */
    getSession(seller_nick, cb) {
        let _this=this;
        global.common.getCache((cb) => {
            _this.loadShop({seller_nick}, (err, row) => {
                if (err) return cb(err);
                return cb(null, _.get(row, 'token.access_token'));
            });
        }, this._platform + 'Shops:' + seller_nick + ':token:access_token', (err, session) => {
            if (err) return cb(err);
            // let session = _.get(token, 'access_token');
            if (!session) { //唯品的沙箱需要传空
                return cb({code: -5, msg: 'access_token为空:' + seller_nick});
            }
            cb(null, session);
        });
    }

    /**
     * 增加新授权的shop
     * @param data {{seller_nick}}
     * @param cb
     */
    addShop(data, cb) {
        main.addShop(this._platform, data, cb);
    }

    getShops(cb) {
        return main.getShops.apply(main,[this._platform].concat(Array.from(arguments)));
    }

    getShop(seller_nick,cb) {
        return main.getShop.apply(main,[this._platform].concat(Array.from(arguments)));
    }

    setShop(seller_nick,value,cb) {
        return main.setShop.apply(main,[this._platform].concat(Array.from(arguments)));
    }

    /**
     *
     * @param data
     * @param cb
     */
    loadShops(data, cb) {
        main.loadShops(this._platform, data, cb);
    }

    /**
     *
     * @param data
     * @param cb
     */
    loadShop(data, cb) {
        main.loadShop(this._platform, data, cb);
    }

    /**
     *
     * @param option {{group, logTable, seller, method}}
     * @param logInfo {{isSuccess:boolean}}
     */
    async insertRestLog(option, logInfo) {
        let {group, logTable, seller, method} = option;
        let self = this;
        let table;
        if (group) {
            table = main.getTable(group, '', this._platform + '_' + seller + '_callApi' + logTable)
        } else {
            table = this.getTable(seller, 'callApi_' + logTable);
        }
        await table.insertOne(logInfo);

        let today = getToday();
        let sumKey = 'report:rest:' + this._platform + ':' + String(today);
        //计数
        let ret = await global.redis.zincrby(sumKey, 1, method + '|' + seller + '|' + (logInfo.isSuccess ? 'success' : 'failed'));
        // console.debug('zincrby',result)
        if (self._lastRestDate !== today) {
            self._lastRestDate = today;
            await global.redis.expire(sumKey, 7 * 24 * 60 * 60); //最多保留7天
        }

        return ret;
    }
}

module.exports=main;
module.exports.BaseInfo=BaseInfo;


class MyCollection {
    /**
     *
     * @param platform
     * @param seller_nick
     * @param tableName
     */
    constructor(platform, seller_nick, tableName) {
        // console.debug('自定义Table',platform,seller_nick,tableName);
        //noinspection JSUnresolvedVariable
        this.platform = platform;
        this.seller_nick = seller_nick;
        this.tableName = tableName;
        /**
         *
         * @type {Collection}
         */
        this.table = null;
    }

    initialTable(cb) {
        if (this.table) {
            if (cb) return cb(null, this.table);
            return this.table;
        }

        let _this = this;
        let fn = new Promise((resolve, reject) => {
            main.getDbName(this.platform, this.seller_nick, (err, dbName) => {
                if (err) return reject(err);
                main.addConnection(dbName, (err, db) => {
                    if (err) return reject(err);
                    _this.table = db.collection(_this.tableName);
                    _this.s = _this.table.s;
                    resolve(_this.table);
                });
            });
        });
        if (cb) return fn.then(r => cb(null, r)).catch(cb);
        return fn;
    }

    find() {
        let myCollection = new MyCollectionLink(this); //链式调用
        return myCollection.find.apply(myCollection, arguments);
    }

    async count() {
        let cb;
        try {
            let table = await this.initialTable();
            return await table.count.apply(table, Array.from(arguments));
        } catch (err) {
            if (arguments[arguments.length - 1] instanceof Function) cb = arguments[arguments.length - 1];
            if (cb) return cb(err);
            return Promise.reject(err);
        }
    }

    async findOne() {
        let cb;
        try {
            let table = await this.initialTable();
            return await table.findOne.apply(table, Array.from(arguments));
        } catch (err) {
            if (arguments[arguments.length - 1] instanceof Function) cb = arguments[arguments.length - 1];
            if (cb) return cb(err);
            return Promise.reject(err);
        }
    }

    async insertOne() {
        let cb;
        try {
            let table = await this.initialTable();
            return await table.insertOne.apply(table, Array.from(arguments));
        } catch (err) {
            if (arguments[arguments.length - 1] instanceof Function) cb = arguments[arguments.length - 1];
            if (cb) return cb(err);
            return Promise.reject(err);
        }
    }

    async updateOne() {
        let cb;
        try {
            let table = await this.initialTable();
            return await table.updateOne.apply(table, Array.from(arguments));
        } catch (err) {
            if (arguments[arguments.length - 1] instanceof Function) cb = arguments[arguments.length - 1];
            if (cb) return cb(err);
            return Promise.reject(err);
        }
    }

    async removeMany() {
        let cb;
        try {
            let table = await this.initialTable();
            return await table.removeMany.apply(table, Array.from(arguments));
        } catch (err) {
            if (arguments[arguments.length - 1] instanceof Function) cb = arguments[arguments.length - 1];
            if (cb) return cb(err);
            return Promise.reject(err);
        }
    }

    async insertMany() {
        let cb;
        try {
            let table = await this.initialTable();
            return await table.insertMany.apply(table, Array.from(arguments));
        } catch (err) {
            if (arguments[arguments.length - 1] instanceof Function) cb = arguments[arguments.length - 1];
            if (cb) return cb(err);
            return Promise.reject(err);
        }
    }
}

class MyCollectionLink {
    constructor(myCollection) {
        this.collection = myCollection;
        //noinspection JSUnresolvedVariable
        this.fns = [];
        this.args = [];
    }

    find() {
        this.fns.push('find');
        this.args.push(Array.from(arguments));
        return this;
    }

    sort() {
        this.fns.push('sort');
        this.args.push(Array.from(arguments));
        return this;
    }

    limit() {
        this.fns.push('limit');
        this.args.push(Array.from(arguments));
        return this;
    }

    skip() {
        this.fns.push('skip');
        this.args.push(Array.from(arguments));
        return this;
    }

    async toArray() {
        let cb;
        try {
            let table = await this.collection.initialTable();
            for (let i = 0; i < this.fns.length; i++) {
                // console.log(this.fns[i],this.args[i]);
                table = table[this.fns[i]].apply(table, this.args[i]);
            }
            return table.toArray.apply(table, Array.from(arguments));
        } catch (err) {
            if (arguments[arguments.length - 1] instanceof Function) cb = arguments[arguments.length - 1];
            if (cb) return cb(err);
            return Promise.reject(err);
        }
    }
}