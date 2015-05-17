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
    //запущена ли игра
    this.started = false;
    //тени (другие игроки по мультиплееру)
    this.shadows = {};
    //можно ли рендерить
    this.canDraw = true;

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
            if(th.canDraw){
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
        return this;
    };

    /**
     * Добавление игрока на уровень
     * @param {Player} player игрок
     * */
    this.addPlayer = function(player){
        this.players.push(player);
        player.setLevel(this.level);
    };

    /**
     * Добавление тени на уровень
     * @param {Array} shadow тень
     * */
    this.addShadow = function(shadow){
        if(!this.shadows[shadow[0]]){
            this.shadows[shadow[0]] = new Shadow(this.scene, this.level, {
                name: shadow[0],
                x: shadow[1],
                y: shadow[2]
            });
        }
    };

    /**
     * Удаление тени
     * @param {String} name имя тени
     * */
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

    /**
     * Инициализация соединения
     * @param {String} lvl уровень
     * @param {Player} player игрок
     * @param {Array} shadows тени
     * */
    this.initConnection = function(lvl, player, shadows){
        this.level = window[lvl].init(function(){
            th.loadLevel(this);
            th.start();
            player.canBroadcast = true;
        });

        for(var i=0; i<shadows.length; i++){
            this.addShadow(shadows[i]);
        }

        player.socket
            .on('newPlayer', function(data){
                th.addShadow(data.player);
            })
            .on('leavePlayer', function(data){
                th.removeShadow(data.player);
            })
            .on('coors', function(data){
                if(th.shadows[data.shadow]){
                    th.shadows[data.shadow].addCoors(data.x, data.y);
                }else{
                    th.addShadow(data.shadow);
                }
            })
            .on('roomOff', function(){
                th.canDraw = false;
                th.scene.clear();
            });

        return this;
    };
};