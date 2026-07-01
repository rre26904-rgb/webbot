import React, { useState } from 'react';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // حالة إظهار/إخفاء كلمة المرور
  const [showPassword, setShowPassword] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim() && password.trim()) {
      // في المستقبل هنا يتم ربط الداتا بالسيرفر
      onLogin(username);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    alert("سيتم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني قريباً.");
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#050505] overflow-hidden"
         style={{ backgroundImage: 'linear-gradient(#111 1px, transparent 1px), linear-gradient(90deg, #111 1px, transparent 1px)', backgroundSize: '40px 40px' }} dir="rtl">
      
      {/* إضاءة خلفية حمراء ضخمة (تأثير بصري) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FF2400] opacity-10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* صندوق تسجيل الدخول الاحترافي */}
      <form 
        onSubmit={handleSubmit} 
        className="relative z-10 bg-[#0A0A0A]/90 backdrop-blur-xl border border-gray-800 p-10 md:p-12 rounded-3xl shadow-[0_0_40px_rgba(255,36,0,0.1)] hover:shadow-[0_0_60px_rgba(255,36,0,0.2)] hover:border-[#FF2400]/50 transition-all duration-500 w-full max-w-lg flex flex-col gap-6"
      >
        
        {/* الشعار */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-4 h-4 bg-[#FF2400] rounded-sm animate-pulse shadow-[0_0_15px_#FF2400]"></div>
            <h1 className="text-4xl font-black text-white tracking-widest">
              DIGITAL<span className="text-[#FF2400]">GAMES</span>
            </h1>
          </div>
          <p className="text-gray-500 text-sm tracking-wider font-bold">بوابة الدخول الآمنة للنظام</p>
        </div>

        {/* حقل الإيميل */}
        <div className="flex flex-col gap-2">
          <label className="text-gray-400 text-sm font-bold px-1">البريد الإلكتروني</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="example@domain.com"
            className="w-full bg-[#111] border-2 border-gray-800 text-white px-5 py-4 rounded-xl outline-none focus:border-[#FF2400] focus:shadow-[0_0_20px_rgba(255,36,0,0.2)] transition-all text-left text-lg placeholder-gray-700"
            dir="ltr"
          />
        </div>

        {/* حقل اسم اللاعب */}
        <div className="flex flex-col gap-2">
          <label className="text-gray-400 text-sm font-bold px-1">اسم اللاعب (Username)</label>
          <input 
            type="text" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="أدخل اسمك داخل اللعبة"
            className="w-full bg-[#111] border-2 border-gray-800 text-white px-5 py-4 rounded-xl outline-none focus:border-[#FF2400] focus:shadow-[0_0_20px_rgba(255,36,0,0.2)] transition-all text-lg placeholder-gray-700"
          />
        </div>

        {/* حقل كلمة المرور مع زر الإظهار */}
        <div className="flex flex-col gap-2">
          <label className="text-gray-400 text-sm font-bold px-1">كلمة المرور</label>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••••••"
              className="w-full bg-[#111] border-2 border-gray-800 text-white px-5 py-4 pl-14 rounded-xl outline-none focus:border-[#FF2400] focus:shadow-[0_0_20px_rgba(255,36,0,0.2)] transition-all text-left text-lg placeholder-gray-700"
              dir="ltr"
            />
            
            {/* زر رؤية كلمة المرور (أيقونة عين) */}
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#FF2400] transition-colors p-1"
            >
              {showPassword ? (
                // أيقونة إخفاء
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              ) : (
                // أيقونة إظهار
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* زر نسيان كلمة المرور */}
        <div className="flex justify-start">
          <button 
            onClick={handleForgotPassword}
            className="text-gray-500 hover:text-[#FF2400] text-sm font-bold transition-colors underline decoration-gray-700 hover:decoration-[#FF2400] underline-offset-4"
          >
            نسيت كلمة المرور؟
          </button>
        </div>

        {/* زر الدخول التفاعلي */}
        <button 
          type="submit"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative mt-4 w-full py-5 bg-transparent border-2 border-[#FF2400] text-[#FF2400] font-black text-xl rounded-xl overflow-hidden group active:scale-95 transition-all duration-200"
        >
          {/* تأثير التعبئة عند التمرير */}
          <div className={`absolute top-0 right-0 h-full bg-[#FF2400] transition-all duration-300 ease-out z-0 ${isHovered ? 'w-full' : 'w-0'}`}></div>
          <span className={`relative z-10 transition-colors duration-300 tracking-wider ${isHovered ? 'text-black' : 'text-[#FF2400]'}`}>
            تأكيد الدخول
          </span>
        </button>

      </form>
    </div>
  );
};

export default Login;