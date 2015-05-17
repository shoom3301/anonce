/**
 * Created by Shoom on 16.05.15.
 */

var ws = require("nodejs-websocket");

/**
 * Комната
 * @param {String} name название комнаты
 * @param {Player} owner владелец комнаты
 * @param {String} level название комнаты
 * */
var Room = function(name, owner, level){
    //название комнаты
    this.name = name;
    //владелец комнаты
    this.owner = owner;
    //игроки в комнате
    this.players = [];
    //название уровня
    this.levelName = level;
    //уровень
    this.level = require('../levels/'+this.levelName+'.js');

    /**
     * Добавление игрока в комнату
     * @param {Player} player игрок
     * */
    this.addPlayer = function(player){
        this.players.push(player);
        player.room = this;
        this.broadcast('newPlayer', {player: player.name}, player);
        return this;
    };

    /**
     * Удаление игрока из комнаты
     * @param {Player} player игрок
     * */
    this.removePlayer = function(player){
        this.players.splice(this.players.indexOf(player), 1);
        this.broadcast('leavePlayer', {player: player.name});
        player = null;
        return this;
    };

    /**
     * Получение игрока по имени
     * @param {String} name имя игрока
     * */
    this.getPlayer = function(name){
        for(var i=0; i<this.players.length; i++){
            if(this.players[i].name == name) return this.players[i];
        }
        return false;
    };

    /**
     * Перебор игроков
     * @param {Function} func обработчик итерации
     * */
    this.eachPlayers = function(func){
        for(var i=0; i<this.players.length; i++){
            func.apply(this, [this.players[i]]);
        }
        return this;
    };

    /**
     * Оповещение игроков
     * @param {String} command имя команды
     * @param {Object} data данные
     * @param {Player} plr игрок от которого исходит оповещение (его самого не обовещает)
     * */
    this.broadcast = function(command, data, plr){
        this.eachPlayers(function(player){
            if(!plr || plr.name != player.name){
                player.socket.sendText(JSON.stringify({
                    command: command,
                    data: data
                }));
            }
        });
        return this;
    };

    /**
     * Изменение координат игрока
     * @param {Player} player игрок у которого изменились координаты
     * */
    this.newCoors = function(player){
        this.broadcast('coors', {
            shadow: player.name,
            x: player.x,
            y: player.y
        }, player);
        return this;
    };

    /**
     * Получение списка игроков
     * @param {Player} plr игрок который получает список
     * */
    this.getShadows = function(plr){
        var res = [];
        this.eachPlayers(function(player){
            if(player.name != plr.name){
                res.push(player.name);
            }
        });
        return res;
    };

    /**
     * Удаление комнаты
     * */
    this.destroy = function(){
        this.broadcast('roomOff');
    };
};

/**
 * Игрок
 * @param {String} name имя игрока
 * @param {Object} socket ws соединение
 * */
var Player = function(name, socket){
    //имя
    this.name = name;
    //соединение
    this.socket = socket;
    //комната
    this.room = null;
    //x
    this.x = 0.1;
    //y
    this.y = 0.1;

    //назначаем соединению модель игрока
    socket.player = this;

    /**
     * Изменение координат игрока
     * @param {Object} coors координаты
     * */
    this.setCoors = function(coors){
        this.x = coors.x;
        this.y = coors.y;
        this.room.newCoors(this);
        return this;
    };

    /**
     * Инициализация игрока
     * */
    this.init = function(){
        this.socket.sendText(JSON.stringify({
            command: 'init',
            data: {
                level: this.room.levelName,
                shadows: this.room.getShadows(this)
            }
        }));
        return this;
    };
};

/**
 * Сервер-приложение
 * @param {Number} port порт на котором работает сервер
 * */
var App = function(port){
    //комнаты
    this.rooms = {};
    //ws сервер
    this.server = null;

    /**
     * Создание ws сервера
     * */
    this.createServer = function(){
        var th = this;
        this.server = ws.createServer(function (socket) {
            //при получении данных от клиента, вызываем соответствующую команду
            socket.on("text", function (str) {
                var info = JSON.parse(str);
                var command = info.command;

                if(th.commands[command]) th.commands[command].apply(th, [socket, th.rooms[info.room] || info.room, info.player, info.data]);
            });

            //при закрытии соединения удаляем игрока
            socket.on("close", function () {
                if(socket.player) th.commands.removePlayer.apply(th, [socket.player]);
            });
        });

        this.server.listen(port);
        return this;
    };

    /**
     * Команды которые может вызывать игрок
     * обработчик команды обычно принимает 4 параметра (socket, room, name, data)
     * */
    this.commands = {
        /**
         * Вход нового игрока в комнату
         * @param {Object} socket соединение
         * @param {String} room имя комнаты
         * @param {String} name имя игрока
         * */
        newPlayer: function(socket, room, name){
            socket.player = name;
            var player = new Player(name, socket);
            //команды вызываются через метод apply, по этому this здесь используется правильно
            //noinspection JSPotentiallyInvalidUsageOfThis
            if(!this.rooms[room] && !room.name){
                //noinspection JSPotentiallyInvalidUsageOfThis
                this.rooms[room] = new Room(room, player, 'level2');
                //noinspection JSPotentiallyInvalidUsageOfThis
                this.rooms[room].addPlayer(player);
            }else{
                room.addPlayer(player);
            }
            player.init();
            return this;
        },
        /**
         * Удаление игрока
         * @param {Player} player игрок
         * */
        removePlayer: function(player){
            //noinspection JSPotentiallyInvalidUsageOfThis
            if(this.rooms[player.room]){
                //noinspection JSPotentiallyInvalidUsageOfThis
                this.rooms[player.room].removePlayer(player);

                //noinspection JSPotentiallyInvalidUsageOfThis
                if(this.rooms[player.room].owner.name == player.name){
                    //noinspection JSPotentiallyInvalidUsageOfThis
                    this.rooms[player.room].destroy();
                    //noinspection JSPotentiallyInvalidUsageOfThis
                    delete this.rooms[player.room];
                    //noinspection JSPotentiallyInvalidUsageOfThis
                    this.rooms[player.room] = null;
                }
            }
            return this;
        },
        /**
         * Координаты
         * @param {Object} socket соединение
         * @param {String} room имя комнаты
         * @param {String} name имя игрока
         * @param {Object} data имя данные
         * */
        coors: function(socket, room, name, data){
            var player = room.getPlayer(name);
            if(player) player.setCoors(data);
            return this;
        }
    };
};

module.exports = App;