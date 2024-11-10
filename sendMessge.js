const axios = require("axios")
const nodemailer = require("nodemailer")
let user = "2179056936@qq.com"
let pass = "vfgyrceksvpudigi"

function sendText(text,subject) {
    let transporter = nodemailer.createTransport({
        host: 'smtp.qq.com',
        port: 465,
        secure: true, // 使用SSL加密
        auth: {
            user: user, // 发件人QQ邮箱地址
            pass: pass // 发件人邮箱授权码
        }
    });

    // 邮件选项
    let mailOptions = {
        from: user, // 发件人QQ邮箱地址
        to: '3032466060@qq.com', // 收件人邮箱地址
        subject: subject, // 邮件主题
        text: text // 邮件正文
    };

    // 发送邮件
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}


// function toPer

const sendSuperPower = (data)=>{
    const text = data.map((item)=>{
        return `代码：${item.code}`
    })
    sendText(text.join("\n"),'SuperRisePower')
}

const sendCrazyB=(data)=>{
    const text = data.map((item)=>{
        return `代码：${item.code}  名称:${item.name} 净流入:${item.zljlr} 占比：${(item.percent*100/2).toFixed(0)+'%'}`
    })
    sendText(text.join("\n"),'sendCrazyB')
}
module.exports = {
    sendSuperPower,
    sendCrazyB
}