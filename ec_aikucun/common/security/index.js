/**
 * Created by Dbit on 2017/8/29.
 */

const ENC_TYPE=['phone','nick','receiver_name'];
const _=require('lodash');
const Thenjs=require('thenjs');
const security=_.get(global.config,'enablelist.security',{toFixed:false}); //默认开启,但不开启模糊化
// let iClient=security && require('../../interface');

class DataUtil{
    constructor(){

    }
    static toMix(data,type){
        // return data;
        if (_.isString(data) === false) return data;
        // console.error(data);
        switch (type) {
            case 'phone':
            case 'simple':
                return data.slice(0, 3) + _.repeat('*',(data.length<7 ? 1 : (data.length - 7))) + data.slice(-4);
            // case 'nick':case 'receiver_name':
            // return data.slice(0, 1) + _.repeat('*',(data.length<2 ? 1 : (data.length - 2))) + data.slice(-1);
            default:
                //return data.slice(0, 3) + _.repeat('*',(data.length<6 ? 1 : (data.length - 6))) + data.slice(-3);
                let rightLen=Math.min(10,Math.round(data.length / 2));
                return data.slice(0, data.length - rightLen) + _.repeat('*',rightLen);
        }
    }
}
exports.DataUtil=DataUtil;

// console.log(DataUtil.toMix('12345678911','phone'));

if (_.get(global,'config.enablelist.security')) {
    let SecurityClient = require('./SecurityClient');
    global.topSecurity = new SecurityClient();
}
/**
 * 加密
 * @param data 明文
 * @param option {{user,type,platform,[version]}}
 * @param cb
 */
exports.encrypt=function encrypt(data, option, cb) {
    if (!security || !option.user) return cb(null, data);
    let {platform, user, version} = option || {};
    if (['top_dx', 'top_jx'].includes(platform)) { //代销用公共密钥,经销不加密
        user = '';
    } else if ((platform + '_').slice(0, 4) === 'top_') {
        // iClient.top.theParms.getSession(user,(err,session)=>{
        //     if (err) return cb(err);
        //
        // });
    } else {
        user = '_' + platform;//String(parseInt(user, 36)); //group转数字
        // topSecurity.encrypt(data, option.type, session,version, (err,result)=>cb(err,result||''));
    }
    topSecurity.encrypt(data, option.type, user, version, (err, result) => cb(err, result || ''));
};

/**
 * 解密
 * @param data 密文
 * @param option {{user,type,platform}}
 * @param cb
 */
exports.decrypt=function decrypt(data, option, cb) {
    if (!security || !option.user) return cb(null, data);
    let {platform, user} = option || {};
    if (['top_dx', 'top_jx'].includes(platform)) { //代销用公共密钥,经销不加密
        user = '';
    } else if ((platform + '_').slice(0, 4) === 'top_') {
        // console.time('getSession:'+user);
        // iClient.top.theParms.getSession(user,(err,session)=>{
        //     // console.timeEnd('getSession:'+user);
        //     if (err) return cb(err);
        //     topSecurity.decrypt(data,option.type,session,(err,result)=>cb(err,result||''));
        // });
    } else {
        user = '_' + platform; //String(parseInt(user, 36)); //group转数字
        // topSecurity.decrypt(data, option.type, session, (err,result)=>cb(err,result||''));
    }
    topSecurity.decrypt(data, option.type, user, (err, result) => cb(err, result || ''));
};

/**
 * 对数据进行模糊化
 * @param data
 * @param type
 */
exports.toMix=function toMix(data,type) {
    if (!security || !security["toFixed"]) return data;
    return DataUtil.toMix(data, type);
};



/**
 * 加密对象
 * @param data {Object} 明文数据
 * @param option {{fields:{phone:[],nick:[],receiver_name:[],simple:[]},user,platform,[version]}}
 * @param cb
 */
exports.encryptObject=function encryptObject(data, option, cb) {
    if (!security || !option.user) return cb(null,data);
    let encrypt_fields = option.fields;
    let encrypt_types = _.keys(encrypt_fields);
    Thenjs.eachLimit(encrypt_types, (cont, type) => {
        let values=_.map(encrypt_fields[type], (key) => _.get(data, key)); //明文数组
        let option2=_.defaults({type}, _.pick(option, ['user', 'platform'])); //选项
        //批量加密
        exports.encrypt(values,option2,(err, results) => { //加密结果
            if (err) return cont(err);
            _.forEach(encrypt_fields[type], (key, index) => {
                if (_.has(data, key) === false) return; //忽略
                let lastPoint = key.lastIndexOf('.');
                if (lastPoint === -1) {
                    _.set(data, 'encrypt_' + key, results[index]);
                } else {
                    _.set(data, key.slice(0, lastPoint) + '.encrypt_' + key.slice(lastPoint + 1), results[index]);
                }
                _.set(data, key, exports.toMix(_.get(data, key), type));
            });
            cont();
        });
    }, 1).fin((c, err) => {
        if (err) return cb(err);
        // console.debug(__filename,data);
        cb(null, data);
    });
};

/**
 * 解密对象
 * @param data {Object} 含密文的对象
 * @param option {{fields:{phone:[],nick:[],receiver_name:[],simple:[]},user,platform,[version],bakValue:Boolean}}
 * @param cb
 */
exports.decryptObject=function decryptObject(data, option, cb) {
    if (!security || !option.user) return cb(null,data);
    let encrypt_fields = option.fields;
    let encrypt_types = _.keys(encrypt_fields);
    Thenjs.eachLimit(encrypt_types, (cont, type) => {
        let values=_.map(encrypt_fields[type], (key) => _.get(data, key)); //密文数组
        let option2=_.defaults({type}, _.pick(option, ['user', 'platform'])); //选项
        //批量解密密
        // console.time('aes:'+type);
        if (option.bakValue===false){

        }else{
            _.forEach(encrypt_fields[type], (key, index) => {
                if (_.has(data, key) === false) return; //忽略
                let lastPoint = key.lastIndexOf('.');
                if (lastPoint === -1) {
                    _.set(data, 'encrypt_' + key, _.get(data, key));
                } else {
                    _.set(data, key.slice(0, lastPoint) + '.encrypt_' + key.slice(lastPoint + 1), _.get(data, key));
                }
            });
        }
        exports.decrypt(values,option2,(err, results) => { //加密结果
            // console.timeEnd('aes:'+type);
            if (err) return cont(err);
            _.forEach(encrypt_fields[type], (key, index) => {
                if (_.has(data, key) === false) return; //忽略
                _.set(data, key, results[index]);
            });
            cont();
        });
    }, 1).fin((c, err) => {
        if (err) return cb(err);
        // console.debug(__filename,data);
        cb(null, data);
    });
};