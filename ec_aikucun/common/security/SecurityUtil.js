/**
 * Created by Dbit on 2017/8/27.
 */
const _=require('lodash');
let Security=require('./AesUtil');

class SecretData {
    constructor() {
        this.$originalValue = '';
        this.$originalBase64Value = '';
        this.$secretVersion = '';
        this.$search = '';
    }
}

const PHONE_SEPARATOR_CHAR='$';
const NICK_SEPARATOR_CHAR='~';
const NORMAL_SEPARATOR_CHAR=String.fromCharCode(1);
const BASE64_ARRAY = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

const SEPARATOR_CHAR_MAP = {
    nick: NICK_SEPARATOR_CHAR,
    simple: NICK_SEPARATOR_CHAR,
    receiver_name: NICK_SEPARATOR_CHAR,
    search: NICK_SEPARATOR_CHAR,
    normal: NORMAL_SEPARATOR_CHAR,
    phone: PHONE_SEPARATOR_CHAR
};

const SecurityUtil= class Me{
    constructor() {

    }

    /**
     *
     * @param $data
     * @param $type
     * @returns {boolean}
     */
    static isEncryptData($data,$type) {
        if (!_.isString($data) || _.size($data) < 4) {
            return false;
        }

        let $separator = SEPARATOR_CHAR_MAP[$type];
        let $strlen = _.size($data);
        if ($data[0] != $separator || $data[$strlen - 1] != $separator) {
            return false;
        }

        let $dataArray = Me.trimBySep($data, $separator).split($separator);
        let $arrayLength = _.size($dataArray);

        if ($separator == PHONE_SEPARATOR_CHAR) {
            if ($arrayLength != 3) {
                return false;
            }
            if ($data[$strlen - 2] == $separator) {
                return Me.checkEncryptData($dataArray);
            }
            else {
                let $version = $dataArray[$arrayLength - 1];
                if (_.isNaN($version) == false) {
                    let $base64Val = $dataArray[$arrayLength - 2];
                    return Me.isBase64Str($base64Val);
                }
            }
        } else {
            if ($data[_.size($data) - 2] == $separator && $arrayLength == 3) {
                return Me.checkEncryptData($dataArray);
            }
            else if ($arrayLength == 2) {
                return Me.checkEncryptData($dataArray);
            }
            else {
                return false;
            }
        }
    }

    static checkEncryptData($dataArray) {
        if (_.size($dataArray) == 2) {
            return Me.isBase64Str($dataArray[0]);
        } else {
            return Me.isBase64Str($dataArray[0]) && Me.isBase64Str($dataArray[1]);
        }
    }

    /*
     * 判断是否是base64格式的数据
     */
    static isBase64Str($str) {
        let $strLen = _.size($str);
        for (let $i = 0; $i < $strLen; $i++) {
            if (!Me.isBase64Char($str[$i])) {
                return false;
            }
        }
        return true;
    }

    /*
     * 判断是否是base64格式的字符
     */
    static isBase64Char($char) {
        return BASE64_ARRAY.indexOf($char) !== -1;
    }

    /*
     * 使用sep字符进行trim
     */
    static trimBySep($str, $sep) {
        if (_.isString($str)===false) return $str;
        let $start = 0;
        let $end = _.size($str);
        for (let $i = 0; $i < $end; $i++) {
            if ($str[$i] == $sep) {
                $start = $i + 1;
            }
            else {
                break;
            }
        }
        for (let $i = $end - 1; $i >= 0; $i--) {
            if ($str[$i] == $sep) {
                $end = $i - 1;
            }
            else {
                break;
            }
        }
        return $str.substr($start, $end);
    }

    static getSecretData($data, $separator) {
        if (_.isString($data)===false) return $data;
        let $secretData = new SecretData();
        let $dataArray = Me.trimBySep($data, $separator).split($separator);
        let $arrayLength = _.size($dataArray);

        if ($separator == PHONE_SEPARATOR_CHAR) {
            if ($arrayLength != 3) {
                return null;
            } else {
                let $version = $dataArray[2];
                if (_.isNaN($version) == false) {
                    $secretData.originalValue = $dataArray[0];
                    $secretData.originalBase64Value = $dataArray[1];
                    $secretData.secretVersion = $version;
                }
            }
        }
        else {
            if ($arrayLength != 2) {
                return null;
            } else {
                let $version = $dataArray[1];
                if (_.isNaN($version) == false) {
                    $secretData.originalBase64Value = $dataArray[0];
                    $secretData.secretVersion = $version;
                }
            }
        }
        return $secretData;
    }

    static getIndexSecretData($data, $separator) {
        let $secretData = new SecretData();
        let $dataArray = Me.trimBySep($data, $separator).split($separator);
        let $arrayLength = _.size($dataArray);

        if ($separator == PHONE_SEPARATOR_CHAR) {
            if ($arrayLength != 3) {
                return null;
            } else {
                let $version = $dataArray[2];
                if (_.isNaN($version) == false) {
                    $secretData.originalValue = $dataArray[0];
                    $secretData.originalBase64Value = $dataArray[1];
                    $secretData.secretVersion = $version;
                }
            }
        } else {
            if ($arrayLength != 3) {
                return null;
            } else {
                let $version = $dataArray[2];
                if (_.isNaN($version) === false) {
                    $secretData.originalBase64Value = $dataArray[0];
                    $secretData.originalValue = $dataArray[1];
                    $secretData.secretVersion = $version;
                }
            }
        }

        $secretData.search = true;
        return $secretData;
    }

    static decrypt($data, $type, $secretContext) {
        if (!Me.isEncryptData($data, $type)) {
            return $data||'';
            // throw new Error("数据[" + $data + "]不是类型为[" + $type + "]的加密数据");
        }
        let $dataLen = _.size($data);
        let $separator = SEPARATOR_CHAR_MAP[$type];

        let $secretData = null;
        if ($data[$dataLen - 2] == $separator) {
            $secretData = Me.getIndexSecretData($data, $separator);
        } else {
            $secretData = Me.getSecretData($data, $separator);
        }

        if ($secretData == null) {
            return $data||'';
        }

        let $result = Security.decrypt($secretData.originalBase64Value, $secretContext.secret);

        if ($separator == PHONE_SEPARATOR_CHAR && !$secretData.search) {
            return $secretData.originalValue.$result||'';
        }
        return $result||'';
    }

    static getSecretDataByType($data, $type) {
        let $separator = SEPARATOR_CHAR_MAP[$type];
        let $dataLen = _.size($data);

        if ($data[$dataLen - 2] == $separator) {
            return Me.getIndexSecretData($data, $separator);
        } else {
            return Me.getSecretData($data, $separator);
        }
    }

    /*
     * 判断是否是公钥数据
     */
    static isPublicData($data, $type) {
        let $secretData = Me.getSecretDataByType($data, $type);
        if (_.isEmpty($secretData)) {
            return false;
        }
        return Number($secretData.secretVersion) < 0;
    }

    /*
     * 加密逻辑
     */
    static encrypt($data, $type, $version, $secretContext) {
        if (!_.isString($data)) {
            return $data;
        }

        let $separator = SEPARATOR_CHAR_MAP[$type];
        let $isIndexEncrypt = Me.isIndexEncrypt($type, $version, $secretContext);
        if ($isIndexEncrypt || $type == "search") {
            if ('phone' == $type) {
                return Me.encryptPhoneIndex($data, $separator, $secretContext);
            } else {
                let $compressLen = _.get($secretContext.appConfig, 'encrypt_index_compress_len', 3);
                let $slideSize = _.get($secretContext.appConfig, 'encrypt_slide_size', 4);
                return Me.encryptNormalIndex($data, $compressLen, $slideSize, $separator, $secretContext);
            }
        } else {
            if ('phone' == $type) {
                return Me.encryptPhone($data, $separator, $secretContext);
            } else {
                return Me.encryptNormal($data, $separator, $secretContext);
            }
        }
    }

    /*
     * 加密逻辑,手机号码格式
     */
    static encryptPhone($data, $separator, $secretContext) {
        let $len = _.size($data);
        if ($len < 11) {
            return $data;
        }
        let $prefixNumber = $data.substr(0, $len - 8);
        let $last8Number = $data.substr($len - 8, $len);

        return $separator + $prefixNumber + $separator
            + Security.encrypt($last8Number, $secretContext.secret)
            + $separator + $secretContext.secretVersion + $separator;
    }

    /*
     * 加密逻辑,非手机号码格式
     */
    static encryptNormal($data, $separator, $secretContext) {
        return $separator
            + Security.encrypt($data, $secretContext.secret)
            + $separator + $secretContext.secretVersion + $separator;
    }

    /**
     * 判断密文是否支持检索
     *
     * @param $key
     * @param $version
     * @param $secretContext
     * @return
     */
    static isIndexEncrypt($key,$version,$secretContext) {
        if ($version != null && $version < 0) {
            $key = "previous_" + $key;
        } else {
            $key = "current_" + $key;
        }

        return $secretContext.appConfig != null &&
            _.has($secretContext.appConfig, $key) &&
            $secretContext.appConfig[$key] == "2";
    }

    static encryptPhoneIndex($data,$separator,$secretContext) {
        let $dataLength = _.size($data);
        if ($dataLength < 11) {
            return $data;
        }
        let $last4Number = $data.substr( $dataLength - 4, $dataLength);
        return $separator+Me.hmacMD5EncryptToBase64($last4Number, $secretContext.secret)+$separator
            +Security.encrypt($data, $secretContext.secret)+$separator+$secretContext.secretVersion
            +$separator+$separator;
    }

    /**
     * @see #hmacMD5EncryptToBase64
     * @param $encryptText 被签名的字符串
     * @param $encryptKey 密钥
     * @param $compressLen 压缩长度
     * @return
     * @throws Exception
     */
    static hmacMD5EncryptToBase64($encryptText,$encryptKey,$compressLen=0 ) {
        let $encryptResult = Security.hmac_md5($encryptText, $encryptKey);
        // console.log($encryptResult)
        if ($compressLen != 0) {
            $encryptResult = Me.compress($encryptResult, $compressLen);
        }
        return Buffer.from($encryptResult).toString('base64');
    }

    // toStr($bytes) {
    //     if (!_.isArray($bytes)) {
    //         return $bytes;
    //     }
    //     let $str = '';
    //     _.forEach($bytes, ($ch) => {
    //         $str += String.fromCharCode($ch);
    //     });
    //     return $str;
    // }
    static compress($input,$toLength) {
        if ($toLength < 0) {
            return null;
        }
        let $output = [];
        for (let $i = 0; $i < $toLength; $i++) {
            $output[$i] = String.fromCharCode(0);
        }
        // $input = this.getBytes($input);
        let $inputLength = _.size($input);
        for (let $i = 0; $i < $inputLength; $i++) {
            let $index_output = $i % $toLength;
            $output[$index_output] = $output[$index_output] ^ $input[$i];
        }
        return $output;
    }

    // getBytes($string) {
    //     // console.log($string)
    //     let $bytes = [];
    //     for (let $i = 0; $i < _.size($string); $i++) {
    //         $bytes.push($string[$i]);
    //     }
    //     return $bytes;
    // }
    // getArrayValue($array,$key,$default) {
    //     if(_.has($array,$key)){
    //         return $array[$key];
    //     }
    //     return $default;
    // }

    static encryptNormalIndex($data,$compressLen,$slideSize,$separator,$secretContext) {
        let $slideList = Me.getSlideWindows($data, $slideSize);
        let $builder = "";
        _.forEach($slideList, ($slide) => {
            $builder += Me.hmacMD5EncryptToBase64($slide, $secretContext.secret, $compressLen);
        });
        return $separator + Security.encrypt($data, $secretContext.secret) + $separator + $builder + $separator
            + $secretContext.secretVersion + $separator + $separator;
    }
    static isLetterOrDigit($ch) {
        let $code = $ch.charCodeAt(0);
        return (0 <= $code && $code <= 127);
    }

    /**
     * 生成滑动窗口
     *
     * @param input
     * @param slideSize
     * @return
     */
    static getSlideWindows(input,slideSize=4) {
        let windows = [];
        let startIndex = 0;
        let endIndex = 0;
        let currentWindowSize = 0;
        let currentWindow = null;

        while (endIndex < input.length || currentWindowSize > slideSize) {
            let startsWithLetterOrDigit;
            if (currentWindow == null) {
                startsWithLetterOrDigit = false;
            } else {
                startsWithLetterOrDigit = Me.isLetterOrDigit(currentWindow.charAt(0));
            }

            if (endIndex == input.length && !startsWithLetterOrDigit) {
                break;
            }

            if (currentWindowSize == slideSize && !startsWithLetterOrDigit && Me.isLetterOrDigit(input.charAt(endIndex))) {
                endIndex++;
                currentWindow = input.slice(startIndex, endIndex);
                currentWindowSize = 5;

            } else {
                if (endIndex != 0) {
                    if (startsWithLetterOrDigit) {
                        currentWindowSize -= 1;
                    } else {
                        currentWindowSize -= 2;
                    }
                    startIndex++;
                }

                while (currentWindowSize < slideSize && endIndex < input.length) {
                    let currentChar = input.charAt(endIndex);
                    if (Me.isLetterOrDigit(currentChar)) {
                        currentWindowSize += 1;
                    } else {
                        currentWindowSize += 2;
                    }
                    endIndex++;
                }
                currentWindow = input.slice(startIndex, endIndex);

            }
            windows.push(currentWindow);
        }
        return windows;
    }
};

module.exports=SecurityUtil;

