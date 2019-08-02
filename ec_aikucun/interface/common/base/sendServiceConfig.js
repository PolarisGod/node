const pt=require('../index');
const util=require('util');

/**
 *
 * @param ctx {{usercode,group}}
 * @param option {{appKey,path,table,where,key}}
 */
async function findByUser(ctx,option) {
    let {group} = ctx;
    let {appKey, path, table, where, key, common} = option || {};

    try {
        let t_grants = pt.theParms.getTable('', 'grants');
        let attrib = "where." + table;
        let grantRow = await t_grants.findOne({appKey: appKey || ''}, {fields: {[attrib]: 1}});
        if (!grantRow) return Promise.reject('非法用户:' + appKey);
        let fixWhere = _.get(grantRow, attrib);
        if (!fixWhere) return Promise.reject('访问拒绝:' + appKey + '->' + table);
        let t_table = pt.theParms.getTable('', table);
        let rows = await t_table.find(Object.assign({}, where, fixWhere)).toArray();
        let paths = [];
        let values = [];
        for (let i = 0; i < rows.length; i++) {
            let keyValue = rows[i][key];
            if (!keyValue) return Promise.reject('invalid data(!' + key + '):' + global.MyUtil.String(rows[i])); //
            paths.push((path ? (path + ':') : '') + keyValue);
            values.push(rows[i]);
        }
        let servicePromise = util.promisify(global.service);
        return await servicePromise({group: group, method: 'basic.profile.setConfig'}, {
            common,
            path: paths,
            value: values
        });
    } catch (err) {
        return Promise.reject(err);
    }
}

module.exports=findByUser;