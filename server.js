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

io.on('connection', (socket) => {
    console.log('لاعب جديد:', socket.id);

    socket.on('join-room', ({ roomCode, name, gameQuestions }) => {
        socket.join(roomCode);
        if (!rooms[roomCode]) {
            rooms[roomCode] = { players: [], qIndex: 0, questions: gameQuestions };
        }
        rooms[roomCode].players.push({ id: socket.id, name });
        
        io.to(roomCode).emit('update-players', rooms[roomCode].players);
        io.to(roomCode).emit('receive-message', { sender: 'النظام', text: `${name} انضم للغرفة!` });
    });

    socket.on('check-answer', ({ roomCode, answer, playerName }) => {
        const room = rooms[roomCode];
        if (!room) return;

        if (answer.trim() === room.questions[room.qIndex].correct) {
            if (room.qIndex + 1 < room.questions.length) {
                room.qIndex++;
                io.to(roomCode).emit('correct-answer', { winnerName: playerName, nextIndex: room.qIndex });
            } else {
                io.to(roomCode).emit('game-won', playerName);
            }
        } else {
            io.to(roomCode).emit('receive-message', { sender: 'النظام', text: `${playerName} حاول إجابة خاطئة.` });
        }
    });

    socket.on('send-message', ({ roomCode, sender, text }) => {
        io.to(roomCode).emit('receive-message', { sender, text });
    });

    socket.on('disconnect', () => {
        for (const roomCode in rooms) {
            rooms[roomCode].players = rooms[roomCode].players.filter(p => p.id !== socket.id);
            io.to(roomCode).emit('update-players', rooms[roomCode].players);
        }
    });
});

server.listen(3001, () => console.log('السيرفر يعمل على بورت 3001'));