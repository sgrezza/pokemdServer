let path = require('path');
let fs = require('fs-extra');
let deepEqual = require('deep-equal');

let makeRegularCase = filename => {
    return (
        filename
            // insert a space before all caps
            .replace(/([A-Z])/g, ' $1')
            // uppercase the first character
            .replace(/^./, function(str) {
                return str.toUpperCase();
            })
    );
};

let getCategories = fileTree => {
    let dirFile = {
        categories: [] // {name: "Combat", subcategories: [{}]}
    };
    fileTree.children.forEach(folder => {
        // For each category...
        if (folder.type === 'file') return; // In case there's a top-level md file.
        let subcategories = [];
        folder.children.forEach(file => {
            let subcatName = path.basename(file.name, '.md');
            subcategories.push({
                name: makeRegularCase(subcatName), // 'thisWay' to 'This Way'
                url: subcatName
            });
        });
        dirFile.categories.push({ name: folder.name, subcategories });
    });
    return writeDirectoryFile(dirFile);
};

let writeDirectoryFile = async (categoryData) => {
    let oldDirFile = await fs.readJSON('./directory.json');
    if (deepEqual(oldDirFile, categoryData)) { // No new or deleted files...
        return; // Old directory file is fine. Don't do anything
    }
    return fs.outputJSON('./directory.js', categoryData)
}

module.exports = {
  getCategories
};
