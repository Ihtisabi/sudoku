// leaderboard.js

// Daftar leaderboard
const leaderboard = {
    easy: [],
    medium: [],
    hard: []
  };
  
  // Mendapatkan data leaderboard dari local storage
  function getLeaderboard() {
    const leaderboardData = localStorage.getItem('sudokuLeaderboard');
    if (leaderboardData) {
      return JSON.parse(leaderboardData);
    } else {
      return leaderboard;
    }
  }
  
  // Menyimpan data leaderboard ke local storage
  function saveLeaderboard() {
    localStorage.setItem('sudokuLeaderboard', JSON.stringify(leaderboard));
  }
  
  // Menambahkan waktu ke leaderboard berdasarkan level
  function addTimeToLeaderboard(level, time) {
    const leaderboardData = getLeaderboard();
    leaderboardData[level].push(time);
    leaderboardData[level].sort((a, b) => a - b); // Mengurutkan waktu dari terkecil ke terbesar
    if (leaderboardData[level].length > 10) {
      leaderboardData[level].pop(); // Membatasi hanya 10 waktu terbaik yang disimpan
    }
    saveLeaderboard();
    leaderboard[level] = leaderboardData[level];
    
  }
  
  // Menampilkan leaderboard pada halaman
  function showLeaderboard() {
    const leaderboardList = document.getElementById('leaderboard-list');
    leaderboardList.innerHTML = '';
  
    for (const level in leaderboard) {
      const levelName = level.charAt(0).toUpperCase() + level.slice(1);
      const levelData = leaderboard[level];
  
      if (levelData.length > 0) {
        const levelTitle = document.createElement('h3');
        levelTitle.innerText = levelName;
        leaderboardList.appendChild(levelTitle);
  
        const levelTable = document.createElement('table');
        levelTable.classList.add('leaderboard-table');
        const tableHeader = document.createElement('tr');
        tableHeader.innerHTML = `
          <th>Rank</th>
          <th>Name</th>
          <th>Time</th>
        `;
        levelTable.appendChild(tableHeader);
  
        for (let i = 0; i < levelData.length; i++) {
          const tableRow = document.createElement('tr');
          tableRow.innerHTML = `
            <td>${i + 1}</td>
            <td>${levelData[i].name}</td>
            <td>${levelData[i].time}</td>
          `;
          levelTable.appendChild(tableRow);
        }
  
        leaderboardList.appendChild(levelTable);
      }
    }
  }
  
  // Panggil fungsi showLeaderboard untuk menampilkan leaderboard saat halaman dimuat
  showLeaderboard();
  