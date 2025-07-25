const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
canvas.width = innerWidth;
canvas.height = innerHeight;
document.body.appendChild(canvas);

// const nameInput = document.createElement('input');
// nameInput.setAttribute('maxlength', 20);
// document.body.appendChild(nameInput);

const hcanvas = document.createElement('canvas');
const hctx = hcanvas.getContext('2d');

const PLAYING = 0;
const PAUSED = 1;
const MENU = 2;

const MAIN = 0;
const MAP = 1;
const INSTRUCTIONS = 2;
const SCORE = 3;
const SUBMIT = 4;

const resX = 1280;
const resY = 720;
hcanvas.width = resX;
hcanvas.height = resY;

let imageCounter = 0;                       // number of created images
let loadedImgCounter = 0;                   // number of loaded images
let loadingImages = true;

let fps = 0;

let width = innerWidth;
let height = innerHeight;

let dt = 1;                                 // deltatime
let tp = 0;                                 // time passed
let timestamp = new Date().valueOf();
let prev = timestamp;

let clientX = 0;
let clientY = 0;
let offsetX = 0;
let offsetY = 0;

let p = 1;                                  // screen - static setting proportion
let iMonkey = 0;
let iBloon = 0;
let iProjectile = 0;

const gSize = 0.75;
const layers = 4;                           // QuadTree layers

const baseLives = 200;
const baseMoney = 1000;

let scores = null;
let myLeaderboardPos = null;

// * QOL
// dmg types
const EXPLOSIVE = "explosive";
const ICE = "ice";
const BASE = "base";
// monkey types
const DARTLING = "dartling";
const NINJA = "ninja";
// bloon types
const RED = "red";
const BLUE = "blue";
const GREEN = "green";
const YELLOW = "yellow";
const PINK = "pink";
const WHITE = "white";
const BLACK = "black";
const ZEBRA = "zebra";
const RAINBOW = "rainbow";
const LEAD = "lead";
const CERAMIC = "ceramic";
const MOAB = "moab";
const DDT = "ddt";
const BFB = "bfb";
const ZOMG = "zomg";
// proj types
const BEAM = "beam";
const DART = "dart";
const ROCKET = "rocket";
const BOMB = "bomb";
const SHURIKEN = "shuriken";
const BULLET = "bullet";
// targets
const CUR = "cur";
const POINT = "point";
const BLOONS = "bloons";

// GET VALUE RELATIVE TO GAME SCREEN
function relativeClientX() { return ((clientX - offsetX) * p); }
function relativeClientY() { return ((clientY - offsetY) * p); }
function relativeX(x) { return (x / p + offsetX); }
function relativeY(y) { return (y / p + offsetY); }

// GET INDEX FROM ARRAY
function getIndexOfObject(arr, attr, value) {
    for (var i = 0; i < arr.length; i++) { if (arr[i][attr] == value) return i; }
    return null;
}
function getIndex(arr, value) {
    for (var i = 0; i < arr.length; i++) { if (arr[i] == value) return i; }
    return null;
}
// LOAD ALL IMAGES
function imgLoaded() {
    loadedImgCounter++;
    if (imageCounter === loadedImgCounter) loadingImages = false;
}

function createImages(data, attr, paths) {
    Object.entries(data).forEach((o) => {
        imageCounter++;
        o[1][attr] = new Image();
        o[1][attr].src = `./game/sprites/${paths.start}/${o[0]}${paths.end}`;
        o[1][attr].addEventListener("load", imgLoaded);
    });
}

function rgb(r, g, b) {/* */return `rgb(${r},${g},${b})`; }
function rgba(r, g, b, a) { return `rgba(${r},${g},${b},${a})`; }
function c(c) {/*         */return `rgb(${c},${c},${c})`; }
function ca(c, a) {/*     */return `rgb(${c},${c},${c},${a})`; }

function fillCircle(x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
function strokeCircle(x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke(); }

function squareCollision(r1, r2) {
    if (rectCollision({
        x: r1.x - r1.hb / 2, w: r1.hb,
        y: r1.y - r1.hb / 2, h: r1.hb
    }, {
        x: r2.x - r2.hb / 2, w: r2.hb,
        y: r2.y - r2.hb / 2, h: r2.hb
    })) return true;
    return false;
}

function squareCircCollision(r, c) {
    if (rectCircCollision({
        x: r.x - r.hb / 2, w: r.hb,
        y: r.y - r.hb / 2, h: r.hb
    }, c)) return true;
    return false;
}

function rectCollision(r1, r2) {
    if (r1.x + r1.w > r2.x && r1.x < r2.x + r2.h &&
        r1.y + r1.h > r2.y && r1.y < r2.y + r2.h) return true;
    return false;
}

function rectCircCollision(r, c) {
    var x = c.x;
    var y = c.y;
    /* */if (c.x < r.x) /* */ x = r.x;
    else if (c.x > r.x + r.w) x = r.x + r.w;
    /* */if (c.y < r.y) /* */ y = r.y;
    else if (c.y > r.y + r.h) y = r.y + r.h;
    var dx = c.x - x;
    var dy = c.y - y;
    var d = Math.sqrt((dx * dx) + (dy * dy));
    if (d <= c.r) return true;
    return false;
}