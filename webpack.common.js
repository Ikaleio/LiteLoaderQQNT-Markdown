const path = require("path");

const rendererProcessConfig = {
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
        filename: 'renderer.js',
        library: {
            type: 'module', // necessary in order to work with liteloader.
        },
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

const mainProcessConfig = {
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
    target: 'electron-main',
    entry: "./src/main.js",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: 'main.js',
        library: {
            type: 'commonjs', // necessary in order to work with liteloader.
        },
        chunkFormat: 'module', // or 'module'
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

module.exports = [rendererProcessConfig, mainProcessConfig];