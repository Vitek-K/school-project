import { game } from "../index.js";

// id of tree segment
const nw = 0, ne = 1, sw = 2, se = 3;

export default class QuadTree {
    constructor(layer) {
        this.x, this.y, this.w, this.h;
        if (layer === layers) this.children = [];
        this.layer = layer - 1;
        if (this.layer > 0) {
            this.child = [];
            for (var i = 0; i < 4; i++) {
                this.child.push(new QuadTree(this.layer));
            }
        }
    }

    resize(x, y, w, h) {
        this.x = x; this.y = y;
        this.w = w; this.h = h;
        if (this.layer !== 0) {
            this.child[nw].resize(x, /*   */ y, /*   */ w / 2, h / 2);
            this.child[ne].resize(x + w / 2, y, /*   */ w / 2, h / 2);
            this.child[sw].resize(x, /*   */ y + h / 2, w / 2, h / 2);
            this.child[se].resize(x + w / 2, y + h / 2, w / 2, h / 2);
        }
    }

    reset() {
        for (var i = 0; i < game.monkeys.objects.length; i++)
            if (game.monkeys.objects[i].target != CUR && game.monkeys.objects[i].target != POINT)
                game.monkeys.objects[i].target = null;
        this.children.forEach((o, i) => {
            o.objects.projectiles = [];
            o.objects.bloons = [];
        });
    }

    setTargets() {
        var bloons = game.bloons.objects;
        var monkeys = game.monkeys.objects;
        for (var index = 0; index < this.children.length; index++) {
            var o = this.children[index];
            if (o.objects.monkey_ranges.length > 0 && o.objects.bloons.length > 0) {
                for (var i = 0; i < o.objects.bloons.length; i++) {                                         // loop bloons              - I
                    for (var j = 0; j < o.objects.monkey_ranges.length; j++) {                              // loop ranges              - J
                        var mI = getIndexOfObject(monkeys, 'i', o.objects.monkey_ranges[j]);
                        var monkey = monkeys[mI];
                        if (monkey.targetType === BLOONS) {
                            var bI = getIndexOfObject(bloons, 'i', o.objects.bloons[i]);
                            var bloon = bloons[bI];
                            if (bloon !== undefined) {
                                if (squareCircCollision({ x: bloon.x, y: bloon.y, hb: bloon.tb, }, monkey)) {
                                    if (monkey.target !== null) {
                                        if (bloon.dist > bloons[monkey.target].dist) monkey.target = bI;
                                    } else monkey.target = bI;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    checkCollisions() {
        for (var index = 0; index < this.children.length; index++) {
            var o = this.children[index];
            if (o.objects.bloons.length > 0 && o.objects.projectiles.length > 0) {
                for (var i = 0; i < o.objects.bloons.length; i++) {                                         // loop bloons              - I
                    for (var j = 0; j < o.objects.projectiles.length; j++) {                                // loop projectiles         - J
                        var bI = getIndexOfObject(game.bloons.objects, 'i', o.objects.bloons[i]);
                        var bloon = game.bloons.objects[bI];
                        var pI = getIndexOfObject(game.projectiles.objects, 'i', o.objects.projectiles[j]);
                        var projectile = game.projectiles.objects[pI];
                        if (bloon !== undefined && projectile !== undefined) {
                            if (squareCollision(bloon, projectile) && projectile.lastHit != bloon.i) {
                                projectile.lastHit = bloon.i;
                                if (projectile.aoe > 0) {
                                    game.projectiles.spawn(projectile, {
                                        isTemp: true,
                                        size: projectile.aoe,
                                        type: "temp",
                                        dmgType: projectile.dmgType,
                                        speed: 0, aoe: 0, aoePierce: 0,
                                        dmg: projectile.dmg,
                                        layers: projectile.layers,
                                        pierce: projectile.aoePierce,
                                    });
                                } else game.bloons.hit(bI, pI);
                                game.projectiles.hit(bI, pI);
                            }
                        }
                    }
                }
            }
        }
    }

    checkRect(o) {
        if (!rectCollision(this, o)) return;
        if (this.layer !== 0) {
            this.child.forEach((object, i) => { object.checkRect(o); });
            return;
        }
        this.objects[o.type].push(o.i);
    }

    checkRange(o) {
        if (!rectCircCollision(this, o)) return;
        if (this.layer !== 0) {
            this.child.forEach((object, i) => { object.checkRange(o); });
            return;
        }
        this.objects.monkey_ranges.push(o.i);
    }

    checkCur() {
        var x = relativeClientX();
        var y = relativeClientY();
        if (!(x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.h)) return;
        if (this.layer !== 0) {
            this.child.forEach((o, i) => { o.checkCur(); });
            return;
        }
        game.monkeys.hoveringOver = null;
        for (var i = 0; i < this.objects.monkeys.length; i++) {
            var obj = this.objects.monkeys[i];
            var j = getIndexOfObject(game.monkeys.objects, 'i', obj);
            var o = game.monkeys.objects[j];
            var x = relativeX(o.x) - o.w / p / 4;
            var y = relativeY(o.y) - o.h / p / 4;
            if (clientX > x && clientX < x + o.w / p / 2 &&
                clientY > y && clientY < y + o.h / p / 2) {
                game.monkeys.hoveringOver = j;
                break;
            }
        }
    }

    removeObject(attr, j) {
        for (var index = 0; index < this.children.length; index++) {
            var o = this.children[index];
            for (var i = 0; i < o.objects[attr].length; i++) {
                if (o.objects[attr][i] == game.monkeys.objects[j].i) {
                    o.objects[attr].splice(i, 1);
                    break;
                }
            }
        }
    }

    setupReff() {
        if (this.layer !== 0) { this.child.forEach((o, i) => { o.setupReff(); }); }
        else {
            this.objects = {
                monkeys: [],
                monkey_ranges: [],
                projectiles: [],
                bloons: [],
            };
            game.qtree.children.push(this);
        }
    }

    show() {
        if (this.objects) if (this.objects.bloons.length > 0) {
            ctx.strokeStyle = "red";
            ctx.lineWidth = 5;
            ctx.strokeRect(relativeX(this.x), relativeY(this.y), this.w / p, this.h / p);
        }
        if (this.objects) if (this.objects.projectiles.length > 0) {
            ctx.strokeStyle = "green";
            ctx.lineWidth = 5;
            ctx.strokeRect(relativeX(this.x), relativeY(this.y), this.w / p, this.h / p);
        }
        if (this.layer !== 0) { this.child.forEach((o, i) => { o.show(); }); }
    }
}