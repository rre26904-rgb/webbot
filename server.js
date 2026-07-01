const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

// ==========================================
// 1. بيانات ألعاب "برا السالفة"
// ==========================================
const categories = {
    "أكل": ["بيتزا", "شاورما", "برجر", "سوشي", "كبسة", "مندي", "باستا"],
    "دول": ["السعودية", "اليابان", "إيطاليا", "البرازيل", "مصر", "إسبانيا", "الصين"],
    "أماكن": ["مدرسة", "مستشفى", "مطار", "ملعب", "سينما", "حديقة", "مطعم"]
};
let rooms = {};

// ==========================================
// 2. نظام الألعاب السريعة (الشات العام)
// ==========================================
// هنا تضيف الكلمات اللي تبيها للألعاب
const quickGamesData = {
    words: ["مستشفى", "سيارة", "طائرة", "خوارزمية", "مكينة", "سيرفر", "ديسكورد", "ميكانيكي", "رياضيات"],
    capitals: { "السعودية": "الرياض", "مصر": "القاهرة", "اليابان": "طوكيو", "بريطانيا": "لندن", "فرنسا": "باريس" }
};

// 🌟 هنا تقدر تضيف 100 لعبة بسهولة! 🌟
const quickGames = [
    {
        name: 'حروف 🔠',
        generate: () => {
            let word = quickGamesData.words[Math.floor(Math.random() * quickGamesData.words.length)];
            return {
                question: `كم عدد حروف كلمة: [ ${word} ] ؟`,
                answer: word.length.toString() // نحول الرقم لنص عشان يطابق رسالة الشات
            };
        }
    },
    {
        name: 'فكك 🧩',
        generate: () => {
            let word = quickGamesData.words[Math.floor(Math.random() * quickGamesData.words.length)];
            return {
                question: `فكك الكلمة التالية: [ ${word} ] (حط مسافة بين كل حرف)`,
                answer: word.split('').join(' ') // مثال: م س ت ش ف ى
            };
        }
    },
    {
        name: 'عواصم 🌍',
        generate: () => {
            let countries = Object.keys(quickGamesData.capitals);
            let country = countries[Math.floor(Math.random() * countries.length)];
            return {
                question: `وش عاصمة دولة: [ ${country} ] ؟`,
                answer: quickGamesData.capitals[country]
            };
        }
    }
    // تقدر تنسخ أي بلوك وتضيف لعبة "اشبك"، "رياضيات"، إلخ...
];

let globalGameState = {
    isActive: false,
    answer: null,
    timeout: null,
    botActive: false // عشان نتأكد إن البوت شغال
};

// دالة تشغيل الألعاب السريعة تلقائياً
function startRandomGlobalGame() {
    if (!globalGameState.botActive || globalGameState.isActive) return;

    // نختار لعبة عشوائية
    let game = quickGames[Math.floor(Math.random() * quickGames.length)];
    let { question, answer } = game.generate();

    globalGameState.isActive = true;
    globalGameState.answer = answer;

    // إرسال السؤال للشات
    io.to('globalChat').emit('systemMessage', `🎮 لعبة جديدة (${game.name}): ${question}`);

    // مؤقت: لو محد جاوب خلال 15 ثانية تنتهي
    globalGameState.timeout = setTimeout(() => {
        if (globalGameState.isActive) {
            io.to('globalChat').emit('systemMessage', `⏰ انتهى الوقت! الجواب كان: [ ${answer} ]`);
            globalGameState.isActive = false;
            
            // بدء لعبة جديدة بعد 10 ثواني
            setTimeout(startRandomGlobalGame, 10000);
        }
    }, 15000);
}


// ==========================================
// 3. إدارة اتصالات اللاعبين (Sockets)
// ==========================================
io.on('connection', (socket) => {
    
    // --- أحداث الشات العام ---
    socket.on('joinGlobal', (username) => {
        socket.join('globalChat');
        io.to('globalChat').emit('systemMessage', `👋 دخل ${username} للشات العام!`);
        
        // إذا هذي أول مرة يشتغل فيها الشات، نشغل بوت الألعاب
        if (!globalGameState.botActive) {
            globalGameState.botActive = true;
            setTimeout(startRandomGlobalGame, 5000); // تبدأ أول لعبة بعد 5 ثواني
        }
    });

    socket.on('leaveGlobal', () => {
        socket.leave('globalChat');
    });

    socket.on('sendGlobalMessage', ({ username, message }) => {
        // نرسل الرسالة العادية للكل
        io.to('globalChat').emit('receiveGlobalMessage', { username, message });

        // التحقق من الإجابة (إذا كان في لعبة شغالة)
        if (globalGameState.isActive && message.trim() === globalGameState.answer) {
            // اللاعب فاز!
            globalGameState.isActive = false;
            clearTimeout(globalGameState.timeout); // نوقف المؤقت
            
            io.to('globalChat').emit('systemMessage', `🏆 كفو يا ${username}! جاوب صح أسرع واحد. (الجواب كان: ${globalGameState.answer})`);
            
            // اللعبة الجاية تبدأ بعد 7 ثواني
            setTimeout(startRandomGlobalGame, 7000);
        }
    });


    // --- أحداث الغرف الخاصة (برا السالفة) ---
    socket.on('joinRoom', ({ username, roomId }) => {
        socket.join(roomId);
        if (!rooms[roomId]) {
            rooms[roomId] = { players: [], host: socket.id, state: 'waiting', votes: {} };
        }
        rooms[roomId].players.push({ id: socket.id, name: username, isImposter: false });
        io.to(roomId).emit('updatePlayers', rooms[roomId].players);
        
        if (rooms[roomId].host === socket.id) {
            socket.emit('isHost');
        }
    });

    socket.on('startGame', ({ roomId, category }) => {
        let room = rooms[roomId];
        if (room && room.players.length > 2) {
            room.votes = {}; 
            
            let words = categories[category];
            let secretWordIndex = Math.floor(Math.random() * words.length);
            let secretWord = words[secretWordIndex];
            
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
        }
    });

    socket.on('passTurn', (roomId) => {
        let room = rooms[roomId];
        if (room) {
            room.currentTurnIndex = (room.currentTurnIndex + 1) % room.players.length;
            io.to(roomId).emit('nextTurn', room.players[room.currentTurnIndex].name);
        }
    });

    socket.on('startVote', (roomId) => {
        io.to(roomId).emit('votingStarted', rooms[roomId].players);
    });

    socket.on('submitVote', ({ roomId, votedId }) => {
        let room = rooms[roomId];
        if (!room) return;
        
        room.votes[votedId] = (room.votes[votedId] || 0) + 1;
        let totalVotes = Object.values(room.votes).reduce((a, b) => a + b, 0);
        
        if (totalVotes === room.players.length) {
            let highestVotes = 0;
            let votedOut = null;
            for (let id in room.votes) {
                if (room.votes[id] > highestVotes) {
                    highestVotes = room.votes[id];
                    votedOut = id;
                }
            }
            
            let imposter = room.players.find(p => p.isImposter);
            if (votedOut === imposter.id) {
                io.to(imposter.id).emit('imposterCaught', categories[room.category]);
                io.to(roomId).emit('waitingForGuess', { message: 'تم كشف المندس، جاري الانتظار...' });
            } else {
                io.to(roomId).emit('gameOver', { message: `فاز المندس! السالفة كانت: ${room.secretWord}` });
            }
        }
    });

    socket.on('guessWord', ({ roomId, guess }) => {
        let room = rooms[roomId];
        if (room && guess === room.secretWord) {
            io.to(roomId).emit('gameOver', { message: 'المندس ذكي وجاب السالفة! فاز المندس!' });
        } else {
            io.to(roomId).emit('gameOver', { message: `المندس جاب العيد! السالفة كانت: ${room.secretWord}` });
        }
    });

    socket.on('resetRoom', (roomId) => {
        if (rooms[roomId]) {
            rooms[roomId].votes = {}; 
            rooms[roomId].state = 'waiting';
            io.to(roomId).emit('updatePlayers', rooms[roomId].players);
        }
    });

    socket.on('disconnect', () => {
        for (const roomId in rooms) {
            let room = rooms[roomId];
            let playerIndex = room.players.findIndex(p => p.id === socket.id);
            
            if (playerIndex !== -1) {
                room.players.splice(playerIndex, 1); 
                io.to(roomId).emit('updatePlayers', room.players);
                
                if (room.players.length === 0) {
                    delete rooms[roomId];
                }
            }
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));