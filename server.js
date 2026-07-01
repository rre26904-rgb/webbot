const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

const categories = {
    "أكل": ["بيتزا", "شاورما", "برجر", "سوشي", "كبسة", "مندي", "باستا"],
    "دول": ["السعودية", "اليابان", "إيطاليا", "البرازيل", "مصر", "إسبانيا", "الصين"],
    "أماكن": ["مدرسة", "مستشفى", "مطار", "ملعب", "سينما", "حديقة", "مطعم"]
};
let rooms = {};

const quickGamesData = {
    words: ["مستشفى", "سيارة", "طائرة", "خوارزمية", "مكينة", "سيرفر", "ديسكورد", "ميكانيكي", "رياضيات", "فيزياء", "عسير", "أبها"],
    capitals: { "السعودية": "الرياض", "مصر": "القاهرة", "اليابان": "طوكيو", "بريطانيا": "لندن", "فرنسا": "باريس" }
};

const quickGames = [
    { name: 'حروف 🔠', command: 'حروف', generate: () => { let w = quickGamesData.words[Math.floor(Math.random() * quickGamesData.words.length)]; return { question: `كم عدد حروف كلمة: [ ${w} ] ؟`, answer: w.length.toString() }; } },
    { name: 'فكك 🧩', command: 'فكك', generate: () => { let w = quickGamesData.words[Math.floor(Math.random() * quickGamesData.words.length)]; return { question: `فكك الكلمة: [ ${w} ]`, answer: w.split('').join(' ') }; } },
    { name: 'عواصم 🌍', command: 'عواصم', generate: () => { let c = Object.keys(quickGamesData.capitals); let w = c[Math.floor(Math.random() * c.length)]; return { question: `وش عاصمة: [ ${w} ] ؟`, answer: quickGamesData.capitals[w] }; } }
];

let globalGameState = { isActive: false, answer: null, timeout: null, botActive: false };

function startGlobalGame(specificGame = null) {
    if (globalGameState.timeout) clearTimeout(globalGameState.timeout);
    let game = specificGame || quickGames[Math.floor(Math.random() * quickGames.length)];
    let { question, answer } = game.generate();
    globalGameState.isActive = true; globalGameState.answer = answer;
    io.to('globalChat').emit('systemMessage', `🎮 لعبة جديدة (${game.name}): ${question}`);
    globalGameState.timeout = setTimeout(() => {
        if (globalGameState.isActive) {
            io.to('globalChat').emit('systemMessage', `⏰ انتهى الوقت! الجواب كان: [ ${answer} ]`);
            globalGameState.isActive = false;
            setTimeout(() => startGlobalGame(), 10000); 
        }
    }, 15000);
}

io.on('connection', (socket) => {
    socket.on('joinGlobal', (username) => {
        socket.join('globalChat');
        io.to('globalChat').emit('systemMessage', `👋 دخل ${username} للشات العام!`);
        if (!globalGameState.botActive) { globalGameState.botActive = true; setTimeout(() => startGlobalGame(), 5000); }
    });

    socket.on('leaveGlobal', () => { socket.leave('globalChat'); });

    socket.on('sendGlobalMessage', ({ username, message }) => {
        let msgText = message.trim();
        io.to('globalChat').emit('receiveGlobalMessage', { username, message: msgText });
        if (msgText.startsWith('-')) {
            let cmd = msgText.substring(1);
            let game = quickGames.find(g => g.command === cmd);
            if (game) { startGlobalGame(game); return; }
        }
        if (globalGameState.isActive && msgText === globalGameState.answer) {
            globalGameState.isActive = false; clearTimeout(globalGameState.timeout);
            io.to('globalChat').emit('systemMessage', `🏆 كفو يا ${username}! جاوب صح. (الجواب: ${globalGameState.answer})`);
            setTimeout(() => startGlobalGame(), 7000);
        }
    });

    // --- منطق الرومات الخاصة المحسن ---
    socket.on('joinRoom', ({ username, roomId, requestedGameType }) => {
        // إذا الروم مو موجود ومافي نوع لعبة مطلوب (يعني محاولة انضمام)، نرفض الدخول
        if (!rooms[roomId] && !requestedGameType) {
            return socket.emit('errorMsg', 'الروم غير موجود! تأكد من الرمز.');
        }

        // إنشاء الروم إذا مو موجود
        if (!rooms[roomId]) {
            rooms[roomId] = { players: [], host: socket.id, state: 'waiting', votes: {}, gameType: requestedGameType, fastGameState: { isActive: false, answer: null } };
        }

        socket.join(roomId);
        rooms[roomId].players.push({ id: socket.id, name: username, isImposter: false });
        io.to(roomId).emit('updatePlayers', rooms[roomId].players);
        
        // نبلغ اللاعب اللي دخل بنوع اللعبة الفعلي للروم عشان يفتح الشاشة الصح
        socket.emit('roomJoined', { roomId, gameType: rooms[roomId].gameType });

        if (rooms[roomId].host === socket.id) socket.emit('isHost');
    });

    // بدء الألعاب الخاصة
    socket.on('startGame', ({ roomId, category }) => {
        let room = rooms[roomId];
        if (!room) return;

        if (room.gameType === 'bara' && room.players.length > 2) {
            room.votes = {}; 
            let words = categories[category];
            let secretWord = words[Math.floor(Math.random() * words.length)];
            let imposterIndex = Math.floor(Math.random() * room.players.length);
            room.secretWord = secretWord; room.category = category;
            
            room.players.forEach((player, index) => {
                player.isImposter = (index === imposterIndex);
                if (player.isImposter) io.to(player.id).emit('gameStarted', { role: 'imposter', word: 'أنت برا السالفة!' });
                else io.to(player.id).emit('gameStarted', { role: 'normal', word: secretWord });
            });
            room.currentTurnIndex = Math.floor(Math.random() * room.players.length);
            io.to(roomId).emit('nextTurn', room.players[room.currentTurnIndex].name);

        } else if (room.gameType !== 'bara') {
            // تفعيل حقيقي للعبة داخل الشات الخاص
            let game = quickGames.find(g => g.command === room.gameType);
            if (game) {
                let { question, answer } = game.generate();
                room.fastGameState.isActive = true;
                room.fastGameState.answer = answer;
                io.to(roomId).emit('privateSystemMessage', `🎮 الجولة بدأت: ${question}`);
            }
        }
    });

    // استقبال رسايل الشات الخاص والتحقق من الجواب
    socket.on('sendPrivateMessage', ({ roomId, username, message }) => {
        let room = rooms[roomId];
        if (!room) return;
        let msgText = message.trim();
        io.to(roomId).emit('receivePrivateMessage', { username, message: msgText });

        if (room.fastGameState && room.fastGameState.isActive && msgText === room.fastGameState.answer) {
            room.fastGameState.isActive = false;
            io.to(roomId).emit('privateSystemMessage', `🏆 كفو يا ${username}! فزت بالجولة! (الجواب: ${room.fastGameState.answer})`);
            io.to(roomId).emit('privateSystemMessage', `بانتظار الهوست يبدأ الجولة الجاية...`);
        }
    });

    // أحداث برا السالفة المعتادة
    socket.on('passTurn', (roomId) => {
        let room = rooms[roomId];
        if (room) {
            room.currentTurnIndex = (room.currentTurnIndex + 1) % room.players.length;
            io.to(roomId).emit('nextTurn', room.players[room.currentTurnIndex].name);
        }
    });

    socket.on('startVote', (roomId) => { io.to(roomId).emit('votingStarted', rooms[roomId].players); });
    socket.on('submitVote', ({ roomId, votedId }) => {
        let room = rooms[roomId]; if (!room) return;
        room.votes[votedId] = (room.votes[votedId] || 0) + 1;
        let totalVotes = Object.values(room.votes).reduce((a, b) => a + b, 0);
        if (totalVotes === room.players.length) {
            let highestVotes = 0; let votedOut = null;
            for (let id in room.votes) { if (room.votes[id] > highestVotes) { highestVotes = room.votes[id]; votedOut = id; } }
            let imposter = room.players.find(p => p.isImposter);
            if (votedOut === imposter.id) {
                io.to(imposter.id).emit('imposterCaught', categories[room.category]);
                io.to(roomId).emit('waitingForGuess', { message: 'تم كشف المندس، ننتظر تخمينه...' });
            } else { io.to(roomId).emit('gameOver', { message: `فاز المندس! السالفة كانت: ${room.secretWord}` }); }
        }
    });
    socket.on('guessWord', ({ roomId, guess }) => {
        let room = rooms[roomId];
        if (room && guess === room.secretWord) io.to(roomId).emit('gameOver', { message: 'المندس ذكي وجاب السالفة! فاز المندس!' });
        else io.to(roomId).emit('gameOver', { message: `المندس جاب العيد! السالفة كانت: ${room.secretWord}` });
    });

    socket.on('resetRoom', (roomId) => {
        if (rooms[roomId]) { rooms[roomId].votes = {}; rooms[roomId].state = 'waiting'; io.to(roomId).emit('updatePlayers', rooms[roomId].players); }
    });

    socket.on('leaveRoom', (roomId) => {
        let room = rooms[roomId];
        if (room) {
            let playerIndex = room.players.findIndex(p => p.id === socket.id);
            if (playerIndex !== -1) {
                room.players.splice(playerIndex, 1);
                socket.leave(roomId);
                io.to(roomId).emit('updatePlayers', room.players);
                if (room.players.length === 0) delete rooms[roomId];
            }
        }
    });

    socket.on('disconnect', () => {
        for (const roomId in rooms) {
            let room = rooms[roomId];
            let playerIndex = room.players.findIndex(p => p.id === socket.id);
            if (playerIndex !== -1) {
                room.players.splice(playerIndex, 1); 
                io.to(roomId).emit('updatePlayers', room.players);
                if (room.players.length === 0) delete rooms[roomId];
            }
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));