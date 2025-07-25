import { game } from "../../index.js"

const land = 0, water = 1;
const oLineOff = 1.1;
const layers = ["bot", "main", "top"];
const spritesOnLayer = { main: 5, secondary: 3 };

export default class Monkey {
    constructor() {
        createImages(icons, 'img', /*            */ { start: 'monkeys/icons', /*   */ end: '.png' });
        createImages(data, 'img_bot', /*         */ { start: 'monkeys', /*         */ end: '_bot.png' });
        createImages(data, 'img_main', /*        */ { start: 'monkeys', /*         */ end: '_main.png' });
        createImages(data, 'img_top', /*         */ { start: 'monkeys', /*         */ end: '_top.png' });
        createImages(data, 'img_bot_outline', /* */ { start: 'monkeys/outlines', /**/ end: '_bot.png' });
        createImages(data, 'img_main_outline', /**/ { start: 'monkeys/outlines', /**/ end: '_main.png' });
        createImages(data, 'img_top_outline', /* */ { start: 'monkeys/outlines', /**/ end: '_top.png' });
        this.objects = [];
        this.canPlace = { water: false, land: false };
        this.selected = (this.hoveringOver = this.placing = null);
        this.placingPoint = false;
        this.types = [];
        Object.entries(data).forEach(o => { this.types.push(o[0]); });
    }

    update() {
        // update sprite
        for (var i = 0; i < this.objects.length; i++) {
            var o = this.objects[i];
            o.timer -= tp;
            for (var j = 0; j < 3; j++) {
                o.sprites[j] = 0;
                var l = data[o.type].layers[layers[j]];
                if (l !== undefined) {
                    if (o.timer > 900) /**/ o.sprites[j] = Math.min(3, l.animFrames);
                    else if (o.timer > 800) o.sprites[j] = Math.min(2, l.animFrames);
                    else if (o.timer > 700) o.sprites[j] = Math.min(1, l.animFrames);
                }
            }
            if (o.target !== null && o.target !== POINT) {
                switch (o.target) {
                    case CUR:
                        var dx = relativeX(o.x) - clientX;
                        var dy = relativeY(o.y) - clientY;
                        break;
                    default:
                        var dx = o.x - game.bloons.objects[o.target].x;
                        var dy = o.y - game.bloons.objects[o.target].y;
                        break;
                }
                o.angle = Math.atan2(dx, dy);
            }
            o.timers.forEach((timer, index) => {
                o.timers[index] += tp;
                if (o.target != null) {
                    if (timer > o.attSpeeds[index]) {
                        for (var j = 0; j < o.projectiles.length; j++) {
                            if (o.projectiles[j].attSpeedTimer == index) {
                                game.projectiles.spawn(o, o.projectiles[j]);
                                o.timer = 1000;
                            }
                        }
                        o.timers[index] = 0;
                    }
                }
            });
        }
    }

    draw() {
        for (var i = 0; i < this.objects.length; i++) {
            this.drawMonkey(this.objects[i], "");
        }
        if (this.hoveringOver !== null) {
            var o = this.objects[this.hoveringOver];
            ctx.lineWidth = 3;
            ctx.fillStyle = ca(0, 0.2); fillCircle(relativeX(o.x), relativeY(o.y), o.r / p);
            ctx.strokeStyle = ca(0, 0.6); strokeCircle(relativeX(o.x), relativeY(o.y), o.r / p);
            this.drawMonkey(o, "");
        }
    }

    drawOver() {
        if (this.selected !== null) {
            var o = this.objects[this.selected];
            this.drawMonkey(o, "_outline");
            this.drawMonkey(o, "");
            if (o.target === POINT)
                ctx.drawImage(
                    icons.point.img,
                    clientX - icons.point.w / 2 / p,
                    clientY - icons.point.h / 2 / p,
                    icons.point.w / p,
                    icons.point.h / p
                );
        }
    }

    drawMonkey(obj, path) {
        ctx.save();
        ctx.translate(relativeX(obj.x), relativeY(obj.y));
        if (data[obj.type].canTurn) ctx.rotate(-obj.angle);
        for (var i = 0; i < 3; i++) {
            var l = data[obj.type].layers[layers[i]];         // layer
            var o = data[obj.type].layers[layers[i] + path];  // outline?
            if (l !== undefined && o !== undefined) {
                var current = 1;
                if (l.type == "main") current = 0;
                ctx.drawImage(
                    data[obj.type]["img_" + layers[i] + path],
                    o.w * obj.paths[current].val + o.w * obj.sprites[i] * spritesOnLayer[l.type],
                    o.h * obj.paths[current].i,
                    o.w,
                    o.h,
                    ((-o.w / 2 * data[obj.type].size) + l.off.x) / p,
                    ((-o.h / 2 * data[obj.type].size) + l.off.y) / p,
                    (o.w * data[obj.type].size) / p,
                    (o.h * data[obj.type].size) / p
                );
            }
        }
        ctx.restore();
    }

    drawPreview() {
        if (this.placing === null) return;
        ctx.lineWidth = 3;
        ctx.fillStyle = rgba(255, 0, 0, 0.2);
        ctx.strokeStyle = rgba(255, 0, 0, 0.6);
        if ((this.canPlace.land && data[this.placing].on == land) || (this.canPlace.water && data[this.placing].on == water)) {
            ctx.fillStyle = rgba(0, 255, 0, 0.2);
            ctx.strokeStyle = rgba(0, 255, 0, 0.6);
        }
        // draw tower range
        fillCircle(clientX, clientY, data[this.placing].range / p);
        strokeCircle(clientX, clientY, data[this.placing].range / p);
        // draw tower to place
        for (var i = 0; i < layers.length; i++) {
            var l = data[this.placing].layers[layers[i]];
            if (l !== undefined) {
                ctx.drawImage(
                    data[this.placing]["img_" + layers[i]],
                    0, 0,
                    l.w,
                    l.h,
                    clientX + ((-l.w / 2 * data[this.placing].size) + l.off.x) / p,
                    clientY + ((-l.h / 2 * data[this.placing].size) + l.off.y) / p,
                    (l.w * data[this.placing].size) / p,
                    (l.h * data[this.placing].size) / p
                );
            }
        }
    }

    monkeyButton(type, x, y, isSelected) {
        if (game.money < data[type].price) ctx.fillStyle = rgba(255, 0, 0, 0.3);
        else /*                         */ ctx.fillStyle = rgba(0, 255, 0, 0.3);
        var rx = x - 370 / p;
        var ry = y - 48 / p;
        var w = game.width / gSize - game.width;
        var h = 100 / p;
        ctx.fillRect(rx, ry, w, h);
        for (var i = 0; i < layers.length; i++) {
            var l = data[type].layers[layers[i]];
            if (l !== undefined) {
                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(-Math.PI / 2);
                ctx.drawImage(
                    data[type]["img_" + layers[i]],
                    0, 0,
                    l.w,
                    l.h,
                    ((-l.w / 2 * data[type].size) + l.off.x) / p,
                    ((-l.h / 2 * data[type].size) + l.off.y) / p,
                    (l.w * data[type].size) / p,
                    (l.h * data[type].size) / p
                );
                ctx.restore();
            }
        }
        ctx.fillStyle = "white";
        var font = 40 / p;
        ctx.font = font + "px Arial";
        ctx.fillText(type, x - 350 / p, y - 10 / p);
        ctx.fillText(data[type].price + "$", x - 350 / p, y + 40 / p);
        if (isSelected) {
            ctx.fillStyle = ca(200, 0.1);
            ctx.fillRect(rx, ry, w, h);
        }
    }

    select(type) {
        if (game.money < data[type].price) return;
        this.placing = type;
        this.hoveringOver = null;
        this.selected = null;
        this.placingPoint = false;
        if (game.input.mouseOnGame()) {
            this.checkPlacement();
            return;
        }
        this.canPlace.land = false;
        this.canPlace.water = false;
    }

    checkPlacement() {
        this.canPlace.land = false;
        this.canPlace.water = false;
        var i = (Math.floor(relativeClientX()) + Math.floor(relativeClientY()) * game.settings.resolution.x) * 4;
        var r = game.map.data[i + 0];
        var g = game.map.data[i + 1];
        var b = game.map.data[i + 2];
        switch (true) {
            case r + g + b === 0: this.canPlace.water = false; this.canPlace.land = false; break;   // if black - cant
            case g > 100: /*   */ this.canPlace.water = false; this.canPlace.land = true; break;    // if green - can land
            case b > 100: /*   */ this.canPlace.water = true; this.canPlace.land = false; break;    // if blue  - can water
        }
    }

    place() {
        var type = this.placing;
        var dat = data[type];
        if (this.canPlace.land === this.canPlace.water ||
            (this.canPlace.land && data[type].on != land) ||
            (this.canPlace.water && data[type].on != water)) return;
        game.money -= dat.price;
        var newMonkey = {
            price: dat.price,
            upgradePrices: dat.upgradePrices,
            sprites: [0, 0, 0],
            type: type,
            targetType: dat.target,
            x: relativeClientX(), w: dat.layers.main.w * dat.size,
            y: relativeClientY(), h: dat.layers.main.h * dat.size,
            r: dat.range,                   // range
            angle: 0,                       // rotation towards target
            sprite: 0,                      // current sprite
            upgrades: [0, 0, 0, 0],
            projectiles: [],
            attSpeeds: [],
            timers: [],
            timer: 0,
            i: iMonkey,
            particleSize: 1,
            spread: dat.spread,
            paths: [{ i: null, val: 0 }, { i: null, val: 0 }],
            // * EFFECTS                      
            distraction: dat.distraction,
            poison: dat.poison,
            poisonDMG: dat.poisonDMG,
            // * GLOBAL UPGRADES
            globalUpgrades: { dmg: 0, layers: 0, pierce: 0, speed: 0, aoe: 0, aoePierce: 0 }
        }
        if (dat.target != CUR) newMonkey.target = null;
        else newMonkey.target = CUR;
        var attSpeeds = dat.attSpeeds;
        for (var i = 0; i < attSpeeds.length; i++) {
            newMonkey.attSpeeds.push(attSpeeds[i]);
            newMonkey.timers.push(0);
        }
        var proj = dat.projectiles;
        for (var i = 0; i < proj.length; i++) {
            newMonkey.projectiles.push({
                type: proj[i].type,
                dmgType: proj[i].dmgType,
                pierce: proj[i].pierce,
                dmg: proj[i].dmg,
                layers: proj[i].layers,
                speed: proj[i].speed,
                attSpeedTimer: proj[i].attSpeedTimer,
                offsetAngle: proj[i].offsetAngle,
                aoe: proj[i].aoe,
                aoePierce: proj[i].aoePierce,
                off: proj[i].off
            });
        }
        this.hoveringOver = this.objects.length;
        this.selected = this.objects.length;
        this.placing = null;
        this.objects.push(newMonkey);       // create tower object
        game.qtree.checkRect({              // save obj index to quadTree
            type: "monkeys",
            x: newMonkey.x - dat.layers.main.w * dat.size / 2, w: dat.layers.main.w,
            y: newMonkey.y - dat.layers.main.h * dat.size / 2, h: dat.layers.main.h,
            i: iMonkey,
        });
        game.qtree.checkRange(newMonkey);
        iMonkey++;
        game.map.readData();
        this.checkPlacement();
    }

    sell() {
        if (this.selected === null) return;
        game.monkeys.placingPoint = false;
        var i = this.selected;
        if (this.hoveringOver === i) this.hoveringOver = null;
        else if (this.hoveringOver > i) this.hoveringOver--;
        this.selected = null;
        game.qtree.removeObject('monkeys', i);
        game.qtree.removeObject('monkey_ranges', i);
        game.particles.spawn("sell", this.objects[i]);
        game.money += Math.round(this.objects[i].price * 0.8);
        this.objects.splice(i, 1);
        game.map.readData();
        this.checkPlacement();
    }

    setPoint() {
        if (this.selected === null) return;
        var monkey = this.objects[this.selected];
        monkey.point = {
            x: relativeClientX(),
            y: relativeClientY()
        };
        monkey.angle = Math.atan2(
            relativeX(monkey.x) - clientX,
            relativeY(monkey.y) - clientY
        );
    }

    upgrade(i) {
        if (this.selected === null) return;
        var pathsChosen = 0;
        var path = null;
        var o = this.objects[this.selected];
        for (var j = 0; j < 4; j++) {
            if (o.upgrades[j] > 0) {
                pathsChosen++;
                if (o.upgrades[j] > 2) path = i;
            }
        }
        if (o.upgrades[i] == 2 && pathsChosen == 2 && path != null) return;
        if (pathsChosen == 2 && o.upgrades[i] == 0) return;
        if (o.upgrades[i] == 4) return;
        var nextUpgrades = data[o.type].upgrades[i][o.upgrades[i]];
        nextUpgrades.forEach((up, j) => {
            switch (up.type) {
                case "changeTarget":
                    o.target = up.target;
                    if (up.target == POINT) {
                        this.placingPoint = true;
                        this.setPoint();
                    }
                    break;
                case "effect": o[up.effect] += up.add; break;
                case "set":
                    switch (up.target) {
                        case "attSpeed": for (var j = 0; j < o.attSpeeds.length; j++) o.attSpeeds[j] = up.as; break;
                        case "spread": o.spread = up.as; break;
                        case "globalUpgrades":
                            if (up.as[0] !== null) o.globalUpgrades.dmg = up.as[0];
                            if (up.as[1] !== null) o.globalUpgrades.layers = up.as[1];
                            if (up.as[2] !== null) o.globalUpgrades.pierce = up.as[2];
                            if (up.as[3] !== null) o.globalUpgrades.speed = up.as[3];
                            if (up.as[4] !== null) o.globalUpgrades.aoe = up.as[4];
                            if (up.as[5] !== null) o.globalUpgrades.aoePierce = up.as[5];
                            break;
                        case "projectile":
                            o.projectiles.forEach((proj, j) => {
                                if (proj.type === up.projectile || up.projectile === null) proj[up.set] = up.as;
                            });
                            break;
                    }
                    break;
                case "modify":
                    switch (up.target) {
                        case "projectile":
                            o.globalUpgrades.dmg += up.add[0];
                            o.globalUpgrades.layers += up.add[1];
                            o.globalUpgrades.pierce += up.add[2];
                            o.globalUpgrades.speed += up.add[3];
                            o.globalUpgrades.aoe += up.add[4];
                            o.globalUpgrades.aoePierce += up.add[5];
                            break;
                        case "attSpeed": for (var j = 0; j < o.attSpeeds.length; j++) o.attSpeeds[j] += up.add; break;
                        case "spread":                                                 /**/ o.spread += up.add; break;
                    }
                    break;
                case "offset":
                    o.projectiles.forEach((proj, j) => {
                        if (proj.type == up.projectile) proj.offsetAngle += up.offsetAngle;
                    });
                    break;
                case "add_projectile":
                    var projCopy, src;
                    if (up.info.type == "copy") {
                        for (var j = 0; j < o.projectiles.length; j++) {
                            if (o.projectiles[j].type === up.info.target) {
                                projCopy = o.projectiles[j];
                                break;
                            }
                        }
                    /*  */ src = projCopy;
                    } else src = up.info;
                    if (src !== undefined) {
                        var newProjectile = {
                            type: src.type,
                            dmgType: src.dmgType,
                            pierce: src.pierce,
                            dmg: src.dmg,
                            layers: src.layers,
                            speed: src.speed,
                            aoe: src.aoe,
                            aoePierce: src.aoePierce,
                            off: src.off,
                        };
                        newProjectile.offsetAngle = up.offsetAngle;
                        if (up.timer == "joined") newProjectile.attSpeedTimer = projCopy.attSpeedTimer;
                        else {
                            newProjectile.attSpeedTimer = o.timers.length;
                            o.timers.push(0);
                            o.attSpeeds.push(up.info.attSpeed);
                        }
                        o.projectiles.push(newProjectile);
                    }
                    break;
                case "reset":
                    o.timers = [];
                    o.projectiles = [];
                    break;
                case "particleSize": o.particleSize += up.add; break;
            }
        });
        o.price += o.upgradePrices[i][o.upgrades[i]];
        o.upgrades[i]++;
        if (o.paths[0].i === null || o.paths[0].i === i) {
            o.paths[0].val = o.upgrades[i];
            o.paths[0].i = i;
        } else {
            o.paths[1].val = o.upgrades[i];
            o.paths[1].i = i;
        }
        if (o.paths[1].val > 2 && o.paths[1].val > o.paths[0].val) {
            var temp = o.paths[0].val;
            o.paths[0].val = o.paths[1].val;
            o.paths[1].val = temp;
            temp = o.paths[0].i;
            o.paths[0].i = o.paths[1].i;
            o.paths[1].i = temp;
        }
    }
}

const icons = {
    point: { w: 100, h: 100 }
}
// [dmg, layers, pierce, speed, aoe, aoe pierce]
const data = {
    dartling: {
        price: 720,
        upgradePrices: [
            [200, 500, 1200, 4000],
            [800, 1200, 1600, 2000],
            [400, 800, 2000, 8000],
            [125, 350, 3200, 5000],
        ],
        layers: {
            bot: { w: 130, h: 220, off: { x: 0, y: -65 }, animFrames: 1, type: "secondary" },
            bot_outline: { w: 143, h: 242 },
            main: { w: 150, h: 165, off: { x: 0, y: 10 }, animFrames: 0, type: "main" },
            main_outline: { w: 165, h: 181.5 },
            // top
            // top_outline
        },
        target: CUR,
        size: 0.5,
        range: 75, on: land,
        attSpeeds: [400],
        canTurn: true,
        distraction: 0,
        poison: 0,
        poisonDMG: 0,
        spread: 30,
        projectiles: [{
            type: DART, dmg: 1, layers: 1, pierce: 1, speed: 10, aoe: 0, aoePierce: 0, attSpeedTimer: 0, offsetAngle: 0, off: 125, dmgType: BASE
        }],
        upgrades: [[[
            { type: "modify", target: "projectile", projectile: null, add: [2, 0, 1, 0, 0, 0] },
            { type: "modify", target: "spread", add: -5 },
        ], [
            { type: "modify", target: "projectile", projectile: null, add: [5, 0, 2, 0, 0, 0] },
            { type: "modify", target: "attSpeed", add: -100 },
            { type: "modify", target: "spread", add: -5 },
        ], [
            { type: "modify", target: "projectile", projectile: null, add: [10, 1, 4, 0, 0, 0] },
            { type: "modify", target: "attSpeed", add: -100 },
            { type: "set", target: "spread", as: 5 },
        ], [
            { type: "modify", target: "projectile", projectile: null, add: [25, 3, 5, 0, 0, 0] },
            { type: "modify", target: "attSpeed", add: -100 },
            { type: "set", target: "spread", as: 0 },
        ]], [[
            { type: "modify", target: "projectile", projectile: null, add: [3, 1, 1, 0, 0, 0] },
            { type: "modify", target: "spread", add: 2 },
            { type: "effect", effect: "poison", add: 1 },
            { type: "effect", effect: "poisonDMG", add: 2 },
        ], [
            { type: "modify", target: "projectile", projectile: null, add: [3, 1, 1, 0, 0, 0] },
            { type: "modify", target: "spread", add: 2 },
            { type: "effect", effect: "poison", add: 2 },
            { type: "effect", effect: "poisonDMG", add: 4 },
        ], [
            { type: "modify", target: "projectile", projectile: null, add: [3, 1, 1, 0, 0, 0] },
            { type: "modify", target: "spread", add: 2 },
            { type: "effect", effect: "poison", add: 3 },
            { type: "effect", effect: "poisonDMG", add: 8 },
        ], [
            { type: "modify", target: "projectile", projectile: null, add: [3, 1, 1, 0, 0, 0] },
            { type: "modify", target: "spread", add: 2 },
            { type: "effect", effect: "poison", add: 4 },
            { type: "effect", effect: "poisonDMG", add: 16 },
        ]], [[
            { type: "set", target: "projectile", set: "type", as: BULLET, projectile: DART },
            { type: "modify", target: "projectile", projectile: null, add: [5, 1, 0, 3, 0, 0] },
        ], [
            { type: "modify", target: "projectile", projectile: null, add: [10, 1, 0, 3, 0, 0] },
        ], [
            { type: "modify", target: "projectile", projectile: null, add: [2, 1, 0, 5, 100, 100] },
            { type: "set", target: "projectile", set: "type", as: ROCKET, projectile: null },
            { type: "set", target: "projectile", set: "dmgType", as: EXPLOSIVE, projectile: null },
        ], [
            { type: "add_projectile", timer: "joined", offsetAngle: 10, info: { type: "copy", target: ROCKET } },
            { type: "add_projectile", timer: "joined", offsetAngle: -10, info: { type: "copy", target: ROCKET } },
            { type: "modify", target: "spread", add: 10 },
            { type: "modify", target: "attSpeed", add: -50 },
            { type: "modify", target: "projectile", projectile: null, add: [20, 1, 0, 1, 100, 100] },
            { type: "particleSize", add: 0.2 },
        ]], [[
            { type: "changeTarget", target: POINT },
            { type: "modify", target: "projectile", projectile: null, add: [1, 0, 1, 1, 0, 0] },
            { type: "particleSize", add: 0.2 },
            { type: "modify", target: "spread", add: -15 },
        ], [
            { type: "modify", target: "projectile", projectile: null, add: [1, 0, 2, 5, 0, 0] },
            { type: "set", target: "globalUpgrades", as: [null, null, null, null, 0, 0] },
            { type: "set", target: "projectile", set: "type", as: BEAM, projectile: null },
            { type: "set", target: "projectile", set: "dmgType", as: BEAM, projectile: null },
        ], [
            { type: "modify", target: "projectile", projectile: null, add: [3, 1, 3, 2, 0, 0] },
            { type: "modify", target: "attSpeed", add: -100 },
        ], [
            { type: "modify", target: "projectile", projectile: null, add: [5, 1, 4, 2, 0, 0] },
            { type: "modify", target: "attSpeed", add: -100 },
        ]]]
    },
    ninja: {
        price: 500,
        upgradePrices: [
            [200, 450, 1200, 3200],
            [150, 300, 1500, 4000],
            [300, 500, 1000, 8000],
            [600, 1200, 1800, 2200]
        ],
        layers: {
            bot: { w: 60, h: 55, off: { x: 12, y: -42 }, animFrames: 2, type: "main" },
            bot_outline: { w: 65, h: 60 },
            main: { w: 110, h: 95, off: { x: 0, y: 0 }, animFrames: 0, type: "main" },
            main_outline: { w: 103, h: 105 },
            top: { w: 84, h: 38, off: { x: 3, y: -18 }, animFrames: 0, type: "secondary" },
        },
        target: BLOONS,
        size: 0.9,
        range: 225, on: land,
        attSpeeds: [1000],
        canTurn: true,
        distraction: 0,
        poison: 0,
        poisonDMG: 0,
        spread: 0,
        projectiles: [{
            type: "shuriken", pierce: 1, dmg: 1, layers: 1, speed: 10, aoe: 0, aoePierce: 0, attSpeedTimer: 0, offsetAngle: 0, off: 50, dmgType: BASE
        }],
        upgrades: [[[
            { type: "modify", target: "projectile", add: [3, 1, 1, -.25, 0, 0] }
        ], [
            { type: "modify", target: "projectile", add: [5, 2, 0, -.5, 0, 0] },
            { type: "modify", target: "attSpeed", add: -100 }
        ], [
            { type: "modify", target: "projectile", add: [10, 2, 2, -.5, 0, 0] }
        ], [
            { type: "modify", target: "projectile", add: [17, 5, 0, -1, 0, 0] }
        ],],
        [[
            { type: "modify", target: "projectile", add: [0, 0, 2, 2, 0, 0] }
        ], [
            { type: "modify", target: "attSpeed", add: -120 },
            { type: "modify", target: "projectile", add: [0, 0, 1, 1, 0, 0] },
        ], [
            { type: "offset", projectile: "shuriken", offsetAngle: -5 },
            { type: "add_projectile", timer: "joined", offsetAngle: 5, info: { type: "copy", target: SHURIKEN, }, },
            { type: "add_projectile", timer: "joined", offsetAngle: 5, info: { type: "copy", target: BOMB, }, },
            { type: "modify", target: "projectile", add: [1, 1, 2, 1, 0, 0] },
            { type: "modify", target: "attSpeed", add: -180 },
        ], [
            { type: "add_projectile", timer: "joined", offsetAngle: 15, info: { type: "copy", target: SHURIKEN, }, },
            { type: "add_projectile", timer: "joined", offsetAngle: -15, info: { type: "copy", target: SHURIKEN, }, },
            { type: "add_projectile", timer: "joined", offsetAngle: 15, info: { type: "copy", target: BOMB, }, },
            { type: "add_projectile", timer: "joined", offsetAngle: -15, info: { type: "copy", target: BOMB, }, },
            { type: "modify", target: "projectile", add: [2, 1, 2, 1, 0, 0] },
            { type: "modify", target: "attSpeed", add: 100 },
        ],],
        [[
            { type: "effect", effect: "distraction", add: 1 }
        ], [
            { type: "effect", effect: "distraction", add: 1 }
        ], [
            { type: "effect", effect: "distraction", add: 1 }
        ], [
            { type: "effect", effect: "distraction", add: 1 }
        ],],
        [[
            { type: "set", target: "projectile", set: "type", as: BOMB, projectile: null },
            { type: "set", target: "projectile", set: "dmgType", as: EXPLOSIVE, projectile: null },
            { type: "set", target: "globalUpgrades", as: [1, 1, 1, 10, 100, 50] },
        ], [
            { type: "modify", target: "attSpeed", add: -400 },
        ], [
            { type: "particleSize", add: 0.1 },
            { type: "modify", target: "projectile", add: [10, 1, 0, 0.5, 50, 100] }
        ], [
            { type: "particleSize", add: 0.2 },
            { type: "modify", target: "projectile", add: [100, 1, 0, 0.5, 50, 150] }
        ],],],
    },
}