const start_screen = document.querySelector('#start-screen');
const game_screen = document.querySelector('#game-screen');
const pause_screen = document.querySelector('#pause-screen');
const result_screen = document.querySelector('#result-screen');


const cells = document.querySelectorAll('.main-grid-cell');

const name_input = document.querySelector('#input-name');

const number_inputs = document.querySelectorAll('.number');

const player_name = document.querySelector('#player-name');
const game_level = document.querySelector('#game-level');
const game_time = document.querySelector('#game-time');

const result_time = document.querySelector('#result-time');



let level_index = 0;
let level = CONSTANT.LEVEL[level_index];

let timer = null;
let pause = false;
let seconds = 0;

let su = undefined;
let su_answer = undefined;

let selected_cell = -1;

const getGameInfo = () => JSON.parse(localStorage.getItem('game'));

const initGameGrid = () => {
    let index = 0;  //pemisah grid

    for (let i = 0; i < Math.pow(CONSTANT.GRID_SIZE,2);i++) {
        let row = Math.floor(i/CONSTANT.GRID_SIZE);
        let col = i % CONSTANT.GRID_SIZE;
        if (row === 2 || row === 5) cells[index].style.marginBottom = '5px';
        if (col === 2 || col === 5) cells[index].style.marginRight = '5px';
        index++;
    }
}

const setPlayerName = (name) => localStorage.setItem('player_name',name);
const getPlayerName = () => localStorage.getItem('player_name');

const showTime = (seconds) => new Date(seconds*1000).toISOString().substr(11,8);

const clearSudoku = () => { //hapus angka
    for (let i = 0; i < Math.pow(CONSTANT.GRID_SIZE,2);i++) {
       cells[i].innerHTML = '';
       cells[i].classList.remove('filled');
       cells[i].classList.remove('selected'); 
    }
}

const initSudoku = () => {  //isi kotak

    clearSudoku();
    resetBg();

    su = sudokuGen(level);
    su_answer = [...su.question];

    console.table(su_answer);

    seconds = 0;

    saveGameInfo();

    for (let i = 0; i < Math.pow(CONSTANT.GRID_SIZE,2);i++) {
        let row = Math.floor (i/CONSTANT.GRID_SIZE);
        let col = i % CONSTANT.GRID_SIZE;

        cells[i].setAttribute('data-value',su.question[row][col]);

        if (su.question[row][col] !== 0) {
            cells[i].classList.add('filled');
            cells[i].innerHTML = su.question[row][col];
        }
    }
}


const hoverBg = (index) => {    //hover
    let row = Math.floor(index/CONSTANT.GRID_SIZE);
    let col = index % CONSTANT.GRID_SIZE;

    let box_start_row = row - row%3;
    let box_start_col = col - col%3;

    for (let i = 0; i < CONSTANT.BOX_SIZE; i++) {
        for (let j = 0; j < CONSTANT.BOX_SIZE; j++) {
            let cell = cells[9*(box_start_row + i) + (box_start_col + j)];
            cell.classList.add('hover');
        }
    }
    let step = 9;
    while (index - step >=0) {
        cells[index - step].classList.add('hover');
        step += 9;
    }
    step = 9;
    while (index + step < 81) {
        cells[index + step].classList.add('hover');
        step += 9;
    }
    step=1;
    while (index - step >= 9*row) {
        cells[index - step].classList.add('hover');
        step += 1;
    }
    step = 1;
    while (index + step < 9*row + 9) {
        cells[index + step].classList.add('hover');
        step += 1;
    }
}

const resetBg = () => {
    cells.forEach(e => e.classList.remove('hover'));
}

const checkErr = (value) => {   //cek angka yang sama
    const addErr = (cell) => {
        if (parseInt(cell.getAttribute('data-value')) === value) {
            cell.classList.add('err');
            cell.classList.add('cell-err');
            setTimeout (() => {
                cell.classList.remove('cell-err');
            },500);
        }
    }
    let index = selected_cell;

    let row = Math.floor(index/CONSTANT.GRID_SIZE);
    let col = index % CONSTANT.GRID_SIZE;

    let box_start_row = row - row%3;
    let box_start_col = col - col%3;

    for (let i = 0; i < CONSTANT.BOX_SIZE; i++) {
        for (let j = 0; j < CONSTANT.BOX_SIZE; j++) {
            let cell = cells[9*(box_start_row + i) + (box_start_col + j)];
            if (!cell.classList.contains('selected'))addErr(cell);
        }
    }
    let step = 9;
    while (index - step >=0) {
        addErr(cells[index - step]);
        step += 9;
    }
    step = 9;
    while (index + step < 81) {
        addErr(cells[index + step]);
        step += 9;
    }
    step=1;
    while (index - step >= 9*row) {
        addErr(cells[index - step]);
        step += 1;
    }
    step = 1;
    while (index + step < 9*row + 9) {
        addErr(cells[index + step]);
        step += 1;
    }
}

const removeErr = () => cells.forEach(e => e.classList.remove('err'));

const saveGameInfo = () => {
    let game = {
        level: level_index,
        seconds: seconds,
        su: {
            original: su.original,
            question: su.question,
            answer: su_answer,
        }
    }
    localStorage.setItem('game',JSON.stringify(game));
}

const removeGameInfo = () => {
    localStorage.removeItem('game');
}

const isGameWin = () => sudokuCheck(su_answer);



const showResult = () => {
    clearInterval(timer);
    result_screen.classList.add('active');
    result_time.innerHTML = showTime(seconds);
    

    saveLeaderboard();
    displayLeaderboard();
    
}

const leaderboardData = JSON.parse(localStorage.getItem('leaderboard')) || [];

const saveLeaderboard = () => {
    const playerName = getPlayerName();
    const leaderboardEntry = { name: playerName, time: seconds,level: CONSTANT.LEVEL_NAME[level_index] };
    
    const existingEntryIndex = leaderboardData.findIndex(entry =>
        entry.name === playerName && entry.level === CONSTANT.LEVEL_NAME[level_index]
    );

    if (existingEntryIndex !== -1) {
        if (leaderboardData[existingEntryIndex].time > seconds) {
            leaderboardData[existingEntryIndex].time = seconds;
        }
    } else {
        leaderboardData.push(leaderboardEntry);
    }

   leaderboardData.sort((a, b) => a.time - b.time);
    
    
    
    localStorage.setItem('leaderboard', JSON.stringify(leaderboardData));
}
const displayLeaderboard = () => {
    const leaderboardContainer = document.querySelector('#leaderboard-body');
    leaderboardContainer.innerHTML = '';
  
    if (leaderboardData.length === 0) {
      leaderboardContainer.innerHTML = '<tr><td colspan="3">No entries yet.</td></tr>';
      return;
    }
  
    const filteredLeaderboard = leaderboardData.filter(
      entry => entry.level === CONSTANT.LEVEL_NAME[level_index]
    );
  
    const uniqueEntries = {};
    filteredLeaderboard.forEach(entry => {
      if (!(entry.name in uniqueEntries)) {
        uniqueEntries[entry.name] = entry;
      } else {
        if (uniqueEntries[entry.name].time > entry.time) {
          uniqueEntries[entry.name] = entry;
        }
      }
    });
  
    const playerName = getPlayerName();
    const currentPlayerTime = seconds;
  
    let currentPlayerFound = false;
  
    Object.values(uniqueEntries).forEach((entry, index) => {
      const row = document.createElement('tr');
      const nameCell = document.createElement('td');
      const timeCell = document.createElement('td');
      const levelCell = document.createElement('td');
  
      nameCell.textContent = entry.name;
      timeCell.textContent = showTime(entry.time);
      levelCell.textContent = entry.level;
  
      if (entry.name === playerName && entry.time === currentPlayerTime) {
        row.classList.add('current-player');
        currentPlayerFound = true;
      }
  
      row.appendChild(nameCell);
      row.appendChild(timeCell);
      row.appendChild(levelCell);
      leaderboardContainer.appendChild(row);
    });
  
    if (playerName && currentPlayerTime && !currentPlayerFound) {
      const row = document.createElement('tr');
      const nameCell = document.createElement('td');
      const timeCell = document.createElement('td');
      const levelCell = document.createElement('td');
  
      nameCell.textContent = playerName;
      timeCell.textContent = showTime(currentPlayerTime);
      levelCell.textContent = CONSTANT.LEVEL_NAME[level_index];
  
      row.classList.add('current-player');
  
      row.appendChild(nameCell);
      row.appendChild(timeCell);
      row.appendChild(levelCell);
      leaderboardContainer.appendChild(row);
    }
  };
  

const initNumberInputEvent = () => {    //input
    number_inputs.forEach((e, index) => {
        e.addEventListener('click', () => {
            if (!cells[selected_cell].classList.contains('filled')) {
                cells[selected_cell].innerHTML = index + 1;
                cells[selected_cell].setAttribute('data-value',index + 1);
                
                let row = Math.floor(selected_cell / CONSTANT.GRID_SIZE);
                let col = selected_cell % CONSTANT.GRID_SIZE;
                su_answer[row][col] = index + 1;

                saveGameInfo();            

                removeErr();
                checkErr(index + 1);
                cells[selected_cell].classList.add('zoom-in');
                setTimeout(() => {
                    cells[selected_cell].classList.remove('zoom-in');
                },500);

                if (isGameWin()) {
                    removeGameInfo();
                    showResult();
                }
            }
        });
    });
}

const initCellsEvent = () => {  //pengecualian selected
    cells.forEach((e, index) => {
        e.addEventListener('click',() => {
            if (!e.classList.contains('filled')) {
                cells.forEach(e => e.classList.remove('selected'));

                selected_cell = index;
                e.classList.remove('err');
                e.classList.add('selected');
                resetBg();
                hoverBg(index);
            }
        });
    });
}

const startGame = () => {
    start_screen.classList.remove('active');
    game_screen.classList.add('active');

    player_name.innerHTML = name_input.value.trim();
    setPlayerName(name_input.value.trim());

    game_level.innerHTML = CONSTANT.LEVEL_NAME[level_index];

    seconds = 0;
    showTime(seconds);

    timer = setInterval(() => {
        if (!pause) {
           seconds = seconds + 1;
           game_time.innerHTML = showTime(seconds);
        }
    },1000);
}

const returnStartScreen = () => {
    clearInterval(timer);
    pause = false;
    seconds = 0;
    start_screen.classList.add('active');
    game_screen.classList.remove('active');
    pause_screen.classList.remove('active');
    result_screen.classList.remove('active');
}



document.querySelector('#btn-level').addEventListener('click', (e) => {
    level_index = level_index + 1 > CONSTANT.LEVEL.length - 1 ? 0 : level_index + 1;
    level = CONSTANT.LEVEL[level_index];
    e.target.innerHTML = CONSTANT.LEVEL_NAME[level_index];
});

document.querySelector('#btn-play').addEventListener('click', () => {   //nama error
    if (name_input.value.trim().length > 0) {
        startGame();
        initSudoku();
    }else {
        name_input.classList.add('input-err');
        setTimeout(() => {
            name_input.classList.remove('input-err');
            name_input.focus();
        },500);
    }
});

document.querySelector('#btn-pause').addEventListener('click',() => {
    pause_screen.classList.add('active');
    pause=true;
});

document.querySelector('#btn-resume').addEventListener('click',() => {
    pause_screen.classList.remove('active');
    pause=false;
});

document.querySelector('#btn-new-game').addEventListener('click',() => {
    returnStartScreen();
});

document.querySelector('#btn-new-game-2').addEventListener('click',() => {
    returnStartScreen();
});

document.querySelector('#btn-delete').addEventListener('click',() => {
    cells[selected_cell].innerHTML = '';
    cells[selected_cell].setAttribute('data-value',0);

    let row = Math.floor(selected_cell/CONSTANT.GRID_SIZE);
    let col = selected_cell % CONSTANT.GRID_SIZE;

    su_answer[row][col] = 0;

    removeErr();
});

const init = () => {
    
    const game = getGameInfo();
    

    initGameGrid();
    initCellsEvent();
    initNumberInputEvent();

    if (getPlayerName()) {
        name_input.value = getPlayerName(); 
    } else {
        name_input.focus();
    }
}

init ();
