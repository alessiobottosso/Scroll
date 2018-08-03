

game.module(
	'game.main'
)

// Required Plugins
.require(
	'plugin.spine',
	'plugin.essentials',
	'plugin.p2',
	'plugin.instantgames',
)

.body(function() {

// Required Assets

game.addAsset('sprite.png');

game.createScene('Main', {
    init: function() {
        var myContainer = new game.Container();
        myContainer.anchorCenter();
        //myContainer.center(this.stage);
        myContainer.addTo(this.stage);
        var level = new game.Container();
        level.anchorCenter();
        level.center(myContainer);
        level.addTo(myContainer);

        var bg = new game.TilingSprite('sprite.png', game.width*1 , game.height * 2);
        bg.anchorCenter();
        bg.center(level);
        bg.alpha = 0.2;
        bg.addTo(level);

        this.sprite = new game.Sprite('sprite.png');
        this.sprite.anchorCenter();
        //this.sprite.center(this.stage);
        this.sprite.x=0;
        this.sprite.y=0;
        this.sprite.addTo(level);

        var camera = new game.Camera(this.sprite);
        //camera.center();
        camera.maxSpeed =300;
        camera.acceleration=10;
        //camera.offset.x=0;
        camera.position.x=-380;
        camera.position.y=-510;
        camera.sensorSize= new game.Vector(5);
        camera.addTo(level);

        var b=10;
        var mask = new game.Graphics();
        var w = game.width / 4
        var h = game.height / 4
        mask.drawRect(w,h, 2*w,2*h);
        myContainer.mask = mask;
        
        var grap = new game.Graphics();
        grap.drawRect(-10,-10,20,20);
        grap.addTo(level);
        /*
        var grap = new game.Graphics();
        grap.drawRect(-15,-15,30,30);
        grap.addTo(myContainer);
        */
    },

    update: function() {
        var speed = 300;
        if (game.keyboard.down('LEFT')) this.sprite.x -= speed * game.delta;
        if (game.keyboard.down('RIGHT')) this.sprite.x += speed * game.delta;
        if (game.keyboard.down('UP')) this.sprite.y -= speed * game.delta;
        if (game.keyboard.down('DOWN')) this.sprite.y += speed * game.delta;
    },
    
    swipe: function(dir) {
        if (dir === 'UP') this.sprite.position.y -= 125;
        else if (dir === 'DOWN') this.sprite.position.y += 125;
    }
});





});