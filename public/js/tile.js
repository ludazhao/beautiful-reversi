function Tile(sprite, row, col, color) {
	this.color = color; // "white" for white, "black" for black, null for empty
	this.row = row;
	this.col = col;

	this.sprite = sprite;
	this.animateInitial();
}


Tile.prototype.animateInitial = function() {

	this.sprite.buttonMode = true;
	this.sprite.interactive = true;

	this.sprite.position.x = Math.random()*600;
	this.sprite.position.y = -Math.random()*100 - 100;
	this.sprite.rotation = Math.random()*2*3.14;

	if (this.color == null) { 	//paint tile grey
		this.sprite.tint = 0x000000;
		this.sprite.alpha=0.1;
	} else if (this.color == "white"){
		this.sprite.tint = 0xffffff;
		this.sprite.alpha = 1.0;		
	} else if (this.color == "black"){
		this.sprite.tint = 0x000000;
		this.sprite.alpha=0.9;
	}

	var row = this.row;
	var col = this.col;

    new TWEEN.Tween(this.sprite)
         .to({x: 7+ row * 80, y: 7 + col * 80, rotation:0}, 2400 + Math.random()*1200)
         .easing(TWEEN.Easing.Elastic.Out)
    .start();           
}

Tile.prototype.flip = function(currPlayerColor) {
	this.color = currPlayerColor;

	//disable the player from clicking the tile while it is animating
	var tempMousedown = this.sprite.mousedown;
	this.sprite.mousedown = null;

	if (this.color == "white") {
		new TWEEN.Tween(this.sprite)
		     .to({width:0.0, x:"+32"}, 300)
		     .easing(TWEEN.Easing.Linear.None).onComplete(function() {
		          this.tint = 0xffffff;
		     })
		     .chain(new TWEEN.Tween(this.sprite)
		     .to({alpha: 1.0, width:64, x:"-32"}, 300)
		     .easing(TWEEN.Easing.Linear.None).onComplete(function() {
		     	this.mousedown = tempMousedown;
		     }))
		.start();
	} else {
		new TWEEN.Tween(this.sprite)
		   .to({width:0.0, x:"+32"}, 300)
		   .easing(TWEEN.Easing.Linear.None).onComplete(function() {
		        this.tint = 0x000000;
		   })
		   .chain(new TWEEN.Tween(this.sprite)
		   .to({alpha: 0.9, width:64, x:"-32"}, 300)
		   .easing(TWEEN.Easing.Linear.None).onComplete(function(){
		   		this.mousedown = tempMousedown;
		   }))
		.start();
	}
}

Tile.prototype.noFlipAnimate = function() {

	var tempMousedown = this.sprite.mousedown;
	this.sprite.mousedown = null;

	new TWEEN.Tween(this.sprite).to({x:"+6"}, 50).chain(
	new TWEEN.Tween(this.sprite).to({x:"-12"}, 50).chain(
	new TWEEN.Tween(this.sprite).to({x:"+6"}, 50)
	.onComplete(function(){
	  	this.mousedown = tempMousedown;
	 }))).start();
}

Tile.prototype.isWhite = function(){
	return this.color == "white";
}