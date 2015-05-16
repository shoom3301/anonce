/**
 * Created by Shoom on 16.05.15.
 */

var ws = require("nodejs-websocket");


var Room = function(name, owner, level){
    this.name = name;
    this.owner = owner;
    this.players = [];
    this.levelName = level;
    this.level = require('../levels/'+this.levelName+'.js');

    this.addPlayer = function(player){
        this.players.push(player);
        player.room = this;
        this.broadcast('newPlayer', {player: player.name}, player);
    };

    this.removePlayer = function(player){
        this.players.splice(this.players.indexOf(player), 1);
        this.broadcast('leavePlayer', {player: player.name});
        player = null;
    };

    this.getPlayer = function(name){
        for(var i=0; i<this.players.length; i++){
            if(this.players[i].name == name) return this.players[i];
        }
        return false;
    };

    this.eachPlayers = function(func){
        for(var i=0; i<this.players.length; i++){
            func.apply(this, [this.players[i]]);
        }
    };

    this.broadcast = function(command, data, plr){
        if(plr){
            this.eachPlayers(function(player){
                if(plr.name != player.name){
                    player.socket.sendText(JSON.stringify({
                        command: command,
                        data: data
                    }));
                }
            });
        }else{
            this.eachPlayers(function(player){
                player.socket.sendText(JSON.stringify({
                    command: command,
                    data: data
                }));
            });
        }
    };

    this.newCoors = function(player){
        this.broadcast('coors', {
            shadow: player.name,
            x: player.x,
            y: player.y
        }, player)
    };

    this.getShadows = function(plr){
        var res = [];
        this.eachPlayers(function(player){
            if(player.name != plr.name){
                res.push(player.name);
            }
        });
        return res;
    };

    this.destroy = function(){
        this.broadcast('roomOff');
    };
};

var Player = function(name, socket){
    this.name = name;
    this.socket = socket;
    this.room = null;
    this.x = 0.1;
    this.y = 0.1;

    socket.player = this;

    this.setCoors = function(coors){
        this.x = coors.x;
        this.y = coors.y;
        this.room.newCoors(this);
    };

    this.init = function(){
        this.socket.sendText(JSON.stringify({
            command: 'init',
            data: {
                level: this.room.levelName,
                shadows: this.room.getShadows(this)
            }
        }));
    };
};

var App = function(){
    this.rooms = {};

    this.createServer = function(){
        var th = this;
        this.server = ws.createServer(function (socket) {
            socket.on("text", function (str) {
                var info = JSON.parse(str);
                var command = info.command;

                if(th.commands[command]) th.commands[command].apply(th, [socket, th.rooms[info.room] || info.room, info.player, info.data]);
            });

            socket.on("close", function (code, reason) {
                if(socket.player) th.commands.removePlayer.apply(th, [socket.player]);
            });
        });

        this.server.listen(25565);
    };

    this.commands = {
        newPlayer: function(socket, room, name){
            socket.player = name;
            var player = new Player(name, socket);
            if(!this.rooms[room] && !room.name){
                this.rooms[room] = new Room(room, player, 'level2');
                this.rooms[room].addPlayer(player);
            }else{
                room.addPlayer(player);
            }
            player.init();
        },
        removePlayer: function(player){
            if(this.rooms[player.room]){
                this.rooms[player.room].removePlayer(player);

                if(this.rooms[player.room].owner.name == player.name){
                    this.rooms[player.room].destroy();
                    delete this.rooms[player.room];
                    this.rooms[player.room] = null;
                }
            }
        },
        coors: function(socket, room, name, data){
            var player = room.getPlayer(name);
            if(player) player.setCoors(data);
        }
    };
};

module.exports = App;