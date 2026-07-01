import React, { useState, useEffect } from 'react';

const GameRoom = ({ roomInfo, playerName, onLeave }) => {
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'النظام', text: `تم تفعيل جلسة (${roomInfo.game.title}). الكود: ${roomInfo.code}` }
  ]);
  
  // قائمة المتصلين (نظام محاكاة التفاعل)
  const [playersList] = useState([
    { name: playerName, isHost: roomInfo.isHost, status: 'online' },
    { name: 'لاعب_ضيف', isHost: !roomInfo.isHost, status: 'online' }
  ]);
  
  const questions = roomInfo.game.questions || [];
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [winnerName, setWinnerName] = useState(null);

  const currentQuestion = questions[currentQIndex];

  const submitAnswer = (e) => {
    e.preventDefault();
    if (!answer.trim() || winnerName) return;
    
    if (answer.trim() === currentQuestion?.correct) {
      setFeedback('إجابة صحيحة! 🔥');
      setTimeout(() => {
        if (currentQIndex + 1 < questions.length) {
          setCurrentQIndex(currentQIndex + 1);
          setAnswer('');
          setFeedback('');
        } else {
          setWinnerName(playerName); 
        }
      }, 1000); 
    } else {
      setFeedback('إجابة خاطئة.. حاول مرة أخرى!');
    }
  };

  const sendMsg = (e) => {
    e.preventDefault();
    if (chatInput.trim()) {
      setMessages([...messages, { sender: playerName, text: chatInput }]);
      setChatInput('');
    }
  };

  return (
    <div className="animate-fade-in flex flex-col lg:flex-row gap-8 h-[80vh]">
      
      {/* منطقة اللعب الرئيسية */}
      <div className="flex-1 bg-[#0A0A0A] border border-[#FF2400] rounded-2xl p-8 shadow-[0_0_40px_rgba(255,36,0,0.15)] flex flex-col relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FF2400] to-transparent opacity-70"></div>
        
        <div className="flex justify-between items-start mb-8 border-b border-gray-800 pb-6">
          <div>
            <h2 className="text-4xl font-black text-[#FF2400] mb-2">{roomInfo.game.title} {roomInfo.game.icon}</h2>
            <p className="text-gray-400 font-medium">{roomInfo.game.description}</p>
          </div>
          <div className="flex gap-4 items-center">
            <div className="bg-[#111] border-2 border-[#FF2400] px-6 py-2 rounded-xl text-[#FF2400] font-black tracking-widest text-xl shadow-[0_0_15px_rgba(255,36,0,0.3)]">
              #{roomInfo.code}
            </div>
            <button onClick={onLeave} className="px-5 py-2.5 bg-red-900/30 text-red-500 border border-red-900/50 hover:bg-red-600 hover:text-white rounded-xl active:scale-95 transition-all font-bold">
              مغادرة
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-4">
          {winnerName ? (
            <div className="text-center animate-fade-in">
              <div className="text-8xl mb-6 animate-bounce">🏆</div>
              <h1 className="text-5xl font-black text-white mb-2">نهاية التحدي!</h1>
              <h2 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-green-500 mb-10 drop-shadow-[0_0_20px_rgba(250,204,21,0.5)]">
                الفائز: {winnerName}
              </h2>
              <button onClick={onLeave} className="px-12 py-4 bg-[#FF2400] text-black font-black text-2xl rounded-xl active:scale-95 hover:bg-white transition-all">العودة للوبي</button>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center">
              <div className="bg-[#111] text-[#FF2400] px-4 py-1 rounded-full font-bold mb-6 border border-[#FF2400]/30 shadow-[0_0_10px_rgba(255,36,0,0.2)]">
                السؤال {currentQIndex + 1} من {questions.length}
              </div>
              <h1 className="text-5xl md:text-6xl font-black text-white mb-12 text-center leading-tight">
                {currentQuestion?.text}
              </h1>
              <form onSubmit={submitAnswer} className="w-full max-w-xl flex flex-col gap-6 items-center">
                <input 
                  type="text" value={answer} onChange={(e) => setAnswer(e.target.value)}
                  placeholder="أدخل الإجابة..." 
                  className="w-full bg-[#111] border-2 border-gray-800 focus:border-[#FF2400] text-3xl font-bold text-center text-white py-5 rounded-xl outline-none transition-all"
                  autoFocus 
                />
                <button type="submit" className="w-full py-5 bg-[#FF2400] text-black font-black text-2xl rounded-xl active:scale-95 hover:bg-white transition-all">تأكيد الإجابة</button>
              </form>
              {feedback && <div className={`mt-8 text-2xl font-black ${feedback.includes('صحيحة') ? 'text-green-500' : 'text-[#FF2400]'}`}>{feedback}</div>}
            </div>
          )}
        </div>
      </div>

      {/* الشريط الجانبي (المتصلين والشات) */}
      <div className="w-full lg:w-96 flex flex-col gap-6 h-full">
        <div className="bg-[#0A0A0A] border border-gray-800 rounded-2xl p-4 flex flex-col shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          <h3 className="text-gray-400 font-bold mb-4 text-sm tracking-widest border-b border-gray-800 pb-2">المتصلون</h3>
          <div className="flex flex-col gap-3">
            {playersList.map((player, idx) => (
              <div key={idx} className="flex justify-between items-center bg-[#111] p-3 rounded-lg border border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="relative"><div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div></div>
                  <span className="font-bold text-white">{player.name}</span>
                </div>
                {player.isHost && <span className="text-[10px] bg-[#FF2400] text-black px-2 py-0.5 rounded font-black">HOST</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 bg-[#0A0A0A] border border-gray-800 rounded-2xl flex flex-col overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          <div className="p-4 border-b border-gray-800 bg-[#111] text-center font-black text-[#FF2400]">الشات</div>
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
            {messages.map((msg, i) => (
              <div key={i} className="p-3 rounded-xl bg-[#111] border border-gray-800">
                <span className="text-[10px] text-gray-500 font-bold">{msg.sender}</span>
                <p className="text-white font-medium">{msg.text}</p>
              </div>
            ))}
          </div>
          <form onSubmit={sendMsg} className="p-3 border-t border-gray-800 flex gap-2">
            <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} className="flex-1 bg-black border border-gray-700 text-white px-3 py-2 rounded-lg outline-none focus:border-[#FF2400]" placeholder="رسالة..." />
            <button type="submit" className="bg-[#FF2400] text-black px-4 py-2 rounded-lg font-black active:scale-95">إرسال</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GameRoom;