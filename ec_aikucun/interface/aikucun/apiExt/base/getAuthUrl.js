
'use strict';

let pt = require('../../index');
const qs = require('querystring');
const _ = require('lodash');

module.exports = function (form, cb) {
    /**
     *
     * @type {{appKey,[authUrl],callback}}
     */
    let state=qs.parse(form.state,',',':');
    let openConfig=pt.theParms.getConfig();
    let baseQuery= {
        seller: state.seller||'',
        state: '',
    };
    _.merge(baseQuery,form);
    cb(null,_.get(openConfig,'callback')+'?'+qs.stringify(baseQuery));
};