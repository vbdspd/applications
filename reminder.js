const fs = require('fs'); // 确保引入了 fs 模块
const axios = require('axios')
const schedule = require('node-schedule');
const {sendCrazyB} = require('./sendMessge')
const getZllr = async (code) => {
    const params = {
        'fltt': 2,
        'secids': (code.startsWith('00') ? '0.' : '1.') + code,
        'fields': 'f14,f62,f184,f66,f69,f72,f75,f78,f81,f84,f87,f64,f65,f70,f71,f76,f77,f82,f83,f164,f166,f168,f170,f172,f252,f253,f254,f255,f256,f124,f6,f278,f279,f280,f281,f282',
        'ut': 'b2884a393a59ad64002292a3e90d46a5',
        '_': Date.now() // 使用当前时间戳
    };
    const url = 'https://push2.eastmoney.com/api/qt/ulist.np/get';
    try {
        const response = await axios.get(url, { params });
        return response.data; // 返回响应数据
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error; // 重新抛出错误，以便在调用处处理
    }
}

const getZl = async () => {
    try {
        const jrReminder = [];
        const data = JSON.parse(fs.readFileSync('./res', 'utf-8'));
        for (const item of data) {
            try {
                const result = await getZllr(item);
                const { diff = [] } = result.data || {};
                if(!diff[0]){
                    data.push(item)
                    continue
                }
                const res = diff[0] || {};
                const cdd = res['f64'];
                const dd = res['f70'];
                const zd = res['f76'];
                const xd = res['f82'];
                const f6 = res['f6'];
                const f62 = res['f62'];
                const f14 = res['f14'];
                const tj1 = (cdd + dd) > (zd + xd);
                const zlzb = (cdd + dd) / (f6 || 1); // 防止除以0
                if (tj1 || f62 > 0) {
                    jrReminder.push({
                        code: item,
                        name: f14,
                        percent: zlzb,
                        zljlr: f62
                    });
                }
            } catch (innerErr) {
                console.error(`处理项目 ${item} 时出错:`, innerErr);
            }
        }
        // 这里可以返回或处理 jrReminder，例如打印或返回
       return jrReminder
    } catch (err) {
        console.error('读取文件时出错:', err);
    }
};

const start = async ()=>{
    schedule.scheduleJob(`25 25 9 * * *`, async () => {
        const res =await getZl()
        sendCrazyB(res)
    });
}

module.exports = start