import React, { useState } from 'react';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import GameRoom from './components/GameRoom';

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('login'); // login, admin, game

  if (!currentUser) {
    return <Login onLogin={(user) => { setCurrentUser(user); setCurrentView('game'); }} />;
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* شريط التنقل العلوي */}
      <nav className="p-4 border-b-2 border-[#FF2400] flex justify-between items-center bg-[#111]">
        <span className="text-[#FF2400] font-bold">اللاعب: {currentUser.username} | النقاط: {currentUser.score}</span>
        <div className="flex gap-4">
          <button onClick={() => setCurrentView('game')} className="text-white hover:text-[#FF2400]">اللعب</button>
          <button onClick={() => setCurrentView('admin')} className="text-white hover:text-[#FF2400]">لوحة التحكم</button>
          <button onClick={() => setCurrentUser(null)} className="text-gray-500">خروج</button>
        </div>
      </nav>

      {currentView === 'admin' ? <AdminPanel /> : <GameRoom />}
    </div>
  );
};

export default App;