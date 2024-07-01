const path = require("path");
module.exports = {

    watch: false,
    mode: 'production',

    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src"),
        }
    },
    experiments: {
        outputModule: true,
    },
    target: 'electron-renderer',
    entry: "./src/renderer.jsx",
    output: {
        path: path.resolve(__dirname, "dist"),
        library: {
            type: 'module',
        },
        filename: 'renderer.js',
    },
    module: {
        rules: [
            {
                test: /.(js|jsx)$/,
                include: path.resolve(__dirname, "src"),
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: [
                            '@babel/preset-env',
                            '@babel/react',
                        ],
                    }
                },
            },
        ],
    },
};