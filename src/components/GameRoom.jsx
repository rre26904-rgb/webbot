import React, { useState } from 'react';

const GameRoom = ({ roomInfo, playerName, onLeave }) => {
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'النظام', text: `تم إنشاء الغرفة بنجاح. شارك الرمز [ ${roomInfo.code} ] مع أصدقائك.` }
  ]);

  const sendMsg = (e) => {
    e.preventDefault();
    if (chatInput.trim()) {
      setMessages([...messages, { sender: playerName, text: chatInput }]);
      setChatInput('');
    }
  };

  return (
    <div className="animate-fade-in flex flex-col lg:flex-row gap-6 h-[80vh]">
      
      {/* منطقة اللعب */}
      <div className="flex-1 bg-[#0A0A0A] border border-[#FF2400] rounded-lg p-6 shadow-[0_0_30px_rgba(255,36,0,0.1)] flex flex-col relative overflow-hidden">
        
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FF2400] to-transparent opacity-50"></div>
        
        <div className="flex justify-between items-start mb-8 border-b border-gray-800 pb-4">
          <div>
            <h2 className="text-3xl font-bold text-[#FF2400] mb-2">{roomInfo.game.title}</h2>
            <p className="text-gray-500">اللاعب الحالي: <span className="text-white">{playerName}</span></p>
          </div>
          
          <div className="flex gap-4 items-center">
            <div className="bg-[#111] border-2 border-[#FF2400] px-6 py-2 rounded text-[#FF2400] font-bold text-xl shadow-[0_0_15px_rgba(255,36,0,0.3)]">
              HOST: #{roomInfo.code}
            </div>
            <button onClick={onLeave} className="px-4 py-2 bg-red-900/50 text-red-400 hover:bg-red-600 hover:text-white rounded transition-colors">
              مغادرة
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-24 h-24 border-4 border-[#FF2400] border-t-transparent rounded-full animate-spin mb-6"></div>
          <p className="text-2xl text-white tracking-wider">في انتظار انضمام اللاعبين...</p>
          <p className="text-gray-500 mt-2">شارك الكود في الأعلى ليدخلوا الغرفة</p>
        </div>
      </div>

      {/* منطقة الشات */}
      <div className="w-full lg:w-96 bg-[#0A0A0A] border border-gray-800 rounded-lg flex flex-col h-full">
        <div className="p-4 border-b border-gray-800 bg-[#111] rounded-t-lg">
          <h3 className="text-[#FF2400] font-bold">شات الغرفة المباشر</h3>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
          {messages.map((msg, i) => (
            <div key={i} className={`p-3 rounded border ${msg.sender === playerName ? 'bg-[#1a0505] border-[#FF2400] ml-auto' : 'bg-[#111] border-gray-700 mr-auto'} max-w-[85%]`}>
              <span className={`block text-xs mb-1 ${msg.sender === 'النظام' ? 'text-red-500' : 'text-gray-400'}`}>{msg.sender}</span>
              <span className="text-white">{msg.text}</span>
            </div>
          ))}
        </div>

        <form onSubmit={sendMsg} className="p-3 border-t border-gray-800 flex gap-2">
          <input 
            type="text" 
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="رسالتك..." 
            className="flex-1 bg-[#111] border border-gray-700 text-white px-3 py-2 rounded outline-none focus:border-[#FF2400]"
          />
          <button type="submit" className="bg-[#FF2400] text-black px-4 py-2 rounded font-bold hover:bg-white transition-colors">
            إرسال
          </button>
        </form>
      </div>

    </div>
  );
};

export default GameRoom;