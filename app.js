import * as glob from "./src/global"
import * as configure from "./src/config";
import * as routing from "./src/routing";
import * as WebSocket from "./src/websocket";


var app = glob.app;
app = configure.applyConfig(app);
app = routing.applyRouting(app);
app = WebSocket.applyWebSocket(app);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports.app = app;

