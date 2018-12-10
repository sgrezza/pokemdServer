require('dotenv').config();
const fs = require('fs-extra');
const path = require('path');
const express = require('express');
const markdown = require('markdown-it')('commonmark');
const glob = require('fast-glob');
const yaml = require('js-yaml');
const dirTree = require('directory-tree');
const helmet = require('helmet');
const getCategories = require('./dir.js').getCategories;

const CONFIG = yaml.safeLoad(fs.readFileSync('./server.config.yaml'));
const IS_PROD = process.env.node_env === 'production' ? true : false;
const DIR_FILE = fs.readJSONSync(CONFIG.directoryPath, { throws: false });

let app = express();
app.use(helmet());
let directory = {}; // Looks like { "fileName" : "path/to/fileName.md" }

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.get('/:subcategory', (req, res) => {
    // return new Promise((resolve, reject) => {
    let subcategory = req.params.subcategory;
    let targetFilePath = directory[subcategory];
    if (targetFilePath === undefined) {
        return res.status(404).send('Page not found :(');
    }
    fs.readFile(targetFilePath)
        .then(file => {
            return res.json(markdown.render(file.toString()));
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json(err);
        });
    // });
});

app.get('/', (req, res) => {
    if (IS_PROD) {
        // So it doesn't re-render a dir file every request.
        return res.send(DIR_FILE);
    }
    fs.readFile(CONFIG.directoryPath, 'utf-8')
        .then(file => {
            res.send(file);
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Error getting categories.');
        });
});

let initProcesses = [// These should run before listening.
    // First, we find all the markdown files.
    glob([`./${CONFIG.src}/*.md`, `./${CONFIG.src}/**/*.md`]).then(mdFilePaths => {
        mdFilePaths.forEach(file => {
            // Then we make directory object
            directory[path.basename(file, '.md')] = file; // Gets the file name
            // { "fileName" : "path/to/fileName.md" }
        });
    }),
    getCategories(dirTree(CONFIG.src))
];

Promise.all(initProcesses).then(() => {
    app.listen(process.env.PORT, () => {
        return console.log(`Listening on ${process.env.PORT}`);
    });
});
