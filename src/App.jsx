import React, { useState, useEffect } from 'react';
import { gamesList } from './gamesData'; 
import GameRoom from './components/GameRoom';
import Login from './components/Login';

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('lobby'); 
  const [roomInfo, setRoomInfo] = useState(null);
  const [joinCode, setJoinCode] = useState('');

  // 1. نظام الحفظ: التحقق من وجود لاعب مسجل عند فتح الموقع
  useEffect(() => {
    const savedUser = localStorage.getItem('digital_games_player');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  // 2. دالة تسجيل الدخول وحفظ البيانات في المتصفح
  const handleLogin = (username) => {
    const newUser = { username: username, score: 0 };
    setCurrentUser(newUser);
    localStorage.setItem('digital_games_player', JSON.stringify(newUser));
  };

  // 3. دالة تسجيل الخروج ومسح البيانات
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('digital_games_player');
    setCurrentView('lobby');
    setRoomInfo(null);
  };

  const handleCreateRoom = (game) => {
    const randomHostCode = Math.floor(1000 + Math.random() * 9000); 
    setRoomInfo({ code: randomHostCode, game: game, isHost: true });
    setCurrentView('room');
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!joinCode.trim()) {
      alert("الرجاء كتابة رمز الغرفة!");
      return;
    }
    setRoomInfo({ code: joinCode, game: { title: 'مباراة خاصة' }, isHost: false });
    setCurrentView('room');
  };

  // إذا لم يكن هناك لاعب مسجل، اعرض شاشة الدخول المستقلة
  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  // إذا كان مسجلاً، اعرض الموقع الرئيسي (النافبار + اللوبي)
  return (
    <div className="min-h-screen bg-[#050505] text-white font-mono"
         style={{ backgroundImage: 'linear-gradient(#111 1px, transparent 1px), linear-gradient(90deg, #111 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      
      {/* النافبار العلوي (يظهر فقط بعد تسجيل الدخول) */}
      <header className="sticky top-0 z-50 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-[#FF2400] shadow-[0_5px_20px_rgba(255,36,0,0.15)] p-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => {setCurrentView('lobby'); setRoomInfo(null);}}>
            <div className="w-3 h-3 bg-[#FF2400] rounded-full animate-pulse shadow-[0_0_10px_#FF2400]"></div>
            <h1 className="text-2xl font-bold text-white tracking-widest">
              DIGITAL<span className="text-[#FF2400]">GAMES</span>
            </h1>
          </div>

          <div className="flex items-center gap-6">
            {/* عرض بيانات اللاعب المحفوظة */}
            <div className="flex items-center gap-3 border-r border-gray-700 pr-6">
              <span className="text-gray-400">اللاعب:</span>
              <span className="text-white font-bold text-lg">{currentUser.username}</span>
            </div>

            {/* الانضمام السريع لغرفة */}
            <form onSubmit={handleJoinRoom} className="flex gap-2 bg-[#111] border border-gray-700 rounded p-1 focus-within:border-[#FF2400] transition-all">
              <input 
                type="text" 
                placeholder="رمز الغرفة" 
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                className="bg-transparent text-white px-3 py-1 outline-none w-32 text-center placeholder-gray-600 tracking-widest"
              />
              <button type="submit" className="bg-[#FF2400] text-black font-bold px-4 py-1 rounded hover:bg-white transition-colors cursor-pointer">
                انضمام
              </button>
            </form>

            {/* زر تسجيل الخروج */}
            <button onClick={handleLogout} className="text-gray-500 hover:text-red-500 transition-colors text-sm">
              تسجيل الخروج
            </button>
          </div>
        </div>
      </header>

      {/* منطقة العرض الرئيسية (اللوبي أو الغرفة) */}
      <main className="max-w-7xl mx-auto p-8">
        {currentView === 'lobby' && (
          <div className="animate-fade-in">
            <div className="mb-10 text-center md:text-right">
              <h2 className="text-3xl font-bold text-white mb-2 border-r-4 border-[#FF2400] pr-4">صالة الألعاب الرئيسية</h2>
              <p className="text-gray-500 pr-5">اختر اللعبة المناسبة لتوليد كود هوست ودعوة أصدقائك</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gamesList.map((game) => (
                <div key={game.id} className="bg-[#0A0A0A] border border-gray-800 p-6 rounded-lg transition-all duration-300 hover:border-[#FF2400] hover:shadow-[0_0_20px_rgba(255,36,0,0.2)] hover:-translate-y-1 group flex flex-col justify-between h-full">
                  <div>
                    <div className="text-4xl mb-4 opacity-80 group-hover:opacity-100 transition-opacity">{game.icon}</div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#FF2400] transition-colors">{game.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-6">{game.description}</p>
                  </div>
                  <button onClick={() => handleCreateRoom(game)} className="w-full py-3 border-2 border-gray-700 text-gray-300 font-bold rounded group-hover:border-[#FF2400] group-hover:bg-[#FF2400] group-hover:text-black transition-all">
                    إنشاء غرفة و بدأ اللعب
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentView === 'room' && (
          <GameRoom roomInfo={roomInfo} playerName={currentUser.username} onLeave={() => { setCurrentView('lobby'); setRoomInfo(null); setJoinCode(''); }} />
        )}
      </main>
    </div>
  );
};

export default App;