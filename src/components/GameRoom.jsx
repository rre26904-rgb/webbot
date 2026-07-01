import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

// رابط السيرفر (يتم تغييره عند الرفع النهائي)
const socket = io('https://your-server-name.onrender.com');

const GameRoom = ({ roomInfo, playerName, onLeave }) => {
  // استعادة الحالة من sessionStorage لضمان عدم ضياع النقاط أو تقدم الأسئلة
  const [currentQIndex, setCurrentQIndex] = useState(() => 
    parseInt(sessionStorage.getItem(`qIndex_${roomInfo.code}`)) || 0
  );
  const [winnerName, setWinnerName] = useState(() => 
    sessionStorage.getItem(`winner_${roomInfo.code}`) || null
  );
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [players, setPlayers] = useState([]);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');

  const questions = roomInfo.game.questions || [];
  const currentQuestion = questions[currentQIndex];

  useEffect(() => {
    // انضمام للغرفة وتحديث البيانات لحظياً
    socket.emit('join-room', { roomCode: roomInfo.code, name: playerName });

    socket.on('receive-message', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on('update-players', (playersList) => {
      setPlayers(playersList);
    });

    // حفظ حالة الغرفة في المتصفح
    sessionStorage.setItem(`qIndex_${roomInfo.code}`, currentQIndex);
    if (winnerName) sessionStorage.setItem(`winner_${roomInfo.code}`, winnerName);

    return () => socket.off();
  }, [currentQIndex, winnerName, roomInfo.code, playerName]);

  const submitAnswer = (e) => {
    e.preventDefault();
    if (!answer.trim() || winnerName) return;
    
    if (answer.trim() === currentQuestion?.correct) {
      setFeedback('إجابة صحيحة! 🔥');
      setTimeout(() => {
        if (currentQIndex + 1 < questions.length) {
          setCurrentQIndex(prev => prev + 1);
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
      socket.emit('send-message', { roomCode: roomInfo.code, sender: playerName, text: chatInput });
      setChatInput('');
    }
  };

  return (
    <div className="animate-fade-in flex flex-col lg:flex-row gap-8 h-[80vh] p-4">
      {/* منطقة اللعب */}
      <div className="flex-1 bg-[#0A0A0A] border border-[#FF2400] rounded-2xl p-8 shadow-2xl flex flex-col relative overflow-hidden">
        <div className="flex justify-between items-start mb-8 border-b border-gray-800 pb-6">
          <div>
            <h2 className="text-4xl font-black text-[#FF2400] mb-2">{roomInfo.game.title} {roomInfo.game.icon}</h2>
            <p className="text-gray-400 font-medium">{roomInfo.game.description}</p>
          </div>
          <div className="flex gap-4 items-center">
            <div className="bg-[#111] border-2 border-[#FF2400] px-6 py-2 rounded-xl text-[#FF2400] font-black text-xl">#{roomInfo.code}</div>
            <button onClick={onLeave} className="px-5 py-2 bg-red-900/30 text-red-500 border border-red-900/50 hover:bg-red-600 rounded-xl font-bold">مغادرة</button>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center">
          {winnerName ? (
            <div className="text-center animate-bounce">
              <h1 className="text-6xl font-black text-white">الفائز: {winnerName} 🏆</h1>
              <button onClick={onLeave} className="mt-8 px-10 py-3 bg-[#FF2400] text-black font-black rounded-xl">العودة للوبي</button>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center">
              <div className="text-[#FF2400] font-bold mb-4">السؤال {currentQIndex + 1} من {questions.length}</div>
              <h1 className="text-5xl font-black text-white mb-10 text-center">{currentQuestion?.text}</h1>
              <form onSubmit={submitAnswer} className="w-full max-w-lg">
                <input value={answer} onChange={(e) => setAnswer(e.target.value)} className="w-full bg-[#111] border-2 border-gray-800 text-white text-center py-4 rounded-xl outline-none focus:border-[#FF2400]" placeholder="أدخل الإجابة..." />
                <button type="submit" className="w-full mt-4 bg-[#FF2400] py-4 rounded-xl font-black text-black">تأكيد</button>
              </form>
              {feedback && <p className="mt-4 text-xl font-black text-green-500">{feedback}</p>}
            </div>
          )}
        </div>
      </div>

      {/* الشريط الجانبي */}
      <div className="w-full lg:w-96 flex flex-col gap-6">
        <div className="bg-[#0A0A0A] border border-gray-800 p-4 rounded-2xl">
          <h3 className="text-gray-400 font-bold mb-4">المتصلون ({players.length})</h3>
          {players.map((p, i) => <div key={i} className="text-white p-2 bg-[#111] rounded mb-2 font-bold">🟢 {p.name}</div>)}
        </div>
        <div className="flex-1 bg-[#0A0A0A] border border-gray-800 rounded-2xl flex flex-col">
          <div className="p-4 border-b border-gray-800 text-center font-black text-[#FF2400]">الشات</div>
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.map((m, i) => <p key={i} className="text-white mb-2"><span className="text-[#FF2400] font-bold">{m.sender}: </span>{m.text}</p>)}
          </div>
          <form onSubmit={sendMsg} className="p-2 border-t border-gray-800 flex">
            <input className="flex-1 bg-black text-white px-2 outline-none" value={chatInput} onChange={(e) => setChatInput(e.target.value)} />
            <button className="bg-[#FF2400] px-4 font-black text-black">إرسال</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GameRoom;