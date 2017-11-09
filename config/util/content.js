const path = require('path')
const fs = require('fs')


/**
 * 获取静态资源内容
 * @param  {object} req koa上下文
 * @param  {string} 静态资源目录在本地的绝对路径
 * @return  {string} 请求获取到的本地内容
 */
function content( req, fullStaticPath ) {

  // 封装请求资源的完绝对径
  let reqPath = path.join(fullStaticPath, req.url)
  // 判断请求路径是否为存在目录或者文件
  let exist = fs.existsSync( reqPath )

  // 返回请求内容， 默认为空
  let content = ''

  if( !exist ) {
    //如果请求路径不存在，返回404
    content = '404 Not Found! o(╯□╰)o！'
  } else {
    //判断访问地址是文件夹还是文件
    let stat = fs.statSync( reqPath )
    if( stat.isDirectory() ) {
      //如果为目录，则渲读取目录内容
      if(fs.existsSync(path.join(reqPath,'index.html'))){
        content = fs.readFileSync(path.join(reqPath,'index.html'));
        content = content.toString().replace(/<\/body>/, `<script src="/socket.io/socket.io.js"></script>
        <script>
          var socket = io('http://localhost:3000');
          socket.on('reload', function (data) {
            window.location.reload();
          });
          socket.on('disconnect',function(){
            console.log('和服务器断开了')
          })
        </script></body>`);
      }
      else{
        content = '404 Not Found! o(╯□╰)o！'
      }
    } else {
      if(reqPath.endsWith('.html')){
        content =  fs.readFileSync(reqPath);
        content = content.toString().replace(/<\/body>/, `<script src="/socket.io/socket.io.js"></script>
        <script>
          var socket = io('http://localhost:3000');
          socket.on('reload', function (data) {
            window.location.reload();
          });
          socket.on('disconnect',function(){
            console.log('和服务器断开了')
          })
        </script></body>`);
      }
      else if(fs.existsSync(path.join(reqPath,'.html'))){
        content =  fs.readFileSync(path.join(reqPath,'.html'));
        content = content.toString().replace(/<\/body>/, `<script src="/socket.io/socket.io.js"></script>
        <script>
          var socket = io('http://localhost:3000');
          socket.on('reload', function (data) {
            window.location.reload();
          });
          socket.on('disconnect',function(){
            console.log('和服务器断开了')
          })
        </script></body>`);
      }
      else{
        content =  fs.readFileSync(path.join(reqPath));
      }
    }
  }
  return content
}

module.exports = content