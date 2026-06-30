const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
    fs.readdirSync(dir).forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            filelist = walkSync(filePath, filelist);
        } else {
            if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) filelist.push(filePath);
        }
    });
    return filelist;
};

const files = walkSync('d:\\\\Banking\\\\superadmin-frontend\\\\src');
let modifiedFiles = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;

    if (content.includes('http://localhost:4000')) {
        content = content.replace(/http:\/\/localhost:4000/g, '');
        modified = true;
    }

    if (modified) {
        if (content.includes("import axios from 'axios';")) {
            const relativeDir = path.relative(path.dirname(file), 'd:\\\\Banking\\\\superadmin-frontend\\\\src\\\\api');
            let importPath = path.join(relativeDir, 'axiosInstance').replace(/\\/g, '/');
            if (!importPath.startsWith('.')) importPath = './' + importPath;
            content = content.replace("import axios from 'axios';", `import axios from '${importPath}';`);
        } else if (content.includes('import axios from "axios";')) {
            const relativeDir = path.relative(path.dirname(file), 'd:\\\\Banking\\\\superadmin-frontend\\\\src\\\\api');
            let importPath = path.join(relativeDir, 'axiosInstance').replace(/\\/g, '/');
            if (!importPath.startsWith('.')) importPath = './' + importPath;
            content = content.replace('import axios from "axios";', `import axios from '${importPath}';`);
        }
        
        fs.writeFileSync(file, content);
        modifiedFiles++;
    }
});

console.log(`Modified ${modifiedFiles} files.`);
