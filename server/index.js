const static = require('node-static');
const http = require('http');

const file = new static.Server('./public');

http.createServer(function (request, response) {
    request.addListener('end', function () {
        file.serve(request, response);
    }).resume();
}).listen(process.env.PORT || 80);

Array.prototype.remove = function (i) {
    this.splice(this.indexOf(i), 1);
    return this;
};

var App = require('./App.js');

var app = new App(process.env.PORT || 8801);
app.createServer();

console.log('Server started!');
