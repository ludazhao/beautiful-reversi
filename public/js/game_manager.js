
function GameManager(Client_IO) {
     this.IO = new Client_IO(this); //create new socket IO instance

     //Cache the different templates
     this.$gameArea = $('#gameArea');
     this.$templateIntroScreen = $('#intro-screen-template').html();
     this.$templateNewGame = $('#create-game-template').html();
     this.$templateJoinGame = $('#join-game-template').html();
     this.$mainGame = $('#main-game-template').html();
     this.$doc = $(document);

     this.$gameArea.html(this.$templateIntroScreen);
     this.playerNum = 0;

     //single player, starts game directly
     this.$doc.on('click', "#btnStartSingleGame", this.startGame.bind(this, null));

     this.$doc.on('click', '#btnCreateGame', this.onCreateGameClick.bind(this));
     this.$doc.on('click', '#btnJoinGame', this.onJoinGameClick.bind(this));
     this.$doc.on('click', '#btnStart', this.onPlayerStartClick.bind(this));

}

/*****************************/
/* Player 1 Pre-Game Actions */
/*****************************/
GameManager.prototype.onCreateGameClick = function() {
     this.IO.onCreateGameClick();
}

GameManager.prototype.displayNewGameScreen = function() {
     // Fill the game screen with the appropriate HTML
     this.$gameArea.html(this.$templateNewGame);
     // Display the URL on screen
     $('#gameURL').text(window.location.href);
     // Show the gameId / room id on screen
     $('#spanNewGameCode').text(this.IO.gameId);
}

/*****************************/
/* Player 2 Pre-Game Actions */
/*****************************/
GameManager.prototype.onJoinGameClick = function() {
     this.$gameArea.html(this.$templateJoinGame);
}

GameManager.prototype.onPlayerStartClick = function() {
     var data = {
         gameId : +($('#inputGameId').val()),
         playerName : $('#inputPlayerName').val() || 'anon'
     };

     this.IO.onPlayerStartClick(data);

     // Set the appropriate properties for the current player.
     this.playerNum = 2;
     this.playerName = data.playerName;
}


/*******************/
/* In-Game Actions */
/*******************/

GameManager.prototype.startGame = function(data) {
     this.$gameArea.html(this.$mainGame);
     this.playerData = data;

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
     this.grid = new Grid(8, this, this.gameContainer, this.playerNum); 
     this.grid.initBoard();
     requestAnimationFrame(this.animate.bind(this));
};

GameManager.prototype.sendMove = function(data) {
     data.playerNum = this.playerNum;
     data.gameId = this.playerData.gameId;
     this.IO.sendMove(data);
}

GameManager.prototype.receiveMove = function(data) {
     this.grid.makeMove(data['move'][0], data['move'][1], false); //make move received from opponent
}

GameManager.prototype.animate = function (){
     requestAnimationFrame(this.animate.bind(this));
     TWEEN.update();
     this.renderer.render(this.stage);
};

