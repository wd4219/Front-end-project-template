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
    else if(f.endsWith('.js')){
      fs.writeFileSync(path.join(path.resolve(__dirname, '..'),root,f).replace('.js', ".min.js"), UglifyJS.minify(babel.transform(fs.readFileSync(path.join(path.resolve(__dirname, '..'),f), "utf8"), {
        presets: ['es2015']
      }).code).code)
    }
    else if(f.endsWith('.min.css')){
      fs.writeFileSync(path.join(path.resolve(__dirname, '..'),root,f),fs.readFileSync(path.join(path.resolve(__dirname, '..'),f), "utf8"))
    }
    else if(f.endsWith('.css')){
    postcss([autoprefixer({browsers:['Android > 4','iOS > 8']})]).process(fs.readFileSync(path.join(path.resolve(__dirname, '..'),f), "utf8")).then(css=>{
      fs.writeFileSync(path.join(path.resolve(__dirname, '..'),root,f).replace('.css', ".min.css"),new CleanCSS().minify(css.css).styles);
    })
    }
    else if(f.endsWith('.html')|| f.endsWith('.htm')){
      let file = fs.readFileSync(path.join(path.resolve(__dirname, '..'),f),'utf-8');
      let array = file.match(/<script(.*)>|<link(.*)>/g).filter(function(item){
       item =  item.replace(/(\s)*=(\s)*/g,'=');
        let file_path = item.match(/<(script|link) .*?(src|href)=\"(.+?)\"/)[3];
        return fs.existsSync(path.join(path.resolve(__dirname, '..'),file_path));
      })
      for(let i = 0;i < array.length;i++){
        file = file.replace(array[i],array[i].replace(/\.min\.js|\.js/g,'.min.js')).replace(/\.min\.css|\.css/g,'.min.css');
      }
      fs.writeFileSync(path.join(path.resolve(__dirname, '..'),root,f),file);
    }
    else if(f.endsWith('.png')||f.endsWith('.jpg')){
      if(option.image_zip == true){
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
      else{
        fs.writeFileSync(path.join(path.resolve(__dirname, '..'),root,f),fs.readFileSync(path.join(path.resolve(__dirname, '..'),f)))
      }
    }
    else{
      fs.writeFileSync(path.join(path.resolve(__dirname, '..'),root,f),fs.readFileSync(path.join(path.resolve(__dirname, '..'),f)))
    }
}
console.log('打包中，请稍后...')
file.read_write_dir(option.html_path,option.build_path,function(f,root){
  minify(f,root);
},true);

