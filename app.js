
const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// 设置静态文件夹
app.use(express.static(path.join(__dirname, 'public')));

// 定义一个路由来处理根路径的请求
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});