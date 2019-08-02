
let config=require('../config').mongodb;

if (config.dbms==='mysql'){
    module.exports = require('./mysql');
}else {
    module.exports = require('./mongoDB');
}