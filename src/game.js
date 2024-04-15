class Game {
  constructor() {
    this.playerElement = document.querySelector("#player");
    this.boardElement = document.querySelector("#game-board");
    this.gameOverElement = document.querySelector("#game-over");
    this.bullets = [];
    this.enemies = [];
    this.moveSpeed = 30;
    this.score = 0;
    this.gameOver = false; // Pole score
    // Zmienna do śledzenia czy dany przycisk jest aktualnie wciśnięty
    this.keysPressed = {
      ArrowLeft: false,
      ArrowRight: false,
      Space: false,
    };

    // Zmieniam obsługę zdarzeń klawiatury na keydown i keyup
    window.addEventListener("keydown", this.handleKeyDown.bind(this));
    window.addEventListener("keyup", this.handleKeyUp.bind(this));

    // this.handleKeyboard.bind(this): Tworzy nową funkcję,
    // w której this zawsze odnosi się do instancji klasy Game,
    // bez względu na to, jak jest wywoływana. W ten sposób,
    // gdy użytkownik naciśnie klawisz, metoda handleKeyboard
    // ma dostęp do właściwości i metod tej instancji klasy Game,
    // takich jak this.playerElement, this.bullets, itp.
  }

  movePlayer(direction) {
    // Liczenie pozycji gracza
    const newPosition =
      this.playerElement.offsetLeft + direction * this.moveSpeed;

    const { left, right } = this.boardElement.getBoundingClientRect();
    const minLeft = this.playerElement.offsetWidth / 2;
    const maxRight = right - left - minLeft;

    // Sprawdzamy, czy nowa pozycja gracza mieści się w planszy
    if (newPosition >= minLeft && newPosition <= maxRight) {
      this.playerElement.style.left = newPosition + "px";
    }
  }

  // Nowa metoda do obsługi wciśnięcia klawisza
  handleKeyDown(e) {
    this.keysPressed[e.code] = true;
    this.handleKeyboard();
  }

  // Nowa metoda do zwolnienia obsługi klawiszy
  handleKeyUp(e) {
    this.keysPressed[e.code] = false;
    this.handleKeyboard();
  }

  // Musiałem zmodyfikować obsługę klawiatury, ponieważ chciałem
  // strzelać i poruszać się jednocześnie
  handleKeyboard() {
    if (this.keysPressed["ArrowLeft"]) {
      this.movePlayer(-1);
    }
    if (this.keysPressed["ArrowRight"]) {
      this.movePlayer(1);
    }
    if (this.keysPressed["Space"]) {
      this.createBullet();
    }
  }

  createBullet() {
    // Tworzymy nowy element pocisku
    const bullet = document.createElement("div");
    bullet.className = "bullet";
    bullet.style.left = `${this.playerElement.offsetLeft}px`;
    bullet.style.bottom = `${this.playerElement.offsetHeight}px`;
    // Dodajemy pocisk do planszy i tablicy bullets
    this.boardElement.appendChild(bullet);
    this.bullets.push(bullet);
  }

  checkCollision(bullet, enemy) {
    const bulletPosition = bullet.getBoundingClientRect();
    const enemyPosition = enemy.getBoundingClientRect();
    return (
      bulletPosition.left > enemyPosition.left &&
      bulletPosition.right < enemyPosition.right &&
      bulletPosition.top < enemyPosition.bottom
    );
  }

  checkBulletCollision(bullet) {
    const idx = this.bullets.indexOf(bullet);
    for (let i = 0; i < this.enemies.length; i++) {
      const enemy = this.enemies[i];
      if (this.checkCollision(bullet, enemy)) {
        this.bullets.splice(idx, 1);
        bullet.remove();
        this.enemies.splice(i, 1);
        enemy.remove();
        this.score += 10;
        document.getElementById("score").innerText = this.score;
        if (this.score >= 500) {
          // Sprawdzamy, czy osiągnięto 1000 punktów
          this.winGame(); // Wywołujemy funkcję wygrywającą grę
        }
      }
    }
  }

  winGame() {
    // Wyświetlamy odpowiedni komunikat o zwycięstwie
    document.getElementById("game-over").innerText = "You won!";
    this.endGame(); // Kończymy grę
  }

  moveBullets() {
    for (let i = 0; i < this.bullets.length; i++) {
      const bullet = this.bullets[i];

      // Przesuwamy pocisk w górę planszy
      bullet.style.top = `${bullet.offsetTop - this.moveSpeed}px`;

      if (bullet.offsetTop <= 0) {
        this.bullets.splice(i, 1);
        bullet.remove();
        i--;
      } else {
        // Sprawdzamy czy pocisk trafił
        this.checkBulletCollision(bullet);
      }
    }
  }
  //Tworzenie statkow losowo
  createEnemy() {
    if (Math.round(Math.random())) {
      const enemy = document.createElement("div");
      enemy.className = "enemy";
      enemy.style.top = "-40px";
      enemy.style.left = `${Math.floor(
        Math.random() * (this.boardElement.offsetWidth - 120) + 60
      )}px`;
      this.boardElement.appendChild(enemy);
      this.enemies.push(enemy);
    }
  }

  moveEnemies() {
    for (let i = 0; i < this.enemies.length; i++) {
      const enemy = this.enemies[i];
      // Przesuwamy statek w dół
      enemy.style.top = `${enemy.offsetTop + 5}px`;
      // Gdy statek wyjdzie poza mapę
      if (enemy.offsetTop >= this.boardElement.offsetHeight) {
        this.endGame(); // Kończymy grę
        return;
      }
    }
  }

  restartGame() {
    this.enemies.forEach((enemy) => enemy.remove());
    this.enemies = [];
    this.bullets.forEach((bullet) => bullet.remove());
    this.bullets = [];
    this.score = 0;
    document.getElementById("score").innerText = this.score;
    this.gameOver = false;
    document.getElementById("game-over").style.display = "none";

    this.startGame();
  }

  startGame() {
    document.getElementById("game-over").style.display = "none";
    this.score = 0;
    setInterval(() => this.moveBullets(), 30);
    setInterval(() => this.createEnemy(), 500);
    setInterval(() => this.moveEnemies(), 100);
  }

  endGame() {
    document.getElementById("game-over").style.display = "block";
    document.getElementById("restart-button").style.display = "block";
    this.gameOver = true;
  }
}

let game; // Definicja zmiennej game jako zmiennej globalnej

function startGame() {
  game = new Game();
  game.startGame();
  document.getElementById("start-button").style.display = "none";
}

document.getElementById("start-button").addEventListener("click", startGame);

// Dodanie obsługi zdarzenia kliknięcia na przycisk "restart"
document
  .getElementById("restart-button")
  .addEventListener("click", function () {
    game.restartGame();
    document.getElementById("restart-button").style.display = "none"; // Ukrycie przycisku "restart"
  });
