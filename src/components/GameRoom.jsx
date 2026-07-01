import React, { useState } from 'react';

const GameRoom = ({ roomInfo, playerName, onLeave }) => {
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'النظام', text: `تم تفعيل لعبة (${roomInfo.game.title}). الكود: ${roomInfo.code}` }
  ]);
  
  // نظام اللعب والمراحل
  const questions = roomInfo.game.questions || [];
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isWinner, setIsWinner] = useState(false);

  const currentQuestion = questions[currentQIndex];

  const submitAnswer = (e) => {
    e.preventDefault();
    if (!answer.trim() || isWinner) return;
    
    // التحقق من الإجابة
    if (answer.trim() === currentQuestion.correct) {
      setFeedback('إجابة صحيحة! 🔥');
      
      // الانتقال للسؤال التالي أو إعلان الفوز
      setTimeout(() => {
        if (currentQIndex + 1 < questions.length) {
          setCurrentQIndex(currentQIndex + 1);
          setAnswer('');
          setFeedback('');
        } else {
          setIsWinner(true); // اللاعب فاز وخلص الأسئلة
        }
      }, 1000); // ينتظر ثانية وحدة قبل يغير السؤال عشان اللاعب يشوف "إجابة صحيحة"
      
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
      
      {/* منطقة اللعب */}
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
          
          {/* حالة الفوز (شاشة الختم) */}
          {isWinner ? (
            <div className="text-center animate-fade-in">
              <div className="text-8xl mb-6 animate-bounce">🏆</div>
              <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-green-500 mb-4 drop-shadow-[0_0_20px_rgba(250,204,21,0.5)]">
                أنت أسطورة!
              </h1>
              <p className="text-2xl text-gray-300 font-bold mb-10">تم ختم جميع أسئلة هذا التحدي بنجاح</p>
              <button onClick={onLeave} className="px-10 py-4 bg-gradient-to-r from-yellow-500 to-green-500 text-black font-black text-2xl rounded-xl active:scale-95 hover:shadow-[0_0_40px_rgba(250,204,21,0.6)] transition-all">
                العودة للوبي
              </button>
            </div>
          ) : (
            /* حالة اللعب الطبيعية */
            <div className="w-full flex flex-col items-center">
              <div className="bg-[#111] text-[#FF2400] px-4 py-1 rounded-full font-bold mb-6 border border-[#FF2400]/30">
                السؤال {currentQIndex + 1} من {questions.length}
              </div>
              
              <h1 className="text-5xl md:text-6xl font-black text-white mb-12 text-center leading-tight drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]">
                {currentQuestion?.text}
              </h1>
              
              <form onSubmit={submitAnswer} className="w-full max-w-xl flex flex-col gap-6 items-center">
                <input 
                  type="text" 
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="الجواب..." 
                  className={`w-full bg-[#111] border-2 ${feedback.includes('خاطئة') ? 'border-red-600' : 'border-gray-800'} focus:border-[#FF2400] text-3xl font-bold text-center text-white py-5 rounded-xl outline-none transition-all shadow-inner focus:shadow-[0_0_25px_rgba(255,36,0,0.2)]`}
                  autoFocus 
                />
                <button type="submit" className="w-full py-5 bg-[#FF2400] text-black font-black text-2xl rounded-xl active:scale-95 hover:bg-white hover:shadow-[0_0_40px_rgba(255,36,0,0.6)] transition-all duration-200">
                  تأكيد الإجابة
                </button>
              </form>
              
              {feedback && (
                <div className={`mt-8 text-2xl font-black ${feedback.includes('صحيحة') ? 'text-green-500' : 'text-[#FF2400]'}`}>
                  {feedback}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* منطقة الشات */}
      <div className="w-full lg:w-96 bg-[#0A0A0A] border border-gray-800 rounded-2xl flex flex-col h-full overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.5)]">
        <div className="p-5 border-b border-gray-800 bg-[#111]">
          <h3 className="text-[#FF2400] font-black text-center tracking-widest text-lg">غرفة المحادثة</h3>
        </div>
        <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-4">
          {messages.map((msg, i) => (
            <div key={i} className={`p-4 rounded-xl border ${msg.sender === playerName ? 'bg-gradient-to-br from-[#1a0505] to-[#0A0A0A] border-[#FF2400]/50 ml-auto' : 'bg-[#111] border-gray-800 mr-auto'} max-w-[85%] shadow-md`}>
              <span className={`block text-xs mb-2 font-bold ${msg.sender === 'النظام' ? 'text-red-500' : 'text-[#FF2400]'}`}>{msg.sender}</span>
              <span className="text-white font-medium text-lg">{msg.text}</span>
            </div>
          ))}
        </div>
        <form onSubmit={sendMsg} className="p-4 border-t border-gray-800 flex gap-3 bg-[#111]">
          <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="تحدث..." className="flex-1 bg-[#050505] border border-gray-700 text-white px-4 py-3 rounded-xl outline-none focus:border-[#FF2400] transition-colors font-bold" />
          <button type="submit" className="bg-[#FF2400] text-black px-6 py-3 rounded-xl font-black active:scale-95 hover:bg-white transition-all">إرسال</button>
        </form>
      </div>

    </div>
  );
};

export default GameRoom;