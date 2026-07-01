import React, { useState } from 'react';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import GameRoom from './components/GameRoom';

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('login'); // login, admin, game

  // دالة للتعامل مع تسجيل الدخول بنجاح
  const handleLogin = (user) => {
    setCurrentUser(user);
    setCurrentView('game');
  };

  // دالة لتسجيل الخروج
  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('login');
  };

  // إذا لم يكن المستخدم مسجلاً، اعرض شاشة الدخول
  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  // الواجهة الرئيسية بعد تسجيل الدخول
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-mono">
      {/* شريط التنقل العلوي (الناڤبار) */}
      <nav className="p-4 border-b-2 border-[#FF2400] flex justify-between items-center bg-[#111] shadow-[0_0_15px_rgba(255,36,0,0.3)]">
        <div className="text-[#FF2400] font-bold text-lg tracking-wider">
          اللاعب: {currentUser.username} | النقاط: {currentUser.score}
        </div>
        <div className="flex gap-6">
          <button 
            onClick={() => setCurrentView('game')} 
            className={`text-lg transition-colors ${currentView === 'game' ? 'text-[#FF2400] border-b border-[#FF2400]' : 'text-gray-400 hover:text-white'}`}
          >
            اللعب
          </button>
          <button 
            onClick={() => setCurrentView('admin')} 
            className={`text-lg transition-colors ${currentView === 'admin' ? 'text-[#FF2400] border-b border-[#FF2400]' : 'text-gray-400 hover:text-white'}`}
          >
            لوحة التحكم
          </button>
          <button 
            onClick={handleLogout} 
            className="text-gray-500 hover:text-red-700 transition-colors"
          >
            خروج
          </button>
        </div>
      </nav>

      {/* عرض الصفحة بناءً على اختيار المستخدم */}
      <main>
        {currentView === 'admin' ? <AdminPanel /> : <GameRoom />}
      </main>
    </div>
  );
};

export default App;