
const fs = require('fs');
const path = require('path');
const stylus = require('stylus');
const sass = require('node-sass');
const postcss = require('postcss');
const autoprefixer = require('autoprefixer');
const option = require('./setting');
const file = require('./files');
const bs = require('browser-sync').create();

bs.init({
  server: path.join('.',option.html_path)
});

var timer = [null,null,null];
function compile() {
  if (option.stylus_path != '') {
    file.read_write_dir(option.stylus_path,option.css_path,function(f,root){
      if(f.endsWith('.styl')){
        stylus.render(fs.readFileSync(path.resolve(__dirname, '..') + f, 'utf-8'), function (err, css) {
          postcss([autoprefixer({browsers:['Android > 4','iOS > 8']})]).process(css).then(css=>{
            fs.writeFileSync(path.resolve(__dirname, '..') + f.replace(option.stylus_path.slice(1),option.css_path.slice(1)).replace('.styl', '.css'), css);
          })
        })
      }
    })
  } else {
    if (option.scss_path != '') {
      file.read_write_dir(option.scss_path,option.css_path,function(f,root){
         if(f.endsWith('.scss')){
          sass.render({
            file: path.resolve(__dirname, '..') + f,
            outputStyle: 'compact'
          }, function (err, result) {
            if(err){
              console.log(err.message);
            }
            else{
              postcss([autoprefixer({browsers:['Android > 4','iOS > 8']})]).process(result.css.toString()).then(css=>{
                fs.writeFileSync(path.resolve(__dirname, '..') + f.replace(option.scss_path.slice(1),option.css_path.slice(1)).replace('.scss','.css'), css);
              })
            }
          });
         }
      })
    }
  }
}
compile();
bs.watch(path.join('.',option.html_path,"*.html"),function(event,file){
  clearTimeout(timer[0]);
  timer[0] = setTimeout(function(){
    bs.reload();
  },2000);
})
if(option.scss_path!= ''){
  bs.watch(path.join('.'+option.scss_path), function (event, file) {
    if (event === "change") {
      clearTimeout(timer[1]);
      timer[1] = setTimeout(function(){
        compile();
        bs.reload();
      },2000);
    }
});
}
if(option.stylus_path != ''){
  bs.watch(path.join('.',option.stylus_path),function(event,file){
    if (event === "change") {
      clearTimeout(timer[1]);
      timer[1] = setTimeout(function(){
        compile();
        bs.reload();
      },2000);
    }
  });
}
if(option.stylus_path == '' && option.scss_path == ''){
  bs.watch(path.join('.',option.css_path),function(event,file){
    clearTimeout(timer[1]);
    timer[1] = setTimeout(function(){
      bs.reload();
    },2000);
  })
}

bs.watch(path.join('.',option.js_path),function(event,file){
  clearTimeout(timer[2]);
  timer[2] = setTimeout(function(){
    bs.reload();
  },2000);
});

