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
    //Смещение по X
    this.offsetX = params.offsetX || 0;
    //Смещение по Y
    this.offsetY = params.offsetY || 0;
    //Ширина
    this.width = params.width || 32;
    //Высота
    this.height = params.height || 32;
    //Скорость
    this.speed = 5.6;
    //Трение
    this.friction = 0.9;
    //Гравитация
    this.gravity = 0.4;
    //Скорость по X
    this.velX = 0;
    //Скорость по Y
    this.velY = 0;
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
    //Имя игрока
    this.name = params.name;
    //Клавиши управления
    this.controls = params.controls;
    //Можно ли рендерить игрока
    this.canRender = true;

    /**
     * Включение управления клавишами
     * */
    this.keyControls = function(){
        var th = this;
        this.scene.on('keydown', function(keyCode){
            th.keys[keyCode] = true;
        });

        this.scene.on('keyup', function(keyCode){
            th.keys[keyCode] = false;
        });
    };

    /**
     * Движение игрока
     * */
    this.move = function(){
        //Прыжок
        if (this.keys[this.controls.jump]) {
            if(!this.jumping && this.grounded){
                this.jumping = true;
                this.grounded = false;
                this.velY = -this.speed*2;
            }
        }
        //Вправо
        if (this.keys[this.controls.right]) {
            if (this.velX < this.speed) {
                this.velX++;
            }
        }
        //Влево
        if (this.keys[this.controls.left]) {
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
        if(this.grounded) this.velY = 0;

        //Изменяем координаты
        this.x += this.velX;
        this.y += this.velY;

        //Если выходим за сцену по горизонтали
        if (this.x >= this.level.width-this.width) {
            this.x = this.level.width-this.width;
        } else if (this.x <= 0) {
            this.x = 0;
        }

        //Если выходим за сцену по вертикали
        if(this.y >= this.level.height-this.height){
            this.y = this.level.height - this.height;
            this.jumping = false;
            this.grounded = true;
        }
    };

    /**
     * Проверка столкновения с активными блоками
     * */
    this.checkCollision = function(){
        for(var i=0; i<this.level.activeCells.length;i++){
            if(this.level.cellIsVisible(this.level.activeCells[i])) this.level.activeCells[i].check(this);
        }
    };

    /**
     * Установка уровня
     * @param {Level} lvl уровень
     * */
    this.setLevel = function(lvl){
        this.velX = 0;
        this.velY = 0;
        this.keys = [];
        this.jumping = false;
        this.grounded = false;
        this.level = lvl;
        this.x = this.level.playerPos[0];
        this.y = this.level.playerPos[1];
        this.canRender = true;
    };

    /**
     * Победа на карте
     * */
    this.win = function(){
        this.level.onWin(this);
    };

    /**
     * Поражение на карте
     * */
    this.lose = function(){
        this.level.onLose(this);
    };

    /**
     * Рендеринг игрока
     * */
    this.render = function(){
        if(this.canRender){
            this.move();
            this._render();
        }
    };

    /**
     * Включаем управление, добавляем в рендеринг движение и отрисовку игрока
     * */
    this.keyControls();
};