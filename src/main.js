import * as _ from "lodash"

(function() {
  "use strict"
  function makeRandomTime(min, max) {
    return (min + (max - min) * Math.random()) * 60
  }

  class Race {
    constructor() {
      this.speed = -700
      this.weigth = 700
      this.jumpPower = -330
      this.chancePerson = 0.3
    }

    preload() {
      this.game.load.image("sky", "assets/sky.png")
      this.game.load.spritesheet("ground-s", "assets/ground-small.png", 16, 16)
      this.game.load.spritesheet("moto", "assets/moto-sprite.png", 56, 50)
      this.game.load.spritesheet("girl", "assets/girl.png", 30, 48)
      this.game.load.image("mecha", "assets/mecha-down.png")
    }

    create() {
      this.gameOver = false
      this.score = 0
      this.game.physics.startSystem(Phaser.Physics.ARCADE)
      this.game.add.sprite(0, 0, 'sky')

      this.ground = this.game.add.group()
      this.ground.enableBody = true
      for (let n = 0; n < this.game.world.width; n += 32) {
        var part = this.ground.create(n, this.game.world.height - 32, 'ground-s', 10)
        part.scale.setTo(2, 2)
        part.body.velocity.x = this.speed
        part.body.immovable = true
      }

      this.ennemies = this.game.add.group()
      this.ennemies.enableBody = true

      this.persons = this.game.add.group()
      this.persons.enableBody = true

      this.player = this.game.add.sprite(64, this.game.world.height - 150, 'moto')
      this.player.scale.setTo(1.5, 1.5)
      this.game.physics.arcade.enable(this.player)
      this.player.body.bounce.y = 0.2
      this.player.body.gravity.y = this.weigth
      this.player.body.collideWorldBounds = true
      this.player.animations.add('normal', [0, 1, 2, 3], 20, true)
      this.player.animations.play("normal")

      this.cursors = this.game.input.keyboard.createCursorKeys()

      this.text = this.game.add.text(0, 0, "SCORE: 0")

      this.timer = makeRandomTime(2, 3)
    }

    update() {
      if (this.gameOver) {
        if (this.cursors.up.isDown) {
          this.game.state.start("Race")
        }
      } else {
        this.timer -= 1
        this.destroyAndGenerateGround()

        this.game.physics.arcade.collide(this.player, this.ground)
        this.game.physics.arcade.collide(this.player, this.persons, (pl, per) => {
          console.log("Bravo !")
          this.score += 10
          this.text.setText(`SCORE: ${this.score}`)
          per.destroy()
        })
        this.game.physics.arcade.collide(this.player, this.ennemies, (p, e) => {
          console.log("Collide !")
          this.gameOver = true
          this.game.add.text(0, 50, "GAME OVER !")
          _.forEach(this.ground.children, (g) => {
            g.body.velocity.x = 0
          })
          _.forEach(this.ennemies.children, (e) => {
            e.body.velocity.x = 0
          })
          this.player.animations.stop()
        })

        this.player.body.position.x = 64

        if (this.cursors.up.isDown && this.player.body.touching.down) {
          this.player.body.velocity.y = this.jumpPower
        }

        if (this.timer <= 0) {
         if (Math.random() <= this.chancePerson) {
           let person = this.persons.create(this.game.world.width + 10, this.game.world.height - 32 - 48, 'girl')
           person.body.velocity.x = this.speed
           person.animations.add('normal', [0, 1, 2, 3, 4], 20, true)
           person.animations.play("normal")
         } else {
            let ennemy = this.ennemies.create(this.game.world.width + 10, this.game.world.height - 32 - 46, 'mecha')
            ennemy.body.velocity.x = this.speed
         }
          this.timer = makeRandomTime(2, 3)
        }
      }
    }

    destroyAndGenerateGround() {
      var first = this.ground.children[0]
      while (first !== undefined && -first.body.position.x > first.body.width) {
        first.destroy()
        first = this.ground.children[0]
      }
      var last = this.ground.children[this.ground.children.length - 1]
      while (last !== undefined && last.body.position.x < this.game.world.width) {
        let part = this.ground.create(
          last.body.position.x + last.body.width,
          this.game.world.height - 32,
          'ground-s',
          10
        )
        part.scale.setTo(2, 2)
        part.body.velocity.x = this.speed
        part.body.immovable = true

        last = this.ground.children[this.ground.children.length - 1]
      }
    }

  }

  window.onload = () => {
    var game = new Phaser.Game(1000, 400, Phaser.AUTO, "")
    game.state.add('Race', Race)
    game.state.start("Race")
  }
}())
