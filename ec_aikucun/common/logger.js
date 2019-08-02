/**
 * Created by Dbit on 2017/5/28.
 */
const log4js=require('log4js');
const path=require('path');
const _=require('lodash');
// const Thenjs=require('thenjs');
// let loggers={};

exports.consoleLevel = _.get(global.config, 'log.console') || 'WARN';
let filename = global.config.type;
let filenameAppend = _.get(global,_.get(global.config, 'log4js.filenameAppend','process.env.NODE_APP_INSTANCE'));
if (filenameAppend) filename += '-' + filenameAppend;

log4js.configure({
    appenders: {
        category_file: {
            type: 'multiFile',
            base: global.tempDir || './temp',
            property: 'categoryName',
            extension: '/logs/' + filename + '.log',
            maxLogSize: 10240000,
            backups: 50,
            compress: true
        },
        default_file: {
            type: 'file',
            filename: path.join(global.logDir || './temp/logs', filename + '.log'),
            maxLogSize: 10240000,
            backups: 50,
            compress: true
        },
        console: {type: 'console', layout: {type: 'pattern', pattern: '%[[%d{yyyy-MM-dd hh:mm:ss.SSS}] [%p] %c -%] %m' }},
        all_in_file: {type: 'logLevelFilter', appender: 'category_file', level: 'debug'},
        warn_console: {type: 'logLevelFilter', appender: 'console', level: exports.consoleLevel}
    },
    categories: {
        console: {appenders: ['default_file', 'console'], level: exports.consoleLevel}, //只接受warn+error显示并写入默认文件
        notice: {appenders: ['default_file', 'console'], level: 'debug'}, //全部显示并写入默认文件
        default: {appenders: ['all_in_file', 'warn_console'], level: 'debug'} //按分组全部写入对应文件,仅error输出控制台,
    },
    pm2: _.get(global.config, 'log4js.pm2-intercom', false),
    disableClustering: _.get(global.config, 'log4js.disableClustering', true) //默认使用当前进程收集日志
});

// global.common.logger.consoleLevel=_.get(global.config,'log.console') || 'WARN';
//仅WARN,ERROR输出
// global.common.logger.add({
//     group:config.type+'_console' , filename: path.join(global.logDir, config.type + '.log')
// });
// log4js.replaceConsole(global.common.logger.get(config.type+'_console')); //代替console.log
const logger = log4js.getLogger('console'); //使用default
console.debug = logger.debug.bind(logger);
console.log = logger.info.bind(logger);
console.info = logger.info.bind(logger);
console.error = logger.error.bind(logger);
console.warn = logger.warn.bind(logger);

//所有都打印
// global.common.logger.add({
//     group: config.type, filename: path.join(global.logDir, config.type + '.log'),console:'ALL'
// });
global.logger=log4js.getLogger('notice');

// log4js.loadAppender('logLevelFilter');
// log4js.loadAppender('file');
/**
 *
 * @param option {{group,filename,type:{console,file}}|String}
 * @param [cb]
 * @returns {*}
 */
function add(option,cb) {
    return cb();
    // if (_.isObject(option)) {
    //     addFilelog(option);
    //     return;
    // }
    // let group = option;
    // Thenjs((cont) => {
    //     global.getTempDir(group, 'logs', cont);
    // }).then((cont, logpath) => {
    //     let logfile = path.join(logpath, _.get(global, 'config.type', group) + '.log');
    //     addFilelog({group, filename: logfile});
    //     cont();
    // }).fin((c, err, result) => {
    //     cb(err, result);
    // });
}

// /**
//  *
//  * @param option {{group,filename,[console]}}
//  */
// function addFilelog(option) {
//     let {group, filename}=option;
//
//     if (loggers[group]) return;
//     let appender = log4js.appenders.console();
//     appender = log4js.appenders.logLevelFilter(option.console || exports.consoleLevel, "ERROR", appender); //WARN和ERROR打到控制台
//     log4js.addAppender(appender, group);
//     log4js.addAppender(log4js.appenders.file(filename, 0, 10240000, 50, true), group); //写文件
//     loggers[group] = true;
// }

function get(group){
    return log4js.getLogger(group);
}

//以下保持兼容
exports.add=add;
exports.get=get;
global.common.logger=exports;