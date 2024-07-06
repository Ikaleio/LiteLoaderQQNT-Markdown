const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');



const configs = common.map(function (config) {
    return merge(config, {
        watch: false,
        mode: 'production',
    });
});

module.exports = configs;