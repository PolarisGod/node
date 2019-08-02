create table online_trades (
 id BIGINT auto_increment not null primary key , /*单号*/
 wmsno varchar(20) null, /*预留*/
 areacode varchar(20) null, /*区域代号 (表示发货地区)*/
 types int null, /*类型 1:百胜订单 */
 nos varchar(36) null, /*单号 预留*/
 outcusno  varchar(20) null, /*交付网点*/
 outcusname varchar(200) null,/*交付网点名称*/
 incusno   varchar(20) null, /*网销店代号*/
 incusname varchar(200) null,/*网销店名称*/
 outdate   varchar(8)  null, /*日期*/
 created datetime null, /*创建时间(下单时间)*/
 nbs int null, /*数量*/
 picknb int null,/*拣货数量*/
 realnb int null,/*发货数量*/
 now decimal(20,4) null, /*金额*/
 zdr varchar(50) null, /*操作人*/
 sendman varchar(50) null,/*发货人*/
 bz varchar(100) null, /*备注*/
 platform varchar(50) null,/*来源 taobao,tmail,jd,import*/
 outnos varchar(500) null,/*预留:外部单号*/
 transcorp  varchar(20) null, /*指定运输公司代码*/
 senttype  int   default 0     null,/*0快递，1自提*/
 movenos   varchar(30) null, /*托运单号 (回传用)*/
 print1    int  default 0 null,/*0发货单未打印，1发货单已打印*/
 print2    int  default 0 null,/*快递单打印 物流单打印*/
 print3    int  default 0 null,/*拣货单打印*/
 shipping_date datetime null, /*实际发货时间*/
 dtcount   int null, /*明细行数*/
 realname   varchar(60)  null,/*真实姓名*/
 email    varchar(100)   null,
 pid   varchar(60) null,/*身份ID*/
 consignee varchar(60) null, /*收货人姓名*/
 telephone varchar(20) null, /*收货人电话/手机号*/
 province varchar(30) null,/*省*/
 city   varchar(30) null,/*城市*/
 area   varchar(30) null,/*地区*/
 address varchar(255) null, /*详细地址*/
 zipcode varchar(10) null, /*邮编*/
 post_fee decimal(12,4) null, /*预留:运费*/
 real_post_fee decimal(12,4) null,/*实际物流费*/
 buyer_cod_fee decimal(12,4) null,/*到付服务费*/
 cod  int default 0 null,/*cash on delivery货到付款*/
 discount_fee decimal(12,4) null,/*店铺优惠*/
 discount_fee2 decimal(12,4) null,/*平台优惠*/
 total_fee decimal(12,4) null,/*预留:结算金额*/
 sprice decimal(12,4) null,/*日常售价金额*/
 current_status int default 0 null, /*单据状态 0.未审核,1.已审核,2.已分配,3 拣货中,4.已捡完,5.已发货,6已回传,7.预售,8.分配失败,9.缺货,10.已取消,11.预留,12.已收货,13.已拆,14.合并 */
 pre_status int null, /*同current_status*/
 uncheck int default 0 null,/*反审核标记 0未做过反审核，1做过反审核*/
 gxrq datetime null,
 yhid varchar(30) null,
 status   int default 0 null, /*当前状态的子状态 1:不可修改*/
 refundflag int default 0 null,/*是否有退货 0无，1有*/
 allotdate datetime  null, /*分配时间*/
 allotnos varchar(30)  null,/*交付单号*/
 uploadtime datetime   default now() null, /*上传时间*/
 apptime varchar(100)   null,/*预约自提时间*/
 downtime  datetime   null, /*下载时间*/
 endtime datetime  null,/*交易结束时间*/
 lastmsg   varchar(100) null,/*处理结果 (预留)*/
 seller varchar(50) null,
 plane_kinds int  default 0 null,/*面单形式 0四联单，1电子面单*/
 buyer varchar(50) null,/*会员昵称*/
 bz1 varchar(100) null, /*发货仓库名称*/
 bz2 varchar(100) null, /*网店名称,自提类型的为自提网点名称*/
 bz3 varchar(100) null, /*旗帜 红、黄、绿、蓝、紫-- 红：不发货;黄：商品颜色修改专用;绿：正常销售单;蓝：客户修改地址;紫：客户指定其他快递*/
 bz4 varchar(100) null, /*原单号*/
 bz5 varchar(100) null,/*买家留言*/
 bz6 varchar(100) null,/*卖家备注*/
 bz7 varchar(100) null,/*二次备注*/
 bz8 varchar(100) null,/*异常信息*/
 bz9 varchar(100) null,/*原库存组代号+','+原分配网点*/
 payment decimal(13,4) null, /*总付款*/
 bz10 varchar(100) null,
 mobile varchar(30) null,
 pause_types varchar(50) null, /*拦截类型,空为未拦截*/
 pause_bz varchar(200) null, /*拦截备注*/
 stock_group varchar(20) null, /*库存组*/
 stock_type int null,/*库存组类型*/
 trade_from varchar(50) null,
 old_trade_from varchar(50) null,
 pay_time datetime null, /*付款时间*/
 locknos  varchar(50) null,/*锁单号*/
 encrypt_mobile nvarchar(100) null,
 encrypt_telephone nvarchar(100) null,
 encrypt_consignee nvarchar(255) null,
 encrypt_address nvarchar(400) null,
 encrypt_buyer nvarchar(255) null,
 encrypt_email nvarchar(255) null
);
create unique index i_online_trades_key on online_trades (nos ASC);
create unique index i_online_trades_id on online_trades(id);
create index i_online_trades_outnos on online_trades(outnos);
create index i_online_trades_outdate on online_trades(outdate);
create index i_online_trades_allotnos on online_trades(allotnos);
create index i_online_trades_shipping_date on online_trades(shipping_date);