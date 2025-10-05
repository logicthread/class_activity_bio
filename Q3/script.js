const imageLoader = document.getElementById('image-loader');
const difficultySelector = document.getElementById('difficulty');
const startButton = document.getElementById('start-button');
const piecesContainer = document.getElementById('pieces-container');
const puzzleCanvas = document.getElementById('puzzle-canvas');
const ctx = puzzleCanvas.getContext('2d');

let image;
let pieces = [];
let puzzleWidth, puzzleHeight, pieceWidth, pieceHeight;
let rows, cols;
let draggedPiece = null;

imageLoader.addEventListener('change', (e) => {
    const reader = new FileReader();
    reader.onload = () => {
        image = new Image();
        image.onload = () => {
            // Display preview on canvas
            puzzleWidth = image.width;
            puzzleHeight = image.height;
            puzzleCanvas.width = puzzleWidth;
            puzzleCanvas.height = puzzleHeight;
            ctx.drawImage(image, 0, 0, puzzleWidth, puzzleHeight);
        };
        image.src = reader.result;
    };
    reader.readAsDataURL(e.target.files[0]);
});

startButton.addEventListener('click', startGame);

function startGame() {
    if (!image) {
        // Replaced alert with a more subtle feedback
        startButton.textContent = 'Upload an Image First!';
        setTimeout(() => {
            startButton.textContent = 'Start Game';
        }, 2000);
        return;
    }

    const pieceCount = parseInt(difficultySelector.value);
    calculatePuzzleDimensions(pieceCount);

    pieceWidth = Math.floor(image.width / cols);
    pieceHeight = Math.floor(image.height / rows);
    puzzleWidth = pieceWidth * cols;
    puzzleHeight = pieceHeight * rows;


    puzzleCanvas.width = puzzleWidth;
    puzzleCanvas.height = puzzleHeight;
    ctx.clearRect(0, 0, puzzleWidth, puzzleHeight);
    drawGrid();


    createPieces();
    shuffleAndDisplayPieces();
}

function drawGrid() {
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    for (let i = 0; i <= cols; i++) {
        ctx.beginPath();
        ctx.moveTo(i * pieceWidth, 0);
        ctx.lineTo(i * pieceWidth, puzzleHeight);
        ctx.stroke();
    }
    for (let i = 0; i <= rows; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * pieceHeight);
        ctx.lineTo(puzzleWidth, i * pieceHeight);
        ctx.stroke();
    }
}


function calculatePuzzleDimensions(pieceCount) {
    const aspectRatio = image.width / image.height;
    let bestRows = 1;
    let bestCols = pieceCount;
    let minRatioDiff = Math.abs(aspectRatio - (bestCols / bestRows));

    for (let i = 2; i <= Math.sqrt(pieceCount); i++) {
        if (pieceCount % i === 0) {
            const j = pieceCount / i;
            const ratio1 = j / i;
            const ratio2 = i / j;
            const diff1 = Math.abs(aspectRatio - ratio1);
            const diff2 = Math.abs(aspectRatio - ratio2);

            if (diff1 < minRatioDiff) {
                minRatioDiff = diff1;
                bestRows = i;
                bestCols = j;
            }
            if (diff2 < minRatioDiff) {
                minRatioDiff = diff2;
                bestRows = j;
                bestCols = i;
            }
        }
    }
    rows = bestRows;
    cols = bestCols;
}


function createPieces() {
    pieces = [];
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const piece = document.createElement('canvas');
            piece.width = pieceWidth;
            piece.height = pieceHeight;
            const pieceCtx = piece.getContext('2d');
            pieceCtx.drawImage(
                image,
                x * pieceWidth, y * pieceHeight, pieceWidth, pieceHeight,
                0, 0, pieceWidth, pieceHeight
            );
            piece.dataset.correctX = x;
            piece.dataset.correctY = y;
            pieces.push({
                element: piece,
                correctX: x,
                correctY: y,
                placed: false
            });
        }
    }
}

function shuffleAndDisplayPieces() {
    piecesContainer.innerHTML = '';

    // Filter out already placed pieces and shuffle
    let unplacedPieces = pieces.filter(p => !p.placed);
    for (let i = unplacedPieces.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [unplacedPieces[i], unplacedPieces[j]] = [unplacedPieces[j], unplacedPieces[i]];
    }

    // Use fractional units so columns evenly distribute and match the puzzle grid
    piecesContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    piecesContainer.style.width = `${puzzleWidth}px`;
    piecesContainer.style.height = `${puzzleHeight}px`;


    unplacedPieces.forEach((pieceData) => {
        const pieceElement = pieceData.element;
        pieceElement.classList.add('puzzle-piece');
        pieceElement.draggable = true;
        pieceElement.addEventListener('dragstart', handleDragStart);
        pieceElement.addEventListener('dragend', handleDragEnd);
        piecesContainer.appendChild(pieceElement);
    });
}

function handleDragStart(e) {
    draggedPiece = pieces.find(p => p.element === e.target);
    setTimeout(() => {
        e.target.style.opacity = '0.5';
    }, 0);
}

function handleDragEnd(e) {
    setTimeout(() => {
        e.target.style.opacity = '1';
        draggedPiece = null;
    }, 0);
}


puzzleCanvas.addEventListener('dragover', (e) => {
    e.preventDefault();
});

puzzleCanvas.addEventListener('drop', handleDrop);


function handleDrop(e) {
    e.preventDefault();
    if (!draggedPiece) return;

    const rect = puzzleCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const dropX = Math.floor(x / pieceWidth);
    const dropY = Math.floor(y / pieceHeight);

    if (draggedPiece.correctX === dropX && draggedPiece.correctY === dropY) {
        ctx.drawImage(draggedPiece.element, dropX * pieceWidth, dropY * pieceHeight);
        draggedPiece.placed = true;
        draggedPiece.element.style.display = 'none';
        checkWin();
    } else {

    }
}

function checkWin() {
    const allPlaced = pieces.every(p => p.placed);
    if (allPlaced) {
        // A nicer win message
        const winMessage = document.createElement('h2');
        winMessage.textContent = 'Congratulations! You solved the puzzle!';
        winMessage.style.color = 'green';
        document.querySelector('.controls').appendChild(winMessage);
    }
}
