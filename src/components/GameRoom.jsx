import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('https://webbot-90as.onrender.com');

const GameRoom = ({ roomInfo, playerName, onLeave }) => {
    const [messages, setMessages] = useState([]);
    const [players, setPlayers] = useState([]);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [winner, setWinner] = useState(null);
    const [answer, setAnswer] = useState('');
    const [chatInput, setChatInput] = useState('');

    useEffect(() => {
        socket.emit('join-room', { 
            roomCode: roomInfo.code, 
            name: playerName, 
            gameQuestions: roomInfo.game.questions 
        });

        socket.on('update-players', (list) => setPlayers(list));
        socket.on('receive-message', (data) => setMessages(prev => [...prev, data]));
        socket.on('correct-answer', (data) => setCurrentQIndex(data.nextIndex));
        socket.on('game-won', (name) => setWinner(name));

        return () => socket.off();
    }, [roomInfo.code, playerName]);

    const submitAnswer = (e) => {
        e.preventDefault();
        socket.emit('check-answer', { roomCode: roomInfo.code, answer, playerName });
        setAnswer('');
    };

    const sendMsg = (e) => {
        e.preventDefault();
        socket.emit('send-message', { roomCode: roomInfo.code, sender: playerName, text: chatInput });
        setChatInput('');
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8 p-4 h-screen bg-[#050505] text-white">
            <div className="flex-1 bg-[#0A0A0A] border border-[#FF2400] rounded-2xl p-8 flex flex-col">
                {winner ? (
                    <div className="text-center">
                        <h1 className="text-6xl font-black text-white">الفائز: {winner} 🏆</h1>
                        <button onClick={onLeave} className="mt-8 px-10 py-3 bg-[#FF2400] text-black font-black rounded-xl">العودة للوبي</button>
                    </div>
                ) : (
                    <>
                        <h1 className="text-4xl font-black mb-10">{roomInfo.game.questions[currentQIndex]?.text}</h1>
                        <form onSubmit={submitAnswer} className="w-full max-w-lg">
                            <input value={answer} onChange={(e) => setAnswer(e.target.value)} className="w-full bg-[#111] p-4 rounded-xl border border-gray-800" placeholder="إجابتك..." />
                            <button type="submit" className="w-full mt-4 bg-[#FF2400] p-4 rounded-xl font-black">تأكيد</button>
                        </form>
                    </>
                )}
            </div>
            <div className="w-full lg:w-80 flex flex-col gap-4">
                <div className="bg-[#0A0A0A] p-4 rounded-2xl border border-gray-800">
                    <h3 className="text-[#FF2400] font-bold">المتصلون ({players.length})</h3>
                    {players.map((p, i) => <div key={i} className="text-white p-2 bg-[#111] rounded mt-2">🟢 {p.name}</div>)}
                </div>
                <div className="flex-1 bg-[#0A0A0A] p-4 rounded-2xl border border-gray-800 overflow-y-auto">
                    {messages.map((m, i) => <p key={i}><span className="text-[#FF2400] font-bold">{m.sender}:</span> {m.text}</p>)}
                </div>
                <form onSubmit={sendMsg} className="flex gap-2">
                    <input className="flex-1 bg-[#111] p-2 rounded" value={chatInput} onChange={(e) => setChatInput(e.target.value)} />
                    <button className="bg-[#FF2400] px-4 rounded font-black">إرسال</button>
                </form>
            </div>
        </div>
    );
};
export default GameRoom;