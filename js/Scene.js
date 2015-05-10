/**
 * Created by Shoom on 07.05.15.
 */

/**
 * Сцена
 * @param {Object} params параметры сцены
 * */
var Scene = function(params){
    var th = this;

    //при нажатии клавиши
    window.addEventListener('keydown', function(e){
        for(var i=0; i<th._events.keydown.length; i++){
            th._events.keydown[i](e.keyCode, e);
        }
    });

    //при отжатии клавиши
    window.addEventListener('keyup', function(e){
        for(var i=0; i<th._events.keyup.length; i++){
            th._events.keyup[i](e.keyCode, e);
        }
    });

    //события сцены
    this._events = {
        'keydown': [],
        'keyup': []
    };

    this.sprites = {};
    this._ready = params.ready;
    this.walls = [];
    this.items = [];
    this.gates = [];
    this.offsetX = 0;
    this.offsetY = 0;
    this.gateIsOpen = false;

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
    this.initMatrix = function(data){
        this.cellNames = data;
        this.eachMatrix(function(cell, row, v, i){
            if(cell == th.cellNames.wall){
                th.walls.push(new Cell(i, v, th.cellSize, th.cellSize, th));
            }else if(cell == th.cellNames.item ){
                th.items.push(new Cell(i, v, th.cellSize, th.cellSize, th));
            }else if(cell == th.cellNames.gate){
                th.gates.push(new Cell(i, v, th.cellSize, th.cellSize, th));
            }
        });
    };

    /**
     * Рисование матрицы
     * */
    this.drawMatrix = function(){
        this.eachMatrix(function(cell, row, v, i){
            switch (cell){
                case th.cellNames.wall:
                    th.ctx.drawImage(th.sprites.wall, v*th.cellSize, i*th.cellSize);
                    break;
                case th.cellNames.item:
                    th.ctx.drawImage(th.sprites.bonus, v*th.cellSize, i*th.cellSize);
                    break;
                case th.cellNames.gate:
                    th.ctx.drawImage(th.sprites[th.gateIsOpen?'gate_open':'gate_close'], v*th.cellSize, i*th.cellSize);
                    break;
                default:
                    th.ctx.drawImage(th.sprites.background, v*th.cellSize, i*th.cellSize);
                    break;
            }
        });
    };

    this.mapCenter = function(obj){
        var offsetX = obj.x+(obj.width/2)-this.centerX;
        var offsetY = obj.y+(obj.height/2)-this.centerY;

        if(offsetX<0) offsetX = 0;
        if(offsetX>this.maxXoffset) offsetX = this.maxXoffset;

        if(offsetY<0) offsetY = 0;
        if(offsetY>=this.maxYoffset) offsetY = this.maxYoffset;

        this.offsetX = offsetX;
        this.offsetY = offsetY;

        this.ctx.translate(-this.offsetX, -this.offsetY);
    };

    this.ready = function(){
        //2D контекст
        this.ctx = document.getElementById(params.canvas).getContext('2d');

        if(params.cellSize){
            //Размер ячейки в матрице
            this.cellSize = params.cellSize;
        }

        if(params.matrix){
            //Матрица
            this.matrix = params.matrix;
            this.mapWidth = this.matrix[0].length*this.cellSize;
            this.mapHeight = this.matrix.length*this.cellSize;
        }

        if(params.view){
            this.view = params.view;
            this.ctx.canvas.width = this.view.width;
            this.ctx.canvas.height = this.view.height;
        }

        //Высота сцены
        this.height = this.ctx.canvas.height;
        //Ширина сцены
        this.width = this.ctx.canvas.width;

        this.centerX = this.width/2;
        this.centerY = this.height/2;

        this.maxXoffset = this.mapWidth-this.width;
        this.maxYoffset = this.mapHeight-this.height;

        this._ready();
    };

    if(params.sprites){
        this.spritesInLoad = 0;
        for(var v in params.sprites){
            if(params.sprites.hasOwnProperty(v)){
                th.spritesInLoad++;
                new Sprite(params.sprites[v], v, function(){
                    th.spritesInLoad--;
                    th.sprites[this.name] = this.img;
                    if(th.spritesInLoad==0){
                        th.ready();
                    }
                });

            }
        }
    }
};