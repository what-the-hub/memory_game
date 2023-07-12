class MatchGrid {
    constructor({ width, height, rows, columns, timeLimit, theme }) {
        this.width = width;
        this.height = height;
        this.rows = rows;
        this.columns = columns;
        this.timeLimit = timeLimit;

        this.grid = [];
        this.flipped = [];
        this.matched = [];

        this.timer = null;
        this.remainingTime = 0;

        this.boundHandleCardClick = this.handleCardClick.bind(this);

        this.init();
    }

    init() {
        this.createGrid();
        this.renderGrid();
        this.addEventListeners();
    }

    createGrid() {
        let availableCardNumbers = this.randomizeNumbers()
        for (let row = 0; row < this.rows; row += 1) {
            let rowData = [];
            for (let col = 0; col < this.columns; col += 1) {
                const id = row * this.columns + col;
                const currentValue = availableCardNumbers.shift()
                const card = {
                    id: id,
                    value: currentValue,
                    flipped: false,
                    matched: false
                };
                rowData.push(card);
            }
            this.grid.push(rowData);
        }
    }

    randomizeNumbers() {
        const halfOfAllCards = (this.rows * this.columns) / 2;
        let cardsNumbers = Array.from({length: halfOfAllCards}, (_, index) => index + 1);
        cardsNumbers.push(...cardsNumbers)

        // shuffle cardsNumbers
        for (let i = cardsNumbers.length - 1; i > 0; i-=1) {
            const j = Math.floor(Math.random() * (i + 1));
            [cardsNumbers[i], cardsNumbers[j]] = [cardsNumbers[j], cardsNumbers[i]];
        }
        console.log(cardsNumbers);
        return cardsNumbers
    }

    renderGrid() {
        const gridElement = document.getElementById('grid');
        gridElement.innerHTML = '';

        for (let row = 0; row < this.rows; row += 1) {
            const tr = document.createElement('tr');
            for (let col = 0; col < this.columns; col += 1) {
                const card = this.grid[row][col];
                const td = document.createElement('td');
                td.id = card.id
                td.dataset.id = card.id;
                td.style.backgroundColor = 'red';
                tr.appendChild(td);
            }
            gridElement.appendChild(tr);
        }
    }


    addEventListeners() {
        const startButton = document.getElementById('start');
        startButton.addEventListener('click', this.startGame.bind(this));

        const gameElement = document.getElementById('game');
        // gameElement.addEventListener('mouseout', this.pauseGame.bind(this));
        // gameElement.addEventListener('mouseover', this.resumeGame.bind(this));
    }

    addGridItemsEventListener() {
        document.getElementById('grid').addEventListener('click', this.boundHandleCardClick);
    }

    removeGridItemsEventListener() {
        document.getElementById('grid').removeEventListener('click', this.boundHandleCardClick);
    }

    handleCardClick(event) {
        const cardElement = event.target;
        if (cardElement.tagName === 'TD') {
            const id = parseInt(cardElement.dataset.id);
            const card = this.getCardById(id);
            if (!card.flipped && !card.matched) {
                // avoid open more than 2 cards
                if (this.flipped.length >= 2) {
                    this.unflipCards()
                } else {
                    this.flipCard(card);
                    this.checkForMatch();
                }
            }
        }
    }

    flipCard(card) {
        this.handleCardFlip(card, true)
        this.flipped.push(card.id);
    }

    unflipCards() {
        for (const id of this.flipped) {
            const card = this.getCardById(id);
            this.handleCardFlip(card, false)
        }
        this.flipped = [];
    }

    handleCardFlip(card, isFlipped) {
        card.flipped = isFlipped;
        const cardElement = document.getElementById(`${card.id}`)
        cardElement.textContent = card.flipped ? card.value : '';
        cardElement.style.backgroundColor = card.flipped ? 'green' : 'red';
    }

    checkForMatch() {
        if (this.flipped.length === 2) {
            const [id1, id2] = this.flipped;
            const card1 = this.getCardById(id1);
            const card2 = this.getCardById(id2);

            if (card1.value === card2.value) {
                card1.matched = true;
                card2.matched = true;
                this.matched.push(card1.id);
                this.matched.push(card2.id);
                this.flipped = [];

                if (this.matched.length === this.rows * this.columns) {
                    this.endGame(true);
                }
            } else {
                setTimeout(() => {
                    this.unflipCards();
                }, 1000);
            }
        }
    }

    getCardById(id) {
        for (const row of this.grid) {
            for (const card of row) {
                if (card.id === id) {
                    return card;
                }
            }
        }
        return null;
    }

    startGame() {
        this.resetGame();
        this.addGridItemsEventListener()
        this.runTimer()
    }

    runTimer() {
        const startButton = document.getElementById('start');
        startButton.innerText = 'Replay standard game';
        this.remainingTime = this.timeLimit;
        this.timer = setInterval(() => {
            const timerElement = document.getElementById('timer')
            this.remainingTime--;
            timerElement.textContent = Math.floor(this.remainingTime)
            if (this.remainingTime === 0) {
                this.endGame(false);
                timerElement.textContent = ' Wait to start'
            }
        }, 1000);
    }

    pauseGame() {
        // clearInterval(this.timer);
    }

    resumeGame() {
        if (this.remainingTime > 0) {
            this.timer = setInterval(() => {
                this.remainingTime--;
                if (this.remainingTime === 0) {
                    this.endGame(false);
                }
            }, 1000);
        }
    }

    endGame(win) {
        clearInterval(this.timer);
        this.remainingTime = 0;

        this.removeGridItemsEventListener()

        const startButton = document.getElementById('start');
        startButton.innerText = 'Start standard game';


        const messageElement = document.getElementById('message');
        if (win) {
            messageElement.textContent = 'Congratulations! You won!';
        } else {
            messageElement.textContent = 'Time is up! You lost!';
        }

    }

    replayGame() {
        this.resetGame();
        this.renderGrid();

        const messageElement = document.getElementById('message');
        messageElement.textContent = '';

        const startButton = document.getElementById('start');
        startButton.disabled = false;
    }

    resetGame() {
        this.grid = [];
        this.flipped = [];
        this.matched = [];
        this.remainingTime = this.timeLimit;
        this.timer = null;
        clearInterval(this.timer);


        this.createGrid();
        this.renderGrid();

    }
}

const matchGrid = new MatchGrid({
    width: 400,
    height: 400,

    // todo: validate rows and cols to even
    rows: 2,
    columns: 3,
    timeLimit: 10
});