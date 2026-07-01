const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" } // اسمح لأي دومين بالاتصال
});

// تخزين حالات الغرف
const rooms = {};

io.on('connection', (socket) => {
  console.log('لاعب جديد متصل:', socket.id);

  socket.on('join-room', ({ roomCode, name }) => {
    socket.join(roomCode);
    if (!rooms[roomCode]) rooms[roomCode] = { players: [], game: null };
    
    rooms[roomCode].players.push({ id: socket.id, name });
    
    // إرسال تحديث قائمة اللاعبين للجميع في نفس الغرفة
    io.to(roomCode).emit('update-players', rooms[roomCode].players);
  });

  socket.on('send-message', ({ roomCode, sender, text }) => {
    io.to(roomCode).emit('receive-message', { sender, text });
  });

  socket.on('disconnect', () => {
    console.log('لاعب غادر');
    // هنا يجب إضافة كود لإزالة اللاعب من الغرف
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`سيرفر الألعاب يعمل على بورت ${PORT}`));