var io;
var socket;

exports.initGame = function(sio, socket){
    io = sio;
    gameSocket = socket;
    gameSocket.emit('connected', { message: "You are connected!" });

    gameSocket.on('hostCreateNewGame', hostCreateNewGame);

    // Player Events
    gameSocket.on('playerJoinGame', playerJoinGame);
    gameSocket.on('newMove', newMove);
    gameSocket.on('gameOver', gameOver);
}

function hostCreateNewGame() {
	// Create a unique Socket.IO Room
	var thisGameId = ( Math.random() * 10000000 ) | 0;

	// Return the Room ID (gameId) and the socket ID (mySocketId) to the browser client
	this.emit('newGameCreated', {gameId: thisGameId, mySocketId: this.id});

	// Join the Room and wait for the players
	this.join(thisGameId.toString());
}

function playerJoinGame(data) {
    console.log('Player ' + data.playerName + ' attempting to join game: ' + data.gameId );

    // A reference to the player's Socket.IO socket object
    var sock = this;

    // If the room exists...
    if(data.gameId in gameSocket.adapter.rooms){
    	console.log("Room is found.");
        // attach the socket id to the data object.
        data.serverSocketId = sock.id;

        // Join the room
        sock.join(data.gameId);

        console.log('Player ' + data.playerName + ' joining game: ' + data.gameId );

        // Emit an event notifying the clients that the player has joined the room.
        io.sockets.in(data.gameId).emit('playerJoinedRoom', data);

    } else {
    	console.log("Room is not found.");
        // Otherwise, send an error message back to the player.
        this.emit('noSuchGame',{message: "This room does not exist."} );
    }
}

function newMove(data) {
	console.log("Received Move with data: ");
	console.log(data);
	io.sockets.in(data.gameId).emit('newMove', data);
}

function gameOver(data) {

}