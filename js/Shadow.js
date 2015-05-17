/**
 * Created by Shoom on 16.05.15.
 */

/**
 * Тень. Игрок в комнате, который меняет свое состояние только от данных с сервера.
 * @param scene {Scene} сцена на который существует тень
 * @param level {Level} уровень
 * @param params {Object} дополнительные параметры
 * */
var Shadow = function(scene, level, params){
    //x
    this.x = params.x || 0;
    //y
    this.y = params.y || 0;
    //Ширина
    this.width = params.width || 32;
    //Высота
    this.height = params.height || 32;
    //Сцена
    this.scene = scene;
    //уровень
    this.level = level;
    //2D контекст
    this.ctx = this.scene.ctx;
    //Имя игрока
    this.name = params.name;
    //Можно ли рендерить игрока
    this.canRender = true;

    /**
     * Рендеринг игрока
     * */
    this.render = function(){
        if(this.canRender){
            this.ctx.drawImage(this.level.sprites.yoba, this.x, this.y);
        }
    };

    /**
     * Изменение координат тени
     * @param {Number} x x
     * @param {Number} y y
     * */
    this.addCoors = function(x,y){
        this.x = x;
        this.y = y;
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
};