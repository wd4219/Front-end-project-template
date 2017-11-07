const fs = require('fs');
const path = require('path');
const option = JSON.parse(fs.readFileSync('.kaihu', 'utf-8'));
/**
 * 同步删除文件夹
 * 
 * @param {any} delete_path 删除文件夹的地址
 */
exports.delete_dir = (delete_path)=>{
  let files = fs.readdirSync(delete_path);
  for(let f of files){
    let stats = fs.statSync(path.join(delete_path,f));
    if(stats.isFile()){
      fs.unlinkSync(path.join(delete_path,f))
    }
    if(stats.isDirectory()){
      this.delete_dir(path.join(delete_path,f));
    }
  }
  fs.rmdirSync(delete_path);
}

exports.read_dir = (read_path,cb)=>{
  if(fs.existsSync(read_path)){
  let files = fs.readdirSync(read_path);
  for(let f of files){
    let stats = fs.statSync(path.join(read_path,f));
    if(stats.isFile()){
      cb(path.join(read_path,f))
    }
    if(stats.isDirectory()){
      this.read_dir(path.join(read_path,f),cb);
    }
  }
  }
  else{
    console.log(read_path+"文件夹已存在")
  }
}

exports.read_write_dir = (read_path,write_path,cb,is_new)=>{
  if(!fs.existsSync(path.join(__dirname,write_path))){
   fs.mkdirSync(path.join(__dirname,write_path));
  }
  if(fs.existsSync(path.join(__dirname,read_path))){
    let files = fs.readdirSync(path.join(__dirname,read_path));
    for(let f of files){
      if(["\\node_modules","\\scss","\\stylus","\\dist","\\.babelrc","\\build.js","\\dev.js","\\files.js","\\.kaihu","\\package.json"].indexOf(path.join(read_path,f)) > -1){
        continue;
      }
      let stats = fs.statSync(path.join(__dirname,read_path,f));
      if(stats.isFile()){
        cb(path.join(read_path,f),write_path)
      }
      if(stats.isDirectory()){
        if(!fs.existsSync(path.join(__dirname,write_path,is_new?read_path:'',f))){
          fs.mkdirSync(path.join(__dirname,write_path,is_new?read_path:'',f));
        }
        this.read_write_dir(path.join(read_path,f),write_path,cb,is_new);
      }
    }
  }
  else{
    console.log(path.join(__dirname,read_path)+"文件夹已存在")
  }
}