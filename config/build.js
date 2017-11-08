const UglifyJS = require("uglify-js");
const fs = require('fs');
const path = require('path');
const CleanCSS = require('clean-css');
const babel = require('babel-core');
const file = require('./files');
const stylus = require('stylus');
const postcss = require('postcss');
const autoprefixer = require('autoprefixer');
const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');
const option = require('./setting');

function minify(f,root){
    if(f.endsWith('.min.js')){
      fs.writeFileSync(path.join(path.resolve(__dirname, '..'),root,f), fs.readFileSync(path.join(path.resolve(__dirname, '..'),f), "utf8"))
    }
    else{
      if(f.endsWith('.js')){
        fs.writeFileSync(path.join(path.resolve(__dirname, '..'),root,f).replace('.js', ".min.js"), UglifyJS.minify(babel.transform(fs.readFileSync(path.join(path.resolve(__dirname, '..'),f), "utf8"), {
          presets: ['es2015']
        }).code).code)
      }
    }
    if(f.endsWith('.min.css')){
      fs.writeFileSync(path.join(path.resolve(__dirname, '..'),root,f),fs.readFileSync(path.join(path.resolve(__dirname, '..'),f), "utf8"))
    }
    else{
      if(f.endsWith('.css')){
          postcss([autoprefixer({browsers:['Android > 4','iOS > 8']})]).process(fs.readFileSync(path.join(path.resolve(__dirname, '..'),f), "utf8")).then(css=>{
            fs.writeFileSync(path.join(path.resolve(__dirname, '..'),root,f).replace('.css', ".min.css"),new CleanCSS().minify(css.css).styles);
          })
      }
    }
    if(f.endsWith('.html')|| f.endsWith('.htm')){
      fs.writeFileSync(path.join(path.resolve(__dirname, '..'),root,f),fs.readFileSync(path.resolve(__dirname, '..')+option.html_path+'/'+f,'utf-8').replace(/\.min\.css|\.css/g,'.min.css').replace(/\.min\.js|\.js/,'.min.js'))
    }
    if(f.endsWith('.png')||f.endsWith('.jpg')){
      imagemin([path.join(path.resolve(__dirname, '..'),f)], path.join(path.resolve(__dirname, '..'),root,path.dirname(f)), {
        plugins: [
            imageminJpegtran(),
            imageminPngquant({quality: '40'})
        ]
      }).then(files => {
        files.forEach(function(item){
          fs.writeFileSync(item.path,item.data);
        });
      });
    }
}
console.log('打包中，请稍后...')
file.read_write_dir(option.html_path,option.build_path,function(f,root){
  minify(f,root);
},true);

