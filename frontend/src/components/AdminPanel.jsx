import React, { useState } from 'react';

const AdminPanel = () => {
  const [formData, setFormData] = useState({ category_name: '', question_text: '', correct_answer: '', points: 10 });

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    await fetch('http://localhost:8000/admin/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    alert('تمت إضافة السؤال للقاعدة بنجاح!');
    setFormData({ ...formData, question_text: '', correct_answer: '' }); // تفريغ الخانات عدا القسم
  };

  return (
    <div className="p-10 flex flex-col items-center">
      <h2 className="text-3xl font-bold text-[#FF2400] mb-8">لوحة التحكم السريعة (إدارة الداتا)</h2>
      
      <form onSubmit={handleAddQuestion} className="bg-[#111] border border-[#FF2400] p-8 rounded shadow-[0_0_15px_rgba(255,36,0,0.2)] w-full max-w-lg flex flex-col gap-4">
        
        <div>
          <label className="text-gray-400 block mb-1">اسم المربع / النمط (مثال: عواصم، فكك):</label>
          <input type="text" value={formData.category_name} onChange={e => setFormData({...formData, category_name: e.target.value})} required
            className="w-full bg-black border border-gray-700 text-white p-2 focus:border-[#FF2400] outline-none" />
        </div>

        <div>
          <label className="text-gray-400 block mb-1">الكلمة / السؤال:</label>
          <input type="text" value={formData.question_text} onChange={e => setFormData({...formData, question_text: e.target.value})} required
            className="w-full bg-black border border-gray-700 text-white p-2 focus:border-[#FF2400] outline-none" />
        </div>

        <div>
          <label className="text-gray-400 block mb-1">الجواب الصحيح:</label>
          <input type="text" value={formData.correct_answer} onChange={e => setFormData({...formData, correct_answer: e.target.value})} required
            className="w-full bg-black border border-gray-700 text-white p-2 focus:border-[#FF2400] outline-none" />
        </div>

        <button type="submit" className="mt-4 py-3 bg-[#FF2400] text-black font-bold hover:bg-white transition-colors">
          إضافة للداتا
        </button>
      </form>
    </div>
  );
};

export default AdminPanel;