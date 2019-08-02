/**
 * Created by Dbit on 2016/10/20.
 */

/**
 *
 * @type {{Trade: undefined, Order: undefined, Refund: undefined, Trade_amount: undefined, WaybillCloudPrintApplyNewRequest: undefined, UserInfoDto: undefined, AddressDto: undefined}}
 */
var Entity={
    /**
     * @type {{seller_nick,pic_path,payment,seller_rate,post_fee,receiver_name,receiver_state,receiver_address,receiver_zip,receiver_mobile,receiver_phone,consign_time,received_payment,receiver_country,receiver_town,order_tax_fee,shop_pick,tid,num,num_iid,status,title,type,price,discount_fee,total_fee,created,pay_time,modified,end_time,seller_flag,buyer_nick,has_buyer_message,credit_card_fee,step_trade_status,step_paid_fee,mark_desc,shipping_type,adjust_fee,trade_from,service_orders,buyer_rate,receiver_city,receiver_district,o2o,o2o_guide_id,o2o_shop_id,o2o_guide_name,o2o_shop_name,o2o_delivery,rx_audit_status,post_gate_declare,cross_bonded_declare,buyer_message,seller_memo,orders,buyer_alipay_no,alipay_id,buyer_email}}
     */
    Trade:undefined,
    /**
     *
     * @type {{tid,adjust_fee,buyer_rate,cid,discount_fee,end_time,is_daixiao,is_oversold,modified,num,num_iid,oid,outer_iid,outer_sku_id,total_fee,payment,pic_path,price,seller_rate,seller_type,status,title,sku_id,sku_properties_name,order_from,invoice_no,logistics_company,shipping_type,consign_time,refund_id,refund_status,snapshot_url,divide_order_fee,part_mjz_discount}}
     */
    Order:undefined,
    /**
     * @type {{attribute,buyer_nick,created,good_status,has_good_return,modified,num,oid,operation_contraint,order_status,outer_id,payment,reason,refund_fee,refund_id,refund_phase,seller_nick,sku,status,tid,title,total_fee,good_return_time,company_name,sid,address,refund_version,operation_contraint}}
     */
    Refund:undefined,
    /**
     * @type {{tid,alipay_no,created,pay_time,end_time,total_fee,post_fee,cod_fee,payment,commission_fee,buyer_obtain_point_fee,buyer_cod_fee,seller_cod_fee,express_agency_fee}}
     */
    Trade_amount:undefined,
    /**
     * @type {{cp_code,product_code,sender:{name,mobile,phone,address:{detail,city,district,province}}
     * trade_order_info_dtos:[{template_url,
     *      user_id:number,
     *      logistics_services:string,
     *      object_id,
     *      order_info:{order_channels_type,trade_order_list:[string]},
     *      package_info:{id,volume,weight,items:[{count,name}],
     *      recipient:{name,mobile,phone,address:{detail,city,district,province}}
     *  }]
     * }}
     */
    WaybillCloudPrintApplyNewRequest:undefined,
    /**
     * @type {{name,mobile,phone,address:{detail,city,district,province}}}
     */
    UserInfoDto:undefined,
    /**
     * @type {{detail,city,district,province}}
     */
    AddressDto:undefined
};

module.exports=Entity;