'use strict';

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

if (navigator.userAgent.toLowerCase().indexOf('hexin') > -1) {
  if (ins_config.platform == 'gphone') {
    callNativeHandler('webViewFontController', {
      'fontsize': 0,
      'switch': 0
    }, function() {});
  }
}
function scrollBottom(arg) {
  $(window).scroll(function () {
    if ($(window).scrollTop() >= $(document).height() - $(window).height()) {
      console.log('到底了');
    }
  });
}

//获取ios 版本号
function getIosVersion() {
  var str = navigator.userAgent.toLowerCase();
  var ver = str.match(/cpu iphone os (.*?) like mac os/);
  if (ver) return ver[1].replace(/_/g, ".");
  return '';
}

function setTitle() {
  $('.title-bar .title').text($('title').text());
}
setTitle();

$('.title-bar img').on('click', function () {
  if (window.location.href.indexOf('index.html') > -1 || window.location.href.indexOf('.html') == -1) {
    window.location.href = '?action=exit_html';
  }else if(window.location.href.indexOf('mytactic.html') > -1) {
    window.location.href = './index.html';
  }
  else {
    history.go(-1);
  }
});