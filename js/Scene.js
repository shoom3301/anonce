/**
 * Created by Shoom on 07.05.15.
 */

/**
 * Сцена
 * @param {Object} params параметры сцены
 * */
var Scene = function (params) {
    var th = this;

    //при нажатии клавиши
    window.addEventListener('keydown', function (e) {
        for (var i = 0; i < th._events.keydown.length; i++) {
            th._events.keydown[i](e.keyCode, e);
        }
    });

    //при отжатии клавиши
    window.addEventListener('keyup', function (e) {
        for (var i = 0; i < th._events.keyup.length; i++) {
            th._events.keyup[i](e.keyCode, e);
        }
    });

    //события сцены
    this._events = {
        'keydown': [],
        'keyup': []
    };

    //спрайты
    this.sprites = {};
    //callback при загрузке всех спрайтов
    this._ready = params.ready;
    //смещение сцены по X
    this.offsetX = 0;
    //смещение сцены по Y
    this.offsetY = 0;
    //открыты ли ворота выхода с уровня
    this.gateIsOpen = false;
    //смещение сцены по X
    this.activeCells = [];
    //фоновые ячейки
    this.passiveCells = [];

    /**
     * Биндинг события
     * @param {String} event название события
     * @param {Function} func callback события
     * */
    this.on = function (event, func) {
        this._events[event].push(func);
        return this;
    };

    /**
     * Удаление бинда события
     * @param {String} event название события
     * @param {Function} func callback события
     * */
    this.off = function (event, func) {
        this._events[event].remove(func);
        return this;
    };

    /**
     * Очистка сцены
     * */
    this.clear = function () {
        this.ctx.clearRect(0, 0, this.width + this.offsetX, this.height + this.offsetY);
    };

    /**
     * Перебор матрицы
     * @param {Function} func функция итерации
     * */
    this.eachMatrix = function (func) {
        for (var i = 0; i < this.matrix.length; i++) {
            var row = this.matrix[i];
            for (var v = 0; v < row.length; v++) {
                var cell = row[v];
                func.apply(this, [cell, row, v, i]);
            }
        }
    };

    /**
     * Инициализация матрицы
     * */
    this.initMatrix = function (data) {
        this.cells = data;
        this.eachMatrix(function (cell, row, v, i) {
            var cat = this.cells[cell];
            if (cat) {
                this.activeCells.push(new Cell(i, v, this.cellSize, this.cellSize, this, cat))
            } else {
                this.passiveCells.push([this.cellSize * v, this.cellSize * i]);
            }
        });
    };

    /**
     * Рисование матрицы
     * */
    this.drawMatrix = function () {
        for (var s = 0; s < this.passiveCells.length; s++) {
            this.ctx.drawImage(this.sprites.passiveCells, this.passiveCells[s][0], this.passiveCells[s][1])
        }
        for (var i = 0; i < this.activeCells.length; i++) {
            this.activeCells[i].render();
        }
    };

    /**
     * Центрирование карты относительно объекта
     * */
    this.mapCenter = function (obj) {
        var offsetX = obj.x + (obj.width / 2) - this.width / 2;
        var offsetY = obj.y + (obj.height / 2) - this.height / 2;

        if (offsetX < 0) offsetX = 0;
        if (offsetX > this.mapWidth - this.width) offsetX = this.mapWidth - this.width;

        if (offsetY < 0) offsetY = 0;
        if (offsetY > this.mapHeight - this.height) offsetY = this.mapHeight - this.height;

        this.offsetX = offsetX;
        this.offsetY = offsetY;

        this.ctx.translate(-this.offsetX, -this.offsetY);
    };

    /**
     * Callback готовности сцены
     * */
    this.ready = function () {
        //2D контекст
        this.ctx = document.getElementById(params.canvas).getContext('2d');

        if (params.cellSize) {
            //Размер ячейки в матрице
            this.cellSize = params.cellSize;
        }

        if (params.matrix) {
            //Матрица
            this.matrix = params.matrix;
            //Ширина карты
            this.mapWidth = this.matrix[0].length * this.cellSize;
            //Высота карты
            this.mapHeight = this.matrix.length * this.cellSize;
        }

        if (params.view) {
            //Видимая область карты
            this.view = params.view;
            this.ctx.canvas.width = this.view.width;
            this.ctx.canvas.height = this.view.height;
        }

        //Высота сцены
        this.height = this.ctx.canvas.height;
        //Ширина сцены
        this.width = this.ctx.canvas.width;

        this._ready();
    };

    /**
     * Заставка конца игры
     * */
    this.endScreen = function (text, fill) {
        this.ctx.fillStyle = fill;
        this.ctx.fillRect(0, 0, this.width + this.offsetX, this.height + this.offsetY);
        this.ctx.font = "32px Arial";
        this.ctx.fillStyle = "#ffffff";
        this.ctx.textAlign = "center";
        this.ctx.fillText(text, this.offsetX + (this.width / 2), this.offsetY + (this.height / 2));
    };

    this.debug = function(text){
        this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
        this.ctx.fillRect(this.width+this.offsetX, this.height+this.offsetY, 200, 50);
        this.ctx.font = "14px Arial";
        this.ctx.fillStyle = "#ffffff";
        this.ctx.textAlign = "right";
        this.ctx.fillText(text, this.width-200, this.offsetY+50);
    };

    //закрузка спрайтов
    if (params.sprites) {
        this.spritesInLoad = 0;
        for (var v in params.sprites) {
            if (params.sprites.hasOwnProperty(v)) {
                th.spritesInLoad++;
                new Sprite(params.sprites[v], v, function () {
                    th.spritesInLoad--;
                    th.sprites[this.name] = this.img;
                    if (th.spritesInLoad == 0) {
                        th.ready();
                    }
                });

            }
        }
    }
};