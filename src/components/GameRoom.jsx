import React, { useState, useEffect, useRef } from 'react';
import { gamesList } from '../gamesData'; // تحميل الأسئلة مباشرة من هنا!

const GameRoom = ({ roomInfo, playerName, onLeave, socket }) => {
    // جلب اللعبة والأسئلة مباشرة من الملف بناءً على gameId
    const game = gamesList.find(g => g.id === roomInfo.gameId);
    const questions = game?.questions || [];

    const [messages, setMessages] = useState([]);
    const [players, setPlayers] = useState([]);
    const [currentQIndex, setCurrentQIndex] = useState(roomInfo.startIndex || 0);
    const [winner, setWinner] = useState(null);
    const [answer, setAnswer] = useState('');
    const [chatInput, setChatInput] = useState('');
    const chatRef = useRef(null);

    useEffect(() => {
        // المستمعات
        const handleUpdatePlayers = (list) => setPlayers(list);
        const handleReceiveMessage = (data) => setMessages(prev => [...prev, data]);
        const handleCorrectAnswer = (data) => setCurrentQIndex(data.nextIndex);
        const handleGameWon = (name) => setWinner(name);

        socket.on('update-players', handleUpdatePlayers);
        socket.on('receive-message', handleReceiveMessage);
        socket.on('correct-answer', handleCorrectAnswer);
        socket.on('game-won', handleGameWon);

        return () => {
            socket.off('update-players', handleUpdatePlayers);
            socket.off('receive-message', handleReceiveMessage);
            socket.off('correct-answer', handleCorrectAnswer);
            socket.off('game-won', handleGameWon);
        };
    }, [socket]);

    // النزول التلقائي للشات
    useEffect(() => {
        if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }, [messages]);

    const submitAnswer = (e) => {
        e.preventDefault();
        if (!answer.trim()) return;
        
        socket.emit('check-answer', { 
            roomCode: roomInfo.code, 
            answer: answer, 
            playerName: playerName,
            correctAns: questions[currentQIndex]?.correct, // التحقق مع السيرفر
            totalQuestions: questions.length
        });
        setAnswer('');
    };

    const sendMsg = (e) => {
        e.preventDefault();
        if (!chatInput.trim()) return;
        socket.emit('send-message', { roomCode: roomInfo.code, sender: playerName, text: chatInput });
        setChatInput('');
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 p-4 h-screen bg-[#050505] text-white">
            {/* منطقة اللعب والاحتفالية */}
            <div className="flex-1 bg-[#0A0A0A] border border-[#FF2400] rounded-3xl p-8 flex flex-col relative overflow-hidden shadow-[0_0_40px_rgba(255,36,0,0.15)]">
                
                {/* احتفالية الفوز الفخمة */}
                {winner ? (
                    <div className="absolute inset-0 bg-[#0A0A0A] flex flex-col items-center justify-center z-50 animate-fade-in">
                        <div className="absolute inset-0 bg-[url('https://media.giphy.com/media/26tO2wgBvu8AARIf6/giphy.gif')] opacity-20 mix-blend-screen bg-cover"></div>
                        <div className="text-9xl mb-6 animate-bounce drop-shadow-[0_0_30px_rgba(255,215,0,0.8)]">🏆</div>
                        <h2 className="text-4xl text-gray-400 font-bold mb-2">انتهى التحدي!</h2>
                        <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-[#FF2400] to-yellow-400 animate-pulse mb-10">
                            الفائز: {winner}
                        </h1>
                        <button onClick={onLeave} className="relative z-10 px-12 py-4 bg-[#FF2400] text-black font-black text-2xl rounded-2xl hover:bg-white hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,36,0,0.5)]">
                            العودة للوبي
                        </button>
                    </div>
                ) : (
                    <>
                        {/* الهيدر داخل الغرفة */}
                        <div className="flex justify-between items-center mb-10 border-b border-gray-800 pb-6">
                            <div>
                                <h2 className="text-3xl font-black text-[#FF2400] flex items-center gap-3">{game?.icon} {game?.title}</h2>
                            </div>
                            <div className="flex gap-4 items-center">
                                <div className="bg-black border-2 border-gray-800 px-6 py-2 rounded-xl text-white font-black tracking-widest text-xl">
                                    كود: <span className="text-[#FF2400]">{roomInfo.code}</span>
                                </div>
                                <button onClick={onLeave} className="px-5 py-2 bg-red-900/20 text-red-500 border border-red-900/50 hover:bg-red-600 hover:text-white rounded-xl font-bold transition-all">مغادرة</button>
                            </div>
                        </div>

                        {/* السؤال */}
                        <div className="flex-1 flex flex-col items-center justify-center w-full">
                            <div className="text-[#FF2400] font-bold mb-6 bg-[#111] px-5 py-2 rounded-full border border-gray-800 shadow-inner">
                                السؤال {currentQIndex + 1} من {questions.length}
                            </div>
                            <h1 className="text-5xl md:text-6xl font-black text-white mb-12 text-center leading-tight">
                                {questions[currentQIndex]?.text}
                            </h1>
                            <form onSubmit={submitAnswer} className="w-full max-w-xl flex flex-col gap-4">
                                <input 
                                    value={answer} 
                                    onChange={(e) => setAnswer(e.target.value)} 
                                    className="w-full bg-[#111] p-6 rounded-2xl border-2 border-gray-800 text-center text-3xl font-bold text-white focus:border-[#FF2400] outline-none transition-all shadow-inner" 
                                    placeholder="اكتب إجابتك هنا..." 
                                    autoFocus
                                />
                                <button type="submit" className="w-full py-5 bg-[#FF2400] text-black rounded-2xl font-black text-2xl hover:bg-white active:scale-95 transition-all shadow-[0_5px_0_#b31900] hover:shadow-[0_2px_0_#b31900] hover:translate-y-1">
                                    إرسال الإجابة
                                </button>
                            </form>
                        </div>
                    </>
                )}
            </div>

            {/* الشريط الجانبي (متصلين + شات) */}
            <div className="w-full lg:w-96 flex flex-col gap-6">
                
                {/* قائمة المتصلين */}
                <div className="bg-[#0A0A0A] p-5 rounded-3xl border border-gray-800 shadow-xl">
                    <h3 className="text-[#FF2400] font-black text-lg mb-4 flex items-center gap-2 border-b border-gray-800 pb-3">
                        <i className="fa-solid fa-users"></i> المتصلون ({players.length})
                    </h3>
                    <div className="flex flex-col gap-3 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                        {players.map((p, i) => (
                            <div key={i} className="flex items-center gap-3 text-white p-3 bg-[#111] rounded-xl border border-gray-800">
                                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]"></div>
                                <span className="font-bold">{p.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* الشات */}
                <div className="flex-1 bg-[#0A0A0A] p-5 rounded-3xl border border-gray-800 flex flex-col shadow-xl overflow-hidden">
                    <h3 className="text-[#FF2400] font-black text-lg mb-4 border-b border-gray-800 pb-3 text-center">الشات المباشر</h3>
                    <div ref={chatRef} className="flex-1 overflow-y-auto flex flex-col gap-3 mb-4 pr-2 custom-scrollbar">
                        {messages.map((m, i) => (
                            <div key={i} className={`p-3 rounded-xl ${m.sender === 'النظام' ? 'bg-[#FF2400]/10 border border-[#FF2400]/30' : 'bg-[#111] border border-gray-800'}`}>
                                <span className={`text-[11px] uppercase tracking-wider block font-black mb-1 ${m.sender === 'النظام' ? 'text-[#FF2400]' : 'text-gray-500'}`}>
                                    {m.sender}
                                </span>
                                <span className={`text-sm font-medium ${m.sender === 'النظام' ? 'text-white' : 'text-gray-200'}`}>{m.text}</span>
                            </div>
                        ))}
                    </div>
                    <form onSubmit={sendMsg} className="flex gap-2">
                        <input 
                            className="flex-1 bg-[#111] p-4 rounded-xl border border-gray-700 text-white outline-none focus:border-[#FF2400] font-medium" 
                            value={chatInput} 
                            onChange={(e) => setChatInput(e.target.value)} 
                            placeholder="شاركنا رأيك..."
                        />
                        <button type="submit" className="bg-[#FF2400] px-6 rounded-xl font-black text-black active:scale-95 transition-all">إرسال</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default GameRoom;