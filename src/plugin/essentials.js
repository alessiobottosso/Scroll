game.module(
    'plugin.essentials'
)
.require(
    'engine.renderer.container',
    'engine.renderer.sprite',
    'engine.renderer.text'
)
.body(function() {

this.version = '1.3.0';

if (game.isStarted) return;

/**
    @class Button
    @constructor
    @param {Texture|String} asset Asset or texture to use as the button
    @param {Number} x X position of the button
    @param {Number} y Y position of the button
    @param {Function} callback Function that is called, when the button is clicked
**/
game.createClass('Button', {
    /**
        Function that is called, when the button is clicked
        @property {Function} callback
        @default null
    **/
    callback: null,
    /**
        Name of the sound to play, when clicking the button
        @property {String} clickSound
        @default null
    **/
    clickSound: null,
    /**
        Alpha value, when button is disabled
        @property {Number} disableAlpha
        @default 0.5
    **/
    disableAlpha: 0.5,
    /**
        How fast to fade the button (ms)
        @property {Number} fadeSpeed
        @default 500
    **/
    fadeSpeed: 500,
    /**
        How much to rotate the button (radians)
        @property {Number} rotateAmount
        @default 0.1
    **/
    rotateAmount: 0.1,
    /**
        Easing to use, when rotating the button
        @property {String} rotateEasing
        @default Quadratic.InOut
    **/
    rotateEasing: 'Quadratic.InOut',
    /**
        How fast to rotate the button (ms)
        @property {Number} rotateSpeed
        @default 1000
    **/
    rotateSpeed: 1000,
    /**
        How much to scale the button
        @property {Number} scaleAmount
        @default 0.1
    **/
    scaleAmount: 0.1,
    /**
        Easing to use, when scaling the button
        @property {String} scaleEasing
        @default Back.Out
    **/
    scaleEasing: 'Back.Out',
    /**
        Name of the sound to play, when scaling the button
        @property {String} scaleSound
        @default null
    **/
    scaleSound: null,
    /**
        How fast to tween the scaling
        @property {Number} scaleSpeed
        @default 250
    **/
    scaleSpeed: 250,

    staticInit: function(asset, x, y, callback) {
        this.sprite = new game.Sprite(asset);
        this.sprite.anchorCenter();
        this.sprite.position.set(x, y);
        this.sprite.interactive = true;
        this.sprite.mousedown = this._mousedown.bind(this);
        this.sprite.mouseup = this.sprite.mouseupoutside = this._mouseup.bind(this);
        this.sprite.click = this._click.bind(this);
        this.sprite.buttonMode = true;
        this.callback = callback;
        this.clickSound = game.Button.clickSound;
        this.scaleSound = game.Button.scaleSound;
    },
    
    /**
        @method addTo
        @param {Container} container
    **/
    addTo: function(container) {
        container.addChild(this.sprite);
    },
    
    /**
        @method disable
    **/
    disable: function() {
        this.sprite.alpha = this.disableAlpha;
        this.sprite.interactive = false;
    },
    
    /**
        @method enable
    **/
    enable: function() {
        this.sprite.alpha = 1;
        this.sprite.interactive = true;
    },

    /**
        @method fadeIn
        @param {Number} delay How much to wait before fading
    **/
    fadeIn: function(delay) {
        delay = delay || 0;
        this.sprite.alpha = 0;
        this.sprite.visible = true;
        game.Tween.add(this.sprite, {
            alpha: 1
        }, this.fadeSpeed, {
            delay: delay,
            onComplete: this._fadeInComplete.bind(this)
        }).start();
    },
    
    /**
        @method fadeOut
        @param {Number} delay How much to wait before fading
        @param {Boolean} hide Hide the button after fading
    **/
    fadeOut: function(delay, hide) {
        delay = delay || 0;
        this.sprite.alpha = 1;
        this.sprite.interactive = false;
        game.Tween.add(this.sprite, {
            alpha: 0
        }, this.fadeSpeed, {
            delay: delay,
            onComplete: this._fadeOutComplete.bind(this, hide)
        }).start();
    },

    /**
        @method remove
    **/
    remove: function() {
        this.sprite.remove();
        if (this.rotateTween) this.rotateTween.stop();
    },
    
    /**
        @method rotate
        @param {Boolean} random Start from random position
    **/
    rotate: function(random) {
        this.sprite.rotation = -this.rotateAmount;
        this.rotateTween = game.Tween.add(this.sprite, {
            rotation: this.rotateAmount
        }, this.rotateSpeed, {
            repeat: Infinity,
            yoyo: true,
            easing: this.rotateEasing
        }).start();
        if (random) this.rotateTween.currentTime = this.rotateTween.duration.random();
    },
    
    /**
        @method scaleIn
        @param {Number} delay How much to wait before scaling
    **/
    scaleIn: function(delay) {
        this.sprite.interactive = false;
        delay = delay || 0;
        this.sprite.scale.set(0);
        game.Tween.add(this.sprite.scale, {
            x: 1, y: 1
        }, this.scaleSpeed, {
            easing: this.scaleEasing,
            delay: delay,
            onStart: this._onScaleInStart.bind(this),
            onComplete: this._scaleInEnd.bind(this)
        }).start();
    },

    /**
        @method _click
        @private
    **/
    _click: function() {
        if (this.sprite.alpha < 1) return;
        if (this.clickSound) game.audio.playSound(this.clickSound);
        if (typeof this.callback === 'function') this.callback();
    },

    /**
        @method _fadeOutComplete
        @private
    **/
    _fadeOutComplete: function(hide) {
        if (hide) this.sprite.visible = false;
    },

    /**
        @method _fadeInComplete
        @private
    **/
    _fadeInComplete: function() {
        this.sprite.interactive = true;
    },

    /**
        @method _mousedown
        @private
    **/
    _mousedown: function() {
        if (this.sprite.alpha < 1) return;
        this.sprite.scale.set(1 - this.scaleAmount);
    },
    
    /**
        @method _mouseup
        @private
    **/
    _mouseup: function() {
        this.sprite.scale.set(1);
    },
    
    /**
        @method _onScaleInStart
        @private
    **/
    _onScaleInStart: function() {
        if (this.scaleSound) game.audio.playSound(this.scaleSound);
    },

    /**
        @method _scaleInEnd
        @private
    **/
    _scaleInEnd: function() {
        this.sprite.interactive = true;
    }
});

game.addAttributes('Button', {
    /**
        Default click sound for all buttons
        @attribute {String} clickSound
        @default null
    **/
    clickSound: null,
    /**
        Default scale sound for all buttons
        @attribute {String} scaleSound
        @default null
    **/
    scaleSound: null
});

/**
    @class Fader
    @constructor
    @param {Object} [properties]
**/
game.createClass('Fader', {
    /**
        @property {String} color
        @default #000
    **/
    color: '#000',
    /**
        @property {Number} delay
        @default 0
    **/
    delay: 0,
    /**
        @property {Number} speed
        @default 500
    **/
    speed: 500,
    /**
        @property {Graphics} sprite
    **/
    sprite: null,
    /**
        Target container, where the fader is added. If null, targets to scene stage.
        @property {Container} target
    **/
    target: null,

    staticInit: function(properties) {
        game.merge(this, properties);
        this.sprite = new game.Graphics();
        this.sprite.drawRect(0, 0, game.width, game.height);
    },

    /**
        @method fadeIn
        @param {Function} callback Function that is called, when fade in is completed.
    **/
    fadeIn: function(callback) {
        this.sprite.shapes[0].fillColor = this.color;
        this.sprite.addTo(this.target || game.scene.stage);
        this.sprite.alpha = 1;
        game.Tween.add(this.sprite, {
            alpha: 0
        }, this.speed, {
            delay: this.delay,
            onComplete: this._fadeInComplete.bind(this, callback)
        }).start();
    },

    /**
        @method fadeOut
        @param {Function} callback Function that is called, when fade out is completed.
    **/
    fadeOut: function(callback) {
        this.sprite.shapes[0].fillColor = this.color;
        this.sprite.addTo(this.target || game.scene.stage);
        this.sprite.alpha = 0;
        game.Tween.add(this.sprite, {
            alpha: 1
        }, this.speed, {
            delay: this.delay,
            onComplete: this._fadeOutComplete.bind(this, callback)
        }).start();
    },

    _fadeInComplete: function(callback) {
        this.sprite.remove();
        if (typeof callback === 'function') callback();
    },

    _fadeOutComplete: function(callback) {
        if (typeof callback === 'function') callback();
    }
});

/**
    @class IconButton
    @extends Button
    @constructor
    @param {Texture|String} asset Asset or texture to use as the button
    @param {Texture|String} icon Asset or texture to use as the button icon
    @param {Number} x X position of the button
    @param {Number} y Y position of the button
    @param {Function} callback Function that is called, when the button is clicked
**/
game.createClass('IconButton', 'Button', {
    staticInit: function(asset, icon, x, y, callback) {
        this.super(asset, x, y, callback);
        this.icon = new game.Sprite(icon);
        this.icon.anchorCenter();
        this.icon.addTo(this.sprite);
    },

    /**
        @method setIcon
        @param {Texture|String} icon Asset or texture to use as the button icon
    **/
    setIcon: function(icon) {
        this.icon.setTexture(icon);
        this.icon.anchorCenter();
    }
});

/**
    @class TextButton
    @extends Button
    @constructor
    @param {Texture|String} asset Asset or texture to use as the button
    @param {Texture|String} text Text to use in the button
    @param {Number} x X position of the button
    @param {Number} y Y position of the button
    @param {Function} callback Function that is called, when the button is clicked
    @param {Object} [textProps] Text properties
**/
game.createClass('TextButton', 'Button', {
    staticInit: function(asset, text, x, y, callback, textProps) {
        this.super(asset, x, y, callback);
        this.text = new game.Text(text, textProps);
        this.text.anchorCenter();
        this.text.addTo(this.sprite);
    }
});

/**
    @class CircleText
    @constructor
**/
game.createClass('CircleText', 'Text', {
    /**
        Radius of the circle.
        @property {Number} radius
        @default 100
    **/
    radius: 100,
    /**
        Rotation speed.
        @property {Number} speed
        @default 1
    **/
    speed: 1,
    /**
        @property {Number} _count
        @private
    **/
    _count: 0,
    
    update: function() {
        this._count += this.speed * game.delta;
        
        var angleDif = Math.PI * 2 / this.children.length;
        var angle = 0;
        for (var i = 0; i < this.children.length; i++) {
            var child = this.children[i];
            child.x = this.radius * Math.cos(angle + this._count);
            child.y = this.radius * Math.sin(angle + this._count);
            angle += angleDif;
        }
    }
});

/**
    @class WaveText
    @constructor
**/
game.createClass('WaveText', 'Text', {
    /**
        How much is next character behind in movement
        @property {Number} advance
        @default 3
    **/
    advance: 3,
    /**
        How much to move characters
        @property {Number} amount
        @default 10
    **/
    amount: 10,
    /**
        How fast to move characters
        @property {Number} speed
        @default 10
    **/
    speed: 10,
    /**
        @property {Number} _count
        @private
    **/
    _count: 0,
    /**
        @property {Array} _pos
        @private
    **/
    _pos: [],
    
    _generateText: function(width) {
        this.super(width);
        
        this._pos.length = 0;
        for (var i = 0; i < this.children.length; i++) {
            var child = this.children[i];
            this._pos.push(child.y);
        }
    },
    
    update: function() {
        this._count += 50 * game.delta;
        
        for (var i = 0; i < this.children.length; i++) {
            var child = this.children[i];
            var value = (this._count + i * this.advance) / this.speed;
            child.y = this._pos[i] + Math.sin(value) * this.amount;
        }
    }
});

/**
    Adds new methods to Container class
    @class Container
**/
game.Container.inject({
    /**
        @method shake
        @param {Number} amount How much to shake (pixels)
        @param {Number} speed How often to shake (ms)
        @param {Number} duration How long shaking lasts (ms)
        @param {Function} callback Function called, when shaking ends
    **/
    shake: function(amount, speed, duration, callback) {
        if (this._shakePos) this.position.copy(this._shakePos);
        this._shakePos = this.position.clone();
        this._shakeAmount = amount || 10;
        this._shakeSpeed = speed || 100;
        this._shakeSpeedTimer = this._shakeSpeed;
        this._shakeDuration = duration || 1000;
        this._shakeDurationTimer = 0;
        this._shakeCallback = callback;
    },

    updateTransform: function() {
        if (this._shakeDurationTimer < this._shakeDuration) {
            this._shakeDurationTimer += game.delta * 1000;

            if (this._shakeDurationTimer >= this._shakeDuration) {
                this.position.copy(this._shakePos);
                this._shakePos = null;
                if (typeof this._shakeCallback === 'function') this._shakeCallback();
            }
            else {
                this.x = this._shakePos.x + Math.random(-this._shakeAmount, this._shakeAmount);
                this.y = this._shakePos.y + Math.random(-this._shakeAmount, this._shakeAmount);
            }
        }
        this.super();
    }
});

/**
    Adds new methods to Sprite class
    @class Sprite
**/
game.Sprite.inject({
    /**
        @property {Object} _flashTextures
        @private
    **/
    _flashTextures: {},
    
    /**
        @method blink
        @param {Number} [speed] How fast to blink (ms)
        @param {Number} [count] How many times to blink
        @param {Function} [callback] Function called, when blink ends
    **/
    blink: function(speed, count, callback) {
        this._blinkCounter = 0;
        this._blinkCount = count || 1;
        this._blinkCallback = callback;
        this._blinkSpeed = speed || 100;
        this._blinkTimer = 0;
    },
    
    /**
        @method flash
        @param {Number} [speed] How fast to flash (ms)
        @param {String} [color] Color of flash
        @param {Function} [callback] Function called, when flash ends
        @param {Number} [left] How much to cut flash image from left
        @param {Number} [top] How much to cut flash image from top
        @param {Number} [right] How much to cut flash image from right
        @param {Number} [bottom] How much to cut flash image from bottom
    **/
    flash: function(speed, color, callback, left, top, right, bottom) {
        if (this._flashTextures[color]) {
            this._flashTexture = this._flashTextures[color];
        }
        else {
            this._flashDuration = 0;
            this._flashTexture = this._generateTintedTexture(color || '#ffffff');
            this._flashTextures[color] = this._flashTexture;
        }
        this._flashTexture.position.x = left || 0;
        this._flashTexture.position.y = top || 0;
        this._flashTexture.width = right ? this._flashTexture.baseTexture.width - right - left : this._flashTexture.baseTexture.width;
        this._flashTexture.height = bottom ? this._flashTexture.baseTexture.height - bottom - top: this._flashTexture.baseTexture.height;
        this._flashDuration = speed || 100;
        this._flashDurationTimer = 0;
        this._flashCallback = callback;
    },

    _renderCanvas: function(context, transform, rect, offset) {
        if (this._blinkCount && this._blinkCounter < this._blinkCount) {
            this._blinkTimer += game.delta * 1000;
            if (this._blinkTimer < this._blinkSpeed) return;
            if (this._blinkTimer >= this._blinkSpeed && this._blinkCounter === this._blinkCount - 1) {
                this._blinkCount = 0;
                if (typeof this._blinkCallback === 'function') {
                    this._blinkCallback();
                }
            }
            if (this._blinkTimer >= this._blinkSpeed * 2) {
                this._blinkTimer = 0;
                this._blinkCounter++;
            }
        }
        if (this.super(context, transform, rect, offset)) return;
        if (this._flashDurationTimer < this._flashDuration) {
            this._flashDurationTimer += game.delta * 1000;

            if (this._flashDurationTimer >= this._flashDuration) {
                if (typeof this._flashCallback === 'function') this._flashCallback();
                return;
            }

            var alpha = 1 - this._flashDurationTimer / this._flashDuration;
            var texture = this._flashTexture;
            context.globalAlpha = alpha;
            context.drawImage(texture.baseTexture.source, texture.position.x, texture.position.y, texture.width, texture.height, texture.position.x, texture.position.y, texture.width, texture.height);
        }
    }
});

});
