/**
 * Created by Shoom on 14.05.15.
 */

/**
 * Игра
 * @param {Scene} scene сцена игры
 * @param {Player} player ведущий игрок игры
 * @param {Array} levels уровни игры
 * */
var Game = function (scene, player, levels){
    //номер текущего уровеня
    this.currentLevel = 0;
    //текущий уровень
    this.level = null;
    //уровни игры
    this.levels = levels;
    //сцена
    this.scene = scene;
    //ведущий игрок
    this.player = player;
    //игроки
    this.players = [player];
    this.started = false;
    this.shadows = {};

    //игра
    var th = this;

    /**
     * Загрузка уровня
     * @param {Level} level уровень
     * */
    this.loadLevel = function (level) {
        level.afterWin = function () {
            th.eachPlayers(function(player){
                player.canRender = false;
            });

            setTimeout(function(){
                th.nextLevel(function () {
                    level = null;
                    th.loadLevel(this);
                });
            }, 2000);
        };

        level.afterLose = function () {
            th.eachPlayers(function(player){
                player.canRender = false;
            });

            setTimeout(function(){
                th.currentLevel--;
                th.nextLevel(function () {
                    level = null;
                    th.loadLevel(this);
                });
            }, 800);
        };

        this.scene.setLevel(level);

        this.eachPlayers(function(player){
            player.setLevel(level);
        });
    };

    /**
     * Запуск игры
     * */
    this.start = function () {
        this.started = true;

        function draw() {
            th.scene.ctx.save();
            th.scene.mapCenter(th.player);
            th.scene.clear();
            th.scene.level.drawMatrix();
            th.scene.level.render();

            th.eachPlayers(function(player){
                player.render();
            });

            for(var v in th.shadows){
                if(th.shadows.hasOwnProperty(v) && th.shadows[v]) th.shadows[v].render();
            }

            th.scene.ctx.restore();
            requestAnimationFrame(draw);
        }

        draw();
    };

    /**
     * Загрузка файла уровня
     * @param {String} name название уровня
     * @param {Function} cb callback загрузки уровня
     * */
    this.getLevel = function (name, cb) {
        include('levels/' + name + '.js?'+Date.now(), 'js', cb, function () {
            th.nextLevel(function(){
                th.loadLevel(this);
            }, 0);
        });
    };

    /**
     * Следующий уровень
     * @param {Function} cb callback загрузки уровня
     * @param {Number} index номер уровня
     * */
    this.nextLevel = function (cb, index) {
        //для тестирования уровней
        if(!this.levels){
            th.loadLevel(th.level);
            th.level.removeForRender(th.level.losePic);
            th.level.load();
            return false;
        }

        this.currentLevel++;
        if(typeof index != 'undefined') this.currentLevel = index;
        var levelName = this.levels[this.currentLevel];

        this.level = null;
        this.getLevel(levelName, function () {
            th.level = window[levelName].init(cb);
        });
    };

    /**
     * Добавление игрока на уровень
     * @param {Player} player игрок
     * */
    this.addPlayer = function(player){
        this.players.push(player);
        player.setLevel(this.level);
    };

    this.addShadow = function(name){
        this.shadows[name] = new Shadow(this.scene, this.level, {
            name: name
        });
    };

    this.removeShadow = function(name){
        delete this.shadows[name];
        this.shadows[name] = null;
    };

    /**
     * Перебор массива игроков
     * @param {Function} func callback
     * */
    this.eachPlayers = function(func){
        for (var i = 0; i < this.players.length; i++) {
            func.apply(this, [this.players[i]]);
        }
    };

    this.updateMatrix = function(matrix){
        for(var i=0; i<matrix.length;i++){

        }
    };
};