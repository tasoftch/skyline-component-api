
const pkg = require('./package.json');
const path = require('path');

const name = pkg.name;
module.exports = (env = {}) => {
    return {
        mode: env.development ? 'development' : 'production',

        entry: './src',
        output: {
            filename: `./${name}.min.js`,
            library: name,
            libraryTarget: 'umd',
            path: path.resolve(__dirname, 'Components/js')
        },
        module: {
            rules: [{
                test: /\.js$/,
                loader: 'babel-loader',
                include: /src/,
            }],
        }
    };
};