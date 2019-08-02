/**
 * Created by Dbit on 2017/8/27.
 */
const _=require('lodash');
const crypto = require('crypto');
const IV = Buffer.from('0102030405060708');
/**
 * aes 128 cbc加密 PKCS5Padding填充
 * @param data 原始数据
 * @param key 密钥 设备AccessCode前16个字符
 * @returns 密文Buffer
 */
function aes_128_cbc_encrypt(data, key){
    var cipher = crypto.createCipheriv('aes-128-cbc', key, IV);
    var crypted = cipher.update(data, 'utf8', 'binary');
    crypted += cipher.final('binary');
    crypted = new Buffer(crypted, 'binary').toString('base64');
    return crypted;
}
/**
 * aes 128 cbc解密，返回解密后的字符串
 * @param crypted 密文
 * @param key 密钥 设备AccessCode前16个字符
 * @returns 明文
 */
function aes_128_cbc_decrypt(crypted, key){
    // console.time('aes:'+crypted);
    let buf = new Buffer(crypted, 'base64');
    let decipher = crypto.createDecipheriv('aes-128-cbc', key, IV);
    let decoded = decipher.update(buf, 'binary', 'utf8');
    try{
        decoded += decipher.final('utf8');
    }catch (e){
        e.stack=crypted+' '+e.stack;
        throw e;
    }
    // console.timeEnd('aes:'+crypted);
    return decoded;
}
exports.encrypt=aes_128_cbc_encrypt;
exports.decrypt=aes_128_cbc_decrypt;

exports.hmac_md5=function(concatStr,key){
    // console.time('hmac_md5:'+concatStr);
    let hmac=crypto.createHmac('md5',key);
    hmac.update(concatStr,'utf8');
    return hmac.digest();
};