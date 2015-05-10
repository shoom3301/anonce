/**
 * Created by Shoom on 07.05.15.
 */

/**
 * Класс игрока
 * @param scene {Scene} сцена на который существует игрок
 * @param render {Function} рендеринг игрока
 * @param params {Object} дополнительные параметры
 * */
var Player = function(scene, render, params){
    //Координата по оси X
    this.x = params.x || 0;
    //Координата по оси Y
    this.y = params.y || 0;
    //Смещение по X
    this.offsetX = params.offsetX || 0;
    //Смещение по Y
    this.offsetY = params.offsetY || 0;
    //Ширина
    this.width = params.width || 32;
    //Высота
    this.height = params.height || 32;
    //Скорость по X
    this.velX = 0;
    //Скорость по Y
    this.velY = 0;
    //Скорость
    this.speed = 5.6;
    //Трение
    this.friction = 0.8;
    //Гравитация
    this.gravity = 0.4;
    //Клавиши управления
    this.keys = [];
    //В прыжке
    this.jumping = false;
    //Приземлен
    this.grounded = false;
    //Сцена
    this.scene = scene;
    //Функция рендеринга
    this._render = render;
    //2D контекст
    this.ctx = this.scene.ctx;
    //Функции для рендеринга
    this.forRender = [];
    this.bonusCount = params.bonusCount;

    /**
     * Рендеринг игрока
     * */
    this.render = function(){
        for(var i=0; i<this.forRender.length; i++){
            this.forRender[i].apply(this);
        }
        return this;
    };

    /**
     * Добавить функцию к рендерингу
     * @param {Function} func функция рендеринга
     * */
    this.addForRender = function(func){
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
     * Включение управления клавишами
     * */
    this.keyControls = function(){
        var th = this;
        this.scene.on('keydown', function(keyCode, e){
            th.keys[keyCode] = true;
        });

        this.scene.on('keyup', function(keyCode, e){
            th.keys[keyCode] = false;
        });
    };

    /**
     * Движение игрока
     * */
    this.move = function(){
        //Прыжок
        if (this.keys[87] || this.keys[32]) {
            if(!this.jumping && this.grounded){
                this.jumping = true;
                this.grounded = false;
                this.velY = -this.speed*2;
            }
        }
        //Вправо
        if (this.keys[68]) {
            if (this.velX < this.speed) {
                this.velX++;
            }
        }
        //Влево
        if (this.keys[65]) {
            if (this.velX > -this.speed) {
                this.velX--;
            }
        }

        //Учитываем трение
        this.velX *= this.friction;

        //Учитываем гравитацию
        this.velY += this.gravity;

        this.grounded = false;
        this.checkCollision();

        //Если игрок приземлен
        if(this.grounded){
            this.velY = 0;
        }

        //Изменяем координаты
        this.x += this.velX;
        this.y += this.velY;

        //Если выходим за сцену по горизонтали
        if (this.x >= this.scene.mapWidth-this.width) {
            this.x = this.scene.mapWidth-this.width;
        } else if (this.x <= 0) {
            this.x = 0;
        }

        //Если выходим за сцену по вертикали
        if(this.y >= this.scene.mapHeight-this.height){
            this.y = this.scene.mapHeight - this.height;
            this.jumping = false;
        }
    };

    this.checkCollision = function(){
        for(var i=0; i<this.scene.grid.length;i++){
            this.scene.grid[i].check(this);
        }
    };

    this.openGate = function(){
        this.scene.gateIsOpen = true;
    };

    this.winAlpha = 0;
    this.win = function(){
        this.winAlpha += 0.01;
        if(this.winAlpha>=1) this.winAlpha = 1;
        this.ctx.fillStyle = "rgba(38, 75, 99, "+this.winAlpha+")";
        this.ctx.fillRect(0, 0, this.scene.width+this.scene.offsetX, this.scene.height+this.scene.offsetY);
        this.ctx.font="20px Arial";
        this.ctx.fillStyle = "#ffffff";
        this.ctx.fillText("Ты проиграл!",this.scene.offsetX+(this.scene.width/2)-80,this.scene.offsetY+(this.scene.height/2));
    };

    this.keyControls();
    this.addForRender(this.move);
    this.addForRender(this._render);
};