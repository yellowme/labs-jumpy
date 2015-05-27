window.addEventListener("load",function() {

  var Q = window.Q = Quintus()
          .include("Sprites, Scenes, Input, 2D, Anim, Touch, UI")
          .setup({ maximize: true })
          .controls().touch()

  // ## Jumpy Sprite
  // Crea la clase jumpy
  Q.Sprite.extend("Player",{
    init: function(p) {
      this._super(p, {
        sheet: "player",  
        x: 0,           
        y: 90             
      });

      this.add('2d, platformerControls');
    }
  });

  // ## Enemy Sprite
  // Crea la clase enemigo
  Q.Sprite.extend("Enemy",{
    init: function(p) {
      this._super(p, { sheet: 'enemy', vx: 100 });
      this.add('2d, aiBounce');

      // si el enemigo choca con jumpy se acaba el juego
      this.on("bump.left,bump.right,bump.bottom",function(collision) {
        if(collision.obj.isA("Player")) { 
          Q.stageScene("endGame",1, { label: "Te han atrapado" }); 
          collision.obj.destroy();
        }
      });

      // si el enemigo recibe un golpe en la cabeza de jumpy se destruye
      this.on("bump.top",function(collision) {
        if(collision.obj.isA("Player")) { 
          this.destroy();
          collision.obj.p.vy = -300;
        }
      });
    }
  });

  // ## Level scene
  // Crea una escena llamada level1
  Q.scene("level1",function(stage) {
    // el background es parallax
    stage.insert(new Q.Repeater({ asset: "background-wall.png", speedX: 0.5, speedY: 0.5 }));

    // Add in a tile layer, and make it the collision layer
    stage.collisionLayer(new Q.TileLayer({
                               dataAsset: 'level.json',
                               sheet:     'tiles' }));

    // crea a jumpy
    var player = stage.insert(new Q.Player());

    // el nivel debe seguir al jugador
    stage.add("viewport").follow(player);

    // agrega un enemigo inicialmente
    stage.insert(new Q.Enemy({ x: 700, y: 0 }));

    // agrega enemigos cada determinado tiempo
    stage.insert(new Q.Enemy({ x: 800, y: 0 }));
  });

  // Crea el popup de juego finalizado
  Q.scene('endGame',function(stage) {
    var container = stage.insert(new Q.UI.Container({
      x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)"
    }));
    var button = container.insert(new Q.UI.Button({ x: 0, y: 0, fill: "#CCCCCC", label: "Otra vez" }))         
    var label = container.insert(new Q.UI.Text({x:10, y: -10 - button.p.h, label: stage.options.label }));
    // cuando seleccionan el boton se reinicia
    button.on("click",function() {
      Q.clearStages();
      Q.stageScene('level1');
    });
    container.fit(20);
  });

  // ## Asset Loading and Game Launch
  Q.load("sprites.png, sprites.json, level.json, tiles.png, background-wall.png", function() {
    Q.sheet("tiles","tiles.png", { tilew: 32, tileh: 32 });
    Q.compileSheets("sprites.png","sprites.json");
    Q.stageScene("level1");
  });
});