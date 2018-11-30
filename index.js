const fs = require('fs-extra');
const path = require('path');
const express = require('express');
const markdown = require('markdown-it')('commonmark');
const glob = require('fast-glob');
const CONFIG = fs.readJSONSync('./server.config.json');
const dirTree = require('directory-tree');
const walker = require('walk');

let app = express();
let directory = {}; // Looks like { "fileName" : "path/to/fileName.md" }
// let fileTree = (() => {
//   let asdf  = walker.walk("./files");
//   asdf.on("file", (base, stats, next) => {

//     let cat = new Object(base.split(path.sep).pop())
//     Object.defineProperty(cat, )
//     availableFiles.categories.push()

//     next();
//   })
// });
// console.log(fileTree())
let fileTree = dirTree('./files');
if (fileTree.length !== fs.readJSONSync("./server.directory.json").length) {
  fs.writeFileSync('server.directory.json', fileTree)
}


app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/:subcategory', (req, res) => {
  return new Promise((resolve, reject) => {

    let subcategory = req.params.subcategory.toLowerCase();
    let targetFilePath = directory[subcategory];
    fs.readFile(targetFilePath).then((file) => {

      return res.json(markdown.render(file.toString()));
    }).catch(err => {
      console.error(err);
      return res.status(500).json(err);
    })
  })
})
app.get('/', (req, res) => {
  res.send(fs.readJSON('./server.config.json'))
})
// First, we find all the markdown files.
glob([`./${CONFIG.folder}/*.md`, `./${CONFIG.folder}/**/*.md`]).then(mdFilePaths => {
  mdFilePaths.forEach(file => {
    directory[path.basename(file, '.md')] = file; // Gets the file name
    // { "fileName" : "path/to/fileName.md" }
  });

  app.listen(CONFIG.port, () => {
    return console.log(`Listening on ${CONFIG.port}`);
  })

});