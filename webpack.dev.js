const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');


// module.exports = merge(common, {
//     watch: true,
//     mode: 'development',
//     devtool: 'inline-source-map',
// });

const configs = common.map(function (config) {
    return merge(config, {
        watch: true,
        mode: 'development',
        devtool: 'inline-source-map',
    });
});

module.exports = configs;