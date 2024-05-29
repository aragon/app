const path = require('path');

const transform = (src, filePath) => {
    const fileName = path.basename(filePath);

    // Simply exports unsupported Jest assets as a string containining their file name.
    // (see https://jestjs.io/docs/code-transformation#transforming-images-to-their-path)
    if (path.extname(filePath) !== '.svg') {
        return { code: `module.exports = "${fileName}";` };
    }

    // Mock NextJs behaviour of determining the width and height property of local imported images.
    // (see https://nextjs.org/docs/app/building-your-application/optimizing/images#local-images)
    const code = `module.exports = { src: "${filePath}", height: 10, width: 10 };`;

    return { code };
};

module.exports = {
    process: transform,
};
