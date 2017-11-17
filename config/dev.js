const fs = require('fs');
const path = require('path');
const stylus = require('stylus');
const sass = require('node-sass');
const postcss = require('postcss');
const autoprefixer = require('autoprefixer');
const option = require('./setting');
const file = require('./files');
const opn = require('opn');
const app = require('http').createServer(handler);
const io = require('socket.io')(app);
const content = require('./util/content')
const mimes = require('./util/mime')
const chokidar = require('chokidar');


app.listen(3000);
console.log("服务已启动，实时监听中...")
opn('http://localhost:3000')



function parseMime(url) {
  let extName = path.extname(url)
  extName = extName ? extName.slice(1) : 'unknown'
  return mimes[extName]
}

function handler(req, res) {
  let file_path = path.join(path.resolve(__dirname,'..'),option.html_path);
  let _content =  content( req, file_path )
    // 解析请求内容的类型
    let _mime = parseMime( req.url )
  
    // 如果有对应的文件类型，就配置上下文的类型
    if ( _mime ) {
      res.setHeader('Content-Type',_mime) 
    }
    // 输出静态资源内容
    if ( _mime && _mime.indexOf('image/') >= 0 ) {
      // 如果是图片，则用node原生res，输出二进制数据
      res.writeHead(200)
      res.write(_content, 'binary')
      res.end()
    } else {
      // 其他则输出文本
      res.write(_content)
      res.end();
    }
}

io.on('connection', function (socket) {
  if (option.scss_path != '') {
    chokidar.watch(path.join(path.resolve(__dirname, '..'),option.scss_path)).on('change',function (file_path, file) {
        clearTimeout(timer[1]);
        timer[1] = setTimeout(function () {
          compile();
          socket.emit('reload')
          socket.broadcast.emit('reload')
          console.log('已修改刷新浏览器中...')
        }, 2000);
      }
    );
  }
  if (option.stylus_path != '') {
    chokidar.watch(path.join(path.resolve(__dirname, '..'),option.stylus_path)).on('change',function (file_path, file) {
        clearTimeout(timer[1]);
        timer[1] = setTimeout(function () {
          compile();
          socket.emit('reload')
          socket.broadcast.emit('reload')
          console.log('已修改刷新浏览器中...')
        }, 2000);
      }
    );
  }
  if (option.stylus_path == '' && option.scss_path == '') {
    chokidar.watch(path.join(path.resolve(__dirname, '..') + option.css_path)).on('change',function (file_path, file) {
      clearTimeout(timer[1]);
      timer[1] = setTimeout(function () {
        socket.emit('reload')
        socket.broadcast.emit('reload')
        console.log('已修改刷新浏览器中...')
      }, 2000);
    })
  }
  chokidar.watch(path.join(path.resolve(__dirname, '..') + option.js_path)).on('change',function (file_path, file) {
    clearTimeout(timer[2]);
    timer[2] = setTimeout(function () {
      socket.emit('reload')
      socket.broadcast.emit('reload')
      console.log('已修改刷新浏览器中...')
    }, 2000);
  });
  chokidar.watch(path.join(path.resolve(__dirname, '..') + option.html_path)).on('change', function (file_path, file) {
    if(path.extname(file_path) == '.html' || path.extname(file_path)== '.htm'){
      clearTimeout(timer[0]);
      timer[0] = setTimeout(function () {
        console.log('已修改刷新浏览器中...')
        socket.emit('reload')
        socket.broadcast.emit('reload')
      }, 2000);
    }
  })
});

var timer = [null, null, null];

function compile() {
  if (option.stylus_path != '') {
    file.read_write_dir(option.stylus_path, option.css_path, function (f, root) {
      if (f.endsWith('.styl')) {
        stylus.render(fs.readFileSync(path.resolve(__dirname, '..') + f, 'utf-8'), function (err, css) {
          postcss([autoprefixer({
            browsers: ['Android > 4', 'iOS > 8']
          })]).process(css).then(css => {
            fs.writeFileSync(path.resolve(__dirname, '..') + f.replace(option.stylus_path.slice(1), option.css_path.slice(1)).replace('.styl', '.css'), css);
          })
        })
      }
    })
  } else {
    if (option.scss_path != '') {
      file.read_write_dir(option.scss_path, option.css_path, function (f, root) {
        if (f.endsWith('.scss')) {
          sass.render({
            file: path.resolve(__dirname, '..') + f,
            outputStyle: 'compact'
          }, function (err, result) {
            if (err) {
              console.log(err.message);
            } else {
              postcss([autoprefixer({
                browsers: ['Android > 4', 'iOS > 8']
              })]).process(result.css.toString()).then(css => {
                fs.writeFileSync(path.resolve(__dirname, '..') + f.replace(option.scss_path.slice(1), option.css_path.slice(1)).replace('.scss', '.css'), css);
              })
            }
          });
        }
      })
    }
  }
}
compile();