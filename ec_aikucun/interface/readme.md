###接口开发步骤

#### 1.申请电商开放平台的开发者账号,并创建相应类目的应用

    * 注册服务商(淘宝,京东,唯品,有赞)
    * 卖家自研 (小红书,亚马逊...) 

#### 2.配置参数

    * AppKey,AppSecret,API地址 (必须)
    * 授权地址
    * 回调地址

#### 3.创建接口项目 (用小红书xhs举例)

    1. 创建xhs目录,并进入
    2. 初始化目录如下:
    ├─api           将接口封装成方法
    ├─apiExt        拓展接口以及自动保存调用结果
    ├─sdk           SDK程序(平台未提供的由自己编写)
    ├─const.js      标准常量对照表 (需要自定义)
    ├─entity.js     数据结构定义 (需要自定义)
    ├─index.js      入口
    ├─rest.js       统一rest请求
    ├─session.js    session管理 (目前仅youzan用到)
    ├─theParms.js   

#### 4. apiExt接口清单:
```
├─base                  基本
│      common.js        通用接口
│      getToken.js      获取Token
│      refreshToken.js  刷新Token
│      *getAuthUrl.js    获取授权地址
│
├─item                  商品
│      getInventory.js  获取仓库商品 (按修改时间,返回货号级,存入items)
│      getOnsale.js     获取在售商品 (按修改时间,返回货号级,存入items)
│      getSkus.js       根据商品ID获取对应的sku信息 (存入skus)
│      getQuantity.js        获取指定条码库存 (格式化:输入+输出)
│      updateQuantity.js 更新指定sku的库存数 (格式化:输入)
│      *syncItems.js     增量同步平台商品到中间库 (货号级,格式化:输入)
│      *syncSkus.js      增量同步sku信息到中间库 (格式化:输入)
│      *findSkus.js      从中间库批量获取sku (按seller+id,返回条码级,格式化:输入+输出)
│
├─refunds                   退款/退货
│      getModifiedRefunds.js 按修改时间获取退单 (多张)
│      getFullinfo.js       获取单张退单详情
│      getMessages.js       获取单张退单留言
│      reviewRefund.js      审核退款(目前仅tmall需要)
│      agreeRefund.js       同意退款(或退款申请)
│      refuseRefund.js      拒绝退款
│      agreeReturnGoods.js  同意退货申请
│      refuseReturnGoods.js 拒绝退货申请
│      *syncList.js          增量同步退单到中间库
│      *findList.js          从中间库批量获取退单
│
├─trades                    订单
│      getModifiedSold.js   按修改时间获取订单 (多张)
│      getFullinfo.js       获取单张订单详情 (格式化:输入+输出)
│      sendLogistics.js     无物流发货 (格式化:输入)
│      sendLogisticsOffline.js  物流发货 (格式化:输入)
│      *syncOrders.js        增量同步订单到中间库 (格式化:输入)
│      *findOrders.js        从中间库批量获取订单 (格式化:输入+输出)
```

#### 5.接口规范
    
    * 一个JS文件里只导出一个方法 如:module.exports=function(content,callback){}
    * 方法都定义为两个参数 如:function getModifiedSold(content,callback){}
    * 





