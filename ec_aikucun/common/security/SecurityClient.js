/**
 * Created by Dbit on 2017/8/27.
 */
const nconf=require('nconf');
const _=require('lodash');
const TYPE={
    APP_SECRET_TYPE:'2',
    APP_USER_SECRET_TYPE:'3'
};

let SecretContext=require('./SecretContext');
let SecurityUtil=require('./SecurityUtil');

class SecurityClient {
    /**
     * @param client {TopClient}
     * @param random
     */
    constructor(client, random) {
        // this.topClient = client;
        // this.randomNum = random;
        // this.securityUtil = new SecurityUtil();
        // this.cacheClient=new Map();
    }

    /**
     * 加密单条数据
     */
    encrypt($data,$type,$session = null,$version = null,cb) {
        if (_.isEmpty($data) || _.isEmpty($type)) {
            return cb(null);
        }
        this.callSecretApiWithCache($session, null,(err,$secretContext)=>{
            if (err) return cb(err);
            SecurityClient.incrCounter(1, $type, $secretContext, true);
            if (_.isArray($data)){
                return cb(null,_.map($data,(row)=>{
                    return SecurityUtil.encrypt(row, $type, $version, $secretContext);
                }));
            }
            cb(null,SecurityUtil.encrypt($data, $type, $version, $secretContext));
        });
    }

    /**
     *
     * @param $data
     * @param $type
     * @param $session
     * @param cb
     */
    decrypt($data,$type,$session,cb) {
        if (_.isEmpty($data) || _.isEmpty($type)) {
            return cb(null,$data);
        }
        let $secretData = SecurityUtil.getSecretDataByType($data, $type);
        if (_.isEmpty($secretData)) {
            return cb(null,$data);
        }

        let _this = this;
        this.callSecretApiWithCache((SecurityUtil.isPublicData($data, $type)) ? null : $session, $secretData.secretVersion, (err, $secretContext) => {
            if (err) return cb(err);
            SecurityClient.incrCounter(2, $type, $secretContext, true);

            if (_.isArray($data)){
                try {
                    return cb(null, _.map($data, (row) => {
                        return SecurityUtil.decrypt(row, $type, $secretContext);
                    }));
                }catch (err) {
                    return cb(global.MyUtil.String(err) + ' ' + $type + ' ' + $session);
                }
            }
            cb(null,SecurityUtil.decrypt($data, $type, $secretContext));
        });
    }

    static buildCacheKey($session,$secretVersion) {
        let prefix='topSecret:';
        if (_.isEmpty($session)) {
            return prefix+'default';//this.topClient.appkey; //***与topSDK有区别***
        }
        if (_.isEmpty($secretVersion)) {
            return prefix+$session;
        }
        return prefix+$session + '_' + $secretVersion;
    }

    /**
     * 获取秘钥，使用缓存
     */
    callSecretApiWithCache($session,$secretVersion,cb) {

        let $cacheKey;
        $cacheKey = SecurityClient.buildCacheKey($session, $secretVersion);
        let $time = new Date().getTime() / 1000;
        Thenjs((cont)=>{
            nconf.get($cacheKey,(err,$secretContext)=>{
                if (err) return cont(err);
                if ($secretContext ) {
                   if($secretContext.invalidTime > $time) {
                       if (_.isBuffer($secretContext.secret)===false) { //从redis取出类型会变
                           if ($secretContext.secret.type === 'Buffer') {
                               $secretContext.secret = new Buffer($secretContext.secret.data); //Array
                           } else {
                               $secretContext.secret = new Buffer(_.values($secretContext.secret)); //Object{"0":1,"1":2}
                           }
                       }
                       return cb(null, $secretContext);
                   }
                }
                // nconf.delete($cacheKey);
                //     if ($secretContext) {
                //         if (this.canUpload($secretContext)) {
                //             if (this.report($secretContext)) {
                //                 this.clearReport($secretContext);
                //             }
                //         }
                //     }
                //
                cont();
            });
        }).then(()=>{
            if (_.size(this.callSecretApi[$session])==0) {
                this.callSecretApi[$session]=[cb];
            }else{
                this.callSecretApi[$session].push(cb);
                return;
            }
            this.callSecretApi($session, $secretVersion,(err,$secretContext)=> {
                let callbacks=this.callSecretApi[$session];
                if (err) {
                    for (let cb=callbacks.pop(); cb; cb=callbacks.pop()) cb(err);
                    return;
                }
                let cb=callbacks.pop();
                global.common.setCache($cacheKey, $secretContext,(e)=>cb(e,$secretContext));
                for (let cb=callbacks.pop(); cb; cb=callbacks.pop()) cb(null,$secretContext);
            });
        }).fail((cont,err)=>cb(err));

    }


    /**
     * 获取秘钥，不使用缓存
     */
    callSecretApi(session,$secretVersion,cb){
        let $time = new Date().getTime() / 1000;
        let $secretContext = new SecretContext();
        let postdata= {
            // random_num: this.randomNum,
            secret_version: $secretVersion || null
        };
        postdata["seller_nick"]=session; //***与topSDK有区别***
        console.debug(postdata);
        global.interface('top','api.base.getSecret',postdata,(err,$response)=>{
            // console.error(__filename,err,$response);
            if (err) return cb(err);
            $secretContext.maxInvalidTime = $time + Number($response.max_interval);
            $secretContext.invalidTime = $time + Number($response.interval);
            $secretContext.secret = Buffer.from($response.secret,'base64');
            $secretContext.session = $response.session || session; //top用session,否则用_开头的自定义session
            $secretContext.appConfig = JSON.parse($response.app_config);
            if(_.isEmpty(session)){
                $secretContext.secretVersion = -1 * Number($response.secret_version);
            }else{
                $secretContext.secretVersion = Number($response.secret_version);
            }
            cb(null,$secretContext);
        });
    }


    static incrCounter($op,$type,$secretContext,$flush) {
        // if ($op == 1) {
        //     switch ($type) {
        //         case 'nick':
        //             $secretContext.encryptNickNum++;
        //             break;
        //         case 'simple':
        //             $secretContext.encryptSimpleNum++;
        //             break;
        //         case 'receiver_name':
        //             $secretContext.encryptReceiverNameNum++;
        //             break;
        //         case 'phone':
        //             $secretContext.encryptPhoneNum++;
        //             break;
        //         default:
        //             break;
        //     }
        // } else if ($op == 2) {
        //     switch ($type) {
        //         case 'nick':
        //             $secretContext.decryptNickNum++;
        //             break;
        //         case 'simple':
        //             $secretContext.decryptSimpleNum++;
        //             break;
        //         case 'receiver_name':
        //             $secretContext.decryptReceiverNameNum++;
        //             break;
        //         case 'phone':
        //             $secretContext.decryptPhoneNum++;
        //             break;
        //         default:
        //             break;
        //     }
        // } else {
        //     switch ($type) {
        //         case 'nick':
        //             $secretContext.searchNickNum++;
        //             break;
        //         case 'simple':
        //             $secretContext.searchSimpleNum++;
        //             break;
        //         case 'receiver_name':
        //             $secretContext.searchReceiverNameNum++;
        //             break;
        //         case 'phone':
        //             $secretContext.searchPhoneNum++;
        //             break;
        //         default:
        //             break;
        //     }
        // }

        // if ($flush && this.cacheClient) {
        //     this.cacheClient.setCache($secretContext.cacheKey, $secretContext);
        // }
    }

    /**
     * 生成自定义session，提供给自主账号使用
     *
     * @param $userId
     * @return
     */
    static generateCustomerSession($userId) {
        return '_'+$userId;
    }
}

module.exports=SecurityClient;


