const path = require('path');

const transform = (src, filePath) => ({ code: `module.exports = ${JSON.stringify(path.basename(filePath))};` });

module.exports = {
    process: transform,
};
