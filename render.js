const markdown = require("markdown-it");
const fs = require("fs-extra");
const glob = require("fast-glob");
const path = require("path");

// This makes sure there is a './src' folder.
if (fs.existsSync("./src") === false) {
    console.error("No src folder.");
    return process.exit();
}

let md = new markdown(); // Instantiate the Markdown file parser

// First, we find all the markdown files.
glob(["./src/*.md", "./src/**/*.md"]).then(mdFilePaths => {
    // Now we read them, and replace the '.md' extension with '.html'
    mdFilePaths.forEach(file => {

        // The markdown parser needs a string. readFileSync returns a Buffer. Turn it into a string.
        let markdownData = fs.readFileSync(file).toString();
        let htmlData = md.render(markdownData);
        // The markdown is now html.

        // The md file path looks like './src/whatever.md'
        // Make a path like: './output/whatever.html
        let htmlFilePath = makeOutputFilePath(file);

        fs.ensureDir('./output').then(() => {
            fs.outputFileSync(path.join("./output/", htmlFilePath), htmlData, {
                overwrite: true
            });
        })
    });
});

function makeOutputFilePath(filePath) {
    // First, get rid of the '.md' extension.
    let tempArr = filePath.split(".");
    tempArr.pop();

    if (tempArr[0] === "") {
        tempArr.shift(); // The period on './src' adds an extra element to the array.
    }

    let newPath = tempArr.toString() + ".html"; // Looks like '/src/**/whatever.html'
    let e = newPath.split('/').slice(2); // Gets rid of '/src/'

    return e.join('/');
};