const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

const rooms = {};

// دالة لخلط مصفوفة الأسئلة عشوائياً لضمان عدم تكرار الترتيب
function shuffleArray(array) {
    let shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

io.on('connection', (socket) => {
    console.log('متصل جديد:', socket.id);

    socket.on('join-room', ({ roomCode, name, gameQuestions }) => {
        socket.join(roomCode);
        
        // إذا كانت الغرفة جديدة، ننشئها ونخلط الأسئلة الخاصة بها
        if (!rooms[roomCode]) {
            rooms[roomCode] = { 
                players: [], 
                qIndex: 0, 
                questions: shuffleArray(gameQuestions) 
            };
        }
        
        rooms[roomCode].players.push({ id: socket.id, name });
        
        // مزامنة البيانات والأسئلة العشوائية مع الجميع في الغرفة
        io.to(roomCode).emit('update-players', rooms[roomCode].players);
        io.to(roomCode).emit('sync-data', { 
            questions: rooms[roomCode].questions, 
            currentIndex: rooms[roomCode].qIndex 
        });
        
        // إشعار النظام بانضمام اللاعب
        io.to(roomCode).emit('receive-message', { sender: 'النظام', text: `🟢 انضم ${name} إلى الغرفة!` });
    });

    socket.on('check-answer', ({ roomCode, answer, playerName }) => {
        const room = rooms[roomCode];
        if (!room || !room.questions[room.qIndex]) return;

        const correctAnswer = room.questions[room.qIndex].correct;

        if (answer.trim() === correctAnswer) {
            // إشعار الجميع بالإجابة الصحيحة
            io.to(roomCode).emit('receive-message', { sender: 'النظام', text: `🔥 ${playerName} أجاب بشكل صحيح!` });
            
            // الانتقال للسؤال التالي أو إعلان الفوز
            if (room.qIndex + 1 < room.questions.length) {
                room.qIndex++;
                io.to(roomCode).emit('correct-answer', { winnerName: playerName, nextIndex: room.qIndex });
            } else {
                io.to(roomCode).emit('game-won', playerName);
            }
        } else {
            // إشعار النظام بالمحاولة الخاطئة
            io.to(roomCode).emit('receive-message', { sender: 'النظام', text: `❌ إجابة خاطئة من ${playerName}.` });
        }
    });

    socket.on('send-message', ({ roomCode, sender, text }) => {
        io.to(roomCode).emit('receive-message', { sender, text });
    });

    socket.on('disconnect', () => {
        for (const roomCode in rooms) {
            const playerIndex = rooms[roomCode].players.findIndex(p => p.id === socket.id);
            if (playerIndex !== -1) {
                const playerName = rooms[roomCode].players[playerIndex].name;
                rooms[roomCode].players.splice(playerIndex, 1);
                
                io.to(roomCode).emit('update-players', rooms[roomCode].players);
                io.to(roomCode).emit('receive-message', { sender: 'النظام', text: `🔴 غادر ${playerName} الغرفة.` });
                
                // تنظيف الغرفة إذا أصبحت فارغة
                if (rooms[roomCode].players.length === 0) {
                    delete rooms[roomCode];
                }
                break;
            }
        }
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`سيرفر الألعاب يعمل على بورت ${PORT}`));