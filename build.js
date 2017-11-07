const UglifyJS = require("uglify-js");
const fs = require('fs');
const path = require('path');
const CleanCSS = require('clean-css');
const babel = require('babel-core');
const file = require('./files');
const stylus = require('stylus');
const postcss = require('postcss');
const autoprefixer = require('autoprefixer');

const option = JSON.parse(fs.readFileSync('.kaihu', 'utf-8'));


function minify(f,root){
    if(f.endsWith('.min.js')){
      fs.writeFileSync(path.join(__dirname,root,f), fs.readFileSync(path.join(__dirname,f), "utf8"))
    }
    else{
      if(f.endsWith('.js')){
        fs.writeFileSync(path.join(__dirname,root,f).replace('.js', ".min.js"), UglifyJS.minify(babel.transform(fs.readFileSync(path.join(__dirname,f), "utf8"), {
          presets: ['es2015']
        }).code).code)
      }
    }
    if(f.endsWith('.min.css')){
      fs.writeFileSync(path.join(__dirname,root,f),fs.readFileSync(path.join(__dirname,f), "utf8"))
    }
    else{
      if(f.endsWith('.css')){
        fs.writeFileSync(path.join(__dirname,root,f).replace('.css', ".min.css"), new CleanCSS().minify(
          fs.readFileSync(path.join(__dirname,f), "utf8")).styles)
      }
    }
    if(f.endsWith('.html')|| f.endsWith('.htm')){
      fs.writeFileSync(path.join(__dirname,root,f),fs.readFileSync(__dirname+option.html_path+'/'+f,'utf-8').replace(/\.min\.css|\.css/g,'.min.css').replace(/\.min\.js|\.js/,'.min.js'))
    }
}

file.read_write_dir(option.html_path,option.build_path,function(f,root){
  minify(f,root);
},true);