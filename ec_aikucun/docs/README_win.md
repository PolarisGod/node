#以下内容为Windows下的安装步骤 ([CenOS安装方法](./README.md "Title"))
* 操作系统:win7 x64
* 安装:vs2013 express window desktop  805M (IE版本过低时,会要求安装IE10_Win7_X64_Standalone_XiaZaiBa.rar  67.3M )
* 安装python 2.7,需要手工增加系统环境变量 PYTHON=C:\Python27\python.exe
* 安装jdk1.8 (一般会自动配置JAVA_HOME)
* 可选项:在PATH中增加: C:\\Program Files\\Java\\jdk1.8.0_92\\jre\\bin\\server (这样可直接将编译好的jdbc包覆盖进去)
    
##模块安装
    >npm install

##运行网站
    >node index.js

##配置数据库信息和网站端口(映射外网端口)

    cd runsa/data>vi conf.js
    url: 'jdbc:sybase:Tds:wgz.runsa.cn:52250/rts_xjjx?charset=cp936'
    minpoolsize: 5, //最小连接池
    maxpoolsize: 20, //最大连接数
    properties: {
        user: 'sybderek', //数据库账号
        password: 'runsa&123' //数据库口令
    }
    
    module.exports.www={
        port:8007 //网站http端口号
    };

##使用pm2方式启动,可用以下命令启动rest服务

    cd runsa>sh start.sh
    
    ::输出以下含内容,表示发布成功
    [PM2] Starting index.js in fork_mode (1 instance)
    [PM2] Done.
    ┌──────────┬────┬──────┬──────┬────────┬─────────┬────────┬────────────┬──────────┐
    │ App name │ id │ mode │ pid  │ status │ restart │ uptime │ memory     │ watching │
    ├──────────┼────┼──────┼──────┼────────┼─────────┼────────┼────────────┼──────────┤
    │ runsa    │ 0  │ fork │ 6576 │ online │ 0       │ 0s     │ 9.527 MB   │ disabled │
    └──────────┴────┴──────┴──────┴────────┴─────────┴────────┴────────────┴──────────┘
     Use `pm2 show <id|name>` to get more details about an app

##测试 http://127.0.0.1/demo/hello

