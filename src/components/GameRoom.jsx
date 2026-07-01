import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const socket = io('https://webbot-90as.onrender.com');

const GameRoom = ({ roomInfo, playerName, onLeave }) => {
    const [messages, setMessages] = useState([]);
    const [players, setPlayers] = useState([]);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [winner, setWinner] = useState(null);
    const [answer, setAnswer] = useState('');
    const [chatInput, setChatInput] = useState('');
    
    // حفظ الأسئلة العشوائية التي ستأتي من السيرفر
    const [activeQuestions, setActiveQuestions] = useState([]);
    const chatContainerRef = useRef(null);

    useEffect(() => {
        // الاتصال والانضمام للغرفة
        socket.emit('join-room', { 
            roomCode: roomInfo.code, 
            name: playerName, 
            gameQuestions: roomInfo.game.questions 
        });

        // دوال الاستقبال من السيرفر
        const handleUpdatePlayers = (list) => setPlayers(list);
        const handleSyncData = (data) => {
            setActiveQuestions(data.questions);
            setCurrentQIndex(data.currentIndex);
        };
        const handleReceiveMessage = (data) => setMessages(prev => [...prev, data]);
        const handleCorrectAnswer = (data) => setCurrentQIndex(data.nextIndex);
        const handleGameWon = (name) => setWinner(name);

        // ربط المستمعين
        socket.on('update-players', handleUpdatePlayers);
        socket.on('sync-data', handleSyncData); // استقبال الأسئلة المخلطة عشوائياً
        socket.on('receive-message', handleReceiveMessage);
        socket.on('correct-answer', handleCorrectAnswer);
        socket.on('game-won', handleGameWon);

        // تنظيف المستمعين عند الخروج
        return () => {
            socket.off('update-players', handleUpdatePlayers);
            socket.off('sync-data', handleSyncData);
            socket.off('receive-message', handleReceiveMessage);
            socket.off('correct-answer', handleCorrectAnswer);
            socket.off('game-won', handleGameWon);
        };
    }, [roomInfo.code, playerName, roomInfo.game.questions]);

    // التمرير التلقائي لأسفل الشات عند وصول رسالة جديدة
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const submitAnswer = (e) => {
        e.preventDefault();
        if (!answer.trim()) return;
        
        socket.emit('check-answer', { roomCode: roomInfo.code, answer, playerName });
        setAnswer(''); // تفريغ الحقل بعد الإرسال
    };

    const sendMsg = (e) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        socket.emit('send-message', { roomCode: roomInfo.code, sender: playerName, text: chatInput });
        setChatInput('');
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8 p-4 h-screen bg-[#050505] text-white">
            
            {/* منطقة اللعب */}
            <div className="flex-1 bg-[#0A0A0A] border border-[#FF2400] rounded-2xl p-8 flex flex-col relative overflow-hidden shadow-[0_0_30px_rgba(255,36,0,0.1)]">
                <div className="flex justify-between items-start mb-8 border-b border-gray-800 pb-4">
                    <div>
                        <h2 className="text-3xl font-black text-[#FF2400]">{roomInfo.game.title}</h2>
                    </div>
                    <div className="flex gap-4 items-center">
                        <div className="bg-[#111] border-2 border-[#FF2400] px-4 py-2 rounded-xl text-[#FF2400] font-black tracking-widest">
                            #{roomInfo.code}
                        </div>
                        <button onClick={onLeave} className="px-4 py-2 bg-red-900/30 text-red-500 border border-red-900/50 hover:bg-red-600 hover:text-white rounded-xl font-bold transition-all">
                            مغادرة
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center">
                    {winner ? (
                        <div className="text-center animate-bounce">
                            <h1 className="text-6xl font-black text-white mb-6">الفائز: {winner} 🏆</h1>
                            <button onClick={onLeave} className="px-10 py-4 bg-[#FF2400] text-black font-black text-xl rounded-xl hover:bg-white transition-all">
                                العودة للوبي
                            </button>
                        </div>
                    ) : (
                        <div className="w-full flex flex-col items-center">
                            <div className="text-[#FF2400] font-bold mb-4 bg-[#111] px-4 py-1 rounded-full border border-gray-800">
                                السؤال {currentQIndex + 1} من {activeQuestions.length}
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-white mb-10 text-center leading-tight">
                                {activeQuestions.length > 0 ? activeQuestions[currentQIndex]?.text : 'جاري تحميل السؤال...'}
                            </h1>
                            <form onSubmit={submitAnswer} className="w-full max-w-lg">
                                <input 
                                    value={answer} 
                                    onChange={(e) => setAnswer(e.target.value)} 
                                    className="w-full bg-[#111] p-5 rounded-xl border-2 border-gray-800 text-center text-2xl font-bold text-white focus:border-[#FF2400] outline-none transition-all" 
                                    placeholder="أدخل الإجابة هنا..." 
                                    autoFocus
                                />
                                <button type="submit" className="w-full mt-4 bg-[#FF2400] p-4 rounded-xl font-black text-xl text-black hover:bg-white transition-all active:scale-95">
                                    تأكيد الإجابة
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>

            {/* الشريط الجانبي (المتصلين والشات) */}
            <div className="w-full lg:w-96 flex flex-col gap-4">
                <div className="bg-[#0A0A0A] p-4 rounded-2xl border border-gray-800">
                    <h3 className="text-[#FF2400] font-bold mb-3 border-b border-gray-800 pb-2">المتصلون ({players.length})</h3>
                    <div className="flex flex-col gap-2 max-h-32 overflow-y-auto">
                        {players.map((p, i) => (
                            <div key={i} className="text-white p-2 bg-[#111] rounded flex items-center gap-2 border border-gray-800">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="font-bold">{p.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex-1 bg-[#0A0A0A] p-4 rounded-2xl border border-gray-800 flex flex-col overflow-hidden">
                    <h3 className="text-[#FF2400] font-bold mb-3 border-b border-gray-800 pb-2 text-center">الشات المباشر</h3>
                    <div ref={chatContainerRef} className="flex-1 overflow-y-auto flex flex-col gap-2 mb-3 pr-2 scrollbar-thin scrollbar-thumb-[#FF2400] scrollbar-track-transparent">
                        {messages.map((m, i) => (
                            <div key={i} className={`p-2 rounded-lg ${m.sender === 'النظام' ? 'bg-[#FF2400]/10 border border-[#FF2400]/30' : 'bg-[#111] border border-gray-800'}`}>
                                <span className={`text-xs block font-bold ${m.sender === 'النظام' ? 'text-[#FF2400]' : 'text-gray-400'}`}>
                                    {m.sender}
                                </span>
                                <span className="text-white text-sm">{m.text}</span>
                            </div>
                        ))}
                    </div>
                    <form onSubmit={sendMsg} className="flex gap-2 border-t border-gray-800 pt-3">
                        <input 
                            className="flex-1 bg-[#111] p-3 rounded-lg border border-gray-700 text-white outline-none focus:border-[#FF2400]" 
                            value={chatInput} 
                            onChange={(e) => setChatInput(e.target.value)} 
                            placeholder="اكتب رسالة..."
                        />
                        <button type="submit" className="bg-[#FF2400] px-6 rounded-lg font-black text-black active:scale-95 transition-all">إرسال</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default GameRoom;