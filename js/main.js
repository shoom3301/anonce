window.addEventListener('load', function(){

    //матрица карты
    var matrix1 = [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,3,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,1,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,1,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,1,0,0,1,1,1,1,1,1,1,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,1],
        [1,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,5,5,0,1,0,1],
        [1,0,0,0,1,3,1,1,1,1,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,5,5,0,1,0,1],
        [1,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,1],
        [1,0,0,0,0,0,0,1,1,1,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,7,7,7,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ];

    //сцена
    var scene = new Scene({
        canvas: 'scene',
        cellSize: 32,
        matrix: matrix1,
        view: {
            width: 1000,
            height: 500
        },
        sprites: {
            yoba: 'images/yoba.png',
            wall: 'images/wall.png',
            passiveCells: 'images/default.png',
            gate_open: 'images/gate_open.png',
            gate_close: 'images/gate_close.png',
            thorn: 'images/thorn.png',
            bonus: 'images/bonus.png'
        },
        ready: function(){
            //Инициализируем активные блоки в матрице
            this.initMatrix({
                //стена
                1: {
                    name: 'wall',
                    sprite: this.sprites.wall,
                    hardBlock: true,
                    check: function(player, check){
                        if (check === "l" || check === "r") {
                            player.velX = 0;
                            player.jumping = false;
                        } else if (check === "b") {
                            player.grounded = true;
                            player.jumping = false;
                        } else if (check === "t") {
                            player.velY *= -1;
                        }
                    }
                },
                //бонус
                3: {
                    name: 'bonus',
                    sprite: this.sprites.bonus,
                    check: function(player, check){
                        if(check){
                            this.destroy();
                            player.bonusCount--;
                            if(player.bonusCount==0){
                                player.openGate();
                            }
                        }
                    }
                },
                //вороты выхода с уровня
                5: {
                    name: 'gate',
                    check: function(player, check){
                        if(check){
                            if(this.scene.gateIsOpen){
                                player.removeForRender(player.move);
                                player.removeForRender(player._render);
                                player.addForRender(player.win);
                            }
                        }
                    },
                    render: function(){
                        this.scene.ctx.drawImage(this.scene.sprites[this.scene.gateIsOpen?'gate_open':'gate_close'], this.x, this.y)
                    }
                },
                //колючка
                7: {
                    name: 'thorn',
                    sprite: this.sprites.thorn,
                    hardBlock: true,
                    check: function(player, check){
                        if (check === "l" || check === "r") {
                            player.velX = 0;
                            player.jumping = false;
                        } else if (check === "b") {
                            player.grounded = true;
                            player.jumping = false;
                        } else if (check === "t") {
                            player.velY *= -1;
                        }

                        if(check){
                            player.removeForRender(player.move);
                            player.removeForRender(player._render);
                            player.addForRender(player.lose);
                        }
                    }
                }
            });

            //Игрок
            var player = new Player(this, function(){
                this.ctx.drawImage(this.scene.sprites.yoba, this.x, this.y);
            }, {
                radius: 16,
                x: 32,
                y: 420,
                offsetX: 32,
                offsetY: 32,
                width: 32,
                height: 32,
                bonusCount: 6
            });

            //кадр
            function draw(){
                scene.ctx.save();
                scene.mapCenter(player);
                scene.clear();
                scene.drawMatrix();
                player.render();
                scene.ctx.restore();
                requestAnimationFrame(draw);
            }
            draw();
        }
    });
});