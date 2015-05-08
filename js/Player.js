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
     * Проверка, можно ли двигаться, если следующий шаг будет в стену, то корректирует его
     * @param newpos {Object} следующий шаг (координаты)
     * @return {Boolean} можно ли двигаться дальше
     * */
    this.checkMove = function(newpos){
        //Вылазит ли за границы вправо
        var moreRight = newpos.x+this.width > this.scene.width;
        //Вылазит ли за границы влево
        var moreLeft = newpos.x-this.width+this.offsetX < 0;
        //Вылазит ли за границы вниз
        var moreBottom = newpos.y+this.height > this.scene.height;
        //Вылазит ли за границы вверх
        var moreUp = newpos.y+this.offsetY < this.height;

        //Определение вектора по горизонтали
        if(newpos.x != this.x){
            this.vector.horizontal = newpos.x-this.x>=0?'right':'left';
        }
        //Определение вектора по вертикали
        if(newpos.y != this.y){
            this.vector.vertical = newpos.y-this.y>0?'bottom':'top';
        }

        //При приземлении на плоскость
        if(moreBottom) this.inPlace = true;

        //Если след. шаг выходит за границы
        if(moreRight || moreLeft || moreBottom || moreUp){
            //Если след. шаг выходит за границы справа, делаем след. шаг ровно до границы справа
            if(moreRight){
                newpos.x = this.scene.width-this.width;
                return true;
            //Если след. шаг выходит за границы слева, делаем след. шаг ровно до границы слева
            }else if(moreLeft){
                newpos.x = this.width-this.offsetX;
                return true;
            //Если след. шаг выходит за границы вниз, делаем след. шаг ровно до границы снизу и запоминаем, что мы приземлились
            }else if(moreBottom){
                newpos.y = this.scene.height-this.height;
                this.inPlace = true;
                return true;
            //Если след. шаг выходит за границы сверху, делаем след. шаг ровно до границы сверху и прекращаем прыжок
            }else if(moreUp){
                newpos.y = this.height-this.offsetY;
                this.stopJump();
                return true;
            }

            //Еще раз проверка, чтобы игрок оставался в пределах границ
            if(newpos.y+this.height > this.scene.height){
                newpos.y = this.scene.height-this.height;
                return true;
            }
            if(newpos.y+this.height < this.height){
                newpos.y = this.height;
                return true;
            }
        }else{
            return true;
        }

        return false;
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

    this.checkConflict = function (newpos) {
        if(this.bottomBlock){
            if(newpos.x+this.width<this.bottomBlock[0] || newpos.x>this.bottomBlock[0]+this.scene.cellSize){
                delete this.bottomBlock;
                this.inPlace = false;

            }
        }
        for(var i=0; i<this.scene.walls.length; i++){
            var wall = this.scene.walls[i];
            var check = RectsOverlap(newpos.x, newpos.y, this.width, this.height, wall[0], wall[1], this.scene.cellSize, this.scene.cellSize);
            if(check){
                //console.log(this.vector, {x: this.x, y: this.y}, newpos, check);
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
    this.move = function(direction){
        var newpos = null;

        switch (direction){
            case 'top':
                newpos = {x: this.x, y: this.y-this.vSpeed};
                break;
            case 'left':
                newpos = {x: this.x-this.hSpeed, y: this.y};
                break;
            case 'bottom':
                newpos = {x: this.x, y: this.y+this.vSpeed};
                break;
            case 'right':
                newpos = {x: this.x+this.hSpeed, y: this.y};
                break;
        }

        //Если можно двигаться
        if(newpos && this.checkMove(newpos)){

            if(this.checkConflict(newpos)){
                this.clearVector();
                return false;
            }else{
                this.x = newpos.x;
                this.y = newpos.y;
                return true;
            }
        }
        this.clearVector();
        return false;
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
                if(!this.move(this.moveXdirection) || this.hSpeed <= 0){
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
                var mv = th.move('top');
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
            this.move('bottom');
            this.vSpeed = this.vSpeed+1+(this.vSpeed*3/100);
            if(this.vSpeed >= this.maxSpeed) this.vSpeed = this.maxSpeed;
        }
    };

    this.clearVector = function(){
        this.vector.horizontal = 0;
        this.vector.vertical = 0;
    };
};