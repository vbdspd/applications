const fs = require('fs'); // 确保引入了 fs 模块
const axios = require('axios');
const { response } = require('express');
const schedule = require('node-schedule');
const sendText = require("./sendMessge")
const getPrice = async (code) => {
    const url = 'https://push2.eastmoney.com/api/qt/stock/get'
    const params = {
        invt: 2,
        fltt: 1,
        fields: 'f43',
        secid: (code.startsWith('00') ? '0.' : '1.') + code,
        ut: 'fa5fd1943c7b386f172d6893dbfba10b',
        dect: 1,
        wbp2u: '|0|0|0|web'
    }
    try {
        const response = await axios.get(url, { params });
        return response.data; // 返回响应数据
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error; // 重新抛出错误，以便在调用处处理
    }
}
const startGetPrice = async (code) => {
    const data = JSON.parse(fs.readFileSync('./res', 'utf-8'));
    const _res = []
    const time1 = Date.now()
    for (let item of data) {
        const res = await getPrice(item)
        const data = { code: item, price: res.data.f43, name: res.data.f14}
        _res.push(data)
    }
    const time2 = Date.now()
    console.log(time2 - time1)
    return _res
}
let res1 = []
let res2 = []
const start = async () => {
    schedule.scheduleJob(`58 24 9 * * *`, async () => {
        res1 =await startGetPrice()
    });
    schedule.scheduleJob(`4 25 9 * * *`, async () => {
        res2 = await startGetPrice()
    });
    schedule.scheduleJob(`15 25 9 * * *`, () => {
        const data =[]
        debugger
        for(let item1 of res1){
            for(let item2 of res2){
                if(item2.code===item1.code){
                    if(item2.price>item1.price) {
                        const zf = ((item2.price-item1.price) / item1.price)
                        data.push({code:item1.code,zf})
                    }
                }
            }
        }
        data.sort((a,b)=>b.zf-a.zf)
        if(data.length){
            sendText.sendSuperPower(data)
        }
    });
}


module.exports = start