'use strict';

var isAndroid = /Android/.test(window.navigator.userAgent);
var isHexin = navigator.userAgent.toLowerCase().indexOf('hexin') > -1;
var source = getParaByName('source');
if (isHexin) {
  if (isAndroid) {
    callNativeHandler('webViewFontController', { 'fontsize': 0, 'switch': 0 }, function () {});
  } else {
    callNativeHandler('notifyWebHandleEvent', {
      'method': 'WebviewBounce',
      'params': { 'bounce': 0 // 0：关闭，非0：开启
      } });
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

function clickStat(id) {
  if (isHexin) {
    if (source) {
      hxmClickStat(id + '_' + source + '}');
    }
    hxmClickStat(id);
  } else {
    idStat(id, '', '', 'ta');
    if (source) {
      idStat(countid + '_' + source, '', '', 'ta');
    }
  }
}

function pageStat(id) {
  if (isHexin) {
    hxmPageStat(id);
    if (source) {
      hxmPageStat(id + '_' + source);
    }
  } else {
    idStat(id, '', '', 'ta');
    if (source) {
      idStat(countid + '_' + source, '', '', 'ta');
    }
  }
}

$(window).on('scroll', function () {
  //判断是否滚动到底部
  if ($(window).height() + $(this).scrollTop() === document.documentElement.scrollHeight) {
    if (isHexin) {
      // hxmEventStat(/*参数为滚动到底部埋点*/);
    } else {
        // idStat(/*滚动到底部埋点*/,'', '', 'ta');
      }
  }
});