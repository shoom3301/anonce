/**
 * Created by Shoom on 07.05.15.
 */

/**
 * Сцена
 * @param {Object} params параметры сцены
 * */
var Scene = function(params){
    var th = this;

    //2D контекст
    this.ctx = document.getElementById(params.canvas).getContext('2d');

    //при нажатии клавиши
    window.addEventListener('keydown', function(e){
        for(var i=0; i<th._events.keydown.length; i++){
            th._events.keydown[i](String.fromCharCode(e.keyCode).toLowerCase(), e);
        }
    });

    //при отжатии клавиши
    window.addEventListener('keyup', function(e){
        for(var i=0; i<th._events.keyup.length; i++){
            th._events.keyup[i](String.fromCharCode(e.keyCode).toLowerCase(), e);
        }
    });

    //события сцены
    this._events = {
        'keydown': [],
        'keyup': []
    };

    /**
     * Биндинг события
     * @param {String} event название события
     * @param {Function} func callback события
     * */
    this.on = function(event, func){
        this._events[event].push(func);
        return this;
    };

    /**
     * Удаление бинда события
     * @param {String} event название события
     * @param {Function} func callback события
     * */
    this.off = function(event, func){
        this._events[event].remove(func);
        return this;
    };

    /**
     * Очистка сцены
     * */
    this.clear = function(){
        this.ctx.clearRect(0, 0, this.width, this.height);
    };

    /**
     * Стены на сцене
     * */
    this.walls = [];

    /**
     * Перебор матрицы
     * @param {Function} func функция итерации
     * */
    this.eachMatrix = function(func){
        for(var i=0; i<this.matrix.length; i++){
            var row = this.matrix[i];
            for(var v = 0; v<row.length; v++){
                var cell = row[v];
                func(cell, row, v, i);
            }
        }
    };

    /**
     * Инициализация матрицы
     * */
    this.initMatrix = function(){
        this.eachMatrix(function(cell, row, v, i){
            if(cell == 1){
                th.walls.push([v*th.cellSize, i*th.cellSize]);
            }
        });
    };

    /**
     * Рисование матрицы
     * */
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
        //Размер ячейки в матрице
        this.cellSize = params.cellSize;
    }

    if(params.matrix){
        //Матрица
        this.matrix = params.matrix;
        this.ctx.canvas.width = this.matrix[0].length*this.cellSize;
        this.ctx.canvas.height = this.matrix.length*this.cellSize;
    }

    //Высота сцены
    this.height = this.ctx.canvas.height;
    //Ширина сцены
    this.width = this.ctx.canvas.width;
};