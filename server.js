var express = require('express');
var cors = require('cors');
var bodyParser = require('bodyParser');
var mongoose = require('mongoose');

var app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(express.static(__dirname + '/public'));



if (process.env.NODE_ENV === 'production') {
  console.log('Running in production mode');

  app.use('/static', express.static('static'));
} else {
  // When not in production, enable hot reloading

  var chokidar = require('chokidar');
  var webpack = require('webpack');
  var webpackConfig = require('./webpack.config.dev');
  var compiler = webpack(webpackConfig);
  app.use(require('webpack-dev-middleware')(compiler, {
    noInfo: true,
    publicPath: webpackConfig.output.publicPath
  }));
  app.use(require('webpack-hot-middleware')(compiler));

  // Do "hot-reloading" of express stuff on the server
  // Throw away cached modules and re-require next time
  // Ensure there's no important state in there!
  var watcher = chokidar.watch('./server');
  watcher.on('ready', function() {
    watcher.on('all', function() {
      console.log('Clearing /server/ module cache from server');
      Object.keys(require.cache).forEach(function(id) {
        if (/\/server\//.test(id)) delete require.cache[id];
      });
    });
  });
}

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/code42");
mongoose.connection.once('open', function(){
  console.log("MongoDB connected successfully");
});

// Render the index (from express.static folder)
app.get('/', function(req, res){
  res.render('index');
});

// Set node port from environment variable if available, else use 9797 for development
var httpPort = process.env.NODE_PORT || 9797;
app.listen(httpPort, function (err){
  if (err){
    return console.error(err);
  }
  else {
    console.log('Server is listening on port ' + httpPort);
  }
});
