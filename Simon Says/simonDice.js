let divs = Array.from(document.querySelectorAll('#container div'));
let parent = document.getElementById('parent'); let button = document.getElementById('button'); let gameArray, gameArrayIndex, score, gameOver; let highestScore = 0; let close = document.getElementById('close'); let currentScr = document.getElementById('currentScr'); let highScr = document.getElementById('highScr'); let title = document.getElementById('title');

// Cargar sonidos
const sounds = {
    flash: [
        new Audio('./sounds/red_flash.mp3'), // Sonido cuando el botón se ilumina (rojo)
        new Audio('./sounds/blue_flash.mp3'), // Sonido cuando el botón se ilumina (azul)
        new Audio('./sounds/yellow_flash.mp3'), // Sonido cuando el botón se ilumina (amarillo)
        new Audio('./sounds/green_flash.mp3') // Sonido cuando el botón se ilumina (verde)
    ],
    click: [
        new Audio('./sounds/red_click.ogg'), // Sonido cuando el jugador hace clic (rojo)
        new Audio('./sounds/blue_click.ogg'), // Sonido cuando el jugador hace clic (azul)
        new Audio('./sounds/yellow_click.ogg'), // Sonido cuando el jugador hace clic (amarillo)
        new Audio('./sounds/green_click.ogg') // Sonido cuando el jugador hace clic (verde)
    ]
};


startGame = () => {
    gameOver = false; 
    gameArray = []; 
    gameArrayIndex = 0; 
    score = 0;

    // Mostrar el contenedor del juego y ocultar el botón de inicio
    parent.classList.remove('hidden');
    button.classList.add('hidden');

    divs.forEach(e => {
        e.style.cursor = 'pointer';
        e.addEventListener('click', eventlisten);
    });

    let random = Math.floor(Math.random() * divs.length);
    gameArray.push(random);
    setTimeout(() => { divs[random].classList.add('flash'); }, 200);
    setTimeout(() => { divs[random].classList.remove('flash'); }, 500);
}


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

async function gameAutomate() {
    gameArrayIndex = 0;
    if (gameArray.length != 0) { await setColor(); }
    let random = Math.floor(Math.random() * divs.length);
    gameArray.push(random);
    divs[random].classList.add('flash');
    setTimeout(() => { divs[random].classList.remove('flash'); }, 200);
}

checkWin = (boxText) => {
    (gameArray[gameArrayIndex] != boxText) ? (resetGame()) : ({});
    if (gameArrayIndex == gameArray.length - 1 && !gameOver) {
        setTimeout(() => {
            score++;
            (score > highestScore) ? (highestScore = score) : ({});
            gameAutomate();
        }, 500);
    }
    if (gameArray.length != 0) { gameArrayIndex++ };
}

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


removeColor = (index) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            divs[gameArray[index]].classList.remove('flash');
            resolve(true);
        }, 200);
    })
};

changeColor = () => { return new Promise((resolve, reject) => { setTimeout(() => { resolve(true); }, 200); }) }

function resetGame() {
    gameOver = true;
    divs.forEach(e => {
        e.removeEventListener('click', eventlisten);
        e.style.cursor = 'default';
    });
    let curscr = Array.from(document.querySelectorAll('#currentScr div')).length; let highscr = Array.from(document.querySelectorAll('#highScr div')).length;
    addElements(score, curscr, currentScr); addElements(highestScore, highscr, highScr);
    
}

function addElements(a, b, c) {
    if (a > (b - 1)) {
        for (let i = b; i <= a; i++) {
            let x = document.createElement('div');
            x.innerText = i;
            c.appendChild(x);
        }
    };
    c.style.transform = `translateY(${-50 * a}px)`;
}
close.addEventListener('click', scale);

function scale() {
    inst.style.transform = 'translate(-50%, -50%) scale(0)';
    parent.style.transform = 'scale(1)';
    button.style.transform = 'scale(1)';
    currentScr.style.transform = '';
    title.style.opacity = '0.5';
}
