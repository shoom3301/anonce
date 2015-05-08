/**
 * Created by Shoom on 07.05.15.
 */

var Player = function(scene, render, params){
    var th = this;

    this.position = {x: params.x || 0, y: params.y || 0};
    this.offsetX = params.offsetX || 0;
    this.offsetY = params.offsetY || 0;
    this.size = {w: params.width || 32, h: params.height || 32};
    this.scene = scene;
    this.ctx = this.scene.ctx;
    this.radius = params.radius;
    this.minSpeed = 4;
    this.maxSpeed = 20;
    this.hSpeed = this.minSpeed;
    this.vSpeed = this.minSpeed;
    this._render = render;
    this.vector = {
        horizontal: 0,
        vertical: 0
    };

    this.render = function(){
        this.gravitation();
        this._render();

    };
    this.checkMove = function(newpos){
        var moreRight = newpos.x+this.size.w > this.scene.size.w;
        var moreLeft = newpos.x-this.size.w+this.offsetX < 0;
        var moreBottom = newpos.y+this.size.h > this.scene.size.h;
        var moreUp = newpos.y+this.offsetY < this.size.h;
        var can = false;

        //var check = this.checkWalls(newpos);
        if(newpos.x != this.position.x){
            this.vector.horizontal = newpos.x-this.position.x>=0?'right':'left';
        }
        if(newpos.y != this.position.y){
            this.vector.vertical = newpos.y-this.position.y>0?'down':'up';
        }

        if(moreRight || moreLeft || moreBottom || moreUp){
            if(this.position.x+this.size.w<this.scene.size.w && moreRight){
                newpos.x = this.scene.size.w-this.size.w;
                can = true;
            }else if(this.position.x>0 && moreLeft){
                newpos.x = this.size.w-this.offsetX;
                can = true;
            }else if(this.position.y < this.scene.size.h && moreBottom){
                newpos.y = this.scene.size.h-this.size.h;
                can = true;
            }else if(this.position.y > this.size.h && moreUp){
                newpos.y = this.size.h-this.offsetY;
                can = true;
            }
            if(newpos.y+this.size.h > this.scene.size.h){
                newpos.y = this.scene.size.h-this.size.h;
                can = true;
            }
            if(newpos.y+this.size.h < this.size.h){
                newpos.y = this.size.h;
                can = true;
            }
        }else{
            can = true;
        }

        this.checkConflict(newpos);
        return can;
    };

    this.checkConflict = function(newpos){
        for(var v=0; v<this.scene.walls.length;v++){
            var wall = this.scene.walls[v];
            var overlap = RectsOverlap(newpos.x, newpos.y, this.size.w, this.size.h, wall[0], wall[1], this.scene.cellSize, this.scene.cellSize);
            if(overlap){
                var vertical = overlap.top || overlap.bottom;
                var horizontal = overlap.left || overlap.right;

                if(vertical>horizontal){
                    if(overlap.left){
                        if(this.vector.horizontal == 'right') newpos.x = wall[0]-this.size.w;
                    }else{
                        if(this.vector.horizontal == 'left') newpos.x = wall[0]+this.scene.cellSize;
                    }
                }else{
                    if(overlap.top){
                        if(this.vector.vertical == 'down') newpos.y = wall[1]-this.size.w;
                    }else{
                        if(this.vector.vertical == 'up') newpos.y = wall[1]+this.scene.cellSize;
                    }
                }
            }
        }
    };

    this.checkWalls = function(newpos){
        var overlaps = null;
        for(var v=0; v<this.scene.walls.length;v++){
            var wall = this.scene.walls[v];
            if(RectsOverlap(newpos.x, newpos.y, this.size.w, this.size.h, wall[0], wall[1], this.scene.cellSize, this.scene.cellSize)){
                overlaps = wall;
            }
        }
        if(overlaps){
            var brickYline = overlaps[1]+(this.scene.cellSize/2);
            var yoYline = this.position.y+(this.size.h/2);
            var brickXline = overlaps[0]+(this.scene.cellSize/2);
            var yoXline = this.position.x+(this.size.h/2);

            var top = yoYline <= brickYline;
            var left = yoXline <= brickXline;
            var ret = {x: newpos.x, y: newpos.y};

            if(top){
                ret.y = overlaps[1]-this.scene.cellSize;
            }else{
                this.stopJump();
                ret.y = overlaps[1]+this.scene.cellSize;
            }
            /*if(left){
                ret.x = overlaps[0];
            }else{
                ret.x = overlaps[0]+this.scene.cellSize;
            }*/
            return ret;
        }else{
            return newpos;
        }
    };

    this.doMove = function(){
        this.scene.on('keydown', function(char){
            var direction = '';
            switch (char){
                case 'w':
                    direction = 'top';
                    break;
                case 'a':
                    direction = 'left';
                    break;
                case 's':
                    direction = 'bottom';
                    break;
                case 'd':
                    direction = 'right';
                    break;
                case ' ':
                    th.jump();
                    break;
            }

            if(direction){
                if(direction == 'left' || direction == 'right'){
                    th.bindMove(direction);
                }
            }
        });

        this.scene.on('keyup', function(char){
            var direction = '';
            switch (char){
                case 'w':
                    direction = 'top';
                    break;
                case 'a':
                    direction = 'left';
                    break;
                case 's':
                    direction = 'bottom';
                    break;
                case 'd':
                    direction = 'right';
                    break;
            }

            if(direction){
                if(direction == 'left' || direction == 'right'){
                    th.bindMove(0);
                }
            }
        });
    };

    this.move = function(direction){
        var newpos = null;

        switch (direction){
            case 'top':
                newpos = {x: this.position.x, y: this.position.y-this.vSpeed};
                break;
            case 'left':
                newpos = {x: this.position.x-this.hSpeed, y: this.position.y};
                break;
            case 'bottom':
                newpos = {x: this.position.x, y: this.position.y+this.vSpeed};
                break;
            case 'right':
                newpos = {x: this.position.x+this.hSpeed, y: this.position.y};
                break;
        }

        if(newpos && this.checkMove(newpos)){
            this.position = newpos;
            return true;
        }

        return false;
    };

    this.bindedMoveX = null;
    this.bindedMoveXTimer = null;
    this.slowDown = false;

    this.bindMove = function(x, y){
        if(this.bindedMoveX != x && x!=0){
            this.unbindMove();
            this.bindedMoveX = x;
            this.bindedMoveXTimer = setInterval(function(){
                if(th.slowDown){
                    th.hSpeed -= 1.4;
                }else{
                    th.hSpeed += 1;
                }
                if(th.hSpeed < 0) th.hSpeed = 0;
                if(th.hSpeed > th.maxSpeed) th.hSpeed = th.maxSpeed;

                if(!th.move(th.bindedMoveX) || th.hSpeed <= 0){
                    th.unbindMove();
                }
            }, fps);
        }else{
            if(x==0) this.slowDown = true;
        }
    };

    this.unbindMove = function(){
        clearInterval(th.bindedMoveXTimer);
        th.bindedMoveX = null;
        th.hSpeed = th.minSpeed;
        th.slowDown = false;
    };

    this.inJump = false;
    this.jumpUpTimer = null;
    this.jumpDownTimer = null;
    this.jumpMaxHeight = 152;

    this.jump = function(){
        if(!this.inJump){
            this.inJump = true;
            var startHeight = th.position.y;
            th.vSpeed = 22;
            this.jumpUpTimer = setInterval(function(){
                var mv = th.move('top');
                th.vSpeed-=1;
                if(th.position.y-startHeight <= -th.jumpMaxHeight || !mv){
                    th.stopJump();
                }
            }, fps);
        }
    };

    this.stopJump = function(){
        clearInterval(this.jumpUpTimer);
        this.inJump = false;
        this.vSpeed = this.minSpeed;
    };

    this.gravitation = function(){
        if(!this.inJump){
            this.move('bottom');
            this.vSpeed += 1;
            if(this.vSpeed >= this.maxSpeed) this.vSpeed = this.maxSpeed;
        }
    };
};