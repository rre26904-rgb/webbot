import React, { useState, useEffect } from 'react';
import { gamesList } from './gamesData'; 
import GameRoom from './components/GameRoom';
import Login from './components/Login';

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('lobby'); 
  const [roomInfo, setRoomInfo] = useState(null);
  const [joinCode, setJoinCode] = useState('');

  useEffect(() => {
    const savedUser = localStorage.getItem('digital_games_player');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
  }, []);

  const handleLogin = (username) => {
    const newUser = { username: username, score: 0 };
    setCurrentUser(newUser);
    localStorage.setItem('digital_games_player', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('digital_games_player');
    setCurrentView('lobby');
  };

  const handleCreateRoom = (game) => {
    const randomHostCode = Math.floor(1000 + Math.random() * 9000); 
    setRoomInfo({ code: randomHostCode, game: game, isHost: true });
    setCurrentView('room');
  };

  // إصلاح زر الانضمام وتفعيله
  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!joinCode.trim()) {
      alert("الرجاء كتابة رمز الغرفة!");
      return;
    }
    // في الوضع الفعلي، هنا السيرفر يعطينا اللعبة.. حالياً بنسحب لعبة افتراضية عشان ما يعلق
    const fallbackGame = gamesList[0]; 
    setRoomInfo({ code: joinCode, game: fallbackGame, isHost: false });
    setCurrentView('room');
  };

  if (!currentUser) return <Login onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-mono selection:bg-[#FF2400] selection:text-white"
         style={{ backgroundImage: 'linear-gradient(#111 1px, transparent 1px), linear-gradient(90deg, #111 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      
      {/* النافبار الزجاجي */}
      <header className="sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-[#FF2400]/50 shadow-[0_4px_30px_rgba(255,36,0,0.1)] p-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => {setCurrentView('lobby'); setRoomInfo(null);}}>
            <div className="w-3 h-3 bg-[#FF2400] rounded-full animate-pulse shadow-[0_0_15px_#FF2400]"></div>
            <h1 className="text-3xl font-black text-white tracking-widest group-hover:drop-shadow-[0_0_10px_rgba(255,36,0,0.8)] transition-all">
              DIGITAL<span className="text-[#FF2400]">GAMES</span>
            </h1>
          </div>

          <div className="flex items-center gap-6 bg-[#0A0A0A] p-2 rounded-xl border border-gray-800 shadow-inner">
            <div className="flex items-center gap-2 px-4 border-r border-gray-800">
              <span className="text-[#FF2400] font-bold">👤</span>
              <span className="text-white font-bold text-lg">{currentUser.username}</span>
            </div>
            {/* فورم الانضمام مفعل */}
            <form onSubmit={handleJoinRoom} className="flex items-center gap-2 px-2">
              <input type="text" placeholder="رمز الغرفة" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} className="bg-transparent text-white px-2 py-1 outline-none w-28 text-center tracking-widest placeholder-gray-700" />
              <button type="submit" className="bg-[#FF2400] text-black font-black px-4 py-1.5 rounded-lg active:scale-95 hover:bg-white transition-all">انضمام</button>
            </form>
            <button onClick={handleLogout} className="px-4 text-gray-500 hover:text-red-500 font-bold transition-colors">خروج</button>
          </div>
        </div>
      </header>

      {/* اللوبي والألعاب */}
      <main className="max-w-7xl mx-auto p-8">
        {currentView === 'lobby' && (
          <div className="animate-fade-in mt-8">
            <div className="mb-12 text-center">
              <h2 className="text-4xl font-black text-white mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">حدد <span className="text-[#FF2400]">البروتوكول</span></h2>
              <p className="text-gray-500 text-lg">اختر اللعبة لإنشاء غرفة وبدء التحدي الفوري</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {gamesList.map((game) => (
                <div key={game.id} className="relative bg-[#0A0A0A]/50 backdrop-blur-sm border border-gray-800 p-8 rounded-2xl transition-all duration-500 hover:border-[#FF2400] hover:shadow-[0_10px_40px_rgba(255,36,0,0.15)] hover:-translate-y-2 group overflow-hidden flex flex-col justify-between h-full">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#FF2400]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                  
                  <div className="relative z-10">
                    <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform duration-500">{game.icon}</div>
                    <h3 className="text-2xl font-black text-white mb-3 group-hover:text-[#FF2400] transition-colors">{game.title}</h3>
                    <p className="text-gray-400 font-medium leading-relaxed mb-8">{game.description}</p>
                  </div>
                  
                  <button onClick={() => handleCreateRoom(game)} className="relative z-10 w-full py-4 border-2 border-[#FF2400]/30 text-[#FF2400] font-black rounded-xl active:scale-95 group-hover:border-[#FF2400] group-hover:bg-[#FF2400] group-hover:text-black transition-all duration-300 text-lg">
                    إنشاء الغرفة 🚀
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