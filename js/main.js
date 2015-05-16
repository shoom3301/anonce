window.addEventListener('load', function () {
    //сцена
    var scene = new Scene({
        canvas: 'scene',
        view: {
            width: 840,
            height: 480
        }
    });

    $('#connect_to_room').click(function(){
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

        player.connect('ws://2.132.137.149:25565', $('#room_name').val(), function(lvl, shadows){
            window.game = new Game(scene, player);
            game.getLevel(lvl, function(){

                game.level = window[lvl].init(function(){
                    game.loadLevel(this);
                    game.start();
                    player.canBroadcast = true;
                });

                for(var i=0; i<shadows.length; i++){
                    game.addShadow(shadows[i]);
                }

                player.socket
                .on('newPlayer', function(data){
                    game.addShadow(data.player);
                })
                .on('leavePlayer', function(data){
                    game.removeShadow(data.player);
                })
                .on('coors', function(data){
                    if(game.shadows[data.shadow]){
                        game.shadows[data.shadow].addCoors(data.x, data.y);
                    }else{
                        game.addShadow(data.shadow);
                    }
                })
                .on('roomOff', function(){
                    game = null;
                });
            });
        });
    });
});