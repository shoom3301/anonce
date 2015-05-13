window.addEventListener('load', function () {
    //сцена
    var scene = new Scene({
        canvas: 'scene',
        view: {
            width: 840,
            height: 480
        }
    });

    //Игрок
    var player = new Player(scene, function () {
        this.ctx.drawImage(this.level.sprites.yoba, this.x, this.y);
    }, {
        radius: 16,
        offsetX: 32,
        offsetY: 32,
        width: 32,
        height: 32
    });

    var game = {
        currentLevel: -1,
        level: null,
        levels: ['level1', 'level2'],
        scene: scene,
        player: player,
        players: [player],
        loadLevel: function (level) {
            level.afterWin = function(){
                game.nextLevel(function(){
                    game.loadLevel(this);
                });
            };

            level.afterLose = function(){
                game.currentLevel--;
                game.nextLevel(function(){
                    game.loadLevel(this);
                });
            };

            this.scene.setLevel(level);
            for (var i = 0; i < this.players.length; i++) {
                this.players[i].setLevel(level);
            }
        },
        start: function () {
            var th = this;

            function draw() {
                th.scene.ctx.save();
                th.scene.mapCenter(th.player);
                th.scene.clear();
                th.scene.level.drawMatrix();
                th.scene.level.render();

                th.scene.ctx.restore();
                requestAnimationFrame(draw);
            }

            draw();
        },
        getLevel: function(name, cb){
            include('levels/'+name+'.js', 'js', cb, function(){
                game.currentLevel = -1;
                game.nextLevel(function(){
                    game.loadLevel(this);
                });
            });
        },
        nextLevel: function(cb){
            game.level = null;
            game.currentLevel++;

            var levelName = game.levels[game.currentLevel];
            game.getLevel(levelName, function(){
                game.level = window[levelName](cb);
            });
        }
    };

    game.nextLevel(function(){
        game.loadLevel(this);
        game.start();
    });
});