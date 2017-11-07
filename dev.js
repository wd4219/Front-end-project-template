
const fs = require('fs');
const path = require('path');
const stylus = require('stylus');
const sass = require('node-sass');
const postcss = require('postcss');
const autoprefixer = require('autoprefixer');
const option = JSON.parse(fs.readFileSync('.kaihu', 'utf-8'));
const file = require('./files');
const bs = require('browser-sync').create();

bs.init({
  server: path.join('.',option.html_path)
});

var timer  = null;
function compile() {
  if (option.stylus_path != '') {
    let styl_files = fs.readdirSync(__dirname + option.stylus_path).filter((f) => {
      return f.endsWith('.styl');
    });
    for (let f of styl_files) {
      stylus.render(fs.readFileSync(__dirname + option.stylus_path + '/' + f, 'utf-8'), function (err, css) {
        postcss([autoprefixer]).process(css).then(css=>{
          fs.writeFileSync(__dirname + option.css_path + '/' + f.replace('.styl', '.css'), css);
        })
      });
    }
  } else {
    if (option.scss_path != '') {
      // let scss_files = fs.readdirSync(__dirname + option.scss_path).filter((f) => {
      //   return f.endsWith('.scss');
      // });
      // for (let f of scss_files) {
      //   sass.render({
      //     file: __dirname + option.scss_path +'/' + f,
      //     outputStyle: 'compact'
      //   }, function (err, result) {
      //     if(err){
      //       console.log(err.message);
      //     }
      //     else{
      //       postcss([autoprefixer]).process(result.css.toString()).then(css=>{
      //         fs.writeFileSync(__dirname + option.css_path+ '/' + f.replace('.scss','.css'), css);
      //       })
      //     }
      //   });
      // }
      file.read_write_dir(option.scss_path,option.css_path,function(f,root){
         if(f.endsWith('.scss')){
          sass.render({
            file: __dirname + f,
            outputStyle: 'compact'
          }, function (err, result) {
            if(err){
              console.log(err.message);
            }
            else{
              postcss([autoprefixer]).process(result.css.toString()).then(css=>{
                fs.writeFileSync(__dirname + f.replace(option.scss_path.slice(1),option.css_path.slice(1)).replace('.scss','.css'), css);
              })
            }
          });
         }
      })
    }
  }
  
}
bs.watch("*.html").on("change", bs.reload);

bs.watch(path.join('.'+option.scss_path)+"/**/*.scss", function (event, file) {
    if (event === "change") {
      timer = setTimeout(function(){
        compile();
        bs.reload();
      },2000);
    }
});
bs.watch(path.join('.',option.stylus_path)+"/*.styl",function(event,file){
  if (event === "change") {
    timer = setTimeout(function(){
      compile();
      bs.reload();
    },2000);
  }
});

bs.watch(path.join('.',option.js_path)+"/*.js",bs.reload);
