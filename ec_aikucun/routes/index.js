'use strict';

let express = require('express');
let router = express.Router();
const _=require('lodash');
const bodyParser = require('body-parser');
// const util=require('util');
let config=global.config || {};
let enablelist=config.enablelist || {};
// const qs=require('querystring');
// let session = require('express-session');
// let connectRedis=require('connect-redis');
// let RedisStore = connectRedis(session);

router.use('/:virDir/request',
    bodyParser.text({type:'*/*',limit: '50000000'}),
    (req,res)=> {
        res.send({
            headers: req.headers,
            query: req.query,
            body: req.body,
            params: req.params,
            url: req.originalUrl,
            method: req.method,
            ip: req.ip, ips: req.ips,
            remoteAddress: req.connection.remoteAddress
        });
    });

router.use('/:virDir/expose-gc',(req,res)=>{
    global.gc();
    res.send(req.params);
});


let tools = require('./tools');
router.use('/:virDir/tools', tools.router);

// router.post('/' + global.currentServer+'/:type.io/:platform/global/:method?',
//     bodyParser.urlencoded({ extended: false ,limit: '500000000'}),
//     bodyParser.json({limit: '50000000'}), (req, res) => { //method=common.saveConfig  [{},config]
//     if (req.query.secret !== process.env.secret) return res.send('Not Allow!');
//     let method = req.params['method'];
//     let fn = _.get(global, method);
//     if (_.isFunction(fn) === false) {
//         return res.send({
//             [method]: fn === undefined ? null : fn
//         });
//     }
//     if ((req.body instanceof Array) === false) return res.status(202).send(['参数不符合预期!']);
//     if (req.body.length === 0) return res.send([null, 'ok']);
//     fn.apply(fn, req.body.concat((err, result) => {
//         if (err instanceof Error) err = global.MyUtil.String(err);
//         // console.debug(req.body,err,result);
//         res.status(err ? 202 : 200).send([err, result]);
//     }));
// });

function getProcessDesc() {
    return global.config.type + ':' + (process.env.COMPUTERNAME || process.env.HOSTNAME);
}

//Url:/:platform.:seller?/:method?/:group?
/**
 * @type req {{body:[String,String,{[platform]}]}}
 */
router.use('/' + global.currentServer+'/:type.io/:seller?/:method?', bodyParser.json({limit: '50000000'}), (req,res,next)=> {
    if (req.method!=='POST') return next();
    if ((req.body instanceof Array) === false) return res.status(400).send([getProcessDesc()+':参数不符合预期!']);
    if (req.body.length===0) return res.send([null,getProcessDesc()+':ok']);
    const query = Object.assign({},req.params,req.query);
    const cb = (err, result) => {
        if (err) {
            if (err instanceof Error) err = global.MyUtil.String(err);
            console.error(JSON.stringify(query), JSON.stringify(err));
        }
        res.status(err ? 406 : 200).send([err, result]);
    };
    cb.ctx = query; //附加属性
    global[currentServer].apply(global[currentServer], req.body.concat(cb));
});

router.use('/:virDir?/interface', require('./interface'));
router.use('/:virDir?/qimen', require('./qimen').router);
router.use('/:virDir?/rest', require('./rest').router);

// if (enablelist.rest) {
//     router.use('/:virDir/router/:group/rest', (req, res, next) => {
//         res.locals.group = req.params["group"];
//         next();
//     }, require('./rest').router);
// }

//热更新指定模块
router.use('/clearCache/:module?',function(req,res){
  cleanCache(req.params.module);
  res.write(req.params.module+'\r\n');
  res.end(req.url)
});

function cleanCache(module){
  let path=require.resolve(module); //取出模块绝对路径
  console.warn(path);
  require.cache[path]=null;//清除指定模块缓存
}

module.exports = router;
