import React, { useState } from 'react';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [isHovered, setIsHovered] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      // إرسال البيانات للتطبيق لحفظها
      onLogin(username);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#050505] overflow-hidden"
         style={{ backgroundImage: 'linear-gradient(#111 1px, transparent 1px), linear-gradient(90deg, #111 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      
      {/* إضاءة خلفية حمراء ضخمة (تأثير بصري) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FF2400] opacity-10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* صندوق تسجيل الدخول */}
      <form 
        onSubmit={handleSubmit} 
        className="relative z-10 bg-[#0A0A0A]/90 backdrop-blur-xl border border-gray-800 p-12 rounded-2xl shadow-[0_0_40px_rgba(255,36,0,0.1)] hover:shadow-[0_0_60px_rgba(255,36,0,0.2)] hover:border-[#FF2400]/50 transition-all duration-500 w-full max-w-md flex flex-col gap-8 text-center"
      >
        
        {/* الشعار */}
        <div>
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-4 h-4 bg-[#FF2400] rounded-sm animate-pulse shadow-[0_0_15px_#FF2400]"></div>
            <h1 className="text-4xl font-bold text-white tracking-widest">
              DIGITAL<span className="text-[#FF2400]">GAMES</span>
            </h1>
          </div>
          <p className="text-gray-500 text-sm tracking-wider">SYSTEM AUTHENTICATION</p>
        </div>

        {/* حقل إدخال الاسم */}
        <div className="relative">
          <input 
            type="text" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="أدخل اسم اللاعب (Username)"
            className="w-full bg-[#111] border-2 border-gray-800 text-white px-6 py-4 rounded-lg outline-none focus:border-[#FF2400] focus:shadow-[0_0_20px_rgba(255,36,0,0.3)] transition-all text-center text-xl placeholder-gray-600"
          />
        </div>

        {/* زر الدخول التفاعلي */}
        <button 
          type="submit"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative w-full py-4 bg-transparent border-2 border-[#FF2400] text-[#FF2400] font-bold text-xl rounded-lg overflow-hidden group transition-all"
        >
          {/* تأثير التعبئة عند التمرير */}
          <div className={`absolute top-0 left-0 h-full bg-[#FF2400] transition-all duration-300 ease-out z-0 ${isHovered ? 'w-full' : 'w-0'}`}></div>
          <span className={`relative z-10 transition-colors duration-300 ${isHovered ? 'text-black' : 'text-[#FF2400]'}`}>
            ACCESS SYSTEM / دخول
          </span>
        </button>

      </form>
    </div>
  );
};

export default Login;