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

        this.init();
    }

    init() {
        this.createGrid();
        this.renderGrid();
        this.addEventListeners();
    }

    createGrid() {
        for (let row = 0; row < this.rows; row += 1) {
            let rowData = [];
            let availableCardNumbers = this.randomizeNumbers()
            for (let col = 0; col < this.columns; col += 1) {
                const id = row * this.columns + col;
                const currentValue = availableCardNumbers[col]
                const card = {
                    id,
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
                td.dataset.value = card.value;
                td.textContent = card.flipped ? card.value : '';
                td.style.backgroundColor = card.flipped ? 'green' : 'red';
                tr.appendChild(td);
            }
            gridElement.appendChild(tr);
        }
    }


    addEventListeners() {
        const gridElement = document.getElementById('grid');
        gridElement.addEventListener('click', this.handleCardClick.bind(this));

        const startButton = document.getElementById('start');
        startButton.addEventListener('click', this.startGame.bind(this));

        const replayButton = document.getElementById('replay');
        replayButton.addEventListener('click', this.replayGame.bind(this));

        const gameElement = document.getElementById('game');
        gameElement.addEventListener('mouseout', this.pauseGame.bind(this));
        gameElement.addEventListener('mouseover', this.resumeGame.bind(this));
    }

    handleCardClick(event) {
        const cardElement = event.target;
        if (cardElement.tagName === 'TD') {
            const id = parseInt(cardElement.dataset.id);
            const card = this.getCardById(id);
            if (!card.flipped && !card.matched) {
                this.flipCard(card);
                this.checkForMatch();
            }
        }
    }

    flipCard(card) {
        const cardElement = document.getElementById(`${card.id}`)
        card.flipped = true;
        cardElement.textContent = card.flipped ? card.value : '';
        cardElement.style.backgroundColor = card.flipped ? 'green' : 'red';

        this.flipped.push(card.id);
        console.log(card);
    }

    unflipCards() {
        for (const id of this.flipped) {
            const card = this.getCardById(id);
            card.flipped = false;

            const cardElement = document.getElementById(`${card.id}`)
            cardElement.textContent = card.flipped ? card.value : '';
            cardElement.style.backgroundColor = card.flipped ? 'green' : 'red';
        }
        this.flipped = [];
        // this.renderGrid();
        
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
        this.timer = setInterval(() => {
            this.remainingTime--;
            if (this.remainingTime === 0) {
                this.endGame(false);
            }
        }, 1000);

        const startButton = document.getElementById('start');
        const replayButton = document.getElementById('replay');
        startButton.disabled = true;
        replayButton.disabled = true;
    }

    pauseGame() {
        clearInterval(this.timer);
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

        const messageElement = document.getElementById('message');
        if (win) {
            messageElement.textContent = 'Congratulations! You won!';
        } else {
            messageElement.textContent = 'Time is up! You lost!';
        }

        const startButton = document.getElementById('start');
        const replayButton = document.getElementById('replay');
        startButton.disabled = false;
        replayButton.disabled = false;
    }

    replayGame() {
        this.resetGame();
        this.renderGrid();

        const messageElement = document.getElementById('message');
        messageElement.textContent = '';

        const startButton = document.getElementById('start');
        const replayButton = document.getElementById('replay');
        startButton.disabled = false;
        replayButton.disabled = true;
    }

    resetGame() {
        this.grid = [];
        this.flipped = [];
        this.matched = [];
        this.remainingTime = this.timeLimit;

        this.createGrid();
    }
}

const matchGrid = new MatchGrid({
    width: 400,
    height: 400,

    // todo: validate rows and cols to even
    rows: 5,
    columns: 6,
    timeLimit: 560
});