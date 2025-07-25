import Menu from "./menu.js";
import Settings from "./settings.js";
import Map from "./objects/map.js";
import Bloon from "./objects/bloon.js";
import Monkey from "./objects/monkey.js";
import Projectile from "./objects/projectile.js";
import Particle from "./objects/particle.js";
import InputHandler from "./inputHandler.js";
import QuadTree from "./quadTree.js";
import { game, loop } from "../index.js";

export default class Game {
    constructor() {
        this.width, this.height;

        this.menu =        /**/ new Menu();
        this.settings =    /**/ new Settings();
        this.map =         /**/ new Map();
        this.bloons =      /**/ new Bloon();
        this.monkeys =     /**/ new Monkey();
        this.projectiles = /**/ new Projectile();
        this.particles =   /**/ new Particle();
        this.input =       /**/ new InputHandler();
        this.qtree =       /**/ new QuadTree(layers);

        this.money = baseMoney;
        this.lives = baseLives;
        this.ramping = 0;

        this.scoreSubmitted = false;
        this.player = {
            name: "",
            score: 0,
            scoreSubmitted: 0,
            map: null,
        };

        this.isFast = false;
        this.state = MENU;
        this.menuState = MAIN;
    }

    setup() {
        game.input.resize();
        game.qtree.resize(0, 0, game.settings.resolution.x, game.settings.resolution.y);
        game.qtree.setupReff();
        game.menu.createBigBloons();
        game.map.mapIndex = 0;
        game.map.map = game.map.types[game.map.mapIndex];
        // game.menu.changeState(MENU, SUBMIT);
        game.menu.changeState(MENU, MAIN);
    }

    update() {
        this.projectiles.removeTemp();
        this.qtree.reset();
        this.bloons.update();
        this.qtree.setTargets();
        this.monkeys.update();
        this.projectiles.update();
        this.particles.update();
        this.qtree.checkCollisions();
        this.menu.updateGameButtons();
    }

    draw() {
        this.map.draw();
        this.monkeys.draw();
        this.projectiles.draw();
        this.bloons.draw();
        this.particles.draw();
        this.monkeys.drawOver();
        this.menu.drawGame();
        this.monkeys.drawPreview();
        // this.menu.showFPS();
        // this.qtree.show();
    }

    checkDeath() {
        if (this.lives === 0) this.menu.changeState(MENU, SUBMIT);
    }

    showBtnHitboxes() {
        ctx.fillStyle = rgba(255, 0, 0, 0.2);
        this.menu.buttons.forEach((o) => {
            ctx.fillRect(relativeX(o.x), relativeY(o.y), o.w / p, o.h / p);
        });
    }

    drawBorders() {
        ctx.fillStyle = "black";
        var off = 2 / p;
        ctx.fillRect(0, 0, offsetX + off, innerHeight);
        ctx.fillRect(this.width / gSize + offsetX - off, 0, offsetX + off, innerHeight);
        ctx.fillRect(0, 0, innerWidth, offsetY + off);
        ctx.fillRect(0, this.height / gSize + offsetY - off, innerWidth, offsetY + off);
    }

    changeSpeed() {
        if (this.isFast) this.isFast = false;
        else /*       */ this.isFast = true;
    }

    reset() {
        this.menu.objects = [];
        this.bloons.objects = [];
        this.monkeys.objects = [];
        this.projectiles.objects = [];
        this.particles.objects = [];
        this.qtree.children.forEach(child => {
            child.objects = {
                monkeys: [],
                monkey_ranges: [],
                projectiles: [],
                bloons: [],
            };
        });
        this.money = baseMoney;
        this.lives = baseLives;
        this.ramping = 0;
        this.isFast = false;
        this.monkeys.canPlace = { water: false, land: false };
        this.monkeys.selected = (this.monkeys.hoveringOver = this.monkeys.placing = null);
        this.monkeys.placingPoint = false;
        this.bloons.round = 0;
        this.bloons.waveTimer = 0;
        this.bloons.wave = 0;
        this.bloons.bloonTimers = [];
        this.player.score = 0;
    }
}