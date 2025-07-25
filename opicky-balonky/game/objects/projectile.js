import { game } from "../../index.js";

export default class Projectiles {
    constructor() {
        createImages(data, 'img', { start: 'projectiles', end: '.png' });
        this.objects = [];
    }

    update() {
        for (var i = 0; i < this.objects.length; i++) {
            var o = this.objects[i];
            o.x += o.speed.x * dt;
            o.y += o.speed.y * dt;
            if (o.type !== "temp" && o.type !== "remove") o.angle += data[o.type].rSpeed;
            if (o.x < - 200 || o.x > game.settings.resolution.x + 200 ||
                o.y < - 200 || o.y > game.settings.resolution.y + 200) {
                this.objects.splice(i, 1);
            } else {
                game.qtree.checkRect({
                    type: "projectiles",
                    i: o.i,
                    x: o.x - o.w / 2, w: o.w,
                    y: o.y - o.h / 2, h: o.h,
                });
            }
        }
    }

    draw() {
        for (var i = 0; i < this.objects.length; i++) {
            var o = this.objects[i];
            if (o.type != "temp" && o.type !== "remove") {
                ctx.save();
                ctx.translate(relativeX(o.x), relativeY(o.y));
                ctx.rotate(o.angle);
                ctx.drawImage(data[o.type].img, -o.w / p / 2, -o.h / p / 2, o.w / p, o.h / p);
                ctx.restore();
            }
        }
    }

    removeTemp() {
        for (var i = 0; i < this.objects.length; i++) {
            if (this.objects[i].type === "temp") {
                this.objects[i].type = "remove";
                return;
            }
            if (this.objects[i].type == "remove")
                this.objects.splice(i, 1);
        }
    }

    hit(bI, pI) {
        var proj = this.objects[pI];
        proj.pierce--;
        if (proj.pierce < 1) {
            if (proj.dmgType == "explosive" && proj.type !== "temp" && proj.type !== "remove") game.particles.spawn("explosion", proj);
            this.objects.splice(pI, 1);
        }
    }

    spawn(src, proj) {
        if (src.globalUpgrades === undefined) var gUpgrades = { dmg: 0, layers: 0, pierce: 0, speed: 0, aoe: 0, aoePierce: 0 }
        else                             /**/ var gUpgrades = src.globalUpgrades;
        var angle = 0;
        var offsetAngle = 0;
        var size = proj.size;
        if (!proj.isTemp) {
            switch (src.target) {
                case CUR:  /**/angle = Math.atan2(clientX - relativeX(src.x),           /**/ clientY - relativeY(src.y));               /**/break;
                case POINT:/**/angle = Math.atan2(src.point.x - src.x,                  /**/ src.point.y - src.y);                      /**/break;
                default:   /**/angle = Math.atan2(game.bloons.objects[src.target].x - src.x, game.bloons.objects[src.target].y - src.y);/**/break;
            }
            var projOffAngle = proj.offsetAngle;
            if (projOffAngle < 0) projOffAngle = 0;
            offsetAngle = (proj.offsetAngle + (Math.random() * src.spread - src.spread / 2)) * Math.PI / 180;
            size = data[proj.type].size;
        }
        var newProj = {
            type: proj.type,
            dmgType: proj.dmgType,
            x: src.x, w: size,
            y: src.y, h: size,
            hb: size,
            i: iProjectile,
            dmg: proj.dmg + gUpgrades.dmg,
            layers: proj.layers + gUpgrades.layers,
            pierce: proj.pierce + gUpgrades.pierce,
            speed: {
                x: Math.sin(angle + offsetAngle) * (proj.speed + gUpgrades.speed),
                y: Math.cos(angle + offsetAngle) * (proj.speed + gUpgrades.speed),
            },
            aoe: proj.aoe + gUpgrades.aoe,
            aoePierce: proj.aoePierce + gUpgrades.aoePierce,
            angle: -angle + Math.PI - offsetAngle,
            distraction: src.distraction,
            poison: src.poison,
            poisonDMG: src.poisonDMG,
            lastHit: null,
            particleSize: src.particleSize,
        };
        if (newProj.dmgType === EXPLOSIVE && newProj.aoe > 0) newProj.pierce = 1;
        if (proj.off > 0) {
            newProj.x += Math.sin(angle) * proj.off;
            newProj.y += Math.cos(angle) * proj.off;
        }
        this.objects.push(newProj);
        iProjectile++;
    }
}

const data = {
    beam: { size: 80, rSpeed: 0 },
    dart: { size: 30, rSpeed: 0 },
    rocket: { size: 40, rSpeed: 0 },
    bomb: { size: 50, rSpeed: 0.2 },
    shuriken: { size: 35, rSpeed: 0.1 },
    bullet: { size: 30, rSpeed: 0 },
}