/**
 * Created by Dbit on 2016/9/27.
 */

/**
 *
 * @type {{COMMON:{ERRRORCODE:"",code},Refund: {STATUS: {WAIT_SELLER_AGREE: number, WAIT_BUYER_RETURN_GOODS: number, WAIT_SELLER_CONFIRM_GOODS: number, SELLER_REFUSE_BUYER: number, CLOSED: number, SUCCESS: number}, GOOD_STATUS: {BUYER_NOT_RECEIVED: string, BUYER_RECEIVED: string, BUYER_RETURNED_GOODS: string}}, Trade: {STATUS: {TRADE_NO_CREATE_PAY: number, WAIT_BUYER_PAY: number, SELLER_CONSIGNED_PART: number, WAIT_SELLER_SEND_GOODS: number, WAIT_BUYER_CONFIRM_GOODS: number, TRADE_BUYER_SIGNED: number, TRADE_FINISHED: number, TRADE_CLOSED: number, TRADE_CLOSED_BY_TAOBAO: number, PAY_PENDING: number}, SELLER_FLAG: {1: string, 2: string, 3: string, 4: string, 5: string}}}}
 */
module.exports = {
    COMMON: {
        ERRRORCODE: {
            "refunds_receive_get": {
                "-3": 1,
            },
            "item_fullinfo_get": {
                "-3": 1,
            },
            "items_onsale_get": {
                "-2": 1,
            }
        }
    },
    Refund: {
        STATUS: { //退货状态
            "-1": 7,
            "-2": 7,
            "-3": 7,
            "1": 0,         //WAIT_SELLER_AGREE
            "2": 1,         //WAIT_BUYER_RETURN_GOODS
            "4": 8,         //WAIT_SELLER_CONFIRM_GOODS
            "8": 0,         //WAIT_SELLER_CONFIRM_GOODS
            "16": 0,        //WAIT_SELLER_CONFIRM_GOODS
            "32": 5,        //SELLER_REFUSE_BUYER
            "64": 2,        //WAIT_SELLER_CONFIRM_GOODS
            "79": 7,        //closed
            "128": 8,       //success
            // "1024":8       //success
        },
        GOOD_STATUS: { //退货商品状态
            BUYER_NOT_RECEIVED: "买家未收到货",
            BUYER_RECEIVED: "买家已收到货",
            BUYER_RETURNED_GOODS: "买家已退货"
        }
        , REFUND_TYPE: {
            1: 1,    //退货退款(收货后)
            // 2:3, //退货换货(收货后)
            3: 2, //整单退款(发货前)
            4: 1, //整单退款(发货后,已发货)
        }

    }, Trade: {
        STATUS: {
            "0": "未审核",  //未审核
            "1": "已审核",  //已审核
            "2": "已分配",  //已分配
            "3": "拣货中",  //拣货中
            "4": "已捡完",  //已捡完
            "5": "已发货",  //已发货
            "6": "已回传",  //已回传
            "7": "预售",    //预售
            "8": "分配失败",    //分配失败
            "9": "缺货",    //缺货
            "10": "已取消", //已取消
            "11": "预留",   //预留
            "12": "已收货", //已收货
            "13": "已拆",   //已拆
            "14": "合并",   //合并
        }, SELLER_FLAG: {
            "1": "红",
            "2": "黄",
            "3": "绿",
            "4": "蓝",
            "5": "紫"
        }, TRANSCORP: {
            "SF": { "syscode": "SF", "code": "shunfeng", "name": "顺丰速运" },
            "JD": { "syscode": "JD", "code": "jd", "name": "京东快递" },
            "EMS": { "syscode": "EMS", "code": "ems", "name": "EMS" },
            "YUNDA": { "syscode": "YUNDA", "code": "yunda", "name": "韵达快递" },
            "STO": { "syscode": "STO", "code": "shentong", "name": "申通快递" },
            "YTO": { "syscode": "YTO", "code": "yuantong", "name": "圆通快递" },
            "ZTO": { "syscode": "ZTO", "code": "zhongtong", "name": "中通快递" },
            "GTO": { "syscode": "GTO", "code": "guotongkuaidi", "name": "国通快递" },
            "DBL": { "syscode": "DBL", "code": "dbwl", "name": "德邦快递" },
            "FAST": { "syscode": "FAST", "code": "kuaijiesudi", "name": "快捷快递" },
            "FEDEX": { "syscode": "FEDEX", "code": "lianbangkuaidi", "name": "联邦快递" },
            // "LB": { "syscode": "LB", "code": "longbanwuliu", "name": "" },
            // "QFKD": { "syscode": "QFKD", "code": "quanfengkuaidi", "name": "" },
            // "UAPEX": { "syscode": "UAPEX", "code": "quanyikuaidi", "name": "" },
            "SURE": { "syscode": "SURE", "code": "sue", "name": "速尔快递" },
            "TTKDEX": { "syscode": "TTKDEX", "code": "tiantian", "name": "天天快递" },
            // "UC": { "syscode": "UC", "code": "youshuwuliu", "name": "" },
            // "YJSD": { "syscode": "YJSD", "code": "yinjiesudi", "name": "" },
            // "NEDA": { "syscode": "NEDA", "code": "ganzhongnengda", "name": "" },
            "HTKY": { "syscode": "HTKY", "code": "huitongkuaidi", "name": "百世汇通" },
            // "ZYSD": { "syscode": "ZYSD", "code": "zengyisudi", "name": "" },
            // "XFKD": { "syscode": "XFKD", "code": "xfwl", "name": "" },
            // "STKD": { "syscode": "STKD", "code": "suteng", "name": "" },
            // "GTSD": { "syscode": "GTSD", "code": "hre", "name": "" },
            // "ZYSF": { "syscode": "ZYSF", "code": "zhuanyunsifang", "name": "" },
            // "HQSY": { "syscode": "HQSY", "code": "hqsy", "name": "" },
            // "BHGJ": { "syscode": "BHGJ", "code": "xlobo", "name": "" },
            // "TZKD": { "syscode": "TZKD", "code": "tongzhou", "name": "" },
            // "PANEX": { "syscode": "PANEX", "code": "panex", "name": "" },
            // "EPANEX": { "syscode": "EPANEX", "code": "epanex", "name": "" },
            // "PACKD": { "syscode": "PACKD", "code": "tpykd", "name": "" },
            // "FCFJ": { "syscode": "FCFJ", "code": "fulai", "name": "" },
            // "BMKD": { "syscode": "BMKD", "code": "meixi", "name": "" },
            // "DFWL": { "syscode": "DFWL", "code": "dongfang", "name": "" },
            // "BFDF": { "syscode": "BFDF", "code": "bfdf", "name": "" },
            // "ZTKY": { "syscode": "ZTKY", "code": "ztky", "name": "" },
            // "GLWL": { "syscode": "GLWL", "code": "jinan", "name": "" },
            // "DFLY": { "syscode": "DFLY", "code": "dfly", "name": "" },
            // "WWWL": { "syscode": "WWWL", "code": "westwing", "name": "" },
            // "ANE": { "syscode": "ANE", "code": "anwl", "name": "" },
            // "EWE": { "syscode": "EWE", "code": "ewe", "name": "" },
            // "BDTKD": { "syscode": "BDTKD", "code": "adatong", "name": "" },
            // "BSKD": { "syscode": "BSKD", "code": "lantiankuaidi", "name": "" },
            // "ASSD": { "syscode": "ASSD", "code": "assd", "name": "" },
            // "ZQZH": { "syscode": "ZQZH", "code": "zhonghuan", "name": "" },
            // "UBONEX": { "syscode": "UBONEX", "code": "ubonex", "name": "" },
            // "FYZX": { "syscode": "FYZX", "code": "fyzx", "name": "" },
            // "FYKD": { "syscode": "FYKD", "code": "fykd", "name": "" },
            // "PCA": { "syscode": "PCA", "code": "pcaexpress", "name": "" },
            // "ETK": { "syscode": "ETK", "code": "etk", "name": "" },
            // "KT": { "syscode": "KT", "code": "kt", "name": "" },
            // "YKWL": { "syscode": "YKWL", "code": "ykwl", "name": "" },
            // "KJSD": { "syscode": "KJSD", "code": "kjkd", "name": "" },
            // "FYGJ": { "syscode": "FYGJ", "code": "ykjwl", "name": "" },
            // "FSTL": { "syscode": "FSTL", "code": "fstwl", "name": "" },
            // "YBG": { "syscode": "YBG", "code": "yangbaoguo", "name": "" },
            // "BMWL": { "syscode": "BMWL", "code": "bmwl", "name": "" },
            // "ZYGJ": { "syscode": "ZYGJ", "code": "youzhengguoji", "name": "" },
            // "SCBEXP": { "syscode": "SCBEXP", "code": "scbexpress", "name": "" }
        },
        LOGISTICS: {
            "1":"SF",
            "6":"JD",
            "18":"DBWL",
            // "顺丰速运":"SF",
            // "京东快递":"JD",
            // "EMS":"EMS",
            // "申通快递":"STO",
            // "圆通速递":"YTO",
            // "中通快递":"ZTO",
            // "国通快递":"GTO",
            // "百世汇通":"HTKY",
            // "韵达快递":"YUNDA",
            // "天天快递":"TTKDEX",
            // "快捷速递":"FAST"
            // COMPANY: [
            //         {"syscode":"SF", "code": "shunfeng", "name":"顺丰速运"},
            //         {"syscode":"JD", "code": "jd", "name":"京东快递"},
            //         {"syscode":"EMS", "code": "ems", "name":"EMS"},
            //         {"syscode":"YUNDA", "code": "yunda", "name":"韵达"},
            //         {"syscode":"STO", "code": "shentong", "name":"申通"},
            //         {"syscode":"YTO", "code": "yuantong", "name":"圆通"},
            //         {"syscode":"ZTO", "code": "zhongtong", "name":"中通"},
            //         {"syscode":"GTO", "code": "guotongkuaidi", "name":"国通"},
            //         {"syscode":"DBL", "code": "dbwl", "name":""},
            //         {"syscode":"FAST", "code": "kuaijiesudi", "name":""},
            //         {"syscode":"FEDEX", "code": "lianbangkuaidi", "name":""},
            //         {"syscode":"LB", "code": "longbanwuliu", "name":""},
            //         {"syscode":"QFKD", "code": "quanfengkuaidi", "name":""},
            //         {"syscode":"UAPEX", "code": "quanyikuaidi", "name":""},
            //         {"syscode":"SURE", "code": "sue", "name":""},
            //         {"syscode":"TTKDEX", "code": "tiantian", "name":""},
            //         {"syscode":"UC", "code": "youshuwuliu", "name":""},
            //         {"syscode":"YJSD", "code": "yinjiesudi", "name":""},
            //         {"syscode":"NEDA", "code": "ganzhongnengda", "name":""},
            //         {"syscode":"HTKY", "code": "huitongkuaidi", "name":""},
            //         {"syscode":"ZYSD", "code": "zengyisudi", "name":""},
            //         {"syscode":"XFKD", "code": "xfwl", "name":""},
            //         {"syscode":"STKD", "code": "suteng", "name":""},
            //         {"syscode":"GTSD", "code": "hre", "name":""},
            //         {"syscode":"ZYSF", "code": "zhuanyunsifang", "name":""},
            //         {"syscode":"HQSY", "code": "hqsy", "name":""},
            //         {"syscode":"BHGJ", "code": "xlobo", "name":""},
            //         {"syscode":"TZKD", "code": "tongzhou", "name":""},
            //         {"syscode":"PANEX", "code": "panex", "name":""},
            //         {"syscode":"EPANEX", "code":"epanex", "name":""},
            //         {"syscode":"PACKD", "code": "tpykd", "name":""},
            //         {"syscode":"FCFJ", "code": "fulai", "name":""},
            //         {"syscode":"BMKD", "code": "meixi", "name":""},
            //         {"syscode":"DFWL", "code": "dongfang", "name":""},
            //         {"syscode":"BFDF", "code": "bfdf", "name":""},
            //         {"syscode":"ZTKY", "code": "ztky", "name":""},
            //         {"syscode":"GLWL", "code": "jinan", "name":""},
            //         {"syscode":"DFLY", "code": "dfly", "name":""},
            //         {"syscode":"WWWL", "code": "westwing", "name":""},
            //         {"syscode":"ANE", "code": "anwl", "name":""},
            //         {"syscode":"EWE", "code":  "ewe", "name":""},
            //         {"syscode":"BDTKD", "code": "adatong", "name":""},
            //         {"syscode":"BSKD", "code": "lantiankuaidi", "name":""},
            //         {"syscode":"ASSD", "code": "assd", "name":""},
            //         {"syscode":"ZQZH", "code": "zhonghuan", "name":""},
            //         {"syscode":"UBONEX", "code": "ubonex", "name":""},
            //         {"syscode":"FYZX", "code": "fyzx", "name":""},
            //         {"syscode":"FYKD", "code": "fykd", "name":""},
            //         {"syscode":"PCA" , "code": "pcaexpress", "name":""},
            //         {"syscode":"ETK" , "code": "etk", "name":""},
            //         {"syscode":"KT"  , "code": "kt", "name":""},
            //         {"syscode":"YKWL", "code": "ykwl", "name":""},
            //         {"syscode":"KJSD", "code": "kjkd", "name":""},
            //         {"syscode":"FYGJ", "code": "ykjwl", "name":""},
            //         {"syscode":"FSTL", "code": "fstwl", "name":""},
            //         {"syscode":"YBG", "code": "yangbaoguo", "name":""},
            //         {"syscode":"BMWL", "code": "bmwl", "name":""},
            //         {"syscode":"ZYGJ", "code": "youzhengguoji", "name":""},
            //         {"syscode":"SCBEXP", "code": "scbexpress", "name":""}
            // ]
        }
    }
};