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
            if(!this.rooms[room]){
                this.rooms[room] = new Room(room, player, data.level);
                console.log('Room `'+room+'` created! Owner - '+player.name+'.');
            }
            this.rooms[room].addPlayer(player);
            player.init();
            return this;
        },
        /**
         * Удаление игрока
         * @param {Player} player игрок
         * */
        removePlayer: function(player){
            if(this.rooms[player.room.name]){
                player.room.removePlayer(player);

                if(player.room.owner.id == player.id){
                    player.room.destroy();
                    delete this.rooms[player.room.name];
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
            if(this.rooms[room]){
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
         * @param {Object} data данные
         * */
        changeMatrix: function(socket, room, id, data){
            var rm = this.rooms[room];
            if(rm){
                var player = rm.players[id];
                var cells = rm.level.activeCells;
                for(var i=0; i<cells.length;i++){
                    if(cells[i].row == data.cell.row && cells[i].col == data.cell.col && cells[i].val() != data.value){
                        cells[i].val(data.value);
                        rm.broadcast('matrixChange', {row: data.cell.row, col: data.cell.col, value: data.value}, player);
                    }
                }
            }
        }
    };
};

module.exports = App;