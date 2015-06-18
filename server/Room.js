/**
 * Created by Shoom on 17.05.15.
 */

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
    this.level = require('../levels/'+this.levelName+'.js').init().load();
    //изменения матрицы
    this.matrixChanges = function(){
        return this.level.originalMatrix;
    };

    /**
     * Добавление игрока в комнату
     * @param {Player} player игрок
     * */
    this.addPlayer = function(player){
        this.players.push(player);
        player.room = this;
        player.id = this.players.length-1;
        player.x = this.level.playerPos[0];
        player.y = this.level.playerPos[1];
        this.broadcast('newPlayer', {player: [player.id, player.name, player.x, player.y]}, player);
        return this;
    };

    /**
     * Удаление игрока из комнаты
     * @param {Player} player игрок
     * */
    this.removePlayer = function(player){
        this.players.remove(player);
        this.broadcast('leavePlayer', {player: player.id});
        player = null;
        return this;
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
            if(!plr || plr.id != player.id){
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
            shadow: player.id,
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
            if(player.id != plr.id){
                res.push([player.id, player.name, player.x, player.y]);
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

module.exports = Room;