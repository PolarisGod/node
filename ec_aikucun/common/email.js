/**
 * Created by Dbit on 2016/6/1.
 */
//var email = require("mailer");
//exports.sendMail=function(content,cb){
//    var emf={
//        ssl: false,
//        host: "smtp.126.com",//发送 smtp.qq.com，接收 pop.qq.com
//        port:25,
//        domain:"[127.0.0.1]",//可以在浏览器中输入 http://ip.qq.com/ 得到
//        to: "derek@runsasoft.com",
//        from: "jmailto@126.com",
//        subject:"nodejs",//reply_to: xxx@xxx.com,
//        body:content,
//        authentication:"login",
//        username:"jmailto",
//        password:"a1a1a1",
//        debug: false
//    };
//    email.send(emf,function (err, result) {
//        if (err) return console.log("sendMail:" + err);
//        //console.log(result);
//    });
//};
const _=require('lodash');
var nodemailer = require("nodemailer");
var transport = nodemailer.createTransport({
    host: "smtp.126.com",
    secure: true, // use SSL
    port: 465, // port for secure SMTP
    auth: {
        user: "jmailto",
        pass: "a1a1a1"
    }
});

exports.sendMail=function(option){
    if (option==null) return console.error(new Error('Args cannot be null !'));

    var emf={
        from : "jmailto@126.com",
        to : "derek@runsasoft.com",
        subject: "nodejs",
        text: 'Plaintext version of the message'
    };
    if ((typeof option)==='object') {
        _.merge(emf,option);
    }else {
        emf.html = option;
    }

    transport.sendMail(emf, (error, info)=>{
        if(error){
            console.error(error);
        }else{
            console.log("Message sent: " + info.response);
        }
        transport.close();
    });
};