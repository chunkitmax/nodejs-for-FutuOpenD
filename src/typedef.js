// Common
/**
 * 協議返回值
 *
    RetType 定義協議請求返回值
    請求失敗情況，除網絡超時外，其它具體原因參見各協議定義的retMsg字段

    RetType_Succeed = 0; //成功
    RetType_Failed = -1; //失敗
    RetType_TimeOut = -100; //超時
    RetType_Unknown = -400; //未知結果
 * @typedef {number} RetType
 */
/**
 * 請求包標識，包的唯一標識，用於回放攻擊的識別和保護
 *
    PacketID 用於唯一標識一次請求
    serailNO 由請求方自定義填入包頭，為防回放攻擊要求自增，否則新的請求將被忽略
 * @typedef {object} PacketID
 * @property {number} connID 當前TCP連接的連接ID，一條連接的唯一標識，InitConnect協議會返回
 * @property {number} serialNo 包頭中的包自增序列號
 */
// Qot_Common
/**
 * 行情市場
 *
    QotMarket定義一支證券所屬的行情市場分類
    QotMarket_HK_Future 港股期貨，目前僅支持 999010(恆指當月期貨)、999011(恆指下月期貨)
    QotMarket_US_Option 美股期權，牛牛客戶端可以查看行情，API 後續支持

    QotMarket_Unknown = 0; //未知市場
    QotMarket_HK_Security = 1; //港股
    QotMarket_HK_Future = 2; //港期貨(目前是恆指的當月、下月期貨行情)
    QotMarket_US_Security = 11; //美股
    QotMarket_US_Option = 12; //美期權,暫時不支持期權
    QotMarket_CNSH_Security = 21; //滬股
    QotMarket_CNSZ_Security = 22; //深股
 *
 * @typedef {number} QotMarket
 */
/**
 * 股票類型
 *
    SecurityType_Unknown = 0; //未知
    SecurityType_Bond = 1; //債券
    SecurityType_Bwrt = 2; //一攬子權證
    SecurityType_Eqty = 3; //正股
    SecurityType_Trust = 4; //信托,基金
    SecurityType_Warrant = 5; //渦輪
    SecurityType_Index = 6; //指數
    SecurityType_Plate = 7; //板塊
    SecurityType_Drvt = 8; //期權
    SecurityType_PlateSet = 9; //板塊集
 * @typedef {number} SecurityType
 */
/**
 * 板塊集合的類型
 *
    Qot_GetPlateSet 請求參數類型

    PlateSetType_All = 0; //所有板塊
    PlateSetType_Industry = 1; //行業板塊
    PlateSetType_Region = 2; //地域板塊,港美股市場的地域分類數據暫為空
    PlateSetType_Concept = 3; //概念板塊
 * @typedef {number} PlateSetType
 */
/**
 * 窩輪子類型
 *
    WarrantType_Unknown = 0; //未知
    WarrantType_Buy = 1; //認購
    WarrantType_Sell = 2; //認沽
    WarrantType_Bull = 3; //牛
    WarrantType_Bear = 4; //熊
 * @typedef {number} WarrantType
 */
/**
 * 行情市場狀態
 *
    QotMarketState_None = 0; // 無交易,美股未開盤
    QotMarketState_Auction = 1; // 競價
    QotMarketState_WaitingOpen = 2; // 早盤前等待開盤
    QotMarketState_Morning = 3; // 早盤
    QotMarketState_Rest = 4; // 午間休市
    QotMarketState_Afternoon = 5; // 午盤
    QotMarketState_Closed = 6; // 收盤
    QotMarketState_PreMarketBegin = 8; // 盤前
    QotMarketState_PreMarketEnd = 9; // 盤前結束
    QotMarketState_AfterHoursBegin = 10; // 盤後
    QotMarketState_AfterHoursEnd = 11; // 盤後結束
    QotMarketState_NightOpen = 13; // 夜市開盤
    QotMarketState_NightEnd = 14; // 夜市收盤
    QotMarketState_FutureDayOpen = 15; // 期指日市開盤
    QotMarketState_FutureDayBreak = 16; // 期指日市休市
    QotMarketState_FutureDayClose = 17; // 期指日市收盤
    QotMarketState_FutureDayWaitForOpen = 18; // 期指日市等待開盤
    QotMarketState_HkCas = 19; // 盤後競價,港股市場增加CAS機制對應的市場狀態
 * @typedef {number} QotMarketState
 */
/**
 * 復權類型
 *
    RehabType_None = 0; //不復權
    RehabType_Forward = 1; //前復權
    RehabType_Backward = 2; //後復權
 * @typedef {number} RehabType
 */
/**
 * K線類型，枚舉值兼容舊協議定義，新類型季K,年K,3分K暫時沒有支持歷史K線
 *
    KLType_Unknown = 0; //未知
    KLType_1Min = 1; //1分K
    KLType_Day = 2; //日K
    KLType_Week = 3; //周K
    KLType_Month = 4; //月K
    KLType_Year = 5; //年K
    KLType_5Min = 6; //5分K
    KLType_15Min = 7; //15分K
    KLType_30Min = 8; //30分K
    KLType_60Min = 9; //60分K
    KLType_3Min = 10; //3分K
    KLType_Quarter = 11; //季K
 * @typedef {number} KLType
 */
/**
 * 指定返回K線結構體特定某幾項數據，KLFields枚舉值或組合，如果未指定返回全部字段
 *
    KLFields_None = 0; //
    KLFields_High = 1; //最高價
    KLFields_Open = 2; //開盤價
    KLFields_Low = 4; //最低價
    KLFields_Close = 8; //收盤價
    KLFields_LastClose = 16; //昨收價
    KLFields_Volume = 32; //成交量
    KLFields_Turnover = 64; //成交額
    KLFields_TurnoverRate = 128; //換手率
    KLFields_PE = 256; //市盈率
    KLFields_ChangeRate = 512; //漲跌幅
 * @typedef {number} KLFields
 */
/**
 * 行情定閱類型，訂閱類型，枚舉值兼容舊協議定義
 *
    SubType_None = 0;
    SubType_Basic = 1; //基礎報價
    SubType_OrderBook = 2; //擺盤
    SubType_Ticker = 4; //逐筆
    SubType_RT = 5; //分時
    SubType_KL_Day = 6; //日K
    SubType_KL_5Min = 7; //5分K
    SubType_KL_15Min = 8; //15分K
    SubType_KL_30Min = 9; //30分K
    SubType_KL_60Min = 10; //60分K
    SubType_KL_1Min = 11; //1分K
    SubType_KL_Week = 12; //周K
    SubType_KL_Month = 13; //月K
    SubType_Broker = 14; //經紀隊列
    SubType_KL_Qurater = 15; //季K
    SubType_KL_Year = 16; //年K
    SubType_KL_3Min = 17; //3分K
 * @typedef {number} SubType
 */
/**
 * 逐筆方向
 *
    TickerDirection_Unknown = 0; //未知
    TickerDirection_Bid = 1; //外盤
    TickerDirection_Ask = 2; //內盤
    TickerDirection_Neutral = 3; //中性盤
 * @typedef {number} TickerDirection
 */
/**
 * 股票，兩個字段確定一支股票
 * @typedef {object} Security
 * @property {QotMarket} market QotMarket,股票市場
 * @property {string} code 股票代碼
 */
/**
 * K線數據點
 * @typedef {object} KLine
 * @property {string} time 時間戳字符串
 * @property {boolean} isBlank 是否是空內容的點,若為ture則只有時間信息
 * @property {number} [highPrice] 最高價
 * @property {number} [openPrice] 開盤價
 * @property {number} [lowPrice] 最低價
 * @property {number} [closePrice] 收盤價
 * @property {number} [lastClosePrice] 昨收價
 * @property {number} [volume] 成交量
 * @property {number} [turnover] 成交額
 * @property {number} [turnoverRate] 換手率
 * @property {number} [pe] 市盈率
 * @property {number} [changeRate] 漲跌幅
 */
/**
 * 基礎報價
 * @typedef {object} BasicQot
 * @property {security} security 股票
 * @property {boolean} isSuspended 是否停牌
 * @property {string} listTime 上市日期字符串
 * @property {number} priceSpread 價差
 * @property {string} updateTime 更新時間字符串
 * @property {number} highPrice 最高價
 * @property {number} openPrice 開盤價
 * @property {number} lowPrice 最低價
 * @property {number} curPrice 最新價
 * @property {number} lastClosePrice 昨收價
 * @property {number} volume 成交量
 * @property {number} turnover 成交額
 * @property {number} turnoverRate 換手率
 * @property {number} amplitude 振幅
 */
/**
 * 分時數據點
 * @typedef {object} TimeShare
 * @property {string} time 時間字符串
 * @property {number} minute 距離0點過了多少分鐘
 * @property {boolean} isBlank 是否是空內容的點,若為ture則只有時間信息
 * @property {number} [price] 當前價
 * @property {number} [lastClosePrice] 昨收價
 * @property {number} [avgPrice] 均價
 * @property {number} [volume] 成交量
 * @property {number} [turnover] 成交額
 */
/**
 * 證券基本靜態信息
 * @typedef {object} SecurityStaticBasic
 * @property {security} security 股票
 * @property {number} id 股票ID
 * @property {number} lotSize 每手數量
 * @property {SecurityType} secType Qot_Common.SecurityType,股票類型
 * @property {string} name 股票名字
 * @property {string} listTime 上市時間字符串
 */
/**
 * 窩輪額外股票靜態信息
 * @typedef {object} WarrantStaticExData
 * @property {WarrantType} type Qot_Common.WarrantType,渦輪類型
 * @property {Security} owner 所屬正股
 */
/**
 * 證券靜態信息
 * @typedef {object} SecurityStaticInfo
 * @property {SecurityStaticBasic} basic 基本股票靜態信息
 * @property {WarrantStaticExData} [warrantExData] 窩輪額外股票靜態信息
 */
/**
 * 買賣經紀擺盤
 * @typedef {object} Broker
 * @property {number} id 經紀ID
 * @property {string} name 經紀名稱
 * @property {number} pos 經紀檔位
 */
/**
 * 逐筆成交
 * @typedef {object} Ticker
 * @property {string} time 時間字符串
 * @property {number} sequence 唯一標識
 * @property {TickerDirection} dir TickerDirection, 買賣方向
 * @property {number} price 價格
 * @property {number} volume 成交量
 * @property {number} turnover 成交額
 * @property {number} [recvTime] 收到推送數據的本地時間戳，用於定位延遲
 */
/**
 * 買賣十檔擺盤
 * @typedef {object} OrderBook
 * @property {number} price 委托價格
 * @property {number} volume 委托數量
 * @property {number} orederCount 委托訂單個數
 */
/**
 * 單個定閱類型信息
 * @typedef {object} SubInfo
 * @property {SubType} subType Qot_Common.SubType,訂閱類型
 * @property {Security[]} securityList 訂閱該類型行情的股票
 */
/**
 * 單條連接定閱信息
 *
    一條連接重復定閱其它連接已經訂閱過的，不會額外消耗訂閱額度
 * @typedef ConnSubInfo
 * @property {SubInfo[]} subInfoList 該連接訂閱信息
 * @property {number} usedQuota 該連接已經使用的訂閱額度
 * @property {boolean} isOwnConnData 用於區分是否是自己連接的數據
 */
// Trd_Common
/**
 * 交易環境
 *
    TrdEnv_Simulate = 0; //仿真環境(模擬環境)
    TrdEnv_Real = 1; //真實環境
 * @typedef {number} TrdEnv
 */
/**
 * 交易市場，是大的市場，不是具體品種
 *
    TrdMarket_Unknown = 0; //未知市場
    TrdMarket_HK = 1; //香港市場
    TrdMarket_US = 2; //美國市場
    TrdMarket_CN = 3; //大陸市場
    TrdMarket_HKCC = 4; //香港A股通市場
 * @typedef {number} TrdMarket
 */
/**
 * 交易方向，客戶端下單只傳Buy或Sell即可，SellShort是服務器返回有此方向，BuyBack目前不存在，但也不排除服務器會傳
 *
    TrdSide_Unknown = 0; //未知方向
    TrdSide_Buy = 1; //買入
    TrdSide_Sell = 2; //賣出
    TrdSide_SellShort = 3; //賣空
    TrdSide_BuyBack = 4; //買回
 * @typedef {number} TrdSide
 */
/**
 * 訂單類型
 *
    OrderType_Unknown = 0; //未知類型
    OrderType_Normal = 1; //普通訂單(港股的增強限價單、A股的限價委托、美股的限價單)
    OrderType_Market = 2; //市價訂單(目前僅美股)
    OrderType_AbsoluteLimit = 5; //絕對限價訂單(目前僅港股)，只有價格完全匹配才成交，比如你下價格為5元的買單，賣單價格必須也要是5元才能成交，低於5元也不能成交。賣出同理
    OrderType_Auction = 6; //競價訂單(目前僅港股)，A股的早盤競價訂單類型不變還是OrderType_Normal
    OrderType_AuctionLimit = 7; //競價限價訂單(目前僅港股)
    OrderType_SpecialLimit = 8; //特別限價訂單(目前僅港股)，成交規則同OrderType_AbsoluteLimit，且如果當前沒有對手可成交，不能立即成交，交易所自動撤銷訂單
 * @typedef {number} OrderType
 */
/**
 * 訂單狀態
 *
    OrderStatus_Unsubmitted = 0; //未提交
    OrderStatus_Unknown = -1; //未知狀態
    OrderStatus_WaitingSubmit = 1; //等待提交
    OrderStatus_Submitting = 2; //提交中
    OrderStatus_SubmitFailed = 3; //提交失敗，下單失敗
    OrderStatus_TimeOut = 4; //處理超時，結果未知
    OrderStatus_Submitted = 5; //已提交，等待成交
    OrderStatus_Filled_Part = 10; //部分成交
    OrderStatus_Filled_All = 11; //全部已成
    OrderStatus_Cancelling_Part = 12; //正在撤單_部分(部分已成交，正在撤銷剩余部分)
    OrderStatus_Cancelling_All = 13; //正在撤單_全部
    OrderStatus_Cancelled_Part = 14; //部分成交，剩余部分已撤單
    OrderStatus_Cancelled_All = 15; //全部已撤單，無成交
    OrderStatus_Failed = 21; //下單失敗，服務拒絕
    OrderStatus_Disabled = 22; //已失效
    OrderStatus_Deleted = 23; //已刪除，無成交的訂單才能刪除
 * @typedef {number} OrderStatus
 */
/**
 * 持倉方向類型
 *
    PositionSide_Long = 0; //多倉，默認情況是多倉
    PositionSide_Unknown = -1; //未知方向
    PositionSide_Short = 1; //空倉
 * @typedef {number} PositionSide
 */
/**
 * 修改訂單的操作類型，港股支持全部操作，美股目前僅支持ModifyOrderOp_Normal和ModifyOrderOp_Cancel
 *
    ModifyOrderOp_Unknown = 0; //未知操作
    ModifyOrderOp_Normal = 1; //修改訂單的價格、數量等，即以前的改單
    ModifyOrderOp_Cancel = 2; //撤單
    ModifyOrderOp_Disable = 3; //失效
    ModifyOrderOp_Enable = 4; //生效
    ModifyOrderOp_Delete = 5; //刪除
 * @typedef {number} ModifyOrderOp
 */
/**
 * 需要再次確認訂單的原因枚舉
 *
    ReconfirmOrderReason_Unknown = 0; //未知原因
    ReconfirmOrderReason_QtyTooLarge = 1; //訂單數量太大，確認繼續下單並否拆分成多個小訂單
    ReconfirmOrderReason_PriceAbnormal = 2; //價格異常，偏離當前價太大，確認繼續下單
 * @typedef {number} ReconfirmOrderReason
 */
/**
 * 交易協議公共參數頭
 * @typedef {object} TrdHeader
 * @property {TrdEnv} trdEnv 交易環境, 參見TrdEnv的枚舉定義
 * @property {number} accID 業務賬號, 業務賬號與交易環境、市場權限需要匹配，否則會返回錯誤
 * @property {TrdMarket} trdMarket 交易市場, 參見TrdMarket的枚舉定義
 */
/**
 * 交易業務賬戶結構
 * @typedef {object} TrdAcc
 * @property {TrdEnv} trdEnv 交易環境, 參見TrdEnv的枚舉定義
 * @property {number} accID 業務賬號, 業務賬號與交易環境、市場權限需要匹配，否則會返回錯誤
 * @property {TrdMarket} trdMarketAuthList 業務賬戶支持的交易市場權限，即此賬戶能交易那些市場, 可擁有多個交易市場權限，目前僅單個，取值參見TrdMarket的枚舉定義
 */
/**
 * 賬戶資金結構
 * @typedef {object} Funds
 * @property {number} power 購買力，3位精度(A股2位)，下同
 * @property {number} totalAssets 資產淨值
 * @property {number} cash 現金
 * @property {number} marketVal 證券市值
 * @property {number} frozenCash 凍結金額
 * @property {number} debtCash 欠款金額
 * @property {number} avlWithdrawalCash 可提金額
 */
/**
 * 賬戶持倉結構
 * @typedef {object} Position
 * @property {number} positionID 持倉ID，一條持倉的唯一標識
 * @property {PositionSide} positionSide 持倉方向，參見PositionSide的枚舉定義
 * @property {string} code 代碼
 * @property {string} name 名稱
 * @property {number} qty 持有數量，2位精度，期權單位是"張"，下同
 * @property {number} canSellQty 可賣數量
 * @property {number} price 市價，3位精度(A股2位)
 * @property {number} [costPrice] 成本價，無精度限制，如果沒傳，代表此時此值無效
 * @property {number} val 市值，3位精度(A股2位)
 * @property {number} plVal 盈虧金額，3位精度(A股2位)
 * @property {number} [plRatio] 盈虧比例，無精度限制，如果沒傳，代表此時此值無效
 * @property {number} [td_plVal] 今日盈虧金額，3位精度(A股2位)，下同
 * @property {number} [td_trdVal] 今日交易額
 * @property {number} [td_buyVal] 今日買入總額
 * @property {number} [td_buyQty] 今日買入總量
 * @property {number} [td_sellVal] 今日賣出總額
 * @property {number} [td_sellQty] 今日賣出總量
 */
/**
 * 訂單結構
 * @typedef {object} Order
 * @property {TrdSide} trdSide 交易方向, 參見TrdSide的枚舉定義
 * @property {OrderType} orderType 訂單類型, 參見OrderType的枚舉定義
 * @property {OrderStatus} orderStatus 訂單狀態, 參見OrderStatus的枚舉定義
 * @property {number} orderID 訂單號
 * @property {string} orderIDEx 擴展訂單號
 * @property {string} code 代碼
 * @property {string} name 名稱
 * @property {number} qty 訂單數量，2位精度，期權單位是"張"
 * @property {number} [price] 訂單價格，3位精度(A股2位)
 * @property {string} createTime 創建時間，嚴格按YYYY-MM-DD HH:MM:SS或YYYY-MM-DD HH:MM:SS.MS格式傳
 * @property {string} updateTime 最後更新時間，嚴格按YYYY-MM-DD HH:MM:SS或YYYY-MM-DD HH:MM:SS.MS格式傳
 * @property {number} [fillQty] 成交數量，2位精度，期權單位是"張"
 * @property {number} [fillAvgPrice] 成交均價，無精度限制
 * @property {string} [lastErrMsg] 最後的錯誤描述，如果有錯誤，會有此描述最後一次錯誤的原因，無錯誤為空
 */
/**
 * 成交結構
 * @typedef {object} OrderFill
 * @property {number} trdSide 交易方向, 參見TrdSide的枚舉定義
 * @property {number} fillID 成交號
 * @property {string} fillIDEx 擴展成交號
 * @property {number} [orderID] 訂單號
 * @property {string} [orderIDEx] 擴展訂單號
 * @property {string} code 代碼
 * @property {string} name 名稱
 * @property {number} qty 訂單數量，2位精度，期權單位是"張"
 * @property {number} price 訂單價格，3位精度(A股2位)
 * @property {string} createTime 創建時間（成交時間），嚴格按YYYY-MM-DD HH:MM:SS或YYYY-MM-DD HH:MM:SS.MS格式傳
 * @property {number} [counterBrokerID] 對手經紀號，港股有效
 * @property {string} [counterBrokerName] 對手經紀名稱，港股有效
 */
/**
 * 最大交易數量
 * @description 因目前服務器實現的問題，賣空需要先賣掉持倉才能再賣空，是分開兩步賣的，買回來同樣是逆向兩步；而看多的買是可以現金加融資一起一步買的，請注意這個差異
 * @typedef {object} MaxTrdQtys
 * @property {number} maxCashBuy 不使用融資，僅自己的現金最大可買整手股數
 * @property {number} [maxCashAndMarginBuy] 使用融資，自己的現金 + 融資資金總共的最大可買整手股數
 * @property {number} maxPositionSell 不使用融券(賣空)，僅自己的持倉最大可賣整手股數
 * @property {number} [maxSellShort] 使用融券(賣空)，最大可賣空整手股數，不包括多倉
 * @property {number} [maxBuyBack] 賣空後，需要買回的最大整手股數。因為賣空後，必須先買回已賣空的股數，還掉股票，才能再繼續買多。
 */
/**
 * 過濾條件，條件組合是"與"不是"或"，用於獲取訂單、成交、持倉等時二次過濾
 * @typedef {object} TrdFilterConditions
 * @property {string[]} codeList 代碼過濾，只返回包含這些代碼的數據，沒傳不過濾
 * @property {number[]} idList ID主鍵過濾，只返回包含這些ID的數據，沒傳不過濾，訂單是orderID、成交是fillID、持倉是positionID
 * @property {string} [beginTime] 開始時間，嚴格按YYYY-MM-DD HH:MM:SS或YYYY-MM-DD HH:MM:SS.MS格式傳，對持倉無效，拉歷史數據必須填
 * @property {string} [endTime] 結束時間，嚴格按YYYY-MM-DD HH:MM:SS或YYYY-MM-DD HH:MM:SS.MS格式傳，對持倉無效，拉歷史數據必須填
 */
