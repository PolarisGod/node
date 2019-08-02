
#以下内容为CentOS下的安装步骤 ([Windows安装](./README_win.md "Title"))
####安装内容：
    安装GCC 版本>=4.8.2-15
    安装gcc-c++   >yum install gcc-c++
    安装python 2.7 (Centos7自带)
    安装node 版本>=v6.9.1 (路径需要配置到环境变量里)
    安装jdk  版本>=1.8 (路径需要配置到环境变量里)

####环境变量举例(路径仅参考)：
    vi /etc/profile
    export JAVA_HOME=/usr/local/jdk1.8.0_91
    export JRE_HOME=/usr/local/jdk1.8.0_91/jre
    export NODE_HOME=/usr/local/node-v6.9.1-linux-x64
    export LOCAL_HOME=/usr/local
    export CLASSPATH=.:$JAVA_HOME/lib/dt.jar:$JAVA_HOME/lib/tools.jar:$JRE_HOME/lib:$CLASSPATH
    export PATH=$JAVA_HOME/bin:$NODE_HOME/bin:$PATH

####安装听云nodejs探针
    
    #切换到nodejs app主目录
    > cd docs
    > wget http://download.networkbench.com/agent/nodejs/1.4.1/tingyun-agent-nodejs-1.4.1.tar.gz
    > cd ..
    > npm install docs/tingyun-agent-nodejs-1.4.1.tar.gz
    #复制tingyun.json.example
    > cp tingyun.json.example tingyun.json
    #修改app_name
    > vi tingyun.json
    
    
####安装全局模块运行
    
    > npm install -g pm2
    > npm install -g cross-env
    
    

####解压runsa.tar ,重命名并进入目录进行安装操作 (如果安装jdbc报python错误解决方法:node-gyp --python /path/to/python2.7)
    >npm install --production
    >将java.zip解压到node_modules
    
####配置数据库信息和网站端口(映射外网端口)

    cd runsa/data>vi conf.js
    url: 'jdbc:sybase:Tds:wgz.runsa.cn:52250/rts_xjjx?charset=cp936'
    minpoolsize: 5, //最小连接池
    maxpoolsize: 20, //最大连接数
    properties: {
        user: 'zgsybase', //数据库账号
        password: 'zgsybase' //数据库口令
    }
    
    module.exports.www={
        port:8007 //网站http端口号
    };
    
    mongodb:{
        host:'tel.runsa.cn',
        // host:'192.168.15.185',
        port:27017,
        user:'runsa',
        pwd:'Runsa&345',
        master:'master'
    },
    redis:{
        host:'127.0.0.1',
        port:6379,
        pwd:'',
        db:0
    },

######配置启动密码以及线程池大小
    export logpass=123456;UV_THREADPOOL_SIZE=20;
######运行以下命令启动rest服务,logpass为启动密码,错误则连不上数据库
    pm2 start index.js --name ecweb
######以PM2方式启动自动运行
    pm2 start index.js --name ectask -- -f ./data/_conf.js
    
######输出以下含内容,表示发布成功
    [PM2] Starting index.js in fork_mode (1 instance)
    [PM2] Done.
    ┌──────────┬────┬──────┬──────┬────────┬─────────┬────────┬────────────┬──────────┐
    │ App name │ id │ mode │ pid  │ status │ restart │ uptime │ memory     │ watching │
    ├──────────┼────┼──────┼──────┼────────┼─────────┼────────┼────────────┼──────────┤
    │runsaec   │ 0  │ fork │ 6576 │ online │ 0       │ 0s     │ 9.527 MB   │ disabled │
    └──────────┴────┴──────┴──────┴────────┴─────────┴────────┴────────────┴──────────┘
     Use `pm2 show <id|name>` to get more details about an app

####测试 http://127.0.0.1:8007/eshop/runsa/ec/trades/list
######响应以下内容,为调用成功

    {"code":40602,"msg":"'签名未通过验证!'"}



正式环境部署:
1.pm2
开启web
开启task
开启rest
2.nginx+njs
task转发
eui转发


