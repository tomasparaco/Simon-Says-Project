let divs = Array.from(document.querySelectorAll('#container div'));
let parent = document.getElementById('parent');
let gameArray, gameArrayIndex, score, gameOver;
let highestScore = 0;
let currentScr = document.getElementById('currentScr');
let highScr = document.getElementById('highScr');
let playerNameInput = document.getElementById('playerName');
let startButton = document.getElementById('startButton');
let menu = document.getElementById('menu');
let highScoresList = document.getElementById('highScoresList');

// Cargar sonidos
const sounds = {
    flash: [
        new Audio('./sounds/red_flash.mp3'),
        new Audio('./sounds/blue_flash.mp3'),
        new Audio('./sounds/yellow_flash.mp3'),
        new Audio('./sounds/green_flash.mp3')
    ],
    click: [
        new Audio('./sounds/red_click.ogg'),
        new Audio('./sounds/blue_click.ogg'),
        new Audio('./sounds/yellow_click.ogg'),
        new Audio('./sounds/green_click.ogg')
    ]
};

// Cargar el nombre del jugador y los puntajes más altos desde localStorage
function loadHighScores() {
    const highScores = JSON.parse(localStorage.getItem('highScores')) || [];
    highScoresList.innerHTML = ''; // Limpiar la lista actual
    highScores.forEach(score => {
        const scoreItem = document.createElement('div');
        scoreItem.textContent = `${score.name}: ${score.score}`;
        highScoresList.appendChild(scoreItem);
    });
}

// Guardar el puntaje más alto en localStorage
function saveHighScore(name, score) {
    const highScores = JSON.parse(localStorage.getItem('highScores')) || [];
    highScores.push({ name, score });
    localStorage.setItem('highScores', JSON.stringify(highScores));
}

// Iniciar el juego
startButton.addEventListener('click', () => {
    const playerName = playerNameInput.value.trim();
    if (playerName) {
        localStorage.setItem('playerName', playerName); // Guardar el nombre del jugador
        document.getElementById('playerNameDisplay').textContent = `Jugador: ${playerName}`; // Mostrar el nombre del jugador
        menu.classList.add('hidden'); // Ocultar el menú
        parent.classList.remove('hidden'); // Mostrar el contenedor del juego
        startGame(); // Iniciar el juego
    } else {
        alert('Por favor, ingresa tu nombre.');
    }
});

// Función para iniciar el juego
startGame = () => {
    gameOver = false; 
    gameArray = []; 
    gameArrayIndex = 0; 
    score = 0;

    resetGameVariables();

    // Mostrar el contenedor del juego y ocultar el botón de inicio
    parent.classList.remove('hidden');
    divs.forEach(e => {
        e.style.cursor = 'pointer';
        e.addEventListener('click', eventlisten);
    });

    gameAutomate(); // Iniciar la secuencia del juego
}

// Función para manejar el evento de clic en los botones
function eventlisten() {
    const index = divs.indexOf(this); // Obtener el índice del botón

    // Interrumpir y reproducir el sonido
    if (!sounds.click[index].paused) {
        sounds.click[index].pause(); // Detener el sonido si está en reproducción
    }
    sounds.click[index].currentTime = 0; // Reiniciar el tiempo del sonido
    sounds.click[index].play(); // Reproducir sonido de clic

    this.classList.add('flash');

    // Esperar un momento antes de quitar el brillo
    setTimeout(() => { this.classList.remove('flash'); }, 200);
    checkWin(parseInt(this.textContent));
}

// Función para automatizar el juego
async function gameAutomate() {
    gameArrayIndex = 0; // Reiniciar el índice de la secuencia
    await setColor(); // Mostrar la secuencia actual

    // Agregar un nuevo color aleatorio a la secuencia
    let random = Math.floor(Math.random() * divs.length);
    gameArray.push(random);
    setTimeout(() => { divs[random].classList.add('flash'); }, 200);
    setTimeout(() => { divs[random].classList.remove('flash'); }, 500);
}

// Función para verificar si el jugador ha ganado
checkWin = (boxText) => {
    (gameArray[gameArrayIndex] != boxText) ? (resetGame()) : ({});
    if (gameArrayIndex == gameArray.length - 1 && !gameOver) {
        setTimeout(() => {
            score++;
            if (score > highestScore) {
                highestScore = score;
                const playerName = localStorage.getItem('playerName');
                saveHighScore(playerName, highestScore); // Guardar el nuevo puntaje más alto
            }
            gameAutomate(); // Iniciar la siguiente ronda
        }, 500);
    }
    if (gameArray.length != 0) { gameArrayIndex++; }
}

// Función para mostrar los colores en la secuencia
setColor = () => {
    return new Promise(async (resolve, reject) => {
        divs.forEach(e => {
            e.removeEventListener('click', eventlisten);
            e.style.cursor = 'default';
        });

               for (let i = 0; i < gameArray.length; i++) {
            const index = gameArray[i];
            divs[index].classList.add('flash');

            // Interrumpir y reproducir el sonido
            if (!sounds.flash[index].paused) {
                sounds.flash[index].pause(); // Detener el sonido si está en reproducción
            }
            sounds.flash[index].currentTime = 0; // Reiniciar el tiempo del sonido
            sounds.flash[index].play(); // Reproducir sonido de flash

            // Esperar a que el sonido termine de reproducirse
            await new Promise(resolve => {
                setTimeout(() => {
                    divs[index].classList.remove('flash');
                    resolve();
                }, 400); // Tiempo de espera después de que se reproduce el sonido
            });

            // Esperar un tiempo adicional antes de mostrar el siguiente color
            await new Promise(resolve => setTimeout(resolve, 300)); // Tiempo entre colores
        }

        // Permitir la interacción del usuario después de que se haya mostrado la secuencia
        divs.forEach(e => {
            e.addEventListener('click', eventlisten);
            e.style.cursor = 'pointer';
        });
        resolve(true);
    });
};

// Función para reiniciar el juego
function resetGame() {
    gameOver = true; // Indica que el juego ha terminado

    // Remover los event listeners de todos los elementos del juego
    divs.forEach(e => {
        e.removeEventListener('click', eventlisten);
        e.style.cursor = 'default';
    });

    // Mostrar el mensaje de "Juego Terminado"
    document.getElementById('gameOverMessage').classList.remove('hidden');

    // Calcular las puntuaciones actuales y más altas
    let curscr = Array.from(document.querySelectorAll('#currentScr div')).length; 
    let highscr = Array.from(document.querySelectorAll('#highScr div')).length;

    // Actualizar las puntuaciones en la interfaz
    addElements(score, curscr, currentScr); 
    addElements(highestScore, highscr, highScr);

    // Agregar evento al botón de cerrar
    close = document.getElementById('close');
    close.addEventListener('click', scale);
}

// Función para agregar elementos a la interfaz
function addElements(a, b, c) {
    if (a > (b - 1)) {
        for (let i = b; i <= a; i++) {
            let x = document.createElement('div');
            x.innerText = i;
            c.appendChild(x);
        }
    }
    c.style.transform = `translateY(${-50 * a}px)`;
}

// Función para reiniciar las variables del juego
function resetGameVariables() {
    gameOver = false; 
    gameArray = []; 
    gameArrayIndex = 0; 
    score = 0;

    // Restablecer la puntuación en la interfaz
    currentScr.innerHTML = '<div>0</div>'; // Restablecer la puntuación actual
    highScr.innerHTML = '<div>' + highestScore + '</div>'; // Mostrar el mejor puntaje
}

// Cargar los puntajes más altos al cargar la página
window.onload = () => {
    loadHighScores();
};
