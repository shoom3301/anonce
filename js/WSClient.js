/**
 * Created by Shoom on 14.05.15.
 */

var WSClient = function(url, player){
    var th = this;

    this.player = player;
    this.canSend = false;
    this.events = {};
    this.socket = new WebSocket(url);

    this.socket.onopen = function() {
        th.canSend = true;
        th.trigger('connect');
    };

    this.socket.onclose = function(event) {
        th.trigger('close', event);
    };

    this.socket.onmessage = function(event) {
        var data = JSON.parse(event.data);
        if(data.command){
            th.trigger(data.command, data.data);
        }else{
            th.trigger('message', event.data);
        }
    };

    this.socket.onerror = function(error) {
        th.trigger('error', error);
    };

    this.send = function(command, data){
        this.socket.send((typeof data == 'string')?data:JSON.stringify({
            command: command,
            room: this.player.room,
            player: this.player.name,
            data: data || null
        }));
    };

    this.on = function(command, callback){
        if(!this.events[command]) this.events[command] = [];
        this.events[command].push(callback);
        return this;
    };

    this.off = function(command, callback){
        if(this.events[command]){
            this.events[command].remove(callback);
        }
        return this;
    };

    this.trigger = function(command, data){
        if(this.events[command]){
            for(var i=0; i<this.events[command].length; i++){
                this.events[command][i](data);
            }
        }
    };
};