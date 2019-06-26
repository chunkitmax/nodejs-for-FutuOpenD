## FutuQuant量化接口Nodejs版本

### 說明

基於 FutuQuant v3.2 底層協議封裝的 nodejs 版本接口，數據格式使用 protobuf，使用前請先在本地或者服務端啟動 FutuOpenD 服務。

* 使用了async/await語法，要求nodejs版本v7.10.1以上，v7.5.1以上可以使用`--harmony`或者`--harmony-async-await`參數開啟async/await的支持，v7.6.x 以可以不用開啟 flag 直接使用。。
* 底層協議基於FutuQuant v3.2，參考：[FutunnOpen/futuquant](https://github.com/FutunnOpen/futuquant/)。
* 數據傳輸格式目前只支持 protobuf。
* API文檔相關：[https://yisbug.github.io/nodejs-for-FutuOpenD/doc/index.html](https://yisbug.github.io/nodejs-for-FutuOpenD/doc/index.html)

> 為了方便使用，請注意部分接口參數及返回結果和富途官方版本不完全一致，詳細請參考[API文檔](https://yisbug.github.io/nodejs-for-FutuOpenD/doc/index.html)。

### 安裝

``` 
npm install futuquant --save
```

或者

``` 
yarn add futuquant
```

### 使用

``` javascript
/**
-  **所有行情相關協議獲取數據都需要先通過（1005）協議訂閱成功後才能查詢**
-  **訂閱的上限為500個訂閱單位。一只股票的一個K線類型佔2個訂閱單位、分時佔2個訂閱單位、
-  報價佔1個訂閱單位、擺盤佔5個訂閱單位（牛熊為1）、逐筆佔5個訂閱單位（牛熊為1）、經紀隊列佔5個訂閱單位（牛熊為1）。**
-  **反訂閱（1006）的時間限制為１分鐘，即訂閱某支股票某個訂閱位１分鐘之後才能反訂閱**
-  **30秒內不能超過20次交易請求。**
-  **建議所有行情拉取接口在同一條長連接上。推送數據在第二條長連接上。交易接口在第三條長連接上。**
 */
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
  await ft.init(); // 初始化 ft 模塊，包括調用initConnect、解鎖交易接口、設置 TradeHeader

  let res = null;
  res = await ft.getGlobalState(); // 獲取全局狀態
  console.log('getGlobalState', res);

  // 獲取歷史成交記錄，不再需要手動解鎖交易密碼以及調用setCommonTradeHeader
  await ft.trdGetHistoryOrderFillList({
    beginTime: '2018-01-01 00:00:00',
    endTime: '2018-02-01 00:00:00',
  });
};

init();
```

### 測試

請先修改`test/futuquant.test.js`中`FutuOpenDXMLPath`的路徑，然後執行`npm install`或`yarn`安裝相關依賴。

運行測試：

```
npm test
```
