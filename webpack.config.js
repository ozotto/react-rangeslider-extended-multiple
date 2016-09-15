'use strict';

var path = require('path');
var webpack = require('webpack');
var merge = require('webpack-merge');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var TARGET = process.env.npm_lifecycle_event;
var ROOT_PATH = path.resolve(__dirname);
var COMPRESS = process.argv.indexOf('-p') >= 0;

var config;
var paths = {
	src: path.join(ROOT_PATH, 'src'),
	demo: path.join(ROOT_PATH, 'demo'),
};

var common = {
	entry: path.resolve(paths.demo, 'index'),

	resolve: {
		extensions: ['', '.js', '.scss'],
	}
};

if (TARGET === 'start' || !TARGET) {
	config = start();
} else if (TARGET === 'build' || !TARGET) {
	config = build();
} else if (TARGET === 'deploy' || !TARGET) {
	config = deploy();
}

function start() {
	const IP = '0.0.0.0';
	const PORT = 3000;

	return merge(common, {
		ip: IP,
		port: PORT,
		devtool: '#cheap-eval-source-map',

		entry: [
			'webpack-hot-middleware/client?http://' + IP + ':' + PORT,
			path.join(paths.demo, 'index'),
		],

		output: {
			path: __dirname,
			publicPath: '/static/',
			filename: 'bundle.js'
		},

		resolve: {
			alias: {
				'react-rangeslider-extended$': paths.src,
			},
		},

		module: {
			preLoaders: [
				{
					test: /\.js$/,
					loaders: ['eslint'],
					include: [paths.demo, paths.src],
				}
			],
			loaders: [
				{
        	test: /\.scss$/,
					exclude: /node_modules/,
					loaders: [
						'style', 
						'css',
						'autoprefixer-loader?browsers=last 3 versions',
						'sass-loader?outputStyle=expanded'
					],
				},
				{
					test: /\.js?$/,
					loaders: ['react-hot', 'babel?presets[]=es2015,presets[]=stage-0,presets[]=react',],
					include: [paths.demo, paths.src],
				},
			]
		},

		plugins: [
			new webpack.DefinePlugin({
				'process.env': {
					'NODE_ENV': JSON.stringify('development'),
				}
			}),
			new webpack.NoErrorsPlugin(),
			new webpack.HotModuleReplacementPlugin(),
		],
	});
}

function build() {
	return merge(common, {
		entry: path.resolve(paths.src, 'index'),

	  output: {
	  	path: __dirname + '/lib',
	  	library: 'ReactRangesliderExtendedMultiple',
	    libraryTarget: 'umd'
	  },

	  module: {
	    loaders: [
				{
        	test: /\.scss$/,
					exclude: /node_modules/,
					loader: ExtractTextPlugin.extract(
						'style-loader', 
						'css-loader!autoprefixer-loader?browsers=last 3 versions!sass-loader?outputStyle=' + (COMPRESS ? 'compressed' : 'expanded')
					),
				},
	      {
	        test: /\.js?$/,
	        exclude: /node_modules/,
	        loader: 'babel',
	        query: {
		        presets: ['es2015', 'stage-0', 'react'],
		      }
	      },
			],
	  },

    // Use the plugin to specify the resulting filename (and add needed behavior to the compiler)
    plugins: [
        new ExtractTextPlugin(COMPRESS ? 'styles.min.css' : 'styles.css'),
				new webpack.DefinePlugin({
					'process.env': {
						'NODE_ENV': JSON.stringify('production'),
					}
				}),
    ],

	  externals: [
	    {
	      "react": {
	        root: "React",
	        commonjs2: "react",
	        commonjs: "react",
	        amd: "react"
	      }
	    }
	  ]
	});
}

function deploy() {
	return merge(common, {
		entry: path.resolve(paths.demo, 'index'),

		output: {
			path: 'deploy',
			filename: 'bundle.js'
		},

		resolve: {
			alias: {
				'react-rangeslider-extended$': paths.src,
			},
		},

		module: {
	    loaders: [
	      {
	        test: /\.js?$/,
	        exclude: /node_modules/,
	        loaders: ['babel?stage=0'],
	      },
	      {
	        test: /\.scss$/,
	        exclude: /node_modules/,
	        loaders: ['style', 'css', 'sass']
	      }
	    ]
	  },

	  plugins: [
			new webpack.DefinePlugin({
				'process.env': {
					'NODE_ENV': JSON.stringify('production')
				}
			}),
	    new webpack.optimize.UglifyJsPlugin({
	      compress: {
					unused: true,
					dead_code: true,
	        warnings: false
	      }
	    }),
	    new webpack.optimize.OccurenceOrderPlugin()
	  ]
	});
}

module.exports = config;
