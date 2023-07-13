class MatchGrid {
    constructor({ rows, columns, timeLimit, theme }) {
        this.rows = rows;
        this.columns = columns;
        this.timeLimit = timeLimit;
        this.theme = theme

        this.grid = [];
        this.flipped = [];
        this.matched = [];

        this.timer = null;
        this.remainingTime = 0;
        this.isTimerRunning = false;
        this.previousTime = 0;

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
                td.classList.add(`${this.theme}`)
                tr.appendChild(td);
            }
            gridElement.appendChild(tr);
        }
    }


    addEventListeners() {
        const startButton = document.getElementById('start');
        startButton.addEventListener('click', this.startGame.bind(this));

        const showFormButton = document.getElementById('custom-game');
        showFormButton.addEventListener('click', this.displayCustomizationForm);

        const form = document.getElementById('customization-form');
        form.addEventListener('submit', (event) => this.onSubmit(event));

        const cancelFormButton = document.getElementById('cancel-button');
        cancelFormButton.addEventListener('click', (event) => {
            event.preventDefault();
            document.getElementById('form-container').style.display = 'none'
        });

        const gameZone = document.getElementById('body');
        gameZone.addEventListener('mouseleave', this.pauseGame.bind(this));
        gameZone.addEventListener('mouseenter', this.resumeGame.bind(this));
    }

    onSubmit(event) {
        event.preventDefault();

        const columnsInput = event.target.elements[0].valueAsNumber;
        const rowsInput = event.target.elements[1].valueAsNumber;
        const themeSelect = event.target.elements[2].value;
        const timeInput = event.target.elements[3].valueAsNumber;

        if ((columnsInput * rowsInput) % 2 !== 0) {
            const error = document.getElementById('error');
            error.style.display = 'block';
        } else {
            error.style.display = 'none';
            this.rows = rowsInput;
            this.columns = columnsInput;
            this.timeLimit = timeInput;
            this.theme = themeSelect;
            document.getElementById('body').setAttribute('class', `${this.theme}`)

            this.resetGame();
            document.getElementById('form-container').style.display = 'none';
        }
    }

    addGridItemsEventListener() {
        document.getElementById('grid').addEventListener('click', this.boundHandleCardClick);
    }

    removeGridItemsEventListener() {
        document.getElementById('grid').removeEventListener('click', this.boundHandleCardClick);
    }

    displayCustomizationForm() {
        const formContainer = document.getElementById('form-container');
        formContainer.style.display = 'flex'
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
        card.flipped ? cardElement.setAttribute('class', `${this.theme}--open`) : cardElement.setAttribute('class', `${this.theme}`)
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
        this.isTimerRunning = true;
        this.remainingTime = this.previousTime ? this.previousTime : this.timeLimit;
        this.timer = setInterval(() => {
            const timerElement = document.getElementById('timer')
            this.remainingTime--;
            timerElement.textContent = Math.floor(this.remainingTime)
            if (this.remainingTime <= 0) {
                this.endGame(false);
                timerElement.textContent = 'Wait to start'
            }
        }, 1000);
    }

    pauseGame() {
        if (this.isTimerRunning) {
            const getDOMTime = document.getElementById('timer').textContent;
            this.previousTime = isNaN(getDOMTime) ? this.timeLimit : getDOMTime; 
            this.isTimerRunning = false;
            clearInterval(this.timer);
        }
    }

    resumeGame() {
        if (!this.isTimerRunning && this.previousTime) {
            this.runTimer()
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

    resetGame() {
        this.grid = [];
        this.flipped = [];
        this.matched = [];
        this.remainingTime = this.timeLimit;
        clearInterval(this.timer);
        this.timer = null;
        this.previousTime = null;
        this.createGrid();
        this.renderGrid();
        document.getElementById('timer').textContent = 'Wait to start'
    }
}

const matchGrid = new MatchGrid({
    rows: 5,
    columns: 4,
    timeLimit: 40,
    theme: 'default'
});