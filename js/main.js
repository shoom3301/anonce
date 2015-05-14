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
        height: 32,
        name: 'yoba',
        controls: {
            jump: 87,
            right: 68,
            left: 65
        }
    });

    var player2 = new Player(scene, function () {
        this.ctx.drawImage(this.level.sprites.thorn, this.x, this.y);
    }, {
        radius: 16,
        offsetX: 32,
        offsetY: 32,
        width: 32,
        height: 32,
        name: 'yoba2',
        controls: {
            jump: 38,
            right: 39,
            left: 37
        }
    });

    //Игра
    window.game = new Game(scene, player, ['level1', 'level2']);

    //Запуск игры
    game.nextLevel(function(){
        game.loadLevel(this);
        game.start();
        game.addPlayer(player2);
    }, 0);
});