
'use strict';
const crypto = require('crypto')
const _ = require('lodash');
const qs = require('querystring');
const request = require('request');
const Url = require('url');
const moment = require("moment");
//require('ssl-root-cas').inject();
/**
 *
 */
class apiClient {
    /**
     *
     * @param params {appid,appSecret,noncestr,timestamp,erp,erpversion,reqType}
     */
    constructor(params) {
        this.appid = params.appKey,
        this.appSecret = params.appSecret,
        this.appUrl = params.apiUrl,
        this.noncestr = '32412423',
        this.erp = 'e1',
        this.erpversion = '1.0',
        this.method = params.method,
        this.reqType = params.reqType
    }
    /**
     * 签名
     * @param sysParams {method,token}
     * @param appParams {*}
     */
    rest(appParams, cb) {
        let paramsList = {
            appid:this.appid,
            appsecret: this.appSecret,
            noncestr: this.noncestr,
            erp: this.erp,
            erpversion: this.erpversion,
            timestamp: moment(new Date()).format('X'),
        }

        let signTemp;
        let requestParams = {
            url: this.appUrl + this.method,
            headers: {
                'cache-control': 'no-cache',
                'content-type': 'application/json',
            },
            method:this.reqType,
            agentOptions: {
                rejectUnauthorized: false
            },
            qs:paramsList,
        };
        if (this.reqType=='GET'){
            //get
            Object.assign(paramsList, appParams);
            signTemp = () => {
                return Object.keys(paramsList).sort().map(key => {
                    return `${key}=${paramsList[key]}`
                }).join('&');
            };
        }else{
            //post    
            signTemp = () => {
                paramsList.body = JSON.stringify(appParams)
                return (Object.keys(paramsList).sort().map(key => {
                    return `${key}=${paramsList[key]}`
                }).join('&'));
            }; 
            requestParams.json = appParams;        
        }
        let addSalt = signTemp();
        requestParams.qs.sign = crypto.createHash('SHA1').update(addSalt).digest('hex');
        delete requestParams.qs.appsecret;
        if (this.reqType=='POST') {delete requestParams.qs.body;}
        return requestParams;
    }
    send(params, cb) {
        
        return request(params, (err, res, body) => {

            if (err) {
                return cb(err, body)
            }
            let oBody, method, dict;;
            try {
                if (params.method=='GET'){
                    oBody = JSON.parse(body);
                }else{
                    oBody = body;
                }
            } catch (e) {
                return cb('解析失败:' + body)
            }
            if (res.statusCode === 201 || res.statusCode === 200) {
                let flag = _.get(oBody, 'code');
                if (!flag) {

                    cb(null, {oBody,href:res.request.href});
                }
                else {
                    dict = require('../convert/dict').COMMON.ERRRORCODE
                    method = this.method;
                    let code = _.get(oBody, 'code');
                    let msg = _.get(oBody, 'message');
                    if (_.get(dict, `${method}.${code}`)) {
                        cb(null, {});
                    }
                    else {
                        err = {
                            code: code,
                            msg: msg,
                        }
                        cb({err,href:res.request.href});
                    }
                }
            }
        })
    }
}
module.exports = apiClient;