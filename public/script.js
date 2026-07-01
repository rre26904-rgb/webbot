const socket = io();
let myRoomId = '';
let myUsername = '';
let isHost = false;

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// ==========================================
// التنقل والشات العام
// ==========================================
function joinGlobalChat() {
    myUsername = document.getElementById('username').value.trim();
    if (!myUsername) return alert('اكتب اسمك أولاً!');
    socket.emit('joinGlobal', myUsername);
    showScreen('globalChatScreen');
}

function goBackToHub() {
    socket.emit('leaveGlobal');
    
    if (myRoomId) {
        socket.emit('leaveRoom', myRoomId);
        myRoomId = '';
        isHost = false;
        document.getElementById('hostControls').style.display = 'none';
        document.getElementById('privateHostBtn').style.display = 'none';
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
// الرومات الخاصة (جميع الألعاب)
// ==========================================
function startPrivateGame(gameType) {
    myUsername = document.getElementById('username').value.trim();
    if (!myUsername) return alert('اكتب اسمك قبل تختار اللعبة!');

    myRoomId = document.getElementById('roomId').value.trim() || Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // إرسال نوع اللعبة للسيرفر
    socket.emit('joinRoom', { username: myUsername, roomId: myRoomId, gameType: gameType });
}

// استقبال الرد من السيرفر وتوجيه اللاعب للشاشة الصح
socket.on('roomJoined', ({ roomId, gameType }) => {
    if (gameType === 'bara') {
        document.getElementById('displayRoomId').innerText = roomId;
        showScreen('lobbyScreen');
    } else {
        document.getElementById('privateRoomTitle').innerText = `روم ${gameType} (${roomId})`;
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
    
    if(list) list.innerHTML = '';
    if(privateList) privateList.innerHTML = '';

    players.forEach(p => {
        let tag = `<div class="player-tag">${p.name}</div>`;
        if(list) list.innerHTML += tag;
        if(privateList) privateList.innerHTML += tag;
    });
});

// بدء جولة الألعاب السريعة من الهوست
function startPrivateFastGame() {
    socket.emit('startGame', { roomId: myRoomId });
}

// إرسال الإجابة في الروم الخاص
function sendPrivateMessage() {
    const input = document.getElementById('privateChatInput');
    const msg = input.value.trim();
    if (msg !== '') {
        socket.emit('sendPrivateMessage', { roomId: myRoomId, username: myUsername, message: msg });
        input.value = '';
    }
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

// باقي دوال برا السالفة (موجودة عندك)
function startGame() { socket.emit('startGame', { roomId: myRoomId, category: document.getElementById('categorySelect').value }); }
// ... (انسخ باقي الدوال مثل passTurn و startVote هنا) ...