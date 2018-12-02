require('dotenv').config();
const fs = require('fs-extra');
const path = require('path');
const express = require('express');
const markdown = require('markdown-it')('commonmark');
const glob = require('fast-glob');
const yaml = require('js-yaml');
const dirTree = require('directory-tree');

const CONFIG = yaml.safeLoad(fs.readFileSync('./server.config.yaml'));
const IS_PROD = process.env.node_env === 'production' ? true : false;
const DIR_FILE = yaml.safeLoad(fs.readFileSync(`./${CONFIG.dirFolder}/${CONFIG.dirFile}`));

let app = express();
let directory = {}; // Looks like { "fileName" : "path/to/fileName.md" }
let fileTree = dirTree('./files');

// fs.remove(dirFile, (err) => {
//   fs.writeJSONSync(`./${CONFIG.dirFolder}/${CONFIG.dirFile}`, fileTree);
// });
// let previousDir = fs.readJSONSync(`./${CONFIG.dirFolder}/${CONFIG.dirFile}`);
// fs.writeJSONSync(`./${CONFIG.dirFolder}/${CONFIG.dirFile}`, fileTree);

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});
// app.use(express.static('./directory'));
app.get('/:subcategory', (req, res) => {
    return new Promise((resolve, reject) => {
        let subcategory = req.params.subcategory.toLowerCase();
        let targetFilePath = directory[subcategory];
        fs.readFile(targetFilePath)
            .then(file => {
                return res.json(markdown.render(file.toString()));
            })
            .catch(err => {
                console.error(err);
                return res.status(500).json(err);
            });
    });
});

app.get('/', (req, res) => {
    if (IS_PROD) {
        return res.send(DIR_FILE);
    }
    res.send(yaml.safeLoad(fs.readFileSync(`./${CONFIG.dirFolder}/${CONFIG.dirFile}`, 'utf-8')));
});

// First, we find all the markdown files.
glob([`./${CONFIG.folder}/*.md`, `./${CONFIG.folder}/**/*.md`]).then(mdFilePaths => {
    mdFilePaths.forEach(file => {
        directory[path.basename(file, '.md')] = file; // Gets the file name
        // { "fileName" : "path/to/fileName.md" }
    });
    app.listen(CONFIG.port, () => {
        return console.log(`Listening on ${CONFIG.port}`);
    });
});
