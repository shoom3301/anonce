/**
 * Created by Shoom on 14.05.15.
 */


var App = require('./App.js');

var app = new App(25565);
app.createServer();

console.log('Server started!');