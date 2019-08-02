/**
 * Created by Dbit on 2017/8/27.
 */

class SecretContext {
    constructor() {
        this.secret = null; //秘钥值
        this.secretVersion = null; //秘钥版本号
        this.invalidTime = null; //过期时间(秒)
        this.maxInvalidTime = null;
        this.appConfig = null; //app配置信息

        this.cacheKey = '';
        this.session = '';
        // this.encryptPhoneNum = 0;
        // this.encryptNickNum = 0;
        // this.encryptReceiverNameNum = 0;
        // this.encryptSimpleNum = 0;
        // this.encryptSearchNum = 0;
        //
        // this.decryptPhoneNum = 0;
        // this.decryptNickNum = 0;
        // this.decryptReceiverNameNum = 0;
        // this.decryptSimpleNum = 0;
        // this.decryptSearchNum = 0;
        //
        // this.searchPhoneNum = 0;
        // this.searchNickNum = 0;
        // this.searchReceiverNameNum = 0;
        // this.searchSimpleNum = 0;
        // this.searchSearchNum = 0;

        // this.lastUploadTime = null;
        // this.lastUploadTime = new Date().getTime() / 1000;
    }

    /**
     *
     * @param context {SecretContext}
     * @returns {string}
     */
    // static toLogString(context) {
    //     return context.session + ',' + context.encryptPhoneNum + ',' + context.encryptNickNum + ','
    //         + context.encryptReceiverNameNum + ',' + context.encryptSimpleNum + ',' + context.encryptSearchNum + ','
    //         + context.decryptPhoneNum + ',' + context.decryptNickNum + ',' + context.decryptReceiverNameNum + ','
    //         + context.decryptSimpleNum + ',' + context.decryptSearchNum + ',' + context.searchPhoneNum + ','
    //         + context.searchNickNum + ',' + context.searchReceiverNameNum + ',' + context.searchSimpleNum + ','
    //         + context.searchSearchNum;
    // }

}

module.exports=SecretContext;