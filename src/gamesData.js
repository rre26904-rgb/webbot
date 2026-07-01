export const gamesList = [
  { 
    id: 'fakkek', 
    title: 'فكك الكلمة', 
    description: 'افصل حروف الكلمة بمسافات. مثال: (كتاب -> ك ت ا ب)',
    icon: '🧩',
    questions: [
      { text: "برمجيات", correct: "ب ر م ج ي ا ت" },
      { text: "حاسوب", correct: "ح ا س و ب" },
      { text: "سعودية", correct: "س ع و د ي ة" }
    ]
  },
  { 
    id: 'horoof', 
    title: 'تجميع الحروف', 
    description: 'رتب الحروف لتكوين كلمة مفيدة',
    icon: '🔠',
    questions: [
      { text: "ق ي ط ر", correct: "طريق" },
      { text: "ب ت ا ك", correct: "كتاب" },
      { text: "ر ح ب", correct: "بحر" }
    ]
  },
  { 
    id: 'correct', 
    title: 'صحح الخطأ', 
    description: 'اكتب الكلمة بشكلها الإملائي الصحيح',
    icon: '✅',
    questions: [
      { text: "هاذا", correct: "هذا" },
      { text: "لاكن", correct: "لكن" },
      { text: "مأهول", correct: "مأهول" } // كمثال فخ
    ]
  },
  { 
    id: 'capitals', 
    title: 'عواصم ودول', 
    description: 'ما هي عاصمة هذه الدولة؟',
    icon: '🌍',
    questions: [
      { text: "المملكة العربية السعودية", correct: "الرياض" },
      { text: "اليابان", correct: "طوكيو" },
      { text: "فرنسا", correct: "باريس" }
    ]
  }
];