function Client_IO(gameManager) {
	console.log("New IO instance created.");
	this.socket = io.connect();
	this.bindEvents();
	this.gameManager = gameManager;
}

Client_IO.prototype.bindEvents = function() {

	this.socket.on('connected', this.onConnected.bind(this));
	this.socket.on('newGameCreated',this.newGameCreated.bind(this));
	this.socket.on('playerJoinedRoom',this.playerJoinedRoom.bind(this));
	this.socket.on('newMove',this.newMove.bind(this));
	this.socket.on('gameOver',this.gameOver.bind(this));
	this.socket.on('noSuchGame',this.noSuchGame.bind(this));
}

/* outgoing IO handlers. called from GameManager */
Client_IO.prototype.onCreateGameClick = function() {
	this.socket.emit('hostCreateNewGame');
	console.log("client_io: onCreateGameClick sent.");
}

Client_IO.prototype.onPlayerStartClick = function(data) {
    this.socket.emit('playerJoinGame', data);
	console.log("client_io: onJoinGameClick sent.");
}

Client_IO.prototype.sendMove = function(data) {
    this.socket.emit('newMove', data);
	console.log("client_io: newMove sent.");
}

/* receiving IO handlers */
Client_IO.prototype.onConnected = function() {
	console.log("client_io: Client with ID " + this.socket.id + " has connected to the game!");
}

Client_IO.prototype.newGameCreated = function(data) {
	console.log("client_io: newGameCreated received");
	console.log(data);
	this.gameId = data.gameId;
	this.gameManager.playerNum = 1;
	this.gameManager.playerName = "Host";
	this.gameManager.displayNewGameScreen();

}

Client_IO.prototype.playerJoinedRoom = function(data) {
	console.log("client_io: playerJoinedRoom received");
	this.gameManager.startGame(data);
}

Client_IO.prototype.newMove = function(data) {
	console.log("client_io: newMove received");

	//ignore if it is with same id
	if (this.gameManager.playerNum != data.playerNum) {
		this.gameManager.receiveMove(data);
	}
}

Client_IO.prototype.gameOver = function() {
	console.log("gameOver received");
}

Client_IO.prototype.noSuchGame = function(data) {
	alert(data.message);
}