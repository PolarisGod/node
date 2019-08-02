let moment = require('moment');
let pt = require('../../index');
let _ = require('lodash');
let dict = require('../dict');
let MyUtil = require('../../../../common/MyUtil');
module.exports = format;
function format(postData, result, cb) {

  let cusno = '';
  let checkStr = MyUtil.str_rmInvalidchars;  

  let trade = result;
  let orderDetail;
  if (_.get(trade,'list').length>0){ orderDetail = _.get(trade,'list'); }else { return result; }

  if (!orderDetail) { return cb('未找到订单数据,' + '单号:' + _.get(postData, 'outnos'));}
  let seller = _.get(postData, 'seller');

  let orderStatus;
  let s1 = trade.orderstatus,s2 = trade.logisticsstatus	
  if (Number(s2) === 1){
    orderStatus = 12;
    if (Number(s1)===1) orderStatus = 5;
  }else{
    orderStatus = 10;
    if (Number(s1)===1) orderStatus = 0;
  }
  
  let data = {
    _id: String(trade._id||''),
    head: {
      incusno: cusno || '', //销售网点代号:空
      incusname: trade.title || '', //销售网点名称:空
      outdate: moment(trade.paytime).format('YYYYMMDD'),  //付款日期
      created: moment(trade.ordertime).format('YYYY-MM-DD HH:mm:ss'), //下单时间  
      bz: checkStr(_.get(trade, 'buyer_message')) || '', //买家留言
      platform: 'aikucun', //平台代码
      trade_from: 'aikucun', //订单来源:可与platform保持一样
      outnos: checkStr(trade.adorderid), //平台订单号,与入参outnos相同
      transcorp:  dict.Trade.LOGISTICS[trade.delivery.logisticsCompany]||'', //指定的快递公司
      senttype: trade.shop_pick ? 1 :0, //0快递，1自提
      movenos: trade.delivery.deliverNo||'', //快递单号
      dtcount: _.size(orderDetail) || 0, //明细行数
      consignee: checkStr(trade.delivery.receiver)||'', //收件人姓名
      mobile: trade.delivery.receiverTel||'', //收件人手机
      telephone: trade.delivery.receiverTel || '', //收件人电话
      province: checkStr(trade.delivery.province)||'', //收件人所在省份
      city: checkStr(trade.delivery.city)||'', //收件人所在市
      area: checkStr(trade.delivery.county)||'', //收件人所在区
      address: checkStr(trade.delivery.receiverAddress)||'', //详细地址,str_rmInvalidchars为过滤非法字符
      zipcode: trade.receiver_zip || '', //邮编
      post_fee: Number(trade.post_fee||0), //买家邮费
      current_status: orderStatus||0,//订单状态
      refundflag: 0, //是否有退货
      downtime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'), //当前时间
      pay_time: moment(trade.paytime || new Date()).format('YYYY-MM-DD HH:mm:ss'), //付款时间
      seller: seller || '', //卖家账号:入参中的seller
      buyer: checkStr(trade.delivery.receiver), //买家账号/昵称
      bz1:trade.activityid,//活动id
      bz2: '',//空
      bz3: '', //卖家旗帜
      bz5: checkStr(trade.buyer_message || ''), //买家留言
      bz6: checkStr(trade.seller_memo || ''), //卖家备注
      buyer_cod_fee: 0, //货到到付款服务费
      email: '',  //收件人email
      bz9: '', //支付平台账号
      now: Number(trade.amount||0),//金额
    },
    detail: [], //明细,见下面
    pay: [{
      paycode: 'unionpay', //付款方式代码,alipay/wxpay/cod/unionpay/other
      payname: '网银', //付款方式名称,支付宝/微信/货到付款/网银/其它         
      paymoney: Number(trade.amount) + Number(trade.post_fee||0), //收款含邮费
      bz2: _.get(trade, 'pay.alipay_no') || '' //支付流水号
    }]
  };
  let orderInfo
  let total_num = 0;
  let orderLen = orderDetail.length
  if (orderLen > 0) {
    for (let i = 0; i < orderLen; i++) {
      orderInfo = orderDetail[i]
      let {settlementprice,brandid,kuanhao,name,barcode,num,adjust_fee} = orderInfo;
      let unitPrice = _.round(settlementprice / num, 2);
      data.detail[i] = {
        nos_rec: String(i + 1), //明细序号
        childnos: String(i + 1), //平台子订单号,如无则同lt明细序号
        words: barcode, //商品条码
        nb: Number(num), //数量(sale_num)
        total_fee: _.round(settlementprice, 2), //最终金额,如有优惠,则需要分摊优惠后的金额
        sprice: unitPrice, //拍下价格
        price: _.round(settlementprice/ num, 2), //实际成交价(会有误差)
        adjust_fee: (adjust_fee === '' && _.isString(adjust_fee)) ? 0 : 0, /*调整金额,仅预留*/
        refundflag: (trade.refund_status || '') === '' ? 0 : 1, //是否有退货:0未退货，1退货
        current_status:orderStatus||0,//订单状态
        item_id:brandid||'',//品牌
        sku_id:kuanhao||'',//款号
        bz1: '', //商品规格,如无则传空
        bz2: checkStr(name) || '', //商品名称,如无则传空
        bz3: trade.pic_path || '', //商品图片,如无则传空
        bz5: '', //平台类目代号,如无则传空
        outnos: String(trade.adorderid)||'' //平台订单号,同入参outnos
      };
      total_num += Number(num);
    }
    data.head.nbs = total_num;
    data.head.total_fee = trade.amount;
    cb(null, data);
  }
}