import React, { useState } from 'react';

const Login = ({ onLogin }) => {
  const [discordName, setDiscordName] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [avatar, setAvatar] = useState('');
  const [isHovered, setIsHovered] = useState(false);

  // دالة محاكاة الاتصال بديسكورد وجلب البيانات
  const handleDiscordConnect = (e) => {
    e.preventDefault();
    if (discordName.trim()) {
      // محاكاة جلب صورة ديسكورد (صورة عشوائية من ديسكورد للمحاكاة)
      const randomAvatarNum = Math.floor(Math.random() * 5); 
      setAvatar(`https://cdn.discordapp.com/embed/avatars/${randomAvatarNum}.png`);
      
      // تحويل الواجهة لحالة "متصل"
      setIsConnected(true);
    }
  };

  // الدخول الفعلي للوبي بعد ظهور الصورة
  const handleFinalLogin = () => {
    // نرسل الاسم والصورة لملف App.jsx
    onLogin({ name: discordName, avatar: avatar });
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#050505] overflow-hidden"
         style={{ backgroundImage: 'linear-gradient(#111 1px, transparent 1px), linear-gradient(90deg, #111 1px, transparent 1px)', backgroundSize: '40px 40px' }} dir="rtl">
      
      {/* إضاءة خلفية (تتغير من أحمر إلى لون ديسكورد إذا تم الربط) */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] ${isConnected ? 'bg-[#5865F2]' : 'bg-[#FF2400]'} opacity-10 rounded-full blur-[120px] pointer-events-none transition-colors duration-1000`}></div>

      {/* صندوق تسجيل الدخول */}
      <div className={`relative z-10 bg-[#0A0A0A]/90 backdrop-blur-xl border ${isConnected ? 'border-[#5865F2]/50 shadow-[0_0_50px_rgba(88,101,242,0.15)]' : 'border-gray-800 shadow-[0_0_40px_rgba(255,36,0,0.1)] hover:shadow-[0_0_60px_rgba(255,36,0,0.2)] hover:border-[#FF2400]/50'} p-10 md:p-12 rounded-3xl transition-all duration-500 w-full max-w-lg flex flex-col gap-6`}>
        
        {!isConnected ? (
          /* =========================================
             الخطوة الأولى: نموذج إدخال بيانات ديسكورد
             ========================================= */
          <form onSubmit={handleDiscordConnect} className="flex flex-col gap-6 animate-fade-in">
            {/* الشعار */}
            <div className="text-center mb-4">
              <div className="flex items-center justify-center gap-3 mb-2">
                <svg className="w-10 h-10 text-[#5865F2] drop-shadow-[0_0_10px_rgba(88,101,242,0.5)]" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                </svg>
                <h1 className="text-4xl font-black text-white tracking-widest">
                  DISCORD <span className="text-[#5865F2]">LOGIN</span>
                </h1>
              </div>
              <p className="text-gray-500 text-sm tracking-wider font-bold mt-2">اربط حسابك لسحب بياناتك وصورتك</p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-gray-400 text-sm font-bold px-1">اسم المستخدم (Discord Username)</label>
              <input 
                type="text" 
                value={discordName}
                onChange={(e) => setDiscordName(e.target.value)}
                required
                placeholder="مثال: Raed#1234"
                className="w-full bg-[#111] border-2 border-gray-800 text-white px-5 py-4 rounded-xl outline-none focus:border-[#5865F2] focus:shadow-[0_0_20px_rgba(88,101,242,0.2)] transition-all text-left text-lg placeholder-gray-700"
                dir="ltr"
              />
            </div>

            <button 
              type="submit"
              className="mt-4 w-full py-5 bg-[#5865F2] hover:bg-[#4752C4] text-white font-black text-xl rounded-xl overflow-hidden active:scale-95 transition-all duration-200 shadow-[0_5px_0_#3c45a5] hover:shadow-[0_2px_0_#3c45a5] hover:translate-y-1"
            >
              جلب البيانات والربط
            </button>
          </form>
        ) : (
          /* =========================================
             الخطوة الثانية: عرض الصورة والبيانات
             ========================================= */
          <div className="flex flex-col items-center gap-6 animate-fade-in py-4">
            
            <div className="text-center">
              <span className="bg-[#5865F2]/20 text-[#5865F2] border border-[#5865F2]/50 px-4 py-1 rounded-full text-sm font-bold tracking-wider">
                تم الربط بنجاح ✓
              </span>
            </div>

            {/* الصورة الشخصية مع أنميشن */}
            <div className="relative group mt-4">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#5865F2] to-[#FF2400] rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
              <img 
                src={avatar} 
                alt="Discord Avatar" 
                className="relative w-32 h-32 rounded-full border-4 border-[#111] object-cover shadow-2xl"
              />
              {/* أيقونة الأونلاين الخضراء */}
              <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-4 border-[#111] rounded-full"></div>
            </div>

            {/* اسم اللاعب */}
            <div className="text-center">
              <h2 className="text-3xl font-black text-white">{discordName}</h2>
              <p className="text-gray-400 mt-1 font-medium">جاهز للانطلاق؟</p>
            </div>

            {/* زر الدخول للوبي (أحمر) */}
            <button 
              onClick={handleFinalLogin}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="relative mt-6 w-full py-5 bg-transparent border-2 border-[#FF2400] text-[#FF2400] font-black text-xl rounded-xl overflow-hidden group active:scale-95 transition-all duration-200"
            >
              <div className={`absolute top-0 right-0 h-full bg-[#FF2400] transition-all duration-300 ease-out z-0 ${isHovered ? 'w-full' : 'w-0'}`}></div>
              <span className={`relative z-10 transition-colors duration-300 tracking-wider flex items-center justify-center gap-2 ${isHovered ? 'text-black' : 'text-[#FF2400]'}`}>
                الدخول إلى اللوبي <i className="fa-solid fa-arrow-left"></i>
              </span>
            </button>
            
            {/* زر إلغاء الربط (للرجوع) */}
            <button 
              onClick={() => setIsConnected(false)}
              className="text-gray-500 hover:text-white text-sm font-bold underline decoration-gray-700 hover:decoration-white underline-offset-4 transition-colors"
            >
              استخدام حساب آخر؟
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Login;