/**
 * Created by Shoom on 14.05.15.
 */

var ws = require("nodejs-websocket");

var server = ws.createServer(function (socket) {
    socket.on("text", function (str) {
        console.log(str);
    });
    socket.on("close", function (code, reason) {
        console.log("Connection closed");
    });
});

server.listen(8001);

console.log('Server started! ');