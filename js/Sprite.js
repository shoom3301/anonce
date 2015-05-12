/**
 * Created by Shoom on 10.05.15.
 */


/**
 * Спрайт
 * @param {String} src адрес картинки
 * @param {String} name название спрайта
 * @param {Function} onload callback загрузки картинки
 * */
var Sprite = function(src, name, onload){
    this.img = new Image();
    this.img.src = src;
    this.name = name;
    var th = this;
    this.img.addEventListener('load', function(){
        if(onload) onload.apply(th);
    });
};

/**
 * Активный блок
 * @param {Number} row номер строки в матрице
 * @param {Number} col номер столбца в матрице
 * @param {Number} w ширина блока
 * @param {Number} h высота блока
 * @param {Scene} scene сцена на которой рендерится блок
 * @param {Object} data параметры блока
 * */
var Cell = function(row,col,w,h,scene,data){
    //номер строки в матрице
    this.row = row;
    //номер столбца в матрице
    this.col = col;
    //ширина блока
    this.width = w;
    //высота блока
    this.height = h;
    //x
    this.x = this.col*this.width;
    //y
    this.y = this.row*this.height;
    //сцена на которой рендерится блок
    this.scene = scene;

    //уничтожение блока
    this.destroy = function(){
        this.scene.matrix[this.row][this.col] = 0;
        this.scene.passiveCells.push([this.x, this.y]);
        this.scene.activeCells.remove(this);
    };

    //назначаем функцию рендеринга
    if(data.render){
        this.render = data.render;
    }else{
        this.render = function(){
            this.scene.ctx.drawImage(this.sprite, this.x, this.y)
        };
    }

    //спрайт блока
    this.sprite = data.sprite;
    //твердый ли блок (если твердый через него нельзя походить)
    this.hardBlock = data.hardBlock || false;
    //callback проверки на пересечение с игроком
    this._check = data.check;

    /**
     * проверка пересечения с игроком
     * @param {Player} player игрок
     * */
    this.check = function(player){
        return this._check.apply(this, [player, this.colCheck(player)]);
    };

    /**
     * функция проверки пересечения
     * @param {Player} player игрок
     * */
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