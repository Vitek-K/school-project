import Game from "./game/game.js";

export let game = new Game();
game.setup();
// export const socket = io();

load();
function load() {
    if (loadingImages) {
        ctx.clearRect(0, 0, innerWidth, innerHeight);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, innerWidth, innerHeight);
        requestAnimationFrame(load);
        return;
    }
    requestAnimationFrame(loop);
}

function gameLoop() {
    loop();
    // if (game.state !== PLAYING) return; //? 
    ctx.clearRect(0, 0, width, height);
    game.update();
    if (game.isFast) game.update();
    game.draw();
    game.drawBorders();
    game.checkDeath();
}

function pauseLoop() {
    loop();
    game.draw();
    ctx.fillStyle = ca(0, 0.6);
    ctx.fillRect(0, 0, innerWidth, innerHeight);
    ctx.fillStyle = "white";
    let font = 50 / p;
    ctx.font = font + "px Arial";
    let txt = "Hra pozastavena";
    let w = ctx.measureText(txt).width;
    ctx.fillText(txt, offsetX + game.width / 2 - w / 2, offsetY + game.height * .45);
    font = 35 / p;
    ctx.font = font + "px Arial";
    txt = "Zmáčkni mezerník, escape, nebo klikni pro pokračování";
    w = ctx.measureText(txt).width;
    ctx.fillText(txt, offsetX + game.width / 2 - w / 2, offsetY + game.height * .55);
    game.drawBorders();
}

function menuLoop() {
    loop();
    switch (game.menuState) {
        case MAIN:     /**/game.menu.drawMainMenu(); break;
        case MAP:      /**/game.menu.drawMapSelection(); break;
        case INSTRUCTIONS: game.menu.drawInstructions(); break;
        case SCORE:    /**/game.menu.drawLeaderboard(); break;
        case SUBMIT:
            game.draw();
            if (game.scoreSaved) {
                game.scoreSaved = false;
                game.menu.changeState(MENU, MAIN);
            }
            game.menu.drawSubmit();
            // game.showBtnHitboxes();
            break;
    }
    // game.showBtnHitboxes();
    game.drawBorders();
}

export function loop() {
    calcTime();
    switch (game.state) {
        case PLAYING: requestAnimationFrame(gameLoop); break;
        case PAUSED: requestAnimationFrame(pauseLoop); break;
        case MENU: requestAnimationFrame(menuLoop); break;
    }
}

function calcTime() {
    timestamp = new Date().valueOf();
    tp = timestamp - prev;                  // time passed
    dt = tp / (1000 / 60);                  // deltatime
    prev = timestamp;
}

// socket.on('send_scores', dat => { scores = dat; });
// socket.on('send_me', dat => { myLeaderboardPos = dat; });
// socket.on('score_saved', () => { game.scoreSaved = true; })

setInterval(() => { fps = Math.round((60 / dt) * 10) / 10; }, 200);