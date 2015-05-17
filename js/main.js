window.addEventListener('load', function () {
    //сцена
    var scene = new Scene({
        canvas: 'scene',
        view: {
            width: 840,
            height: 480
        }
    });

    //При клике на кнопку "присоединиться"
    $('#connect_to_room').click(function(){
        //Игрок
        var player = new Player(scene, function () {
            this.ctx.drawImage(this.level.sprites.yoba, this.x, this.y);
        }, {
            radius: 16,
            offsetX: 32,
            offsetY: 32,
            width: 32,
            height: 32,
            name: $('#my_name').val(),
            controls: {
                jump: 87,
                right: 68,
                left: 65
            }
        });

        //коннектимся к серверу
        player.connect('ws://178.89.214.206:25565', $('#room_name').val(), function(lvl, shadows, matrixChanges){
            window.game = new Game(scene, player);
            game.getLevel(lvl, function(){
                game.initConnection(lvl, player, shadows, matrixChanges);
            });
        });
    });
});