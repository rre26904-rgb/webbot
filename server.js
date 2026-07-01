const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public')); 

// ==========================================
// بيانات ألعاب "برا السالفة"
// ==========================================
const categories = {
    "أكل": ["بيتزا", "شاورما", "برجر", "سوشي", "كبسة", "مندي", "باستا"],
    "دول": ["السعودية", "اليابان", "إيطاليا", "البرازيل", "مصر", "إسبانيا", "الصين"],
    "أماكن": ["مدرسة", "مستشفى", "مطار", "ملعب", "سينما", "حديقة", "مطعم"]
};
let rooms = {};

// ==========================================
// الألعاب السريعة (حروف، فكك، عواصم)
// ==========================================
const quickGamesData = {
    words: ["مستشفى", "سيارة", "طائرة", "خوارزمية", "مكينة", "سيرفر", "ديسكورد", "ميكانيكي", "رياضيات"],
    capitals: { "السعودية": "الرياض", "مصر": "القاهرة", "اليابان": "طوكيو", "بريطانيا": "لندن", "فرنسا": "باريس" }
};

const quickGames = [
    {
        name: 'حروف 🔠',
        command: 'حروف',
        generate: () => {
            let word = quickGamesData.words[Math.floor(Math.random() * quickGamesData.words.length)];
            return { question: `كم عدد حروف كلمة: [ ${word} ] ؟`, answer: word.length.toString() };
        }
    },
    {
        name: 'فكك 🧩',
        command: 'فكك',
        generate: () => {
            let word = quickGamesData.words[Math.floor(Math.random() * quickGamesData.words.length)];
            return { question: `فكك الكلمة: [ ${word} ] (مسافة بين كل حرف)`, answer: word.split('').join(' ') };
        }
    },
    {
        name: 'عواصم 🌍',
        command: 'عواصم',
        generate: () => {
            let countries = Object.keys(quickGamesData.capitals);
            let country = countries[Math.floor(Math.random() * countries.length)];
            return { question: `وش عاصمة دولة: [ ${country} ] ؟`, answer: quickGamesData.capitals[country] };
        }
    }
];

let globalGameState = { isActive: false, answer: null, timeout: null, botActive: false };

function startGlobalGame(specificGame = null) {
    if (globalGameState.timeout) clearTimeout(globalGameState.timeout);
    
    let game = specificGame || quickGames[Math.floor(Math.random() * quickGames.length)];
    let { question, answer } = game.generate();

    globalGameState.isActive = true;
    globalGameState.answer = answer;

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
    
    // --- الشات العام وأوامر اللاعبين ---
    socket.on('joinGlobal', (username) => {
        socket.join('globalChat');
        io.to('globalChat').emit('systemMessage', `👋 دخل ${username} للشات العام!`);
        if (!globalGameState.botActive) {
            globalGameState.botActive = true;
            setTimeout(() => startGlobalGame(), 5000);
        }
    });

    socket.on('leaveGlobal', () => { socket.leave('globalChat'); });

    socket.on('sendGlobalMessage', ({ username, message }) => {
        let msgText = message.trim();
        io.to('globalChat').emit('receiveGlobalMessage', { username, message: msgText });

        // التحقق من نظام الأوامر (Command Handler)
        if (msgText.startsWith('-')) {
            let cmd = msgText.substring(1); // إزالة الـ "-"
            let game = quickGames.find(g => g.command === cmd);
            if (game) {
                startGlobalGame(game); // تشغيل اللعبة المطلوبة فوراً
                return;
            }
        }

        // التحقق من الإجابات
        if (globalGameState.isActive && msgText === globalGameState.answer) {
            globalGameState.isActive = false;
            clearTimeout(globalGameState.timeout);
            io.to('globalChat').emit('systemMessage', `🏆 كفو يا ${username}! جاوب صح. (الجواب: ${globalGameState.answer})`);
            setTimeout(() => startGlobalGame(), 7000);
        }
    });

    // --- الرومات الخاصة ---
    socket.on('joinRoom', ({ username, roomId, gameType }) => {
        socket.join(roomId);
        if (!rooms[roomId]) {
            rooms[roomId] = { 
                players: [], host: socket.id, state: 'waiting', 
                votes: {}, gameType: gameType,
                fastGameState: { isActive: false, answer: null } 
            };
        }
        rooms[roomId].players.push({ id: socket.id, name: username, isImposter: false });
        io.to(roomId).emit('updatePlayers', rooms[roomId].players);
        
        // إبلاغ الواجهة بنوع اللعبة عشان تفتح الشاشة الصح
        socket.emit('roomJoined', { roomId, gameType: rooms[roomId].gameType });

        if (rooms[roomId].host === socket.id) socket.emit('isHost');
    });

    // منطق بدء الجولة للرومات الخاصة
    socket.on('startGame', ({ roomId, category }) => {
        let room = rooms[roomId];
        if (!room) return;

        if (room.gameType === 'bara' && room.players.length > 2) {
            // منطق برا السالفة المعتاد...
            room.votes = {}; 
            let words = categories[category];
            let secretWord = words[Math.floor(Math.random() * words.length)];
            let imposterIndex = Math.floor(Math.random() * room.players.length);
            
            room.secretWord = secretWord;
            room.category = category;
            
            room.players.forEach((player, index) => {
                player.isImposter = (index === imposterIndex);
                if (player.isImposter) {
                    io.to(player.id).emit('gameStarted', { role: 'imposter', word: 'أنت برا السالفة!' });
                } else {
                    io.to(player.id).emit('gameStarted', { role: 'normal', word: secretWord });
                }
            });
            room.currentTurnIndex = Math.floor(Math.random() * room.players.length);
            io.to(roomId).emit('nextTurn', room.players[room.currentTurnIndex].name);

        } else if (room.gameType !== 'bara') {
            // منطق الألعاب السريعة (حروف، فكك) داخل الروم الخاص
            let game = quickGames.find(g => g.command === room.gameType);
            if (game) {
                let { question, answer } = game.generate();
                room.fastGameState.isActive = true;
                room.fastGameState.answer = answer;
                io.to(roomId).emit('privateSystemMessage', `🎮 الجولة بدأت: ${question}`);
            }
        }
    });

    // استقبال رسائل الشات الخاص للرومات
    socket.on('sendPrivateMessage', ({ roomId, username, message }) => {
        let room = rooms[roomId];
        if (!room) return;
        
        let msgText = message.trim();
        io.to(roomId).emit('receivePrivateMessage', { username, message: msgText });

        if (room.fastGameState && room.fastGameState.isActive && msgText === room.fastGameState.answer) {
            room.fastGameState.isActive = false;
            io.to(roomId).emit('privateSystemMessage', `🏆 كفو يا ${username}! فزت بالجولة! (الجواب: ${room.fastGameState.answer})`);
        }
    });

    // أحداث التنظيف والخروج وباقي أكواد برا السالفة
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

    socket.on('passTurn', (roomId) => { /* موجودة مسبقاً */ });
    socket.on('startVote', (roomId) => { /* موجودة مسبقاً */ });
    socket.on('submitVote', ({ roomId, votedId }) => { /* موجودة مسبقاً */ });
    socket.on('guessWord', ({ roomId, guess }) => { /* موجودة مسبقاً */ });
    socket.on('resetRoom', (roomId) => { /* موجودة مسبقاً */ });

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