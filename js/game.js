// create a new scene
let gameScene = new Phaser.Scene('Game');

// initiates the scene parameters;
gameScene.init = function () {
    this.playerSpeed = 3;
    //enemy speed
    this.enemyMinSpeed = 1;
    this.enemyMaxSpeed = 4;
    this.enemyMinY = 80;
    this.enemyMaxY = 280;

    this.isTerminating = false;
};

// load assets
gameScene.preload = function () {
    //load images
    this.load.image('background', 'assets/background.png');
    this.load.image('player', 'assets/player.png');
    this.load.image('enemy', 'assets/dragon.png');
    this.load.image('goal', 'assets/treasure.png')
};

// called once afer the preLoad ends
gameScene.create = function () {
    //create background sprite
    let bg = this.add.sprite(0, 0, 'background');
    let gameW = this.sys.game.config.width;
    let gameH = this.sys.game.config.height;
    bg.setPosition(gameW / 2, gameH / 2);
    // console.log(gameW, gameH);
    // console.log(bg);
    // console.log(this);

    // create the player
    this.player = this.add.sprite(50, this.sys.game.config.height / 2, 'player');
    this.player.depth = 1;
    this.player.setScale(0.5);

    // goal
    this.goal = this.add.sprite(this.sys.game.config.width - 80, this.sys.game.config.height / 2, 'goal');
    this.goal.setScale(0.5);

    // enemy group
    this.enemies = this.add.group({
        key: 'enemy',
        repeat: 5,
        setXY: {
            x: 90,
            y: 100,
            stepX: 80,  // seperation for X
            stepY: 20   // separation for Y
        }
    });

    // this.enemy = this.add.sprite(120, this.sys.game.config.height / 2, 'enemy');
    // this.enemy.flipX = true;
    // this.enemy.setScale(0.6);

    // this.enemies.add(this.enemy);
    Phaser.Actions.ScaleXY(this.enemies.getChildren(), -.6, -.6);

    console.log(this.enemies);
    console.log(this.enemies.getChildren());

    // set flipX, and speed
    Phaser.Actions.Call(this.enemies.getChildren(), function(enemy) {
        // flip enemy
        enemy.flipX = true;
        // set spped
        let dir = (Math.random() < 0.5) ? 1 : -1;
        let speed = Math.floor(Math.random() * this.enemyMaxSpeed) + 1;
        enemy.speed = dir * speed;
    }, this);

    // set enemy speed

    // console.log(dir);
    // console.log(speed);


    // let playerRect = this.player.getBounds();
    // console.log(playerRect);

};


gameScene.update = function () {

    // don't execute if we are terminating

    if (this.isTerminating) {
        return;
    }


    // check for active input
    if (this.input.activePointer.isDown) {
        // player walks
        this.player.x += this.playerSpeed;
    }

    // treasure overlap check
    let playerRect = this.player.getBounds();
    let treasureRect = this.goal.getBounds();

    if (Phaser.Geom.Intersects.RectangleToRectangle(playerRect, treasureRect)) {
        console.log("reached goal");

        // restart the scene
        return this.gameOver();
    }


    // get enemeies
    let enemies = this.enemies.getChildren();
    let numEnemies = enemies.length;

    for (let i = 0; i < numEnemies; i++) {
        enemies[i].y += enemies[i].speed;

        // check we haven't passed the min Y
        let conditionUp = enemies[i].speed < 0 && enemies[i].y <= this.enemyMinY;
        let conditionDown = enemies[i].speed > 0 && enemies[i].y >= this.enemyMaxY;
        // if we pass the upper or lower limit, then reverse
        if (conditionDown || conditionUp) {
            enemies[i].speed *= -1;
        }

        let enemyRect = enemies[i].getBounds();
        if (Phaser.Geom.Intersects.RectangleToRectangle(playerRect, enemyRect)) {
            // console.log("game over");

            // restart the scene
            return this.gameOver();
        }
    }




    // check we haven't passed the min Y
    let conditionUp = this.enemySpeed < 0 && this.enemy.y <= this.enemyMinY;
    let conditionDown = this.enemySpeed > 0 && this.enemy.y >= this.enemyMaxY;
    // if we pass the upper or lower limit, then reverse
    if (conditionDown || conditionUp) {
        this.enemySpeed *= -1;
    }
    // check we haven't passed the max Y
    // console.log(playerRect);
};

gameScene.gameOver = function () {
    // initiated game over sequence
    this.isTerminating = true;

    this.cameras.main.shake(500);
    // console.log(this.cameras.main);
    // listen for event completion
    this.cameras.main.on('camerashakecomplete', function(camera, effect) {
        // fadeout
        this.cameras.main.fade(500);
    }, this); // used to listen to event

    this.cameras.main.on('camerafadeoutcomplete', function(camera, effect) {
        this.scene.restart();
    }, this);


};


// set the configuration of the game
let config = {
    type: Phaser.AUTO,
    width: 640,
    height: 360,
    scene: gameScene
};

// create a new game, pass a configuration to it
let game = new Phaser.Game(config);

//init starts the parameters of the scene
//preload - images, etc. is loaded into memory so there is no delay
//create - creates the sprites and displays on scene
//update - called on each frame on the gameplay

