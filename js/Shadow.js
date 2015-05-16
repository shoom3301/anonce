/**
 * Created by Shoom on 16.05.15.
 */

/**
 * Класс игрока
 * @param scene {Scene} сцена на который существует игрок
 * @param level {Level} уровень
 * @param params {Object} дополнительные параметры
 * */
var Shadow = function(scene, level, params){
    this.x = 0;
    this.y = 0;
    this.xb = 0;
    this.yb = 0;
    this.coeff = 0.5;
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
            //this.move();
            this.checkCollision();
            this.ctx.drawImage(this.level.sprites.yoba, this.x, this.y);
        }
    };

    this.checkCollision = function(){
        for(var i=0; i<this.level.activeCells.length;i++){
            if(this.level.cellIsVisible(this.level.activeCells[i])) this.level.activeCells[i].check(this);
        }
    };

    this.addCoors = function(x,y){
        this.x = x;
        this.y = y;
    };

    this.move = function(){
        var xdiff = this.xb-this.x;
        if(this.xb && (xdiff>this.coeff || xdiff<-this.coeff)){
            if(this.xb>this.x){
                this.x += this.coeff;
                this.xb -= this.coeff;
            }else{
                this.x -= this.coeff;
                this.xb += this.coeff;
            }
        }
        var ydiff = this.yb-this.y;
        if(this.yb && (ydiff>this.coeff || ydiff<-this.coeff)){
            if(this.yb>this.y){
                this.y += this.coeff;
                this.yb -= this.coeff;
            }else{
                this.y -= this.coeff;
                this.yb += this.coeff;
            }
        }
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