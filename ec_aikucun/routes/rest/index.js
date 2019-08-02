/**
 * Created by Dbit on 2016/10/12.
 */

'use strict';
const _=require('lodash');
let express = require('express');
const bodyParser = require('body-parser');
let router = express.Router();
exports.router=router;

router.use(bodyParser.text({type:'*/*',limit: '50000000'}));

router.use('/:platform',(req,res,next)=> {
    let {platform} = req.params;
    if (!_.get(global.interface, platform + '.message')) return next();
    // if (!scene) scene='wms';
    // if (['wms','pos','erp','crm'].includes(scene)===false) return next('不支持的场景:'+scene);
    let {format} = req.query;
    let contentType;

    if (!format) {
        let reqContentType = (req.headers["content-type"] || '').split(';')[0];
        if (reqContentType.includes('/xml')) { //format==='xml' ||
            format = 'xml';
        } else {
            format = 'json';
        }
    }
    if (format === 'xml') {
        contentType = 'application/xml;charset=utf-8';
    } else {
        contentType = 'application/json;charset=utf-8';
    }

    res.send = (err, data) => {
        let result = err || data || {};
        if (err) {
            res.writeHead(200, {'Content-Type': contentType});
        } else {
            res.writeHead(200, {'Content-Type': contentType});
        }
        // console.log(req.headers,__filename,data,contentType);
        res.end(global.MyUtil.String(result));
    };

    global.interface[platform].message(_.defaults({request: req.body}, req.query), res.send);
});

