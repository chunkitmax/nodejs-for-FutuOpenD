module.exports = {
  InitConnect: 1001, // 初始化連接
  GetGlobalState: 1002, // 獲取全局狀態
  Notify: 1003, // 通知推送
  KeepAlive: 1004, // 通知推送

  Trd_GetAccList: 2001, // 獲取業務賬戶列表
  Trd_UnlockTrade: 2005, // 解鎖或鎖定交易
  Trd_SubAccPush: 2008, // 訂閱業務賬戶的交易推送數據

  Trd_GetFunds: 2101, // 獲取賬戶資金
  Trd_GetPositionList: 2102, // 獲取賬戶持倉

  Trd_GetOrderList: 2201, // 獲取訂單列表
  Trd_PlaceOrder: 2202, // 下單
  Trd_ModifyOrder: 2205, // 修改訂單
  Trd_UpdateOrder: 2208, // 訂單狀態變動通知(推送)

  Trd_GetOrderFillList: 2211, // 獲取成交列表
  Trd_UpdateOrderFill: 2218, // 成交通知(推送)

  Trd_GetHistoryOrderList: 2221, // 獲取歷史訂單列表
  Trd_GetHistoryOrderFillList: 2222, // 獲取歷史成交列表
  Trd_GetMaxTrdQtys: 2111, // 查詢最大買賣數量

  // 訂閱數據
  Qot_Sub: 3001, // 訂閱或者反訂閱
  Qot_RegQotPush: 3002, // 注冊推送
  Qot_GetSubInfo: 3003, // 獲取訂閱信息
  Qot_GetBasicQot: 3004, // 獲取股票基本行情
  Qot_UpdateBasicQot: 3005, // 推送股票基本行情
  Qot_GetKL: 3006, // 獲取K線
  Qot_UpdateKL: 3007, // 推送K線
  Qot_GetRT: 3008, // 獲取分時
  Qot_UpdateRT: 3009, // 推送分時
  Qot_GetTicker: 3010, // 獲取逐筆
  Qot_UpdateTicker: 3011, // 推送逐筆
  Qot_GetOrderBook: 3012, // 獲取買賣盤
  Qot_UpdateOrderBook: 3013, // 推送買賣盤
  Qot_GetBroker: 3014, // 獲取經紀隊列
  Qot_UpdateBroker: 3015, // 推送經紀隊列

  // 歷史數據
  // Qot_GetHistoryKL: 3100, // 獲取歷史K線
  // Qot_GetHistoryKLPoints: 3101, // 獲取多只股票歷史單點K線
  // Qot_GetRehab: 3102, // 獲取復權信息
  Qot_RequestHistoryKL: 3103, // 獲取歷史K線
  Qot_RequestRehab: 3105, // 獲取復權信息

  // 其他行情數據
  Qot_GetTradeDate: 3200, // 獲取市場交易日
  Qot_GetSuspend: 3201, // 獲取股票停牌信息
  Qot_GetStaticInfo: 3202, // 獲取股票列表
  Qot_GetSecuritySnapshot: 3203, // 獲取股票快照
  Qot_GetPlateSet: 3204, // 獲取板塊集合下的板塊
  Qot_GetPlateSecurity: 3205, // 獲取板塊下的股票
  Qot_GetReference: 3206, // 獲取正股相關股票，暫時只有窩輪
};
