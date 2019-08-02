/**
 * Created by Dbit on 2017/3/28.
 */
let pt = require('../../index');
const _ = require('lodash');
/**
 *
 * @param postData {seller,item_id,sku_id}
 * @param cb
 */
module.exports = function (postData, cb) {
    let { seller, item_id,sku_id } = postData;
    let data = {
        seller_nick: seller,
        pid: Number(item_id) || null
    };
    pt.iExt.getApi({
        filename: __filename,
    }, data, (err, result) => {
        let skuList = _.get(result, 'skulist');
        let res = [];
        if (err || !data) return cb(err, data);
        else {
            let raw = _.find(skuList, (sku) => {
                return (sku_id === sku.sku_id);
            });
            let result = format(_.merge(raw, { seller }))
            if (!raw) {
                _.forEach(skuList, (sku) => {
                    res.push(format(_.merge(sku, { seller })))
                })
                return cb(null, res);
            }
            cb(null, result);
        }
    });
};
function format(row) {
    let sku = _.get(row, 'skulist');
    return {
        seller: _.get(row, 'seller'),
        item_id: _.get(row, 'iid'),
        sku_id: _.get(sku || row, 'sku_id'),
        words: _.get(sku || row, 'outer_id'),
        quantity: Number(_.get(sku || row, 'quantity')),
    }
}