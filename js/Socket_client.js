/**
 * Created by Shoom on 14.05.15.
 */

var WSClient = function(url){
    var th = this;

    this.socket = new WebSocket(url);

    this.canSend = false;

    this.socket.onopen = function() {
        th.canSend = true;
    };

    this.socket.onclose = function(event) {
        if (event.wasClean) {
            console.log('Соединение закрыто чисто');
        } else {
            console.log('Обрыв соединения');
        }
    };

    this.socket.onmessage = function(event) {
        //console.log(event.data);
    };

    this.socket.onerror = function(error) {
        console.log(error.message);
    };

    this.send = function(data){
        if(this.canSend) this.socket.send(data);
    };
};