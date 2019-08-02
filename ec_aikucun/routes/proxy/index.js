/**
 * Created by Dbit on 2017/4/9.
 */
let express = require('express');
let router = express.Router();
const _=require('lodash');
let proxyTo=require('http-proxy').createProxyServer({});

let config=global.config || {};
let enablelist=config.enablelist ||{};

let keys=_.keys(enablelist.proxy);
_.forEach(keys,(key)=>{
    router.use('/'+key,(req,res)=>{
        let host=enablelist.proxy[key].host;
        let target=req.params.protocol+'://'+host+req.baseUrl;
        req.headers.host=host;
        proxyTo.web(req,res,{target});
    });
});

exports.router=router;