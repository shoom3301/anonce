var $ww = $(window);

window.bindMethod = addEventListener?'addEventListener':'attachEvent';
/**
 * Инициализация DOM элементов
 * */
window.DOMRelative = {
    storage: [],
    inited: false,
    init: function(){
        if(!this.inited){
            var caller = function(){
                DOMRelative.init();
            };
            window[bindMethod]('load', caller);
            window[bindMethod]('resize', caller);
            window[bindMethod]('orientationchange', caller);
            this.inited = true;
        }
        for(var i=0;i<this.storage.length;i++){
            this.storage[i]();
        }
        return this;
    },
    add: function(func){
        this.storage.push(func);
        return this;
    },
    remove: function(func){
        this.storage.splice(this.storage.indexOf(func), 1);
        return this;
    }
};

/**
 * Подключение скрипта или стилей
 * */
function include(path, type, callback){
    var access = true;
    var arr = (type=='css')?'styleSheets':'scripts';

    for(var i=0;i<document[arr].length;i++){
        var stl = document[arr][i];
        if(stl && (stl.href || stl.src) && (((type=='css')?stl.href:stl.getAttribute('src'))==path)) access = false;
    }
    if(access){
        var script = document.createElement((type=='css')?'link':'script');
        script.type = 'text/'+(type=='css'?'css':(type=='template')?type:'javascript');

        if(type=='css'){
            script.rel = 'stylesheet';
            script.href = path;
        }else{
            script.src = path;
        }

        if(callback && typeof callback == 'function') script.onload = callback;
        if(callback && typeof callback == 'object'){
            var func = null;
            for(var param in callback){
                if(param == 'callback'){
                    func = callback[param];
                }else{
                    script[param] = callback[param];
                }
            }
            if(func) script.apply(func);
        }
        document.head.appendChild(script);
    }else{
        callback();
    }
}

/**
 * Процент от числа
 * */
Number.prototype.prc = function(precent){
    return this*precent/100;
};

/**
 * Удаление элемента из массива
 * */
Array.prototype.remove = function(i){
    this.splice(this.indexOf(i), 1);
    return this;
};

/**
 * Декодирование URL
 * */
function urldecode(str) {
    return decodeURIComponent((str + '').replace(/\+/g, '%20'));
}

/**
 * Из URL в js объект
 * */
function parseURL(a){
    var params = urldecode((a || window.location.search).replace('?', '')).split('&');
    var data = {};
    for(var i=0;i<params.length;i++){
        var t = params[i].split('=');
        data[t[0]] = t[1];
    }
    return data;
}

/**
 * Клонирование объекта
 * */
function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}

/**
 * Рандомный цвет
 */
function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)].toLowerCase();
    }
    return color;
}

/**
 * Задать высоту окна
 */
jQuery.fn.windowHeight = function(forever){
    var th = this;
    if((forever==true && this.caller) || forever==false){
        window[removeEventListener?'removeEventListener':'detachEvent']('resize', this.caller, false);
        if(forever==false) return this;
    }
    this.caller = function(){
        return th.each(function(){
            this.style.height = window.innerHeight+'px';
        });
    };
    if(forever==true){
        window[addEventListener?'addEventListener':'attachEvent']('resize', this.caller, false);
    }
    return this.caller();
};

function $id(id){
    return document.getElementById(id);
}

function $el(tag){
    return document.createElement(tag);
}

function base64src(base64){
    return 'data:image/jpeg;base64,'+base64;
}

/**
 * Перекрытие двух прямоугольников
 * @param {Number} x1
 * @param {Number} y1
 * @param {Number} w1
 * @param {Number} h1
 * @param {Number} x2
 * @param {Number} y2
 * @param {Number} w2
 * @param {Number} h2
 * @return {Array | Boolean} пересечение или их отсутствие
 */
function RectsOverlap(x1, y1, w1, h1, x2, y2, w2, h2){
    var res = {};
    var overlap = 0;
    if((x1+w1 > x2 && x1+w1<x2+w2) || (x2+w2>x1 && x1+w1>x2)){
        if(x1+w1-x2 < x2+w2-x1){
            res.left = x1+w1-x2;
        }else{
            res.right = x2+w2-x1;
        }
        overlap++;
    }
    if((y1+h1 > y2 && y1 < y2+h2) || (y2+h2>y1 && y1+h1>y2)){
        if(y2+h2-y1 < y1+h1-y2){
            res.bottom = y2+h2-y1;
        }else{
            res.top = y1+h1-y2;
        }
        overlap++;
    }
    if(overlap==2){
        return res;
    }else{
        return false;
    }
}

function RectsOverlapX(x1, w1, x2, w2){
    var res = null;
    if((x1+w1 > x2 && x1+w1<x2+w2) || (x2+w2>x1 && x1+w1>x2)){
        if(x1+w1-x2 < x2+w2-x1){
            res = {left: x1+w1-x2};
        }else{
            res = {right: x2+w2-x1};
        }
    }

    return res;
}

function RectsOverlapY(y1, h1, y2, h2){
    var res = null;
    if((y1+h1 > y2 && y1 < y2+h2) || (y2+h2>y1 && y1+h1>y2)){
        if(y2+h2-y1 < y1+h1-y2){
            res = {bottom: y2+h2-y1};
        }else{
            res = {top: y1+h1-y2};
        }
    }
    return res;
}