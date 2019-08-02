
const Sequelize=require('sequelize');

/**
 * Created by Dbit on 2016/9/21.
 */
'use strict';
let pools={};
let Thenjs=require('thenjs');
let poolManage=require('../../top/service/db/web');
let models=require('../../top/service/models');
let profile=require('../../top/service/base/profile');

exports.models=models;
exports.mongodb=pools;
exports.profile=profile;

/**
 *
 * @param database {string}
 * @param cb
 */
function connect(database,cb){
    Thenjs((cont)=>{
        poolManage.add({},{group:database},cont)
    }).then((cont,db)=> {
        let result2 = new MyPool(db);
        pools[database] = result2;
        cont(null, result2);
    }).fin((cont,err,result)=>{
        if (err)return cb(err);
        global.logger.info(database);
        // _service.end(err);
        cb(null,result);
    });
}

exports.connect=connect;

/**
 * @param db
 * @param where {{platform}}
 * @param cb
 */
exports.getInterfaces=function(db,where,cb) {
    let {platform} = where || {};
    models.getModel('interfaces').findAll({
        where: {code: {[Sequelize.Op.in]: platform}},
        attributes: ['code', 'name', 'data']
    }).then((rows) => {
        let result = rows.map((row) => {
            return _.defaults({}, row.dataValues, JSON.parse(row.data));
        });
        cb(null, result);
    }).catch(cb);
};

/**
 * @param db
 * @param option {{platform,group:Array,seller_nick}}
 * @param cb
 */
exports.getShops=function(db,option,cb) {
    let {platform, group, seller_nick} = option || {};
    let fns = [];
    let groupRows, tokenRows;
    fns.push(
        (async () => {
            let where = {
                names: platform, section: 'group'
            };
            if (_.size(group)) where.value = {[Sequelize.Op.in]: group};
            if (seller_nick) where.fieldname = seller_nick;
            groupRows = await models.getModel('online_profile').findAll({
                where, attributes: ['fieldname', 'value']
            });
        })()
    );
    fns.push(
        (async () => {
            let where = {
                names: platform, section: 'token'
            };
            // if (_.size(group)) where.value = {[Sequelize.Op.in]: group};
            if (seller_nick) where.fieldname = seller_nick;
            tokenRows = await models.getModel('online_profile').findAll({
                where, attributes: ['fieldname', 'value']
            });
        })()
    );

    Promise.all(fns).then(() => {
        let result = groupRows.map((row) => {
            let seller_nick = row.fieldname;
            let group = row.value;
            let tokenRow = _.find(tokenRows, {fieldname: seller_nick});
            return {
                seller_nick, 
                group,
                dbName : group, 
                token: JSON.parse(tokenRow.value)
            };
        });
        cb(null, result);
    }).catch(cb);
};

/**
 * @param where
 */
function formatWhere(where){
    let result={};
    for (let key in where){
        if (key.charAt(0)==='$') {
            let key2=Sequelize.Op[key.slice(1)];
            result[key2]=where[key];
            continue;
        }

        if (!where[key] || ['string','number','boolean'].includes(typeof where[key]) || (where[key] instanceof Array)) {
            result[key]=where[key];
            continue;
        }
        result[key]=formatWhere(where[key]);
    }
    return result;
}

class MyPool {
    constructor(pool) {
        this._pool = pool;
    }

    /**
     *
     * @param name
     */
    collection(name){
        return new MyCollection(models.getModel(name));
    }
}

class MyCollection {
    /**
     *
     * @param platform
     * @param seller_nick
     * @param tableName
     */
    constructor(platform,seller_nick,tableName) {
        if ((typeof platform)==='function') {
            this.table=platform;
            return;
        }
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
        cb(null, this.table);
        //cb()
    }

    find() {
        // let cb=_.last(arguments);
        // if ((cb instanceof Function)===false) { //promise链
        let myCollection = new MyCollectionLink(this);
        return myCollection.find.apply(myCollection, arguments);
        // }
        // this.initialTable((err,table)=>{
        //     if (err) return cb(err);
        //     table.find.apply(table,arguments);
        // });
    }

    count() {
        // let cb=_.last(arguments);
        // if ((cb instanceof Function)===false) { //promise链
        let myCollection = new MyCollectionLink(this);
        return myCollection.count.apply(myCollection, arguments);
        // }
        // this.initialTable((err,table)=>{
        //     if (err) return cb(err);
        //     table.find.apply(table,arguments);
        // });
    }

    findOne(cb) {
        this.initialTable((err, table) => {
            if (err) return cb(err);
            table.findOne.apply(table, arguments);
        });
    }

    insertOne(...args) {
        console.warn.apply(console,args.map(JSON.stringify));
        let cb=_.last(arguments);
        if ((cb instanceof Function)===false) { //promise链
            return Promise.resolve();
            // let myCollection = new MyCollectionLink(this);
            // return myCollection.insertOne.apply(myCollection, arguments);
        }
        return cb();
        // this.initialTable((err, table) => {
        //     if (err) return cb(err);
        //     table.insertOne.apply(table, arguments);
        // });
    }

    updateOne(cb) {
        this.initialTable((err, table) => {
            if (err) return cb(err);
            table.updateOne.apply(table, arguments);
        });
    }

    removeMany(cb) {
        this.initialTable((err, table) => {
            if (err) return cb(err);
            table.removeMany.apply(table, arguments);
        });
    }

    insertMany(cb) {
        this.initialTable((err, table) => {
            if (err) return cb(err);
            table.insertMany.apply(table, arguments);
        });
    }
}

class MyCollectionLink {
    constructor(myCollection) {
        this.collection = myCollection;
        //noinspection JSUnresolvedVariable
        this.fns = [];
        this.args = [];
    }

    find(where) {
        this.fns.push('findAll');
        this.args.push([{
            where: formatWhere(where)
        }]);
        this.exec(); //延迟执行
        return this;
    }

    sort() {
        this.fns.push('sort');
        this.args.push(_.toArray(arguments));
        return this;
    }

    limit() {
        this.fns.push('limit');
        this.args.push(_.toArray(arguments));
        return this;
    }

    skip() {
        this.fns.push('skip');
        this.args.push(_.toArray(arguments));
        return this;
    }

    toArray(cb) {
        this.fns.push('then');
        this.args.push([(result) => {
            cb(null, result);
        }]);
        this.fns.push('catch');
        this.args.push([cb]);
        return this;
    }
    count() {
        this.fns.push('count');
        this.args.push(_.toArray(arguments));
        this.exec(); //延迟执行
        return this;
    }
    exec() {
        let _this=this;
        process.nextTick(()=>{
            let cb = _.last(_.last(_this.args)); //
            _this.collection.initialTable((err, table) => {
                if (err) return cb(err);
                for (let i = 0; i < _this.fns.length; i++) {
                    // console.log(this.fns[i],this.args[i]);
                    table = table[_this.fns[i]].apply(table,_this.args[i]);
                }
            });
        });
    }

    insertOne(){
        this.fns.push('insertOne');
        this.args.push(_.toArray(arguments));
        this.exec(); //延迟执行
        return this;
    }

    then(){
        this.fns.push('then');
        this.args.push(_.toArray(arguments));
        return this;
    }

    catch(){
        this.fns.push('catch');
        this.args.push(_.toArray(arguments));
        return this;
    }
}

