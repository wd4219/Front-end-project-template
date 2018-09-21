'use strict';

var isAndroid = /Android/.test(window.navigator.userAgent);
cbas.init({
  appkey: appkey,
  clientUrl: '/cbasums/ums/postClientData',
  activityUrl: '/cbasums/ums/postActivityLog'
});

function getParaByName(name) {
  var search = window.location.search;
  search = search.substr(1);
  if (typeof name === 'undefined') return search;
  var searchArr = search.split('&');
  for (var i = 0; i < searchArr.length; i++) {
    var searchStr = searchArr[i];
    searchArr[i] = searchStr.split('=');
    if (searchArr[i][0] == name) {
      return searchStr.replace(name + '=', '');
    }
  }
  return '';
}
function add_event(id, name) { //事件埋点
  cbas.add_event({
    data: {
      event_identifier: id,
      'event_name': name || '',
      ext_args: {}
    },
    url: '/cbasums/ums/postEvent'
  });
}

function pageStat(id) {  // 页面埋点
  cbas.reg_pagename(id);
}
function scrollBottom(arg) { //判断滚动到底部
  $(window).scroll(function () {
    if ($(window).scrollTop() >= $(document).height() - $(window).height()) {
      if (typeof arg == 'string') {
        add_event(arg);
      } else {
        arg();
      }
    }
  });
}
//checkLogin 会判断是否登录，callback为登录后的回调函数
function checkLogin(callback) {
  if (checkVersion('9.01.08', '6.00.00')) {
    var d = 'getData';
    var fun = 'javascript:AppCalBackFun(' + d + ')';
    var data = {
      info_type: 'hq',
      call_type: 'login', //login  调用登陆 fetch 查询登陆信息
      callback_url: fun
    };
    connectWebViewJavascriptBridge(function (bridge) {
      bridge.callHandler('getUserInfoByRsa', data, function (response) {
        if (response.param == "" || response.param == undefined || response.param == null) {//行情未登录

        } else {
          //行情已经登录，response为返回的客户信息，response.param为手机号
          uid = response.param;
          callback();
          localStorage.setItem('zs_app_l2_uid', response.param);
        }
      });
    });
  } else {
    if (/Android/.test(navigator.userAgent)) {
      var mobilePhone = window.demo.isLoginHQ(); //用户手机号
      if (mobilePhone.indexOf('{') == -1) {
        //老版本1
        if (mobilePhone == "" || mobilePhone == undefined || mobilePhone == null) {//行情未登录

        } else {
          //行情已经登录，response为返回的客户信息，mobilePhone手机号
          uid = mobilePhone;
          localStorage.setItem('zs_app_l2_uid', mobilePhone);
          callback();
        }
      } else {
        // 老版本2
        mobilePhone = eval('(' + mobilePhone + ')');
        var mobilePhone = mobilePhone.mobile_phone;
        if (mobilePhone == "" || mobilePhone == undefined || mobilePhone == null) {//行情未登录

        } else {
          //行情已经登录，response为返回的客户信息，mobilePhone手机号
          uid = mobilePhone;
          localStorage.setItem('zs_app_l2_uid', mobilePhone);
          callback();
        }
      }
    } else {
      connectWebViewJavascriptBridge(function (bridge) {
        bridge.callHandler('isLoginHQ', {}, function (response) {
          if (response.mobile_phone == "" || response.mobile_phone == undefined || response.mobile_phone == null) {//行情未登录

          } else {
            //行情已经登录，response为客户信息response.mobile_phone为手机号
            uid = response.mobilePhone;
            localStorage.setItem('zs_app_l2_uid', response.mobile_phone);
            callback();
          }
        });
      });
    }
  }
}