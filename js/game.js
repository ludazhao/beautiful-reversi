
function GameManager() {
     // create an new instance of a pixi stage with a grey background
     this.stage = new PIXI.Stage(0x888888);
     // create a renderer instance width=640 height=480
     this.renderer = PIXI.autoDetectRenderer(640,480);
     // add the renderer view element to the DOM
     document.body.appendChild(this.renderer.view);
     // importing a texture atlas created with texturepacker
     this.tileAtlas = ["images/images.json"];
     // create a new loader
     this.loader = new PIXI.AssetLoader(this.tileAtlas);                        
     // create an empty container
     this.gameContainer = new PIXI.DisplayObjectContainer();
     // add the container to the stage
     this.stage.addChild(this.gameContainer);
     // use callback
     this.loader.onComplete = this.onTilesLoaded.bind(this);
     //begin load
     this.loader.load();
}
 
GameManager.prototype.onTilesLoaded = function() {

     // first tile picked up by the player
     var firstTile=null;
     // second tile picked up by the player
     var secondTile=null;
     // can the player pick up a tile?
     var canPick=true;

     // choose 24 random tile images
     var chosenTiles=new Array();
     while(chosenTiles.length<48){
          var candidate=Math.floor(Math.random()*44);
          if(chosenTiles.indexOf(candidate)==-1){
               chosenTiles.push(candidate,candidate)
          }              
     }
     // shuffle the chosen tiles
     for(i=0;i<96;i++){
          var from = Math.floor(Math.random()*48);
          var to = Math.floor(Math.random()*48);
          var tmp = chosenTiles[from];
          chosenTiles[from]=chosenTiles[to];
          chosenTiles[to]=tmp;
     }
     // place down tiles
     for(i=0;i<8;i++){
          for(j=0;j<6;j++){
               // new sprite
               var tile = new PIXI.Sprite.fromImage("images/black_tile.jpg");
               // buttonmode+interactive = acts like a button
               tile.buttonMode=true;
               tile.interactive = true;
               // is the tile selected?
               tile.isSelected=false;
               // set a tile value
               tile.theVal=chosenTiles[i*6+j];
               // place the tile
               tile.position.x = Math.random()*600;
               tile.position.y = -Math.random()*100 - 100;
               tile.rotation = Math.random()*2*3.14;
               // paint tile black
               tile.tint = 0x000000;
               // set it a bit transparent (it will look grey)
               tile.alpha=0.5;
               new TWEEN.Tween(tile)
                    .to({x: 7+i*80, y: 7+j*80, rotation:0}, 2400 + Math.random()*1200)
                    .easing(TWEEN.Easing.Elastic.Out)
               .start();
               // add the tile
               this.gameContainer.addChild(tile);
               // mouse-touch listener
               tile.mousedown = tile.touchstart = function(data){
                    // can I pick a tile?
                    if(canPick) {
                         // is the tile already selected?
                         if(!this.isSelected){
                              new TWEEN.Tween(this)
                                   .to({width:0.0, x:"+32"}, 300)
                                   .easing(TWEEN.Easing.Linear.None).onComplete(function() {
                                        this.tint = 0xffffff;
                                   })
                                   .chain(new TWEEN.Tween(this)
                                   .to({alpha: 1.0, width:64, x:"-32"}, 300)
                                   .easing(TWEEN.Easing.Linear.None))
                              .start();
                              // set the tile to selected
                              this.isSelected = true;
                              // show the tile
                              //this.tint = 0xffffff;
                              //this.alpha = 1;
                              // is it the first tile we uncover?
                              if(firstTile==null){
                                   firstTile=this
                              }
                              // this is the second tile
                              else{
                                   secondTile=this
                                   // can't pick anymore
                                   canPick=false;
                                   // did we pick the same tiles?
                                   if(firstTile.theVal==secondTile.theVal){
                                        // wait a second then remove the tiles and make the player able to pick again
                                        setTimeout(function(){
                                             new TWEEN.Tween(firstTile)
                                                  .to({width:"+100", height:"+100", x:"-50", y:"-50", alpha:0.0}, 600)
                                                  .easing(TWEEN.Easing.Linear.None)
                                                  .onComplete(function() {
                                                       gameContainer.removeChild(this);
                                                  })
                                             .start();
                                             new TWEEN.Tween(secondTile)
                                                  .to({width:"+100", height:"+100", x:"-50", y:"-50", alpha:0.0}, 600)
                                                  .easing(TWEEN.Easing.Linear.None).onComplete(function() {    
                                                       gameContainer.removeChild(this);
                                                       canPick=true;
                                                  })
                                             .start();
                                             firstTile=null;
                                             secondTile=null;
                                        },1000);
                                   }
                                   // we picked different tiles
                                   else{
                                        // wait a second then cover the tiles and make the player able to pick again
                                        setTimeout(function(){
                                             firstTile.isSelected=false
                                             secondTile.isSelected=false
                                             new TWEEN.Tween(firstTile)
                                                  .to({alpha: 0.5, width:0.0, x:"+32"}, 150)
                                                  .easing(TWEEN.Easing.Linear.None).onComplete(function() {
                                                       this.tint = 0x000000;
                                                  })
                                                  .chain(new TWEEN.Tween(firstTile)
                                                  .to({width:64, x:"-32"}, 150)
                                                  .easing(TWEEN.Easing.Linear.None))
                                             .start();
                                             new TWEEN.Tween(secondTile)
                                                  .to({alpha: 0.5, width:0.0, x:"+32"}, 150)
                                                  .easing(TWEEN.Easing.Linear.None)
                                                  .onComplete(function() {
                                                       this.tint = 0x000000;
                                                       canPick=true;
                                                  })
                                                  .chain(new TWEEN.Tween(secondTile)
                                                  .to({width:64, x:"-32"}, 150)
                                                  .easing(TWEEN.Easing.Linear.None))
                                             .start();
                                             firstTile=null;
                                             secondTile=null;
                                        },1000);
                                   }
                              }    
                         }
                    }
               }
          }
     } 
     requestAnimationFrame(this.animate.bind(this));
};

GameManager.prototype.animate = function (){
     requestAnimationFrame(this.animate.bind(this));
     TWEEN.update();
     this.renderer.render(this.stage);
};

