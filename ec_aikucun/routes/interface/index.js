/**
 * Created by Dbit on 2016/10/12.
 */
/**
 * Created by Dbit on 2016/10/12.
 */

'use strict';

let express = require('express');
let router = express.Router();
let my=require('../../common/MyUtil');
let url=require('url');
const qs=require('querystring');
const util=require('util');
const bodyParser = require('body-parser');

router.use(
    bodyParser.urlencoded({ extended: false ,limit: '500000000'}),
    bodyParser.json({limit: '50000000'})
);

function output(err,data){
    if (err) {
        if (err instanceof Error && err.name!=='SyntaxError') logger.error(util.inspect(err)); //
        return {
            code: -1,
            msg: (typeof err==='string') ? err :util.inspect(err)
        };
    }

    //不存在head时,detail做为返回数据
    const list=(_.has(data,'detail') && !_.has(data,'head')) ? data.detail : data==null?[]:data;
    return {
        code: 0,
        list: list,
        "total": _.get(data, 'total') || ((list instanceof Array) && _.size(list)) || 0,
        "status": "success"
    };
}

router.use('/',(req,res,next)=>{ //重写res.send
    res.send=(err,data)=>{
        // res.type('application/json');
        if(err) {
            // res.status(202);
            res.writeHead(202,{'Content-Type': 'application/json;charset=utf-8'});
        }else{
            res.writeHead(200,{'Content-Type': 'application/json;charset=utf-8'});
        }
        res.end(JSON.stringify(output(err,data))); //callback用于JsonP"callback("++')'
    };
    if (req.method==='GET'){
        req.input=req.query;
    }else if(req.method==='POST'){
        req.input=req.body;
    }
    // console.debug(__filename,req.input);
    next();
});

//router.use('/taobao',require('./taobao'));

let _=require('lodash');

// let iClient=require('../../interface');
//已废弃,改用service接收授权码
router.use('/common/base.getToken/:platform',(req,res)=> {
    let platform = req.params["platform"];
    let ret = my.checkNull(req.input, ['state']);
    if (ret) return res.send(ret);
    let state = qs.parse(req.input.state, ',', ':');
    let {group}=state;
    if (!group) return res.send('state.group为空,请使用系统功能进行授权!');
    global.interface('common', 'base.getToken', _.merge({platform}, req.input), (err, result) => {
        if (err) return res.send(err);
        _.merge(result, state);
        res.redirect(state.sourceUrl + '?' + qs.stringify(result)); //前端转发授权后的用户数据
    });
});


// router.use('/common/:method/:platform',(req,res)=>{
//     let props=req.params["method"];
//     let platform=req.params["platform"];
//     let o=url.parse(req.url);
//     props+=(o.pathname.replace(/\//g,'.'));
//     if (props.charAt(props.length - 1)==='.') props=props.slice(0,-1);
//     global.interface('common',props,_.merge({platform},req.input),(err, result)=> {
//         res.send(err, result);
//     });
// });

//消息服务地址
router.use('/:platform/message',(req,res,next)=>{
    let platform=req.params["platform"];
    // if (!_.get(global.config.interfaceList,platform+'.message')) {
    //     let result='未开启该平台的消息接收服务:'+platform;
    //     console.warn(result);
    //     return res.send(result);
    // }
    next();
});

router.use('/:platform/:props/:group?',(req,res,next)=> {
    // let {platform, method}=req.params;
    global.interface(req.params, req.input,(err,result)=>{
        if (err && err.code===404) return next();
        res.send(err,result);
    });
});

router.use('/',(req,res)=>{
    res.send('暂未开放'+req.originalUrl);
});

module.exports=router;