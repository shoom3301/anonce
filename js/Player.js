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
    //Сцена
    this.scene = scene;
    //Радиус
    this.radius = params.radius;
    //Функция рендеринга
    this._render = render;
    //2D контекст
    this.ctx = this.scene.ctx;
    //Минимальная скорость
    this.minSpeed = 4;
    //Максимальная скорость
    this.maxSpeed = 23;
    //Скорость по горизонтали
    this.hSpeed = this.minSpeed;
    //Максимальная вертикали
    this.vSpeed = this.minSpeed;
    //Максимальная скорость
    this.moveXdirection = null;
    this.moveX = null;
    //Замедление скорости
    this.slowDown = false;
    //В прыжке
    this.inJump = false;
    //Таймер прыжка
    this.jumpUpTimer = null;
    //Максимальная высота прыжка
    this.jumpMaxHeight = 152;
    //Стоит на плоскости
    this.inPlace = false;
    //Функции для рендеринга
    this.forRender = [];
    //Вектор движения
    this.vector = {
        //По горизонтали
        horizontal: 0,
        //По вертикали
        vertical: 0
    };

    /**
     * Рендеринг игрока
     * */
    this.render = function(){
        this.gravitation();
        for(var i=0; i<this.forRender.length; i++){
            this.forRender[i].apply(this);
        }
        this._render();
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
    this.doMove = function(){
        var th = this;
        this.scene.on('keydown', function(char){
            var direction = '';
            switch (char){
                case 'w':
                    th.jump();
                    break;
                case 'a':
                    direction = 'left';
                    break;
                case 's':
                    direction = 'bottom';
                    break;
                case 'd':
                    direction = 'right';
                    break;
                case ' ':
                    th.jump();
                    break;
            }

            //Если зажать влево или вправо, то игрок будет двигаться в выбранном направлении
            if(direction){
                if(direction == 'left' || direction == 'right'){
                    th.bindMove(direction);
                }
            }
        });

        this.scene.on('keyup', function(char){
            var direction = '';
            switch (char){
                case 'w':
                    direction = 'top';
                    break;
                case 'a':
                    direction = 'left';
                    break;
                case 's':
                    direction = 'bottom';
                    break;
                case 'd':
                    direction = 'right';
                    break;
            }

            //Если отпустить влево или вправо, то игрок остановится
            if(direction){
                if(direction == 'left' || direction == 'right'){
                    th.bindMove(0);
                }
            }
        });
    };

    this.checkConflict = function (o, val) {
        var newpos = {x: this.x, y: this.y};

        if(o=='x'){
            if(this.bottomBlock){
                if(newpos.x+this.width<this.bottomBlock[0] || newpos.x>this.bottomBlock[0]+this.scene.cellSize){
                    delete this.bottomBlock;
                    this.inPlace = false;

                }
            }
            newpos.x = val;
        }else{
            newpos.y = val;
        }

        for(var i=0; i<this.scene.walls.length; i++){
            var wall = this.scene.walls[i];
            var check = RectsOverlap(newpos.x, newpos.y, this.width, this.height, wall[0], wall[1], this.scene.cellSize, this.scene.cellSize);
            if(check){
                var hor = check.left || check.right;
                var ver = check.top || check.bottom;
                if(this.y>=newpos.y && hor<ver){
                    if(this.vector.horizontal == 'right' && check.left){
                        this.x = wall[0]-this.width;
                    }else if(this.vector.horizontal == 'left' && check.right){
                        this.x = wall[0]+this.scene.cellSize;
                    }
                }else{
                    if(this.vector.vertical == 'bottom' && check.top){
                        this.y = wall[1]-this.height;
                        this.inPlace = true;
                        this.bottomBlock = wall;
                    }else if(this.vector.vertical == 'top' && check.bottom){
                        this.y = wall[1]+this.scene.cellSize;
                        this.stopJump();
                    }
                }
                return true;
            }
        }

        return false;
    };

    /**
     * Движение игрока. Изменяет позицию по выбранной оси с соответствующей скоростью
     * @param {String} direction направление движения
     * @return {Boolean} прошло ли движение
     * */
    this.horizontalMove = function(direction){
        var newX = this.x+(this.hSpeed*(direction=='left'?-1:1));

        //Определение вектора по горизонтали
        if(newX != this.x){
            this.vector.horizontal = newX-this.x>=0?'right':'left';
        }

        if(this.checkConflict('x', newX)){
            this.clearVector();
            return false;
        }else{
            this.x = newX;
            return true;
        }
    };

    /**
     * Запомнить / забыть движение по горизонтали
     * @param {String | Number} direction направление движения или 0, если 0, то забыть предыдущее направление
     * */
    this.bindMove = function(direction){
        //Если предыдущее направление не равно текущему и не равно 0
        if(this.moveXdirection != direction && direction!=0){
            //Останавливаемся в движении по горизонтали
            this.stopMove();
            //Запоминаем направление
            this.moveXdirection = direction;
            //Запоминаем функцию движения по направлению
            this.moveX = function(){
                //Если в режиме замедления, сбавляем скорость, иначе увеличиваем
                if(this.slowDown){
                    this.hSpeed -= 1.4;
                }else{
                    this.hSpeed += 1;
                }
                //Если скорость отрицательная, делаем ее = 0
                if(this.hSpeed < 0) this.hSpeed = 0;
                //Если скорость больше максимальной, делаем ее = максимальной
                if(this.hSpeed > this.maxSpeed) this.hSpeed = this.maxSpeed;

                //Если двигаться в выбранном направлении нельзя или скорость равна 0, то останавливаемся
                if(!this.horizontalMove(this.moveXdirection) || this.hSpeed <= 0){
                    this.stopMove();
                }
            };
            //Добавляем функцию в рендеринг
            this.addForRender(this.moveX);
        }else{
            //Если нужно остановиться, переходим в режим замедления
            if(direction==0) this.slowDown = true;
        }
        return this;
    };

    /**
     * Оставновка движения
     * */
    this.stopMove = function(){
        //Удаляем функцию движения из рендеринга
        this.removeForRender(this.moveX);
        //Удаляем функцию движения
        this.moveX = null;
        //Удаляем направление движения
        this.moveXdirection = null;
        //Делаем скорость минимальной
        this.hSpeed = this.minSpeed;
        //Убираем замедление
        this.slowDown = false;
        return this;
    };

    /**
     * Прыжок
     * */
    this.jump = function(){
        //Если сейчас не в прыжке и на плоскости
        if(!this.inJump && this.inPlace){
            //Переключаем, что мы в прыжке и не на плоскости
            this.inPlace = false;
            this.inJump = true;
            //Запоминаем с какой высоты прыгаем
            var startHeight = this.y;
            //Делаем скорость по вертикали максимальной
            this.vSpeed = this.maxSpeed;
            var th = this;
            //Каждый кадр двигаемся вврх и уменьшаем скорость
            this.jumpUpTimer = setInterval(function(){
                var mv = th.verticalMove('top');
                th.vSpeed-=1;
                //Если не возможно выше прыгать или достигли максимума прыжка, останавливаем прыжок
                if(th.y-startHeight <= -th.jumpMaxHeight || !mv){
                    th.stopJump();
                }
            }, fps);
            return true;
        }
        return false;
    };

    /**
     * Остановка прыжка
     * */
    this.stopJump = function(){
        clearInterval(this.jumpUpTimer);
        this.jumpUpTimer = null;
        this.inJump = false;
        this.vSpeed = this.minSpeed;
    };

    /**
     * Притяжение игрока к полу
     * */
    this.gravitation = function(){
        //во время прыжка и если игрок стоит на плоскости, гравитация не работает
        if(!this.inJump && !this.inPlace){
            //всегда стремится двигаться вниз и увеличивать скорость
            this.verticalMove('bottom');
            this.vSpeed = this.vSpeed+1+(this.vSpeed*3/100);
            if(this.vSpeed >= this.maxSpeed) this.vSpeed = this.maxSpeed;
        }
    };

    this.verticalMove = function(direction){
        var newY = this.y+(this.vSpeed*(direction=='top'?-1:1));

        //Определение вектора по вертикали
        if(newY != this.y){
            this.vector.vertical = newY-this.y>0?'bottom':'top';
        }


        if(this.checkConflict('y', newY)){
            this.clearVector();
            return false;
        }else{
            this.y =  newY;
            return true;
        }
    };

    this.clearVector = function(){
        this.vector.horizontal = 0;
        this.vector.vertical = 0;
    };
};