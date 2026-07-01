const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

const rooms = {};

io.on('connection', (socket) => {
    
    // 1. تأسيس الغرفة (من الهوست)
    socket.on('create-room-init', ({ roomCode, gameId }) => {
        // نفتح الغرفة في السيرفر بدون ما نضيف اللاعبين لسه
        rooms[roomCode] = { players: [], qIndex: 0, gameId: gameId, winner: null };
    });

    // 2. التحقق من الغرفة (للاعب اللي بيدخل برمز)
    socket.on('check-room', (roomCode) => {
        if (rooms[roomCode]) {
            socket.emit('room-exists', { gameId: rooms[roomCode].gameId });
        } else {
            socket.emit('room-error', 'الرمز غير صحيح أو الغرفة مغلقة!');
        }
    });

    // 3. الدخول الفعلي للغرفة (يحدث بمجرد ما تفتح شاشة اللعبة للاعب)
    socket.on('join-game', ({ roomCode, name }) => {
        if (rooms[roomCode]) {
            socket.join(roomCode);
            // منع تكرار اسم اللاعب إذا حدث تحديث للصفحة
            if (!rooms[roomCode].players.find(p => p.id === socket.id)) {
                rooms[roomCode].players.push({ id: socket.id, name });
            }
            
            // إرسال تحديث لكل الموجودين بالغرفة
            io.to(roomCode).emit('update-players', rooms[roomCode].players);
            
            // مزامنة اللاعب الجديد مع السؤال الحالي
            socket.emit('sync-game', { qIndex: rooms[roomCode].qIndex, winner: rooms[roomCode].winner });
            
            io.to(roomCode).emit('receive-message', { sender: 'النظام', text: `🟢 انضم ${name} إلى الغرفة!` });
        }
    });

    // 4. التحقق من الإجابة (تم معالجة المسافات لضمان عدم وجود أخطاء)
    socket.on('check-answer', ({ roomCode, answer, playerName, correctAns, totalQuestions }) => {
        const room = rooms[roomCode];
        if (!room || !correctAns) return;

        // تنظيف الإجابات من المسافات قبل المقارنة
        const cleanClientAnswer = String(answer).trim();
        const cleanCorrectAnswer = String(correctAns).trim();

        if (cleanClientAnswer === cleanCorrectAnswer) {
            io.to(roomCode).emit('receive-message', { sender: 'النظام', text: `🔥 ${playerName} أجاب بشكل صحيح!` });
            
            if (room.qIndex + 1 < totalQuestions) {
                room.qIndex++;
                io.to(roomCode).emit('correct-answer', { winnerName: playerName, nextIndex: room.qIndex });
            } else {
                room.winner = playerName;
                io.to(roomCode).emit('game-won', playerName);
            }
        } else {
            io.to(roomCode).emit('receive-message', { sender: 'النظام', text: `❌ إجابة خاطئة من ${playerName}.` });
        }
    });

    // 5. الشات
    socket.on('send-message', ({ roomCode, sender, text }) => {
        io.to(roomCode).emit('receive-message', { sender, text });
    });

    // 6. الخروج من الغرفة بالضغط على زر "مغادرة"
    socket.on('leave-game', (roomCode) => {
        socket.leave(roomCode);
        const room = rooms[roomCode];
        if (room) {
            const index = room.players.findIndex(p => p.id === socket.id);
            if (index !== -1) {
                const playerName = room.players[index].name;
                room.players.splice(index, 1);
                io.to(roomCode).emit('update-players', room.players);
                io.to(roomCode).emit('receive-message', { sender: 'النظام', text: `🔴 غادر ${playerName} الغرفة.` });
                if (room.players.length === 0) delete rooms[roomCode];
            }
        }
    });

    // 7. الخروج عند إغلاق المتصفح
    socket.on('disconnect', () => {
        for (const roomCode in rooms) {
            const room = rooms[roomCode];
            const index = room.players.findIndex(p => p.id === socket.id);
            if (index !== -1) {
                const playerName = room.players[index].name;
                room.players.splice(index, 1);
                io.to(roomCode).emit('update-players', room.players);
                io.to(roomCode).emit('receive-message', { sender: 'النظام', text: `🔴 انقطع الاتصال عن ${playerName}.` });
                if (room.players.length === 0) delete rooms[roomCode];
                break;
            }
        }
    });
});

server.listen(3001, () => console.log('السيرفر يعمل الآن بالتزامن الكامل على 3001'));