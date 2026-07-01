import React, { useState } from 'react';

const GameRoom = ({ roomInfo, playerName, onLeave }) => {
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'النظام', text: `الغرفة جاهزة. شارك الرمز [ ${roomInfo.code} ] ليدخل أصدقاؤك.` }
  ]);
  
  // حالات اللعب
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');

  // سؤال تجريبي مباشر
  const question = { text: "ما هي عاصمة المملكة العربية السعودية؟", correct: "الرياض" };

  const sendMsg = (e) => {
    e.preventDefault();
    if (chatInput.trim()) {
      setMessages([...messages, { sender: playerName, text: chatInput }]);
      setChatInput('');
    }
  };

  const submitAnswer = (e) => {
    e.preventDefault();
    if (!answer.trim()) return;
    
    if (answer.trim() === question.correct) {
      setFeedback('إجابة صحيحة! وحش 🔥');
    } else {
      setFeedback('إجابة خاطئة.. ركز أكثر!');
    }
  };

  return (
    <div className="animate-fade-in flex flex-col lg:flex-row gap-6 h-[80vh]">
      
      {/* منطقة اللعب المباشر */}
      <div className="flex-1 bg-[#0A0A0A] border border-[#FF2400] rounded-xl p-6 shadow-[0_0_30px_rgba(255,36,0,0.1)] flex flex-col relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FF2400] to-transparent opacity-50"></div>
        
        {/* الهيدر داخل الغرفة */}
        <div className="flex justify-between items-start mb-8 border-b border-gray-800 pb-4">
          <div>
            <h2 className="text-3xl font-black text-[#FF2400] mb-2">{roomInfo.game.title}</h2>
            <p className="text-gray-500 font-medium">اللاعب الحالي: <span className="text-white">{playerName}</span></p>
          </div>
          
          <div className="flex gap-4 items-center">
            <div className="bg-[#111] border-2 border-[#FF2400] px-6 py-2 rounded-lg text-[#FF2400] font-bold text-xl shadow-[0_0_15px_rgba(255,36,0,0.3)]">
              HOST: #{roomInfo.code}
            </div>
            {/* زر المغادرة التفاعلي */}
            <button 
              onClick={onLeave} 
              className="px-4 py-2 bg-red-900/30 text-red-400 border border-red-900/50 hover:bg-red-600 hover:text-white hover:border-red-500 rounded-lg transform active:scale-95 transition-all duration-200"
            >
              مغادرة
            </button>
          </div>
        </div>

        {/* واجهة اللعب الفورية */}
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <span className="text-gray-500 text-lg mb-4 font-bold tracking-widest">السؤال الحالي</span>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-10 text-center leading-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            {question.text}
          </h1>
          
          <form onSubmit={submitAnswer} className="w-full max-w-lg flex flex-col gap-5 items-center">
            <input 
              type="text" 
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="اكتب إجابتك هنا..." 
              className="w-full bg-[#111] border-2 border-gray-800 focus:border-[#FF2400] text-2xl text-center text-white py-4 rounded-xl outline-none transition-all shadow-inner focus:shadow-[0_0_20px_rgba(255,36,0,0.2)] placeholder-gray-700" 
              autoFocus 
            />
            
            {/* زر الإرسال التفاعلي (ينضغط للداخل ويضيء) */}
            <button 
              type="submit" 
              className="w-full py-4 bg-[#FF2400] text-black font-black text-2xl rounded-xl transform active:scale-95 hover:bg-white hover:shadow-[0_0_40px_rgba(255,36,0,0.6)] transition-all duration-200"
            >
              إرسال الإجابة
            </button>
          </form>
          
          {/* نتيجة الإجابة */}
          {feedback && (
            <div className={`mt-8 text-3xl font-black animate-bounce ${feedback.includes('صحيحة') ? 'text-green-500 drop-shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'text-[#FF2400] drop-shadow-[0_0_15px_rgba(255,36,0,0.4)]'}`}>
              {feedback}
            </div>
          )}
        </div>
      </div>

      {/* منطقة الشات (كما هي بتنسيق أفضل) */}
      <div className="w-full lg:w-96 bg-[#0A0A0A] border border-gray-800 rounded-xl flex flex-col h-full overflow-hidden">
        <div className="p-4 border-b border-gray-800 bg-[#111]">
          <h3 className="text-[#FF2400] font-bold text-center tracking-wider">شات الغرفة المباشر</h3>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
          {messages.map((msg, i) => (
            <div key={i} className={`p-3 rounded-lg border ${msg.sender === playerName ? 'bg-[#1a0505] border-[#FF2400] ml-auto' : 'bg-[#111] border-gray-700 mr-auto'} max-w-[85%] shadow-sm`}>
              <span className={`block text-xs mb-1 font-bold ${msg.sender === 'النظام' ? 'text-red-500' : 'text-gray-400'}`}>{msg.sender}</span>
              <span className="text-white font-medium">{msg.text}</span>
            </div>
          ))}
        </div>

        <form onSubmit={sendMsg} className="p-3 border-t border-gray-800 flex gap-2 bg-[#111]">
          <input 
            type="text" 
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="رسالتك..." 
            className="flex-1 bg-black border border-gray-700 text-white px-4 py-2 rounded-lg outline-none focus:border-[#FF2400] transition-colors"
          />
          <button type="submit" className="bg-[#FF2400] text-black px-6 py-2 rounded-lg font-bold transform active:scale-95 hover:bg-white transition-all duration-200">
            إرسال
          </button>
        </form>
      </div>

    </div>
  );
};

export default GameRoom;