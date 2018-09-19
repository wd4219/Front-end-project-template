/*
 * description 用户行为分析js SDK
 * auth:shenhaiyang@myhexin.com
 * modifydate:2017-07-28
 * version:1.0.8
 */
// 'use strict';

(function (cbas) {
  var Fingerprint;
  Fingerprint = function (options) {
    var nativeForEach, nativeMap;
    nativeForEach = Array.prototype.forEach;
    nativeMap = Array.prototype.map;

    this.each = function (obj, iterator, context) {
      if (obj === null) {
        return;
      }
      if (nativeForEach && obj.forEach === nativeForEach) {
        obj.forEach(iterator, context);
      } else if (obj.length === +obj.length) {
        for (var i = 0, l = obj.length; i < l; i++) {
          if (iterator.call(context, obj[i], i, obj) === {}) return;
        }
      } else {
        for (var key in obj) {
          if (obj.hasOwnProperty(key)) {
            if (iterator.call(context, obj[key], key, obj) === {}) return;
          }
        }
      }
    };

    this.map = function (obj, iterator, context) {
      var results = [];
      // Not using strict equality so that this acts as a
      // shortcut to checking for `null` and `undefined`.
      if (obj == null) return results;
      if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
      this.each(obj, function (value, index, list) {
        results[results.length] = iterator.call(context, value, index, list);
      });
      return results;
    };

    if (typeof options == 'object') {
      this.hasher = options.hasher;
      this.screen_resolution = options.screen_resolution;
      this.screen_orientation = options.screen_orientation;
      this.canvas = options.canvas;
      this.ie_activex = options.ie_activex;
    } else if (typeof options == 'function') {
      this.hasher = options;
    }
  };
  Fingerprint.prototype = {
    get: function () {
      var keys = [];
      keys.push(navigator.userAgent);
      keys.push(navigator.language);
      keys.push(screen.colorDepth);
      if (this.screen_resolution) {
        var resolution = this.getScreenResolution();
        if (typeof resolution !== 'undefined') { // headless browsers, such as phantomjs
          keys.push(resolution.join('x'));
        }
      }
      keys.push(new Date().getTimezoneOffset());
      keys.push(this.hasSessionStorage());
      keys.push(this.hasLocalStorage());
      keys.push(this.hasIndexDb());
      //body might not be defined at this point or removed programmatically
      if (document.body) {
        keys.push(typeof (document.body.addBehavior));
      } else {
        keys.push(typeof undefined);
      }
      keys.push(typeof (window.openDatabase));
      keys.push(navigator.cpuClass);
      keys.push(navigator.platform);
      keys.push(navigator.doNotTrack);
      keys.push(this.getPluginsString());
      if (this.canvas && this.isCanvasSupported()) {
        keys.push(this.getCanvasFingerprint());
      }
      if (this.hasher) {
        return this.hasher(keys.join('###'), 31);
      } else {
        return this.murmurhash3_32_gc(keys.join('###'), 31);
      }
    },

    murmurhash3_32_gc: function (key, seed) {
      var remainder, bytes, h1, h1b, c1, c2, k1, i;

      remainder = key.length & 3; // key.length % 4
      bytes = key.length - remainder;
      h1 = seed;
      c1 = 0xcc9e2d51;
      c2 = 0x1b873593;
      i = 0;

      while (i < bytes) {
        k1 =
          ((key.charCodeAt(i) & 0xff)) |
          ((key.charCodeAt(++i) & 0xff) << 8) |
          ((key.charCodeAt(++i) & 0xff) << 16) |
          ((key.charCodeAt(++i) & 0xff) << 24);
        ++i;

        k1 = ((((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16))) & 0xffffffff;
        k1 = (k1 << 15) | (k1 >>> 17);
        k1 = ((((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16))) & 0xffffffff;

        h1 ^= k1;
        h1 = (h1 << 13) | (h1 >>> 19);
        h1b = ((((h1 & 0xffff) * 5) + ((((h1 >>> 16) * 5) & 0xffff) << 16))) & 0xffffffff;
        h1 = (((h1b & 0xffff) + 0x6b64) + ((((h1b >>> 16) + 0xe654) & 0xffff) << 16));
      }

      k1 = 0;

      switch (remainder) {
        case 3:
          k1 ^= (key.charCodeAt(i + 2) & 0xff) << 16;
        case 2:
          k1 ^= (key.charCodeAt(i + 1) & 0xff) << 8;
        case 1:
          k1 ^= (key.charCodeAt(i) & 0xff);

          k1 = (((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
          k1 = (k1 << 15) | (k1 >>> 17);
          k1 = (((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;
          h1 ^= k1;
      }

      h1 ^= key.length;

      h1 ^= h1 >>> 16;
      h1 = (((h1 & 0xffff) * 0x85ebca6b) + ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) & 0xffffffff;
      h1 ^= h1 >>> 13;
      h1 = ((((h1 & 0xffff) * 0xc2b2ae35) + ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16))) & 0xffffffff;
      h1 ^= h1 >>> 16;

      return h1 >>> 0;
    },

    hasLocalStorage: function () {
      try {
        return !!window.localStorage;
      } catch (e) {
        return true; // SecurityError when referencing it means it exists
      }
    },

    hasSessionStorage: function () {
      try {
        return !!window.sessionStorage;
      } catch (e) {
        return true; // SecurityError when referencing it means it exists
      }
    },

    hasIndexDb: function () {
      try {
        return !!window.indexedDB;
      } catch (e) {
        return true; // SecurityError when referencing it means it exists
      }
    },

    isCanvasSupported: function () {
      var elem = document.createElement('canvas');
      return !!(elem.getContext && elem.getContext('2d'));
    },

    isIE: function () {
      if (navigator.appName === 'Microsoft Internet Explorer') {
        return true;
      } else if (navigator.appName === 'Netscape' && /Trident/.test(navigator.userAgent)) { // IE 11
        return true;
      }
      return false;
    },

    getPluginsString: function () {
      if (this.isIE() && this.ie_activex) {
        return this.getIEPluginsString();
      } else {
        return this.getRegularPluginsString();
      }
    },

    getRegularPluginsString: function () {
      return this.map(navigator.plugins, function (p) {
        var mimeTypes = this.map(p, function (mt) {
          return [mt.type, mt.suffixes].join('~');
        }).join(',');
        return [p.name, p.description, mimeTypes].join('::');
      }, this).join(';');
    },

    getIEPluginsString: function () {
      if (window.ActiveXObject) {
        var names = ['ShockwaveFlash.ShockwaveFlash', //flash plugin
          'AcroPDF.PDF', // Adobe PDF reader 7+
          'PDF.PdfCtrl', // Adobe PDF reader 6 and earlier, brrr
          'QuickTime.QuickTime', // QuickTime
          // 5 versions of real players
          'rmocx.RealPlayer G2 Control',
          'rmocx.RealPlayer G2 Control.1',
          'RealPlayer.RealPlayer(tm) ActiveX Control (32-bit)',
          'RealVideo.RealVideo(tm) ActiveX Control (32-bit)',
          'RealPlayer',
          'SWCtl.SWCtl', // ShockWave player
          'WMPlayer.OCX', // Windows media player
          'AgControl.AgControl', // Silverlight
          'Skype.Detection'
        ];

        // starting to detect plugins in IE
        return this.map(names, function (name) {
          try {
            new ActiveXObject(name);
            return name;
          } catch (e) {
            return null;
          }
        }).join(';');
      } else {
        return ""; // behavior prior version 0.5.0, not breaking backwards compat.
      }
    },

    getScreenResolution: function () {
      var resolution;
      if (this.screen_orientation) {
        resolution = (screen.height > screen.width) ? [screen.height, screen.width] : [screen.width, screen.height];
      } else {
        resolution = [screen.height, screen.width];
      }
      return resolution;
    },

    getCanvasFingerprint: function () {
      var canvas = document.createElement('canvas');
      var ctx = canvas.getContext('2d');
      // https://www.browserleaks.com/canvas#how-does-it-work
      var txt = 'http://valve.github.io';
      ctx.textBaseline = "top";
      ctx.font = "14px 'Arial'";
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = "#f60";
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = "#069";
      ctx.fillText(txt, 2, 15);
      ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
      ctx.fillText(txt, 4, 17);
      return canvas.toDataURL();
    }
  };
  // js继承方法
  Object.extend = function (destination, source) { // 一个静态方法表示继承, 目标对象将拥有源对象的所有属性和方法
    for (var property in source) {
      destination[property] = source[property]; // 利用动态语言的特性, 通过赋值动态添加属性与方法
    }
    return destination; // 返回扩展后的对象
  };
  var deviceInfo = {};
  var debug;
  var heartbeat;
  var clientUrl;
  var activityUrl;
  var singlePageName;
  var isSinglePageChanged = false;
  // 超时轮询次数
  var requestTime = 0;
  // 是否初始化
  var inited = false;
  // 是否请求过数据
  var sessionStarted = false;
  // 开始时间
  var startTime;
  // 设备信息等的一些临时存储
  var requestQueue = null;
  // 事件的临时存储
  var eventQueue = [];
  var autoExtend = true;
  var beatInterval = 500;
  var heartInterval = '';
  var failTimeout = 0;
  var session_id;
  var old_session_id;
  // 页面进入的时间
  var comeinTime = new Date().getTime();
  var lastBeat = comeinTime;
  // session_id改变的时间
  var sessionChangeTime = comeinTime;
  // session_id的重置时间
  var clientTime;
  // 页面停留时长设置，超过之后不再发活动日志请求
  var durationTime;
  // var failTimeoutAmount = 60;
  var ua = navigator.userAgent;
  // alert(JSON.stringify(ua));
  var nVer = navigator.appVersion;
  var errorAjaxData = [];

  /**
   * 页面初始化方法
   * @param [object]object        获取到的一些基本信息，比如appkey，设备名字等
   * @param [boolean]noHeartBeat  是否支持页面停留时轮询
   */
  // alert(JSON.stringify(storageFun('cbas_queue')));
  cbas.init = function (object) {
    if (!inited) {
      startTime = new Date().getTime();
    }
    if (typeof object !== 'object') {
      throw new Error('argument muest be an object');
      return;
    }
    if (!object.appkey && !deviceInfo.appkey) {
      throw new Error('appkey is undefined');
      return;
    }
    // if (!object.clientUrl && !deviceInfo.clientUrl) {
    //   throw new Error('clientUrl is undefined');
    //   return;
    // }
    // if (!object.activityUrl && !deviceInfo.activityUrl) {
    //   throw new Error('activityUrl is undefined');
    //   return;
    // }
    // startTime = new Date().getTime();
    requestQueue = storageFun('cbas_queue') || [];
    var sessionId = storageFun('session_id');
    object = object || {};
    // 是否开启debug模式，控制台打印log
    debug = object.debug || debug || false;

    //  是否页面停留轮询
    heartbeat = object.heartbeat !== '' ? typeof object.heartbeat !== "undefined" ? object.heartbeat : heartbeat ? heartbeat : true : true;
    // sdk的key
    deviceInfo.appkey = object.appkey || deviceInfo.appkey || 'your_appkey';
    // 进入页面是发起的clientdata请求的url
    clientUrl = object.clientUrl || clientUrl || '/cbasums/ums/postClientData';
    // 活动日志请求的url
    activityUrl = object.activityUrl || activityUrl || '/cbasums/ums/postActivityLog';
    // 平台名字
    deviceInfo.platform = object.platform || deviceInfo.platform || getOsAndVersion().os;
    // 系统版本
    deviceInfo.os_version = object.os_version || deviceInfo.os_version || getOsAndVersion().os_version;
    // 设备语言
    deviceInfo.language = object.language || deviceInfo.language || getLanguage();
    // 设备id
    deviceInfo.deviceid = object.deviceid || deviceInfo.deviceid || getBrowserFinger();
    // 设备分辨率
    deviceInfo.resolution = object.resolution || deviceInfo.resolution || getResolution();
    // 是否是移动设备
    deviceInfo.ismobiledevice = object.ismobiledevice || deviceInfo.ismobiledevice || isMobileDeviceFun();
    // 设备名字
    deviceInfo.devicename = object.devicename || deviceInfo.devicename || getBrowser();
    // 默认浏览器
    deviceInfo.defaultbrowser = object.defaultbrowser || deviceInfo.defaultbrowser || getBrowser();
    // java支持情况
    deviceInfo.javasupport = object.javasupport || deviceInfo.javasupport || '';
    // flash支持情况
    deviceInfo.flashversion = object.flashversion || deviceInfo.flashversion || '';
    // 模块名字
    deviceInfo.modulename = object.modulename || deviceInfo.modulename || '';
    // 国际移动设备标识
    deviceInfo.imei = object.imei || deviceInfo.imei || '';
    // 国际移动用户识别
    deviceInfo.imsi = object.imsi || deviceInfo.imsi || '';
    //
    deviceInfo.salt = object.salt || deviceInfo.salt || '';
    // 是否开启gps
    deviceInfo.usegps = object.usegps || deviceInfo.usegps || false;
    // gps功能
    deviceInfo.havegps = object.havegps || deviceInfo.havegps || isGPS();
    // BT功能
    deviceInfo.havebt = object.havebt || deviceInfo.havebt || false;
    // WIFI功能
    deviceInfo.havewifi = object.havewifi || deviceInfo.havewifi || false;
    // 重力感应功能
    deviceInfo.havegravity = object.havegravity || deviceInfo.havegravity || false;
    // wifi mac地址
    deviceInfo.wifimac = object.wifimac || deviceInfo.wifimac || '';
    // 版本
    deviceInfo.version = object.version || deviceInfo.version || '1.0';
    // 设备网络情况
    deviceInfo.network = object.network || cbas.network || '';
    // 纬度
    deviceInfo.latitude = object.latitude || deviceInfo.latitude || '';
    // 经度
    deviceInfo.longitude = object.longitude || deviceInfo.longitude || '';
    // 是否越狱
    deviceInfo.isjailbroken = object.isjailbroken || deviceInfo.isjailbroken || '';
    // 用户标识符
    deviceInfo.userid = object.userid || deviceInfo.userid || '';
    // 服务商
    deviceInfo.mccmnc = object.mccmnc || deviceInfo.mccmnc || '';
    deviceInfo.account = object.account || deviceInfo.account || '';
    // cbas.url = stripTrailingSlash(ob.url || cbas.url || "");
    deviceInfo.ext_args = object.ext_args || deviceInfo.ext_args || '';
    clientTime = object.clienttime || 30;
    durationTime = object.durationtime || 600;
    cbas.session_begin(heartbeat);
    if (!inited) {
      cbas.session_duration(comeinTime, comeinTime + 1000);
      heartInterval = setInterval(function () {
        heartBeat(heartbeat);
      }, beatInterval);
    }
    inited = true;
    storageFun('cbas_id', deviceInfo.deviceid);
  };

  /**
   * 页面进入执行方法
   * @param noHeartBeat
   */
  cbas.session_begin = function (heartbeat, fn) {
    var oldSessionData = storageFun('old_session_data');
    if (!sessionStarted || inited) {
      autoExtend = (heartbeat) ? true : false;
      var req = {
        data: {}
      };
      var stime = new Date().getTime();
      // req.url = clientUrl;
      // req.data.session_begin = 1;
      // req.metrics = JSON.stringify(getMetrics());
      req.data = Object.extend({}, deviceInfo);
      req.data.time = formatTime(stime, '-');
      if (fn) {
        req.success = fn;
        // } else {
        //   req.success = function () {
        //     sessionStarted = true;
        //   }
      }
      sessionStarted = true;
      // lastBeat = startTime || new Date().getTime();
      var dtime = stime - comeinTime;
      var localCominTime = storageFun('comeintime');
      if (localCominTime) {
        storageFun('comeintime', stime);
        // console.log(stime, localCominTime, stime - localCominTime);
        if (stime - localCominTime < clientTime * 1000) {
          return;
        }
      } else { 
        storageFun('comeintime', stime);
      }
      if (oldSessionData) {
        if (stime - oldSessionData.time > clientTime * 1000) {
          session_id = generateUUID();
          sessionChangeTime = new Date().getTime();
          // console.log(formatTime(lastBeat, '-'), formatTime(sessionChangeTime, '-'));
          storageFun('session_id', session_id);
          storageFun('old_session_data', JSON.stringify({
            "sessionid": session_id,
            "time": sessionChangeTime,
            "page": getPageName()
          }));
          cbasRequire({
            url: clientUrl,
            data: {
              content: encodeURIComponent(JSON.stringify(req.data))
            },
            success: req.success
          });
        } else if (stime - sessionChangeTime > clientTime * 1000){ 
          session_id = generateUUID();
          sessionChangeTime = new Date().getTime();
          storageFun('session_id', session_id);
          cbasRequire({
            url: clientUrl,
            data: {
              content: encodeURIComponent(JSON.stringify(req.data))
            },
            success: req.success
          });
          if (clientTime > durationTime) {
            var minDuration = durationTime;
          } else { 
            var minDuration = clientTime;
          }
          if (minDuration*1000 < dtime && dtime < (durationTime + 60) * 1000) {
            var changedPrevTime = lastBeat;
            cbas.session_duration(lastBeat, sessionChangeTime, changedPrevTime);
            lastBeat = sessionChangeTime;
          }
        }
      } else {
        lastBeat = startTime || stime;
        session_id = generateUUID();
        sessionChangeTime = new Date().getTime();
        storageFun('session_id', session_id);
        storageFun('old_session_data', JSON.stringify({
          "sessionid": session_id,
          "time": stime,
          "page": getPageName()
        }));
        cbasRequire({
          url: clientUrl,
          data: {
            content: encodeURIComponent(JSON.stringify(req.data))
          },
          success: req.success
        });
        if (clientTime > durationTime) {
          var minDuration = durationTime;
        } else { 
          var minDuration = clientTime;
        }
        if (minDuration*1000 < dtime && dtime < (durationTime + 60) * 1000) {
          var changedPrevTime = lastBeat;
          cbas.session_duration(lastBeat, sessionChangeTime, changedPrevTime);
          lastBeat = sessionChangeTime;
        }
      }

      // sessionChangeTime = new Date().getTime();
      // toRequestQueue(req);
      // storageFun("cbas_queue", requestQueue, true);
      // cbas.add_event({
      //   event_identifier: 'pageView',
      // })
      // if (60000 < dtime && dtime < (durationTime + 60) * 1000) {
      //   cbas.session_duration(lastBeat, lastBeat);
      // }
    }
  };
  /**
   * 单页应用修改当前页面名字
   */
  cbas.reg_pagename = function (pagename) {
    isSinglePageChanged = true;
    singlePageName = pagename;
    if (isSinglePageChanged) { 
      var singlePageChangeTime = Date.now();
      cbas.session_duration(singlePageChangeTime, singlePageChangeTime + 1000);
    }
    isSinglePageChanged = false;
  };
  /**
   * 页面停留执行方法
   * @param last
   * @param lastBeat
   */
  cbas.session_duration = function (lastBeat, last, changedPrevTime) {
    // console.log('session_duration');
    if (sessionStarted) {
      if (!session_id) {
        session_id = generateUUID();
      }
      // log("Session extended", last - lastBeat);
      var req = {
        data: {}
      };
      req.url = activityUrl;
      var ext_args = Object.extend({}, deviceInfo.ext_args);
      var oldSessionData = storageFun('old_session_data');
      if (oldSessionData) {
        var old_session_id = oldSessionData.sessionid;
        // console.log(lastBeat, sessionChangeTime);
        if (changedPrevTime) {
          ext_args.last_session_id = old_session_id;
          ext_args.last_start_millis = formatTime(oldSessionData.time, '-');
          ext_args.last_activities = oldSessionData.page;
        }
      }
      req.data.ext_args = JSON.stringify(ext_args);
      req.data.start_millis = formatTime(lastBeat, '-');
      req.data.end_millis = formatTime(last, '-');
      req.data.activities = singlePageName || getPageName();
      req.data.duration = last - lastBeat;
      req.data.session_id = session_id;
      // old_session_id = session_id;
      // storageFun('old_session_data', JSON.stringify({
      //   "sessionid": old_session_id,
      //   "time": new Date().getTime(),
      //   "page": getPageName()
      // }));
      toRequestQueue(req);
    }
  };
  /**
   * 页面关闭方法
   */
  cbas.session_end = function (fn) {
    if (sessionStarted && storageFun('session_id')) {
      // if (new Date().getTime() - comeinTime >= 30 * 60 * 1000) {
      // log("Ending session");
      // sessionStarted = false;
      var req = {
        data: {}
      };
      var dateTime = new Date().getTime();
      req.url = activityUrl;
      // req.async = false;
      req.data.ext_args = JSON.stringify(Object.extend({}, deviceInfo.ext_args));
      if (!lastBeat) {
        // alert('lastBeat:' + lastBeat + '---------comeinTime:' + comeinTime);
      }
      var start_millis = lastBeat || comeinTime;
      req.data.start_millis = formatTime(start_millis, '-');
      req.data.end_millis = formatTime(dateTime, '-');
      req.data.activities = singlePageName || getPageName();
      // req.data.duration = dateTime - comeinTime;
      req.data.duration = dateTime - start_millis;
      // console.log('~~~~~~~~~~~~~~', storageFun('old_session_data').sessionid);
      req.data.session_id = session_id || storageFun('old_session_data').sessionid || storageFun('session_id');
      // req.data.version = cbas.version;
      // req.data.deviceid = cbas.deviceid;
      // toRequestQueue(req);
      // heartBeat();
      // cbas.add_event({
      //   event_identifier: 'pageLeave',
      // })
      toRequestQueue(req);
      if (fn) {
        fn();
      }
      // heartBeat();
    }
    // }
  };
  // window.onbeforeunload = function () {
  //   cbas.session_end();
  // };
  var isOnIOS = navigator.userAgent.match(/iPad|iPhone/i);
  var eventName = isOnIOS ? "pagehide" : "beforeunload";
  var pageHideData;
  window.addEventListener(eventName, function () {
    // document.writeln('------------------unload---------------');
    cbas.session_end();
    // console.log('------------------unload---------------');
    var logIndex = 0;
    // for (var i = 0, len = requestQueue.length; i < len; i++){ 
    //   if (requestQueue[i].url.indexOf('postActivityLog')>=0){ 
    //     logIndex = i;
    //   }
    //   break;
    // }
    // while (requestQueue.length > 0) {
    if (isOnIOS) {
      // var params = requestQueue.splice(logIndex,1);
      // var params = requestQueue[0];
      var params = requestQueue.pop();
      pageHideData = params;
      // storageFun("cbas_queue", requestQueue, true);
      var fun = function () {
        // requestQueue.shift();
        storageFun("cbas_queue", requestQueue, true);
      };
    } else {
      var params = requestQueue.pop();
      var fun = function () {
        // requestQueue.shift();
        storageFun("cbas_queue", requestQueue, true);
      };
    }
    // var xhr = new XMLHttpRequest();
    // xhr.append('content', encodeURIComponent(JSON.stringify(params.data)));
    // xhr.open('POST', params.url, true);
    // xhr.send();
    // console.log('123456', params.async === false ? params.async : true);
    cbasRequire({
      dotype: 'leave',
      url: params.url,
      async: params.async === false ? params.async : true,
      data: {
        content: encodeURIComponent(JSON.stringify(params.data))
      },
      getdata: fun,
      error: params.error
    });
    // }

  });
  // alert(111);
  window.addEventListener('pageshow', function (event) {
    // alert('pageshow:' + event.persisted + '-----' + navigator.userAgent)
    if (event.persisted) {
      var showTime = Date.now();
      requestQueue = [];
      cbas.session_duration(showTime, showTime + 1000);
      // alert(JSON.stringify(storageFun('cbas_queue')));
      // window.location.reload();
    }
    // storageFun('persisted', event.persisted);
  });

  document.addEventListener("DOMContentLoaded", function (event) {
    // alert(345);
  });
  window.onload = function () {
    // alert(456);
  };
  window.addEventListener('popstate', function () {
    // alert(567);
  });
  /**
   * 事件添加方法
   * @param [object]event 添加事件时的一些参数配置
   */
  cbas.add_event = function (event) {
    // console.log(event,session_id);
    // return;
    if (!session_id) {
      session_id = generateUUID();
    }
    if (typeof event !== 'object') {
      throw new Error('argument muest be an object');
      return;
    }
    if (!event.data.event_identifier) {
      throw new Error('event_identifier is undefined');
      return;
    }
    // event.data = {};
    // if (!event.event_identifier) {
    //   log("Event must have key property");
    //   return;
    // }
    // if (!event.data.acc) {
    //   event.data.acc = 1;
    // }

    // var props = ["key", "count", "sum", "segmentation"];
    // var e = event;
    // var e = {};
    // e.url = event.url;
    // e.success = event.success;
    // e.error = event.error;
    // e.data = Object.extend({}, event.data);
    var e = Object.extend({}, event);
    if (event.data.ext_args) {
      e.data.ext_args = JSON.stringify(event.data.ext_args);
    }
    // eventAbortTime = event.event_abort_time;
    // e.data.event_identifier = event.event_identifier;
    e.url = e.url || '/cbasums/ums/postEvent';
    // e.data.account = event.account;
    // e.data.mobileNumber = event.mobileNumber;
    // e.data.event_identifier = event.event_identifier;
    // e.data.event_name = event.event_name;
    // e.data.account = event.account;
    // e.data.account = event.account;
    // e.data.account = event.account;
    e.data.activity = singlePageName || getPageName();
    e.data.session_id = session_id;
    // e.data = JSON.stringify(e.data);
    // e.data.label = event.label || '';
    // e.data.account = event.account || '';
    // e.data.mobileNumber = event.mobileNumber || '';
    // e.data.time = formatTime(new Date().getTime(), '-');
    // eventQueue.push(e);
    // heartBeat();
    // eventQueue.push(e);
    toRequestQueue(e);
    // if (!singlePage){
    //   clearInterval(heartInterval);
    //   heartInterval = '';
    // }
    // heartBeat();
    // log("Adding event: ", event);
  };

  cbas.manualHeart = function () {
    clearInterval(heartInterval);
    heartInterval = setInterval(function () {
      heartBeat();
    }, beatInterval);
  };

  /**
   * 获取页面名字（不带后缀）
   * @returns {Array.<*>}
   */
  function getPageName() {
    var a = location.href;
    var b = a.split("/");
    var c = b.slice(b.length - 1, b.length).toString(String).split(".");
    return c.slice(0, 1)[0];
  }

  /**
   * 时间格式化
   * @param [string]date    可以new Date出来的入参,如时间戳，日期等
   * @param [string]sign    年月日连接符
   * @returns {string}      返回格式化后的年月日时分秒
   */
  function formatTime(date, sign) {
    sign = sign ? sign : '';
    var mydate = new Date(date);
    var year = mydate.getFullYear();
    // return year;
    var month = mydate.getMonth() + 1;
    // return month;
    var day = mydate.getDate();
    if (month < 10) {
      month = '0' + month;
    }
    if (day < 10) {
      day = '0' + day;
    }
    var hour = mydate.getHours();
    var minutes = mydate.getMinutes();
    var seconds = mydate.getSeconds();
    if (hour < 10) {
      hour = '0' + hour;
    }
    if (minutes < 10) {
      minutes = '0' + minutes;
    }
    if (seconds < 10) {
      seconds = '0' + seconds;
    }
    var formatdate = year + sign + month + sign + day + ' ' + hour + ':' + minutes + ':' + seconds;
    return formatdate;
  }

  /**
   * 获取设备id
   * @returns {*}
   */
  function getId() {
    var id = storageFun("cbas_id") || generateUUID();
    storageFun("cbas_id", id);
    return id;
  }

  /**
   * 生产唯一标识UUID
   * @returns {string}  返回生成的UUID
   */
  function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
  }

  /**
   * 产生浏览器指纹的11位数字唯一标识
   * @returns {string}  返回生成的浏览器指纹数字
   */
  function getBrowserFinger() {
    var id = storageFun("cbas_id");
    if (id) {
      return id;
    } else {
      var fingerprint = new Fingerprint({
        canvas: true
      }).get();
      return fingerprint;
    }
  }

  /**
   * 获取使用的浏览器
   * @returns {*}   浏览器的名字
   */
  function getBrowser() {
    var browser;
    var nameOffset, verOffset;
    if (ua.indexOf('Opera Mini') != -1) {
      browser = 'Opera Mini';
    }
    // Opera
    else if (ua.indexOf('Opera') != -1) {
      browser = 'Opera';
    }
    // MSIE
    else if (ua.indexOf('MSIE') != -1) {
      browser = 'Internet Explorer';
    }
    // IEMobile
    else if (ua.indexOf('IEMobile') != -1) {
      browser = 'IE Mobile';
    }
    // Chrome
    else if (ua.indexOf('Chrome') != -1) {
      browser = 'Chrome';
    }
    // Safari
    else if (ua.indexOf('Safari') != -1) {
      browser = 'Safari';
    }
    // Firefox
    else if (ua.indexOf('Firefox') != -1) {
      browser = 'Firefox';
    }
    // MSIE 11+
    else if (ua.indexOf('Trident/') != -1) {
      browser = 'Internet Explorer';
    }
    // Other browsers
    else if ((nameOffset = ua.lastIndexOf(' ') + 1) < (verOffset = ua.lastIndexOf('/'))) {
      browser = ua.substring(nameOffset, verOffset);
      if (browser.toLowerCase() == browser.toUpperCase()) {
        browser = navigator.appName;
      }
    }
    return browser;
  }

  /**
   * 获取系统名字和版本号
   * @returns {string} 返回系统名字和版本号
   */
  function getOsAndVersion() {
    // if (key === 'osVersion') {
    var os = "unknown";
    var clientStrings = [{
        s: 'Windows 3.11',
        r: /Win16/
      },
      {
        s: 'Windows 95',
        r: /(Windows 95|Win95|Windows_95)/
      },
      {
        s: 'Windows ME',
        r: /(Win 9x 4.90|Windows ME)/
      },
      {
        s: 'Windows 98',
        r: /(Windows 98|Win98)/
      },
      {
        s: 'Windows CE',
        r: /Windows CE/
      },
      {
        s: 'Windows 2000',
        r: /(Windows NT 5.0|Windows 2000)/
      },
      {
        s: 'Windows XP',
        r: /(Windows NT 5.1|Windows XP)/
      },
      {
        s: 'Windows Server 2003',
        r: /Windows NT 5.2/
      },
      {
        s: 'Windows Vista',
        r: /Windows NT 6.0/
      },
      {
        s: 'Windows 7',
        r: /(Windows 7|Windows NT 6.1)/
      },
      {
        s: 'Windows 8.1',
        r: /(Windows 8.1|Windows NT 6.3)/
      },
      {
        s: 'Windows 8',
        r: /(Windows 8|Windows NT 6.2)/
      },
      {
        s: 'Windows NT 4.0',
        r: /(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/
      },
      {
        s: 'Windows ME',
        r: /Windows ME/
      },
      {
        s: 'Windows Phone',
        r: /Windows Phone/
      },
      {
        s: 'Android',
        r: /Android/
      },
      {
        s: 'Open BSD',
        r: /OpenBSD/
      },
      {
        s: 'Sun OS',
        r: /SunOS/
      },
      {
        s: 'Linux',
        r: /(Linux|X11)/
      },
      {
        s: 'iOS',
        r: /(iPhone|iPad|iPod)/
      },
      {
        s: 'Mac OSX',
        r: /Mac OS X/
      },
      {
        s: 'Mac OS',
        r: /(MacPPC|MacIntel|Mac_PowerPC|Macintosh)/
      },
      {
        s: 'QNX',
        r: /QNX/
      },
      {
        s: 'UNIX',
        r: /UNIX/
      },
      {
        s: 'BeOS',
        r: /BeOS/
      },
      {
        s: 'OS/2',
        r: /OS\/2/
      },
      {
        s: 'SearchBot',
        r: /(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver)/
      }
    ];
    for (var id in clientStrings) {
      var cs = clientStrings[id];
      if (cs.r.test(ua)) {
        os = cs.s;
        break;
      }
    }
    var osVersion = "unknown";
    if (/Windows/.test(os) && os != "Windows Phone") {
      osVersion = os;
      os = 'Windows';
    }
    switch (os) {
      case 'Mac OSX':
        osVersion = /Mac OS X (10[\.\_\d]+)/.exec(ua)[1];
        break;
      case 'Windows Phone':
        osVersion = (/Windows Phone ([\.\_\d]+)/.exec(ua) || ["", "8.0"])[1];
        break;
      case 'Android':
        osVersion = /Android ([\.\_\d]+)/.exec(ua)[1];
        break;
      case 'iOS':
        osVersion = /OS (\d+)_(\d+)_?(\d+)?/.exec(nVer);
        osVersion = osVersion[1] + '.' + osVersion[2] + '.' + (osVersion[3] | 0);
        break;
    }

    return {
      os: os,
      os_version: osVersion
    };
    // }
    // var platform=navigator.platform.toLowerCase();
    // var system = ['win','mac','xll','iphone','ipoad','ipad','ios','android','nokiaN','winMobile','wii','ps'];
    // for(var len=system.length,i=0;i<len;i++){
    //   if(platform.indexOf(system[i])>-1){
    //     return system[i];
    //   }
    // }
    // return navigator[key];
  }

  /**
   * 获取系统语言
   * @returns {string|*}  返回语言的代表字符
   */
  function getLanguage() {
    var locale = navigator.language || navigator.browserLanguage || navigator.systemLanguage || navigator.userLanguage;
    if (typeof locale !== "undefined") {
      return locale;
    }
  }

  /**
   * 获取分辨率
   * @returns {string}
   */
  function getResolution() {
    if (screen.width) {
      var width = (screen.width) ? screen.width : '';
      var height = (screen.height) ? screen.height : '';
      return width + "x" + height;
    }
  }

  /**
   * 是否支持GPS
   * @returns {boolean} true 支持，false 不支持
   */
  function isGPS() {
    if (deviceInfo.usegps) {
      var havegps = false;
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
          // alert(position.coords.latitude + "," + position.coords.longitude);
          deviceInfo.latitude = position.coords.latitude;
          deviceInfo.longitude = position.coords.longitude;
          havegps = true;
        }, function (error) {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              log('用户不允许地理定位');
              break;
            case error.POSITION_UNAVAILABLE:
              log('无法获取当前位置');
              break;
            case error.TIMEOUT:
              log('操作超时');
              break;
            case error.UNKNOWN_ERROR:
              log('未知错误');
              break;
          }
        });
      } else {
        havegps = false;
      }
      return havegps;
    }
  }

  /**
   * 判断是否是移动设备
   * @returns {boolean} 是否是移动设备
   */
  function isMobileDeviceFun() {
    if (/iphone|ipoad|ipad|ios|android|nokiaN|winMobile|wii|ps/i.test(ua)) {
      return true;
    }
    return false;
  }

  /**
   * 添加共有的一些参数，如appkey，如时间等
   * @param request     要添加的原键值对
   */
  function toRequestQueue(request) {
    if (!deviceInfo.appkey || !deviceInfo.deviceid) {
      log("appkey or deviceid is missing");
      return;
    }

    request.data.appkey = deviceInfo.appkey;
    request.data.deviceid = deviceInfo.deviceid;
    request.data.version = deviceInfo.version;
    request.data.time = formatTime(new Date().getTime(), '-');
    requestQueue.push(request);
    storageFun("cbas_queue", requestQueue, true);
  }

  /**
   * ajax请求封装
   * @param [Object] requestObject                整个ajax的参数
   * @param [string] requestObject.type           请求的类型
   * @param [string] requestObject.url            请求的地址
   * @param [boolean] requestObject.async         请求是否异步
   * @param [string or json] requestObject.data   请求内容入参
   * @param [string] requestObject.dataType       请求返回的数据格式
   * @param [string] requestObject.contentType    请求头的Content-Type
   * @param [string] requestObject.beforeSend     请求发送之前的函数
   * @param [string] requestObject.success        请求成功回调
   * @param [string] requestObject.error          请求失败回调
   * @param [string] requestObject.timeout        请求超时回调
   */
  function cbasRequire(requestObject) {
    var xhr = createCXHR();
    try {
      requestObject = requestObject || {};
      requestObject.type = requestObject.type || 'POST';
      requestObject.url = requestObject.url;
      if (!requestObject.cache) {
        requestObject.url = requestObject.url + '?_=' + new Date().getTime();
      }
      requestObject.async = requestObject.async === false ? requestObject.async : true;
      requestObject.data = requestObject.data;
      requestObject.dataType = requestObject.dataType || "text";
      requestObject.contentType = requestObject.contentType || "application/x-www-form-urlencoded";
      requestObject.beforeSend = requestObject.beforeSend || function () {};
      requestObject.success = requestObject.success || xhrSuccessFunc;
      requestObject.error = requestObject.error || xhrErrorFunc;
      if (xhr.responseType) {
        xhr.responseType = requestObject.dataType;
      }
      xhr.open(requestObject.type, requestObject.url, requestObject.async);
      xhr.setRequestHeader("Content-Type", requestObject.contentType);
      // console.log(requestObject);
      xhr.onreadystatechange = function (e) {
        if (xhr.readyState == 4) {
          if (xhr.status == 200) {
            requestObject.success(xhr.response);
            if (errorAjaxData.length > 0) {
              // for (var i = 0, len = errorAjaxData.length; i < len; i++) {
              setTimeout(function () {
                cbasRequire(errorAjaxData.shift());
              }, 500);
              // }
            }
            // } else if (xhr.status == 504) {
            //   if (requestTime < 3) {
            //     setTimeout(function () {
            //       xhr.open(requestObject.type, requestObject.url, requestObject.async);
            //       xhr.setRequestHeader("Content-Type", requestObject.contentType);
            //       xhr.send(convertData(requestObject.data));
            //       requestTime += 1;
            //     }, 1000)
            //   } else {
            //     requestTime = 0;
            //     requestObject.error();
            //   }
          } else {
            if (errorAjaxData.indexOf(requestObject) < 0) {
              errorAjaxData.push(requestObject);
            }
            requestObject.error(xhr);
          }
        } else if (xhr.readyState == 2) {
          if (requestObject.dotype != 'leave' && requestObject.getdata) {
            requestObject.getdata();
          }
        }
      };
      if (requestObject.dotype == 'leave') {
        var sendTime = Date.now();
      }
      xhr.send(convertData(requestObject.data));
      if (requestObject.dotype == 'leave') {
        // document.writeln(xhr.readyState != 2 && (Date.now() - sendTime) < 2000);
        while (xhr.readyState < 2 && (Date.now() - sendTime) < 500) {
          // console.log(Date.now() - sendTime);
        }
        if (requestObject.getdata) {
          requestObject.getdata();
        }
      }
    } catch (e) {
      console.log('xmlhttp：' + e.message);
    }

  };

  /**
   * 生成XMLHttpRequest对象方法
   * @returns {*} 返回XMLHttpRequest对象
   */
  function createCXHR() {
    if (window.XMLHttpRequest) {
      return new XMLHttpRequest();
    } else if (window.ActiveXObject) {
      var versions = ['MSXML2.XMLHttp', 'Microsoft.XMLHTTP'];
      for (var i = 0, len = versions.length; i < len; i++) {
        try {
          return new ActiveXObject(version[i]);
          break;
        } catch (e) {
          //跳过
        }
      }
    } else {
      throw new Error('浏览器不支持XHR对象！');
    }
  };

  /**
   * json格式入参转字符换
   * @param data ajax请求入参
   * @returns {*}json格式转换后拼接的字符串
   */
  function convertData(data) {
    if (typeof data === 'object') {
      var convertResult = "";
      for (var c in data) {
        convertResult += c + "=" + data[c] + "&";
      }
      convertResult = convertResult.substring(0, convertResult.length - 1);
      return convertResult;
    } else {
      return data;
    }
  };
  /**
   * 请求成功默认回调
   */
  function xhrSuccessFunc() {
    log('请求成功！');
    // log(JSON.stringify(arguments));
  }

  /**
   * 请求失败默认回调
   */
  function xhrErrorFunc(xhr) {
    console.log('请求失败！', xhr);
    // log(JSON.stringify(arguments));
  }

  /**
   * 过滤地址最后的/符号
   * @param [string]str   url字符串
   * @returns {*}         返回过滤之后的url字符串
   */
  // function stripTrailingSlash(str) {
  //   if (str.substr(str.length - 1) == '/') {
  //     return str.substr(0, str.length - 1);
  //   }
  //   return str;
  // }

  /**
   * 发送请求的心跳包
   * @param noHeartBeat   页面停留需不需要轮询发请求
   */
  function heartBeat() {
    var last = new Date().getTime();
    var oldLastBeat = lastBeat;
    var cbasQueue = storageFun("cbas_queue");
    // if (!sessionStarted) {
    //   cbas.session_begin(noHeartBeat);
    // }
    // log(sessionStarted,autoExtend,last,sessionChangeTime,last-sessionChangeTime);
    if (sessionStarted && autoExtend) {
      // log(last - comeinTime,clientTime * 1000);
      if (last - sessionChangeTime > clientTime * 1000) {
        sessionStarted = false;
        old_session_id = session_id || storageFun('session_id');
        storageFun('session_id', '');
        storageFun('old_session_data', JSON.stringify({
          "sessionid": old_session_id,
          "time": new Date().getTime(),
          "page": getPageName()
        }));
        // session_id = generateUUID();
        // storageFun('session_id', session_id);
        cbas.session_begin(true);
        // if (last - comeinTime < (durationTime + 1) * 1000) {
        // console.log(last, lastBeat);
        // cbas.session_duration(oldLastBeat,last);
        // }
        // cbas.session_duration(lastBeat, last);
      }
      // console.log(last - comeinTime,durationTime * 1000,requestQueue.length);
      if (last - comeinTime < (durationTime + 60) * 1000) {
        if (last - lastBeat > 60000) {
          // console.log(last, comeinTime, last - comeinTime, last - comeinTime < (durationTime + 60) * 1000);
          cbas.session_duration(lastBeat, last);
          lastBeat = last;
          // console.log('log===========================',formatTime(lastBeat,'-'))
        }
      }
    }

    if (eventQueue.length > 0) {
      if (eventQueue.length <= 10) {
        toRequestQueue(eventQueue[0]);
        eventQueue = [];
      } else {
        var events = eventQueue.splice(0, 10);
        toRequestQueue(events[0]);
      }
    }
    if (requestQueue.length > 0 && new Date().getTime() > failTimeout) {
      // alert(JSON.stringify(requestQueue));
      // console.log(1234566,storageFun("cbas_queue"));
      // var params = requestQueue.shift();
      // log("Processing request", params);
      // sendXmlHttpRequest(params, function(err, params){
      //   log("Request Finished", params, err);
      //   if(err){
      //     requestQueue.unshift(params);
      //     store("cly_queue", requestQueue, true);
      //     failTimeout = getTimestamp() + failTimeoutAmount;
      //   }
      // });
      var params = requestQueue.shift();
      if (params.url.indexOf('postEvent') >= 0) {
        // alert(112);
        var fun = function () {
          // alert('requestQueue:'+JSON.stringify(requestQueue));
          // requestQueue.shift();
          storageFun("cbas_queue", requestQueue, true);
          // alert('cbas_queue:'+JSON.stringify(storageFun('cbas_queue')));
        };
        cbasRequire({
          url: params.url,
          async: params.async === false ? params.async : true,
          data: {
            content: encodeURIComponent(JSON.stringify(params.data))
          },
          getdata: fun,
          error: params.error
        });
        if (navigator.userAgent.match(/iphone|ipad/i)) {
          
        } else { 
          storageFun("cbas_queue", requestQueue, true);
        }
      } else {
        var successfun = function () {
          if (params.success) {
            params.success();
          }
        };
        var fun = function () {
          // requestQueue.shift();
          storageFun("cbas_queue", requestQueue, true);
        };
        cbasRequire({
          url: params.url,
          async: params.async === false ? params.async : true,
          data: {
            content: encodeURIComponent(JSON.stringify(params.data))
          },
          success: successfun,
          getdata: fun,
          error: params.error
        });
      }

    }
    // setTimeout(heartBeat, beatInterval);
  }

  /**
   * 添加cookie
   * @param [string]key     键名
   * @param [string]value   值
   * @param [number]exp     存在时间，单位是天
   */
  function createCookie(key, value, exp) {
    var date = new Date();
    date.setTime(date.getTime() + (exp * 24 * 60 * 60 * 1000));
    var expires = "; expires=" + expDate.toGMTString();
    document.cookie = key + "=" + value + expires + "; path=/";
  }

  /**
   * 读取cookie
   * @param [string]key 要读取的cookie的键名
   * @returns {*}       返回对应key的value值
   */
  function readCookie(key) {
    var nameEQ = key + "=";
    var ca = document.cookie.split(';');
    for (var i = 0, max = ca.length; i < max; i++) {
      var c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  /**
   * localstorage设置
   * @param [string]key           键名
   * @param [string]value         值
   * @param [boolean]storageOnly  是否只使用localStorage
   */
  function storageFun(key, value, storageOnly) {
    storageOnly = storageOnly || false;
    var isLsSupport = false, //是否支持locastorage
      data;
    if (typeof localStorage !== "undefined") {
      isLsSupport = true;
    }
    if (typeof value !== 'undefined' && value !== null) {
      if (typeof value === 'object') {
        value = JSON.stringify(value);
      }
      if (isLsSupport) {
        localStorage.setItem(key, value);
      } else if (!storageOnly) {
        createCookie(key, value, 30);
      }
    }
    if (typeof value === 'undefined') {
      if (isLsSupport) {
        data = localStorage.getItem(key);
      } else if (!storageOnly) {
        data = readCookie(key);
      }
      try {
        data = JSON.parse(data);
      } catch (e) {
        data = data;
      }

      return data;
    }
    if (value === null) {
      if (isLsSupport) {
        localStorage.removeItem(key);
      } else if (!storageOnly) {
        createCookie(key, '', -1);
      }
    }
  }

  /**
   * console.log再封装便于开启和关闭
   */
  function log() {
    if (debug && typeof console !== "undefined") {
      if (arguments[1] && typeof arguments[1] == "object") {
        arguments[1] = JSON.stringify(arguments[1]);
      }
      console.log(Array.prototype.slice.call(arguments).join(","));
    }
  }
  // return cbas;
})(window.cbas = window.cbas || {});
// export default window.cbas;