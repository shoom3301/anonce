/**
 * Created by Shoom on 10.05.15.
 */

var Sprite = function(src, name, onload){
    this.img = new Image();
    this.img.src = src;
    this.name = name;
    var th = this;
    this.img.addEventListener('load', function(){
        onload.apply(th);
    });
};

var Cell = function(row,col,w,h,scene,data){
    this.row = row;
    this.col = col;
    this.width = w;
    this.height = h;
    this.x = this.col*this.width;
    this.y = this.row*this.height;
    this.scene = scene;

    this.destroy = function(){
        this.scene.matrix[this.row][this.col] = 0;
    };

    if(data.render){
        this.render = data.render;
    }else{
        this.render = function(){
            this.scene.ctx.drawImage(this.sprite, this.x, this.y)
        };
    }

    this.sprite = data.sprite;
    this.hardBlock = data.hardBlock || false;
    this._check = data.check;
    this.check = function(player){
        return this._check.apply(this, [player, this.colCheck(player)]);
    };

    this.colCheck = function(player) {
        var vX = (player.x + (player.width / 2)) - (this.x + (this.width / 2)),
            vY = (player.y + (player.height / 2)) - (this.y + (this.height / 2)),
            hWidths = (player.width / 2) + (this.width / 2),
            hHeights = (player.height / 2) + (this.height / 2),
            colDir = null;

        if (Math.abs(vX) < hWidths && Math.abs(vY) < hHeights) {
            var oX = hWidths - Math.abs(vX),
                oY = hHeights - Math.abs(vY);
            if (oX >= oY) {
                if (vY > 0) {
                    colDir = "t";
                    if(this.hardBlock) player.y += oY;
                } else {
                    colDir = "b";
                    if(this.hardBlock) player.y -= oY;
                }
            } else {
                if (vX > 0) {
                    colDir = "l";
                    if(this.hardBlock) player.x += oX;
                } else {
                    colDir = "r";
                    if(this.hardBlock) player.x -= oX;
                }
            }
        }
        return colDir;
    }
};