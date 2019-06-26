const net = require('net');
const protobufjs = require('protobufjs');
const hexSha1 = require('hex-sha1');
const ProtoId = require('./protoid');
const Pb = require('./pb.json');


const ProtoName = {};
Object.keys(ProtoId).forEach((key) => {
  ProtoName[ProtoId[key]] = key;
});

let id = 1;

/**
 * Socket模塊
 */

class Socket {
  /**
   * Creates an instance of Socket.
   * @param {string} ip OpenD服務Ip
   * @param {number} port OpenD服務端口
   * @param {object} logger 日志對象
   */
  constructor(ip, port, logger) {
    /**
     * OpenD服務IP
     * @type {string}
     */
    this.ip = ip;
    /**
     * OpenD服務端口
     * @type {number}
     */
    this.port = port;
    /**
     * 日志對象
     * @type {object}
     */
    this.logger = logger;

    id += 1;
    /**
     * socket id，自增，用於區分多個socket。
     * @type {number}
     */
    this.id = id;
    /**
     * socket名稱，用於區分多個socket。
     * @type {string}
     */
    this.name = `Socket(${this.id})`;
    /**
     * socket是否已經連接
     * @type {boolean}
     */
    this.isConnect = false;
    /**
     * 請求序列號，自增
     * @type {number}
     */
    this.requestId = 1000; // 請求序列號，自增

    this.isHandStop = false;

    this.root = protobufjs.Root.fromJSON(Pb);

    this.cacheResponseCallback = {}; // 緩存的回調函數
    this.cacheNotifyCallback = {}; // 緩存的通知回調函數
    this.header = null; // 緩存接收的數據包頭
    this.recvBuffer = Buffer.allocUnsafe(0); // 緩存接收的數據

    this.socket = new net.Socket();
    this.socket.setKeepAlive(true);
    this.socket.on('error', (data) => {
      this.logger.error(`${this.name} on error: ${data}`);
      this.socket.destroy();
      this.isConnect = false;
    });
    this.socket.on('timeout', (e) => {
      this.logger.error(`${this.name} on timeout.`, e);
      this.socket.destroy();
      this.isConnect = false;
    });
    // 為客戶端添加「close」事件處理函數
    this.socket.on('close', () => {
      if (this.isHandStop) return;
      const errMsg = `${this.name} on closed and retry connect on 5 seconds.`;
      this.logger.error(errMsg);
      this.isConnect = false;
      // 5s後重連
      if (this.timerRecontent) return;
      this.timerRecontent = setTimeout(() => {
        this.init();
      }, 5000);
    });
    // 接收數據
    this.socket.on('data', (data) => {
      this.recvBuffer = Buffer.concat([this.recvBuffer, data]);
      this.parseData();
    });
  }
  async init() {
    if (this.isConnect) return;
    await this.connect();
  }
  /**
   * 立即建立連接
   */
  async connect() {
    this.isHandStop = false;
    return new Promise((resolve) => {
      if (this.timerRecontent) {
        clearTimeout(this.timerRecontent);
        this.timerRecontent = null;
      }
      this.socket.connect({
        port: this.port,
        host: this.ip,
        timeout: 1000 * 30,
      }, async () => {
        this.logger.debug(`${this.name} connect success:${this.ip}:${this.port}`);
        this.isConnect = true;
        if (typeof this.connectCallback === 'function') this.connectCallback();
        resolve();
      });
    });
  }
  async close() {
    this.socket.end();
    this.socket.destroy();
    this.isHandStop = true;
    this.logger.info('手動關閉 socket 。');
  }
  /**
   * 設置連接成功的回調函數
   *
   * @param {function} cb
   * @memberof Socket
   */
  onConnect(cb) {
    this.connectCallback = cb;
  }
  /**
   * 注冊協議的通知
   *
   * @param {number} protoId 協議id
   * @param {function} callback 回調函數
   */
  subNotify(protoId, callback) {
    this.cacheNotifyCallback[protoId] = callback;
  }
  /**
   * 刪除一個通知
   * @param {number} protoId 協議id
   */
  unsubNotify(protoId) {
    if (this.cacheNotifyCallback[protoId]) {
      delete this.cacheNotifyCallback[protoId];
    }
  }
  /**
   * 發送數據
   *
   * @async
   * @param {string} protoName 協議名稱
   * @param {object} message 要發送的數據
   */
  send(protoName, message) {
    if (!this.isConnect) return this.logger.warn(`${this.name} 尚未連接，無法發送請求。`);
    const protoId = ProtoId[protoName];
    if (!protoId) return this.logger.warn(`找不到對應的協議Id:${protoName}`);
    // 請求序列號，自增
    if (this.requestId > 1000000) this.requestId = 1000;
    const { requestId } = this;
    this.requestId += 1;

    const request = this.root[protoName].Request;
    const response = this.root[protoName].Response;

    // 處理請求數據
    const reqBuffer = request.encode(request.create({
      c2s: message,
    })).finish();
    const sha1 = hexSha1(reqBuffer);
    const sha1Buffer = new Uint8Array(20).map((item, index) => Number(`0x${sha1.substr(index * 2, 2)}`));
    this.logger.debug(`request:${protoName}(${protoId}),reqId:${requestId}`);
    // 處理包頭
    const buffer = Buffer.concat([
      Buffer.from('FT'), // 包頭起始標志，固定為「FT」
      Buffer.from(new Uint32Array([protoId]).buffer), // 協議ID
      Buffer.from(new Uint8Array([0]).buffer), // 協議格式類型，0為Protobuf格式，1為Json格式
      Buffer.from(new Uint8Array([0]).buffer), // 協議版本，用於迭代兼容, 目前填0
      Buffer.from(new Uint32Array([requestId]).buffer), // 包序列號，用於對應請求包和回包, 要求遞增
      Buffer.from(new Uint32Array([reqBuffer.length]).buffer), // 包體長度
      Buffer.from(sha1Buffer.buffer), // 包體原始數據(解密後)的SHA1哈希值
      Buffer.from(new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0]).buffer), // 保留8字節擴展
      reqBuffer,
    ]);
    // 發送請求，處理回調
    this.socket.write(buffer);
    return new Promise((resolve, reject) => {
      this.cacheResponseCallback[requestId] = (responseBuffer) => {
        const result = response.decode(responseBuffer).toJSON();
        if (result.retType === 0) return resolve(result.s2c);
        const errMsg = `服務器返回結果失敗,request:${protoName}(${protoId}),retType:${result.retType},reqId:${requestId},errMsg:${result.retMsg}`;
        this.logger.error(errMsg);
        return reject(new Error(errMsg));
      };
    });
  }
  /**
   * 解析包體數據
   */
  parseData() {
    const headerLen = 44; // 包頭長度
    let bodyBuffer = null; // 包體buffer
    let bodyLen = 0; // 包體長度
    let reqId = null; // 請求序列號
    let protoId = null; // 請求協議Id
    let bodySha1 = null; // 包體sha1
    // 先處理包頭
    if (!this.header && this.recvBuffer.length >= headerLen) {
      let recvSha1 = new Array(21).join('0').split('').map((item, index) => {
        let str = this.recvBuffer.readUInt8(16 + index).toString(16);
        if (str.length === 1) str = `0${str}`;
        return str;
      });
      recvSha1 = recvSha1.join('');
      this.header = {
        // 包頭起始標志，固定為「FT」
        szHeaderFlag: String.fromCharCode(this.recvBuffer.readUInt8(0)) + String.fromCharCode(this.recvBuffer.readUInt8(1)),
        nProtoID: this.recvBuffer.readUInt32LE(2), // 協議ID
        nProtoFmtType: this.recvBuffer.readUInt8(6), // 協議格式類型，0為Protobuf格式，1為Json格式
        nProtoVer: this.recvBuffer.readUInt8(7), // 協議版本，用於迭代兼容
        nSerialNo: this.recvBuffer.readUInt32LE(8), // 包序列號
        nBodyLen: this.recvBuffer.readUInt32LE(12), // 包體長度
        arrBodySHA1: recvSha1, // 包體原數據(解密後)的SHA1哈希值
        arrReserved: this.recvBuffer.slice(36, 44), // 保留8字節擴展
      };
      if (this.header.szHeaderFlag !== 'FT') throw new Error('接收的包頭數據格式錯誤');
      this.logger.debug(`response:${ProtoName[this.header.nProtoID]}(${this.header.nProtoID}),reqId:${this.header.nSerialNo},bodyLen:${bodyLen}`);
    }

    // 已經接收指定包體長度的全部數據，切割包體buffer
    if (this.header && this.recvBuffer.length >= this.header.nBodyLen + headerLen) {
      reqId = this.header.nSerialNo;
      protoId = this.header.nProtoID;
      bodyLen = this.header.nBodyLen;
      bodySha1 = this.header.arrBodySHA1;
      this.header = null;

      bodyBuffer = this.recvBuffer.slice(44, bodyLen + headerLen);
      this.recvBuffer = this.recvBuffer.slice(bodyLen + headerLen);

      const sha1 = hexSha1(bodyBuffer);
      if (sha1 !== bodySha1) {
        throw new Error(`接收的包體sha1加密錯誤：${bodySha1},本地sha1：${sha1}`);
      }
      // 交給回調處理包體數據
      if (this.cacheResponseCallback[reqId]) {
        this.cacheResponseCallback[reqId](bodyBuffer);
        delete this.cacheResponseCallback[reqId];
      }
      // 通知模塊
      if (this.cacheNotifyCallback[protoId]) {
        try {
          // 加載proto協議文件
          const protoName = ProtoName[protoId];
          const response = this.root[protoName].Response;
          const result = response.decode(bodyBuffer).toJSON();
          this.cacheNotifyCallback[protoId](result.s2c);
        } catch (e) {
          const errMsg = `通知回調執行錯誤，response:${ProtoName[protoId]}(${protoId}),reqId:${reqId},bodyLen:${bodyLen}，堆棧：${e.stack}`;
          this.logger.error(errMsg);
          throw new Error(errMsg);
        }
      }
      if (this.recvBuffer.length > headerLen) this.parseData();
    }
  }
}
module.exports = Socket;
