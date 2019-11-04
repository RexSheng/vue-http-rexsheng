var path = require('path')
var webpack = require('webpack')
// var ExtractTextPlugin = require("extract-text-webpack-plugin")
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
    .BundleAnalyzerPlugin;
const packageInfo=require("./package.json")
module.exports = {
  entry: process.env.NODE_ENV === 'production'?'./src/lib/index.js':'./src/main.js',
  // entry: './src/lib/index.js',//资源入口文件
  output: {
    path: path.resolve(__dirname, './dist'),//打包输出目录
    publicPath: '/dist/',//公共资源路径
    filename: 'http.js',//输出的主文件
    library: 'vuehttprexsheng',//库名，此名称用于require('vuedialogrexsheng')
    libraryTarget: 'umd',//目标平台，libraryTarget会生成不同umd的代码,可以只是commonjs标准的，也可以是指amd标准的，也可以只是通过script标签引入的。
    umdNamedDefine: true,//会对 UMD 的构建过程中的 AMD 模块进行命名。否则就使用匿名的 define。
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          'css-loader'
        ],
      },      {
        test: /\.vue$/,
        loader: 'vue-loader',
         //打包速度优化RexSheng无明显效果
        include: [path.resolve(__dirname, 'src')],
        // exclude: process.env.NODE_ENV === 'production'?/node_modules\/core-js/:[],
        options: {
          // transformToRequire: {
          //     img: 'src',
          //     image: 'xlink:href',
          //     'source': 'src',
          // },
          // loaders: {
          //     css: ExtractTextPlugin.extract({
          //         use: 'css-loader',
          //         fallback: 'vue-style-loader'
          //     })
          // }
          // other vue-loader options go here
        }
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
          //打包速度优化RexSheng无明显效果
        include: [path.resolve(__dirname, 'src')],
        exclude: /node_modules/
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]?[hash]'
        }
      },
      {
          test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
          loader: 'file-loader',
          options: {
              limit: 10000,
              name: 'fonts/[name].[hash:7].[ext]'
          }
      }
    ]
    // .concat(process.env.NODE_ENV === 'production'?[]:[{
    //   test: /\.js$/,
    //   loader: 'babel-loader',
    //    //打包速度优化RexSheng无明显效果
    //   include: [path.resolve(__dirname, 'src')],
    //   exclude: /node_modules/
    // }]),
    
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    },
    extensions: ['*', '.js', '.vue', '.json'],
    //打包速度优化RexSheng有明显效果
    modules: [path.resolve(__dirname, 'src'),'node_modules'],
  },
  devServer: {
    historyApiFallback: true,
    noInfo: true,
    overlay: true,
    // host: '0.0.0.0',
    // port: 8080,
    progress:true,//Output running progress to console.
    clientLogLevel:"info",
    compress:true,
    publicPath:"/dist/",//请求根.js文件的路径
    //配置静态资源，默认是public下的static
    // contentBase: [path.join(__dirname, 'public'), path.join(__dirname, 'src'), path.join(__dirname, 'dist')],
    quiet: false,//只显示初始化信息，不显示error等
    // before: function(app, server) {//在其他请求之前执行的中间件
    //   app.get('/some/path', function(req, res) {
    //     res.json({ custom: 'response' });
    //   });
    // }
    proxy:{
      // '/api': 'http://localhost:newPort'
      //http://localhost:8080/datacenter/user==>> http://xconsole.rrslj.com/datacenter/user
      '/datacenter': {
        target: 'http://xconsole.rrslj.com',
        pathRewrite: {'^/api' : ''},//请求url不携带有/api
        changeOrigin:true,
        secure:false
        // bypass: function(req, res, proxyOptions) {
        //   if (req.headers.accept.indexOf('html') !== -1) {
        //     console.log('Skipping proxy for browser request.');
        //     return '/index.html';
        //   }
        // }
      },
      '/file': {
        target: 'http://49.234.192.99:8700',
        pathRewrite: {'^/file' : ''},//请求url不携带有/file
        changeOrigin:true,
        secure:false
        // bypass: function(req, res, proxyOptions) {
        //   if (req.headers.accept.indexOf('html') !== -1) {
        //     console.log('Skipping proxy for browser request.');
        //     return '/index.html';
        //   }
        // }
      },
      // proxy: [{
      //   context: ['/auth', '/api'],//多个路径代理
      //   target: 'http://localhost:3000',
      // }]
    }
  },
  performance: {
    hints: false
  },
  devtool: '#eval-source-map',
  // assetsSubDirectory: 'static',
  plugins:[new BundleAnalyzerPlugin()],
}

if (process.env.NODE_ENV === 'production') {
  module.exports.devtool = '#source-map'
  // module.exports.devtool = false
  // http://vue-loader.vuejs.org/en/workflow/production.html
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      compress: {
        warnings: false
      }
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    }),
    
    // new ExtractTextPlugin("style.css")
  ])
}
