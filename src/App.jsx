import React, { useState } from 'react';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import GameRoom from './components/GameRoom';

const GAME_CATEGORIES = [
  { id: 'fakkek', title: 'فكك الكلمة', code: 'F-01' },
  { id: 'horoof', title: 'تجميع الحروف', code: 'H-02' },
  { id: 'correct', title: 'صحح الخطأ', code: 'C-03' },
  { id: 'grammar', title: 'مفرد وجمع', code: 'G-04' },
  { id: 'capitals', title: 'عواصم ودول', code: 'W-05' },
  { id: 'flags', title: 'تحدي الأعلام', code: 'F-06' },
];

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard'); // dashboard, admin
  const [selectedCategory, setSelectedCategory] = useState(GAME_CATEGORIES[0]);

  if (!currentUser) {
    return <Login onLogin={(user) => { setCurrentUser(user); setCurrentView('dashboard'); }} />;
  }

  return (
    <div className="h-screen w-screen bg-[#050505] text-white font-mono overflow-hidden flex flex-col digital-grid">
      
      {/* الشريط العلوي (الرأسيات الرقمية) */}
      <header className="h-16 border-b-2 border-[#FF2400] bg-black flex justify-between items-center px-6 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-4 h-4 bg-[#FF2400] animate-pulse"></div>
          <h1 className="text-2xl font-bold tracking-[0.2em] text-[#FF2400]">SYSTEM_CORE</h1>
        </div>
        
        <div className="flex gap-8 text-sm">
          <div className="flex flex-col items-center">
            <span className="text-gray-500 text-xs">USER</span>
            <span className="text-white font-bold">{currentUser.username}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-gray-500 text-xs">SCORE</span>
            <span className="text-[#FF2400] font-bold">{currentUser.score}</span>
          </div>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={() => setCurrentView('dashboard')} 
            className={`px-4 py-1 border ${currentView === 'dashboard' ? 'border-[#FF2400] bg-[#FF2400] text-black' : 'border-gray-700 text-gray-400 hover:border-[#FF2400] hover:text-[#FF2400]'} transition-colors`}
          >
            TERMINAL
          </button>
          <button 
            onClick={() => setCurrentView('admin')} 
            className={`px-4 py-1 border ${currentView === 'admin' ? 'border-[#FF2400] bg-[#FF2400] text-black' : 'border-gray-700 text-gray-400 hover:border-[#FF2400] hover:text-[#FF2400]'} transition-colors`}
          >
            ADMIN
          </button>
          <button 
            onClick={() => setCurrentUser(null)} 
            className="px-4 py-1 border border-red-900 text-red-500 hover:bg-red-900 hover:text-white transition-colors"
          >
            EXIT
          </button>
        </div>
      </header>

      {/* منطقة العمل السفلية */}
      <main className="flex-1 flex overflow-hidden">
        
        {currentView === 'admin' ? (
          <div className="flex-1 overflow-y-auto w-full"><AdminPanel /></div>
        ) : (
          <>
            {/* الشريط الجانبي الأيسر: قائمة الألعاب كمربعات نظام */}
            <aside className="w-72 border-r-2 border-[#FF2400] bg-[#0A0A0A] p-4 flex flex-col gap-4 overflow-y-auto shrink-0 z-10 shadow-[5px_0_15px_rgba(255,36,0,0.1)]">
              <div className="text-gray-500 text-xs mb-2 tracking-widest border-b border-gray-800 pb-2">SELECT_MODULE</div>
              
              {GAME_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat)}
                  className={`relative w-full p-4 border text-right flex justify-between items-center transition-all duration-200 group
                    ${selectedCategory?.id === cat.id 
                      ? 'border-[#FF2400] bg-[#1a0505] shadow-[inset_0_0_15px_rgba(255,36,0,0.4)]' 
                      : 'border-gray-800 hover:border-gray-400 hover:bg-[#111]'}`}
                >
                  {/* المربع الصغير بجانب الاسم */}
                  <span className={`w-3 h-3 block ${selectedCategory?.id === cat.id ? 'bg-[#FF2400]' : 'bg-gray-700 group-hover:bg-gray-400'}`}></span>
                  
                  <div className="flex flex-col items-end">
                    <span className={`text-sm ${selectedCategory?.id === cat.id ? 'text-[#FF2400] font-bold' : 'text-gray-400 group-hover:text-white'}`}>
                      {cat.title}
                    </span>
                    <span className="text-gray-600 text-[10px] tracking-widest">{cat.code}</span>
                  </div>
                </button>
              ))}
            </aside>

            {/* منطقة اللعب المركزية */}
            <section className="flex-1 bg-transparent relative overflow-hidden flex flex-col">
              {/* خلفية جمالية لتأثير التيرمينال */}
              <div className="absolute top-4 left-4 text-gray-800 text-xs opacity-50 pointer-events-none select-none">
                INITIATING MODULE: {selectedCategory?.code} <br/>
                AWAITING USER INPUT...
              </div>

              {/* استدعاء غرفة اللعب */}
              <div className="flex-1 overflow-y-auto w-full">
                {selectedCategory ? (
                  <GameRoom category={selectedCategory} />
                ) : (
                  <div className="h-full flex items-center justify-center text-[#FF2400] text-2xl animate-pulse">
                    يرجى تحديد وحدة اللعب من القائمة
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default App;