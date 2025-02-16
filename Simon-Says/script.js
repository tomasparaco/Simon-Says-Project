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
    const tbody = document.querySelector('#highScoresList tbody');
    tbody.innerHTML = '';

    // Ordenar DESCENDENTE y luego cortar top 10
    highScores
        .sort((a, b) => b.score - a.score) 
        .slice(0, 10) // Mostrar solo los 10 primeros
        .forEach((score, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${score.name}</td>
                <td>${score.score}</td>
            `;
            tbody.appendChild(row);
        });
}


// Guardar el puntaje más alto en localStorage
function saveHighScore(name, newScore) {
    const highScores = JSON.parse(localStorage.getItem('highScores')) || [];
    
    // Actualizar o agregar puntaje
    const existingPlayer = highScores.find(player => player.name === name);
    if (existingPlayer) {
        if (newScore > existingPlayer.score) {
            existingPlayer.score = newScore;
        }
    } else {
        highScores.push({ name, score: newScore });
    }
    
    // Ordenar y guardar todos los registros
    highScores.sort((a, b) => b.score - a.score);
    localStorage.setItem('highScores', JSON.stringify(highScores));
    
    loadHighScores(); // Actualizar tabla
}

// Iniciar el juego

startButton.addEventListener('click', () => {
    const playerName = playerNameInput.value.trim();
    if (playerName) {
        localStorage.setItem('playerName', playerName);
        document.getElementById('playerNameDisplay').textContent = `Jugador: ${playerName}`;
        menu.style.display = 'none';  // Cambiar esto 👈
        parent.classList.remove('hidden');
        startGame();
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

   // Restablecer UI sin ocultar el juego
   currentScr.innerHTML = '<div>0</div>';
   highScr.innerHTML = `<div>${highestScore}</div>`;

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
    if (gameArray[gameArrayIndex] != boxText) {
        resetGame();
        return;
    }

    if (gameArrayIndex == gameArray.length - 1 && !gameOver) {
        setTimeout(() => {
            score++;
            // === Actualizar puntaje en tiempo real ===
            currentScr.firstElementChild.textContent = score; // 👈 Línea clave
            if (score > highestScore) {
                highestScore = score;
                saveHighScore(localStorage.getItem('playerName'), highestScore);
            }
            gameAutomate();
        }, 500);
    }
    gameArrayIndex++;
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
    // 1. Capturar el puntaje REAL antes de reiniciar variables
    const finalScore = score;
    
    // 2. Mostrar mensaje de fin con puntaje correcto
    const existingMessage = document.getElementById('gameOverMessage');
    if (existingMessage) existingMessage.remove();
    
    const gameOverMessage = document.createElement('div');
    gameOverMessage.id = 'gameOverMessage';
    gameOverMessage.innerHTML = `
        <h2>¡Juego Terminado!</h2>
        <p>Puntaje: ${finalScore}</p>
        <button onclick="resetGameAndRestart()">Reintentar</button>
       <button onclick="returnToMenu()">Menú Principal</button> 
    `;
    document.body.appendChild(gameOverMessage);

    // 3. Reiniciar estado del juego
    gameOver = true;
    gameArray = [];
    gameArrayIndex = 0;
    score = 0;  // Reset solo después de mostrar el puntaje
    
    // 4. Limpiar listeners y UI
    divs.forEach(div => {
        div.style.pointerEvents = 'none'; // Desactivar clicks
        div.classList.remove('flash');
    });
    
    // 5. Guardar puntaje máximo
    const playerName = localStorage.getItem('playerName');
    if (playerName && finalScore > 0) {
        saveHighScore(playerName, finalScore);
    }

    // Actualizar tabla de puntajes al mostrar el menú
    if (document.getElementById('menu').style.display === 'flex') {
        loadHighScores(); 
    }
    
}

// Función para reinicio completo
function resetGameAndRestart() {
    document.getElementById('gameOverMessage').remove();
    divs.forEach(div => div.style.pointerEvents = 'auto'); 
    parent.classList.remove('hidden');
    
    // Reiniciar variables sin recargar
    gameArray = [];
    gameArrayIndex = 0;
    score = 0;
    currentScr.innerHTML = '<div>0</div>';
    
    startGame(); // Iniciar nueva partida
}

document.getElementById('reiniciar').addEventListener('click', () => {
    resetGame();
    menu.style.display = 'flex';  // 
});

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


// Cargar los puntajes más altos al cargar la página
window.onload = () => {
    loadHighScores();

    const savedName = localStorage.getItem('playerName');
    if (savedName) {
        document.getElementById('playerName').value = savedName;
    }
};

function returnToMenu() {
    // Resetear completamente el estado del juego
    gameOver = true;
    gameArray = [];
    gameArrayIndex = 0;
    score = 0;

    // Limpiar UI y mensajes
    document.getElementById('gameOverMessage')?.remove();
    divs.forEach(div => {
        div.style.pointerEvents = 'auto';
        div.classList.remove('flash');
    });

    // Mostrar menú y ocultar juego
    menu.style.display = 'flex';
    parent.classList.add('hidden');
    
    // Recargar puntajes
    loadHighScores();
}