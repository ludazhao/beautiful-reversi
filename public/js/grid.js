function Grid(size, gameManager, gameContainer, playerNum) {
	this.size = size;
	this.gm = gameManager;
	this.isMulti = playerNum != 0;
	this.playerNum = playerNum; //0 for single player, 1 for multi-player white, 2 for multi-player black
	this.gameContainer = gameContainer;

	//White Starts
	if (this.playerNum == 0 || this.playerNum == 1) {
		this.isYourTurn = true;
	} else {
		this.isYourTurn = false;
	}
	this.currPlayer = "white";
	this.numPlayed = 0;
	this.grid = [];

}

Grid.prototype.initBoard = function() {
	this.grid = [];

	for (var x = 0; x < this.size; x++) {
		var row = this.grid[x] = [];

		for (var y = 0; y < this.size; y++) {
			var color = null;

			//create center pieces
			if ((x === 3 && y === 3) || (x === 4 && y === 4)) {
				color = "white";
			}
			if ((x === 4 && y === 3) || (x === 3 && y === 4)) {
				color = "black";
			}
			this.numPlayed = 4;

			var tile = new Tile(new PIXI.Sprite.fromImage("images/white_tile.jpg"), x, y, color);
			// add the tile
			this.gameContainer.addChild(tile.sprite);

			// attach a mouse listener to each tile and pass the grid object into makeMove(passing 'true' for own move)
			tile.sprite.mousedown = tile.sprite.touchstart = this.makeMove.bind(this, x, y, true);

		  	row.push(tile);
		}
	}
	this.setTurnColor(this.currPlayer);
}

//function executing a possible move. 
Grid.prototype.makeMove = function(x, y, isOwnMove){
	if (!this.isYourTurn && isOwnMove) return; //can't make a move when waiting for the other player
	var moveColor = this.currPlayer;
	console.log("movecolor: "+ moveColor);

	//remove game message
	if (this.numPlayed == 4) {
		$("#gameMessage").text("");
	}
	var tile = this.grid[x][y];

	//if the tile is already used
	if (tile.color !== null) {
		tile.noFlipAnimate();
		return;
	}

	//find a Array of tiles that needs to be flipped
	var allAlteredTiles = this.findAlteredTiles(tile, moveColor);
	if (allAlteredTiles.length <= 1) {
		tile.noFlipAnimate();
		return;
	}

	var moveData = {}
	moveData['move'] = [x, y];

	this.numPlayed += 1;
	//flip all pieces
	for (var i = 0; i < allAlteredTiles.length; i++) {
		allAlteredTiles[i].flip(moveColor);
	}

	this.updateCountsGraphics();
	//check for game-end conditions
	moveData['gameOver'] = this.handleGameOver();

	//if opponents cannot make a move, the current player keeps his turn
	if (this.opponentsMovesPossible(moveColor)){
		this.currPlayer = this.flipColor(this.currPlayer);
		this.setTurnColor(this.currPlayer);

		//handle multiplayer player-switching
		if (this.isMulti) {
			if (isOwnMove) {
				this.gm.sendMove(moveData);
				this.isYourTurn = false;
				$("#gameMessage").text("Waiting for Opponent's Turn...");
			} else {
				this.isYourTurn = true;
				$("#gameMessage").text(" ");
			}
		}
	}
}

Grid.prototype.checkGameOver = function(){
	if (this.numPlayed === this.size * this.size
		|| (!this.opponentsMovesPossible("white") && !this.opponentsMovesPossible("black"))) {

			document.getElementById("blackIndicator").classList.remove('active');
			document.getElementById("whiteIndicator").classList.remove('active');
		if (this.numColor("white") > this.numColor("black")) {
			document.getElementById("whiteIndicator").classList.add('activeWon');
			this.gameMssg.innerHTML = "White Wins!";
		}
		if (this.numColor("black") > this.numColor("white")){
			document.getElementById("blackIndicator").classList.add('activeWon');
			this.gameMssg.innerHTML = "Black Wins!";
		}
		if (this.numColor("black") === this.numColor("white")) {
			document.getElementById("whiteIndicator").classList.add('activeWon');
			document.getElementById("blackIndicator").classList.add('activeWon');
			this.gameMssg.innerHTML = "Tie!!";
		}
		return true;
	}
	return false;
}

//returns true if there is a possible move for the next player, false otherwise
Grid.prototype.opponentsMovesPossible = function(currPlayer){
	var nextPlayer = currPlayer === "white" ? "black" : "white";
	for (var x = 0; x < this.size; x++) {
		for (var y = 0; y < this.size; y++) {
			if (!this.grid[x][y].color && this.findAlteredTiles(this.grid[x][y], nextPlayer).length > 1) {
				return true;
			}
		}
	}
	return false;
}

//for a particular move, find all tiles that would be affected
Grid.prototype.findAlteredTiles = function(tile, currPlayerColor) {
	var tiles = [];
	tiles.push(tile); //add the tile itself

	//For all 8 directions, find the tiles that needs to be flipped
	for (var i = -1; i <= 1; i++) {
		for (var j = -1; j <= 1; j++) {
			if (i !== 0 || j !== 0) {
				//add the tiles that need to be flipped for a particular direction
				tiles.push.apply(tiles, this.findTilesByDir(tile, currPlayerColor, i, j)); //i and j represent direction
			}
		}
	}

	return tiles;

}

//finds the tiles that needs to be flipped for a certain direction
Grid.prototype.findTilesByDir = function(tile, currPlayerColor, dirX, dirY) {
	var tiles = [];
	var currRow = tile.row + dirX;
	var currCol = tile.col + dirY;
	while (this.inBounds(currRow, currCol)) {
		if (!this.grid[currRow][currCol].color) break;
		if (this.grid[currRow][currCol].color === currPlayerColor) {
			return tiles;
		}
		//otherwise it is a opposite colored tile. push it to the array
		tiles.push(this.grid[currRow][currCol]);
		currRow += dirX;
		currCol += dirY;
	}

	//no tiles can be flipped in this direction
	return [];
}

//helper function to see if a tile is in bounds
Grid.prototype.inBounds = function(x, y) {
	return (x >= 0 && y >= 0 && x < this.size && y < this.size);
}

//return current amount of tiles that are colored white or black
Grid.prototype.numColor = function(color){
	var res = 0;
	for (var i = 0; i < this.size; i++) {
		for (var j = 0; j < this.size; j++) {
			if (this.grid[i][j].color === color) res += 1;
		}
	}
	return res;
}

Grid.prototype.updateCountsGraphics = function() {
	document.getElementById("blackCount").innerHTML	= this.numColor("black");	
	document.getElementById("whiteCount").innerHTML = this.numColor("white");
}

//Set the turn indicators 
Grid.prototype.setTurnColor = function(color) {
	if (color === "white") {
		$("#whiteIndicator").addClass('active');
		$("#blackIndicator").removeClass('active');
	} else if (color === "black") {
		$("#blackIndicator").addClass('active');
		$("#whiteIndicator").removeClass('active');
	}
}

Grid.prototype.flipColor = function(color) {
	if (color == 'black') {
		return 'white';
	}
	if (color == 'white') {
		return 'black';
	}
	return null;
}
