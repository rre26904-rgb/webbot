const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const allGames = require('./gamesData');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let rooms = {};
let globalChatState = { isActive: false, answer: null };

function startManualGame(gameObj, roomId) {
    let item = gameObj.items[Math.floor(Math.random() * gameObj.items.length)];
    let { question, answer } = gameObj.generate(item);

    if (roomId === 'globalChat') {
        globalChatState = { isActive: true, answer: answer };
    } else if (rooms[roomId]) {
        rooms[roomId].fastGameState = { isActive: true, answer: answer };
    }
    io.to(roomId).emit('systemMessage', `🎮 لعبة (${gameObj.name}): ${question}`);
}

io.on('connection', (socket) => {
    // --- الشات العام ---
    socket.on('joinGlobal', () => socket.join('globalChat'));
    socket.on('sendGlobalMessage', ({ username, message }) => {
        let msg = message.trim();
        io.to('globalChat').emit('receiveGlobalMessage', { username, message: msg });
        if (msg.startsWith('-')) {
            let game = allGames.find(g => g.command === msg.substring(1));
            if (game) startManualGame(game, 'globalChat');
        } else if (globalChatState.isActive && msg === globalChatState.answer) {
            globalChatState.isActive = false;
            io.to('globalChat').emit('systemMessage', `🏆 فاز ${username}! الجواب: ${globalChatState.answer}`);
        }
    });

    // --- الرومات الخاصة ---
    socket.on('joinRoom', ({ username, roomId, requestedGameType }) => {
        if (!rooms[roomId]) {
            rooms[roomId] = { players: [], gameType: requestedGameType, host: socket.id, fastGameState: { isActive: false, answer: null } };
        }
        socket.join(roomId);
        rooms[roomId].players.push({ id: socket.id, name: username });
        socket.emit('roomJoined', { roomId, gameType: rooms[roomId].gameType });
        io.to(roomId).emit('updatePlayers', rooms[roomId].players);
        if (rooms[roomId].host === socket.id) socket.emit('isHost');
    });

    socket.on('startGame', ({ roomId }) => {
        let room = rooms[roomId];
        let game = allGames.find(g => g.command === room.gameType);
        if (game) startManualGame(game, roomId);
    });

    socket.on('sendPrivateMessage', ({ roomId, username, message }) => {
        let room = rooms[roomId];
        io.to(roomId).emit('receivePrivateMessage', { username, message });
        if (room && room.fastGameState.isActive && message.trim() === room.fastGameState.answer) {
            room.fastGameState.isActive = false;
            io.to(roomId).emit('privateSystemMessage', `🏆 ${username} فاز بالجولة!`);
        }
    });

    socket.on('leaveRoom', (roomId) => {
        let room = rooms[roomId];
        if (room) {
            let pIdx = room.players.findIndex(p => p.id === socket.id);
            if (pIdx !== -1) room.players.splice(pIdx, 1);
            socket.leave(roomId);
            io.to(roomId).emit('updatePlayers', room.players);
            if (room.players.length === 0) delete rooms[roomId];
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 السيرفر يعمل على بورت ${PORT}`));