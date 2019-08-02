global._=require('lodash');
global.logger=console;
global.nconf=require('nconf');
global.rootpath=process.cwd();
global.Thenjs=require('thenjs');

// const art=require('art-template');
// async function I18n(ctx,template,data) {
//     if (!data) return template;
//     return art.render(template, data);
// }
// global.I18n=I18n;

class SysError {
    /**
     * @param err {{}}
     */
    constructor(err) {
        this.code = -1; //未知错误
        this.msg = '';
        const type = Object.prototype.toString.call(err);
        if (type === '[object Object]') { //{}
            Object.assign(this, err);
        } else if (type === '[object Error]') { //Error
            this.code = -1;
            this.msg = global.MyUtil.String(err);
        } else { //String,Number,Array,Boolean,Function,Null,Undefined
            this.code = 2; //已知错误
            this.msg = global.MyUtil.String(err);
        }
        this.name = 'SysError';
    }

    appendMsg(msg) {
        this.msg = msg + this.msg;
        return this;
    }
}

global.toSysError=function(err) {
    if (err instanceof SysError) return err;
    return new SysError(err);
};