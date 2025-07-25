import { game } from "../../index.js";

export default class Bloon {
    constructor() {
        createImages(data, 'img', { start: 'bloons', end: '.png' });
        this.objects = [];
        this.bloonTimers = [];
        this.round = 0;
        this.waveTimer = 0;
        this.wave = 0;
        this.types = [];
        Object.entries(data).forEach(o => { if (!o[1].class) this.types.push(o[0]); });
    }

    update() {
        this.sendBloons();
        this.updateBloons();
    }

    sendBloons() {
        this.waveTimer += tp;
        if (rounds[this.round] === undefined && game.bloons.objects.length === 0) {
            this.round -= 5;
            game.ramping++;
        }
        let round = rounds[this.round];
        let wave = round[this.wave];
        if (wave === undefined) {
            if (game.bloons.objects.length === 0 && this.bloonTimers.length === 0) {
                this.round++;
                this.wave = 0;
                game.player.score += 10;
            }
        } else {
            if (this.waveTimer >= round[this.wave].time) {
                this.bloonTimers.push({
                    time: 0,
                    count: 0,
                    bloon: 0,
                    wave: this.wave,
                    round: this.round,
                });
                this.waveTimer = 0;
                this.wave++;
            }
        }
        for (let i = 0; i < this.bloonTimers.length; i++) {
            let timer = this.bloonTimers[i];
            let wave = rounds[timer.round][timer.wave];
            timer.time += tp;
            if (timer.time > wave.gap) {
                timer.count++;
                timer.time = 0;
                if (timer.count > wave.count) {
                    this.bloonTimers.splice(i, 1);
                    game.player.score += 1;
                } else {
                    timer.bloon = (timer.bloon + 1) % wave.type.length;
                    this.spawn(wave.type[timer.bloon]);
                }
            }
        }
    }

    updateBloons() {
        for (var i = 0; i < this.objects.length; i++) {
            var o = this.objects[i];
            if (o.poison > 0) {
                o.poisonTimer += tp;
                if (o.poisonTimer > 1000) {
                    o.hp -= o.poisonDMG;
                    game.particles.spawn("poison", o);
                    o.poisonTimer = 0;
                    o.poison--;
                    this.pop(getIndexOfObject(this.objects, 'i', o.i), 1);
                }
            }
            if ((Math.abs(o.x - game.map.points[o.point + 1].x) < Math.abs(o.speed.x * dt) && Math.abs(o.speed.x) > 0) ||
                (Math.abs(o.y - game.map.points[o.point + 1].y) < Math.abs(o.speed.y * dt) && Math.abs(o.speed.y) > 0)) {
                if (game.map.directions[o.point + 1] === undefined) this.leak(data[o.type].lives, i);
                else this.setPoint(o);
                if (data[o.type].rotating) o.angle = Math.atan2(o.speed.x, o.speed.y);
            } else {
                if (o.distraction > 0) {
                    o.distraction -= tp;
                    o.x -= o.speed.x / 2 * dt; o.dist -= Math.abs(o.speed.x / 2 * dt);
                    o.y -= o.speed.y / 2 * dt; o.dist -= Math.abs(o.speed.y / 2 * dt);
                } else {
                    o.x += o.speed.x * dt; o.dist += Math.abs(o.speed.x * dt);
                    o.y += o.speed.y * dt; o.dist += Math.abs(o.speed.y * dt);
                }
            }
            game.qtree.checkRect({
                type: "bloons",
                i: o.i,
                x: o.x - o.tb / 2, w: o.tb,
                y: o.y - o.tb / 2, h: o.tb,
            });
        }
    }

    setPoint(o) {
        o.point++;
        o.speed.x = game.map.directions[o.point].x * data[o.type].speed; o.x = game.map.points[o.point].x;
        o.speed.y = game.map.directions[o.point].y * data[o.type].speed; o.y = game.map.points[o.point].y;
    }

    leak(lives, i) {
        game.lives -= lives;
        this.objects.splice(i, 1);
    }

    hit(bI, pI) {
        var proj = game.projectiles.objects[pI];
        var bloon = this.objects[bI];
        if (data[bloon.type].distractionResistance < proj.distraction) bloon.distraction = Math.random() * 500 + 250;
        if (data[bloon.type].resistant[0] !== null) {
            for (var i = 0; i < data[bloon.type].resistant.length; i++) {
                if (proj.dmgType === data[bloon.type].resistant[i]) {
                    if (proj.dmgType !== EXPLOSIVE) proj.pierce = 0;
                    return;
                }
            }
        }
        bloon.hp -= proj.dmg;
        if (proj.poison > 0) {
            bloon.poison = proj.poison;
            bloon.poisonDMG = proj.poisonDMG;
            game.particles.spawn("poison", bloon);
        }
        this.pop(bI, proj.layers);
    }

    pop(i, layers) {
        var bloon = this.objects[i];
        if (bloon.hp > 0) return;
        game.particles.spawn("pop", bloon);
        this.objects.splice(i, 1);
        this.splitInto = [];
        if (data[bloon.type].class == MOAB) layers = 1;
        this.damageLayers(bloon.type, layers);
        this.split(bloon);
    }

    damageLayers(type, popLayers) {
        if (popLayers == 0) {
            this.splitInto.push(type);
            return;
        }
        game.money += data[type].money;
        popLayers--;
        var arr = data[type].spawn;
        if (arr[0] === null) return;
        for (var i = 0; i < arr.length; i++) {
            this.damageLayers(arr[i], popLayers);
        }
    }

    split(deadBloon) {
        if (this.splitInto.length == 0) return;
        if (this.splitInto[0] === null) return;
        var off = 0;
        var point = deadBloon.point;                                            // point on map
        for (var i = 0; i < this.splitInto.length; i++) {
            var newType = this.splitInto[i];                                    // type of new bloon
            var speedX = game.map.directions[point].x * data[newType].speed;    // speed X
            var speedY = game.map.directions[point].y * data[newType].speed;    // speed Y
            var newBloon = {
                type: newType,
                i: iBloon,
                x: deadBloon.x + off * speedX, w: size[data[newType].size].w,
                y: deadBloon.y + off * speedY, h: size[data[newType].size].h,
                hp: data[newType].hp * (1 + game.ramping * 1),
                hb: hitbox[data[newType].size],            // hitbox
                tb: targetBox[data[newType].size],         // box for targeting
                speed: { x: speedX, y: speedY, },
                point: point,
                dist: deadBloon.dist + off,
                distraction: deadBloon.distraction,
                poisonTimer: 0,
                poisonDMG: deadBloon.poisonDMG,
                poison: deadBloon.poison,
            };
            if (data[newType].rotating) newBloon.angle = Math.atan2(newBloon.speed.x, newBloon.speed.y);
            this.objects = [newBloon, ...this.objects];
            off -= 30 / this.splitInto.length;
            iBloon++;
        }
    }

    spawn(type) {
        var newBloon = {
            type: type,
            i: iBloon,
            x: game.map.points[0].x, w: size[data[type].size].w,
            y: game.map.points[0].y, h: size[data[type].size].h,
            hp: data[type].hp * (1 + game.ramping * .2),            // hitpoints
            hb: hitbox[data[type].size],                            // hitbox
            tb: targetBox[data[type].size],                         // target box
            speed: {
                x: game.map.directions[0].x * data[type].speed,
                y: game.map.directions[0].y * data[type].speed,
            },
            point: 0,
            dist: 0,
            distraction: 0,
            poisonTimer: 0,
            posionDMG: 0,
            poison: 0,
        };
        if (data[type].rotating) newBloon.angle = Math.atan2(newBloon.speed.x, newBloon.speed.y);
        this.objects.push(newBloon);
        iBloon++;
    }

    draw() {
        for (var i = 0; i < this.objects.length; i++) {
            var o = this.objects[i];
            var dat = data[o.type];
            ctx.save();
            ctx.translate(relativeX(o.x), relativeY(o.y));
            if (dat.rotating) ctx.rotate(-o.angle + Math.PI / 2);
            var w = size[dat.size].w / p;
            var h = size[dat.size].h / p;
            ctx.drawImage(dat.img, -w / 2, -h / 2, w, h);
            ctx.restore();
        }
    }
}

/*
SPEED       - movement speed of bloon
HP          - hit points of bloon
SPAWN       - which bloons spawns on death
DISTANCE    - distance between spawned bloons
LIVES       - leak 
MONEY       - money gained for pop
*/

const data = {
    red: {
        speed: 1, hp: 1, lives: 1, money: 1, size: 0, rotating: false, distractionResistance: 0,
        spawn: [null], resistant: [null],
    },
    blue: {
        speed: 1.2, hp: 1, lives: 2, money: 1, size: 0, rotating: false, distractionResistance: 0,
        spawn: [RED], resistant: [null],
    },
    green: {
        speed: 1.5, hp: 1, lives: 4, money: 1, size: 0, rotating: false, distractionResistance: 0,
        spawn: [BLUE], resistant: [null],
    },
    yellow: {
        speed: 1.8, hp: 1, lives: 6, money: 1, size: 0, rotating: false, distractionResistance: 0,
        spawn: [GREEN], resistant: [null],
    },
    pink: {
        speed: 2.2, hp: 1, lives: 8, money: 1, size: 0, rotating: false, distractionResistance: 0,
        spawn: [YELLOW], resistant: [null],
    },
    white: {
        speed: 1.3, hp: 1, lives: 15, money: 2, size: 1, rotating: false, distractionResistance: 1,
        spawn: [PINK, PINK], resistant: [ICE],
    },
    black: {
        speed: 1.2, hp: 1, lives: 15, money: 2, size: 1, rotating: false, distractionResistance: 1,
        spawn: [YELLOW, YELLOW], resistant: [EXPLOSIVE],
    },
    zebra: {
        speed: 1.5, hp: 1, lives: 25, money: 3, size: 0, rotating: false, distractionResistance: 1,
        spawn: [WHITE, BLACK], resistant: [EXPLOSIVE, ICE],
    },
    rainbow: {
        speed: 2, hp: 1, lives: 30, money: 3, size: 0, rotating: false, distractionResistance: 1,
        spawn: [ZEBRA, ZEBRA], resistant: [null],
    },
    lead: {
        speed: .5, hp: 1, lives: 20, money: 4, size: 0, rotating: false, distractionResistance: 1,
        spawn: [GREEN, GREEN], resistant: [BASE],
    },
    ceramic: {
        speed: 1, hp: 100, lives: 40, money: 5, size: 0, rotating: false, distractionResistance: 1,
        spawn: [RAINBOW, RAINBOW], resistant: [BEAM],
    },
    moab: {
        speed: 1.3, hp: 2500, lives: 500, money: 10, size: 2, rotating: true, class: MOAB, distractionResistance: 2,
        spawn: [CERAMIC, CERAMIC, CERAMIC, CERAMIC], resistant: [null],
    },
    ddt: {
        speed: 5, hp: 2000, lives: 1500, money: 20, size: 5, rotating: true, class: MOAB, distractionResistance: 2,
        spawn: [CERAMIC, CERAMIC, CERAMIC, CERAMIC], resistant: [BASE],
    },
    bfb: {
        speed: 1, hp: 7000, lives: 1000, money: 15, size: 3, rotating: true, class: MOAB, distractionResistance: 3,
        spawn: [MOAB, MOAB, MOAB, MOAB], resistant: [null],
    },
    zomg: {
        speed: 0.8, hp: 15000, lives: 2000, money: 20, size: 4, rotating: true, class: MOAB, distractionResistance: 3,
        spawn: [BFB, BFB, BFB, BFB], resistant: [null],
    },
};
const size = [{ w: 37, h: 60 }, { w: 28, h: 45 }, { w: 250, h: 125 }, { w: 300, h: 150 }, { w: 360, h: 180 }, { w: 250, h: 150 }];
const targetBox = [50, 40, 225, 280, 320, 225];
const hitbox = [50, 40, 105, 100, 170, 105];
const rounds = [
    [{ time: 0, count: 10, type: [RED], gap: 1000 }, { time: 12000, count: 15, type: [BLUE, RED], gap: 800 }],
    [{ time: 0, count: 25, type: [RED], gap: 500 }, { time: 14000, count: 25, type: [RED, BLUE], gap: 500 }, { time: 14000, count: 25, type: [BLUE], gap: 500 }],
    [{ time: 0, count: 15, type: [RED], gap: 1400 }, { time: 200, count: 15, type: [RED], gap: 1400 }, { time: 200, count: 15, type: [RED], gap: 1400 }],
    [{ time: 0, count: 21, type: [BLUE, GREEN, YELLOW], gap: 1500 }],
    [{ time: 0, count: 25, type: [GREEN], gap: 300 }],
    [{ time: 0, count: 25, type: [GREEN, BLUE], gap: 200 }],
    [{ time: 0, count: 15, type: [YELLOW, GREEN, YELLOW], gap: 1000 }],
    [{ time: 0, count: 40, type: [YELLOW], gap: 500 }],
    [{ time: 0, count: 20, type: [WHITE], gap: 1500 }, { time: 10000, count: 30, type: [BLACK], gap: 2000 }],
    [{ time: 0, count: 5, type: [LEAD], gap: 2000 }],
    [{ time: 0, count: 40, type: [BLACK, WHITE], gap: 2000 }],
    [{ time: 0, count: 20, type: [WHITE], gap: 1000 }, { time: 2500, count: 30, type: [BLACK], gap: 1000 }, { time: 5000, count: 10, type: [ZEBRA], gap: 300 }],
    [{ time: 0, count: 40, type: [ZEBRA], gap: 400 }],
    [{ time: 0, count: 10, type: [RED, BLUE, GREEN, YELLOW, WHITE, BLACK, ZEBRA, RAINBOW, RAINBOW, RAINBOW], gap: 1500 }, { time: 20000, count: 10, type: [RED, BLUE, GREEN, YELLOW, WHITE, BLACK, ZEBRA, RAINBOW, RAINBOW, RAINBOW], gap: 750 }],
    [{ time: 0, count: 250, type: [RED, BLUE, RED], gap: 50 }],
    [{ time: 0, count: 40, type: [ZEBRA, RAINBOW], gap: 1000 }],
    [{ time: 0, count: 50, type: [BLACK, WHITE], gap: 500 }],
    [{ time: 0, count: 16, type: [GREEN], gap: 100 }, { time: 2500, count: 16, type: [GREEN], gap: 100 }],  // Kudikov kolo
    [{ time: 0, count: 200, type: [YELLOW], gap: 50 }],
    [{ time: 0, count: 5, type: [CERAMIC, RAINBOW], gap: 2000 }],
    [{ time: 0, count: 3, type: [CERAMIC], gap: 1200 }, { time: 5000, count: 3, type: [CERAMIC], gap: 1200 }, { time: 5000, count: 3, type: [CERAMIC], gap: 1200 }],
    [{ time: 0, count: 150, type: [RAINBOW], gap: 100 }],                                                   // Patrik kolo
    [{ time: 0, count: 1, type: [MOAB], gap: 0 }],
    [{ time: 0, count: 2, type: [MOAB], gap: 1000 }],
    [{ time: 0, count: 10, type: [CERAMIC, RAINBOW], gap: 500 }],
    [{ time: 0, count: 20, type: [RAINBOW], gap: 50 }, { time: 5000, count: 500, type: [YELLOW], gap: 50 }],
    [{ time: 0, count: 1, type: [BFB], gap: 0 }],
    [{ time: 0, count: 3, type: [CERAMIC], gap: 1000 }, { time: 4000, count: 6, type: [MOAB], gap: 1500 }],
    [{ time: 0, count: 3, type: [BFB], gap: 500 }, { time: 4000, count: 6, type: [MOAB], gap: 1500 }],
    [{ time: 0, count: 1, type: [ZOMG], gap: 0 }],
    [{ time: 0, count: 15, type: [DDT], gap: 1000 }],
];