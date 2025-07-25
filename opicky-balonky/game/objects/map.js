import { game } from "../../index.js";

export default class Map {
    constructor() {
        createImages(data, 'info_img', { start: 'maps', end: '/info.png' });
        createImages(data, 'img', /**/ { start: 'maps', end: '/src.png' });
        this.map = "";
        this.data = [];
        this.points = [];
        this.directions = [];
        this.types = [];
        Object.entries(data).forEach(o => { this.types.push(o[0]); });
    }

    setMap() {
        this.map = this.types[this.mapIndex];
        this.points = data[this.map].points;
        this.directions = data[this.map].directions;
        this.readData();
    }

    readData() {
        hctx.clearRect(0, 0, game.settings.resolution.x, game.settings.resolution.y);
        hctx.drawImage(data[this.map].info_img, 0, 0);
        hctx.fillStyle = "black";
        game.monkeys.objects.forEach((o, i) => { hctx.fillRect(o.x - o.w / 2, o.y - o.h / 2, o.w, o.h) });
        this.data = hctx.getImageData(0, 0, game.settings.resolution.x, game.settings.resolution.y).data;
    }

    drawMap(x, y, w, h) {
        ctx.drawImage(data[this.map].img, x, y, w, h);
    }

    draw() {
        this.drawMap(offsetX, offsetY, game.width, game.height);
        // ctx.fillStyle = "black";
        // data[this.map].points.forEach((point, i) => {
        //     fillCircle(relativeX(point.x), relativeY(point.y), 10 / p);
        // });
    }

}

const data = {
    řeka: {
        points: [
            { x: -200, y: 160 },
            { x: 0, y: 160 },
            { x: 200, y: 160 },
            { x: 350, y: 165 },
            { x: 575, y: 200 },
            { x: 665, y: 200 },
            { x: 760, y: 185 },
            { x: 870, y: 160 },
            { x: 1030, y: 140 },
            { x: 1090, y: 150 },
            { x: 1140, y: 200 },
            { x: 1165, y: 260 },
            { x: 1160, y: 330 },
            { x: 1135, y: 400 },
            { x: 1100, y: 500 },
            { x: 1050, y: 565 },
            { x: 970, y: 605 },
            { x: 880, y: 610 },
            { x: 740, y: 570 },
            { x: 600, y: 500 },
            { x: 470, y: 440 },
            { x: 300, y: 360 },
            { x: 210, y: 355 },
            { x: 140, y: 380 },
            { x: 90, y: 450 },
            { x: 90, y: 530 },
            { x: 140, y: 600 },
            { x: 210, y: 640 },
            { x: 285, y: 650 },
            { x: 350, y: 640 },
            { x: 430, y: 610 },
            { x: 500, y: 615 },
            { x: 550, y: 640 },
            { x: 570, y: 670 },
            { x: 580, y: 720 },
            { x: 580, y: 920 }
        ]
    },
    údolí: {
        points: [
            { x: -200, y: 0 },
            { x: 0, y: 85 },
            { x: 240, y: 200 },
            { x: 480, y: 290 },
            { x: 520, y: 300 },
            { x: 800, y: 350 },
            { x: 880, y: 370 },
            { x: 1050, y: 420 },
            { x: 1280, y: 520 },
            { x: 1500, y: 650 },
        ]
    }
}

Object.entries(data).forEach((map, index) => {
    map[1].directions = [];
    for (var i = 0; i != data[map[0]].points.length; i++) {
        if (map[1].points[i + 1] === undefined) return;
        var startX = map[1].points[i].x; var nextX = map[1].points[i + 1].x;
        var startY = map[1].points[i].y; var nextY = map[1].points[i + 1].y;
        var angle = Math.atan2(nextX - startX, nextY - startY);
        var x = Math.round(Math.sin(angle) * 1000) / 1000;
        var y = Math.round(Math.cos(angle) * 1000) / 1000;
        map[1].directions.push({ x: x, y: y });
    }
});