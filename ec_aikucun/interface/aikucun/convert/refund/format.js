let moment = require('moment');
let pt = require('../../index');
let _ = require('lodash')
let dict = require('../dict').Refund;
let MyUtil = require('../../../../common/MyUtil');
let Thenjs = require('thenjs')
module.exports = format;
function format(result, cb) {
    let { seller } = result;
    let checkStr = MyUtil.str_rmInvalidchars;
    if (!result) {
        return cb('未找到退单数据');
    }
    let refund = _.get(result, 'refund_get_response.refund');
    if(!refund){
        refund=result;
    }
    let { num_iid,sku,oid, refund_type, refund_fee, num } = refund;
    let sku_id=sku.split(';')[0];
    let refundPrice= _.round((Number(refund_fee)/Number(num)),2);
    let data = {
        _id: String(refund._id),
        head: {
            outnos: String(refund.refund_id), //-->outnos  //平台退货单号
            platform:'aolaigo',
            trade_from:'aolaigo', //退单只有查询的接口,审核(同意与拒绝不与平台交互)
            outnosold: String(refund.oid), //-->outnosold  平台原交易单号???
            total_fee: Number(refund.refund_fee) || 0, //兼容refund_fee未传入的问题
            buyremark: checkStr(refund.reason) || '',
            reason: checkStr(refund.reason) || '',
            current_status:dict.STATUS[refund.status],  //
            bz1: String(refund.refund_version || ''),
            transcorp: refund.company_name || '',
            types: dict.REFUND_TYPE[refund.refund_type], //1.退货退款,2.退货换货,3.整单退款(发货前),4.整单退款(发货后)
            movenos: refund.sid || '',
            // shipping_date: moment(refund.created,['YYYY-M-D HH:mm:ss']).format('YYYY-MM-DD HH:mm:ss'),
            created: moment(refund.created, ['YYYY-M-D HH:mm:ss']).format('YYYY-MM-DD HH:mm:ss'), //
        },
        detail: [{
            childnosold: String(num_iid),
            sku_id:sku_id,
            nb:refund.num,
            price:refundPrice,  
            total_fee: Number(refund.refund_fee) || 0
        }]
    };
    if (refund_type === 3 || refund_type === 4) {
        delete data.detail;
        cb(null, data);
    }
    else {
        cb(null, data);
    }
}