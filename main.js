let gameTimer;
let COLS = 16;
let ROWS = 16;
let BOMB_COUNT = 40;

const mc = document.querySelector('.gameContainer');
let bombField;
const bombDisplay = document.getElementById("bombs");
const timeDisplay = document.getElementById("timer");
let isEndGame = false;

startNewGame(9, 9, 10);

function startNewGame(cols, rows, bombs) {
    COLS = cols;
    ROWS = rows;
    BOMB_COUNT = bombs;

    document.documentElement.style.setProperty('--cols-count', COLS);
    document.documentElement.style.setProperty('--rows-count', ROWS);

    showBombCount();
    timeDisplay.innerHTML = "000";

    stopTimer();

    initBombs();
    createField();

    isEndGame = false;
}

function initBombs() {
    let bc = 0;

    bombField = Array(ROWS * COLS).fill(0);

    // bombField.fill(0);
    while (bc < BOMB_COUNT) {
        const bombIndex = getRandomIntInclusive(0, (ROWS * COLS) - 1);

        if (bombField[bombIndex] >= 0) {
            bombField[bombIndex] = -1;
            bc++;

            const neighbours = getNeighbourIndexes(bombIndex);

            for (let n = 0; n < neighbours.length; n++) {
                if (bombField[neighbours[n]] !== -1)
                    bombField[neighbours[n]]++;
            }
        }
    }
}

function createField() {
    removeAllChildNodes(mc);

    for (let i = 0; i < ROWS; i++) {
        for (let j = 0; j < COLS; j++) {
            const index = coordToIndex(j, i);
            const cell = createCell(bombField[index]);
            cell.className = "cell";
            cell.dataset.index = index;
            cell.addEventListener("click", function () { cellClick(this) });
            cell.addEventListener('contextmenu', function (ev) {
                ev.preventDefault();
                cellRightClick(this);
                return false;
            }, false);

            mc.appendChild(cell);
        }
    }
}

function showBombCount() {
    const bc = BOMB_COUNT - mc.querySelectorAll(".bomb").length;

    bombDisplay.innerHTML = bc.toString().padStart(3, "0");
}

let timeCounter = 0;
function showClock() {
    timeCounter++;
    timeDisplay.innerHTML = timeCounter.toString().padStart(3, '0');
}

function startTimer() {
    if (gameTimer != null)
        return;

    timeCounter = 0;
    gameTimer = setInterval(showClock, 1000);
}

function stopTimer() {
    if (gameTimer == null)
        return;

    clearInterval(gameTimer);
    gameTimer = null;
    timeCounter = 0;
}

function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

function getNeighbourIndexes(index) {
    const result = [];

    const coord = indexToCoord(index);
    const x = coord.x;
    const y = coord.y;

    // console.log(x, y);

    if (x > 0) // left
        result.push(coordToIndex(x - 1, y));
    if (x < (COLS - 1)) // right
        result.push(coordToIndex(x + 1, y));

    if (y > 0)  // top
        result.push(coordToIndex(x, y - 1));
    if (y < (ROWS - 1))  // bottom
        result.push(coordToIndex(x, y + 1));

    if (x > 0 && y > 0)  // left-top
        result.push(coordToIndex(x - 1, y - 1));

    if (x > 0 && y < (ROWS - 1))  // left-bottom
        result.push(coordToIndex(x - 1, y + 1));

    if (x < (COLS - 1) && y > 0)  // right-top
        result.push(coordToIndex(x + 1, y - 1));

    if (x < (COLS - 1) && y < (ROWS - 1))  // right-bottom
        result.push(coordToIndex(x + 1, y + 1));

    return result;
}

function indexToCoord(index) {
    const row = Math.floor(index / COLS);
    return { "x": index - (row * COLS), "y": row };
}

function coordToIndex(x, y) {
    return y * COLS + x;
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
}

function cellClick(cell) {
    if (isEndGame === true)
        return;

    startTimer();

    if (cell.classList.contains("bomb"))
        return;

    const index = cell.dataset.index;

    if (bombField[index] === -1) {
        showEndGame(false);
        return;
    }

    if (cell.classList.contains("clicked"))
        return;

    cell.classList.add("clicked");
    uncoverCells(index);
    showBombCount();

    checkEndGame();
}

function cellRightClick(cell) {
    if (isEndGame === true)
        return;

    startTimer();

    const index = cell.dataset.index;

    if (cell.classList.contains("clicked"))
        return;

    cell.classList.toggle("bomb");
    //cell.classList.toggle("fa-light fa-bomb");


    showBombCount();
}

function checkEndGame() {

    isEnd = true;
    for (let i = 0; i < COLS * ROWS; i++) {
        const cell = document.querySelector('[data-index="' + i + '"]');

        if (bombField[i] >= 0 && !cell.classList.contains("clicked")) {
            isEnd = false;
            break;
        }
    }

    if (isEnd) {
        showEndGame(true);
    }
}

function showEndGame(isWin) {
    isEndGame = true;
    stopTimer();

    mc.querySelectorAll("div").forEach(child => {
        child.classList.add("clicked");
    });

    const text = isWin ? "CONGRATULATIONS, YOU WIN !" : "YOU LOST ! :-(";
    openModal(text, isWin);
    // alert(text);
}

function uncoverCells(fromIndex) {
    if (bombField[fromIndex] !== 0)
        return;

    let emptyCellIndexes = [];

    emptyCellIndexes.push(parseInt(fromIndex));

    let kk = 0;
    while (emptyCellIndexes.length > 0 && kk < 1000) {
        const neighbours = getNeighbourIndexes(emptyCellIndexes[0]);
        bombField[emptyCellIndexes[0]] = -2;

        for (let n = 0; n < neighbours.length; n++) {
            if (bombField[neighbours[n]] === 0) {
                const cell = document.querySelector('[data-index="' + neighbours[n] + '"]');
                cell.classList.add("clicked");
                cell.classList.remove("bomb");
                emptyCellIndexes.push(neighbours[n]);
                bombField[neighbours[n]] = -2;
            }
            else {
                const cell = document.querySelector('[data-index="' + neighbours[n] + '"]');
                cell.classList.add("clicked");
                cell.classList.remove("bomb");
            }
        }

        const currentI = emptyCellIndexes[0];
        emptyCellIndexes = emptyCellIndexes.filter(item => item !== currentI)
        kk++;
    }
}

function createCell(text) {
    const cell = document.createElement("div");
    const data = document.createElement("p");
    if (text === -1) {
        data.innerHTML = "B";
        // data.innerHTML = '<i class="fa fa-bomb"></i>';
        // data.classList.add("fa");
        // data.classList.add("fa-bomb");
    }
    else if (text > 0) {
        data.innerHTML = text;
        data.classList.add("color" + text);
    }
    cell.appendChild(data);

    return cell;
}

function openModal(text, win) {

    document.getElementById("open-modal").classList.add("modal-window-open");
    document.getElementById("win-lost").classList.add(win === true ? "modal-win" : "modal-lost");
    document.getElementById("modal-text").innerHTML = text;
}

function closeModal() {

    document.getElementById("open-modal").classList.remove("modal-window-open");
    document.getElementById("win-lost").classList.remove("modal-win");
    document.getElementById("win-lost").classList.remove("modal-lost");

}