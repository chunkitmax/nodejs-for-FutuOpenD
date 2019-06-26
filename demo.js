const fs = require('fs');
const path = require('path');
const FtQuant = require('./src/futuquant');

// 自定義日志對象
const bunyan = require('bunyan');
const bunyanDebugStream = require('bunyan-debug-stream');

const bunyanLogger = bunyan.createLogger({
  name: 'sys',
  streams: [{
    level: 'debug',
    type: 'raw',
    serializers: bunyanDebugStream.serializers,
    stream: bunyanDebugStream({ forceColor: true }),
  }],
});

// 從 opend 的配置文件中獲取 userID，pwd
const FutuOpenDXMLPath = path.join(__dirname, '../FutuOpenD_1.01_Mac/FutuOpenD.xml');
const ftOpenDConfig = fs.readFileSync(FutuOpenDXMLPath);
const userID = ftOpenDConfig.match(/login_account>(\d*?)<\/login_account/)[1];
const pwdMd5 = ftOpenDConfig.match(/trade_pwd_md5>(.*?)<\/trade_pwd_md5/)[1];

// openD 配置
const ftConfig = {
  ip: '127.0.0.1',
  port: 11111,
  userID,
  market: 1, // 港股環境
  pwdMd5,
  env: 1, // 0為仿真，1為真實，默認為1。
};

const ft = new FtQuant(ftConfig, bunyanLogger);

const init = async () => {
  let res = null;
  await ft.init(); // 初始化 ft 模塊
  res = await ft.getGlobalState(); // 獲取全局狀態
  console.log('getGlobalState', res);

  // 獲取歷史成交記錄，不再需要手動解鎖交易密碼以及調用setCommonTradeHeader
  await ft.trdGetHistoryOrderFillList({
    beginTime: '2018-01-01 00:00:00',
    endTime: '2018-02-01 00:00:00',
  });
};

init();