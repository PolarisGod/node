
'use strict';
let _ = require('lodash');
let moment = require('moment');
let pt = require('./index');
let Thenjs = require('thenjs');
// let request = require('request');
// let theParms = require('../sysParms');
let my = global.common.MyUtil;
let apiClient = require('./sdk/api');
let theParms = require('./theParms');
let config = theParms.getConfig();
/**
 *
 * @param oMethod {{method,version}}
 * @param seller {{seller}}
 * @param data {{object}}
 * @param cb
 * @constructor
 */
function Call(oMethod, seller, data, cb) {
    // let ret = my.checkNull(oMethod, ['method']);
    // if (ret) return cb(Error(ret));
    let logTable = oMethod.logTable;
    let group = oMethod.group;
    if (seller && (typeof seller === 'object')) {
        seller = null;
        data = arguments[1];
        cb = arguments[2];
    }
    Thenjs((cont) => {
            pt.theParms.getShop(seller, cont);
        }).then((cont, appInfo) => {
            if (!appInfo) return cont('未设置接口账号:' + seller);
        let table = pt.theParms.getTable(seller, 'callApi' + (logTable ? ('_' + logTable) : ''));
        let logInfo = {
            requestTime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss.SSS'),
            method: oMethod.method,
            seller: seller,
            requestData: data
        };
        Thenjs((cont) => {
            let sysParams = _.merge(_.pick(appInfo, ['appKey','appSecret']), oMethod);
            sysParams.apiUrl = _.get(config,'apiUrl');
            let appParams = data;
            let test = new apiClient(sysParams);
            let paramlist = test.rest(appParams);
            test.send(paramlist, cont);
        }).fin((cont, err, data) => {
            logInfo.responseTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss.SSS');
            logInfo.isSuccess = !(err);
            logInfo.responseData = err || data; //JSON.stringify(data);
            // table.insertOne(logInfo, (err) => err && console.error(err));
            //计数+日志
            pt.theParms.insertRestLog({
                group,
                method: oMethod.method,
                seller: seller,
                logTable
            }, logInfo).catch(console.error);

            if (err) {
                if (err.msg) err = (err.msg) + ':' + err.code;
                return cont(err);
            }
            else {
                return cb(null, data.oBody);
            }
        }).fail((cont, err) => {
            cb(pt.theParms.getPlatform() + '消息:' + my.String(err));
        });
    }).fail((cont, err) => {
        cb(err);
    });

    

}


module.exports = Call;
module.exports.Call = module.exports;
