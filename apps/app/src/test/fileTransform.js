const path = require('node:path');

const transform = (_src, filePath) => {
    const fileName = path.basename(filePath);

    // Simply exports unsupported Jest assets as a string containining their file name.
    // (see https://jestjs.io/docs/code-transformation#transforming-images-to-their-path)
    // JSON.stringify escapes the path, whose backslashes on Windows would otherwise read as escapes.
    if (path.extname(filePath) !== '.svg') {
        return { code: `module.exports = ${JSON.stringify(fileName)};` };
    }

    // Mock NextJs behaviour of determining the width and height property of local imported images.
    // (see https://nextjs.org/docs/app/building-your-application/optimizing/images#local-images)
    const code = `module.exports = { src: ${JSON.stringify(filePath)}, height: 10, width: 10 };`;

    return { code };
};

module.exports = {
    process: transform,
};
