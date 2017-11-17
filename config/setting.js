// 目录相对于顶级目录，以下目录没有的可以传空
module.exports = {
  html_path:"/",  //html文件所在目录
  js_path:"/scripts",//js文件所在目录
  css_path:"/styles",//css文件所在目录
  stylus_path:"/stylus",//stylus 文件所在目录
  scss_path:"",//scss文件所在目录
  static_path:"/static",//静态文件所在目录可放置字体等
  image_path:"/images",//图片文件所在目录
  build_path:"/dist",//打包后的文件目录
  image_zip:"true",//是否压缩图片
  ignore:["\\node_modules","\\scss","\\stylus","\\dist","\\config","\\package.json","\\.gitignore","\\.git","\\package-lock.json","\\README.md"]//打包时忽略的文件
}
