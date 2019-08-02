
/**
 * Created by Dbit on 2016/10/13.
 */
'use strict';

let Thenjs = require('thenjs');
let _ = require('lodash');
let request = require('request');
let theParms = require('../../index').theParms;
let moment = require('moment');
let my = global.common.MyUtil;
let pt = require('../../index');
/**
 *
 * @param content {{appKey,appSecret,apiUrl,method,version}}
 * @param cb
 */
function getToken(content, cb) {
    let { seller_nick, logTable } = content;
    if (!seller_nick) return cont('未设置接口账号:' + content);
    Thenjs((cont) => {
        //noinspection JSDuplicatedDeclaration
        restToken({
            client_id: _.get(content, 'appKey'),
            password: _.get(content, 'appSecret'),
            url: _.get(content, 'apiUrl'),
            method: _.get(content, 'method'),
            url: _.get(content, 'version'),
        }, cont);
    }).fin((cont, err, data) => {
        if (err) cont(err);
        cb(null, data)
    }).fail((cont, err) => {
        cb(pt.theParms.getPlatform() + '消息:' + my.String(err));
    })
}

/**
 *
 * @param content {{refresh_token}}
 * @param cb
 */
getToken.refreshToken = (content, cb) => {
    let { seller_nick, logTable } = content;
    let logInfo, table;
    if (!seller_nick) return cb('未设置接口账号:' + content);
    Thenjs((cont) => {
        restToken({
            client_id: _.get(content, 'appKey'),
            password: _.get(content, 'appSecret'),
            url: _.get(content, 'apiUrl'),
            method: _.get(content, 'method'),
            version: _.get(content, 'version'),
        }, cont);
    }).fin((cont, err, data) => {
        if (err) cont(err);
        cb(null, data)
    }).fail((cont, err) => {
        cb(pt.theParms.getPlatform() + '消息:' + my.String(err));
    })
};

module.exports = getToken;

/**
 * 根据code获取token
 * @param option {{grant_type,[code],[refresh_token]}}
 * @param cb {Function}
 */
function restToken(paramsList, cb) {
    request({
        method: 'POST',
        url: `${_.get(paramsList, 'url')}/${_.get(paramsList, 'version')}/${_.get(paramsList, 'method')}`,
        headers: {
            'cache-control': 'no-cache',
            'content-type': 'application/x-www-form-urlencoded'
        },
        form: _.pick(paramsList, ['client_id', 'password'])
    }, (err, res, body) => {
        if (err) {
            return cb(err, body)
        }
        let oBody;
        try {
            oBody = JSON.parse(body);
        } catch (e) {
            return cb('解析失败:' + body)
        }
        if (res.statusCode === 201 || res.statusCode === 200) {
            if (oBody.success) {
                return cb(null, oBody)
            }
            else {
                let err = {
                    code: _.get(oBody, 'error.code'),
                    msg: _.get(oBody, 'error.msg')
                }
                return cb(err)
            }
        }
    });
}