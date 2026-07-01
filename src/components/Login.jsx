import React, { useState } from 'react';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // الدخول المؤقت لتشغيل الواجهة
    onLogin({ username: username || 'زائر', score: 0 });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] digital-grid">
      <form onSubmit={handleSubmit} className="bg-[#0F0F0F] border-2 border-[#FF2400] p-10 rounded shadow-[0_0_20px_rgba(255,36,0,0.3)] flex flex-col gap-6 w-96 text-center">
        <h2 className="text-3xl font-bold text-[#FF2400] tracking-widest">تسجيل الدخول</h2>
        <p className="text-gray-400 text-sm">أدخل اسمك للبدء</p>
        
        <input type="text" placeholder="اسم المستخدم" value={username} onChange={e => setUsername(e.target.value)} required
          className="bg-transparent border-b border-[#FF2400] text-white p-2 text-center focus:outline-none text-xl" />
          
        <input type="password" placeholder="كلمة المرور" value={password} onChange={e => setPassword(e.target.value)}
          className="bg-transparent border-b border-[#FF2400] text-white p-2 text-center focus:outline-none text-xl" />
          
        <button type="submit" className="mt-4 py-3 border border-[#FF2400] text-[#FF2400] hover:bg-[#FF2400] hover:text-black font-bold transition-colors text-lg">
          دخول
        </button>
      </form>
    </div>
  );
};

export default Login;