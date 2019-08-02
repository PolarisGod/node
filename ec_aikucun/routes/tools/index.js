/**
 * Created by Dbit on 2017/8/11.
 */

let express = require('express');
let router = express.Router();
exports.router=router;

// let testModule=requireDir('../test');
// router.use('/:virDir?/test/nconf', testModule.nconf.router);
router.use('/wait',(req,res)=>{
    let times=req.query.times;
    setTimeout(()=>{
        res.send(String(times));
    },times);
});