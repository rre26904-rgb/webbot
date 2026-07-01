// دالة دخول الشات العام
function joinGlobalChat() {
    myUsername = document.getElementById('username').value;
    if (!myUsername) return alert('تكفى اكتب اسمك قبل تدخل الشات!');
    
    // إرسال للسيرفر إني دخلت الشات
    socket.emit('joinGlobal', myUsername); 
    showScreen('globalChatScreen');
}

// دالة الرجوع للقائمة الرئيسية
function goBackToHub() {
    socket.emit('leaveGlobal'); // نعلم السيرفر إنه طلع
    showScreen('hubScreen');
}

// دالة إرسال الرسالة في الشات
function sendMessage() {
    const input = document.getElementById('chatInput');
    const msg = input.value.trim();
    
    if (msg !== '') {
        socket.emit('sendGlobalMessage', { username: myUsername, message: msg });
        input.value = ''; // تفريغ الحقل بعد الإرسال
    }
}

// عشان إذا ضغط زر Enter يرسل الرسالة بدون ما يضغط الزر بالماوس
function handleEnter(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// استقبال الرسائل من السيرفر
socket.on('receiveGlobalMessage', (data) => {
    const chatBox = document.getElementById('chatMessages');
    chatBox.innerHTML += `
        <div class="chat-message">
            <span class="sender">${data.username}</span>
            ${data.message}
        </div>
    `;
    // يخلي السكرول ينزل لآخر رسالة تلقائياً
    chatBox.scrollTop = chatBox.scrollHeight;
});

// استقبال رسائل النظام (مثل دخول لاعب جديد أو سؤال لعبة)
socket.on('systemMessage', (msg) => {
    const chatBox = document.getElementById('chatMessages');
    chatBox.innerHTML += `<div class="system-msg">${msg}</div>`;
    chatBox.scrollTop = chatBox.scrollHeight;
});