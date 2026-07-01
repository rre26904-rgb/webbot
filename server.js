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
    // 1. إنشاء غرفة جديدة (من الهوست)
    socket.on('create-room', ({ roomCode, name, gameId }) => {
        socket.join(roomCode);
        rooms[roomCode] = { players: [{ id: socket.id, name }], qIndex: 0, gameId: gameId };
        io.to(roomCode).emit('update-players', rooms[roomCode].players);
        io.to(roomCode).emit('receive-message', { sender: 'النظام', text: `👑 ${name} قام بإنشاء الغرفة!` });
    });

    // 2. الانضمام لغرفة موجودة
    socket.on('join-room', ({ roomCode, name }) => {
        if (rooms[roomCode]) {
            socket.join(roomCode);
            rooms[roomCode].players.push({ id: socket.id, name });
            
            // إرسال تفاصيل الغرفة للاعب الجديد ليعرف أي لعبة يفتح
            socket.emit('room-joined-success', { gameId: rooms[roomCode].gameId, qIndex: rooms[roomCode].qIndex });
            
            // تحديث القائمة وإرسال رسالة النظام للكل
            io.to(roomCode).emit('update-players', rooms[roomCode].players);
            io.to(roomCode).emit('receive-message', { sender: 'النظام', text: `🟢 انضم ${name} إلى الغرفة!` });
        } else {
            socket.emit('join-error', 'الغرفة غير موجودة أو تم إغلاقها!');
        }
    });

    // 3. التحقق من الإجابة
    socket.on('check-answer', ({ roomCode, answer, playerName, correctAns, totalQuestions }) => {
        const room = rooms[roomCode];
        if (!room) return;

        if (answer.trim() === correctAns) {
            io.to(roomCode).emit('receive-message', { sender: 'النظام', text: `🔥 ${playerName} أجاب بشكل صحيح!` });
            
            if (room.qIndex + 1 < totalQuestions) {
                room.qIndex++;
                io.to(roomCode).emit('correct-answer', { winnerName: playerName, nextIndex: room.qIndex });
            } else {
                io.to(roomCode).emit('game-won', playerName);
            }
        } else {
            io.to(roomCode).emit('receive-message', { sender: 'النظام', text: `❌ ${playerName} حاول إجابة خاطئة.` });
        }
    });

    // 4. الشات
    socket.on('send-message', ({ roomCode, sender, text }) => {
        io.to(roomCode).emit('receive-message', { sender, text });
    });

    // 5. المغادرة
    socket.on('disconnect', () => {
        for (const roomCode in rooms) {
            const playerIndex = rooms[roomCode].players.findIndex(p => p.id === socket.id);
            if (playerIndex !== -1) {
                const playerName = rooms[roomCode].players[playerIndex].name;
                rooms[roomCode].players.splice(playerIndex, 1);
                
                io.to(roomCode).emit('update-players', rooms[roomCode].players);
                io.to(roomCode).emit('receive-message', { sender: 'النظام', text: `🔴 غادر ${playerName} الغرفة.` });
                
                if (rooms[roomCode].players.length === 0) delete rooms[roomCode];
                break;
            }
        }
    });
});

server.listen(3001, () => console.log('السيرفر يعمل على 3001'));