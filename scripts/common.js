'use strict';

var isAndroid = /Android/.test(window.navigator.userAgent);
var isHexin = navigator.userAgent.toLowerCase().indexOf('hexin') > -1;
var source = getParaByName('source');
if (isHexin) {  //修改大字体
  if (isAndroid) {
    callNativeHandler('webViewFontController', { 'fontsize': 0, 'switch': 0 }, function () { });
  } else {
    callNativeHandler('notifyWebHandleEvent', {
      'method': 'WebviewBounce',
      'params': {
        'bounce': 0 // 0：关闭，非0：开启
      }
    });
  }
}

function getParaByName(name) {
  var search = window.location.search;
  search = search.replace(/---/g, '&');
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

function clickStat(id,type,param) { //id为埋点,type 为类型分类跳转web页面和跳转客户端页面，web页面需要传param为目标页面地址
  if(type == 'url') {
    hxmJumpPageStat(id, '', {to_url: param});
  } else if('client') {
    hxmJumpNativeStat(id);
  } else {
    hxmClickStat(id);
  }
}


function pageStat(id) {
  hxmPageStat(id);
}

$(window).on('scroll', function () {
  //判断是否滚动到底部
  if ($(window).height() + $(this).scrollTop() === document.documentElement.scrollHeight) {
    if (isHexin) {
      // hxmEventStat(/*参数为滚动到底部埋点*/);
    }
  }
});