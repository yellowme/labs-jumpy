window.addEventListener("load",function() {
  var enemies = [];
  var intervalId;
  var ended = false;
  var Q = window.Q = Quintus()
          .include("Sprites, Scenes, Input, 2D, Anim, Touch, UI, Audio")
          .setup({ maximize: true })
          .enableSound()
          .controls().touch()

  // ## Jumpy Sprite
  // Crea la clase jumpy
  Q.Sprite.extend("Player",{
    init: function(p) {
      this._super(p, {
        sheet: "player",
        sprite: "player",
        x: Q.width/2,
        y: 90      });

      this.add('2d, platformerControls, animation');
      this.on("jump",function() {
        this.destroy();
      });
      Q.input.on("up",this,"jumped");
    },

    jumped: function(obj) {
      Q.audio.play('jump.mp3');
    },

    step: function(dt) {
      var processed = false;
      if(!processed) { 
        this.p.gravity = 1;
        this.p.ignoreControls = false;

        if(this.p.vx > 0) {
          this.play("walk_right");
          this.p.direction = "right";
        } else if(this.p.vx < 0) {
          this.play("walk_left");
          this.p.direction = "left";
        } else {
          this.play("stand");
        }
      }
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
          var randomnumber = Math.floor(Math.random() * (1000 - 100 + 1)) + 100;
          Q.stage().insert(new Q.Enemy({ x: randomnumber, y: 0 }));
          randomnumber = Math.floor(Math.random() * (1000 - 100 + 1)) + 100;
          Q.stage().insert(new Q.Enemy({ x: randomnumber, y: 0 }));
          this.destroy();
          collision.obj.p.vy = -300;
          Q.audio.play('hit.mp3');
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

    var container = stage.insert(new Q.UI.Container({
      fill: "gray",
      border: 5,
      shadow: 10,
      shadowColor: "rgba(0,0,0,0.5)",
      y: 400,
      x: Q.width/2 - 100 
    }));
    
    var num = 25;
    var element = null;
    var addEnemy = function(){
      if(num > 0) {
        if(element != null) {
          element.destroy();
        }
        element = stage.insert(new Q.UI.Text({
          label: num.toString(),
          size: 54,
          color: "white",
          x: 100,
          y: -300
        }), container);
        num = num - 1;
        var randomnumber = Math.floor(Math.random() * (1000 - 100 + 1)) + 100;
        var enemy = stage.insert(new Q.Enemy({ x: randomnumber, y: 0 }));
        enemies.push(enemy);
      } else {
        element.destroy();
        element = stage.insert(new Q.UI.Text({
          label: num.toString(),
          size: 54,
          color: "white",
          x: 100,
          y: -300
        }), container);
        clearInterval(intervalId); 
        Q.clearStages();
        Q.stageScene("endGame",1, { label: "Felicidades!!!" });
      }
    };
    intervalId = setInterval(addEnemy, 1000);

    // crea a jumpy
    var player = stage.insert(new Q.Player());

    // el nivel debe seguir al jugador
    //stage.add("viewport").follow(player);

    // agrega un enemigo inicialmente
    var randomnumber = Math.floor(Math.random() * (1000 - 100 + 1)) + 100;
    var enemy = stage.insert(new Q.Enemy({ x: randomnumber, y: 0 }));
    enemies.push(enemy);

    // agrega enemigos cada determinado tiempo
    randomnumber = Math.floor(Math.random() * (1000 - 100 + 1)) + 100;
    var enemy2 = stage.insert(new Q.Enemy({ x: randomnumber, y: 0 }));
    enemies.push(enemy2);
  });

  Q.el.addEventListener("keydown",function(e) {
    if(ended)    
        if(e.keyCode == 32 || e.keyCode == 13){        
          Q.clearStages();
          Q.stageScene('level1');
          ended = false;
        }
  },false);

  // Crea el popup de juego finalizado
  Q.scene('endGame',function(stage) {
    ended = true;
    var container = stage.insert(new Q.UI.Container({
      x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)"
    }));
    var button = container.insert(new Q.UI.Button({ x: 0, y: 0, fill: "#CCCCCC", label: "Volver a intentar" }))         
    var label = container.insert(new Q.UI.Text({x:10, y: 0 - button.p.h, label: stage.options.label }));
    // cuando seleccionan el boton se reinicia        
    button.on("click",function() {
      Q.clearStages();
      Q.stageScene('level1');
      ended = false;
    });

    clearInterval(intervalId); 
    container.fit(20);
  });

  // ## Asset Loading and Game Launch
  Q.load("sprites.png, sprites.json, level.json, tiles.png, background-wall.png, jump.mp3, hit.mp3, player.png, player.json", function() {
    Q.sheet("tiles","tiles.png", { tilew: 32, tileh: 32 });
    Q.compileSheets("sprites.png","sprites.json");
    Q.compileSheets("player.png","player.json");
    Q.animations("player", {
      stand: { frames: [0], rate: 1/15, flip: false, loop: false },
      walk_right: { frames: [0,1,2], rate: 1/30, flip: false, loop: true },
      walk_left: { frames:  [0,1,2], rate: 1/30, flip:"x", loop: true }
    });
    Q.stageScene("level1");
  });

});