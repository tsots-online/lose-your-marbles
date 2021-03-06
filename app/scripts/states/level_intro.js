'use strict';

define(['phaser', 'states/level_master', 'prefabs/fade_tween', 'prefabs/level_splash', 'prefabs/level_foreground', 'prefabs/skill_menu', 'util/gestures', 'util'], function(Phaser, LevelMasterState, FadeTween, LevelSplash, LevelForeground, SkillMenu, Gesture, Util) {
    function LevelIntroState() {}

    LevelIntroState.prototype = {
        init: function(levelData, transitionData) {
            this.levelData = levelData;
            this.transitionData = transitionData;
        },

        create: function() {
            this.fx = Util.parseAudioSprite(this.game);
            
            var level = this.levelData.level;
            
            this.background = this.game.add.sprite(0, 0, 'marbleatlas2', 'TRANS' + level + 'B.png');

            this.foreground = new LevelForeground(this.game, level, this.fx);
            
            this.fadeBg = new FadeTween(this.game, 0xffffff, 1);
            this.game.add.existing(this.fadeBg);
            
            this.levelSplash = new LevelSplash(this.game, level);
        
            this.levelSplash.x = (this.game.width - this.levelSplash.width) / 2;
            this.levelSplash.y = (this.game.height - this.levelSplash.height) / 2;
            
            var tweenIntro = this.tweenIntro();
            
            if (this.levelData.level === 1) {

                // parent undefined, added to the game world.
                this.skillMenu = new SkillMenu(this.game, undefined, this.fx);
            
                this.skillMenu.x = this.game.width / 4 - 30;
                this.skillMenu.y = this.game.height / 2;
                this.skillMenu.scale = { x: 0, y: 0 };

                this.skillMenu.onMenuSelect.add(this.skillMenuSelected, this);

                var tweenSkillMenuPop = this.tweenSkillMenuPop();
                
                tweenIntro.chain(tweenSkillMenuPop);

                tweenSkillMenuPop.onStart.add(function() {
                    Util.playSfx(this.fx, 'ZOOMIN');
                }, this);
                
                this.upKey = this.game.input.keyboard.addKey(Phaser.Keyboard.UP);
                this.downKey = this.game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
                this.enterKey = this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
                this.spacebarKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

                this.gestures = new Gesture(this.game);
            } else {
                tweenIntro.onComplete.add(this.levelStart, this);
            }
        },

        update: function() {
            if (this.gestures) {
                this.gestures.update();
            }
        },

        levelStart: function() {
            this.transitionData.animation = LevelMasterState.Transition.NONE;
            
            this.game.state.start('level-round', true, false, this.levelData, this.transitionData);
        },
        
        skillMenuPopped: function() {
            this.upKey.onDown.add(this.skillMenuNavigate.bind(this, SkillMenu.Select.UP));
            this.downKey.onDown.add(this.skillMenuNavigate.bind(this, SkillMenu.Select.DOWN));
            this.enterKey.onDown.add(this.skillMenu.select, this.skillMenu);
            this.spacebarKey.onDown.add(this.skillMenu.select, this.skillMenu);

            this.gestures.onSwipe.add(this.handleSwipe, this);
            this.gestures.onTap.add(this.handleTap, this);
            this.gestures.onHold.add(this.handleHold, this);
        },

        handleSwipe: function(e, pos, prev, direction) {
            switch(direction) {
            case Gesture.SwipeDirection.UP:
            case Gesture.SwipeDirection.LEFT:
                this.skillMenuNavigate(SkillMenu.Select.UP);
                break;
            default:
                this.skillMenuNavigate(SkillMenu.Select.DOWN);
                break;
            }
        },

        handleTap: function(e, pos) {
            this.skillMenu.tap(pos);
        },

        handleHold: function(e, pos) {
            this.skillMenu.tap(pos);
            this.skillMenu.select();  
        },

        skillMenuNavigate: function(direction) {
            if (this.skillMenu.navigate(direction) !== -1) {
                this.skillMenu.playNavigateSound();
            }
        },

        skillMenuSelected: function(skill) {
            this.levelData.players[0].skill = skill;
            
            this.tweenSkillMenuShrink();

            Util.playSfx(this.fx, 'ZOOMIN');
        },
        
        tweenIntro: function() {
            var tweenLevelSplash = this.game.add.tween(this.levelSplash)
                .to({alpha: 0}, 1000, Phaser.Easing.Linear.None, true);
            
            var tweenFadeOut = this.game.add.tween(this.fadeBg)
                .to({alpha: 0}, 2000, Phaser.Easing.Linear.None);

            var tweenCustomIntro = this.tweenCustomIntro();
            
            var drawTweens = this.foreground.getDrawTweens();

            tweenLevelSplash.chain(tweenFadeOut);
            tweenFadeOut.chain(tweenCustomIntro);
            tweenCustomIntro.chain(drawTweens.first);
            
            tweenCustomIntro.onStart.add(function() {
                this.foreground.playDrawSound();
            }, this);
            
            drawTweens.first.onStart.add(function() {
                //this.foreground.playDrawSound();
            }, this);

            return drawTweens.last;
        },

        tweenCustomIntro: function() {
            var level = this.levelData.level;
            
            var tweens = [
                this.tweenLevel1,
                this.tweenLevel2,
                this.tweenLevel3,
                this.tweenLevel4,
                this.tweenLevel5
            ];

            return tweens[level - 1].call(this);
        },

        tweenLevel1: function() {
            var tween = this.game.add.tween({x:1})
                    .to({x: 1}, 1);

            return tween;
        },

        tweenLevel2: function() {
            var tween = this.game.add.tween({x:0})
                    .to({x: 1}, 6000);

            return tween;
        },

        tweenLevel3: function() {
            var tween = this.game.add.tween({x:0})
                    .to({x: 1}, 8000);

            return tween;
        },

        tweenLevel4: function() {
            var tween = this.game.add.tween({x:0})
                    .to({x: 1}, 10000);

            return tween;
        },

        tweenLevel5: function() {
            var tween = this.game.add.tween({x:0})
                    .to({x: 1}, 8000);

            return tween;
        },
        

        tweenSkillMenuPop: function() {
            var tween = this.game.add.tween(this.skillMenu.scale)
                .to({ x: 1, y: 1 }, 500, Phaser.Easing.Bounce.Out);

            
            tween.onComplete.add(this.skillMenuPopped, this);
            
            return tween;
        },

        tweenSkillMenuShrink: function() {
            var tween = this.game.add.tween(this.skillMenu.scale)
                .to({ x: 0, y: 0 }, 200, Phaser.Easing.Linear.None, true);

            tween.onComplete.add(this.levelStart, this);

            return tween;
        }
    };

    return LevelIntroState;
});
