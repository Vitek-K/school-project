import { game } from "../../index.js";

export default class Particle {
    constructor() {
        createImages(data, 'img', { start: 'particles', end: '.png' });
        this.objects = [];
    }

    update() {
        for (var i = 0; i < this.objects.length; i++) {
            var o = this.objects[i];
            o.timer += tp;
            if (o.timer > data[o.type].speed) {
                o.timer = 0;
                o.stage++;
                if (o.stage > data[o.type].stages) this.objects.splice(i, 1);
            }
        }
    }

    draw() {
        this.objects.forEach((o, i) => {
            ctx.save();
            ctx.translate(relativeX(o.x), relativeY(o.y));
            ctx.rotate(o.angle);
            var dat = data[o.type], size = dat.size * o.size;
            ctx.drawImage(data[o.type].img, dat.w * o.stage, 0, dat.w, dat.h, -size / 2 / p, -size / 2 / p, size / p, size / p);
            ctx.restore();
        });
    }

    spawn(type, src) {
        var size = src.particleSize;
        if (size === undefined) size = Math.random() + 0.5;
        var newParticle = {
            type: type,
            timer: 0,
            stage: 0,
            angle: 0,
            x: src.x + data[type].off.x,
            y: src.y + data[type].off.y,
            size: size,
        }
        if (data[type].rotates) newParticle.angle = Math.random() * (Math.PI * 2);
        this.objects.push(newParticle);
    }
}

const data = {
    poison: { speed: 70, stages: 6, size: 40, w: 50, h: 50, rotates: false, off: { x: 0, y: -10 } },
    explosion: { speed: 80, stages: 4, size: 120, w: 80, h: 80, rotates: true, off: { x: 0, y: 0 } },
    pop: { speed: 50, stages: 3, size: 50, w: 80, h: 80, rotates: true, off: { x: 0, y: 0 } },
    sell: { speed: 70, stages: 3, size: 75, w: 80, h: 80, rotates: true, off: { x: 0, y: 0 } },
}