const axios = require('axios');
const fs = require('fs');
const now = new Date();
now.setDate(now.getDate() - 1); // 设置日期为昨天
const schedule = require('node-schedule');
const yesterday = Math.floor(now.getTime() / 1000); // 获取 Unix 时间戳（秒）

// 提取URL中的查询参数（基础部分）
const baseParams = {
    pn: 1,
    pz: 400,
    po: 1,
    np: 1,
    ut: 'bd1d9ddb04089700cf9c27f6f7426281',
    fltt: 2,
    invt: 2,
    dect: 1,
    wbp2u: '|0|0|0|web',
    fid: 'f6',
    fs: 'm:0+t:6,m:0+t:80,m:1+t:2,m:1+t:23,m:0+t:81+s:2048',
    fields: 'f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f22,f11,f62,f128,f136,f115,f152',
    _: yesterday
};

// 获取股票数据的函数
const getStockData = async (code) => {
    const url = 'https://push2his.eastmoney.com/api/qt/stock/kline/get';
    const params = {
        secid: (code.startsWith('00') ? '0.' : '1.') + code,
        ut: 'fa5fd1943c7b386f172d6893dbfba10b',
        fields1: 'f1,f2,f3,f4,f5,f6',
        fields2: 'f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61',
        klt: '101',
        fqt: '1',
        beg: '0',
        end: '20500101',
        lmt: '120'
    };
    try {
        const response = await axios.get(url, { params });
        return response.data.data;
    } catch (error) {
        console.error(`Error fetching stock data for code ${code}:`, error);
        return null;
    }
};

// 获取股票代码并检查条件的函数
const getRes = async () => {
    try {
        const response = await axios.get('https://10.push2.eastmoney.com/api/qt/clist/get', { params: baseParams });
        const data = response.data.data.diff;
        const stockCodes = data.map(item => item.f12).filter(item => item.startsWith('60') || item.startsWith('00'));
        const results = [];
        for (const code of stockCodes) {
            const stockData = await getStockData(code);
            if (stockData && stockData.klines.length >= 3) {
                const [day3, day2, day1] = stockData.klines.slice(-3).map(line => line.split(',').map(Number));
                const jrzt = day1[2] >= (day2[2] + day2[2] * 0.1);
                const zrzt = day2[2] >= (day3[2] + day3[2] * 0.1);
                const jrcj = day1[5];
                const zrcj = day2[5];
                if ((jrcj > zrcj*0.9) && (jrzt || zrzt)) {
                    results.push(code);
                }
            }
        }
        fs.writeFile('./res',JSON.stringify(results),(err)=>console.log(err))
    } catch (error) {
        console.error('Error fetching or processing stock data:', error);
    }
};

const start = async ()=>{
    schedule.scheduleJob(`00 30 16 * * *`, async () => {
        getRes();
    });
}

module.exports = start