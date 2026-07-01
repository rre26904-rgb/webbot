const socket = io();
let myRoomId = '';
let myUsername = '';
let isHost = false;

// دالة التنقل بين الشاشات
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// ==========================================
// أحداث الشات العام (الألعاب السريعة)
// ==========================================
function joinGlobalChat() {
    myUsername = document.getElementById('username').value.trim();
    if (!myUsername) return alert('تكفى اكتب اسمك أول شيء فوق!');
    
    socket.emit('joinGlobal', myUsername);
    showScreen('globalChatScreen');
}

function goBackToHub() {
    socket.emit('leaveGlobal');
    
    // إذا كان في روم خاص، نطلعه منها
    if (myRoomId) {
        socket.emit('disconnect'); // تنظيف الروم
        myRoomId = '';
        isHost = false;
        document.getElementById('hostControls').style.display = 'none';
        document.getElementById('gameHostControls').style.display = 'none';
    }
    
    showScreen('hubScreen');
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const msg = input.value.trim();
    if (msg !== '') {
        socket.emit('sendGlobalMessage', { username: myUsername, message: msg });
        input.value = '';
    }
}

function handleEnter(event) {
    if (event.key === 'Enter') sendMessage();
}

socket.on('receiveGlobalMessage', (data) => {
    const chatBox = document.getElementById('chatMessages');
    chatBox.innerHTML += `<div class="chat-message"><span class="sender">${data.username}</span>${data.message}</div>`;
    chatBox.scrollTop = chatBox.scrollHeight;
});

socket.on('systemMessage', (msg) => {
    const chatBox = document.getElementById('chatMessages');
    chatBox.innerHTML += `<div class="system-msg">${msg}</div>`;
    chatBox.scrollTop = chatBox.scrollHeight;
});

// ==========================================
// أحداث الرومات الخاصة (برا السالفة)
// ==========================================

// دالة بدء الروم الخاص من المربعات (البطاقات)
function startPrivateGame(gameType) {
    myUsername = document.getElementById('username').value.trim();
    if (!myUsername) return alert('تكفى اكتب اسمك فوق قبل تختار اللعبة!');

    if (gameType !== 'bara') {
        return alert('نظام الرومات الخاصة لهذه اللعبة قادم قريباً! (متاحة الآن كألعاب سريعة في الشات العام). جرب "برا السالفة" لإنشاء روم.');
    }

    // أخذ الرمز من المربع أو توليد رمز جديد
    myRoomId = document.getElementById('roomId').value.trim() || Math.random().toString(36).substring(2, 8).toUpperCase();
    
    socket.emit('joinRoom', { username: myUsername, roomId: myRoomId });
    document.getElementById('displayRoomId').innerText = myRoomId;
    showScreen('lobbyScreen');
}

socket.on('isHost', () => {
    isHost = true;
    document.getElementById('hostControls').style.display = 'block';
    document.getElementById('gameHostControls').style.display = 'block';
});

socket.on('updatePlayers', (players) => {
    const list = document.getElementById('playersList');
    const gameList = document.getElementById('gamePlayersList');
    
    list.innerHTML = '';
    if(gameList) gameList.innerHTML = '';

    players.forEach(p => {
        list.innerHTML += `<div class="player-tag">${p.name}</div>`;
        if(gameList) {
            gameList.innerHTML += `<div class="player-tag game-player-tag" data-name="${p.name}">${p.name}</div>`;
        }
    });
});

function startGame() {
    const category = document.getElementById('categorySelect').value;
    socket.emit('startGame', { roomId: myRoomId, category });
}

socket.on('gameStarted', (data) => {
    document.getElementById('secretWord').innerText = data.word;
    if(data.word === 'أنت برا السالفة!') {
        document.getElementById('secretWord').style.color = '#ef4444';
    } else {
        document.getElementById('secretWord').style.color = '#10b981';
    }
    showScreen('gameScreen');
});

socket.on('nextTurn', (playerName) => {
    document.getElementById('currentTurn').innerText = playerName;
    
    if (playerName === myUsername) {
        document.getElementById('nextTurnBtn').style.display = 'block';
    } else {
        document.getElementById('nextTurnBtn').style.display = 'none';
    }

    document.querySelectorAll('.game-player-tag').forEach(tag => {
        if (tag.getAttribute('data-name') === playerName) {
            tag.classList.add('active-turn');
        } else {
            tag.classList.remove('active-turn');
        }
    });
});

function passTurn() {
    socket.emit('passTurn', myRoomId);
    document.getElementById('nextTurnBtn').style.display = 'none';
}

function startVote() { socket.emit('startVote', myRoomId); }

socket.on('votingStarted', (players) => {
    const options = document.getElementById('voteOptions');
    options.innerHTML = '';
    players.forEach(p => {
        options.innerHTML += `<button style="margin: 5px; padding: 10px;" onclick="submitVote('${p.id}')">${p.name}</button>`;
    });
    showScreen('voteScreen');
});

function submitVote(votedId) {
    socket.emit('submitVote', { roomId: myRoomId, votedId });
    document.getElementById('voteOptions').innerHTML = '<h3>تم تسجيل تصويتك، ننتظر الباقين...</h3>';
}

socket.on('imposterCaught', (wordsArray) => {
    const options = document.getElementById('guessOptions');
    options.innerHTML = '';
    wordsArray.forEach(word => {
        options.innerHTML += `<button style="margin: 5px; padding: 10px;" onclick="guessWord('${word}')">${word}</button>`;
    });
    showScreen('guessScreen');
});

function guessWord(guess) {
    socket.emit('guessWord', { roomId: myRoomId, guess });
}

socket.on('gameOver', (data) => {
    let msgElement = document.getElementById('resultMessage');
    if (msgElement) {
        msgElement.innerText = data.message;
    }
    showScreen('resultScreen');
});

socket.on('waitingForGuess', (data) => {
    const guessScreen = document.getElementById('guessScreen');
    if (guessScreen.classList.contains('active')) return; 
    
    let msgElement = document.getElementById('resultMessage');
    if (msgElement) {
        msgElement.innerText = data.message;
    }
    showScreen('resultScreen');
});

function restartGame() {
    socket.emit('resetRoom', myRoomId); 
    showScreen('lobbyScreen');
}