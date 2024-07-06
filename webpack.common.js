const path = require("path");
module.exports = {
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src"),
        },
        // Explicitly resolve files with following extension as modules.
        extensions: ['', '.js', '.jsx', '.ts', '.tsx'],
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
                            '@babel/preset-react',

                        ],
                    }
                },
            },
            {
                test: /.(ts|tsx)$/,
                include: path.resolve(__dirname, "src"),
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: [
                            '@babel/preset-typescript',
                            '@babel/preset-react',
                        ],
                    }
                },
            },
        ],
    },
};