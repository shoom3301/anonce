/**
 * Created by Shoom on 13.05.15.
 */

var Level = function(matrix, cellConstructors, params, onload){
    //сцена
    this.scene = null;
    //сокращение для 2d контекста
    this.ctx = null;
    //матрица
    this.matrix = matrix;
    //Оригинальная матрица
    this.originalMatrix = JSON.parse(JSON.stringify(matrix));
    //открыты ли ворота выхода с уровня
    this.gateIsOpen = false;
    //смещение сцены по X
    this.activeCells = [];
    //фоновые ячейки
    this.passiveCells = [];
    //Кол-во бонусов на карте
    this.bonusCount = 0;
    //Стартовые координаты игрока
    this.playerPos = [0,0];
    //Размер ячейки в матрице
    this.cellSize = params.cellSize;
    //Ширина карты
    this.width = this.matrix[0].length * this.cellSize;
    //Высота карты
    this.height = this.matrix.length * this.cellSize;
    //Конструкторы для создания ячеек
    this.cellConstructors = cellConstructors;
    this.sprites = {};

    this.forRender = [];

    /**
     * Рендеринг игрока
     * */
    this.render = function(){
        for(var i=0; i<this.forRender.length; i++){
            this.forRender[i].apply(this.forRender[i].contxt || this);
        }
        return this;
    };

    /**
     * Добавить функцию к рендерингу
     * @param {Function} func функция рендеринга
     * @param {Object} contxt контекст в котором будет вызываться функция
     * */
    this.addForRender = function(func, contxt){
        if(contxt) func.contxt = contxt;
        this.forRender.push(func);
        return this;
    };

    /**
     * Удаление функции из рендеринга
     * @param {Function} func функция рендеринга
     * */
    this.removeForRender = function(func){
        this.forRender.remove(func);
        return this;
    };

    /**
     * Перебор матрицы
     * @param {Function} func функция итерации
     * */
    this.eachMatrix = function (func) {
        for (var i = 0; i < this.originalMatrix.length; i++) {
            var row = this.originalMatrix[i];
            for (var v = 0; v < row.length; v++) {
                var cell = row[v];
                func.apply(this, [cell, row, v, i]);
            }
        }
    };

    /**
     * Рисование матрицы
     * */
    this.drawMatrix = function () {
        for (var s = 0; s < this.passiveCells.length; s++) {
            var x = this.passiveCells[s][0];
            var y = this.passiveCells[s][1];
            if(this.cellIsVisible({x: x, y: y})){
                this.ctx.drawImage(this.sprites.passiveCells, x, y)
            }
        }
        for (var i = 0; i < this.activeCells.length; i++) {
            this.activeCells[i].render();
        }
    };

    /**
     * Нужно ли рисовать ячейку на карте (если она в зоне видимости)
     * @param cell {Object|Cell} ячейка
     * @return {Boolean} находится ли ячейка в зоне видимости
     * */
    this.cellIsVisible = function(cell){
        return cell.x+this.cellSize > this.scene.offsetX &&
            cell.x < this.scene.offsetX+this.scene.width &&
            cell.y+this.cellSize > this.scene.offsetY &&
            cell.y < this.scene.offsetY+this.scene.height;
    };

    /**
     * Открытие ворот к выходу
     * */
    this.openGate = function(){
        this.gateIsOpen = true;
    };

    /**
     * Заставка конца игры
     * */
    this.endScreen = function (text, fill) {
        this.ctx.fillStyle = fill;
        this.ctx.fillRect(0, 0, this.scene.width + this.scene.offsetX, this.scene.height + this.scene.offsetY);
        this.ctx.font = "32px Arial";
        this.ctx.fillStyle = "#ffffff";
        this.ctx.textAlign = "center";
        this.ctx.fillText(text, this.scene.offsetX + (this.scene.width / 2), this.scene.offsetY + (this.scene.height / 2));
    };

    /**
     * Инициализация матрицы и загрузка уровня
     * */
    this.load = function (){
        this.gateIsOpen = false;
        this.activeCells = [];
        this.passiveCells = [];
        this.bonusCount = 0;
        this.playerPos = [0,0];

        for(var v in this.cellConstructors){
            if(this.cellConstructors.hasOwnProperty(v)){
                this.cellConstructors[v].sprite = this.sprites[this.cellConstructors[v].name];
            }
        }

        this.eachMatrix(function (cell, row, v, i){
            if (this.cellConstructors[cell]){
                if (this.cellConstructors[cell] == 'player'){
                    this.playerPos[0] = this.cellSize * v;
                    this.playerPos[1] = this.cellSize * i;
                    this.passiveCells.push([this.cellSize * v, this.cellSize * i]);
                }else{
                    this.activeCells.push(new Cell(i, v, this.cellSize, this.cellSize, this, this.cellConstructors[cell]));
                }
            } else {
                this.passiveCells.push([this.cellSize * v, this.cellSize * i]);
            }
        });

    };

    this.onWin = function(){
        this.addForRender(this.winPic);
        setTimeout(this.afterWin, 2000);
    };

    this.onLose = function(){
        this.addForRender(this.losePic);
        setTimeout(this.afterLose, 500);
    };

    this.winPic = function(){
        this.endScreen('Победа!', '#1051b2');
    };

    this.losePic = function(){
        this.endScreen('Поражение!', '#b51717');
    };

    //закрузка спрайтов
    if (params.sprites) {
        this.spritesInLoad = 0;
        var th = this;
        for (var v in params.sprites) {
            if (params.sprites.hasOwnProperty(v)) {
                this.spritesInLoad++;
                new Sprite(params.sprites[v], v, function () {
                    th.spritesInLoad--;
                    th.sprites[this.name] = this.img;
                    if (th.spritesInLoad == 0) {
                        th.load();
                        onload.apply(th);
                    }
                });

            }
        }
    }
};