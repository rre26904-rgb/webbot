import React, { useState, useEffect } from 'react';
import Login from './components/Login'; // استدعاء واجهة الدخول اللي صممناها
import GameRoom from './components/GameRoom';
import { gamesList } from './gamesData'; 
import io from 'socket.io-client';

const socket = io('https://webbot-90as.onrender.com');

const App = () => {
  const [currentView, setCurrentView] = useState('login');
  const [discordUser, setDiscordUser] = useState(null);
  const [roomInfo, setRoomInfo] = useState(null);
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');

  useEffect(() => {
    socket.on('room-joined-success', (data) => {
      setRoomInfo({ code: joinCode, gameId: data.gameId, isHost: false, startIndex: data.qIndex });
      setCurrentView('room');
      setJoinError('');
    });
    socket.on('join-error', (msg) => setJoinError(msg));
    
    return () => {
      socket.off('room-joined-success');
      socket.off('join-error');
    };
  }, [joinCode]);

  // استقبال البيانات (الاسم والصورة) من صفحة Login.jsx
  const handleLogin = (userData) => {
    setDiscordUser(userData);
    setCurrentView('lobby');
  };

  const createRoom = (gameId) => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setRoomInfo({ code, gameId, isHost: true, startIndex: 0 });
    socket.emit('create-room', { roomCode: code, name: discordUser.name, gameId });
    setCurrentView('room');
  };

  const joinRoom = (e) => {
    e.preventDefault();
    if (joinCode.trim()) {
      socket.emit('join-room', { roomCode: joinCode, name: discordUser.name });
    }
  };

  const leaveRoom = () => {
    setCurrentView('lobby');
    setRoomInfo(null);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#5865F2] selection:text-white" dir="rtl">
      
      {/* 1. شاشة تسجيل الدخول بواسطة Discord (المنفصلة) */}
      {currentView === 'login' && (
        <Login onLogin={handleLogin} />
      )}

      {/* 2. اللوبي (اختيار الألعاب) */}
      {currentView === 'lobby' && (
        <div className="p-8 max-w-7xl mx-auto animate-fade-in">
          <div className="flex justify-between items-center mb-12 bg-[#111] p-6 rounded-2xl border border-gray-800 shadow-lg">
            <div className="flex items-center gap-4">
              {/* عرض الصورة والاسم المسحوبة من الديسكورد */}
              <img src={discordUser?.avatar} alt="avatar" className="w-14 h-14 rounded-full border-2 border-[#5865F2]" />
              <div>
                <h2 className="text-2xl font-black text-white">{discordUser?.name}</h2>
                <p className="text-[#5865F2] font-bold text-sm border border-[#5865F2]/30 bg-[#5865F2]/10 inline-block px-2 rounded mt-1">متصل الآن</p>
              </div>
            </div>
            
            <form onSubmit={joinRoom} className="flex gap-2 relative">
              <input 
                value={joinCode} 
                onChange={(e) => setJoinCode(e.target.value)} 
                className="bg-black border border-gray-700 text-white px-4 py-3 rounded-lg outline-none focus:border-[#FF2400] text-center w-32 font-black tracking-widest" 
                placeholder="كود الغرفة" 
                dir="ltr"
              />
              <button type="submit" className="bg-[#FF2400] text-black px-6 rounded-lg font-black hover:bg-white transition-all active:scale-95">انضمام</button>
              
              {/* رسالة الخطأ إذا الكود غلط */}
              {joinError && (
                <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-2 rounded-full font-bold animate-bounce whitespace-nowrap shadow-lg">
                  {joinError}
                </div>
              )}
            </form>
          </div>

          <h1 className="text-4xl font-black mb-8 text-[#FF2400] flex items-center gap-3">
            <span className="w-2 h-10 bg-[#FF2400] rounded-full inline-block"></span>
            اختر لعبة للبدء
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {gamesList.map((game) => (
              <div key={game.id} className="bg-[#111] border border-gray-800 rounded-2xl p-6 hover:border-[#FF2400] hover:-translate-y-2 transition-all cursor-pointer group shadow-xl flex flex-col">
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">{game.icon}</div>
                <h3 className="text-2xl font-black text-white mb-2">{game.title}</h3>
                <p className="text-gray-400 text-sm mb-6 flex-1">{game.description}</p>
                <button onClick={() => createRoom(game.id)} className="w-full py-3 bg-gray-800 group-hover:bg-[#FF2400] group-hover:text-black text-white rounded-xl font-black transition-all mt-auto active:scale-95">
                  إنشاء غرفة
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. غرفة اللعب */}
      {currentView === 'room' && (
        <GameRoom roomInfo={roomInfo} playerName={discordUser?.name} onLeave={leaveRoom} socket={socket} />
      )}
    </div>
  );
};

export default App;