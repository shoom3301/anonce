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

var Cell = function(row,col,w,h,scene){
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
};