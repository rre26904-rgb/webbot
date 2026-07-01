const socket = io();
let myRoomId = '';
let myUsername = '';

// الألعاب المسجلة (تطابق names في gamesData)
const gameConfigs = [
    { name: 'حروف', type: 'حروف', icon: '🔠' },
    { name: 'فكك واشبك', type: 'فكك', icon: '🧩' },
    { name: 'دول وعواصم', type: 'عواصم', icon: '🌍' }
];

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// بناء الأزرار ديناميكياً
window.onload = () => {
    const grid = document.getElementById('gamesGrid');
    gameConfigs.forEach(game => {
        const card = document.createElement('div');
        card.className = 'game-card';
        card.innerHTML = `<div class="game-icon">${game.icon}</div><h3>${game.name}</h3>`;
        card.onclick = () => createPrivateRoom(game.type);
        grid.appendChild(card);
    });
};

function createPrivateRoom(gameType) {
    myUsername = document.getElementById('username').value.trim();
    if (!myUsername) return alert('اكتب اسمك!');
    myRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    socket.emit('joinRoom', { username: myUsername, roomId: myRoomId, requestedGameType: gameType });
}

function joinExistingRoom() {
    myUsername = document.getElementById('username').value.trim();
    myRoomId = document.getElementById('roomIdInput').value.trim().toUpperCase();
    if (!myUsername || !myRoomId) return alert('اكتب اسمك ورمز الغرفة!');
    socket.emit('joinRoom', { username: myUsername, roomId: myRoomId });
}

socket.on('roomJoined', ({ roomId, gameType }) => {
    myRoomId = roomId;
    document.getElementById('privateRoomTitle').innerText = `روم ${gameType}`;
    document.getElementById('displayPrivateRoomId').innerText = roomId;
    showScreen('privateChatScreen');
});

socket.on('isHost', () => document.getElementById('privateHostBtn').style.display = 'block');

// الشات والرومات
function sendPrivateMessage() {
    const msg = document.getElementById('privateChatInput').value.trim();
    if (msg) { socket.emit('sendPrivateMessage', { roomId: myRoomId, username: myUsername, message: msg }); document.getElementById('privateChatInput').value = ''; }
}

socket.on('receivePrivateMessage', (data) => {
    const box = document.getElementById('privateChatMessages');
    box.innerHTML += `<div class="chat-message"><span class="sender">${data.username}</span>${data.message}</div>`;
    box.scrollTop = box.scrollHeight;
});

socket.on('privateSystemMessage', (msg) => {
    document.getElementById('privateChatMessages').innerHTML += `<div class="system-msg">${msg}</div>`;
});

function startPrivateFastGame() { socket.emit('startGame', { roomId: myRoomId }); }

// دوال العام (نفس منطق السابق)
function joinGlobalChat() { 
    myUsername = document.getElementById('username').value.trim(); 
    if(!myUsername) return alert('اكتب اسمك!');
    socket.emit('joinGlobal', myUsername); 
    showScreen('globalChatScreen'); 
}
// ... (أضف دالة goBackToHub وباقي رسايل الشات العام هنا)

function goBackToHub() {
    socket.emit('leaveGlobal');
    if (myRoomId) {
        socket.emit('leaveRoom', myRoomId);
        myRoomId = '';
        isHost = false;
        document.getElementById('hostControls').style.display = 'none';
        document.getElementById('privateHostBtn').style.display = 'none';
        document.getElementById('chatMessages').innerHTML = '<div class="system-msg">تقدر تكتب الأوامر (-حروف، -فكك، -عواصم) عشان تشغل الألعاب!</div>';
        document.getElementById('privateChatMessages').innerHTML = '<div class="system-msg">الروم الخاص جاهز، بانتظار الهوست يبدأ الجولة!</div>';
    }
    showScreen('hubScreen');
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const msg = input.value.trim();
    if (msg !== '') { socket.emit('sendGlobalMessage', { username: myUsername, message: msg }); input.value = ''; }
}
function handleEnter(event) { if (event.key === 'Enter') sendMessage(); }

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
// الرومات الخاصة (إنشاء وانضمام)
// ==========================================

// دالة 1: الهوست ينشئ روم من البطاقات
function createPrivateRoom(gameType) {
    myUsername = document.getElementById('username').value.trim();
    if (!myUsername) return alert('اكتب اسمك قبل تنشئ الروم!');
    
    // توليد رمز جديد للروم
    myRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    socket.emit('joinRoom', { username: myUsername, roomId: myRoomId, requestedGameType: gameType });
}

// دالة 2: الأخويا ينضمون بكتابة الرمز
function joinExistingRoom() {
    myUsername = document.getElementById('username').value.trim();
    if (!myUsername) return alert('اكتب اسمك أولاً!');
    
    let enteredCode = document.getElementById('roomIdInput').value.trim().toUpperCase();
    if (!enteredCode) return alert('تكفى اكتب رمز الغرفة في المربع عشان تنضم!');
    
    myRoomId = enteredCode;
    // الانضمام بدون requestedGameType عشان السيرفر يرجعه لنا
    socket.emit('joinRoom', { username: myUsername, roomId: myRoomId });
}

// توجيه اللاعب للشاشة الصح بعد الدخول للروم
socket.on('roomJoined', ({ roomId, gameType }) => {
    if (gameType === 'bara') {
        document.getElementById('displayRoomId').innerText = roomId;
        showScreen('lobbyScreen');
    } else {
        document.getElementById('privateRoomTitle').innerText = `روم ${gameType}`;
        document.getElementById('displayPrivateRoomId').innerText = roomId;
        showScreen('privateChatScreen');
    }
});

socket.on('isHost', () => {
    isHost = true;
    document.getElementById('hostControls').style.display = 'block';
    document.getElementById('privateHostBtn').style.display = 'block';
});

socket.on('updatePlayers', (players) => {
    const list = document.getElementById('playersList');
    const privateList = document.getElementById('privatePlayersList');
    const gameList = document.getElementById('gamePlayersList');
    
    if(list) list.innerHTML = '';
    if(privateList) privateList.innerHTML = '';
    if(gameList) gameList.innerHTML = '';

    players.forEach(p => {
        let tag = `<div class="player-tag">${p.name}</div>`;
        if(list) list.innerHTML += tag;
        if(privateList) privateList.innerHTML += tag;
        if(gameList) gameList.innerHTML += `<div class="player-tag game-player-tag" data-name="${p.name}">${p.name}</div>`;
    });
});

// بدء جولة الألعاب السريعة من الهوست
function startPrivateFastGame() { socket.emit('startGame', { roomId: myRoomId }); }

function sendPrivateMessage() {
    const input = document.getElementById('privateChatInput');
    const msg = input.value.trim();
    if (msg !== '') { socket.emit('sendPrivateMessage', { roomId: myRoomId, username: myUsername, message: msg }); input.value = ''; }
}
function handlePrivateEnter(event) { if (event.key === 'Enter') sendPrivateMessage(); }

socket.on('receivePrivateMessage', (data) => {
    const chatBox = document.getElementById('privateChatMessages');
    chatBox.innerHTML += `<div class="chat-message"><span class="sender">${data.username}</span>${data.message}</div>`;
    chatBox.scrollTop = chatBox.scrollHeight;
});
socket.on('privateSystemMessage', (msg) => {
    const chatBox = document.getElementById('privateChatMessages');
    chatBox.innerHTML += `<div class="system-msg">${msg}</div>`;
    chatBox.scrollTop = chatBox.scrollHeight;
});

// ==========================================
// دوال برا السالفة
// ==========================================
function startGame() { socket.emit('startGame', { roomId: myRoomId, category: document.getElementById('categorySelect').value }); }
socket.on('gameStarted', (data) => {
    document.getElementById('secretWord').innerText = data.word;
    document.getElementById('secretWord').style.color = data.word === 'أنت برا السالفة!' ? '#ef4444' : '#10b981';
    showScreen('gameScreen');
});
socket.on('nextTurn', (playerName) => {
    document.getElementById('currentTurn').innerText = playerName;
    document.getElementById('nextTurnBtn').style.display = (playerName === myUsername) ? 'block' : 'none';
    document.querySelectorAll('.game-player-tag').forEach(tag => { tag.classList.toggle('active-turn', tag.getAttribute('data-name') === playerName); });
});
function passTurn() { socket.emit('passTurn', myRoomId); document.getElementById('nextTurnBtn').style.display = 'none'; }
function startVote() { socket.emit('startVote', myRoomId); }
socket.on('votingStarted', (players) => {
    const options = document.getElementById('voteOptions'); options.innerHTML = '';
    players.forEach(p => { options.innerHTML += `<button style="margin:5px;" onclick="submitVote('${p.id}')">${p.name}</button>`; });
    showScreen('voteScreen');
});
function submitVote(votedId) { socket.emit('submitVote', { roomId: myRoomId, votedId }); document.getElementById('voteOptions').innerHTML = '<h3>تم تسجيل تصويتك، ننتظر الباقين...</h3>'; }
socket.on('imposterCaught', (wordsArray) => {
    const options = document.getElementById('guessOptions'); options.innerHTML = '';
    wordsArray.forEach(w => { options.innerHTML += `<button style="margin:5px;" onclick="guessWord('${w}')">${w}</button>`; });
    showScreen('guessScreen');
});
function guessWord(guess) { socket.emit('guessWord', { roomId: myRoomId, guess }); }
socket.on('gameOver', (data) => {
    let msg = document.getElementById('resultMessage'); if (msg) msg.innerText = data.message;
    showScreen('resultScreen');
});
socket.on('waitingForGuess', (data) => {
    const guessScreen = document.getElementById('guessScreen');
    if (!guessScreen.classList.contains('active')) {
        let msg = document.getElementById('resultMessage'); if (msg) msg.innerText = data.message;
        showScreen('resultScreen');
    }
});
function restartGame() { socket.emit('resetRoom', myRoomId); showScreen('lobbyScreen'); }