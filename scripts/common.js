'use strict';

var source = getParaByName('source');

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

function clickStat(id) { //点击事件埋点
  idStat(id, '', '', 'ta');
  if (source) {
    idStat(countid + '_' + source, '', '', 'ta');
  }
}

function pageStat(id) { //页面埋点
  idStat(id, '', '', 'ta');
  if (source) {
    idStat(countid + '_' + source, '', '', 'ta');
  }
}

$(window).on('scroll', function () {
  //判断是否滚动到底部
  if ($(window).height() + $(this).scrollTop() === document.documentElement.scrollHeight) {
      idStat('page_ghhbax_hddb','', '', 'ta');
  }
});