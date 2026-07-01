import React from 'react';

const ProfileCard = ({ user, isEditable }) => {
  return (
    <div className="bg-[#0A0A0A] border border-[#FF2400] rounded-2xl overflow-hidden shadow-2xl transition-transform hover:scale-105">
      {/* البنر القابل للتخصيص */}
      <div className="h-24 bg-gradient-to-r from-red-900 to-black relative">
        <div className="absolute -bottom-10 left-6 border-4 border-[#0A0A0A] rounded-full">
           {/* الأفتار */}
           <img src={user.avatar || 'https://via.placeholder.com/100'} alt="avatar" className="w-20 h-20 rounded-full" />
        </div>
      </div>
      
      <div className="pt-14 px-6 pb-6">
        <h3 className="text-xl font-black text-white">{user.username}</h3>
        <p className="text-[#FF2400] font-bold text-sm mb-4">النقاط: {user.points}</p>
        
        {isEditable && (
          <button className="w-full py-2 bg-[#FF2400] text-black font-black rounded-lg hover:bg-white transition-all">
            تعديل البروفايل
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;