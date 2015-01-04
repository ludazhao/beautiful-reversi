
function GameManager() {
     // create an new instance of a pixi stage with a grey background
     this.stage = new PIXI.Stage(0x888888);
     // create a renderer instance width=640 height=480
     this.renderer = PIXI.autoDetectRenderer(640,640);
     // add the renderer view element to the DOM
     document.getElementById("gameWindow").insertBefore(this.renderer.view, document.getElementById("blackIndicator"));
     // create an empty container
     this.gameContainer = new PIXI.DisplayObjectContainer();
     // add the container to the stage
     this.stage.addChild(this.gameContainer);

     this.startGame();
}
 
GameManager.prototype.startGame = function() {
     // place down tiles
     var grid = new Grid(8, this.gameContainer); 
     grid.initBoard();
     requestAnimationFrame(this.animate.bind(this));
};

GameManager.prototype.animate = function (){
     requestAnimationFrame(this.animate.bind(this));
     TWEEN.update();
     this.renderer.render(this.stage);
};

