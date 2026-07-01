export const gamesList = [
  { 
    id: 'fakkek', 
    title: 'فكك الكلمة', 
    description: 'افصل حروف الكلمة بمسافات. مثال: (كتاب -> ك ت ا ب)',
    icon: '🧩',
    questions: [
      { text: "برمجيات", correct: "ب ر م ج ي ا ت" },
      { text: "ديناميكا", correct: "د ي ن ا م ي ك ا" },
      { text: "عسير", correct: "ع س ي ر" },
      { text: "خوارزمية", correct: "خ و ا ر ز م ي ة" },
      { text: "جيولوجيا", correct: "ج ي و ل و ج ي ا" },
      { text: "حاسوب", correct: "ح ا س و ب" },
      { text: "فيزياء", correct: "ف ي ز ي ا ء" },
      { text: "مستشفى", correct: "م س ت ش ف ى" },
      { text: "بارق", correct: "ب ا ر ق" },
      { text: "دائرة", correct: "د ا ئ ر ة" }
    ]
  },
  { 
    id: 'horoof', 
    title: 'تجميع الحروف', 
    description: 'رتب الحروف المبعثرة لتكوين كلمة صحيحة',
    icon: '🔠',
    questions: [
      { text: "أ ب ه ا", correct: "أبها" },
      { text: "ق ي ط ر", correct: "طريق" },
      { text: "ب ت ا ك", correct: "كتاب" },
      { text: "ر ح ب", correct: "بحر" },
      { text: "ة ع م ا ج", correct: "جامعة" },
      { text: "س ي ا ر ة", correct: "سيارة" },
      { text: "ل م ق", correct: "قلم" },
      { text: "ش م س", correct: "شمس" },
      { text: "و ر د ة", correct: "وردة" },
      { text: "ه ا ت ف", correct: "هاتف" }
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
      { text: "إستقالة", correct: "استقالة" },
      { text: "شيا", correct: "شيئا" },
      { text: "مأهول", correct: "مأهول" }, // فخ (الكلمة صحيحة أساساً)
      { text: "الضروف", correct: "الظروف" },
      { text: "انشالله", correct: "إن شاء الله" },
      { text: "أنتى", correct: "أنتِ" },
      { text: "طابور", correct: "طابور" },
      { text: "مائة", correct: "مئة" }
    ]
  },
  { 
    id: 'grammar', 
    title: 'مفرد وجمع', 
    description: 'إذا كانت مفرد أعطني جمعها، وإذا كانت جمع أعطني مفردها',
    icon: '📚',
    questions: [
      { text: "جبال", correct: "جبل" },
      { text: "مدرسة", correct: "مدارس" },
      { text: "أودية", correct: "وادي" },
      { text: "قلم", correct: "أقلام" },
      { text: "مفتاح", correct: "مفاتيح" },
      { text: "بحار", correct: "بحر" },
      { text: "كتاب", correct: "كتب" },
      { text: "عالم", correct: "علماء" },
      { text: "شجرة", correct: "أشجار" },
      { text: "نجوم", correct: "نجم" }
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
      { text: "فرنسا", correct: "باريس" },
      { text: "مصر", correct: "القاهرة" },
      { text: "الإمارات", correct: "أبوظبي" },
      { text: "بريطانيا", correct: "لندن" },
      { text: "روسيا", correct: "موسكو" },
      { text: "إسبانيا", correct: "مدريد" },
      { text: "كوريا الجنوبية", correct: "سيول" },
      { text: "البرازيل", correct: "برازيليا" }
    ]
  },
  { 
    id: 'continents', 
    title: 'قارة الدولة', 
    description: 'في أي قارة تقع هذه الدولة؟',
    icon: '🗺️',
    questions: [
      { text: "السعودية", correct: "آسيا" },
      { text: "البرازيل", correct: "أمريكا الجنوبية" },
      { text: "مصر", correct: "أفريقيا" },
      { text: "ألمانيا", correct: "أوروبا" },
      { text: "كندا", correct: "أمريكا الشمالية" },
      { text: "الصين", correct: "آسيا" },
      { text: "أستراليا", correct: "أستراليا" },
      { text: "نيجيريا", correct: "أفريقيا" },
      { text: "المكسيك", correct: "أمريكا الشمالية" },
      { text: "إيطاليا", correct: "أوروبا" }
    ]
  },
  { 
    id: 'math', 
    title: 'أرقام وحساب', 
    description: 'حل المعادلة الرياضية واكتب الناتج رقماً',
    icon: '🔢',
    questions: [
      { text: "15 + 25", correct: "40" },
      { text: "12 × 12", correct: "144" },
      { text: "5 ضرب -3", correct: "-15" },
      { text: "100 ÷ 4", correct: "25" },
      { text: "50 - 18", correct: "32" },
      { text: "7 × 8", correct: "56" },
      { text: "الجذر التربيعي للرقم 81", correct: "9" },
      { text: "10 تكعيب (10³)", correct: "1000" },
      { text: "20% من 100", correct: "20" },
      { text: "45 + 55", correct: "100" }
    ]
  },
  { 
    id: 'sorting', 
    title: 'ترتيب الجمل', 
    description: 'أعد ترتيب الكلمات لتكوين جملة صحيحة مفيدة',
    icon: '🔄',
    questions: [
      { text: "أحمد - المدرسة - إلى - ذهب", correct: "ذهب أحمد إلى المدرسة" },
      { text: "مفيدة - القراءة - للعقل - رياضة", correct: "القراءة رياضة مفيدة للعقل" },
      { text: "السماء - الصباح - في - صافية", correct: "السماء صافية في الصباح" },
      { text: "الشمس - المشرق - من - تشرق", correct: "تشرق الشمس من المشرق" },
      { text: "العمل - سر - هو - النجاح", correct: "العمل هو سر النجاح" },
      { text: "الوطن - الدفاع - واجب - عن", correct: "الدفاع عن الوطن واجب" },
      { text: "البرمجة - العصر - لغة - هي", correct: "البرمجة هي لغة العصر" },
      { text: "الرياضة - تقوي - الجسم", correct: "الرياضة تقوي الجسم" },
      { text: "الوقت - من - ذهب", correct: "الوقت من ذهب" },
      { text: "العلم - يبني - بيوتا - عماد - لا - لها", correct: "العلم يبني بيوتا لا عماد لها" }
    ]
  }
];