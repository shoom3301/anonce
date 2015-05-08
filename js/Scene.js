/**
 * Created by Shoom on 07.05.15.
 */

var Scene = function(params){
    var th = this;

    this.ctx = document.getElementById(params.canvas).getContext('2d');

    window.addEventListener('keydown', function(e){
        for(var i=0; i<th._events.keydown.length; i++){
            th._events.keydown[i](String.fromCharCode(e.keyCode).toLowerCase(), e);
        }
    });

    window.addEventListener('keyup', function(e){
        for(var i=0; i<th._events.keyup.length; i++){
            th._events.keyup[i](String.fromCharCode(e.keyCode).toLowerCase(), e);
        }
    });

    this._events = {
        'keydown': [],
        'keyup': []
    };
    this.on = function(event, func){
        this._events[event].push(func);
        return this;
    };
    this.off = function(event, func){
        this._events[event].remove(func);
        return this;
    };

    this.clear = function(){
        this.ctx.clearRect(0, 0, this.size.w, this.size.h);
    };

    this.walls = [];

    this.eachMatrix = function(func){
        for(var i=0; i<this.matrix.length; i++){
            var row = this.matrix[i];
            for(var v = 0; v<row.length; v++){
                var cell = row[v];
                func(cell, row, v, i);
            }
        }
    };

    this.initMatrix = function(){
        this.eachMatrix(function(cell, row, v, i){
            if(cell == 1){
                th.walls.push([v*th.cellSize, i*th.cellSize]);
            }
        });
    };

    this.drawMatrix = function(){
        this.eachMatrix(function(cell, row, v, i){
            if(cell == 1){
                th.ctx.drawImage(wall, v*th.cellSize, i*th.cellSize);
            }else{
                th.ctx.drawImage(default_wall, v*th.cellSize, i*th.cellSize);
            }
        });
    };

    if(params.cellSize){
        this.cellSize = params.cellSize;
    }

    if(params.matrix){
        this.matrix = params.matrix;
        this.ctx.canvas.width = this.matrix[0].length*this.cellSize;
        this.ctx.canvas.height = this.matrix.length*this.cellSize;
    }

    this.size = {
        w: this.ctx.canvas.width,
        h: this.ctx.canvas.height
    };
};