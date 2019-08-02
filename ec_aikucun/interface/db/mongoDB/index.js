/**
 * Created by Dbit on 2016/10/12.
 */
/**
 * Created by Dbit on 2016/9/21.
 */
'use strict';
const _=require('lodash');
const crypto=require('crypto');
let MongoClient = require('mongodb').MongoClient;
let mongodb={};
let config=global.config.mongodb;
let Thenjs=require('thenjs');

exports.mongodb=mongodb;

/**
 *
 * @param database {string}
 * @param cb
 */
function connect(database,cb){

    let {encrypt}=config;
    if (encrypt) { //使用加密
        let logpass=process.env.logpass;
        // console.debug(logpass);
        if (!logpass) {
            console.warn('请先输入启动密钥!');
        }else{
            let password = _.get(config, 'pwd');
            // console.debug(password);
            //解密
            try{
                let key = new Buffer(logpass);
                let iv = new Buffer(0);
                let decipher = crypto.createDecipheriv(encrypt, key, iv);
                password = decipher.update(password, 'base64', 'utf8');
                password += decipher.final('utf8');
            }catch (e){
                global.logger.error('启动密钥错误:export logpass='+logpass,e);
                return;
                //throw e.stack='启动密钥不正确:'+logpass+'\n'+e.stack;
            }
            // console.debug(password);
            //使用新密码
            _.set(config, 'pwd',password);
            _.set(config, 'encrypt','');
        }
    }

    let url = 'mongodb://' + (config.host || '127.0.0.1') + (config.port ? (':' + config.port) : '') + '/' + database + '?' + (config.query || 'authSource=admin');
    // let _service=global.serviceList.add({name:url});
    let dbResult;
    Thenjs((cont)=>{
        MongoClient.connect(url,cont);
    }).then((cont,db)=> {
        dbResult=db;
        if (config.user) {
            // Use the admin database for the operation
            let adminDb = db.admin();
            // Authenticate using the newly added user
            adminDb.authenticate(config.user, config.pwd, cont);
            return ;
        }
        cont();
    }).then((cont,result)=>{
        mongodb[database] = dbResult;
        cont(null, dbResult);
    }).fin((cont,err,result)=>{
        if (err)return cb(err);
        global.logger.info(url);
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
    let interfaceTable = db.collection('interfaces'); //得到collection
    interfaceTable.find({code: {$in: platform}},{fields:{_id:0}}).toArray(cb); //获取所有
};

/**
 * @param db
 * @param option {{platform,group:Array,seller_nick}}
 * @param cb
 */
exports.getShops=function(db,option,cb) {
    let {platform, group, seller_nick} = option || {};
    let tableName = platform + 'Shops';
    let shopsTable = db.collection(tableName);
    let where = {};
    if (_.size(group)) where.group = {"$in": group};
    if (seller_nick) where.seller_nick = seller_nick;
    shopsTable.find(where, {fields: {_id: 0}}).toArray(cb); //仅加载启用的group对应的店铺
};
