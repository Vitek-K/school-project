import { game } from "../index.js";

const h2 = { w: 50, h: 55 };
const moneyPos = { x: 0, y: 0 };                    // position of money counter
const lifePos = { x: 1280 - h2.w, y: 0 };           // position of life counter

const upMenuSize = [{ w: 216, h: 162 }, { w: 216, h: 74 }];
const upgradeIco = { w: upMenuSize[0].w * 0.8, h: upMenuSize[0].h * 0.8 };
const upImg = { w: 240, h: 180 };

export default class Menu {
    constructor() {
        createImages(fonts, 'img', /*     */ { start: 'fonts', /*      */ end: '.png' });
        createImages(icons, 'img', /*     */ { start: 'fonts/icons', /**/ end: '.png' });
        createImages(monkeys, 'upgrade_img', { start: 'monkeys/upgrades', end: '.png' });
        this.buttons = []; this.buttonSelected = null;
        this.hovers = []; this.hoverSelected = null;
    }

    createBigBloons() {
        game.bloons.types.forEach(type => { menus["big_" + type] = {}; });
        createImages(menus, 'img', { start: 'menus', end: '.png' });
    }

    reset() {
        this.buttons = []; this.buttonSelected = null;
        this.hovers = []; this.hoverSelected = null;
    }

    drawSubmit() {
        ctx.fillStyle = ca(0, 0.7);
        ctx.fillRect(0, 0, innerWidth, innerHeight);
        this.drawQuitButton();
        ctx.fillStyle = "white";
        var font = 100 / p;
        ctx.font = font + "px Arial";
        var txt = "Konec Hry";
        var w = ctx.measureText(txt).width;
        ctx.fillText(txt, innerWidth / 2 - w / 2, relativeY(120));
        var font = 50 / p;
        ctx.font = font + "px Arial";
        var txt = "Počet životů klesl na nulu."
        var w = ctx.measureText(txt).width;
        ctx.fillText(txt, innerWidth / 2 - w / 2, relativeY(200));
        // var w = 200 / p;
        // var h = 200 / p;
        // var off = 10 / p;
        // var rotates = 0;
        // for (var j = 0; j < 2; j++) {
        //     var y = innerHeight / 2 - (h - off) + (h - off) * j + 95 / p;
        //     for (var i = 0; i < 3; i++) {
        //         var x = innerWidth / 2 - 1.5 * (w - off) + (w - off) * i + 95 / p;
        //         var angle = Math.PI / 2 * rotates;
        //         ctx.save();
        //         ctx.translate(x, y);
        //         ctx.rotate(angle);
        //         ctx.drawImage(menus.bg.img, -w / 2, -h / 2, w, h);
        //         ctx.restore();
        //         if (rotates === 1) rotates = 0;
        //         else /*         */ rotates = 1;
        //     }
        // }
        // x -= w * 2.5 - 15 / p;
        // y -= h * 1.5;
        // ctx.drawImage(menus.separator_big.img, x, y, 590 / p, 30 / p);
        // y += h * 1.9;
        // ctx.drawImage(menus.separator_big.img, x, y, 590 / p, 30 / p);
        // var w = 530 / p;
        // var h = 80 / p;
        // ctx.fillStyle = "white";
        // var font = 50 / p;
        // ctx.font = font + "px Arial";
        // var txt = "Napiš své jméno";
        // var w = ctx.measureText(txt).width;
        // ctx.fillText(txt, innerWidth / 2 - w / 2, relativeY(370));
        // var x = relativeX(650);
        // var y = relativeY(525);
        // var w = 410 / p;
        // var h = 90 / p;
        // ctx.drawImage(menus.price_segment.img, x, y, w, h);
        // if (this.buttonSelected === 1) {
        //     ctx.fillStyle = ca(200, 0.05);
        //     ctx.fillRect(x, y, w, h);
        // }
        // var txt = "Poslat skóre";
        // var w = ctx.measureText(txt).width;
        // ctx.fillStyle = "white";
        // ctx.fillText(txt, innerWidth / 2 - w / 2, relativeY(590));
    }

    drawGame() {
        this.showStats();
        this.drawUpgrade();
        this.drawMonkeySelect();
    }

    changeState(gameState, menuState) {
        game.state = gameState;
        // nameInput.style.display = "none";
        this.reset();
        switch (gameState) {
            case PLAYING: this.setupGame(); break;
            case MENU:
                game.menuState = menuState;
                switch (menuState) {
                    case MAIN:    /**/ this.setupMain(); break;
                    case MAP:     /**/ this.setupMap(); break;
                    case INSTRUCTIONS: this.setupBasic(); break;
                    case SCORE:   /**/ this.setupLeaderboard(); break;
                    case SUBMIT:  /**/ this.setupSubmit(); break;
                }
                break;
        }
        for (var i = 0; i < this.buttons.length; i++) {
            if (game.input.buttonHover(i)) {
                this.buttonSelected = i;
                break;
            }
        }
    }

    setupSubmit() {
        this.setupBasic();
        // nameInput.style.display = "";
        this.buttons.push({ x: 655, y: 530, w: 400, h: 80 });
    }

    setupMap() {
        this.setupBasic();
        var scl = 150;
        var y = 400;
        this.buttons.push({ x: 250, y: y, w: scl, h: scl });
        this.buttons.push({ x: 1300, y: y, w: scl, h: scl });
        this.buttons.push({ x: 450, y: 225, w: 800, h: 500 });
    }

    setupMain() {
        this.menuBloons = [];
        for (var i = 0; i < 5; i++) {
            this.menuBloons.push(Math.floor(Math.random() * game.bloons.types.length));
        }
        for (var i = 0; i < 3; i++) {
            this.buttons.push({ x: 25, y: 25 + 110 * i, w: 300, h: 90 });
        }
    }

    drawMapSelection() {
        this.drawBasic();
        var x = relativeX(450);
        var y = relativeY(225);
        var w = 800 / p;
        var h = 500 / p;
        ctx.fillStyle = "black";
        var off = 10 / p;
        ctx.fillRect(x - off, y - off, w + off * 2, h + off * 2);
        game.map.drawMap(x, y, w, h);
        var scl = 150 / p;
        var y = relativeY(400);
        ctx.drawImage(icons.arrow.img, relativeX(250), y, scl, scl);
        ctx.save();
        ctx.translate(relativeX(1375), y + scl / 2);
        ctx.rotate(Math.PI);
        ctx.drawImage(icons.arrow.img, -scl / 2, -scl / 2, scl, scl);
        ctx.restore();
        var txt = game.map.map;
        var font = 120 / p;
        ctx.fillStyle = "white";
        ctx.font = font + "px Arial";
        var w = ctx.measureText(txt).width;
        ctx.fillText(txt, innerWidth / 2 - w / 2, relativeY(150));
    }

    drawInstructions() {
        this.drawBasic();
        var txt = "Instrukce";
        var font = 50 / p;
        ctx.font = font + "px Arial";
        var w = ctx.measureText(txt).width;
        ctx.fillStyle = "white";
        ctx.fillText(txt, innerWidth / 2 - w / 2, offsetY + 70 / p);
        ctx.fillRect(offsetX + game.width / gSize * 0.2, offsetY + 100 / p, game.width / gSize * 0.6, 5 / p);
        var x = relativeX(250);
        var y = relativeY(180);
        var off = 60 / p;
        ctx.fillText("Cílem hry je co nejdéle udržet balónky,", x, y);
        y += off;
        ctx.fillText("aby se nedostaly na druhou stranu mapy.", x, y);
        y += off + off;
        ctx.fillText("Ničení balónků vydělává peníze.", x, y);
        y += off;
        ctx.fillText("Za peníze se nakupují opice a jejich vylepšení.", x, y);
        y += off + off;
        // ctx.fillText("Čím déle se udržíš, tím větší bude tvé skóre.", x, y);
        y += off;
        // ctx.fillText("Na konci hry budeš mít možnost své skóre sdílet,", x, y);
        y += off;
        // ctx.fillText("takže můžeš soutěžit s ostatními hráči.", x, y);
        y += off + off * .7;
        ctx.fillRect(offsetX + game.width / gSize * 0.2, offsetY + 700 / p, game.width / gSize * 0.6, 5 / p);
        off *= .8;
        ctx.font = (font * .7) + "px Arial";
        ctx.fillText("q, w, e, r", x, y);
        ctx.fillText("- nákup vylepšení", x + 200 / p, y);
        y += off;
        ctx.fillText("1, 2", x, y);
        ctx.fillText("- výběr opice", x + 200 / p, y);
        y += off;
        ctx.fillText("Backspace", x, y);
        ctx.fillText("- prodej vybrané opice", x + 200 / p, y);
        y += off;
        var txt = "Esc, Pravé kliknutí - zrušení výběru opice";
        var w = ctx.measureText(txt).width;
        ctx.fillText(txt, innerWidth / 2 - w / 2, y + off * .3);
        y -= off + off + off;
        x += 700 / p;
        ctx.fillText("Esc", x, y);
        ctx.fillText("- pozastavení hry", x + 200 / p, y);
        y += off;
        ctx.fillText("Mezerník", x, y);
        ctx.fillText("- zrychlení hry", x + 200 / p, y);
    }

    drawMainMenu() {
        this.basicBg();
        this.right();
        var x = relativeX(25);
        var y = relativeY(25);
        var w = 300 / p;
        var h = 90 / p;
        var texts = ["Hrát", "Instrukce", "Skóre"];
        for (var i = 0; i < 3; i++) {
            ctx.drawImage(menus.price_segment.img, x, y + (110 / p) * i, w, h);
            if (this.buttonSelected === i) {
                ctx.fillStyle = ca(200, 0.05);
                ctx.fillRect(x, y + (110 / p) * i, w, h);
            }
            ctx.fillStyle = "white";
            var font = 40 / p;
            ctx.font = font + "px Arial";
            ctx.fillText(texts[i], x + 30 / p, y + (110 / p) * i + font + 20 / p);
        }
        var off = 25;
        for (var i = 0; i < this.menuBloons.length; i++) {
            ctx.drawImage(menus["big_" + game.bloons.types[this.menuBloons[i]]].img, relativeX(490 + 200 * i), relativeY(570 - off * i), 220 / p, 400 / p);
            off += 10;
        }
        ctx.save();
        ctx.translate(relativeX(930), relativeY(200));
        ctx.rotate(-.1);
        var w = 1100 / p;
        var h = 140 / p;
        ctx.drawImage(fonts.title.img, -w / 2, -h / 2, w, h);
        ctx.restore();
    }

    setupBasic() {
        this.buttons.push({ x: 30, y: 30, w: 100, h: 100 });
    }

    getScores() {
        //     socket.emit('get_scores', game.map.map);
        //     if (game.scoreSubmitted && game.player.map === game.map.map)
        //         socket.emit('get_me', { score: game.player.scoreSubmitted, map: game.player.map });
    }

    setupLeaderboard() {
        this.setupBasic();
        this.getScores();
        var scl = 100;
        this.buttons.push({ x: 360, y: 0, w: scl, h: scl });
        this.buttons.push({ x: 1250, y: 0, w: scl, h: scl });
    }

    drawBasic() {
        this.basicBg();
        this.left();
        this.right();
        this.drawQuitButton();
    }

    drawQuitButton() {
        var x = relativeX(30);
        var y = relativeY(30);
        var w = 100 / p;
        var h = 100 / p;
        ctx.drawImage(menus.button.img, x, y, w, h);
        if (this.buttonSelected === 0) {
            ctx.fillStyle = ca(200, 0.05);
            ctx.fillRect(x, y, w, h);
        }
        w = 70 / p;
        h = 70 / p;
        ctx.drawImage(icons.arrow.img, x + 15 / p, y + 15 / p, w, h);
    }

    basicBg() {
        // * WOOD BG
        var x = offsetX;
        var y = offsetY;
        var w = menus.bg.w / p;
        var h = menus.bg.h / p;
        for (var i = 0; i < 3; i++) {
            y = offsetY + h * i;
            var off = 0;
            if (i % 2 == 0) off = w / 1.6;
            for (var j = 0; j < 8; j++) {
                x = offsetX + w * j * 0.9 - off;
                ctx.drawImage(menus.bg.img, x, y, w, h);
            }
        }
        ctx.fillStyle = ca(0, 0.5);
        ctx.fillRect(0, 0, innerWidth, innerHeight);
    }

    left() {
        // * GRADIENT
        var x = offsetX + 70 / p;
        var y = offsetY;
        var w = game.width / 10;
        var h = game.height / gSize;
        var grd = ctx.createLinearGradient(x, 0, w + x, 0);
        grd.addColorStop(0, rgb(10, 80, 30));
        grd.addColorStop(1, "black");
        ctx.fillStyle = grd;
        ctx.fillRect(x, y, w, h);
        // * LEAF
        var w = icons.leaf.w / p;
        var h = icons.leaf.h / p;
        var x = 40 / p + offsetX;
        var y = offsetY - h;
        for (var i = 0; i < 13; i++) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(Math.PI / 3);
            ctx.drawImage(icons.leaf.img, -w / 2, -h / 2, w, h);
            ctx.restore();
            y += h / 2;
        }
        // * SEPARATOR
        var x = offsetX + 180 / p;
        var y = offsetY - 40 / p;
        var w = menus.separator_big.w / p;
        var h = menus.separator_big.h / p;
        for (var i = 0; i < 5; i++) {
            ctx.save();
            ctx.translate(x, y)
            ctx.rotate(Math.PI / 2);
            ctx.drawImage(menus.separator_big.img, -w / 2, -h / 2, w, h)
            ctx.restore();
            y += w * 0.8;
        }
    }

    right() {
        // * GRADIENT
        var x = game.width / gSize - 200 / p + offsetX;
        var y = offsetY;
        var w = game.width / 10;
        var h = game.height / gSize;
        var grd = ctx.createLinearGradient(x, 0, w + x, 0);
        grd.addColorStop(0, "black");
        grd.addColorStop(1, rgb(10, 80, 30));
        ctx.fillStyle = grd;
        ctx.fillRect(x, y, w, h);
        // * LEAF
        var w = icons.leaf.w / p;
        var h = icons.leaf.h / p;
        var x = game.width / gSize - 35 / p + offsetX;
        var y = offsetY;
        for (var i = 0; i < 13; i++) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(-Math.PI * 0.6);
            ctx.drawImage(icons.leaf.img, -w / 2, -h / 2, w, h);
            ctx.restore();
            y += h / 2;
        }
        // * SEPARATOR
        var w = menus.separator_big.w / p;
        var h = menus.separator_big.h / p;
        var x = game.width / gSize + offsetX - 180 / p;
        var y = offsetY - 40 / p;
        for (var i = 0; i < 5; i++) {
            ctx.save();
            ctx.translate(x, y)
            ctx.rotate(Math.PI / 2);
            ctx.drawImage(menus.separator_big.img, -w / 2, -h / 2, w, h)
            ctx.restore();
            y += w * 0.8;
        }
    }

    drawLeaderboard() {
        this.drawBasic();
        var txt = "Nejlepší skóre - " + game.map.map;
        var font = 50 / p;
        ctx.font = font + "px Arial";
        var w = ctx.measureText(txt).width;
        ctx.fillStyle = "white";
        ctx.fillText(txt, innerWidth / 2 - w / 2, offsetY + 70 / p);
        ctx.fillRect(offsetX + game.width / gSize * 0.2, 100 / p + offsetY, game.width / gSize * 0.6, 5 / p);
        // if (scores !== null) {
        //     var x = relativeX(500);
        //     var y = relativeY(200);
        //     var i = 1;
        //     scores.forEach(o => {
        //         var font = 40 / p;
        //         ctx.font = font + "px Arial";
        //         if (i > 3) ctx.fillText(i + ".", x - 100 / p, y);
        //         else ctx.drawImage(icons.crown.img, (i - 1) * icons.crown.w, 0, icons.crown.w, icons.crown.h, x - 125 / p, y - 40 / p, 65 / p, 45 / p);
        //         var txt = o.name;
        //         ctx.fillText(txt, x, y);
        //         var txt = o.score;
        //         ctx.fillText(txt, x + 600 / p, y);
        //         y += 60 / p;
        //         i++;
        //     });
        // }
        ctx.fillRect(offsetX + game.width / gSize * 0.2, relativeY(825), game.width / gSize * 0.6, 5 / p);
        // if (myLeaderboardPos !== null && game.player.map === game.map.map) {
        //     var font = 40 / p;
        //     ctx.font = font + "px Arial";
        //     var y = relativeY(900);
        //     ctx.fillText(myLeaderboardPos + ".", x - 100 / p, y);
        //     var txt = game.player.name;
        //     ctx.fillText(txt, x, y);
        //     var txt = game.player.scoreSubmitted;
        //     ctx.fillText(txt, x + 600 / p, y);
        // }
        var scl = 50 / p;
        ctx.save();
        ctx.translate(relativeX(410), relativeY(50));
        ctx.drawImage(icons.arrow.img, -scl / 2, -scl / 2, scl, scl);
        ctx.restore();
        ctx.save();
        ctx.translate(relativeX(1300), relativeY(50));
        ctx.rotate(Math.PI);
        ctx.drawImage(icons.arrow.img, -scl / 2, -scl / 2, scl, scl);
        ctx.restore();

        // !
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(0, 0, innerWidth, innerHeight);
        var font = 100 / p;
        ctx.fillStyle = 'white';
        ctx.font = font + 'px Arial';
        var txt = 'Není dostupné v této verzi.';
        var w = ctx.measureText(txt).width;
        ctx.fillText(txt, innerWidth / 2 - w / 2, 500 / p);
        this.drawQuitButton();
    }

    setupGame() {
        for (var i = 0; i < 4; i++) {
            var x = game.settings.resolution.x - menus.upgrade_segment.w * 4 + menus.upgrade_segment.w * i - 2;
            var y = game.settings.resolution.y;
            this.buttons.push({ x: x, y: y, w: menus.upgrade_segment.w, h: game.settings.resolution.y / gSize * (1 - gSize), });
            this.hovers.push({ x: x, y: y + menus.upgrade_segment.h - 50, w: 50, h: 50, });
        }
        for (var i = 0; i < 3; i++) {
            var scl = 130;
            var off = 9;
            var x = game.settings.resolution.x + off + off * i + scl * i;
            var y = off;
            this.buttons.push({ x: x, y: y, w: scl, h: scl, active: false });
        }
        this.buttons.push({ x: 68, y: game.settings.resolution.y + 145, w: menus.price_segment.w * 1.3, h: menus.price_segment.h });
        var y = 90;
        game.monkeys.types.forEach(() => {
            y += 110;
            this.buttons.push({
                x: game.settings.resolution.x,
                y: y,
                w: game.settings.resolution.x / gSize - game.settings.resolution.x,
                h: 100,
            });
        });
        game.map.setMap();
        game.player.score = 0;
    }

    changeBtnState() {
        var btn = this.buttons[this.buttonSelected];
        if (btn.active) btn.active = false;
        else btn.active = true;
    }

    upgrade(up) {
        var i = game.monkeys.selected;
        if (i === null) return
        var tier = game.monkeys.objects[i].upgrades[up];
        var price = game.monkeys.objects[i].upgradePrices[up][tier];
        if (game.money >= price) {
            game.monkeys.upgrade(up);
            game.money -= price;
        }
    }

    updateGameButtons() {
        if (game.state === MENU) return;
        if (game.state === PLAYING) this.buttons[5].active = false;
        else /*                  */ this.buttons[5].active = true;
        if (game.isFast) this.buttons[6].active = true;
        else /*       */ this.buttons[6].active = false;
    }

    drawMonkeySelect() {
        ctx.fillStyle = "black";
        ctx.fillRect(offsetX + game.width, offsetY, game.width / gSize - game.width, game.height / gSize);
        var x = offsetX + game.width;
        var y = offsetY + 180 / p;
        var w = menus.bg.w / p * 1.6;
        var h = menus.bg.h / p * 1.6;
        for (var i = 0; i < 2; i++) { ctx.drawImage(menus.bg.img, x, y + h * i * .94, w, h); }
        var scl = 130 / p;
        var off = 9 / p;
        x = offsetX + game.width + off;
        y = offsetY + off;
        // * 3 BUTTONS
        for (var i = 0; i < 3; i++) {
            ctx.drawImage(menus.button.img, x, y, scl, scl);
            var active = 0;
            if (game.state === PLAYING && this.buttons[4 + i].active) active = 1;
            w = icons.menu.w; var x2 = x + scl / 2;
            h = icons.menu.h; var y2 = y + scl / 2;
            var scl2 = scl * .7;
            ctx.drawImage(icons.menu.img, w * i, h * active, w, h, x2 - scl2 / 2, y2 - scl2 / 2, scl2, scl2);
            if (i + 4 === this.buttonSelected) {
                ctx.fillStyle = ca(200, 0.05);
                ctx.fillRect(x, y, scl, scl);
            }
            x += scl + off;
        }
        // * SEPARATOR
        y += scl;
        var w = game.width / gSize - game.width;
        x -= w - 1 / p;
        var h = w / menus.separator_big.w * menus.separator_big.h;
        ctx.drawImage(menus.separator_big.img, x, y, w + 20 / p, h);
        ctx.drawImage(menus.separator_big.img, x, y + 580 / p, w + 20 / p, h);
        ctx.drawImage(menus.separator_big.img, x, y + 770 / p, w + 20 / p, h);
        x += 370 / p;
        for (var i = 0; i < game.monkeys.types.length; i++) {
            y += 110 / p;
            game.monkeys.monkeyButton(game.monkeys.types[i], x, y, (i + 8 === this.buttonSelected));
        }
        ctx.fillStyle = "black";
        ctx.fillRect(x - 373 / p, offsetY, 10 / p, game.height / gSize);
        ctx.fillStyle = "white";
        var font = 80 / p;
        ctx.font = font + "px Arial";
        ctx.fillText("Kolo : " + (game.bloons.round + 1 + game.ramping * 5), relativeX(1325), relativeY(865));
    }

    drawUpgrade() {
        var selected = game.monkeys.selected;
        ctx.fillStyle = "black";
        var segmentHeight = game.height / gSize * (1 - gSize);
        ctx.fillRect(offsetX, game.height + offsetY, game.width, segmentHeight);
        var ratio = segmentHeight / menus.bg.h;
        var bgW = ratio * menus.bg.w;
        for (var i = 0; i < 3; i++) {
            ctx.drawImage(menus.bg.img, offsetX + bgW * .8 * i, game.height + offsetY, bgW, ratio * menus.bg.h);
        }
        if (selected !== null) {
            var monkey = game.monkeys.objects[selected];
            var upgrades = monkey.upgrades;
            var pathsChosen = 0;
            var path = null;
            for (var i = 0; i < 4; i++) { if (upgrades[i] > 0) { pathsChosen++; if (upgrades[i] > 2) path = i; } }
        }
        for (var i = 0; i < 4; i++) {
            var upgrade = menus.upgrade_segment;
            var x = offsetX + game.width + i * upgrade.w / p - upgrade.w / p * 4 - 2 / p;
            var price = menus.price_segment;
            var y = offsetY + game.height + 3 / p;
            // * UPGRADE BACKGROUND
            ctx.drawImage(menus.upgrade_segment.img, x, y, upgrade.w / p, upgrade.h / p);
            ctx.drawImage(menus.price_segment.img, x, y + upgrade.h / p, price.w / p, price.h / p);
            if (selected !== null) {
                var centerX = x + upgrade.w / p / 2;
                var centerY = y + upgrade.h / p / 2;
                if (upgrades[i] < 4 && (pathsChosen < 2 || (pathsChosen == 2 && upgrades[i] > 0 && (path === null || ((path !== i && upgrades[i] < 2) || path === i))))) {
                    ctx.drawImage(monkeys[game.monkeys.objects[game.monkeys.selected].type].upgrade_img,
                        upgrades[i] * upImg.w, i * upImg.h, upImg.w, upImg.h,
                        centerX - upgradeIco.w / 2 / p,
                        centerY - upgradeIco.h / 2 / p,
                        upgradeIco.w / p,
                        upgradeIco.h / p
                    );
                    // * PRICE HIGHLIGHT
                    var tier = game.monkeys.objects[selected].upgrades[i];
                    var cost = game.monkeys.objects[selected].upgradePrices[i][tier];
                    /*                   */ ctx.fillStyle = rgba(255, 0, 0, 0.3);
                    if (game.money >= cost) ctx.fillStyle = rgba(0, 255, 0, 0.1);
                    ctx.fillRect(x, y + upgrade.h / p, price.w / p, price.h / p);
                    var cx = x + 25 / p;
                    var cy = y + upgrade.h / p - 25 / p;
                    var cr = 20 / p;
                    ctx.fillStyle = "white";
                    var fontSize = 35;
                    ctx.font = (fontSize / p) + "px Arial";
                    ctx.fillText(cost + "$", cx - fontSize / p / 3 + 2 / p, cy + fontSize / p + 120 / p / 3);
                    // * HOVER OVER HIGHLIGHT
                    if (this.buttonSelected == i) {
                        ctx.fillStyle = ca(200, 0.05);
                        ctx.fillRect(x, y, upgrade.w / p, upgrade.h / p + price.h / p);
                    }
                    this.drawHintText(cx, cy, i);
                    this.drawHint(cx, cy, cr);
                } else {
                    var paths = monkey.paths;
                    if ((paths[0].val == 4 && paths[0].i == i) || (paths[0].val == 2 && paths[0].i == i && paths[1].val > 2) ||
                        (paths[1].val == 4 && paths[1].i == i) || (paths[1].val == 2 && paths[1].i == i && paths[0].val > 2))
                        this.drawFullyUpgraded(x, y);
                    else this.drawLocked(centerX, centerY);
                }
            }
        }
        ratio = segmentHeight / menus.separator_big.w;
        var w = ratio * menus.separator_big.w;
        var h = ratio * menus.separator_big.h;
        var sepY = game.height + h * 4.3;
        ctx.save();
        ctx.translate(offsetX + game.width / 3 - 25 / p, sepY + offsetY);
        ctx.rotate(Math.PI / 2);
        ctx.drawImage(menus.separator_big.img, -w / 2, -h / 2, w, h);
        ctx.restore();
        ctx.save();
        ctx.translate(offsetX + h / 2, game.height + h * 4.3 + offsetY);
        ctx.rotate(Math.PI / 2);
        ctx.drawImage(menus.separator_big.img, -w / 2, -h / 2, w, h);
        ctx.restore();
        ctx.fillStyle = "black";
        h = 10 / p;
        ctx.fillRect(offsetX, offsetY + game.height - h / 2, game.width, h);
        // * SELL BUTTON
        if (game.monkeys.selected !== null) {
            x = offsetX + 68 / p;
            y = offsetY + game.height + 145 / p;
            w = menus.price_segment.w * 1.3 / p;
            h = menus.price_segment.h / p;
            ctx.drawImage(menus.price_segment.img, x, y, w, h);
            ctx.fillStyle = "white";
            var font = 30 / p;
            ctx.font = font + "px Arial";
            var monkeyPrice = Math.round(game.monkeys.objects[game.monkeys.selected].price * 0.8);
            ctx.fillText(`Prodat za: ${monkeyPrice}$`, x + 30 / p, y + font * 1.55);
            ctx.font = (font * 2) + "px Arial";
            var txt = game.monkeys.objects[game.monkeys.selected].type;
            ctx.fillText(txt, x, y - 50 / p);
            if (this.buttonSelected === 7) {
                ctx.fillStyle = ca(200, 0.05);
                ctx.fillRect(x, y, w, h);
            }
        }
    }

    drawHint(x, y, r) {
        ctx.fillStyle = "#7b2a00ff";
        fillCircle(x, y, r);
        ctx.lineWidth = 4 / p;
        ctx.strokeStyle = "black";
        strokeCircle(x, y, r);
        ctx.fillStyle = "black";
        var fontSize = 35;
        ctx.font = (fontSize / p) + "px Arial";
        ctx.fillText("?", x - fontSize / p / 3 + 2 / p, y + fontSize / p / 3);
    }

    drawHintText(x, y, i) {
        if (this.hoverSelected !== i) return;
        ctx.fillStyle = "#7b2a00ff";
        ctx.strokeStyle = "black";
        var fontSize = 25;
        var scl = 25;
        var hw = (menus.upgrade_segment.w - scl) / p;
        var hx = x - scl / 2 / p;
        var hh = (menus.upgrade_segment.h - scl) / p;
        var hy = y - hh + scl / 2 / p;
        ctx.fillRect(hx, hy, hw, hh);
        ctx.strokeRect(hx, hy, hw, hh);
        ctx.fillStyle = "black";
        var selected = game.monkeys.selected;
        var text = upgradeText[game.monkeys.objects[selected].type][i][game.monkeys.objects[selected].upgrades[i]];
        ctx.font = (fontSize / p) + "px Arial";
        for (var j = 0; j < text.length; j++) {
            var txt = text[j];
            ctx.fillText(txt, hx + 8 / p, hy + fontSize / p * (j + 1) + 3 / p);
        }
    }

    drawLocked(x, y) {
        ctx.drawImage(menus.locked_path.img, x - menus.locked_path.w / 2 / p, y - menus.locked_path.h / 2 / p, menus.locked_path.w / p, menus.locked_path.h / p);
        ctx.fillStyle = ca(0, 0.3);
        x -= menus.upgrade_segment.w / 2 / p;
        y -= menus.upgrade_segment.h / 2 / p;
        ctx.fillRect(x, y, menus.upgrade_segment.w / p, menus.upgrade_segment.h / p);
        ctx.fillStyle = "white"; var fontSize = 25 / p;
        ctx.font = "bold " + fontSize + "px Arial";
        y += menus.upgrade_segment.h / p;
        ctx.fillText("Zamčeno", x + 20 / p, y + fontSize + 21 / p);
        x += menus.upgrade_segment.w / p - 40 / p;
        y += 45 / 3 / p;
        ctx.drawImage(icons.lock.img, x, y, 30 / p, 45 / p);
    }

    drawFullyUpgraded(x, y) {
        ctx.fillStyle = ca(0, 0.3);
        ctx.fillRect(x, y, menus.upgrade_segment.w / p, menus.upgrade_segment.h / p);
        ctx.fillStyle = "white"; var fontSize = 25 / p;
        ctx.font = "bold " + fontSize + "px Arial";
        ctx.fillText("Max", x + 15 / p, y + menus.upgrade_segment.h / p + fontSize + 21 / p);
    }

    showStats() {
        // MONEY
        var txt = game.money + "";
        var offX = 0;
        var x = relativeX(moneyPos.x); var y = relativeY(moneyPos.y);
        ctx.drawImage(fonts["money"].img, h2.w * 10, 0, h2.w, h2.h, x, y, h2.w / p, h2.h / p);
        for (var i = 0; i < txt.length; i++) {  // first to last
            offX += h2.w * 0.8;
            ctx.drawImage(fonts["money"].img, h2.w * Number(txt[i]), 0, h2.w, h2.h, x + offX / p, y, h2.w / p, h2.h / p);
        }
        // LIVES
        if (game.lives < 0) game.lives = 0;
        txt = game.lives + "";
        offX = 0;
        x = relativeX(lifePos.x); y = relativeY(lifePos.y);
        ctx.drawImage(fonts["lives"].img, h2.w * 10, 0, h2.w, h2.h, x, y, h2.w / p, h2.h / p);
        for (var i = txt.length; i > 0; i--) {  // last to first
            offX += h2.w * 0.8;
            ctx.drawImage(fonts["lives"].img, h2.w * Number(txt[i - 1]), 0, h2.w, h2.h, x - offX / p, y, h2.w / p, h2.h / p);
        }
    }

    showFPS() {
        ctx.font = "30px Arial";
        ctx.fillStyle = "black";
        ctx.fillRect(8, 8, ctx.measureText(fps).width + 4, 44);
        ctx.fillStyle = "white";
        ctx.fillText(fps, 10, 40);
    }
}

const fonts = {
    money: {},
    lives: {},
    title: {},
};
const menus = {
    upgrade_segment: { w: upMenuSize[0].w, h: upMenuSize[0].h },
    price_segment: { w: upMenuSize[1].w, h: upMenuSize[1].h },
    locked_path: { w: upgradeIco.w, h: upgradeIco.h },
    button: {},
    separator_big: { w: 345, h: 40 },
    bg: { w: 275, h: 355 },
}
const icons = {
    lock: {},
    menu: { w: 140, h: 140 },
    round: {},
    crown: { w: 70, h: 40 },
    leaf: { w: 125, h: 195 },
    arrow: {},
}
const monkeys = {
    ninja: {},
    dartling: {},
}
const upgradeText = {
    dartling: [[
        ["Dělá o", "trochu větší", "poškození"],
        ["Střílí rychleji"],
        ["Dělá to samé", "ale více"],
        ["Dělá to samé", "ale mnohem", "více"]
    ], [
        ["Přidá na", "střely jed"],
        ["Jed dělá", "větší poškození"],
        ["Jed dělá", "mnohem větší", "poškození"],
        ["Vrchol opičí", "alchymie"],
    ], [
        ["Změní šipky", "na kulky"],
        ["Dělá kulky", "silnější"],
        ["Střílí raktey"],
        ["Střílí tři", "rakety místo", "jedné"]
    ], [
        ["Míří na", "nastavitelný", "bod"],
        ["Střílí lasery"],
        ["Lasery střílí", "rychleji a", "prochází skrz", "více balónků"],
        ["Zničí téměř", "nekonečné", "množství", "balónků"]
    ]],
    ninja: [[
        ["Šuriken projde", "skrz více", "balónků a dělá", "větší poškození"],
        ["Šurikeny zničí", "více vrstev"],
        ["Zlepší šurikeny", "o 100%"],
        ["Dokáže sestřelit", "keramický", "balónek na", "dvě rány"]
    ], [
        ["Šurikeny", "projdou dvěmi", "balónky"],
        ["Ninja hází", "šurikeny rychleji"],
        ["Ninja hází", "hází dva", "šurikeny místo", "jednoho"],
        ["Ninja hází", "čtyři šurikeny", "najednou"]
    ], [
        ["Dokáže zmást", "balónky na", "krátkou dobu"],
        ["Dokáže zmást", "silnější balónky"],
        ["Zmate i", "vzducholodě"],
        ["Zmate všechny", "druhy balónků"]
    ], [
        ["Hází bomby", "místo šurikenů"],
        ["Hází bomby", "mnohem rychleji"],
        ["Bomby jsou", "silnější"],
        ["Bomby jsou", "mnohem silnější"]
    ]]
}