/**
 * Created by Dbit on 2016/9/27.
 */

/**
 *  @type{{}}
 *
 *  @type {{Refund: {STATUS: {WAIT_SELLER_AGREE: number, WAIT_BUYER_RETURN_GOODS: number, WAIT_SELLER_CONFIRM_GOODS: number, SELLER_REFUSE_BUYER: number, CLOSED: number, SUCCESS: number}, GOOD_STATUS: {BUYER_NOT_RECEIVED: string, BUYER_RECEIVED: string, BUYER_RETURNED_GOODS: string}}, Trade: {STATUS: {TRADE_NO_CREATE_PAY: number, WAIT_BUYER_PAY: number, SELLER_CONSIGNED_PART: number, WAIT_SELLER_SEND_GOODS: number, WAIT_BUYER_CONFIRM_GOODS: number, TRADE_BUYER_SIGNED: number, TRADE_FINISHED: number, TRADE_CLOSED: number, TRADE_CLOSED_BY_TAOBAO: number, PAY_PENDING: number}, SELLER_FLAG: {1: string, 2: string, 3: string, 4: string, 5: string}}}}
 */
module.exports = {
    Refund: {
        STATUS: { //退货状态
            "WAIT_SELLER_AGREE": 0,
            "WAIT_BUYER_RETURN_GOODS": 1,
            "WAIT_SELLER_CONFIRM_GOODS": 2,
            "SELLER_REFUSE_BUYER": 5,
            "CLOSED": 7,
            "SUCCESS": 8
        },
        GOOD_STATUS: { //退货商品状态
            BUYER_NOT_RECEIVED: '买家未收到货',
            BUYER_RECEIVED: '买家已收到货',
            BUYER_RETURNED_GOODS: '买家已退货'
        }
    }, Trade: {
        STATUS: { //交易状态
            TRADE_NO_CREATE_PAY: 10, //(没有创建支付宝交易)
            WAIT_BUYER_PAY: 10,// (等待买家付款)
            SELLER_CONSIGNED_PART: 0, //(卖家部分发货)
            WAIT_SELLER_SEND_GOODS: 0, //(等待卖家发货,即:买家已付款)
            WAIT_BUYER_CONFIRM_GOODS: 5, //(等待买家确认收货,即:卖家已发货)
            TRADE_BUYER_SIGNED: 12, //(买家已签收,货到付款专用)
            TRADE_FINISHED: 12, //(交易成功)
            TRADE_CLOSED: 10, //(付款以后用户退款成功，交易自动关闭)
            TRADE_CLOSED_BY_TAOBAO: 10, //(付款以前，卖家或买家主动关闭交易)
            PAY_PENDING: 0 //(国际信用卡支付付款确认中) * WAIT_PRE_AUTH_CONFIRM(0元购合约中)
        }, SELLER_FLAG: {
            '1': '红',
            '2': '黄',
            '3': '绿',
            '4': '蓝',
            '5': '紫'
        }
    }
};