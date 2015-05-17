/**
 * Created by Shoom on 16.05.15.
 */

var ws = require("nodejs-websocket");
var Room = require("./Room.js");
var Player = require("./Player.js");

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

                if(th.commands[command]) th.commands[command].apply(th, [socket, info.room, info.player, info.data]);
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
         * @param {String} id id игрока
         * @param {Object} data данные
         * */
        newPlayer: function(socket, room, id, data){
            var player = new Player(data.name, socket);
            //команды вызываются через метод apply, по этому this здесь используется правильно
            //noinspection JSPotentiallyInvalidUsageOfThis
            if(!this.rooms[room]){
                //noinspection JSPotentiallyInvalidUsageOfThis
                this.rooms[room] = new Room(room, player, 'level2');
                console.log('Room `'+room+'` created! Owner - '+player.name+'.');
            }
            //noinspection JSPotentiallyInvalidUsageOfThis
            this.rooms[room].addPlayer(player);
            player.init();
            return this;
        },
        /**
         * Удаление игрока
         * @param {Player} player игрок
         * */
        removePlayer: function(player){
            //noinspection JSPotentiallyInvalidUsageOfThis
            if(this.rooms[player.room.name]){
                //noinspection JSPotentiallyInvalidUsageOfThis
                player.room.removePlayer(player);

                //noinspection JSPotentiallyInvalidUsageOfThis
                if(player.room.owner.id == player.id){
                    //noinspection JSPotentiallyInvalidUsageOfThis
                    player.room.destroy();
                    //noinspection JSPotentiallyInvalidUsageOfThis
                    delete this.rooms[player.room.name];
                    //noinspection JSPotentiallyInvalidUsageOfThis
                    this.rooms[player.room.name] = null;
                    console.log('Room `'+player.room.name+'` destroyed!');
                }
            }
            return this;
        },
        /**
         * Координаты
         * @param {Object} socket соединение
         * @param {String} room имя комнаты
         * @param {String} id id игрока
         * @param {Object} data имя данные
         * */
        coors: function(socket, room, id, data){
            //noinspection JSPotentiallyInvalidUsageOfThis
            if(this.rooms[room]){
                //noinspection JSPotentiallyInvalidUsageOfThis
                var player = this.rooms[room].players[id];
                if(player) player.setCoors(data);
            }
            return this;
        },
        /**
         * Изменение матрицы
         * @param {Object} socket соединение
         * @param {String} room имя комнаты
         * @param {String} id id игрока
         * @param {Object} data имя данные
         * */
        changeMatrix: function(socket, room, id, data){
            //noinspection JSPotentiallyInvalidUsageOfThis
            var rm = this.rooms[room];
            if(rm){
                if(rm.matrixChanges[data.row] && rm.matrixChanges[data.row][data.col] == data.val){
                    if(rm.matrixChanges[data.row][data.col]){
                        rm.matrixChanges[data.row].remove(data.col);
                        if(rm.matrixChanges[data.row].length == 0){
                            rm.matrixChanges.remove(data.row);
                        }
                    }
                }else{
                    if(!rm.matrixChanges[data.row]){
                        rm.matrixChanges[data.row] = [];
                    }
                    rm.matrixChanges[data.row][data.col] = data.value;
                    rm.broadcast('matrixChange', {row: data.row, col: data.col, value: data.value}, rm.players[id]);
                }
            }
        }
    };
};

module.exports = App;