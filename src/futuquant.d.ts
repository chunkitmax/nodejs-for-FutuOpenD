import Logger from 'bunyan'

// /**
//  * regex: " ?\* \@param \{(.+)\} [^\.]+\.([^\] ]+)\]? (.+)"
//  * 
//  * replace: "/** $3 */\n\t$2: $1"
//  */

/** 交易市場，是大的市場，不是具體品種 */
export const enum TrdMarket {
  /** 未知市場 */
  TrdMarket_Unknown = 0,
  /** 香港市場 */
  TrdMarket_HK = 1,
  /** 美國市場 */
  TrdMarket_US = 2,
  /** 大陸市場 */
  TrdMarket_CN = 3,
  /** 香港A股通市場 */
  TrdMarket_HKCC = 4,
}

/** 交易環境 */
export const enum TrdEnv {
  /** 仿真環境(模擬環境) */
  TrdEnv_Simulate = 0,
  /** 真實環境 */
  TrdEnv_Real = 1,
}

/** 行情市場狀態 */
export const enum QotMarketState {
  /**  無交易,美股未開盤 */
  QotMarketState_None = 0,
  /**  競價 */
  QotMarketState_Auction = 1,
  /**  早盤前等待開盤 */
  QotMarketState_WaitingOpen = 2,
  /**  早盤 */
  QotMarketState_Morning = 3,
  /**  午間休市 */
  QotMarketState_Rest = 4,
  /**  午盤 */
  QotMarketState_Afternoon = 5,
  /**  收盤 */
  QotMarketState_Closed = 6,
  /**  盤前 */
  QotMarketState_PreMarketBegin = 8,
  /**  盤前結束 */
  QotMarketState_PreMarketEnd = 9,
  /**  盤後 */
  QotMarketState_AfterHoursBegin = 10,
  /**  盤後結束 */
  QotMarketState_AfterHoursEnd = 11,
  /**  夜市開盤 */
  QotMarketState_NightOpen = 13,
  /**  夜市收盤 */
  QotMarketState_NightEnd = 14,
  /**  期指日市開盤 */
  QotMarketState_FutureDayOpen = 15,
  /**  期指日市休市 */
  QotMarketState_FutureDayBreak = 16,
  /**  期指日市收盤 */
  QotMarketState_FutureDayClose = 17,
  /**  期指日市等待開盤 */
  QotMarketState_FutureDayWaitForOpen = 18,
  /**  盤後競價,港股市場增加CAS機制對應的市場狀態 */
  QotMarketState_HkCas = 19,
}

/** 行情定閱類型，訂閱類型，枚舉值兼容舊協議定義 */
export const enum SubType {
  SubType_None = 0,
  /** 基礎報價 */
  SubType_Basic = 1,
  /** 擺盤 */
  SubType_OrderBook = 2,
  /** 逐筆 */
  SubType_Ticker = 4,
  /** 分時 */
  SubType_RT = 5,
  /** 日K */
  SubType_KL_Day = 6,
  /** 5分K */
  SubType_KL_5Min = 7,
  /** 15分K */
  SubType_KL_15Min = 8,
  /** 30分K */
  SubType_KL_30Min = 9,
  /** 60分K */
  SubType_KL_60Min = 10,
  /** 1分K */
  SubType_KL_1Min = 11,
  /** 周K */
  SubType_KL_Week = 12,
  /** 月K */
  SubType_KL_Month = 13,
  /** 經紀隊列 */
  SubType_Broker = 14,
  /** 季K */
  SubType_KL_Qurater = 15,
  /** 年K */
  SubType_KL_Year = 16,
  /** 3分K */
  SubType_KL_3Min = 17,
}

/** 
 * QotMarket定義一支證券所屬的行情市場分類
 * 
 * QotMarket_HK_Future 港股期貨，目前僅支持 999010(恆指當月期貨)、999011(恆指下月期貨)
 * 
 * QotMarket_US_Option 美股期權，牛牛客戶端可以查看行情，API 後續支持
 */
export const enum QotMarket {
  /** 未知市場 */
  QotMarket_Unknown = 0,
  /** 港股 */
  QotMarket_HK_Security = 1,
  /** 港期貨(目前是恆指的當月、下月期貨行情) */
  QotMarket_HK_Future = 2,
  /** 美股 */
  QotMarket_US_Security = 11,
  /** 美期權,暫時不支持期權 */
  QotMarket_US_Option = 12,
  /** 滬股 */
  QotMarket_CNSH_Security = 21,
  /** 深股 */
  QotMarket_CNSZ_Security = 22,
}

/** 復權類型 */
export const enum RehabType {
  /** 不復權 */
  RehabType_None = 0,
  /** 前復權 */
  RehabType_Forward = 1,
  /** 後復權 */
  RehabType_Backward = 2,
}

/** K線類型，枚舉值兼容舊協議定義，新類型季K,年K,3分K暫時沒有支持歷史K線 */
export const enum KLType {
  /** 未知 */
  KLType_Unknown = 0,
  /** 1分K */
  KLType_1Min = 1,
  /** 日K */
  KLType_Day = 2,
  /** 周K */
  KLType_Week = 3,
  /** 月K */
  KLType_Month = 4,
  /** 年K */
  KLType_Year = 5,
  /** 5分K */
  KLType_5Min = 6,
  /** 15分K */
  KLType_15Min = 7,
  /** 30分K */
  KLType_30Min = 8,
  /** 60分K */
  KLType_60Min = 9,
  /** 3分K */
  KLType_3Min = 10,
  /** 季K */
  KLType_Quarter = 11,
}

/** 逐筆方向 */
export const enum TickerDirection {
  /** 未知 */
  TickerDirection_Unknown = 0,
  /** 外盤 */
  TickerDirection_Bid = 1,
  /** 內盤 */
  TickerDirection_Ask = 2,
  /** 中性盤 */
  TickerDirection_Neutral = 3,
}

/** 這個時間點返回數據的狀態以及來源 */
export const enum DataStatus {
  /** 空數據 */
  DataStatus_Null = 0,
  /** 當前時間點數據 */
  DataStatus_Current = 1,
  /** 前一個時間點數據 */
  DataStatus_Previous = 2,
  /** 後一個時間點數據 */
  DataStatus_Back = 3,
}

/** 當請求時間點數據為空時，如何返回數據 */
export const enum NoDataMode {
  /** 直接返回空數據 */
  NoDataMode_Null = 0,
  /** 往前取值，返回前一個時間點數據 */
  NoDataMode_Forward = 1,
  /** 向後取值，返回後一個時間點數據 */
  NoDataMode_Backward = 2,
}

/** 指定返回K線結構體特定某幾項數據，KLFields枚舉值或組合，如果未指定返回全部字段 */
export const enum KLFields {
  KLFields_None = 0,
  /** 最高價 */
  KLFields_High = 1,
  /** 開盤價 */
  KLFields_Open = 2,
  /** 最低價 */
  KLFields_Low = 4,
  /** 收盤價 */
  KLFields_Close = 8,
  /** 昨收價 */
  KLFields_LastClose = 16,
  /** 成交量 */
  KLFields_Volume = 32,
  /** 成交額 */
  KLFields_Turnover = 64,
  /** 換手率 */
  KLFields_TurnoverRate = 128,
  /** 市盈率 */
  KLFields_PE = 256,
  /** 漲跌幅 */
  KLFields_ChangeRate = 512,
}

/** 公司行動組合,指定某些字段值是否有效 */
export const enum CompanyAct {
  /** 無 */
  CompanyAct_None = 0,
  /** 拆股 */
  CompanyAct_Split = 1,
  /** 合股 */
  CompanyAct_Join = 2,
  /** 送股 */
  CompanyAct_Bonus = 4,
  /** 轉贈股 */
  CompanyAct_Transfer = 8,
  /** 配股 */
  CompanyAct_Allot = 16,
  /** 增發股 */
  CompanyAct_Add = 32,
  /** 現金分紅 */
  CompanyAct_Dividend = 64,
  /** 特別股息 */
  CompanyAct_SPDividend = 128,
}

/** 股票類型 */
export const enum SecurityType {
  /** 未知 */
  SecurityType_Unknown = 0,
  /** 債券 */
  SecurityType_Bond = 1,
  /** 一攬子權證 */
  SecurityType_Bwrt = 2,
  /** 正股 */
  SecurityType_Eqty = 3,
  /** 信托,基金 */
  SecurityType_Trust = 4,
  /** 渦輪 */
  SecurityType_Warrant = 5,
  /** 指數 */
  SecurityType_Index = 6,
  /** 板塊 */
  SecurityType_Plate = 7,
  /** 期權 */
  SecurityType_Drvt = 8,
  /** 板塊集 */
  SecurityType_PlateSet = 9,
}

/** 窩輪子類型 */
export const enum WarrantType {
  /** 未知 */
  WarrantType_Unknown = 0,
  /** 認購 */
  WarrantType_Buy = 1,
  /** 認沽 */
  WarrantType_Sell = 2,
  /** 牛 */
  WarrantType_Bull = 3,
  /** 熊 */
  WarrantType_Bear = 4,
}

/** 板塊集合的類型 */
export const enum PlateSetType {
  /** 所有板塊 */
  PlateSetType_All = 0,
  /** 行業板塊 */
  PlateSetType_Industry = 1,
  /** 地域板塊,港美股市場的地域分類數據暫為空 */
  PlateSetType_Region = 2,
  /** 概念板塊 */
  PlateSetType_Concept = 3,
}

/** 股票類型 */
export const enum ReferenceType {
  ReferenceType_Unknow = 0,
  /** 正股相關的窩輪 */
  ReferenceType_Warrant = 1,
}

/** 訂單類型 */
export const enum OrderType {
  /** 未知類型 */
  OrderType_Unknown = 0,
  /** 普通訂單(港股的增強限價單、A股的限價委托、美股的限價單) */
  OrderType_Normal = 1,
  /** 市價訂單(目前僅美股) */
  OrderType_Market = 2,
  /** 絕對限價訂單(目前僅港股)，只有價格完全匹配才成交，比如你下價格為5元的買單，賣單價格必須也要是5元才能成交，低於5元也不能成交。賣出同理 */
  OrderType_AbsoluteLimit = 5,
  /** 競價訂單(目前僅港股)，A股的早盤競價訂單類型不變還是OrderType_Normal */
  OrderType_Auction = 6,
  /** 競價限價訂單(目前僅港股) */
  OrderType_AuctionLimit = 7,
  /** 特別限價訂單(目前僅港股)，成交規則同OrderType_AbsoluteLimit，且如果當前沒有對手可成交，不能立即成交，交易所自動撤銷訂單 */
  OrderType_SpecialLimit = 8,
}

/** 訂單狀態 */
export const enum OrderStatus {
  /** 未提交 */
  OrderStatus_Unsubmitted = 0,
  /** 未知狀態 */
  OrderStatus_Unknown = -1,
  /** 等待提交 */
  OrderStatus_WaitingSubmit = 1,
  /** 提交中 */
  OrderStatus_Submitting = 2,
  /** 提交失敗，下單失敗 */
  OrderStatus_SubmitFailed = 3,
  /** 處理超時，結果未知 */
  OrderStatus_TimeOut = 4,
  /** 已提交，等待成交 */
  OrderStatus_Submitted = 5,
  /** 部分成交 */
  OrderStatus_Filled_Part = 10,
  /** 全部已成 */
  OrderStatus_Filled_All = 11,
  /** 正在撤單_部分(部分已成交，正在撤銷剩余部分) */
  OrderStatus_Cancelling_Part = 12,
  /** 正在撤單_全部 */
  OrderStatus_Cancelling_All = 13,
  /** 部分成交，剩余部分已撤單 */
  OrderStatus_Cancelled_Part = 14,
  /** 全部已撤單，無成交 */
  OrderStatus_Cancelled_All = 15,
  /** 下單失敗，服務拒絕 */
  OrderStatus_Failed = 21,
  /** 已失效 */
  OrderStatus_Disabled = 22,
  /** 已刪除，無成交的訂單才能刪除 */
  OrderStatus_Deleted = 23,
}

/** 交易方向
 * 客戶端下單只傳Buy或Sell即可，SellShort是服務器返回有此方向，BuyBack目前不存在，但也不排除服務器會傳
 */
export const enum TrdSide {
  /** 未知方向 */
  TrdSide_Unknown = 0,
  /** 買入 */
  TrdSide_Buy = 1,
  /** 賣出 */
  TrdSide_Sell = 2,
  /** 賣空 */
  TrdSide_SellShort = 3,
  /** 買回 */
  TrdSide_BuyBack = 4,
}

/** 修改訂單的操作類型，港股支持全部操作，美股目前僅支持ModifyOrderOp_Normal和ModifyOrderOp_Cancel */
export const enum ModifyOrderOp {
  /** 未知操作 */
  ModifyOrderOp_Unknown = 0,
  /** 修改訂單的價格、數量等，即以前的改單 */
  ModifyOrderOp_Normal = 1,
  /** 撤單 */
  ModifyOrderOp_Cancel = 2,
  /** 失效 */
  ModifyOrderOp_Disable = 3,
  /** 生效 */
  ModifyOrderOp_Enable = 4,
  /** 刪除 */
  ModifyOrderOp_Delete = 5,
}

/**
 * 
 * 
 * Config
 * 
 */

interface InitConfig {
  /** FutuOpenD服務IP */
  ip: string
  /** FutuOpenD服務端口 */
  port: number
  /** 牛牛號 */
  userID: number
  /** 解鎖交易 md5 */
  pwdMd5: string
  /** 市場環境，默認為港股環境，1港股2美股3大陸市場4香港A股通市場 */
  market?: TrdMarket
  /** 0為仿真環境，1為真實環境，2為回測環境，默認為1 */
  env?: TrdEnv
}

interface InitConnectConfig {
  /** 客戶端版本號，clientVer = "."以前的數 * 100 + "."以後的，舉例：1.1版本的clientVer為1 * 100 + 1 = 101，2.21版本為2 * 100 + 21 = 221 */
  clientVer: number
  /** 客戶端唯一標識，無生具體生成規則，客戶端自己保證唯一性即可 */
  clientID: string
  /** 此連接是否接收市場狀態、交易需要重新解鎖等等事件通知，true代表接收，FutuOpenD就會向此連接推送這些通知，反之false代表不接收不推送 */
  recvNotify: boolean
}

interface Security {
  market: QotMarket
  code: string
}
interface qotSubConfig {
  /** 股票 */
  securityList: Security[]
  /** Qot_Common.SubType,訂閱數據類型 */
  subTypeList: SubType[]
  /** ture表示訂閱,false表示反訂閱 默認true*/
  isSubOrUnSub?: boolean
  /** 是否注冊或反注冊該連接上面行情的推送,該參數不指定不做注冊反注冊操作 默認true*/
  isRegOrUnRegPush?: boolean
  /** Qot_Common.RehabType,復權類型,注冊推送並且是K線類型才生效,其他訂閱類型忽略該參數,注冊K線推送時該參數不指定默認前復權 */
  regPushRehabTypeList: number
  /** 注冊後如果本地已有數據是否首推一次已存在數據,該參數不指定則默認true */
  isFirstPush?: boolean
}

interface qotRegQotPushConfig {
  /** 股票 */
  securityList: Security[]
  /** Qot_Common.SubType,訂閱數據類型 */
  subTypeList: SubType[]
  /** Qot_Common.RehabType,復權類型,注冊K線類型才生效,其他訂閱類型忽略該參數,注冊K線時該參數不指定默認前復權 */
  rehabTypeList: SubType[]
  /** 注冊或取消 默認true*/
  isRegOrUnReg?: boolean
  /** 注冊後如果本地已有數據是否首推一次已存在數據,該參數不指定則默認true */
  isFirstPush?: boolean
}

/** 基礎報價 */
interface BasicQot {
  /** 股票 */
  security: Security
  /** 是否停牌 */
  isSuspended: boolean
  /** 上市日期字符串 */
  listTime: string
  /** 價差 */
  priceSpread: number
  /** 更新時間字符串 */
  updateTime: string
  /** 最高價 */
  highPrice: number
  /** 開盤價 */
  openPrice: number
  /** 最低價 */
  lowPrice: number
  /** 最新價 */
  curPrice: number
  /** 昨收價 */
  lastClosePrice: number
  /** 成交量 */
  volume: number
  /** 成交額 */
  turnover: number
  /** 換手率 */
  turnoverRate: number
  /** 振幅 */
  amplitude: number
}

interface qotGetKLConfig {
  /** Qot_Common.RehabType,復權類型 */
  rehabType: RehabType
  /** Qot_Common.KLType,K線類型 */
  klType: KLType
  /** 股票 */
  security: Security
  /** 請求K線根數 */
  reqNum: number
}
interface KLine {
  /** 時間戳字符串 */
  time: string
  /** 是否是空內容的點,若為ture則只有時間信息 */
  isBlank: boolean
  /** 最高價 */
  highPrice?: number
  /** 開盤價 */
  openPrice?: number
  /** 最低價 */
  lowPrice?: number
  /** 收盤價 */
  closePrice?: number
  /** 昨收價 */
  lastClosePrice?: number
  /** 成交量 */
  volume?: number
  /** 成交額 */
  turnover?: number
  /** 換手率 */
  turnoverRate?: number
  /** 市盈率 */
  pe?: number
  /** 漲跌幅 */
  changeRate?: number
}

interface qotGetHistoryKLConfig {
  /** Qot_Common.RehabType,復權類型 */
  rehabType: RehabType
  /** Qot_Common.KLType,K線類型 */
  klType: KLType
  /** 股票市場以及股票代碼 */
  security: Security
  /** 開始時間字符串 */
  beginTime: string
  /** 結束時間字符串 */
  endTime: string
  /** 最多返回多少根K線，如果未指定表示不限制 */
  maxAckKLNum?: number
  /** 指定返回K線結構體特定某幾項數據，KLFields枚舉值或組合，如果未指定返回全部字段 */
  needKLFieldsFlag?: number
}

interface qotGetHistoryKLPointsConfig {
  /** Qot_Common.RehabType,復權類型 */
  rehabType: RehabType
  /** Qot_Common.KLType,K線類型 */
  klType: KLType
  /** NoDataMode,當請求時間點數據為空時，如何返回數據 */
  noDataMode: NoDataMode
  /** 股票市場以及股票代碼 */
  securityList: Security[]
  /** 時間字符串 */
  timeList: string[]
  /** 最多返回多少只股票的數據，如果未指定表示不限制 */
  maxReqSecurityNum?: number
  /** 指定返回K線結構體特定某幾項數據，KLFields枚舉值或組合，如果未指定返回全部字段 */
  needKLFieldsFlag?: KLFields
}

/** 過濾條件，條件組合是"與"不是"或"，用於獲取訂單、成交、持倉等時二次過濾 */
interface TrdFilterConditions {
  /** 代碼過濾，只返回包含這些代碼的數據，沒傳不過濾 */
  codeList: string[]
  /** ID主鍵過濾，只返回包含這些ID的數據，沒傳不過濾，訂單是orderID、成交是fillID、持倉是positionID */
  idList: number[]
  /** 開始時間，嚴格按YYYY-MM-DD HH:MM:SS或YYYY-MM-DD HH:MM:SS.MS格式傳，對持倉無效，拉歷史數據必須填 */
  beginTime?: string
  /** 結束時間，嚴格按YYYY-MM-DD HH:MM:SS或YYYY-MM-DD HH:MM:SS.MS格式傳，對持倉無效，拉歷史數據必須填 */
  endTime?: string
}

/** 交易協議公共參數頭 */
interface TrdHeader {
  /** 交易環境, 參見TrdEnv的枚舉定義 */
  trdEnv: TrdEnv
  /** 業務賬號, 業務賬號與交易環境、市場權限需要匹配，否則會返回錯誤 */
  accID: number
  /** 交易市場, 參見TrdMarket的枚舉定義 */
  trdMarket: TrdMarket
}
interface trdGetMaxTrdQtysConfig {
  /** 交易公共參數頭，默認不用填寫 */
  header?: TrdHeader
  /** 訂單類型, 參見Trd_Common.OrderType的枚舉定義 */
  orderType: OrderType
  /** 代碼 */
  code: string
  /** 價格，3位精度(A股2位) */
  price?: number
  /** 訂單號，新下訂單不需要，如果是修改訂單就需要把原訂單號帶上才行，因為改單的最大買賣數量會包含原訂單數量。 */
  orderID: number
  
  // 以下為調整價格使用，目前僅對港、A股有效，因為港股有價位，A股2位精度，美股不需要

  /** 是否調整價格，如果價格不合法，是否調整到合法價位，true調整，false不調整 */
  adjustPrice?: boolean
  /** 調整方向和調整幅度百分比限制，正數代表向上調整，負數代表向下調整，具體值代表調整幅度限制，如：0.015代表向上調整且幅度不超過1.5%；-0.01代表向下調整且幅度不超過1% */
  adjustSideAndLimit?: number
}

/**
 * 請求包標識，包的唯一標識，用於回放攻擊的識別和保護
 * 
 * PacketID 用於唯一標識一次請求
 * serailNO 由請求方自定義填入包頭，為防回放攻擊要求自增，否則新的請求將被忽略
 */
interface PacketID {
  /** 當前TCP連接的連接ID，一條連接的唯一標識，InitConnect協議會返回 */
  connID: number
  /** 包頭中的包自增序列號 */
  serialNo: number
}
interface trdPlaceOrderConfig {
  /** 交易寫操作防重放攻擊，默認不用填寫 */
  packetID?: PacketID
  /** 交易公共參數頭，默認不用填寫 */
  header?: TrdHeader
  /** 交易方向, 參見Trd_Common.TrdSide的枚舉定義 */
  trdSide: TrdSide
  /** 訂單類型, 參見Trd_Common.OrderType的枚舉定義 */
  orderType: OrderType
  /** 代碼 */
  code: string
  /** 數量，2位精度，期權單位是"張" */
  qty: number
  /** 價格，3位精度(A股2位) */
  price?: number
  
  // 以下為調整價格使用，目前僅對港、A股有效，因為港股有價位，A股2位精度，美股不需要

  /** 是否調整價格，如果價格不合法，是否調整到合法價位，true調整，false不調整 */
  adjustPrice?: boolean
  /** 調整方向和調整幅度百分比限制，正數代表向上調整，負數代表向下調整，具體值代表調整幅度限制，如：0.015代表向上調整且幅度不超過1.5%；-0.01代表向下調整且幅度不超過1% */
  adjustSideAndLimit?: number
}

interface trdPlaceOrderMarketConfig {
  /** 交易方向, 參見Trd_Common.TrdSide的枚舉定義 */
  trdSide: TrdSide
  /** 代碼 */
  code: string
  /** 數量，2位精度，期權單位是"張" */
  qty: number
}

interface trdModifyOrderConfig {
  /** 交易寫操作防重放攻擊，默認不用填寫 */
  packetID?: PacketID
  /** 交易公共參數頭，默認不用填寫 */
  header?: TrdHeader
  /** 訂單號，forAll為true時，傳0 */
  orderID: number
  /** 修改操作類型，參見Trd_Common.ModifyOrderOp的枚舉定義 */
  modifyOrderOp: ModifyOrderOp
  /** 是否對此業務賬戶的全部訂單操作，true是，false否(對單個訂單)，無此字段代表false，僅對單個訂單 */
  forAll?: boolean
  
  // 下面的字段僅在modifyOrderOp為ModifyOrderOp_Normal有效
   
  /** 數量，2位精度，期權單位是"張" */
  qty?: number
  /** 價格，3位精度(A股2位) */
  price?: number
  
  // 以下為調整價格使用，目前僅對港、A股有效，因為港股有價位，A股2位精度，美股不需要

  /** 是否調整價格，如果價格不合法，是否調整到合法價位，true調整，false不調整 */
  adjustPrice?: boolean
  /** 調整方向和調整幅度百分比限制，正數代表向上調整，負數代表向下調整，具體值代表調整幅度限制，如：0.015代表向上調整且幅度不超過1.5%；-0.01代表向下調整且幅度不超過1% */
  adjustSideAndLimit?: number
}

/**
 * 
 * 
 * Response
 * 
 */

/** 初始化連接，InitConnect.proto協議返回對象 */
interface InitConnectResponse {
  /** FutuOpenD的版本號 */
  serverVer: number
  /** FutuOpenD登陸的牛牛用戶ID */
  loginUserID: number
  /** 此連接的連接ID，連接的唯一標識 */
  connID: number
  /** 此連接後續AES加密通信的Key，固定為16字節長字符串 */
  connAESKey: string
  /** 心跳保活間隔 */
  keepAliveInterval: number
}

/** GetGlobalState.proto協議返回對象 */
interface GetGlobalStateResponse {
    /** Qot_Common.QotMarketState,港股主板市場狀態 */
  marketHK: QotMarketState
  /** Qot_Common.QotMarketState,美股Nasdaq市場狀態 */
  marketUS: QotMarketState
  /** Qot_Common.QotMarketState,滬市狀態 */
  marketSH: QotMarketState
  /** Qot_Common.QotMarketState,深市狀態 */
  marketSZ: QotMarketState
  /** Qot_Common.QotMarketState,港股期貨市場狀態 */
  marketHKFuture: QotMarketState
  /** 是否登陸行情服務器 */
  qotLogined: boolean
  /** 是否登陸交易服務器 */
  trdLogined: boolean
  /** 版本號 */
  serverVer: number
  /** buildNo */
  serverBuildNo: number
  /** 當前格林威治時間 */
  time: number
}

/** 訂閱信息 */
interface ConnSubInfo {
  /** 該連接訂閱信息 */
  subInfoList: {
    /** Qot_Common.SubType,訂閱類型 */
    subType: SubType
    /** 訂閱該類型行情的股票 */
    securityList: Security[]
  }[]
  /** 該連接已經使用的訂閱額度 */
  usedQuota: number
  /** 用於區分是否是自己連接的數據 */
  isOwnConnData: boolean
}
/** Qot_GetSubInfo.proto協議返回對象 */
interface QotGetSubInfoResponse {
  /** 訂閱信息 */
  connSubInfoList: ConnSubInfo[]
  /** FutuOpenD已使用的訂閱額度 */
  totalUsedQuota: number
  /** FutuOpenD剩余訂閱額度 */
  remainQuota: number
}

/** Qot_UpdateKL.proto協議返回對象 */
interface QotUpdateKLResponse {
  /** Qot_Common.RehabType,復權類型 */
  rehabType: RehabType
  /** Qot_Common.KLType,K線類型 */
  klType: KLType
  /** 股票 */
  security: Security
  /** 推送的k線點 */
  klList: KLine[]
}

/** 分時數據點 */
interface TimeShare {
  /** 時間字符串 */
  time: string
  /** 距離0點過了多少分鐘 */
  minute: number
  /** 是否是空內容的點,若為ture則只有時間信息 */
  isBlank: boolean
  /** 當前價 */
  price?: number
  /** 昨收價 */
  lastClosePrice?: number
  /** 均價 */
  avgPrice?: number
  /** 成交量 */
  volume?: number
  /** 成交額 */
  turnover?: number
}

/** 逐筆成交 */
interface Ticker {
  /** 時間字符串 */
  time: string
  /** 唯一標識 */
  sequence: number
  /** 買賣方向 */
  dir: TickerDirection
  /** 價格 */
  price: number
  /** 成交量 */
  volume: number
  /** 成交額 */
  turnover: number
  /** 收到推送數據的本地時間戳，用於定位延遲 */
  recvTime?: number
}

/** Qot_GetTicker.proto協議返回對象 */
interface subQotUpdateTickerResponse {
  /** 股票 */
  security: Security
  /** 逐筆 */
  tickerList: Ticker[]
}

/** 買賣十檔擺盤 */
interface OrderBook {
  /** 委托價格 */
  price: number
  /** 委托數量 */
  volume: number
  /** 委托訂單個數 */
  orederCount: number
}
/** Qot_GetOrderBook.proto協議返回對象 */
interface qotGetOrderBookResponse {
  /** 股票 */
  security: Security
  /** 賣盤 */
  orderBookAskList: OrderBook[]
  /** 賣盤，同orderBookAskList */
  sellList: OrderBook[]
  /** 買盤 */
  orderBookBidList: OrderBook[]
  /** 買盤，同orderBookBidList */
  buyList: OrderBook[]
}

/** 買賣經紀擺盤 */
interface Broker {
  /** 經紀ID */
  id: number
  /** 經紀名稱 */
  name: string
  /** 經紀檔位 */
  pos: number
}
/** Qot_GetBroker.proto協議返回對象 */
interface QotGetBrokerResponse {
  /** 股票 */
  security: Security
  /** 經紀Ask(賣)盤 */
  brokerAskList: Broker[]
  /** 經紀Ask(賣)盤，同brokerAskList */
  sellList: Broker[]
  /** 經紀Bid(買)盤 */
  brokerBidList: Broker[]
  /** 經紀Bid(買)盤，同brokerBidList */
  buyList: Broker[]
}

/** K線數據 */
interface HistoryPointsKL {
  /** DataStatus,數據狀態 */
  status: DataStatus
  /** 請求的時間 */
  reqTime: string
  /** K線數據 */
  kl: KLine
}
/** 多只股票的多點歷史K線點 */
interface SecurityHistoryKLPoints {
  /** 股票 */
  security: Security
  /** K線數據 */
  klList: HistoryPointsKL
}

/** 復權信息 */
interface Rehab {
  /** 時間字符串 */
  time: string
  /** 公司行動組合,指定某些字段值是否有效 */
  companyActFlag: CompanyAct
  /** 前復權因子A */
  fwdFactorA: number
  /** 前復權因子B */
  fwdFactorB: number
  /** 後復權因子A */
  bwdFactorA: number
  /** 後復權因子B */
  bwdFactorB: number
  /** 拆股(eg.1拆5，Base為1，Ert為5) */
  splitBase?: number
  /**  */
  splitErt?: number
  /** 合股(eg.50合1，Base為50，Ert為1) */
  joinBase?: number
  /**  */
  joinErt?: number
  /** 送股(eg.10送3, Base為10,Ert為3) */
  bonusBase?: number
  /**  */
  bonusErt?: number
  /** 轉贈股(eg.10轉3, Base為10,Ert為3) */
  transferBase?: number
  /**  */
  transferErt?: number
  /** 配股(eg.10送2, 配股價為6.3元, Base為10, Ert為2, Price為6.3) */
  allotBase?: number
  /**  */
  allotErt?: number
  /**  */
  allotPrice?: number
  /** 增發股(eg.10送2, 增發股價為6.3元, Base為10, Ert為2, Price為6.3) */
  addBase?: number
  /**  */
  addErt?: number
  /**  */
  addPrice?: number
  /** 現金分紅(eg.每10股派現0.5元,則該字段值為0.05) */
  dividend?: number
  /** 特別股息(eg.每10股派特別股息0.5元,則該字段值為0.05) */
  spDividend?: number
}
/** 股票復權信息 */
interface SecurityRehab {
  /** 股票 */
  security: Security
  /** 復權信息 */
  rehabList: Rehab[]
}

interface TradeDate {
  /** 時間字符串 */
  time: string
}

/** 證券基本靜態信息 */
interface SecurityStaticBasic {
  /** 股票 */
  security: Security
  /** 股票ID */
  id: number
  /** 每手數量 */
  lotSize: number
  /** Qot_Common.SecurityType,股票類型 */
  secType: SecurityType
  /** 股票名字 */
  name: string
  /** 上市時間字符串 */
  listTime: string
}
/** 窩輪額外股票靜態信息 */
interface WarrantStaticExData {
  /** Qot_Common.WarrantType,渦輪類型 */
  type: WarrantType
  /** 所屬正股 */
  owner: Security
}
/** 證券靜態信息 */
interface SecurityStaticInfo {
  /** 基本股票靜態信息 */
  basic: SecurityStaticBasic
  /** 窩輪額外股票靜態信息 */
  warrantExData?: WarrantStaticExData
}

/** 基本快照數據 */
interface SnapshotBasicData {
  /** 股票 */
  security: Security
  /** Qot_Common.SecurityType,股票類型 */
  type: SecurityType
  /** 是否停牌 */
  isSuspend: boolean
  /** 上市時間字符串 */
  listTime: string
  /** 每手數量 */
  lotSize: number
  /** 價差 */
  priceSpread: number
  /** 更新時間字符串 */
  updateTime: string
  /** 最新價 */
  highPrice: number
  /** 開盤價 */
  openPrice: number
  /** 最低價 */
  lowPrice: number
  /** 昨收價 */
  lastClosePrice: number
  /** 最新價 */
  curPrice: number
  /** 成交量 */
  volume: number
  /** 成交額 */
  turnover: number
  /** 換手率 */
  turnoverRate: number
}
/** 正股類型額外數據 */
interface EquitySnapshotExData {
  /** 發行股本,即總股本 */
  issuedShares: number
  /** 總市值 =總股本*當前價格 */
  issuedMarketVal: number
  /** 資產淨值 */
  netAsset: number
  /** 盈利（虧損） */
  netProfit: number
  /** 每股盈利 */
  earningsPershare: number
  /** 流通股本 */
  outstandingShares: number
  /** 流通市值 =流通股本*當前價格 */
  outstandingMarketVal: number
  /** 每股淨資產 */
  netAssetPershare: number
  /** 收益率 */
  eyRate: number
  /** 市盈率 */
  peRate: number
  /** 市淨率 */
  pbRate: number
}
/** 渦輪類型額外數據 */
interface WarrantSnapshotExData {
  /** 換股比率 */
  conversionRate: number
  /** Qot_Common.WarrantType,渦輪類型 */
  warrantType: WarrantType
  /** 行使價 */
  strikePrice: number
  /** 到期日時間字符串 */
  maturityTime: string
  /** 最後交易日時間字符串 */
  endTradeTime: string
  /** 所屬正股 */
  owner: Security
  /** 回收價 */
  recoveryPrice: number
  /** 街貨量 */
  streetVolumn: number
  /** 發行量 */
  issueVolumn: number
  /** 街貨佔比 */
  streetRate: number
  /** 對沖值 */
  delta: number
  /** 引申波幅 */
  impliedVolatility: number
  /** 溢價 */
  premium: number
}
/** 快照 */
interface Snapshot {
  /** 快照基本數據 */
  basic: SnapshotBasicData
  /** 正股快照額外數據 */
  equityExData?: EquitySnapshotExData
  /** 窩輪快照額外數據 */
  warrantExData?: WarrantSnapshotExData
}

interface PlateInfo {
  /** 板塊 */
  plate: Security
  /** 板塊名字 */
  name: string
}

/** 交易業務賬戶結構 */
interface TrdAcc {
  /** 交易環境, 參見TrdEnv的枚舉定義 */
  trdEnv: TrdEnv
  /** 業務賬號, 業務賬號與交易環境、市場權限需要匹配，否則會返回錯誤 */
  accID: number
  /** 業務賬戶支持的交易市場權限，即此賬戶能交易那些市場, 可擁有多個交易市場權限，目前僅單個，取值參見TrdMarket的枚舉定義 */
  trdMarketAuthList: TrdMarket
}

/** 賬戶資金結構 */
interface Funds {
  /** 購買力，3位精度(A股2位)，下同 */
  power: number
  /** 資產淨值 */
  totalAssets: number
  /** 現金 */
  cash: number
  /** 證券市值 */
  marketVal: number
  /** 凍結金額 */
  frozenCash: number
  /** 欠款金額 */
  debtCash: number
  /** 可提金額 */
  avlWithdrawalCash: number
}

/**
 * 最大交易數量
 * 
 * 因目前服務器實現的問題，賣空需要先賣掉持倉才能再賣空，是分開兩步賣的，買回來同樣是逆向兩步；而看多的買是可以現金加融資一起一步買的，請注意這個差異
 */
interface MaxTrdQtys {
  /** 不使用融資，僅自己的現金最大可買整手股數 */
  maxCashBuy: number
  /** 使用融資，自己的現金 + 融資資金總共的最大可買整手股數 */
  maxCashAndMarginBuy?: number
  /** 不使用融券(賣空)，僅自己的持倉最大可賣整手股數 */
  maxPositionSell: number
  /** 使用融券(賣空)，最大可賣空整手股數，不包括多倉 */
  maxSellShort?: number
  /** 賣空後，需要買回的最大整手股數。因為賣空後，必須先買回已賣空的股數，還掉股票，才能再繼續買多。 */
  maxBuyBack?: number
}

/** 訂單結構 */
interface Order {
  /** 交易方向, 參見TrdSide的枚舉定義 */
  trdSide: TrdSide
  /** 訂單類型, 參見OrderType的枚舉定義 */
  orderType: OrderType
  /** 訂單狀態, 參見OrderStatus的枚舉定義 */
  orderStatus: OrderStatus
  /** 訂單號 */
  orderID: number
  /** 擴展訂單號 */
  orderIDEx: string
  /** 代碼 */
  code: string
  /** 名稱 */
  name: string
  /** 訂單數量，2位精度，期權單位是"張" */
  qty: number
  /** 訂單價格，3位精度(A股2位) */
  price?: number
  /** 創建時間，嚴格按YYYY-MM-DD HH:MM:SS或YYYY-MM-DD HH:MM:SS.MS格式傳 */
  createTime: string
  /** 最後更新時間，嚴格按YYYY-MM-DD HH:MM:SS或YYYY-MM-DD HH:MM:SS.MS格式傳 */
  updateTime: string
  /** 成交數量，2位精度，期權單位是"張" */
  fillQty?: number
  /** 成交均價，無精度限制 */
  fillAvgPrice?: number
  /** 最後的錯誤描述，如果有錯誤，會有此描述最後一次錯誤的原因，無錯誤為空 */
  lastErrMsg?: string
}

interface OrderFill {
  /** 交易方向, 參見TrdSide的枚舉定義 */
  trdSide: number
  /** 成交號 */
  fillID: number
  /** 擴展成交號 */
  fillIDEx: string
  /** 訂單號 */
  orderID?: number
  /** 擴展訂單號 */
  orderIDEx?: string
  /** 代碼 */
  code: string
  /** 名稱 */
  name: string
  /** 訂單數量，2位精度，期權單位是"張" */
  qty: number
  /** 訂單價格，3位精度(A股2位) */
  price: number
  /** 創建時間（成交時間），嚴格按YYYY-MM-DD HH:MM:SS或YYYY-MM-DD HH:MM:SS.MS格式傳 */
  createTime: string
  /** 對手經紀號，港股有效 */
  counterBrokerID?: number
  /** 對手經紀名稱，港股有效 */
  counterBrokerName?: string
}

/**
 * 
 * 
 * Main
 * 
 */

export default class FutuQuant {

  /**
   * Creates an instance of FutuQuant.
   */
  constructor(param: InitConfig, logger?: Logger)

  /**
   * 初始化處理
   */
  public init(): Promise<void>

  /**
   * InitConnect.proto - 1001初始化連接
   *
    nodejs版本會根據返回的keepAliveInterval字段自動保持心跳連接，不再需要手動調用ft.keepLive()方法。
    請求其它協議前必須等InitConnect協議先完成
    若FutuOpenD配置了加密， 「connAESKey」將用於後續協議加密
    keepAliveInterval 為建議client發起心跳 KeepAlive 的間隔
   */
  public initConnect(params: InitConnectConfig): Promise<InitConnectResponse>

  /**
   * 斷開連接
   */
  public close(): void

  /**
   * GetGlobalState.proto - 1002獲取全局狀態
   */
  public getGlobalState(): Promise<GetGlobalStateResponse>

  /**
   * KeepAlive.proto - 1004保活心跳
   */
  public keepAlive(): Promise<number>

  /**
   * Qot_Sub.proto - 3001訂閱或者反訂閱
   *
    股票結構參考 Security
    訂閱數據類型參考 SubType
    復權類型參考 RehabType
    為控制定閱產生推送數據流量，股票定閱總量有額度控制，訂閱規則參考 高頻數據接口
    高頻數據接口需要訂閱之後才能使用，注冊推送之後才可以收到數據更新推送
   */
  public qotSub(params: qotSubConfig): Promise<any>

  /**
   * Qot_RegQotPush.proto - 3002注冊行情推送
   *
    股票結構參考 Security
    訂閱數據類型參考 SubType
    復權類型參考 RehabType
    行情需要訂閱成功才能注冊推送
   */
  public qotRegQotPush(params: qotRegQotPushConfig): Promise<any>

  /**
   * Qot_GetSubInfo.proto - 3003獲取訂閱信息
   */
  public qotGetSubInfo(isReqAllConn?: boolean): Promise<QotGetSubInfoResponse>
  
  /**
   * Qot_GetBasicQot.proto - 3004獲取股票基本行情
   *
    股票結構參考 Security
    基本報價結構參考 BasicQot
   */
  public qotGetBasicQot(securityList: Security[]): Promise<BasicQot[]>
  
  /**
   * 注冊股票基本報價通知，需要先調用訂閱接口
   * Qot_UpdateBasicQot.proto - 3005推送股票基本報價
   */
  public subQotUpdateBasicQot(callback: (basicQot: BasicQot[]) => void): void
  
  /**
   * 注冊股票基本報價通知，需要先調用訂閱接口
   * Qot_UpdateBasicQot.proto - 3005推送股票基本報價
   */
  public subQotUpdateBasicQot(callback: (basicQot: BasicQot[]) => void): void

  /**
   * 注冊股票基本報價通知，需要先調用訂閱接口
   * Qot_UpdateBasicQot.proto - 3005推送股票基本報價
   */
  public subQotUpdateBasicQot(callback: (basicQot: BasicQot[]) => void): void

  /**
   * Qot_GetKL.proto - 3006獲取K線
   *
    復權類型參考 RehabType
    K線類型參考 KLType
    股票結構參考 Security
    K線結構參考 KLine
    請求K線目前最多最近1000根
   */
  public qotGetKL(params: qotGetKLConfig): Promise<KLine[]>

  /**
   * 注冊K線推送，需要先調用訂閱接口
   * Qot_UpdateKL.proto - 3007推送K線
   */
  public subQotUpdateKL(callback: (qotUpdateKLRes: QotUpdateKLResponse) => void): void

  /**
   * Qot_GetRT.proto - 3008獲取分時
   */
  public qotGetRT(security: Security): Promise<TimeShare[]>

  /**
   * 注冊分時推送，需要先調用訂閱接口
   * Qot_UpdateRT.proto - 3009推送分時
   */
  public subQotUpdateRT(callback: (timeShareList: TimeShare[]) => void): void

  /**
   * Qot_GetTicker.proto - 3010獲取逐筆
   *
    股票結構參考 Security
    逐筆結構參考 Ticker
    請求逐筆目前最多最近1000個
   */
  public qotGetTicker(security: Security, maxRetNum?: number): Promise<Ticker[]>

  /**
   * 注冊逐筆推送，需要先調用訂閱接口
   * Qot_UpdateTicker.proto - 3011推送逐筆
   */
  public subQotUpdateTicker(callback: (subQotUpdateTickerRes: subQotUpdateTickerResponse) => void): void

  /**
   * Qot_GetOrderBook.proto - 3012獲取買賣盤，需要先調用訂閱接口
   */
  public qotGetOrderBook(security: Security, num?: number): Promise<qotGetOrderBookResponse>

  /**
   * 注冊買賣盤推送，需要先調用訂閱接口
   * Qot_UpdateOrderBook.proto - 3013推送買賣盤
   */
  public subQotUpdateOrderBook(callback: (qotGetOrderBookRes: qotGetOrderBookResponse) => void): void

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
  public qotGetBroker(security: Security): Promise<QotGetBrokerResponse>

  /**
   * 注冊經紀隊列推送，需要先調用訂閱接口
   * Qot_UpdateBroker.proto - 3015推送經紀隊列
   */
  public subQotUpdateBroker(callback: (qotGetBrokerRes: QotGetBrokerResponse) => void): void

  /**
   * Qot_GetHistoryKL.proto - 3100獲取單只股票一段歷史K線
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
  public qotGetHistoryKL(params: qotGetHistoryKLConfig): Promise<KLine[]>

  /**
   * Qot_GetHistoryKLPoints.proto - 3101獲取多只股票多點歷史K線
   *
    復權類型參考 RehabType
    K線類型參考 KLType
    股票結構參考 Security
    K線結構參考 KLine
    K線字段類型參考 KLFields
    目前限制最多5個時間點，股票個數不做限制，但不建議傳入過多股票，查詢耗時過多會導致協議返回超時。
   */
  public qotGetHistoryKLPoints(params: qotGetHistoryKLPointsConfig): Promise<SecurityHistoryKLPoints[]>

  /**
   * Qot_GetRehab.proto - 3102獲取復權信息
   */
  qotGetRehab(securityList: Security[]): Promise<SecurityRehab[]>

  /**
   * Qot_GetTradeDate.proto - 3200獲取市場交易日
   */
  public qotGetTradeDate(market: number, beginTime: string, endTime: string): Promise<TradeDate[]>

  /**
   * Qot_GetStaticInfo.proto - 3202獲取股票靜態信息
   * @async
   * @param {QotMarket} market Qot_Common.QotMarket,股票市場
   * @param {SecurityType} secType Qot_Common.SecurityType,股票類型
   * @returns {SecurityStaticInfo[]} 靜態信息數組
   */
  public qotGetStaticInfo(market: number, secType: SecurityType): Promise<SecurityStaticInfo[]>

  /**
   * Qot_GetSecuritySnapshot.proto - 3203獲取股票快照
   *
    股票結構參考 Security
    限頻接口：30秒內最多10次
    最多可傳入200只股票
   */
  public qotGetSecuritySnapShot(securityList: Security[]): Promise<Snapshot[]>

  /**
   * 限制接口調用頻率
   */
  public limitExecTimes<T>(interval: number, times: number, fn: () => T): Promise<T>

  /**
   * Qot_GetPlateSet.proto - 3204獲取板塊集合下的板塊
   */
  public qotGetPlateSet(market: QotMarket, plateSetType: PlateSetType): Promise<PlateInfo[]>

  /**
   * Qot_GetPlateSecurity.proto - 3205獲取板塊下的股票
   */
  public qotGetPlateSecurity(plate:Security): Promise<SecurityStaticInfo[]>

  /**
   * Qot_GetReference.proto - 3206 獲取正股相關股票
   */
  public qotGetReference(security: Security, referenceType?: ReferenceType): Promise<SecurityStaticInfo[]>

  /**
   * Trd_GetAccList.proto - 2001獲取交易賬戶列表
   */
  public trdGetAccList(): Promise<TrdAcc[]>

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
  public trdUnlockTrade(unlock?: boolean, pwdMD5?: string): Promise<any>

  /**
   * Trd_SubAccPush.proto - 2008訂閱接收交易賬戶的推送數據
   */
  public trdSubAccPush(accIDList: number[]): Promise<any>

  /**
   * 設置交易模塊的公共header，調用交易相關接口前必須先調用此接口。
   */
  public setCommonTradeHeader(trdEnv: TrdEnv, accID: number, trdMarket: TrdMarket): void

  /**
   * Trd_GetFunds.proto - 2101獲取賬戶資金，需要先設置交易模塊公共header
   * @returns {Funds}
   */
  public trdGetFunds(): Promise<Funds>

  /**
   * Trd_GetPositionList.proto - 2102獲取持倉列表
   */
  public trdGetPositionList(filterConditions: TrdFilterConditions, filterPLRatioMin: number, filterPLRatioMax: number): Promise<Position[]>

  /**
   * Trd_GetMaxTrdQtys.proto - 2111獲取最大交易數量
   */
  public trdGetMaxTrdQtys(params:trdGetMaxTrdQtysConfig): Promise<MaxTrdQtys>

  /**
   * Trd_GetOrderList.proto - 2201獲取訂單列表
   */
  public trdGetOrderList(filterConditions: TrdFilterConditions, filterStatusList: OrderStatus[]): Promise<Order[]>

  /**
   * Trd_PlaceOrder.proto - 2202下單
   *
    請求包標識結構參考 PacketID
    交易公共參數頭結構參考 TrdHeader
    交易方向枚舉參考 TrdSide
    訂單類型枚舉參考 OrderType
    限頻接口：30秒內最多30次
   */
  public trdPlaceOrder(params: trdPlaceOrderConfig): Promise<number>

  /**
   * 2202市價下單，直到成功為止，返回買入/賣出的總價格
   */
  public trdPlaceOrderMarket(param: trdPlaceOrderMarketConfig): Promise<number>

  /**
   * Trd_ModifyOrder.proto - 2205修改訂單(改價、改量、改狀態等)
   *
    請求包標識結構參考 PacketID
    交易公共參數頭結構參考 TrdHeader
    修改操作枚舉參考 ModifyOrderOp
    限頻接口：30秒內最多30次
   */
  public trdModifyOrder(params: trdModifyOrderConfig): Promise<number>

  /**
   * 注冊訂單更新通知
   * Trd_UpdateOrder.proto - 2208推送訂單更新
   * @async
   * @param {function} callback 回調
   * @returns {Order} 訂單結構
   */
  public subTrdUpdateOrder(callback: (order: Order) => void): void

  /**
  * 取消注冊訂單更新通知
  * Trd_UpdateOrder.proto - 2208推送訂單更新
  */
 public unsubTrdUpdateOrder(): Promise<void>

  /**
   * Trd_GetOrderFillList.proto - 2211獲取成交列表
   */
  public trdGetOrderFillList(filterConditions: TrdFilterConditions): Promise<OrderFill[]>

  /**
   * 注冊新成交通知
   * Trd_UpdateOrderFill.proto - 2218推送新成交
   * @param {function} callback 回調
   * @returns {OrderFill} 成交結構
   */
  public subTrdUpdateOrderFill(callback: (orderFill: OrderFill) => void): void

  /**
   * Trd_GetHistoryOrderList.proto - 2221獲取歷史訂單列表
   *
    交易公共參數頭結構參考 TrdHeader
    訂單結構參考 Order
    過濾條件結構參考 TrdFilterConditions
    訂單狀態枚舉參考 OrderStatus
    限頻接口：30秒內最多10次
   */
  public trdGetHistoryOrderList(filterConditions: TrdFilterConditions, filterStatusList: OrderStatus): Promise<Order[]>

  /**
   * Trd_GetHistoryOrderFillList.proto - 2222獲取歷史成交列表
   *
    交易公共參數頭結構參考 TrdHeader
    成交結構參考 OrderFill
    過濾條件結構參考 TrdFilterConditions
    限頻接口：30秒內最多10次
   */
  public trdGetHistoryOrderFillList(filterConditions: TrdFilterConditions): Promise<OrderFill[]>
}