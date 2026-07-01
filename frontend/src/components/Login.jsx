import React, { useState } from 'react';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:8000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (res.ok) {
      onLogin(data.user);
    } else {
      alert(data.detail);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]" 
         style={{ backgroundImage: 'linear-gradient(#1A1A1A 1px, transparent 1px), linear-gradient(90deg, #1A1A1A 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
      
      <form onSubmit={handleSubmit} className="bg-[#0F0F0F] border-2 border-[#FF2400] p-10 rounded shadow-[0_0_20px_rgba(255,36,0,0.3)] flex flex-col gap-6 w-96 text-center">
        <h2 className="text-3xl font-bold text-[#FF2400] tracking-widest">تسجيل الدخول</h2>
        <p className="text-gray-400 text-sm">إذا لم يكن لديك حساب، سيتم إنشاؤه تلقائياً</p>
        
        <input type="text" placeholder="اسم المستخدم" value={username} onChange={e => setUsername(e.target.value)} required
          className="bg-transparent border-b border-[#FF2400] text-white p-2 text-center focus:outline-none" />
          
        <input type="password" placeholder="كلمة المرور" value={password} onChange={e => setPassword(e.target.value)} required
          className="bg-transparent border-b border-[#FF2400] text-white p-2 text-center focus:outline-none" />
          
        <button type="submit" className="mt-4 py-2 border border-[#FF2400] text-[#FF2400] hover:bg-[#FF2400] hover:text-black font-bold transition-colors">
          دخول / تسجيل
        </button>
      </form>
    </div>
  );
};

export default Login;