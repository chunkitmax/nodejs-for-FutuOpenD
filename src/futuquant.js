const bunyan = require('bunyan');
const bunyanDebugStream = require('bunyan-debug-stream');
const Socket = require('./socket');

const sleep = async time => new Promise((resolve) => {
  setTimeout(resolve, time);
});

/**
 * 封裝FutuQuant底層協議模塊
 */
class FutuQuant {
  /**
   * Creates an instance of FutuQuant.
   * @param {object} params 初始化參數
   * @param {string} params.ip FutuOpenD服務IP
   * @param {number} params.port FutuOpenD服務端口
   * @param {number} params.userID 牛牛號
   * @param {string} params.pwdMd5 解鎖交易 md5
   * @param {TrdMarket} [params.market] 市場環境，默認為港股環境，1港股2美股3大陸市場4香港A股通市場
   * @param {TrdEnv} [params.env] 0為仿真環境，1為真實環境，2為回測環境，默認為1
   * @param {object} [logger] 日志對象，若不傳入，則使用bunyan.createLogger創建
   * @memberof FutuQuant
   */
  constructor(params, logger) {
    if (typeof params !== 'object') throw new Error('傳入參數類型錯誤');
    // 處理參數
    const {
      ip,
      port,
      userID,
      market,
      pwdMd5,
      env,
    } = params;
    if (!ip) throw new Error('必須指定FutuOpenD服務的ip');
    if (!port) throw new Error('必須指定FutuOpenD服務的port');
    if (!userID) throw new Error('必須指定FutuOpenD服務的牛牛號');
    if (!pwdMd5) throw new Error('必須指定FutuOpenD服務的解鎖 MD5');

    this.logger = logger;
    this.market = market || 1; // 當前市場環境，1港股2美股3大陸市場4香港A股通市場
    this.userID = userID;
    this.pwdMd5 = pwdMd5;
    this.params = params;
    this.env = env;
    if (typeof this.env !== 'number') this.env = 1; // 0為仿真環境，1為真實環境，2為回測環境

    // 處理日志
    const methods = ['debug', 'info', 'warn', 'error', 'fatal', 'trace'];
    if (this.logger) {
      methods.forEach((key) => {
        if (typeof this.logger[key] !== 'function') this.logger = null;
      });
    }
    this.logger = this.logger || bunyan.createLogger({
      name: 'sys',
      streams: [{
        level: 'debug',
        type: 'raw',
        serializers: bunyanDebugStream.serializers,
        stream: bunyanDebugStream({ forceColor: true }),
      }],
    });

    this.socket = new Socket(ip, port, this.logger); // 實例化的socket對象,所有行情拉取接口
    this.inited = false; // 是否已經初始化
    this.trdHeader = null; // 交易公共頭部信息
    this.timerKeepLive = null; // 保持心跳定時器
  }
  /**
   * 初始化處理
   */
  async init() {
    if (this.inited) return;
    await this.initConnect();
    await this.limitExecTimes(30 * 1000, 10, async () => {
      await this.trdUnlockTrade(true, this.pwdMd5); // 解鎖交易密碼
    });
    const { accID } = (await this.trdGetAccList())[0]; // 獲取交易賬戶
    await this.setCommonTradeHeader(this.env, accID, this.market); // 設置為港股的真實環境
    this.inited = true;
  }
  /**
   * 初始化連接，InitConnect.proto協議返回對象
   * @typedef InitConnectResponse
   * @property {number} serverVer FutuOpenD的版本號
   * @property {number} loginUserID FutuOpenD登陸的牛牛用戶ID
   * @property {number} connID 此連接的連接ID，連接的唯一標識
   * @property {string} connAESKey 此連接後續AES加密通信的Key，固定為16字節長字符串
   * @property {number} keepAliveInterval 心跳保活間隔
   */
  /**
   * InitConnect.proto - 1001初始化連接
   *
    nodejs版本會根據返回的keepAliveInterval字段自動保持心跳連接，不再需要手動調用ft.keepLive()方法。
    請求其它協議前必須等InitConnect協議先完成
    若FutuOpenD配置了加密， 「connAESKey」將用於後續協議加密
    keepAliveInterval 為建議client發起心跳 KeepAlive 的間隔
   * @async
   * @param {object} params 初始化參數
   * @param {number} params.clientVer 客戶端版本號，clientVer = "."以前的數 * 100 + "."以後的，舉例：1.1版本的clientVer為1 * 100 + 1 = 101，2.21版本為2 * 100 + 21 = 221
   * @param {string} params.clientID 客戶端唯一標識，無生具體生成規則，客戶端自己保證唯一性即可
   * @param {boolean} params.recvNotify 此連接是否接收市場狀態、交易需要重新解鎖等等事件通知，true代表接收，FutuOpenD就會向此連接推送這些通知，反之false代表不接收不推送
   * @returns {InitConnectResponse}
   */
  async initConnect(params) {
    if (this.inited) throw new Error('請勿重復初始化連接');
    return new Promise(async (resolve) => {
      this.socket.onConnect(async () => {
        const res = await this.socket.send('InitConnect', Object.assign({
          clientVer: 101,
          clientID: 'yisbug',
          recvNotify: true,
        }, params));
        // 保持心跳
        this.connID = res.connID;
        this.connAESKey = res.connAESKey;
        this.keepAliveInterval = res.keepAliveInterval;
        if (this.timerKeepLive) {
          clearInterval(this.timerKeepLive);
          this.timerKeepLive = null;
        }
        this.timerKeepLive = setInterval(() => this.keepAlive(), 1000 * this.keepAliveInterval);
        resolve(res);
      });
      await this.socket.init();
    });
  }
  /**
   * 斷開連接
   */
  close() {
    if (this.timerKeepLive) {
      clearInterval(this.timerKeepLive);
      this.socket.close();
      this.inited = false;
    }
  }
  /**
   * GetGlobalState.proto協議返回對象
   * @typedef GetGlobalStateResponse
   * @property {QotMarketState} marketHK Qot_Common.QotMarketState,港股主板市場狀態
   * @property {QotMarketState} marketUS Qot_Common.QotMarketState,美股Nasdaq市場狀態
   * @property {QotMarketState} marketSH Qot_Common.QotMarketState,滬市狀態
   * @property {QotMarketState} marketSZ Qot_Common.QotMarketState,深市狀態
   * @property {QotMarketState} marketHKFuture Qot_Common.QotMarketState,港股期貨市場狀態
   * @property {boolean} qotLogined 是否登陸行情服務器
   * @property {boolean} trdLogined 是否登陸交易服務器
   * @property {number} serverVer 版本號
   * @property {number} serverBuildNo buildNo
   * @property {number} time 當前格林威治時間
   */
  /**
   * GetGlobalState.proto - 1002獲取全局狀態
   * @async
   * @returns {GetGlobalStateResponse}
   */
  getGlobalState() {
    return this.socket.send('GetGlobalState', {
      userID: this.userID,
    });
  }
  /**
   * KeepAlive.proto - 1004保活心跳
   * @returns {number} time 服務器回包時的格林威治時間戳，單位秒
   */
  async keepAlive() {
    const time = await this.socket.send('KeepAlive', {
      time: Math.round(Date.now() / 1000),
    });
    return time;
  }
  /**
   * Qot_Sub.proto - 3001訂閱或者反訂閱
   *
    股票結構參考 Security
    訂閱數據類型參考 SubType
    復權類型參考 RehabType
    為控制定閱產生推送數據流量，股票定閱總量有額度控制，訂閱規則參考 高頻數據接口
    高頻數據接口需要訂閱之後才能使用，注冊推送之後才可以收到數據更新推送
   * @param {object} params
   * @param {Security[]} params.securityList 股票
   * @param {SubType[]} params.subTypeList Qot_Common.SubType,訂閱數據類型
   * @param {boolean} [params.isSubOrUnSub=true] ture表示訂閱,false表示反訂閱
   * @param {boolean} [params.isRegOrUnRegPush=true] 是否注冊或反注冊該連接上面行情的推送,該參數不指定不做注冊反注冊操作
   * @param {number} params.regPushRehabTypeList Qot_Common.RehabType,復權類型,注冊推送並且是K線類型才生效,其他訂閱類型忽略該參數,注冊K線推送時該參數不指定默認前復權
   * @param {boolean} [params.isFirstPush=true] 注冊後如果本地已有數據是否首推一次已存在數據,該參數不指定則默認true
   * @async
   */
  qotSub(params) {
    return this.socket.send('Qot_Sub', Object.assign({
      securityList: [],
      subTypeList: [],
      isSubOrUnSub: true,
      isRegOrUnRegPush: true,
      regPushRehabTypeList: [],
      isFirstPush: true,
    }, params));
  }
  /**
   * Qot_RegQotPush.proto - 3002注冊行情推送
   *
    股票結構參考 Security
    訂閱數據類型參考 SubType
    復權類型參考 RehabType
    行情需要訂閱成功才能注冊推送
   * @param {object} params Object
   * @param {Security[]} params.securityList 股票
   * @param {SubType[]} params.subTypeList Qot_Common.SubType,訂閱數據類型
   * @param {SubType[]} params.rehabTypeList Qot_Common.RehabType,復權類型,注冊K線類型才生效,其他訂閱類型忽略該參數,注冊K線時該參數不指定默認前復權
   * @param {boolean} [params.isRegOrUnReg=true] 注冊或取消
   * @param {boolean} [params.isFirstPush=true] 注冊後如果本地已有數據是否首推一次已存在數據,該參數不指定則默認true
   * @async
   */
  qotRegQotPush(params) { // 3002注冊行情推送
    return this.socket.send('Qot_RegQotPush', Object.assign({
      securityList: [],
      subTypeList: [],
      rehabTypeList: [],
      isRegOrUnReg: true,
      isFirstPush: true,
    }, params));
  }
  /**
   * Qot_GetSubInfo.proto協議返回對象
   * @typedef QotGetSubInfoResponse
   * @property {ConnSubInfo[]} connSubInfoList 訂閱信息
   * @property {number} totalUsedQuota FutuOpenD已使用的訂閱額度
   * @property {number} remainQuota FutuOpenD剩余訂閱額度
   */
  /**
   * Qot_GetSubInfo.proto - 3003獲取訂閱信息
   * @async
   * @param {boolean} [isReqAllConn=false] 是否返回所有連接的訂閱狀態，默認false
   * @returns {QotGetSubInfoResponse}
   */
  qotGetSubInfo(isReqAllConn = false) { // 3003獲取訂閱信息
    return this.socket.send('Qot_RegQotPush', {
      isReqAllConn,
    });
  }
  /**
   * Qot_GetBasicQot.proto - 3004獲取股票基本行情
   *
    股票結構參考 Security
    基本報價結構參考 BasicQot
   * @param {Security[]} securityList 股票列表
   * @returns {BasicQot[]} basicQotList 股票基本報價
   * @async
   */
  async qotGetBasicQot(securityList) { // 3004獲取股票基本行情
    return (await this.socket.send('Qot_GetBasicQot', {
      securityList,
    })).basicQotList || [];
  }
  /**
   * 注冊股票基本報價通知，需要先調用訂閱接口
   * Qot_UpdateBasicQot.proto - 3005推送股票基本報價
   * @async
   * @param {function} callback  回調
   * @returns {BasicQot[]} basicQotList
   */
  subQotUpdateBasicQot(callback) { // 注冊股票基本報價通知
    return this.socket.subNotify(3005, data => callback(data.basicQotList || []));
  }
  /**
   * Qot_GetKL.proto - 3006獲取K線
   *
    復權類型參考 RehabType
    K線類型參考 KLType
    股票結構參考 Security
    K線結構參考 KLine
    請求K線目前最多最近1000根
   * @param {object} params
   * @param {RehabType} params.rehabType Qot_Common.RehabType,復權類型
   * @param {KLType} params.klType Qot_Common.KLType,K線類型
   * @param {Security} params.security 股票
   * @param {number} params.reqNum 請求K線根數
   * @async
   * @returns {KLine[]} k線點
   */
  async qotGetKL(params) { // 3006獲取K線
    return (await this.socket.send('Qot_GetKL', Object.assign({
      rehabType: 1, // Qot_Common.RehabType,復權類型
      klType: 1, // Qot_Common.KLType,K線類型
      security: {}, // 股票
      reqNum: 60, // 請求K線根數
    }, params))).klList || [];
  }
  /**
   * Qot_UpdateKL.proto協議返回對象
   * @typedef QotUpdateKLResponse
   * @property {RehabType} rehabType Qot_Common.RehabType,復權類型
   * @property {KLType} klType Qot_Common.KLType,K線類型
   * @property {Security} security 股票
   * @property {KLine[]} klList 推送的k線點
   */
  /**
   * 注冊K線推送，需要先調用訂閱接口
   * Qot_UpdateKL.proto - 3007推送K線
   * @async
   * @returns {QotUpdateKLResponse} 推送的k線點
   */
  subQotUpdateKL(callback) { // 注冊K線推送
    return this.socket.subNotify(3007, callback);
  }
  /**
   * Qot_GetRT.proto - 3008獲取分時
   * @async
   * @param {Security} security 股票
   * @returns {TimeShare[]} 分時點
   */
  async qotGetRT(security) { // 獲取分時
    return (await this.socket.send('Qot_GetRT', {
      security,
    })).rtList || [];
  }
  /**
   * 注冊分時推送，需要先調用訂閱接口
   * Qot_UpdateRT.proto - 3009推送分時
   * @async
   * @returns {TimeShare[]} 分時點
   */
  subQotUpdateRT(callback) { // 注冊分時推送
    return this.socket.subNotify(3009, data => callback(data.rtList || []));
  }
  /**
   * Qot_GetTicker.proto - 3010獲取逐筆
   *
    股票結構參考 Security
    逐筆結構參考 Ticker
    請求逐筆目前最多最近1000個
   * @param {Security} security 股票
   * @param {number} maxRetNum 最多返回的逐筆個數,實際返回數量不一定會返回這麼多,最多返回1000個，默認100
   * @returns {Ticker[]} 逐筆
   * @async
   */
  async qotGetTicker(security, maxRetNum = 100) { // 3010獲取逐筆
    return (await this.socket.send('Qot_GetTicker', {
      security,
      maxRetNum,
    })).tickerList || [];
  }
  /**
   * Qot_GetTicker.proto協議返回對象
   * @typedef subQotUpdateTickerResponse
   * @property {Security} security 股票
   * @property {Ticker[]} tickerList 逐筆
   */
  /**
   * 注冊逐筆推送，需要先調用訂閱接口
   * Qot_UpdateTicker.proto - 3011推送逐筆
   * @async
   * @param {function} callback  回調
   * @returns {subQotUpdateTickerResponse} 逐筆
   */
  subQotUpdateTicker(callback) { // 注冊逐筆推送
    return this.socket.subNotify(3011, callback);
  }
  /**
   * Qot_GetOrderBook.proto協議返回對象
   * @typedef QotGetOrderBookResponse
   * @property {Security} security 股票
   * @property {OrderBook[]} orderBookAskList 賣盤
   * @property {OrderBook[]} sellList 賣盤，同orderBookAskList
   * @property {OrderBook[]} orderBookBidList 買盤
   * @property {OrderBook[]} buyList 買盤，同orderBookBidList
   */
  /**
   * Qot_GetOrderBook.proto - 3012獲取買賣盤，需要先調用訂閱接口
   * @async
   * @param {Security} security 股票
   * @param {number} num 請求的擺盤個數（1-10），默認10
   * @returns {QotGetOrderBookResponse}
   */
  async qotGetOrderBook(security, num = 10) { // 3012獲取買賣盤
    const result = await this.socket.send('Qot_GetOrderBook', {
      security,
      num,
    });
    result.orderBookAskList = result.orderBookAskList || [];
    result.orderBookBidList = result.orderBookBidList || [];
    result.sellList = result.orderBookAskList;
    result.buyList = result.orderBookBidList;
    result.sellList.forEach((item) => { item.volume = Number(item.volume); });
    result.buyList.forEach((item) => { item.volume = Number(item.volume); });
    return result;
  }
  /**
   * 注冊買賣盤推送，需要先調用訂閱接口
   * Qot_UpdateOrderBook.proto - 3013推送買賣盤
   * @async
   * @param {function} callback 回調
   * @const {QotGetOrderBookResponse}
   */
  subQotUpdateOrderBook(callback) { // 注冊買賣盤推送
    return this.socket.subNotify(3013, (data) => {
      data.sellList = data.orderBookAskList || [];
      data.buyList = data.orderBookBidList || [];
      data.sellList.forEach((item) => { item.volume = Number(item.volume); });
      data.buyList.forEach((item) => { item.volume = Number(item.volume); });
      callback(data);
    });
  }
  /**
   * Qot_GetBroker.proto協議返回對象
   * @typedef QotGetBrokerResponse
   * @property {Security} security 股票
   * @property {Broker[]} brokerAskList 經紀Ask(賣)盤
   * @property {Broker[]} sellList 經紀Ask(賣)盤，同brokerAskList
   * @property {Broker[]} brokerBidList 經紀Bid(買)盤
   * @property {Broker[]} buyList 經紀Bid(買)盤，同brokerBidList
   */
  /**
   * Qot_GetBroker.proto - 3014獲取經紀隊列
   * @async
   * @param {Security} security Object 股票
   * @returns {QotGetBrokerResponse}
   */
  async qotGetBroker(security) { // 3014獲取經紀隊列
    const result = await this.socket.send('Qot_GetBroker', {
      security,
    });
    result.brokerAskList = result.brokerAskList || [];
    result.brokerBidList = result.brokerBidList || [];
    result.sellList = result.brokerAskList;
    result.buyList = result.brokerBidList;
    return result;
  }
  /**
   * 注冊經紀隊列推送，需要先調用訂閱接口
   * Qot_UpdateBroker.proto - 3015推送經紀隊列
   * @async
   * @param {function} callback 回調
   * @returns {QotGetBrokerResponse}
   */
  subQotUpdateBroker(callback) { // 注冊經紀隊列推送
    return this.socket.subNotify(3015, (result) => {
      result.brokerAskList = result.brokerAskList || [];
      result.brokerBidList = result.brokerBidList || [];
      result.sellList = result.brokerAskList;
      result.buyList = result.brokerBidList;
      callback(result);
    });
  }
  // /**
  //  * Qot_GetHistoryKL.proto - 3100獲取單只股票一段歷史K線
  //  * @async
  //  * @param {object} params
  //  * @param {RehabType} params.rehabType Qot_Common.RehabType,復權類型
  //  * @param {KLType} params.klType Qot_Common.KLType,K線類型
  //  * @param {Security} params.security 股票市場以及股票代碼
  //  * @param {string} params.beginTime 開始時間字符串
  //  * @param {string} params.endTime 結束時間字符串
  //  * @param {number} [params.maxAckKLNum] 最多返回多少根K線，如果未指定表示不限制
  //  * @param {number} [params.needKLFieldsFlag] 指定返回K線結構體特定某幾項數據，KLFields枚舉值或組合，如果未指定返回全部字段
  //  * @returns {KLine[]}
  //  */
  // async qotGetHistoryKL(params) { // 3100獲取單只股票一段歷史K線
  //   return (await this.socket.send('Qot_GetHistoryKL', Object.assign({
  //     rehabType: 1, // Qot_Common.RehabType,復權類型
  //     klType: 1, // Qot_Common.KLType,K線類型
  //     security: {}, // 股票市場以及股票代碼
  //     beginTime: '', // 開始時間字符串
  //     endTime: '', // 結束時間字符串
  //     // maxAckKLNum: 60, // 最多返回多少根K線，如果未指定表示不限制
  //     // needKLFieldsFlag: 512, // 指定返回K線結構體特定某幾項數據，KLFields枚舉值或組合，如果未指定返回全部字段
  //   }, params))).klList || [];
  // }
  // /**
  //  * 當請求時間點數據為空時，如何返回數據
  //  *
  //   NoDataMode_Null = 0; //直接返回空數據
  //   NoDataMode_Forward = 1; //往前取值，返回前一個時間點數據
  //   NoDataMode_Backward = 2; //向後取值，返回後一個時間點數據
  //  * @typedef {number} NoDataMode
  //  */
  // /**
  //  * 這個時間點返回數據的狀態以及來源
  //  *
  //   DataStatus_Null = 0; //空數據
  //   DataStatus_Current = 1; //當前時間點數據
  //   DataStatus_Previous = 2; //前一個時間點數據
  //   DataStatus_Back = 3; //後一個時間點數據
  //  * @typedef {number} DataStatus
  //  */
  // /**
  //  * K線數據
  //  *
  //  * @typedef HistoryPointsKL
  //  * @property {DataStatus} status DataStatus,數據狀態
  //  * @property {string} reqTime 請求的時間
  //  * @property {KLine} kl K線數據
  //  */
  // /**
  //  * 多只股票的多點歷史K線點
  //  *
  //  * @typedef SecurityHistoryKLPoints
  //  * @property {Security} security 股票
  //  * @property {HistoryPointsKL} klList K線數據
  //  */
  // /**
  //  * Qot_GetHistoryKLPoints.proto - 3101獲取多只股票多點歷史K線
  //  *
  //   復權類型參考 RehabType
  //   K線類型參考 KLType
  //   股票結構參考 Security
  //   K線結構參考 KLine
  //   K線字段類型參考 KLFields
  //   目前限制最多5個時間點，股票個數不做限制，但不建議傳入過多股票，查詢耗時過多會導致協議返回超時。
  //  * @async
  //  * @param {object} params
  //  * @param {RehabType} params.rehabType Qot_Common.RehabType,復權類型
  //  * @param {KLType} params.klType Qot_Common.KLType,K線類型
  //  * @param {NoDataMode} params.noDataMode NoDataMode,當請求時間點數據為空時，如何返回數據
  //  * @param {Security[]} params.securityList 股票市場以及股票代碼
  //  * @param {string[]} params.timeList 時間字符串
  //  * @param {number} [params.maxReqSecurityNum] 最多返回多少只股票的數據，如果未指定表示不限制
  //  * @param {KLFields} [params.needKLFieldsFlag] 指定返回K線結構體特定某幾項數據，KLFields枚舉值或組合，如果未指定返回全部字段
  //  * @returns {SecurityHistoryKLPoints[]}
  //  */
  // qotGetHistoryKLPoints(params) { // 3101獲取多只股票多點歷史K線
  //   return this.socket.send('Qot_GetHistoryKLPoints', Object.assign({
  //     rehabType: 1, // Qot_Common.RehabType,復權類型
  //     klType: 1, // Qot_Common.KLType,K線類型
  //     noDataMode: 0, // NoDataMode,當請求時間點數據為空時，如何返回數據。0
  //     securityList: [], // 股票市場以及股票代碼
  //     timeList: [], // 時間字符串
  //     maxReqSecurityNum: 60, // 最多返回多少只股票的數據，如果未指定表示不限制
  //     needKLFieldsFlag: 512, // 指定返回K線結構體特定某幾項數據，KLFields枚舉值或組合，如果未指定返回全部字段
  //   }, params)).klPointList || [];
  // }
  // /**
  //  * 公司行動組合,指定某些字段值是否有效
  //  *
  //   CompanyAct_None = 0; //無
  //   CompanyAct_Split = 1; //拆股
  //   CompanyAct_Join = 2; //合股
  //   CompanyAct_Bonus = 4; //送股
  //   CompanyAct_Transfer = 8; //轉贈股
  //   CompanyAct_Allot = 16; //配股
  //   CompanyAct_Add = 32; //增發股
  //   CompanyAct_Dividend = 64; //現金分紅
  //   CompanyAct_SPDividend = 128; //特別股息
  //  * @typedef {number} CompanyAct
  //  */
  // /**
  //  * 復權信息
  //  *
  //  * @typedef Rehab
  //  * @property {string} time 時間字符串
  //  * @property {CompanyAct} companyActFlag 公司行動組合,指定某些字段值是否有效
  //  * @property {number} fwdFactorA 前復權因子A
  //  * @property {number} fwdFactorB 前復權因子B
  //  * @property {number} bwdFactorA 後復權因子A
  //  * @property {number} bwdFactorB 後復權因子B
  //  * @property {number} [splitBase] 拆股(eg.1拆5，Base為1，Ert為5)
  //  * @property {number} [splitErt]
  //  * @property {number} [joinBase] 合股(eg.50合1，Base為50，Ert為1)
  //  * @property {number} [joinErt]
  //  * @property {number} [bonusBase] 送股(eg.10送3, Base為10,Ert為3)
  //  * @property {number} [bonusErt]
  //  * @property {number} [transferBase] 轉贈股(eg.10轉3, Base為10,Ert為3)
  //  * @property {number} [transferErt]
  //  * @property {number} [allotBase] 配股(eg.10送2, 配股價為6.3元, Base為10, Ert為2, Price為6.3)
  //  * @property {number} [allotErt]
  //  * @property {number} [allotPrice]
  //  * @property {number} [addBase] 增發股(eg.10送2, 增發股價為6.3元, Base為10, Ert為2, Price為6.3)
  //  * @property {number} [addErt]
  //  * @property {number} [addPrice]
  //  * @property {number} [dividend] 現金分紅(eg.每10股派現0.5元,則該字段值為0.05)
  //  * @property {number} [spDividend] 特別股息(eg.每10股派特別股息0.5元,則該字段值為0.05)
  //  */
  // /**
  //  * 股票復權信息
  //  *
  //  * @typedef SecurityRehab
  //  * @property {Security} security 股票
  //  * @property {Rehab[]} rehabList 復權信息
  //  */
  // /**
  //  * Qot_GetRehab.proto - 3102獲取復權信息
  //  * @async
  //  * @param {Security[]} securityList 股票列表
  //  * @returns {SecurityRehab[]} securityRehabList 多支股票的復權信息
  //  */
  // qotGetRehab(securityList) { // 3102獲取復權信息
  //   return this.socket.send('Qot_GetRehab', {
  //     securityList,
  //   });
  // }
  /**
   * Qot_GetHistoryKL.proto - 3103獲取單只股票一段歷史K線
   * @async
   * @param {object} params
   * @param {RehabType} params.rehabType Qot_Common.RehabType,復權類型
   * @param {KLType} params.klType Qot_Common.KLType,K線類型
   * @param {Security} params.security 股票市場以及股票代碼
   * @param {string} params.beginTime 開始時間字符串
   * @param {string} params.endTime 結束時間字符串
   * @param {number} [params.maxAckKLNum] 最多返回多少根K線，如果未指定表示不限制
   * @param {number} [params.needKLFieldsFlag] 指定返回K線結構體特定某幾項數據，KLFields枚舉值或組合，如果未指定返回全部字段
   * @returns {KLine[]}
   */
  async qotRequestHistoryKL(params) { // 3100獲取單只股票一段歷史K線
    return (await this.socket.send('Qot_RequestHistoryKL', Object.assign({
      rehabType: 1, // Qot_Common.RehabType,復權類型
      klType: 1, // Qot_Common.KLType,K線類型
      security: {}, // 股票市場以及股票代碼
      beginTime: '', // 開始時間字符串
      endTime: '', // 結束時間字符串
      // maxAckKLNum: 60, // 最多返回多少根K線，如果未指定表示不限制
      // needKLFieldsFlag: 512, // 指定返回K線結構體特定某幾項數據，KLFields枚舉值或組合，如果未指定返回全部字段
    }, params))).klList || [];
  }
  /**
   * 公司行動組合,指定某些字段值是否有效
   *
    CompanyAct_None = 0; //無
    CompanyAct_Split = 1; //拆股
    CompanyAct_Join = 2; //合股
    CompanyAct_Bonus = 4; //送股
    CompanyAct_Transfer = 8; //轉贈股
    CompanyAct_Allot = 16; //配股
    CompanyAct_Add = 32; //增發股
    CompanyAct_Dividend = 64; //現金分紅
    CompanyAct_SPDividend = 128; //特別股息
   * @typedef {number} CompanyAct
   */
  /**
   * 復權信息
   *
   * @typedef Rehab
   * @property {string} time 時間字符串
   * @property {CompanyAct} companyActFlag 公司行動組合,指定某些字段值是否有效
   * @property {number} fwdFactorA 前復權因子A
   * @property {number} fwdFactorB 前復權因子B
   * @property {number} bwdFactorA 後復權因子A
   * @property {number} bwdFactorB 後復權因子B
   * @property {number} [splitBase] 拆股(eg.1拆5，Base為1，Ert為5)
   * @property {number} [splitErt]
   * @property {number} [joinBase] 合股(eg.50合1，Base為50，Ert為1)
   * @property {number} [joinErt]
   * @property {number} [bonusBase] 送股(eg.10送3, Base為10,Ert為3)
   * @property {number} [bonusErt]
   * @property {number} [transferBase] 轉贈股(eg.10轉3, Base為10,Ert為3)
   * @property {number} [transferErt]
   * @property {number} [allotBase] 配股(eg.10送2, 配股價為6.3元, Base為10, Ert為2, Price為6.3)
   * @property {number} [allotErt]
   * @property {number} [allotPrice]
   * @property {number} [addBase] 增發股(eg.10送2, 增發股價為6.3元, Base為10, Ert為2, Price為6.3)
   * @property {number} [addErt]
   * @property {number} [addPrice]
   * @property {number} [dividend] 現金分紅(eg.每10股派現0.5元,則該字段值為0.05)
   * @property {number} [spDividend] 特別股息(eg.每10股派特別股息0.5元,則該字段值為0.05)
   */
  /**
   * Qot_RequestRehab.proto - 3105獲取復權信息
   * @async
   * @param {Security[]} securityList 股票列表
   * @returns {Rehab[]} securityRehabList 多支股票的復權信息
   */
  qotGetRehab(securityList) { // 3105獲取復權信息
    return this.socket.send('Qot_RequestRehab', {
      securityList,
    });
  }

  /**
   * TradeDate
   *
   * @typedef TradeDate
   * @property {string} time 時間字符串
   */
  /**
   * Qot_GetTradeDate.proto - 3200獲取市場交易日
   * @async
   * @param {QotMarket} market  Qot_Common.QotMarket,股票市場
   * @param {string} beginTime 開始時間字符串 2018-01-01 00:00:00
   * @param {string} endTime 結束時間字符串 2018-02-01 00:00:00
   * @return {TradeDate[]} tradeDateList 交易日
   */
  async qotGetTradeDate(market = 1, beginTime, endTime) { // 3200獲取市場交易日
    return (await this.socket.send('Qot_GetTradeDate', {
      market,
      beginTime,
      endTime,
    })).tradeDateList || [];
  }
  /**
   * Qot_GetStaticInfo.proto - 3202獲取股票靜態信息
   * @async
   * @param {QotMarket} market Qot_Common.QotMarket,股票市場
   * @param {SecurityType} secType Qot_Common.SecurityType,股票類型
   * @returns {SecurityStaticInfo[]} 靜態信息數組
   */
  async qotGetStaticInfo(market = 1, secType) { // 3202獲取股票靜態信息
    return (await this.socket.send('Qot_GetStaticInfo', {
      market,
      secType,
    })).staticInfoList || [];
  }
  /**
   * 正股類型額外數據
   * @typedef EquitySnapshotExData
   * @property {number} issuedShares 發行股本,即總股本
   * @property {number} issuedMarketVal 總市值 =總股本*當前價格
   * @property {number} netAsset 資產淨值
   * @property {number} netProfit 盈利（虧損）
   * @property {number} earningsPershare 每股盈利
   * @property {number} outstandingShares 流通股本
   * @property {number} outstandingMarketVal 流通市值 =流通股本*當前價格
   * @property {number} netAssetPershare 每股淨資產
   * @property {number} eyRate 收益率
   * @property {number} peRate 市盈率
   * @property {number} pbRate 市淨率
   */
  /**
   * 渦輪類型額外數據
   * @typedef WarrantSnapshotExData
   * @property {number} conversionRate 換股比率
   * @property {WarrantType} warrantType Qot_Common.WarrantType,渦輪類型
   * @property {number} strikePrice 行使價
   * @property {string} maturityTime 到期日時間字符串
   * @property {string} endTradeTime 最後交易日時間字符串
   * @property {Security} owner 所屬正股
   * @property {number} recoveryPrice 回收價
   * @property {number} streetVolumn 街貨量
   * @property {number} issueVolumn 發行量
   * @property {number} streetRate 街貨佔比
   * @property {number} delta 對沖值
   * @property {number} impliedVolatility 引申波幅
   * @property {number} premium 溢價
   */
  /**
   * 基本快照數據
   * @typedef SnapshotBasicData
   * @property {Security} security 股票
   * @property {SecurityType} type Qot_Common.SecurityType,股票類型
   * @property {boolean} isSuspend 是否停牌
   * @property {string} listTime 上市時間字符串
   * @property {number} lotSize 每手數量
   * @property {number} priceSpread 價差
   * @property {string} updateTime 更新時間字符串
   * @property {number} highPrice 最新價
   * @property {number} openPrice 開盤價
   * @property {number} lowPrice 最低價
   * @property {number} lastClosePrice 昨收價
   * @property {number} curPrice 最新價
   * @property {number} volume 成交量
   * @property {number} turnover 成交額
   * @property {number} turnoverRate 換手率
   */
  /**
   * 快照
   * @typedef Snapshot
   * @property {SnapshotBasicData} basic 快照基本數據
   * @property {EquitySnapshotExData} [equityExData] 正股快照額外數據
   * @property {WarrantSnapshotExData} [warrantExData] 窩輪快照額外數據
   */
  /**
   * Qot_GetSecuritySnapshot.proto - 3203獲取股票快照
   *
    股票結構參考 Security
    限頻接口：30秒內最多10次
    最多可傳入200只股票
   * @async
   * @param {Security[]} securityList 股票列表
   * @returns {Snapshot[]} snapshotList 股票快照
   */
  async qotGetSecuritySnapShot(securityList) { // 3203獲取股票快照
    const list = [].concat(securityList);
    let snapshotList = [];
    while (list.length) {
      const res = await this.limitExecTimes(
        30 * 1000, 20, // TODO: depends on which class the user is
        async () => {
          const data = await this.socket.send('Qot_GetSecuritySnapshot', {
            securityList: list.splice(-200),
          });
          return data.snapshotList;
        },
      );
      snapshotList = snapshotList.concat(res);
    }
    return snapshotList;
  }
  /**
   * 限制接口調用頻率
   * @param {Number} interval  限頻間隔
   * @param {Number} times   次數
   * @param {Function} fn  要執行的函數
   */
  async limitExecTimes(interval, times, fn) {
    const now = Date.now();
    const name = `${fn.toString()}_exec_time_array`;
    const execArray = this[name] || [];
    while (execArray[0] && now - execArray[0] > interval) {
      execArray.shift();
    }
    if (execArray.length > times) {
      await sleep(interval - (now - execArray[0]));
    }
    execArray.push(Date.now());
    this[name] = execArray;
    return fn();
  }
  /**
   * PlateInfo
   * @typedef PlateInfo
   * @property {Security} plate 板塊
   * @property {string} name 板塊名字
   */
  /**
   * Qot_GetPlateSet.proto - 3204獲取板塊集合下的板塊
   * @async
   * @param {QotMarket} market Qot_Common.QotMarket,股票市場
   * @param {PlateSetType} plateSetType Qot_Common.PlateSetType,板塊集合的類型
   * @returns {PlateInfo[]}  板塊集合下的板塊信息
   */
  async qotGetPlateSet(market = 1, plateSetType) { // 3204獲取板塊集合下的板塊
    return (await this.socket.send('Qot_GetPlateSet', {
      market,
      plateSetType,
    })).plateInfoList || [];
  }
  /**
   * Qot_GetPlateSecurity.proto - 3205獲取板塊下的股票
   * @async
   * @param {Security} plate 板塊
   * @returns {SecurityStaticInfo[]}  板塊下的股票靜態信息
   */
  async qotGetPlateSecurity(plate) { // 3205獲取板塊下的股票
    return (await this.socket.send('Qot_GetPlateSecurity', {
      plate,
    })).staticInfoList || [];
  }
  /**
  * 股票類型
  *
    ReferenceType_Unknow = 0;
    ReferenceType_Warrant = 1; //正股相關的窩輪
  * @typedef {number} ReferenceType
  */
  /**
   * Qot_GetReference.proto - 3206 獲取正股相關股票
   * @async
   * @param {security} security 股票
   * @param {ReferenceType} [referenceType] 相關類型，默認為1，獲取正股相關的渦輪
   */
  async qotGetReference(security, referenceType = 1) {
    return (await this.socket.send('Qot_GetReference', {
      security,
      referenceType,
    })).staticInfoList || [];
  }
  /**
   * Trd_GetAccList.proto - 2001獲取交易賬戶列表
   * @async
   * @returns {TrdAcc[]} 交易業務賬戶列表
   */
  async trdGetAccList() { // 2001獲取交易賬戶列表
    const {
      accList,
    } = (await this.socket.send('Trd_GetAccList', {
      userID: this.userID,
    }));
    return accList.filter(acc => acc.trdMarketAuthList.includes(this.market) && acc.trdEnv === this.env);
  }
  /**
   * Trd_UnlockTrade.proto - 2005解鎖或鎖定交易
   *
    除2001協議外，所有交易協議請求都需要FutuOpenD先解鎖交易
    密碼MD5方式獲取請參考 FutuOpenD配置 內的login_pwd_md5字段
    解鎖或鎖定交易針對與FutuOpenD，只要有一個連接解鎖，其他連接都可以調用交易接口
    強烈建議有實盤交易的用戶使用加密通道，參考 加密通信流程
    限頻接口：30秒內最多10次
   * @param {boolean} [unlock=true] true解鎖交易，false鎖定交易，默認true
   * @param {string} [pwdMD5] 交易密碼的MD5轉16進制(全小寫)，解鎖交易必須要填密碼，鎖定交易不需要驗證密碼，可不填
   * @async
   */
  trdUnlockTrade(unlock = true, pwdMD5 = '') { // 2005解鎖或鎖定交易
    if (pwdMD5) this.pwdMD5 = pwdMD5;
    return this.socket.send('Trd_UnlockTrade', {
      unlock,
      pwdMD5: pwdMD5 || this.pwdMD5,
    });
  }
  /**
   * Trd_SubAccPush.proto - 2008訂閱接收交易賬戶的推送數據
   * @async
   * @param {number[]} accIDList 要接收推送數據的業務賬號列表，全量非增量，即使用者請每次傳需要接收推送數據的所有業務賬號
   */
  async trdSubAccPush(accIDList) { // 2008訂閱接收交易賬戶的推送數據
    return this.socket.send('Trd_SubAccPush', {
      accIDList,
    });
  }
  /**
   * 設置交易模塊的公共header，調用交易相關接口前必須先調用此接口。
   * @param {TrdEnv} trdEnv 交易環境, 參見TrdEnv的枚舉定義。0為仿真，1為真實，默認為1。
   * @param {number} accID 業務賬號, 業務賬號與交易環境、市場權限需要匹配，否則會返回錯誤，默認為當前userID
   * @param {TrdMarket} [trdMarket=1] 交易市場, 參見TrdMarket的枚舉定義，默認為1，即香港市場。
   */
  setCommonTradeHeader(trdEnv = 1, accID, trdMarket = 1) { // 設置交易模塊的公共header，調用交易相關接口前必須先調用此接口。
    this.market = trdMarket;
    this.trdHeader = {
      trdEnv,
      accID,
      trdMarket,
    };
  }
  /**
   * Trd_GetFunds.proto - 2101獲取賬戶資金，需要先設置交易模塊公共header
   * @returns {Funds}
   */
  async trdGetFunds() { // 2101獲取賬戶資金
    if (!this.trdHeader) throw new Error('請先調用setCommonTradeHeader接口設置交易公共header');
    return (await this.socket.send('Trd_GetFunds', {
      header: this.trdHeader,
    })).funds;
  }
  /**
   * Trd_GetPositionList.proto - 2102獲取持倉列表
   * @async
   * @param {TrdFilterConditions} filterConditions 過濾條件
   * @param {number} filterPLRatioMin 過濾盈虧比例下限，高於此比例的會返回，如0.1，返回盈虧比例大於10%的持倉
   * @param {number} filterPLRatioMax 過濾盈虧比例上限，低於此比例的會返回，如0.2，返回盈虧比例小於20%的持倉
   * @returns {Position[]} 持倉列表數組
   */
  async trdGetPositionList(filterConditions, filterPLRatioMin, filterPLRatioMax) { // 2102獲取持倉列表
    if (!this.trdHeader) throw new Error('請先調用setCommonTradeHeader接口設置交易公共header');
    return (await this.socket.send('Trd_GetPositionList', {
      header: this.trdHeader, // 交易公共參數頭
      filterConditions, // 過濾條件
      filterPLRatioMin, // 過濾盈虧比例下限，高於此比例的會返回，如0.1，返回盈虧比例大於10%的持倉
      filterPLRatioMax, // 過濾盈虧比例上限，低於此比例的會返回，如0.2，返回盈虧比例小於20%的持倉
    })).positionList || [];
  }
  /**
   * Trd_GetMaxTrdQtys.proto - 2111獲取最大交易數量
   * @param {object} params
   * @param {TrdHeader} [params.header] 交易公共參數頭，默認不用填寫
   * @param {OrderType} params.orderType 訂單類型, 參見Trd_Common.OrderType的枚舉定義
   * @param {string} params.code 代碼
   * @param {number} [params.price] 價格，3位精度(A股2位)
   * @param {number} params.orderID 訂單號，新下訂單不需要，如果是修改訂單就需要把原訂單號帶上才行，因為改單的最大買賣數量會包含原訂單數量。
   * 以下為調整價格使用，目前僅對港、A股有效，因為港股有價位，A股2位精度，美股不需要
   * @param {boolean} [params.adjustPrice] 是否調整價格，如果價格不合法，是否調整到合法價位，true調整，false不調整
   * @param {number} [params.adjustSideAndLimit] 調整方向和調整幅度百分比限制，正數代表向上調整，負數代表向下調整，具體值代表調整幅度限制，如：0.015代表向上調整且幅度不超過1.5%；-0.01代表向下調整且幅度不超過1%
   * @returns {MaxTrdQtys} 最大交易數量結構體
   */
  async trdGetMaxTrdQtys(params) {
    if (!this.trdHeader) throw new Error('請先調用setCommonTradeHeader接口設置交易公共header');
    return (await this.socket.send('Trd_GetMaxTrdQtys', Object.assign({
      header: this.trdHeader, // 交易公共參數頭
      orderType: 1, // 訂單類型, 參見Trd_Common.OrderType的枚舉定義
      code: '', // 代碼
      price: 0, // 價格，3位精度(A股2位)
      // orderID: 0, // 訂單號，新下訂單不需要，如果是修改訂單就需要把原訂單號帶上才行，因為改單的最大買賣數量會包含原訂單數量。
      // 以下為調整價格使用，目前僅對港、A股有效，因為港股有價位，A股2位精度，美股不需要
      adjustPrice: false, // 是否調整價格，如果價格不合法，是否調整到合法價位，true調整，false不調整
      adjustSideAndLimit: 0, // 調整方向和調整幅度百分比限制，正數代表向上調整，負數代表向下調整，具體值代表調整幅度限制，如：0.015代表向上調整且幅度不超過1.5%；-0.01代表向下調整且幅度不超過1%
    }, params))).maxTrdQtys;
  }
  /**
   * Trd_GetOrderList.proto - 2201獲取訂單列表
   * @async
   * @param {TrdFilterConditions} filterConditions 過濾條件
   * @param {OrderStatus[]} filterStatusList 需要過濾的訂單狀態列表
   * @returns {Order[]} 訂單列表
   */
  async trdGetOrderList(filterConditions, filterStatusList) { // 2201獲取訂單列表
    if (!this.trdHeader) throw new Error('請先調用setCommonTradeHeader接口設置交易公共header');
    return (await this.socket.send('Trd_GetOrderList', {
      header: this.trdHeader, // 交易公共參數頭
      filterConditions,
      filterStatusList,
    })).orderList || [];
  }
  /**
   * Trd_PlaceOrder.proto - 2202下單
   *
    請求包標識結構參考 PacketID
    交易公共參數頭結構參考 TrdHeader
    交易方向枚舉參考 TrdSide
    訂單類型枚舉參考 OrderType
    限頻接口：30秒內最多30次
   * @async
   * @param {object} params
   * @param {PacketID} [params.packetID] 交易寫操作防重放攻擊，默認不用填寫
   * @param {TrdHeader} [params.header] 交易公共參數頭，默認不用填寫
   * @param {TrdSide} params.trdSide 交易方向, 參見Trd_Common.TrdSide的枚舉定義
   * @param {OrderType} params.orderType 訂單類型, 參見Trd_Common.OrderType的枚舉定義
   * @param {string} params.code 代碼
   * @param {number} params.qty 數量，2位精度，期權單位是"張"
   * @param {number} [params.price] 價格，3位精度(A股2位)
   * 以下為調整價格使用，目前僅對港、A股有效，因為港股有價位，A股2位精度，美股不需要
   * @param {boolean} [params.adjustPrice] 是否調整價格，如果價格不合法，是否調整到合法價位，true調整，false不調整
   * @param {number} [params.adjustSideAndLimit] 調整方向和調整幅度百分比限制，正數代表向上調整，負數代表向下調整，具體值代表調整幅度限制，如：0.015代表向上調整且幅度不超過1.5%；-0.01代表向下調整且幅度不超過1%
   * @returns {number} orderID 訂單號
   */
  async trdPlaceOrder(params) { // 2202下單
    if (!this.trdHeader) throw new Error('請先調用setCommonTradeHeader接口設置交易公共header');
    return (await this.socket.send('Trd_PlaceOrder', Object.assign({
      packetID: {
        connID: this.connID,
        serialNo: this.socket.requestId,
      }, // 交易寫操作防重放攻擊
      header: this.trdHeader, // 交易公共參數頭
      trdSide: 0, // 交易方向，1買入，2賣出
      orderType: 1, // 訂單類型, 參見Trd_Common.OrderType的枚舉定義
      code: '', // 代碼
      qty: 0, // 數量，2位精度，期權單位是"張"
      price: 0, // 價格，3位精度(A股2位)
      // 以下為調整價格使用，目前僅對港、A股有效，因為港股有價位，A股2位精度，美股不需要
      adjustPrice: false, // 是否調整價格，如果價格不合法，是否調整到合法價位，true調整，false不調整
      adjustSideAndLimit: 0, // 調整方向和調整幅度百分比限制，正數代表向上調整，負數代表向下調整，具體值代表調整幅度限制，如：0.015代表向上調整且幅度不超過1.5%；-0.01代表向下調整且幅度不超過1%
    }, params))).orderID;
  }
  /**
   * 2202市價下單，直到成功為止，返回買入/賣出的總價格
   *
   * @async
   * @param {object} param
   * @param {TrdSide} params.trdSide 交易方向, 參見Trd_Common.TrdSide的枚舉定義
   * @param {string} params.code 代碼
   * @param {number} params.qty 數量，2位精度，期權單位是"張"
   * @returns {number} 賣出/買入總價
   */
  async trdPlaceOrderMarket(param) { // 市價買入賣出
    const { trdSide, code, qty } = param; // trdSide 1買入2賣出
    let remainQty = qty;
    let value = 0;
    while (remainQty > 0) {
      let orderID = null;
      let order = null;
      const orderBooks = await this.qotGetOrderBook({ market: this.market, code });// 獲取盤口
      const price = trdSide === 1 ? orderBooks.sellList[0].price : orderBooks.buyList[0].price;
      if (orderID && order.orderStatus === 10) {
        await this.trdModifyOrder({// 修改訂單並設置訂單為有效
          modifyOrderOp: 4, orderID, price, qty: remainQty,
        });
      } else if (!orderID) {
        orderID = await this.trdPlaceOrder({
          trdSide, code, qty: remainQty, price,
        }); // 下單
      }
      // eslint-disable-next-line
      while (true) {
        // 確認了不傳入過濾條件會返回所有訂單
        const list = await this.trdGetOrderList({}, []);
        // eslint-disable-next-line
        order = list.filter(item => item.orderID === orderID);
        if (order) {
          if (order.orderStatus > 11) {
            order = null;
            orderID = null;
            break;
          } else if (order.orderStatus < 10) {
            await sleep(50);
          } else if (order.fillQty > 0) {
            remainQty -= order.fillQty;
            value += order.price * order.fillQty;
            if (remainQty > 0 && order.orderStatus === 10) { // 部分成交，先設置為失效
              await this.trdModifyOrder({ modifyOrderOp: 3, orderID }); // 失效
            }
          }
        } else {
          await sleep(60);
        }
      }
    }
    return value;
  }
  /**
   * Trd_ModifyOrder.proto - 2205修改訂單(改價、改量、改狀態等)
   *
    請求包標識結構參考 PacketID
    交易公共參數頭結構參考 TrdHeader
    修改操作枚舉參考 ModifyOrderOp
    限頻接口：30秒內最多30次
   * @async
   * @param {object} params
   * @param {PacketID} [params.packetID] 交易寫操作防重放攻擊，默認不用填寫
   * @param {TrdHeader} [params.header] 交易公共參數頭，默認不用填寫
   * @param {number} params.orderID 訂單號，forAll為true時，傳0
   * @param {ModifyOrderOp} params.modifyOrderOp 修改操作類型，參見Trd_Common.ModifyOrderOp的枚舉定義
   * @param {boolean} [params.forAll] 是否對此業務賬戶的全部訂單操作，true是，false否(對單個訂單)，無此字段代表false，僅對單個訂單
   * 下面的字段僅在modifyOrderOp為ModifyOrderOp_Normal有效
   * @param {number} [params.qty] 數量，2位精度，期權單位是"張"
   * @param {number} [params.price] 價格，3位精度(A股2位)
   * 以下為調整價格使用，目前僅對港、A股有效，因為港股有價位，A股2位精度，美股不需要
   * @param {boolean} [params.adjustPrice] 是否調整價格，如果價格不合法，是否調整到合法價位，true調整，false不調整
   * @param {number} [params.adjustSideAndLimit] 調整方向和調整幅度百分比限制，正數代表向上調整，負數代表向下調整，具體值代表調整幅度限制，如：0.015代表向上調整且幅度不超過1.5%；-0.01代表向下調整且幅度不超過1%
   * @returns {number} orderID 訂單號
   */
  async trdModifyOrder(params) { // 2205修改訂單(改價、改量、改狀態等)
    if (!this.trdHeader) throw new Error('請先調用setCommonTradeHeader接口設置交易公共header');
    return (await this.socket.send('Trd_ModifyOrder', Object.assign({
      packetID: {
        connID: this.connID,
        serialNo: this.socket.requestId,
      }, // 交易寫操作防重放攻擊
      header: this.trdHeader, // 交易公共參數頭
      orderID: 0, // 訂單號，forAll為true時，傳0
      modifyOrderOp: 1, // //修改操作類型，參見Trd_Common.ModifyOrderOp的枚舉定義
      forAll: false, // /是否對此業務賬戶的全部訂單操作，true是，false否(對單個訂單)，無此字段代表false，僅對單個訂單
      qty: 0, // 數量，2位精度，期權單位是"張"
      price: 0, // 價格，3位精度(A股2位)
      // 以下為調整價格使用，目前僅對港、A股有效，因為港股有價位，A股2位精度，美股不需要
      adjustPrice: false, // 是否調整價格，如果價格不合法，是否調整到合法價位，true調整，false不調整
      adjustSideAndLimit: 0, // 調整方向和調整幅度百分比限制，正數代表向上調整，負數代表向下調整，具體值代表調整幅度限制，如：0.015代表向上調整且幅度不超過1.5%；-0.01代表向下調整且幅度不超過1%
    }, params))).orderID;
  }
  /**
   * 注冊訂單更新通知
   * Trd_UpdateOrder.proto - 2208推送訂單更新
   * @async
   * @param {function} callback 回調
   * @returns {Order} 訂單結構
   */
  async subTrdUpdateOrder(callback) { // 注冊訂單更新通知
    return this.socket.subNotify(2208, data => callback(data.order));
  }
  /**
  * 取消注冊訂單更新通知
  * Trd_UpdateOrder.proto - 2208推送訂單更新
  * @async
  */
  async unsubTrdUpdateOrder() { // 取消注冊訂單更新通知
    return this.socket.unsubNotify(2208);
  }
  /**
   * Trd_GetOrderFillList.proto - 2211獲取成交列表
   * @async
   * @param {TrdFilterConditions} filterConditions 過濾條件
   * @returns {OrderFill[]} 成交列表
   */
  async trdGetOrderFillList(filterConditions) { // 2211獲取成交列表
    if (!this.trdHeader) throw new Error('請先調用setCommonTradeHeader接口設置交易公共header');
    return (await this.socket.send('Trd_GetOrderFillList', {
      header: this.trdHeader, // 交易公共參數頭
      filterConditions,
    })).orderFillList || [];
  }
  /**
   * 注冊新成交通知
   * Trd_UpdateOrderFill.proto - 2218推送新成交
   * @param {function} callback 回調
   * @returns {OrderFill} 成交結構
   */
  async subTrdUpdateOrderFill(callback) { // 注冊新成交通知
    return this.socket.subNotify(2218, data => callback(data.orderFill || []));
  }
  /**
   * Trd_GetHistoryOrderList.proto - 2221獲取歷史訂單列表
   *
    交易公共參數頭結構參考 TrdHeader
    訂單結構參考 Order
    過濾條件結構參考 TrdFilterConditions
    訂單狀態枚舉參考 OrderStatus
    限頻接口：30秒內最多10次
   * @async
   * @param {TrdFilterConditions} filterConditions 過濾條件
   * @param {OrderStatus} filterStatusList OrderStatus, 需要過濾的訂單狀態列表
   * @returns {Order[]} 歷史訂單列表
   */
  async trdGetHistoryOrderList(filterConditions, filterStatusList) { // 2221獲取歷史訂單列表
    if (!this.trdHeader) throw new Error('請先調用setCommonTradeHeader接口設置交易公共header');
    return (await this.socket.send('Trd_GetHistoryOrderList', {
      header: this.trdHeader, // 交易公共參數頭
      filterConditions,
      filterStatusList,
    })).orderList || [];
  }
  /**
   * Trd_GetHistoryOrderFillList.proto - 2222獲取歷史成交列表
   *
    交易公共參數頭結構參考 TrdHeader
    成交結構參考 OrderFill
    過濾條件結構參考 TrdFilterConditions
    限頻接口：30秒內最多10次
   * @async
   * @param {TrdFilterConditions} filterConditions 過濾條件
   * @returns {OrderFill[]} 歷史成交列表
   */
  async trdGetHistoryOrderFillList(filterConditions) { // 2222獲取歷史成交列表
    if (!this.trdHeader) throw new Error('請先調用setCommonTradeHeader接口設置交易公共header');
    return (await this.socket.send('Trd_GetHistoryOrderFillList', {
      header: this.trdHeader, // 交易公共參數頭
      filterConditions,
    })).orderFillList || [];
  }
}

module.exports = FutuQuant;