import { game } from "../index.js";

export default class InputHandler {
    constructor() {
        // nameInput.addEventListener("change", () => { this.submitScore(); });
        addEventListener("contextmenu", (e) => {
            e.preventDefault();
            game.monkeys.placing = null;
        })
        addEventListener("resize", (e) => { this.resize(); });
        addEventListener("mousemove", (e) => {
            clientX = e.clientX; clientY = e.clientY;
            game.menu.buttonSelected = null;
            game.menu.hoverSelected = null;
            switch (game.state) {
                case PLAYING:
                    if (game.monkeys.placingPoint) game.monkeys.setPoint();
                    game.monkeys.canPlace.land = false;
                    game.monkeys.canPlace.water = false;
                    switch (true) {
                        case this.mouseOnGame():
                            if (game.monkeys.placing === null) {
                                game.qtree.checkCur();
                                return;
                            }
                            game.monkeys.checkPlacement();
                            break;
                        case this.mouseOnUpgrades():
                            for (var i = 0; i < 4; i++) {
                                if (this.buttonHover(i)) {
                                    game.menu.buttonSelected = i;
                                    break;
                                }
                            }
                            if (this.buttonHover(7)) game.menu.buttonSelected = 7;
                            for (var i = 0; i < game.menu.hovers.length; i++) {
                                if (this.hoverHover(i)) {
                                    game.menu.hoverSelected = i;
                                    break;
                                }
                            }
                            break;
                        case this.mouseOnTowerSelection():
                            for (var i = 3; i < game.menu.buttons.length; i++) {
                                if (this.buttonHover(i)) {
                                    game.menu.buttonSelected = i;
                                    break;
                                }
                            }
                            break;
                    }
                    break;
                case MENU:
                    for (var i = 0; i < game.menu.buttons.length; i++) {
                        if (this.buttonHover(i)) {
                            game.menu.buttonSelected = i;
                            return;
                        }
                    }
                    break;
            }
        });

        addEventListener("mousedown", (e) => {
            if (e.buttons !== 1) return;
            switch (game.state) {
                case PLAYING:
                    switch (true) {
                        case this.mouseOnGame():
                            if (game.monkeys.placing !== null) {
                                game.monkeys.place();
                                return;
                            }
                            game.monkeys.selected = game.monkeys.hoveringOver;
                            if (game.monkeys.placingPoint) {
                                game.monkeys.placingPoint = false;
                                return;
                            }
                            if (game.monkeys.selected !== null) {
                                if (game.monkeys.objects[game.monkeys.selected].target === "point") {
                                    game.monkeys.placingPoint = true;
                                }
                            }
                            break;
                        case this.mouseOnUpgrades():
                            if (game.menu.buttonSelected !== null && game.menu.hoverSelected === null) {
                                if (game.menu.buttonSelected === 7) {
                                    game.monkeys.sell();
                                    return;
                                }
                                if (game.menu.buttonSelected < 4) {
                                    game.menu.upgrade(game.menu.buttonSelected);
                                    return;
                                }
                            }
                            break;
                        case this.mouseOnTowerSelection():
                            if (game.menu.buttonSelected !== null) {
                                switch (game.menu.buttonSelected) {
                                    case 4:
                                        game.reset();
                                        game.menu.changeState(MENU, MAIN);
                                        break;
                                    case 5: game.state = PAUSED; break;
                                    case 6: game.changeSpeed(); break;
                                    default:
                                        if (game.menu.buttonSelected > 7) {
                                            game.monkeys.select(game.monkeys.types[game.menu.buttonSelected - 8]);
                                            return;
                                        }
                                        break;
                                }
                            }
                            break;
                        case true:
                            game.monkeys.selected = null;
                            game.monkeys.placingPoint = false;
                            break;
                    }
                    break;
                case PAUSED: game.state = PLAYING; break;
                case MENU:
                    switch (game.menuState) {
                        case MAIN:
                            switch (game.menu.buttonSelected) {
                                case null: break;
                                case 0: game.menu.changeState(MENU, MAP); break;
                                case 1: game.menu.changeState(MENU, INSTRUCTIONS); break;
                                case 2: game.menu.changeState(MENU, SCORE); break;
                            }
                            break;
                        case MAP:
                            if (game.menu.buttonSelected !== null) {
                                if (game.menu.buttonSelected === 0) {
                                    game.menu.changeState(MENU, MAIN);
                                    return;
                                }
                                if (game.menu.buttonSelected < 3) {
                                    var i = (game.menu.buttonSelected - 1) * 2 - 1;
                                    this.changeMap(i);
                                    return;
                                }
                                game.menu.changeState(PLAYING);
                            }
                            break;
                        case INSTRUCTIONS: if (game.menu.buttonSelected !== null) game.menu.changeState(MENU, MAIN); break;
                        case SCORE:
                            if (game.menu.buttonSelected === null) return;
                            if (game.menu.buttonSelected === 0) {
                                game.menu.changeState(MENU, MAIN);
                                return;
                            }
                            var i = (game.menu.buttonSelected - 1) * 2 - 1;
                            this.changeMap(i);
                            game.menu.getScores();
                            break;
                        case SUBMIT:
                            if (game.menu.buttonSelected === null) return;
                            if (game.menu.buttonSelected === 0) {
                                game.reset();
                                game.menu.changeState(MENU, MAIN);
                                return;
                            }
                            break;
                    }
                    break;
            }
        });

        addEventListener(("keydown"), (e) => {
            switch (game.state) {
                case PLAYING:
                    switch (e.key) {
                        case " ": game.changeSpeed(); break;
                        // selecting monkeys
                        case "+": case "1": game.monkeys.select(game.monkeys.types[0]); break;
                        case "ě": case "2": game.monkeys.select(game.monkeys.types[1]); break;
                        case "Backspace": game.monkeys.sell(); break;
                        // stop selection
                        case "Escape":
                            if (game.monkeys.selected !== null || game.monkeys.placing !== null) {
                                game.monkeys.selected = null;/**/ game.monkeys.placing = null;
                                return;
                            }
                            game.state = PAUSED;
                            break;
                        case "k": game.money += 1000; break;
                        case "g": game.lives -= 5; break; //!
                        // upgrading monkeys
                        case "q": case "Q": game.menu.upgrade(0); break;
                        case "w": case "W": game.menu.upgrade(1); break;
                        case "e": case "E": game.menu.upgrade(2); break;
                        case "r": case "R": game.menu.upgrade(3); break;
                    }
                    break;
                // resume
                case PAUSED: if (e.key === ' ' || e.key === 'Escape') game.state = PLAYING; break;
                case MENU:
                    // quit ot main menu
                    if (e.key === "Escape")
                        if (game.menuState === MAP ||
                            game.menuState === INSTRUCTIONS ||
                            game.menuState === SCORE)
                            game.menu.changeState(MENU, MAIN);
                    break;
            }
        });
    }

    resize() {
        var x = game.settings.ratio.x;
        var y = game.settings.ratio.y;
        canvas.width = innerWidth; width = innerWidth;
        canvas.height = innerHeight; height = innerHeight;
        if (width / x < height / y) {                                   // OFFSET HEIGHT
            game.width = innerWidth;
            game.height = width / x * y;
            offsetX = 0;
            offsetY = (height - game.height) / 2;
        } else {                                                        // OFFSET WIDTH
            game.width = height / y * x;
            game.height = innerHeight;
            offsetX = (width - game.width) / 2;
            offsetY = 0;
        }
        game.width *= gSize;
        game.height *= gSize;
        p = game.settings.resolution.x / game.width;                    // size relative to base 

        // var w = 420 / p;
        // var h = 80 / p;
        // nameInput.style.width = w + "px";
        // nameInput.style.height = h + "px";
        // nameInput.style.fontSize = 40 / p + "px";
        // nameInput.style.left = innerWidth / 2 - w / 2 + "px";
        // nameInput.style.top = innerHeight / 2 - h + "px";
    }

    mouseOnGame() {
        if (rectCollision({
            x: offsetX, w: game.width,
            y: offsetY, h: game.height
        }, {
            x: clientX, w: 0,
            y: clientY, h: 0
        })) return true;
        return false;
    }

    mouseOnUpgrades() {
        if (rectCollision({
            x: offsetX, /*         */ w: game.width,
            y: offsetY + game.height, h: game.height / gSize - game.height
        }, {
            x: clientX, w: 0,
            y: clientY, h: 0
        })) return true;
        return false;
    }

    mouseOnTowerSelection() {
        if (rectCollision({
            x: game.width + offsetX, w: game.width / gSize - game.width,
            y: offsetY, /*        */ h: game.height / gSize,
        }, {
            x: clientX, w: 0,
            y: clientY, h: 0
        })) return true;
        return false;
    }

    buttonHover(i) {
        if (this.hover(game.menu.buttons[i])) return true;
        return false;
    }

    hoverHover(i) {
        if (this.hover(game.menu.hovers[i])) return true;
        return false;
    }

    hover(o) {
        if (clientX > relativeX(o.x) && clientX < relativeX(o.x) + o.w / p &&
            clientY > relativeY(o.y) && clientY < relativeY(o.y) + o.h / p) return true;
        return false;
    }

    changeMap(i) {
        game.map.mapIndex += i;
        // go to beginning || end of arr
        if (game.map.mapIndex < 0)                         /**/ game.map.mapIndex = game.map.types.length - 1;
        else if (game.map.mapIndex > game.map.types.length - 1) game.map.mapIndex = 0;
        game.map.setMap(game.map.types[game.map.mapIndex]);
    }

    submitScore() { // TODO
        // if (nameInput.value === "") return;
        // game.scoreSubmitted = true;
        // game.player.name = nameInput.value;
        // game.player.scoreSubmitted = game.player.score;
        // game.player.map = game.map.map;
        // socket.emit('save_score', {
        //     map: game.player.map,
        //     name: game.player.name,
        //     score: game.player.scoreSubmitted
        // });
        game.reset();
    }
}