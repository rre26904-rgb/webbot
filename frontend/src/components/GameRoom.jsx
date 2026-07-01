import React, { useState, useEffect } from 'react';

const GameRoom = ({ category = "عواصم" }) => {
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  // توليد رمز رقمي عشوائي للغرفة
  const [roomCode] = useState(Math.floor(1000 + Math.random() * 9000));
  
  // حالة الشات
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');

  // جلب سؤال عشوائي من الداتا بناءً على القسم
  const fetchQuestion = async () => {
    try {
      const res = await fetch(`http://localhost:8000/admin/questions`);
      const data = await res.json();
      
      // تصفية الأسئلة لتطابق النمط الحالي (مثلاً: فكك، حروف، الخ)
      const categoryQuestions = data.filter(q => q.category_name === category);
      
      if (categoryQuestions.length > 0) {
        // اختيار سؤال عشوائي من ضمن القائمة
        const randomQ = categoryQuestions[Math.floor(Math.random() * categoryQuestions.length)];
        setQuestion(randomQ);
        setFeedback('');
        setAnswer('');
      } else {
        setFeedback('لا توجد أسئلة في هذا القسم حالياً. قم بإضافتها من لوحة التحكم.');
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  useEffect(() => {
    fetchQuestion();
  }, [category]);

  const submitAnswer = (e) => {
    e.preventDefault();
    if (!question) return;
    
    // التحقق من الإجابة
    if (answer.trim() === question.correct_answer) {
      setFeedback(`إجابة صحيحة! تم إضافة ${question.points} نقطة.`);
      setTimeout(fetchQuestion, 1500); // جلب السؤال التالي تلقائياً
    } else {
      setFeedback('إجابة خاطئة، ركز أكثر!');
    }
  };

  const sendChatMessage = (e) => {
    e.preventDefault();
    if (chatInput.trim() !== '') {
      setChatMessages([...chatMessages, { sender: 'أنت', text: chatInput }]);
      setChatInput('');
    }
  };

  return (
    <div className="flex p-4 gap-6 min-h-[90vh] digital-grid">
      
      {/* 1. قسم اللعب الرئيسي (الوسط) */}
      <div className="flex-1 flex flex-col items-center pt-10">
        
        {/* شريط معلومات الغرفة */}
        <div className="w-full max-w-3xl flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
          <h2 className="text-[#FF2400] text-3xl font-bold tracking-wider">نمط: {category}</h2>
          <div className="bg-[#0A0A0A] border-2 border-[#FF2400] px-6 py-2 text-[#FF2400] font-mono text-xl tracking-widest shadow-[0_0_15px_rgba(255,36,0,0.4)]">
            كود الغرفة: #{roomCode}
          </div>
        </div>

        {/* مربع السؤال والإجابة */}
        <div className="w-full max-w-3xl bg-[#0F0F0F] border border-[#FF2400] p-12 text-center rounded shadow-[0_0_20px_rgba(255,36,0,0.1)] transition-all hover:shadow-[0_0_30px_rgba(255,36,0,0.3)]">
          {question ? (
            <>
              <p className="text-gray-500 mb-4 text-lg">السؤال الحالي</p>
              <h1 className="text-5xl text-white font-bold mb-10 tracking-wide">{question.question_text}</h1>
              
              <form onSubmit={submitAnswer} className="flex flex-col gap-6 items-center">
                <input 
                  type="text" 
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="اكتب إجابتك هنا..."
                  className="w-3/4 bg-transparent border-b-2 border-gray-600 focus:border-[#FF2400] text-2xl text-center text-white py-3 outline-none transition-colors"
                  autoFocus
                />
                <button type="submit" className="mt-4 px-12 py-3 border-2 border-[#FF2400] text-[#FF2400] hover:bg-[#FF2400] hover:text-black font-bold text-xl transition-all shadow-[0_0_10px_rgba(255,36,0,0.2)]">
                  إرسال
                </button>
              </form>
              
              {/* التغذية الراجعة */}
              {feedback && (
                <div className={`mt-8 text-2xl font-bold ${feedback.includes('صحيحة') ? 'text-green-500' : 'text-[#FF2400]'}`}>
                  {feedback}
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-500 text-xl">{feedback || 'جاري تحميل البيانات من السيرفر...'}</p>
          )}
        </div>
      </div>

      {/* 2. قسم الشات الجانبي (اليمين/اليسار حسب الاتجاه) */}
      <div className="w-80 bg-[#0F0F0F] border border-[#FF2400] flex flex-col rounded shadow-[0_0_15px_rgba(255,36,0,0.1)] h-[80vh]">
        <div className="bg-[#111] p-4 border-b border-[#FF2400] text-center text-[#FF2400] font-bold text-lg">
          شات الغرفة المباشر
        </div>
        
        {/* صندوق الرسائل */}
        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
          {chatMessages.length === 0 && <p className="text-gray-600 text-sm text-center">لا توجد رسائل بعد..</p>}
          {chatMessages.map((msg, idx) => (
            <div key={idx} className="bg-black border border-gray-800 p-2 rounded text-md text-gray-300">
              <span className="text-[#FF2400] font-bold">{msg.sender}: </span>
              {msg.text}
            </div>
          ))}
        </div>

        {/* إدخال الرسالة */}
        <form onSubmit={sendChatMessage} className="p-3 border-t border-[#FF2400] flex gap-2 bg-[#0A0A0A]">
          <input 
            type="text" 
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            className="flex-1 bg-black border border-gray-700 text-white px-3 py-2 outline-none focus:border-[#FF2400]"
            placeholder="اكتب رسالة..."
          />
          <button type="submit" className="bg-[#FF2400] text-black px-4 font-bold hover:bg-white transition-colors">
            إرسال
          </button>
        </form>
      </div>

    </div>
  );
};

export default GameRoom;